import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { QAPanel } from "../components/QAPanel";
import { LESSONS } from "../data/lessons";
import { useProgress, useResetProgress } from "../hooks/useProgress";
import type { LessonProgress } from "../types";

function LessonCardSkeleton() {
  return (
    <Card className="border border-border bg-card shadow-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>
        <Skeleton className="h-7 w-3/4 mt-2" />
        <Skeleton className="h-4 w-1/4 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

function CompletionBadge({
  progress,
}: { progress: LessonProgress | undefined }) {
  if (!progress) {
    return (
      <Badge
        variant="outline"
        className="text-muted-foreground border-border font-body text-xs"
      >
        Not completed
      </Badge>
    );
  }
  const date = new Date(progress.completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  return (
    <Badge className="bg-primary/10 text-primary border border-primary/20 font-body text-xs gap-1.5">
      <CheckCircle2 className="w-3 h-3" />
      {date}
    </Badge>
  );
}

export function LessonListPage() {
  const { data: progress, isLoading, isError } = useProgress();
  const resetMutation = useResetProgress();

  const progressMap = new Map<string, LessonProgress>(
    (progress ?? []).map((p) => [p.lessonId, p]),
  );
  const completedCount = progressMap.size;
  const hasAnyComplete = completedCount > 0;

  function handleReset() {
    resetMutation.mutate(undefined, {
      onSuccess: () => toast.success("Progress reset successfully."),
      onError: () => toast.error("Failed to reset progress. Please try again."),
    });
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* Page header band */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3">
            Curriculum
          </p>
          <h1 className="font-display text-4xl font-semibold text-foreground leading-tight mb-2">
            (∞, 1)-Categories
          </h1>
          <p className="text-muted-foreground font-body text-base leading-relaxed max-w-xl">
            A self-paced introduction to higher category theory and homotopy
            coherence. Work through each module in order, or jump to any topic.
          </p>

          {/* Progress summary */}
          <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="text-sm font-body text-muted-foreground">
                <span
                  className="text-foreground font-semibold tabular-nums"
                  data-ocid="lesson_list.progress_count"
                >
                  {isLoading ? "—" : completedCount}
                </span>
                <span> / {LESSONS.length} modules completed</span>
              </div>
              {hasAnyComplete && (
                <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-smooth"
                    style={{
                      width: `${(completedCount / LESSONS.length) * 100}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {hasAnyComplete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-muted-foreground border-border hover:text-destructive hover:border-destructive/40 transition-smooth"
                    data-ocid="lesson_list.reset_progress_button"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Progress
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent data-ocid="lesson_list.reset_dialog">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-display">
                      Reset all progress?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="font-body">
                      This will permanently remove your completion records for
                      all {completedCount} completed{" "}
                      {completedCount === 1 ? "module" : "modules"}. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      className="font-body"
                      data-ocid="lesson_list.reset_cancel_button"
                    >
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                      data-ocid="lesson_list.reset_confirm_button"
                    >
                      {resetMutation.isPending
                        ? "Resetting…"
                        : "Reset Progress"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Lesson list */}
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {isError && (
          <div
            className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive mb-6"
            data-ocid="lesson_list.error_state"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-body">
              Failed to load your progress. Check your connection and try again.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4" data-ocid="lesson_list.list">
          {isLoading
            ? Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map(
                (key) => <LessonCardSkeleton key={key} />,
              )
            : LESSONS.map((lesson, idx) => {
                const prog = progressMap.get(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    to="/lessons/$lessonId"
                    params={{ lessonId: lesson.id }}
                    data-ocid={`lesson_list.item.${idx + 1}`}
                    className="block group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                  >
                    <Card className="border border-border bg-card shadow-card group-hover:shadow-card-hover group-hover:border-primary/30 transition-smooth cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="font-mono text-xs text-muted-foreground"
                          >
                            {lesson.subtitle}
                          </Badge>
                          <CompletionBadge progress={prog} />
                        </div>
                        <h2 className="font-display text-xl font-semibold text-foreground leading-snug mt-1 group-hover:text-primary transition-smooth">
                          {lesson.title}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.estimatedMinutes} min read
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground font-body leading-relaxed line-clamp-2">
                          {lesson.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
        </div>
      </div>

      {/* Global Q&A panel */}
      <div className="container mx-auto px-4 pb-16 max-w-3xl">
        <Separator className="mb-10" />
        <div className="mb-6">
          <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1">
            Tutor
          </p>
          <h2 className="font-display text-2xl font-semibold text-foreground leading-tight mb-1">
            Ask a question
          </h2>
          <p className="text-muted-foreground font-body text-sm">
            Have a question about (∞, 1)-categories? Ask the CatFinity AI tutor.
          </p>
        </div>
        <QAPanel lessonId={null} data-ocid="landing_qa.panel" />
      </div>
    </div>
  );
}
