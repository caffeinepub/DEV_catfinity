import { c as createLucideIcon, j as jsxRuntimeExports, a as cn, B as Button, L as Link, S as Separator, u as ue } from "./index-D4juFhwD.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-BS2teR7E.js";
import { B as Badge, C as Clock, a as CircleCheck } from "./useOpenAI-Bnugf_iI.js";
import { u as useProgress, a as useResetProgress, L as LESSONS, T as TriangleAlert, Q as QAPanel, S as Skeleton } from "./useProgress-C7fjHnJU.js";
import "./backend-DIC9yK0L.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", key: "1357e3" }],
  ["path", { d: "M3 3v5h5", key: "1xhq8a" }]
];
const RotateCcw = createLucideIcon("rotate-ccw", __iconNode);
function Card({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card",
      className: cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      ),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-6", className),
      ...props
    }
  );
}
function LessonCardSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border bg-card shadow-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-20 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-5 w-28 rounded-full" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-3/4 mt-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-1/4 mt-1" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-full mb-2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-5/6" })
    ] })
  ] });
}
function CompletionBadge({
  progress
}) {
  if (!progress) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Badge,
      {
        variant: "outline",
        className: "text-muted-foreground border-border font-body text-xs",
        children: "Not completed"
      }
    );
  }
  const date = new Date(progress.completedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { className: "bg-primary/10 text-primary border border-primary/20 font-body text-xs gap-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
    date
  ] });
}
function LessonListPage() {
  const { data: progress, isLoading, isError } = useProgress();
  const resetMutation = useResetProgress();
  const progressMap = new Map(
    (progress ?? []).map((p) => [p.lessonId, p])
  );
  const completedCount = progressMap.size;
  const hasAnyComplete = completedCount > 0;
  function handleReset() {
    resetMutation.mutate(void 0, {
      onSuccess: () => ue.success("Progress reset successfully."),
      onError: () => ue.error("Failed to reset progress. Please try again.")
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[calc(100vh-4rem)] bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-10 max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-muted-foreground uppercase tracking-widest mb-3", children: "Curriculum" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl font-semibold text-foreground leading-tight mb-2", children: "(∞, 1)-Categories" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-body text-base leading-relaxed max-w-xl", children: "A self-paced introduction to higher category theory and homotopy coherence. Work through each module in order, or jump to any topic." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-6 flex-wrap gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-body text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-foreground font-semibold tabular-nums",
                "data-ocid": "lesson_list.progress_count",
                children: isLoading ? "—" : completedCount
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              " / ",
              LESSONS.length,
              " modules completed"
            ] })
          ] }),
          hasAnyComplete && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-32 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full bg-primary rounded-full transition-smooth",
              style: {
                width: `${completedCount / LESSONS.length * 100}%`
              }
            }
          ) })
        ] }),
        hasAnyComplete && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              className: "gap-1.5 text-muted-foreground border-border hover:text-destructive hover:border-destructive/40 transition-smooth",
              "data-ocid": "lesson_list.reset_progress_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5" }),
                "Reset Progress"
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "lesson_list.reset_dialog", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-display", children: "Reset all progress?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "font-body", children: [
                "This will permanently remove your completion records for all ",
                completedCount,
                " completed",
                " ",
                completedCount === 1 ? "module" : "modules",
                ". This action cannot be undone."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AlertDialogCancel,
                {
                  className: "font-body",
                  "data-ocid": "lesson_list.reset_cancel_button",
                  children: "Cancel"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AlertDialogAction,
                {
                  onClick: handleReset,
                  className: "bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body",
                  "data-ocid": "lesson_list.reset_confirm_button",
                  children: resetMutation.isPending ? "Resetting…" : "Reset Progress"
                }
              )
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 py-10 max-w-3xl", children: [
      isError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive mb-6",
          "data-ocid": "lesson_list.error_state",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-body", children: "Failed to load your progress. Check your connection and try again." })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-4", "data-ocid": "lesson_list.list", children: isLoading ? Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map(
        (key) => /* @__PURE__ */ jsxRuntimeExports.jsx(LessonCardSkeleton, {}, key)
      ) : LESSONS.map((lesson, idx) => {
        const prog = progressMap.get(lesson.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/lessons/$lessonId",
            params: { lessonId: lesson.id },
            "data-ocid": `lesson_list.item.${idx + 1}`,
            className: "block group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border border-border bg-card shadow-card group-hover:shadow-card-hover group-hover:border-primary/30 transition-smooth cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { className: "pb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      variant: "secondary",
                      className: "font-mono text-xs text-muted-foreground",
                      children: lesson.subtitle
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CompletionBadge, { progress: prog })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-semibold text-foreground leading-snug mt-1 group-hover:text-primary transition-smooth", children: lesson.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground font-body mt-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3.5 h-3.5" }),
                  lesson.estimatedMinutes,
                  " min read"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-body leading-relaxed line-clamp-2", children: lesson.description }) })
            ] })
          },
          lesson.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "container mx-auto px-4 pb-16 max-w-3xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "mb-10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-mono text-muted-foreground uppercase tracking-widest mb-1", children: "Tutor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-semibold text-foreground leading-tight mb-1", children: "Ask a question" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-body text-sm", children: "Have a question about (∞, 1)-categories? Ask the CatFinity AI tutor." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(QAPanel, { lessonId: null, "data-ocid": "landing_qa.panel" })
    ] })
  ] });
}
export {
  LessonListPage
};
