// types/qa.mo — Q&A domain types
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";

module {
  /// A single question-and-answer pair with a timestamp.
  public type QA = {
    question : Text;
    response : Text;
    at : Time.Time;
  };

  /// Per-lesson Q&A history keyed by Principal → lessonId → [QA].
  public type QALessonMap = Map.Map<Principal, Map.Map<Text, List.List<QA>>>;

  /// Global (landing-page) Q&A history keyed by Principal → [QA].
  public type QAGlobalMap = Map.Map<Principal, List.List<QA>>;

  /// Per-user OpenAI API key store keyed by Principal.
  public type OpenAIKeyMap = Map.Map<Principal, Text>;
};
