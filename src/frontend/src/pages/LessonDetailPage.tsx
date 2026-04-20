import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Twitter,
} from "lucide-react";
import { toast } from "sonner";
import { MathBlock } from "../components/MathBlock";
import { MathInline } from "../components/MathInline";
import { QAPanel } from "../components/QAPanel";
import { LESSONS, getLessonById, getLessonIndex } from "../data/lessons";
import {
  useMarkComplete,
  usePostTweet,
  useProgress,
} from "../hooks/useProgress";
import { useTokenStatus } from "../hooks/useXToken";
import type { InlinePart, LessonContent } from "../types";

function InlineParts({ parts }: { parts: InlinePart[] }) {
  return (
    <>
      {parts.map((part) =>
        part.kind === "math" ? (
          <MathInline key={`math-${part.latex}`} latex={part.latex} />
        ) : (
          <span key={`text-${part.text}`}>{part.text}</span>
        ),
      )}
    </>
  );
}

function ContentBlock({ block }: { block: LessonContent }) {
  if (block.type === "paragraph") {
    return (
      <p className="text-foreground font-body leading-relaxed text-base mb-4">
        {block.text}
      </p>
    );
  }

  if (block.type === "math-block") {
    return <MathBlock latex={block.latex} />;
  }

  if (block.type === "math-inline-paragraph") {
    return (
      <p className="text-foreground font-body leading-relaxed text-base mb-4">
        <InlineParts parts={block.parts} />
      </p>
    );
  }

  if (block.type === "definition") {
    return (
      <div className="my-5 rounded-lg border-l-4 border-primary bg-primary/5 px-5 py-4">
        <p className="text-xs font-mono text-primary uppercase tracking-wider mb-1">
          Definition
        </p>
        <p className="font-display font-semibold text-foreground mb-2">
          {block.term}
        </p>
        <p className="text-foreground font-body leading-relaxed text-sm">
          <InlineParts parts={block.body} />
        </p>
      </div>
    );
  }

  if (block.type === "example") {
    return (
      <div className="my-5 rounded-lg border-l-4 border-accent bg-accent/5 px-5 py-4">
        <p className="text-xs font-mono text-accent-foreground uppercase tracking-wider mb-2">
          Example
        </p>
        <p className="text-foreground font-body leading-relaxed text-sm">
          <InlineParts parts={block.body} />
        </p>
      </div>
    );
  }

  return null;
}

