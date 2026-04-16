// mixins/twitter-api.mo — public API for Twitter/X OAuth and tweet posting
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Blob "mo:core/Blob";
import TwitterLib "../lib/twitter";
import Types "../types/twitter";

mixin (
  tokenMap : TwitterLib.TokenMap,
  getClientId : () -> ?Text,
  transformTokenResponse : shared query ({ response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob },
) {

  // ── Internal helpers ──────────────────────────────────────────────────────

  type http_header = { name : Text; value : Text };
  type http_request_result = { status : Nat; headers : [http_header]; body : Blob };
  type http_request_args = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [http_header];
    body : ?Blob;
    transform : ?{
      function : shared query ({ response : http_request_result; context : Blob }) -> async http_request_result;
      context : Blob;
    };
    is_replicated : ?Bool;
  };

  let ic = actor "aaaaa-aa" : actor {
    http_request : (http_request_args) -> async http_request_result;
  };

  /// Escape a text value for safe embedding in a JSON string literal.
  func jsonEscapeText(s : Text) : Text {
    var result = s;
    result := result.replace(#text "\\", "\\\\");
    result := result.replace(#text "\"", "\\\"");
    result := result.replace(#text "\n", "\\n");
    result := result.replace(#text "\r", "\\r");
    result := result.replace(#text "\t", "\\t");
    result;
  };

  /// Exchange a refresh token for new access + refresh tokens.
  /// Attaches 200_000_000 cycles for the token endpoint outcall.
  func refreshAccessToken(caller : Principal, refreshToken : Text) : async* Bool {
    let clientId = switch (getClientId()) {
      case (?id) id;
      case null { return false };
    };

    Debug.print("[Tweet Debug] refreshAccessToken: starting token refresh for principal " # caller.toText());

    let body = "grant_type=refresh_token" #
      "&refresh_token=" # urlEncode(refreshToken) #
      "&client_id=" # urlEncode(clientId);

    Debug.print("[Tweet Debug] refreshAccessToken: POST https://api.x.com/2/oauth2/token body=" # body);

    let request : http_request_args = {
      url = "https://api.x.com/2/oauth2/token";
      max_response_bytes = ?10_000;
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
      ];
      body = ?(body.encodeUtf8());
      transform = ?{ function = transformTokenResponse; context = Blob.fromArray([]) };
      is_replicated = ?false;
    };

    try {
      let response = await (with cycles = 200_000_000) ic.http_request(request);
      let responseText = switch (response.body.decodeUtf8()) {
        case (?t) t;
        case null "";
      };
      Debug.print("[Tweet Debug] refreshAccessToken: status=" # response.status.toText() # " body=" # responseText);

      if (response.status >= 200 and response.status < 300) {
        // Parse JSON fields manually for minimal footprint
        let newAccessToken = extractJsonField(responseText, "access_token");
        let newRefreshToken = extractJsonField(responseText, "refresh_token");
        let expiresInText = extractJsonField(responseText, "expires_in");

        switch (newAccessToken) {
          case (?at) {
            let rt = switch (newRefreshToken) {
              case (?r) r;
              case null refreshToken; // keep old refresh token if not rotated
            };
            let expiresIn : Int = switch (expiresInText) {
              case (?s) switch (Int.fromText(s)) { case (?n) n; case null 7200 };
              case null 7200;
            };
            // expiresAt in nanoseconds
            let expiresAt = Time.now() + expiresIn * 1_000_000_000;
            TwitterLib.storeTokens(tokenMap, caller, at, rt, expiresAt);
            Debug.print("[Tweet Debug] refreshAccessToken: success — new tokens stored");
            true;
          };
          case null {
            Debug.print("[Tweet Debug] refreshAccessToken: failed to parse access_token from response");
            false;
          };
        };
      } else {
        Debug.print("[Tweet Debug] refreshAccessToken: HTTP error " # response.status.toText());
        false;
      };
    } catch (e) {
      Debug.print("[Tweet Debug] refreshAccessToken: exception " # e.message());
      false;
    };
  };

  /// Percent-encode a string for use in form-urlencoded bodies.
  func urlEncode(s : Text) : Text {
    // Encode only the characters that are unsafe in form data.
    // For OAuth tokens, they typically only contain alphanumerics and a few safe chars.
    // We replace space, +, = with their % equivalents for correctness.
    var result = s;
    result := result.replace(#char '%', "%25");
    result := result.replace(#char ' ', "%20");
    result := result.replace(#char '+', "%2B");
    result := result.replace(#char '=', "%3D");
    result := result.replace(#char '&', "%26");
    result := result.replace(#char '#', "%23");
    result;
  };

  /// Minimal JSON field extractor: finds `"key":"value"` or `"key": value` in text.
  /// Splits on the needle to find the field anywhere in the JSON string.
  func extractJsonField(json : Text, fieldName : Text) : ?Text {
    let needle = "\"" # fieldName # "\":";
    let parts = json.split(#text needle);
    var found : ?Text = null;
    var first = true;
    for (part in parts) {
      if (not first and found == null) {
        // Skip optional leading whitespace
        let trimmed = part.trimStart(#char ' ');
        found := extractValueFromJsonRemainder(trimmed);
      };
      first := false;
    };
    found;
  };

  func extractValueFromJsonRemainder(rest : Text) : ?Text {
    if (rest.size() == 0) return null;
    // Check if value is quoted string
    switch (rest.stripStart(#text "\"")) {
      case (?inner) {
        // Extract until closing quote — take the first segment before '"'
        let parts = inner.split(#text "\"");
        var result : ?Text = null;
        var first = true;
        for (part in parts) {
          if (first) { result := ?part };
          first := false;
        };
        result;
      };
      case null {
        // Unquoted number — extract chars until delimiter
        let stripped = rest.trimStart(#char ' ');
        let parts = stripped.split(#char ',');
        var result : ?Text = null;
        var first = true;
        for (part in parts) {
          if (first) {
            let v = part.trimEnd(#char '}').trimEnd(#char ' ');
            if (v != "") { result := ?v };
          };
          first := false;
        };
        result;
      };
    };
  };

  // ── Public API ────────────────────────────────────────────────────────────

  /// Exchange OAuth authorization code for access + refresh tokens.
  /// Attaches 200_000_000 cycles to the outcall.
  public shared ({ caller }) func exchangeToken(
    code : Text,
    codeVerifier : Text,
    redirectUri : Text,
  ) : async Types.TokenExchangeResult {
    let clientId = switch (getClientId()) {
      case (?id) id;
      case null { return #err("X Client ID not configured. Please set it in Settings.") };
    };

    Debug.print("[Tweet Debug] exchangeToken: starting OAuth token exchange for principal " # caller.toText());
    Debug.print("[Tweet Debug] exchangeToken: redirectUri=" # redirectUri);

    let body = "grant_type=authorization_code" #
      "&code=" # urlEncode(code) #
      "&redirect_uri=" # urlEncode(redirectUri) #
      "&code_verifier=" # urlEncode(codeVerifier) #
      "&client_id=" # urlEncode(clientId);

    let request : http_request_args = {
      url = "https://api.x.com/2/oauth2/token";
      max_response_bytes = ?10_000;
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/x-www-form-urlencoded" },
      ];
      body = ?(body.encodeUtf8());
      transform = ?{ function = transformTokenResponse; context = Blob.fromArray([]) };
      is_replicated = ?false;
    };

    try {
      let response = await (with cycles = 200_000_000) ic.http_request(request);
      let responseText = switch (response.body.decodeUtf8()) {
        case (?t) t;
        case null "";
      };
      Debug.print("[Tweet Debug] exchangeToken: status=" # response.status.toText() # " body=" # responseText);

      if (response.status >= 200 and response.status < 300) {
        let accessToken = extractJsonField(responseText, "access_token");
        let refreshToken = extractJsonField(responseText, "refresh_token");
        let expiresInText = extractJsonField(responseText, "expires_in");

        switch (accessToken) {
          case (?at) {
            let rt = switch (refreshToken) { case (?r) r; case null "" };
            let expiresIn : Int = switch (expiresInText) {
              case (?s) switch (Int.fromText(s)) { case (?n) n; case null 7200 };
              case null 7200;
            };
            let expiresAt = Time.now() + expiresIn * 1_000_000_000;
            TwitterLib.storeTokens(tokenMap, caller, at, rt, expiresAt);
            Debug.print("[Tweet Debug] exchangeToken: success — tokens stored for principal " # caller.toText());
            #ok("Connected to X successfully.");
          };
          case null {
            #err("Token exchange failed: could not parse access_token. Response: " # responseText);
          };
        };
      } else {
        #err("Token exchange HTTP error " # response.status.toText() # ": " # responseText);
      };
    } catch (e) {
      let msg = e.message();
      Debug.print("[Tweet Debug] exchangeToken: exception " # msg);
      #err("Token exchange exception: " # msg);
    };
  };

  /// Store OAuth tokens for the authenticated principal (frontend-side storage path).
  public shared ({ caller }) func storeTokens(
    accessToken : Text,
    refreshToken : Text,
    expiresAt : Int,
  ) : async () {
    TwitterLib.storeTokens(tokenMap, caller, accessToken, refreshToken, expiresAt);
  };

  /// Get the Twitter/X connection status for the authenticated principal.
  public shared query ({ caller }) func getTokenStatus() : async Types.TokenStatus {
    TwitterLib.getTokenStatus(tokenMap, caller);
  };

  /// Disconnect X — clears the stored OAuth token for this principal.
  public shared ({ caller }) func disconnectX() : async () {
    TwitterLib.disconnectX(tokenMap, caller);
  };

  /// Post a tweet when a lesson is completed.
  /// Auto-refreshes the access token if expired.
  /// Attaches 25_000_000_000 cycles to the tweet outcall.
  public shared ({ caller }) func postTweet(
    lessonId : Text,
    lessonTitle : Text,
  ) : async Types.TweetResult {
    // Get tokens
    var tokens = switch (TwitterLib.getTokens(tokenMap, caller)) {
      case (?t) t;
      case null {
        return #err("Not connected to X. Please connect your Twitter/X account in Settings.");
      };
    };

    // Auto-refresh if expired
    if (TwitterLib.isExpired(tokens, Time.now())) {
      Debug.print("[Tweet Debug] postTweet: token expired, attempting refresh for principal " # caller.toText());
      if (tokens.refreshToken == "") {
        return #err("Access token expired and no refresh token available. Please reconnect your X account.");
      };
      let refreshed = await* refreshAccessToken(caller, tokens.refreshToken);
      if (not refreshed) {
        return #err("Failed to refresh X access token. Please reconnect your X account.");
      };
      // Re-fetch updated tokens
      tokens := switch (TwitterLib.getTokens(tokenMap, caller)) {
        case (?t) t;
        case null {
          return #err("Token refresh succeeded but tokens missing. Please reconnect your X account.");
        };
      };
    };

    // Build tweet text
    let lessonUrl = "https://catfinity.app/lesson/" # lessonId;
    let tweetText = "I just completed \"" # lessonTitle # "\" on CatFinity — a tutorial on (∞,1)-categories! 🎓 " # lessonUrl # " #Mathematics #CategoryTheory #CatFinity";

    Debug.print("[Tweet Debug] postTweet: lessonId=" # lessonId # " lessonTitle=" # lessonTitle);
    Debug.print("[Tweet Debug] postTweet: tweetText=" # tweetText);
    Debug.print("[Tweet Debug] postTweet: calling tweet API for principal " # caller.toText());

    // Build minimal JSON body — only {"text": "..."} with proper escaping
    // This bypasses x-client TweetCreateRequest serialization which adds all null optional
    // fields as Motoko-formatted numeric keys (e.g. 5_144_721), causing X API rejection.
    let escapedText = jsonEscapeText(tweetText);
    let tweetBodyText = "{\"text\": \"" # escapedText # "\"}";
    let tweetBodyBlob = tweetBodyText.encodeUtf8();

    Debug.print("[Tweet Debug] postTweet: request body=" # tweetBodyText);

    // tweetConfig shape preserved for reference; is_replicated = ?false applied directly below
    let tweetRequest : http_request_args = {
      url = "https://api.x.com/2/tweets";
      max_response_bytes = ?500_000;
      method = #post;
      headers = [
        { name = "Content-Type"; value = "application/json" },
        { name = "Authorization"; value = "Bearer " # tokens.accessToken },
      ];
      body = ?tweetBodyBlob;
      transform = null;
      is_replicated = ?false;
    };

    try {
      Debug.print("[Tweet Debug] postTweet: calling POST /2/tweets with 25B cycles");
      let response = await (with cycles = 25_000_000_000) ic.http_request(tweetRequest);
      let responseText = switch (response.body.decodeUtf8()) {
        case (?t) t;
        case null "";
      };
      Debug.print("[Tweet Debug] postTweet: status=" # response.status.toText() # " body=" # responseText);

      if (response.status >= 200 and response.status < 300) {
        let tweetId = switch (extractJsonField(responseText, "id")) {
          case (?id) id;
          case null "unknown";
        };
        Debug.print("[Tweet Debug] postTweet: success! tweetId=" # tweetId);
        #ok("Tweet posted successfully! Tweet ID: " # tweetId);
      } else {
        let msg = "HTTP " # response.status.toText() # ": " # responseText;
        Debug.print("[Tweet Debug] postTweet: error " # msg);

        // Check for 401/403 — attempt one token refresh and retry
        if (response.status == 401 or response.status == 403) {
          Debug.print("[Tweet Debug] postTweet: got 401/403, attempting token refresh");
          if (tokens.refreshToken != "") {
            let refreshed = await* refreshAccessToken(caller, tokens.refreshToken);
            if (refreshed) {
              let freshTokens = switch (TwitterLib.getTokens(tokenMap, caller)) {
                case (?t) t;
                case null { return #err("Token refresh succeeded but tokens missing.") };
              };
              let retryRequest : http_request_args = {
                tweetRequest with
                headers = [
                  { name = "Content-Type"; value = "application/json" },
                  { name = "Authorization"; value = "Bearer " # freshTokens.accessToken },
                ];
              };
              try {
                Debug.print("[Tweet Debug] postTweet: retrying after refresh");
                let retryResponse = await (with cycles = 25_000_000_000) ic.http_request(retryRequest);
                let retryText = switch (retryResponse.body.decodeUtf8()) {
                  case (?t) t;
                  case null "";
                };
                Debug.print("[Tweet Debug] postTweet: retry status=" # retryResponse.status.toText() # " body=" # retryText);
                if (retryResponse.status >= 200 and retryResponse.status < 300) {
                  let retryId = switch (extractJsonField(retryText, "id")) {
                    case (?id) id;
                    case null "unknown";
                  };
                  Debug.print("[Tweet Debug] postTweet: retry success! tweetId=" # retryId);
                  return #ok("Tweet posted successfully! Tweet ID: " # retryId);
                } else {
                  return #err("Tweet failed after token refresh: HTTP " # retryResponse.status.toText() # ": " # retryText);
                };
              } catch (e2) {
                let msg2 = e2.message();
                Debug.print("[Tweet Debug] postTweet: retry error " # msg2);
                return #err("Tweet failed after token refresh: " # msg2);
              };
            };
          };
          return #err("Tweet failed (auth error). Please reconnect your X account. Error: " # msg);
        };

        #err("Tweet failed: " # msg);
      };
    } catch (e) {
      let msg = e.message();
      Debug.print("[Tweet Debug] postTweet: error " # msg);
      #err("Tweet failed: " # msg);
    };
  };
};
