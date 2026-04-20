// mixins/twitter-api.mo — public API for Twitter/X OAuth and tweet posting
// Tweet posting uses the x-client Mops package (TweetsApi.createPosts).
// OAuth token exchange uses raw HTTP (x-client has no OAuth2 token endpoint API).
import Time "mo:core/Time";
import Debug "mo:core/Debug";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Blob "mo:core/Blob";
import Error "mo:core/Error";
import TwitterLib "../lib/twitter";
import Types "../types/twitter";
import XConfig "mo:x-client/Config";
import TweetsApi "mo:x-client/Apis/TweetsApi";
import { type TweetCreateRequest } "mo:x-client/Models/TweetCreateRequest";

mixin (
  tokenMap : TwitterLib.TokenMap,
  getClientId : () -> ?Text,
  transformTokenResponse : shared query ({ response : { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob },
) {

  // ── Internal helpers ──────────────────────────────────────────────────────

  // Raw HTTP types — used only for OAuth token exchange (no x-client OAuth API exists).
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

  /// Percent-encode a string for use in form-urlencoded bodies.
  func urlEncode(s : Text) : Text {
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
  func extractJsonField(json : Text, fieldName : Text) : ?Text {
    let needle = "\"" # fieldName # "\":";
    let parts = json.split(#text needle);
    var found : ?Text = null;
    var first = true;
    for (part in parts) {
      if (not first and found == null) {
        let trimmed = part.trimStart(#char ' ');
        found := extractValueFromJsonRemainder(trimmed);
      };
      first := false;
    };
    found;
  };

  func extractValueFromJsonRemainder(rest : Text) : ?Text {
    if (rest.size() == 0) return null;
    switch (rest.stripStart(#text "\"")) {
      case (?inner) {
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

  /// Exchange a refresh token for new access + refresh tokens via raw HTTP.
  /// (x-client has no OAuth2 token endpoint API — raw HTTP is the only option here.)
  /// Attaches 200_000_000 cycles for the token endpoint outcall.
  func refreshAccessToken(caller : Principal, refreshToken : Text) : async* Bool {
    let clientId = switch (getClientId()) {
      case (?id) id;
      case null { return false };
    };

    let body = "grant_type=refresh_token" #
      "&refresh_token=" # urlEncode(refreshToken) #
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

      if (response.status >= 200 and response.status < 300) {
        let newAccessToken = extractJsonField(responseText, "access_token");
        let newRefreshToken = extractJsonField(responseText, "refresh_token");
        let expiresInText = extractJsonField(responseText, "expires_in");

        switch (newAccessToken) {
          case (?at) {
            let rt = switch (newRefreshToken) {
              case (?r) r;
              case null refreshToken;
            };
            let expiresIn : Int = switch (expiresInText) {
              case (?s) switch (Int.fromText(s)) { case (?n) n; case null 7200 };
              case null 7200;
            };
            let expiresAt = Time.now() + expiresIn * 1_000_000_000;
            TwitterLib.storeTokens(tokenMap, caller, at, rt, expiresAt);
            true;
          };
          case null false;
        };
      } else {
        false;
      };
    } catch (_e) {
      false;
    };
  };

  // ── Public API ────────────────────────────────────────────────────────────

  /// Exchange OAuth authorization code for access + refresh tokens via raw HTTP.
  /// (x-client has no OAuth2 token endpoint API — raw HTTP is the only option here.)
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
      #err("Token exchange exception: " # e.message());
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
  /// Uses x-client TweetsApi.createPosts — the official Mops package for X API v2.
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
      if (tokens.refreshToken == "") {
        return #err("Access token expired and no refresh token available. Please reconnect your X account.");
      };
      let refreshed = await* refreshAccessToken(caller, tokens.refreshToken);
      if (not refreshed) {
        return #err("Failed to refresh X access token. Please reconnect your X account.");
      };
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

    // Build x-client config with bearer token auth and is_replicated = ?false
    let tweetConfig : XConfig.Config = {
      XConfig.defaultConfig with
      auth = ?#bearer(tokens.accessToken);
      is_replicated = ?false;
      cycles = 25_000_000_000;
    };

    // Build TweetCreateRequest — only text_ is needed; all other fields are null
    let tweetReq : TweetCreateRequest = {
      card_uri = null;
      community_id = null;
      direct_message_deep_link = null;
      edit_options = null;
      for_super_followers_only = null;
      geo = null;
      made_with_ai = null;
      media = null;
      nullcast = null;
      paid_partnership = null;
      poll = null;
      quote_tweet_id = null;
      reply = null;
      reply_settings = null;
      share_with_followers = null;
      text_ = ?tweetText;
    };

    try {
      let response = await* TweetsApi.createPosts(tweetConfig, tweetReq);
      let tweetId = switch (response.data) {
        case (?d) d.id;
        case null "unknown";
      };
      #ok("Tweet posted successfully! Tweet ID: " # tweetId);
    } catch (e) {
      let msg = e.message();
      // On 401/403 attempt one token refresh and retry
      if (msg.contains(#text "HTTP 401") or msg.contains(#text "HTTP 403")) {
        if (tokens.refreshToken != "") {
          let refreshed = await* refreshAccessToken(caller, tokens.refreshToken);
          if (refreshed) {
            let freshTokens = switch (TwitterLib.getTokens(tokenMap, caller)) {
              case (?t) t;
              case null { return #err("Token refresh succeeded but tokens missing.") };
            };
            let retryConfig : XConfig.Config = {
              tweetConfig with
              auth = ?#bearer(freshTokens.accessToken);
            };
            try {
              let retryResponse = await* TweetsApi.createPosts(retryConfig, tweetReq);
              let retryId = switch (retryResponse.data) {
                case (?d) d.id;
                case null "unknown";
              };
              return #ok("Tweet posted successfully! Tweet ID: " # retryId);
            } catch (e2) {
              return #err("Tweet failed after token refresh: " # e2.message());
            };
          };
        };
        return #err("Tweet failed (auth error). Please reconnect your X account. Error: " # msg);
      };
      #err("Tweet failed: " # msg);
    };
  };
};
