// mixins/progress-api.mo — public API for per-principal lesson progress
import ProgressLib "../lib/progress";
import Types "../types/progress";

mixin (progressMap : ProgressLib.ProgressMap) {

  /// Mark a lesson as complete for the authenticated principal.
  public shared ({ caller }) func markComplete(lessonId : Text) : async () {
    ProgressLib.markComplete(progressMap, caller, lessonId);
  };

  /// Reset all lesson progress for the authenticated principal.
  public shared ({ caller }) func resetProgress() : async () {
    ProgressLib.resetProgress(progressMap, caller);
  };

  /// Return all completed lessons for the authenticated principal.
  public shared query ({ caller }) func getProgress() : async [Types.CompletedLesson] {
    ProgressLib.getProgress(progressMap, caller);
  };
};
