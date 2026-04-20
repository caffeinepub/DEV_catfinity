// lib/qa.mo — domain logic for Q&A feature (per-lesson and global panels)
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Error "mo:core/Error";
import Text "mo:core/Text";
import Types "../types/qa";
import ChatApi "mo:openai-client/Apis/ChatApi";
import Config "mo:openai-client/Config";
import { type CreateChatCompletionRequest } "mo:openai-client/Models/CreateChatCompletionRequest";

module {
  public type QA = Types.QA;
  public type QALessonMap = Types.QALessonMap;
  public type QAGlobalMap = Types.QAGlobalMap;

  // ── OpenAI call ──────────────────────────────────────────────────────────

  /// Call OpenAI ChatCompletion via the openai-client package.
  /// Returns the assistant message text on success, or an error string on failure (never traps).
  func callOpenAI(
    systemPrompt : Text,
    userMessage : Text,
    userApiKey : Text,
  ) : async Text {
    let config : Config.Config = {
      Config.defaultConfig with
      auth = ?#bearer(userApiKey);
      is_replicated = ?false;
      max_response_bytes = ?50_000;
    };

    let request : CreateChatCompletionRequest = {
      model = {};
      messages = [
        #ChatCompletionRequestSystemMessage({
          content = #one_of_0(systemPrompt);
          role = #system_;
          name = null;
        }),
        #ChatCompletionRequestUserMessage({
          content = #one_of_0(userMessage);
          role = #user;
          name = null;
        }),
      ];
      metadata = null;
      temperature = null;
      top_p = null;
      user = null;
      service_tier = null;
      modalities = null;
      reasoning_effort = null;
      max_completion_tokens = null;
      frequency_penalty = null;
      presence_penalty = null;
      web_search_options = null;
      top_logprobs = null;
      response_format = null;
      audio = null;
      store = null;
      stream = null;
      stop = null;
      logit_bias = null;
      logprobs = null;
      max_tokens = null;
      n = null;
      prediction = null;
      seed = null;
      stream_options = null;
      tools = null;
      tool_choice = null;
      parallel_tool_calls = null;
      function_call = null;
      functions = null;
    };

    try {
      let response = await* ChatApi.createChatCompletion(config, request);
      let choices = response.choices;
      if (choices.size() == 0) {
        "No response choices returned.";
      } else {
        choices[0].message.content;
      };
    } catch (e) {
      "Request failed: " # e.message();
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
  ) : async Text {
    let systemPrompt = "You are a helpful CatFinity tutor. The user is studying the lesson \""
      # lessonName # "\".";
    let response = await callOpenAI(systemPrompt, question, userApiKey);

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
  ) : async Text {
    let systemPrompt = "You are a helpful CatFinity tutor responding on the landing page.";
    let response = await callOpenAI(systemPrompt, question, userApiKey);

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
