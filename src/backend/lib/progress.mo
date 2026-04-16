// lib/progress.mo — domain logic for per-principal lesson progress
import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Types "../types/progress";

module {
  public type ProgressMap = Map.Map<Principal, List.List<Types.CompletedLesson>>;

  /// Mark a lesson as complete for the given principal.
  /// If already completed, this is a no-op.
  public func markComplete(
    progressMap : ProgressMap,
    caller : Principal,
    lessonId : Text,
  ) {
    let lessons = switch (progressMap.get(caller)) {
      case (?existing) existing;
      case null {
        let fresh = List.empty<Types.CompletedLesson>();
        progressMap.add(caller, fresh);
        fresh;
      };
    };
    // Only add if not already completed
    let alreadyDone = lessons.find(func(l : Types.CompletedLesson) : Bool {
      l.lessonId == lessonId
    });
    switch (alreadyDone) {
      case (?_) {}; // already completed — no-op
      case null {
        lessons.add({ lessonId; completedAt = Time.now() });
      };
    };
  };

  /// Reset all progress for the given principal.
  public func resetProgress(
    progressMap : ProgressMap,
    caller : Principal,
  ) {
    progressMap.remove(caller);
  };

  /// Get all completed lessons for the given principal.
  public func getProgress(
    progressMap : ProgressMap,
    caller : Principal,
  ) : [Types.CompletedLesson] {
    switch (progressMap.get(caller)) {
      case (?lessons) lessons.toArray();
      case null [];
    };
  };
};
