// lib/qa.mo — domain logic for Q&A feature (per-lesson and global panels)
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Error "mo:core/Error";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Char "mo:core/Char";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Types "../types/qa";

module {
  public type QA = Types.QA;
  public type QALessonMap = Types.QALessonMap;
  public type QAGlobalMap = Types.QAGlobalMap;

  // ── JSON helpers ─────────────────────────────────────────────────────────

  /// Escape a Text value for embedding in a JSON string literal.
  func escapeJson(s : Text) : Text {
    var result = "";
    for (c in s.chars()) {
      if (c == '\\') {
        result #= "\\\\";
      } else if (c.toText() == "\"") {
        result #= "\\\"";
      } else if (c == '\n') {
        result #= "\\n";
      } else if (c == '\r') {
        result #= "\\r";
      } else {
        result #= c.toText();
      };
    };
    result;
  };

  /// Minimal extraction of choices[0].message.content from OpenAI chat response JSON.
  /// Finds the first "content": after "message": and extracts the string value.
  func extractOpenAIContent(json : Text) : Text {
    // Find "message": then "content":
    let msgNeedle = "\"message\":";
    let msgParts = json.split(#text msgNeedle);
    var afterMessage : ?Text = null;
    var first = true;
    for (part in msgParts) {
      if (not first and afterMessage == null) {
        afterMessage := ?part;
      };
      first := false;
    };
    let msgRest = switch (afterMessage) {
      case (?r) r;
      case null { return "Error: could not find message in response" };
    };

    let contentNeedle = "\"content\":";
    let contentParts = msgRest.split(#text contentNeedle);
    var afterContent : ?Text = null;
    first := true;
    for (part in contentParts) {
      if (not first and afterContent == null) {
        afterContent := ?part;
      };
      first := false;
    };
    let contentRest = switch (afterContent) {
      case (?r) r;
      case null { return "Error: could not find content in response" };
    };

    // contentRest starts with optional whitespace then either `"` (string) or `null`
    let trimmed = contentRest.trimStart(#char ' ');
    switch (trimmed.stripStart(#text "\"")) {
      case (?inner) {
        // Read characters until unescaped closing quote
        var result = "";
        var escaped = false;
        var done = false;
        for (c in inner.chars()) {
          if (done) {
            // skip remaining
          } else if (escaped) {
            if (c.toText() == "\"") {
              result #= "\"";
            } else if (c == '\\') {
              result #= "\\";
            } else if (c == 'n') {
              result #= "\n";
            } else if (c == 'r') {
              result #= "\r";
            } else {
              result #= c.toText();
            };
            escaped := false;
          } else if (c == '\\') {
            escaped := true;
          } else if (c.toText() == "\"") {
            done := true;
          } else {
            result #= c.toText();
          };
        };
        result;
      };
      case null "Error: content is not a string";
    };
  };

  // ── IC management canister types ─────────────────────────────────────────

  type HttpHeader = { name : Text; value : Text };
  type HttpRequestArgs = {
    url : Text;
    max_response_bytes : ?Nat64;
    method : { #get; #head; #post };
    headers : [HttpHeader];
    body : ?Blob;
    transform : ?{
      function : shared query ({ response : { status : Nat; headers : [HttpHeader]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [HttpHeader]; body : Blob };
      context : Blob;
    };
    is_replicated : ?Bool;
  };
  type HttpResponse = { status : Nat; headers : [HttpHeader]; body : Blob };

  let IC = actor "aaaaa-aa" : actor {
    http_request : (HttpRequestArgs) -> async HttpResponse;
  };

  // ── OpenAI call ──────────────────────────────────────────────────────────

  /// Call OpenAI ChatCompletion directly via IC http_request (bypasses openai-client package bug).
  /// Returns the assistant message text on success, or an error string on failure (never traps).
  /// transformFn is passed from the actor so the IC can strip non-deterministic headers.
  func callOpenAI(
    systemPrompt : Text,
    userMessage : Text,
    userApiKey : Text,
    transformFn : shared query ({ response : { status : Nat; headers : [HttpHeader]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [HttpHeader]; body : Blob },
  ) : async Text {
    let body = "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"system\",\"content\":\""
      # escapeJson(systemPrompt)
      # "\"},{\"role\":\"user\",\"content\":\""
      # escapeJson(userMessage)
      # "\"}],\"max_tokens\":512}";
    let bodyBytes = body.encodeUtf8();

    let doRequest = func() : async Text {
      let response = await (with cycles = 50_000_000_000) IC.http_request({
        url = "https://api.openai.com/v1/chat/completions";
        max_response_bytes = ?50_000;
        method = #post;
        headers = [
          { name = "Content-Type"; value = "application/json" },
          { name = "Authorization"; value = "Bearer " # userApiKey },
        ];
        body = ?bodyBytes;
        transform = ?{
          function = transformFn;
          context = "" : Blob;
        };
        is_replicated = ?false;
      });
      if (response.status == 200) {
        let responseText = switch (response.body.decodeUtf8()) {
          case (?t) t;
          case null "Error: could not decode response";
        };
        extractOpenAIContent(responseText);
      } else {
        let statusStr = response.status.toText();
        let bodyPreview = switch (response.body.decodeUtf8()) {
          case (?t) {
            if (t.size() > 200) {
              let iter = t.chars();
              let truncated = iter.take(200);
              Text.fromIter(truncated);
            } else t;
          };
          case null "no body";
        };
        "OpenAI returned " # statusStr # ": " # bodyPreview;
      };
    };

    try {
      await doRequest();
    } catch (e) {
      if (e.message().contains(#text "timed out")) {
        try {
          await doRequest();
        } catch (e2) {
          "Request failed: " # e2.message();
        };
      } else {
        "Request failed: " # e.message();
      };
    };
  };

  // ── Public functions ─────────────────────────────────────────────────────

  /// Ask a question scoped to a specific lesson.
  /// Calls OpenAI ChatCompletion with a lesson-specific system prompt,
  /// appends the resulting QA pair to the per-lesson history, and returns the response text.
  public func askLesson(
    qaHistoryPerLesson : QALessonMap,
    caller : Principal,
    lessonId : Text,
    lessonName : Text,
    question : Text,
    userApiKey : Text,
    transformFn : shared query ({ response : { status : Nat; headers : [HttpHeader]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [HttpHeader]; body : Blob },
  ) : async Text {
    let systemPrompt = "You are a helpful CatFinity tutor. The user is studying the lesson \""
      # lessonName # "\".";
    let response = await callOpenAI(systemPrompt, question, userApiKey, transformFn);

    // Append to per-lesson history (caller → lessonId → List<QA>)
    let callerMap = switch (qaHistoryPerLesson.get(caller)) {
      case (?m) m;
      case null {
        let m = Map.empty<Text, List.List<QA>>();
        qaHistoryPerLesson.add(caller, m);
        m;
      };
    };
    let list = switch (callerMap.get(lessonId)) {
      case (?l) l;
      case null {
        let l = List.empty<QA>();
        callerMap.add(lessonId, l);
        l;
      };
    };
    list.add({ question; response; at = Time.now() });
    response;
  };

  /// Ask a question on the global landing-page panel.
  /// Calls OpenAI ChatCompletion with a landing-page system prompt,
  /// appends the resulting QA pair to the global history, and returns the response text.
  public func askGlobal(
    qaHistoryGlobal : QAGlobalMap,
    caller : Principal,
    question : Text,
    userApiKey : Text,
    transformFn : shared query ({ response : { status : Nat; headers : [HttpHeader]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [HttpHeader]; body : Blob },
  ) : async Text {
    let systemPrompt = "You are a helpful CatFinity tutor responding on the landing page.";
    let response = await callOpenAI(systemPrompt, question, userApiKey, transformFn);

    // Append to global history (caller → List<QA>)
    let list = switch (qaHistoryGlobal.get(caller)) {
      case (?l) l;
      case null {
        let l = List.empty<QA>();
        qaHistoryGlobal.add(caller, l);
        l;
      };
    };
    list.add({ question; response; at = Time.now() });
    response;
  };

  /// Returns the Q&A history for a specific caller+lesson pair, oldest first.
  public func getLessonHistory(
    qaHistoryPerLesson : QALessonMap,
    caller : Principal,
    lessonId : Text,
  ) : [QA] {
    switch (qaHistoryPerLesson.get(caller)) {
      case (?callerMap) {
        switch (callerMap.get(lessonId)) {
          case (?list) list.toArray();
          case null [];
        };
      };
      case null [];
    };
  };

  /// Returns the global Q&A history for a specific caller, oldest first.
  public func getGlobalHistory(
    qaHistoryGlobal : QAGlobalMap,
    caller : Principal,
  ) : [QA] {
    switch (qaHistoryGlobal.get(caller)) {
      case (?list) list.toArray();
      case null [];
    };
  };

  /// Persist an OpenAI API key for the caller. Overwrites any existing key.
  public func setOpenAIKey(
    openaiKeyMap : Types.OpenAIKeyMap,
    caller : Principal,
    key : Text,
  ) : () {
    openaiKeyMap.add(caller, key);
  };

  /// Retrieve the OpenAI API key for the caller. Returns null if not set.
  public func getOpenAIKey(
    openaiKeyMap : Types.OpenAIKeyMap,
    caller : Principal,
  ) : ?Text {
    openaiKeyMap.get(caller);
  };
};
