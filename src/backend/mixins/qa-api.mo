// mixins/qa-api.mo — public Candid API for Q&A and per-user OpenAI key management
import QALib "../lib/qa";
import Types "../types/qa";

mixin (
  qaHistoryPerLesson : Types.QALessonMap,
  qaHistoryGlobal : Types.QAGlobalMap,
  openaiKeyMap : Types.OpenAIKeyMap,
) {

  /// Ask a question.
  /// - lessonId = ?id  → per-lesson panel (requires lessonName).
  /// - lessonId = null → global landing-page panel.
  /// Reads the caller's stored OpenAI API key; returns #err if not set.
  /// Every HTTP outcall uses is_replicated = ?false (cost + consensus).
  public shared ({ caller }) func askQuestion(
    lessonId : ?Text,
    lessonName : ?Text,
    question : Text,
  ) : async { #ok : Text; #err : Text } {
    let apiKey = switch (QALib.getOpenAIKey(openaiKeyMap, caller)) {
      case (?k) k;
      case null { return #err("No OpenAI API key set. Please add your API key in Settings.") };
    };

    switch (lessonId) {
      case (?lid) {
        let name = switch (lessonName) {
          case (?n) n;
          case null lid;
        };
        let result = await QALib.askLesson(qaHistoryPerLesson, caller, lid, name, question, apiKey);
        // If the response starts with "Error " or "Request failed:", surface as #err
        if (result.startsWith(#text "Error ") or result.startsWith(#text "Request failed:")) {
          #err(result);
        } else {
          #ok(result);
        };
      };
      case null {
        let result = await QALib.askGlobal(qaHistoryGlobal, caller, question, apiKey);
        if (result.startsWith(#text "Error ") or result.startsWith(#text "Request failed:")) {
          #err(result);
        } else {
          #ok(result);
        };
      };
    };
  };

  /// Return the Q&A history for this caller.
  /// - lessonId = ?id  → per-lesson history.
  /// - lessonId = null → global history.
  public shared query ({ caller }) func getQAHistory(lessonId : ?Text) : async [QALib.QA] {
    switch (lessonId) {
      case (?lid) QALib.getLessonHistory(qaHistoryPerLesson, caller, lid);
      case null QALib.getGlobalHistory(qaHistoryGlobal, caller);
    };
  };

  /// Persist the caller's OpenAI API key in stable state.
  /// Never exposed to any other caller.
  public shared ({ caller }) func setOpenAIKey(key : Text) : async () {
    QALib.setOpenAIKey(openaiKeyMap, caller, key);
  };

  /// Return the caller's stored OpenAI API key, or null if not set.
  public shared query ({ caller }) func getOpenAIKey() : async ?Text {
    QALib.getOpenAIKey(openaiKeyMap, caller);
  };
};
