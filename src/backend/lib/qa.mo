// lib/qa.mo — domain logic for Q&A feature (per-lesson and global panels)
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Types "../types/qa";

// openai-client imports
import ChatApi "mo:openai-client/Apis/ChatApi";
import OpenAIConfig "mo:openai-client/Config";
import CreateChatCompletionRequest "mo:openai-client/Models/CreateChatCompletionRequest";

module {
  public type QA = Types.QA;
  public type QALessonMap = Types.QALessonMap;
  public type QAGlobalMap = Types.QAGlobalMap;

  // ── IC management canister types (used in transformFn signature) ──────────

  type HttpHeader = { name : Text; value : Text };

  // ── OpenAI call ──────────────────────────────────────────────────────────

  /// Call OpenAI ChatCompletion via mo:openai-client.
  /// Returns the assistant message text on success, or an error string on failure (never traps).
  /// transformFn is passed from the actor so the IC can strip non-deterministic headers.
  func callOpenAI(
    systemPrompt : Text,
    userMessage : Text,
    userApiKey : Text,
    transformFn : shared query ({ response : { status : Nat; headers : [HttpHeader]; body : Blob }; context : Blob }) -> async { status : Nat; headers : [HttpHeader]; body : Blob },
  ) : async Text {
    let config : OpenAIConfig.Config = {
      OpenAIConfig.defaultConfig with
      auth = ?#bearer(userApiKey);
      max_response_bytes = ?50_000;
      transform = ?{
        function = transformFn;
        context = "" : Blob;
      };
      is_replicated = ?false;
      cycles = 50_000_000_000;
    };

    let request = { CreateChatCompletionRequest.JSON.init {
      model = "gpt-4o-mini";
      messages = [
        #system_({ content = #string(systemPrompt); role = #system_; name = null }),
        #user({ content = #string(userMessage); role = #user; name = null }),
      ];
    } with max_tokens = ?512 };

    let doRequest = func() : async Text {
      try {
        let result = await* ChatApi.createChatCompletion(config, request);
        if (result.choices.size() == 0) {
          "Error: no choices in response";
        } else {
          switch (result.choices[0].message.content) {
            case (?text) text;
            case null "Error: empty content in response";
          };
        };
      } catch (e) {
        "OPENAI_RAW: " # e.message();
      };
    };

    // Retry once on timeout
    let firstResult = await doRequest();
    if (firstResult.startsWith(#text "OPENAI_RAW: ") and firstResult.contains(#text "timed out")) {
      await doRequest();
    } else {
      firstResult;
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
