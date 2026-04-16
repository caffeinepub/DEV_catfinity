// types/progress.mo — lesson progress domain types
module {
  public type CompletedLesson = {
    lessonId : Text;
    completedAt : Int;
  };
};
