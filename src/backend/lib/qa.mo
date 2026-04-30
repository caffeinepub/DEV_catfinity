// lib/qa.mo — domain logic for Q&A feature (per-lesson and global panels)
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
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

  type IcResponse = { status : Nat; headers : [{ name : Text; value : Text }]; body : Blob };
  type TransformFn = shared query ({ response : IcResponse; context : Blob }) -> async IcResponse;

  // ── get-or-insert helper ─────────────────────────────────────────────────

  func getOrInsert<K, V>(m : Map.Map<K, V>, compare : (K, K) -> {#less; #equal; #greater}, k : K, mk : () -> V) : V =
    switch (m.get(k)) {
      case (?v) v;
      case null { let v = mk(); m.add(k, v); v };
    };

  // ── OpenAI call ──────────────────────────────────────────────────────────

  /// Call OpenAI ChatCompletion via mo:openai-client.
  /// Returns #ok(text) on success, or #err(message) on failure (never traps).
  /// transformFn is passed from the actor so the IC can strip non-deterministic headers.
  func callOpenAI(
    systemPrompt : Text,
    userMessage : Text,
    userApiKey : Text,
    transformFn : TransformFn,
  ) : async { #ok : Text; #err : Text } {
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

    let doRequest = func() : async { #ok : Text; #err : Text } {
      try {
        let result = await* ChatApi.createChatCompletion(config, request);
        if (result.choices.size() == 0) {
          #err("no choices in response");
        } else {
          switch (result.choices[0].message.content) {
            case (?text) #ok(text);
            case null #err("empty content in response");
          };
        };
      } catch (e) {
        #err(e.message());
      };
    };

    // Retry once on timeout
    let firstResult = await doRequest();
    switch (firstResult) {
      case (#err(msg)) {
        if (msg.contains(#text "timed out")) {
          await doRequest();
        } else {
          firstResult;
        };
      };
      case (#ok(_)) firstResult;
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
    transformFn : TransformFn,
  ) : async Text {
    let systemPrompt = "You are a helpful CatFinity tutor. The user is studying the lesson \""
      # lessonName # "\".";
    let result = await callOpenAI(systemPrompt, question, userApiKey, transformFn);

    // On success: append to history and return answer. On error: return error message without polluting history.
    let answer = switch (result) {
      case (#ok(text)) {
        // Append to per-lesson history (caller → lessonId → List<QA>)
        let callerMap = getOrInsert<Principal, Map.Map<Text, List.List<QA>>>(
          qaHistoryPerLesson, Principal.compare, caller, func() = Map.empty<Text, List.List<QA>>(),
        );
        let list = getOrInsert<Text, List.List<QA>>(
          callerMap, Text.compare, lessonId, func() = List.empty<QA>(),
        );
        list.add({ question; response = text; at = Time.now() });
        text;
      };
      case (#err(msg)) msg;
    };
    answer;
  };

  /// Ask a question on the global landing-page panel.
  /// Calls OpenAI ChatCompletion with a landing-page system prompt,
  /// appends the resulting QA pair to the global history, and returns the response text.
  public func askGlobal(
    qaHistoryGlobal : QAGlobalMap,
    caller : Principal,
    question : Text,
    userApiKey : Text,
    transformFn : TransformFn,
  ) : async Text {
    let systemPrompt = "You are a helpful CatFinity tutor responding on the landing page.";
    let result = await callOpenAI(systemPrompt, question, userApiKey, transformFn);

    // On success: append to history and return answer. On error: return error message without polluting history.
    let answer = switch (result) {
      case (#ok(text)) {
        // Append to global history (caller → List<QA>)
        let list = getOrInsert<Principal, List.List<QA>>(
          qaHistoryGlobal, Principal.compare, caller, func() = List.empty<QA>(),
        );
        list.add({ question; response = text; at = Time.now() });
        text;
      };
      case (#err(msg)) msg;
    };
    answer;
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