export function LessonDetailPage() {
  const { lessonId } = useParams({ from: "/lessons/$lessonId" });
  const lesson = getLessonById(lessonId);
  const lessonIdx = getLessonIndex(lessonId);

  const { data: progress, isLoading: progressLoading } = useProgress();
  const { data: tokenStatus } = useTokenStatus();
  const markCompleteMutation = useMarkComplete();
  const postTweetMutation = usePostTweet();

  if (!lesson) {
    return (
      <div
        className="container mx-auto px-4 py-24 max-w-2xl text-center"
        data-ocid="lesson_detail.not_found_state"
      >
        <p className="text-6xl mb-4">∅</p>
        <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
          Lesson not found
        </h1>
        <p className="text-muted-foreground font-body mb-6">
          The module you're looking for doesn't exist or may have moved.
        </p>
        <Button asChild variant="outline" data-ocid="lesson_detail.back_button">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lessons
          </Link>
        </Button>
      </div>
    );
  }

  const completionRecord = (progress ?? []).find(
    (p) => p.lessonId === lesson.id,
  );
  const isCompleted = !!completionRecord;
  const isXConnected = tokenStatus?.hasToken && !tokenStatus?.isExpired;

  const prevLesson = lessonIdx > 0 ? LESSONS[lessonIdx - 1] : null;
  const nextLesson =
    lessonIdx < LESSONS.length - 1 ? LESSONS[lessonIdx + 1] : null;

  async function handleMarkComplete() {
    try {
      await markCompleteMutation.mutateAsync(lesson!.id);
      toast.success(`"${lesson!.title}" marked as complete!`);

      if (isXConnected) {
        console.log("[Tweet] Attempting to post tweet for lesson:", lesson!.id);
        const result = await postTweetMutation.mutateAsync({
          lessonId: lesson!.id,
          lessonTitle: lesson!.title,
        });
        console.log("[Tweet] Result:", result);
        if (result.success) {
          toast.success("Achievement shared on X!", {
            description: "Your progress has been posted.",
          });
        } else {
          toast.warning("Lesson complete, but tweet failed.", {
            description: result.message,
          });
        }
      }
    } catch {
      toast.error("Failed to mark lesson as complete. Please try again.");
    }
  }

  const isMutating =
    markCompleteMutation.isPending || postTweetMutation.isPending;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Top band */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-smooth mb-4"
            data-ocid="lesson_detail.back_link"
          >
            <ArrowLeft className="w-4 h-4" />
            All Lessons
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge
              variant="secondary"
              className="font-mono text-xs text-muted-foreground"
            >
              {lesson.subtitle}
            </Badge>

            {progressLoading ? (
              <Skeleton
                className="h-5 w-28 rounded-full"
                data-ocid="lesson_detail.loading_state"
              />
            ) : isCompleted ? (
              <Badge className="bg-primary/10 text-primary border border-primary/20 font-body text-xs gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Completed{" "}
                {new Date(completionRecord!.completedAt).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-muted-foreground border-border font-body text-xs"
              >
                Not completed
              </Badge>
            )}
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground leading-tight mb-2">
            {lesson.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <Clock className="w-4 h-4" />
            <span>{lesson.estimatedMinutes} min read</span>
          </div>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mt-3 max-w-lg">
            {lesson.description}
          </p>
        </div>
      </div>

      {/* Lesson content */}
      <article
        className="container mx-auto px-4 py-10 max-w-2xl"
        data-ocid="lesson_detail.content"
      >
        {lesson.sections.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2 className="font-display text-xl font-semibold text-foreground mb-4 pb-2 border-b border-border">
              {section.heading}
            </h2>
            {section.content.map((block, bi) => (
              // block content has no stable id; index is safe here as siblings never reorder
              // eslint-disable-next-line react/no-array-index-key
              <ContentBlock
                key={`${section.heading}-block-${bi}`}
                block={block}
              />
            ))}
          </section>
        ))}

        <Separator className="my-8" />

        {/* Mark as Complete CTA */}
        <div
          className="rounded-xl bg-card border border-border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          data-ocid="lesson_detail.completion_panel"
        >
          <div>
            <p className="font-display text-base font-semibold text-foreground mb-0.5">
              {isCompleted ? "Module complete!" : "Done with this module?"}
            </p>
            <p className="text-sm text-muted-foreground font-body">
              {isCompleted
                ? "You've already completed this module."
                : isXConnected
                  ? "Mark it complete and share your progress on X."
                  : "Mark it complete to track your progress."}
            </p>
            {markCompleteMutation.isError && (
              <div
                className="flex items-center gap-2 mt-2 text-xs text-destructive"
                data-ocid="lesson_detail.error_state"
              >
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Something went wrong. Please try again.
              </div>
            )}
          </div>

          {!isCompleted && (
            <Button
              onClick={handleMarkComplete}
              disabled={isMutating || progressLoading}
              className="shrink-0 gap-2"
              data-ocid="lesson_detail.mark_complete_button"
            >
              {isMutating ? (
                postTweetMutation.isPending ? (
                  <>
                    <Twitter className="w-4 h-4 animate-pulse" />
                    Posting to X…
                  </>
                ) : (
                  "Saving…"
                )
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Mark as Complete
                </>
              )}
            </Button>
          )}

          {isCompleted && (
            <Badge className="bg-primary/10 text-primary border border-primary/20 font-body gap-1.5 px-3 py-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Completed
            </Badge>
          )}
        </div>

        {/* Q&A Panel */}
        <div className="mt-8">
          <QAPanel lessonId={lessonId} lessonName={lesson.title} />
        </div>

        {/* Prev / Next navigation */}
        <div className="flex items-center justify-between mt-8 gap-4">
          {prevLesson ? (
            <Button
              asChild
              variant="outline"
              className="gap-2 font-body"
              data-ocid="lesson_detail.prev_lesson_button"
            >
              <Link
                to="/lessons/$lessonId"
                params={{ lessonId: prevLesson.id }}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline truncate max-w-[12rem]">
                  {prevLesson.title}
                </span>
                <span className="sm:hidden">Previous</span>
              </Link>
            </Button>
          ) : (
            <div />
          )}
          {nextLesson ? (
            <Button
              asChild
              className="gap-2 font-body ml-auto"
              data-ocid="lesson_detail.next_lesson_button"
            >
              <Link
                to="/lessons/$lessonId"
                params={{ lessonId: nextLesson.id }}
              >
                <span className="hidden sm:inline truncate max-w-[12rem]">
                  {nextLesson.title}
                </span>
                <span className="sm:hidden">Next</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="gap-2 font-body ml-auto"
              data-ocid="lesson_detail.all_lessons_button"
            >
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                All Lessons
              </Link>
            </Button>
          )}
        </div>
      </article>
    </div>
  );
}
