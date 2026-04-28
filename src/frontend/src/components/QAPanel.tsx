import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, MessageCircleQuestion, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import {
  useAskQuestion,
  useGetQAHistory,
  useOpenAIKey,
} from "../hooks/useOpenAI";

const THROTTLE_MS = 5_000;

interface QAPanelProps {
  lessonId: string | null;
  lessonName?: string;
}

function QAEntry({
  question,
  response,
  at,
  defaultOpen,
}: {
  question: string;
  response: string;
  at: bigint;
  defaultOpen?: boolean;
}) {
  const timestamp = new Date(Number(at / 1_000_000n)).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <details
      open={defaultOpen}
      className="group py-3 border-b border-border last:border-0 cursor-pointer"
    >
      <summary className="flex items-start justify-between gap-3 list-none select-none marker:hidden">
        <span className="flex items-start gap-2 min-w-0">
          {/* Chevron indicator */}
          <svg
            className="w-3.5 h-3.5 shrink-0 mt-0.5 text-muted-foreground transition-transform duration-200 group-open:rotate-90"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 2l4 4-4 4" />
          </svg>
          <p className="font-body font-semibold text-sm text-foreground leading-snug">
            {question}
          </p>
        </span>
        <time className="text-xs text-muted-foreground font-mono shrink-0 mt-0.5">
          {timestamp}
        </time>
      </summary>

      {/* Answer — rendered markdown + LaTeX */}
      <div className="mt-3 pl-5 text-muted-foreground font-body text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-headings:font-display prose-headings:text-foreground prose-code:bg-muted prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-pre:bg-muted prose-pre:rounded-lg">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {response}
        </ReactMarkdown>
      </div>
    </details>
  );
}

export function QAPanel({ lessonId, lessonName }: QAPanelProps) {
  const { data: apiKey, isLoading: isKeyLoading } = useOpenAIKey();
  const { data: history, isLoading: isHistoryLoading } =
    useGetQAHistory(lessonId);
  const askQuestion = useAskQuestion();

  const [question, setQuestion] = useState("");
  const [throttled, setThrottled] = useState(false);
  const [throttleSecondsLeft, setThrottleSecondsLeft] = useState(0);
  const throttleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new history entries arrive
  const historyLength = history?.length ?? 0;
  useEffect(() => {
    if (historyLength > 0) {
      listBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [historyLength]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) clearInterval(throttleTimerRef.current);
    };
  }, []);

  const startThrottle = useCallback(() => {
    setThrottled(true);
    setThrottleSecondsLeft(Math.ceil(THROTTLE_MS / 1000));

    const interval = setInterval(() => {
      setThrottleSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setThrottled(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    throttleTimerRef.current = interval;
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = question.trim();
    if (!trimmed || throttled || askQuestion.isPending) return;

    askQuestion.mutate(
      {
        lessonId,
        lessonName: lessonName ?? null,
        question: trimmed,
      },
      {
        onSuccess: () => {
          setQuestion("");
          startThrottle();
          inputRef.current?.focus();
        },
      },
    );
  }, [question, throttled, askQuestion, lessonId, lessonName, startThrottle]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const hasApiKey = !!apiKey;
  const isLoading = isKeyLoading;
  const isSubmitting = askQuestion.isPending;
  const canSubmit =
    hasApiKey && !!question.trim() && !throttled && !isSubmitting;

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="qa_panel.loading_state">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="qa_panel.panel">
      {/* Error banner */}
      {askQuestion.isError &&
        (() => {
          // biome-ignore lint/suspicious/noConsole: intentional raw-error logging for debugging
          console.error("OPENAI_RAW:", (askQuestion.error as Error).message);
          return (
            <div
              className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3"
              data-ocid="qa_panel.error_state"
            >
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm font-body text-destructive leading-snug">
                {(askQuestion.error as Error).message.includes("401")
                  ? "Invalid OpenAI API key — please update it in Settings."
                  : (askQuestion.error as Error).message.includes("429")
                    ? "OpenAI rate limit reached. Please wait a moment and try again."
                    : (askQuestion.error as Error).message}
              </p>
            </div>
          );
        })()}

      {/* Input row or no-key message */}
      {hasApiKey ? (
        <div className="flex gap-2" data-ocid="qa_panel.input_row">
          <Input
            ref={inputRef}
            placeholder="Ask a question…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
            className="font-body text-sm"
            data-ocid="qa_panel.input"
          />
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="sm"
            className="gap-1.5 shrink-0"
            data-ocid="qa_panel.submit_button"
          >
            <Send className="w-3.5 h-3.5" />
            {isSubmitting
              ? "Asking…"
              : throttled
                ? `Wait ${throttleSecondsLeft}s`
                : "Ask"}
          </Button>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3"
          data-ocid="qa_panel.no_key_state"
        >
          <MessageCircleQuestion className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-body text-muted-foreground">
            Add your OpenAI API key in{" "}
            <Link
              to="/settings"
              className="text-primary underline-offset-4 hover:underline transition-smooth"
              data-ocid="qa_panel.settings_link"
            >
              Settings
            </Link>{" "}
            to ask questions.
          </p>
        </div>
      )}

      {/* Q&A history */}
      {isHistoryLoading ? (
        <div
          className="space-y-3 pt-2"
          data-ocid="qa_panel.history_loading_state"
        >
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      ) : history && history.length > 0 ? (
        <div
          className="rounded-lg border border-border bg-muted/20 px-4 overflow-hidden"
          data-ocid="qa_panel.history_list"
        >
          {history.map((entry, idx) => (
            <div
              key={`${entry.at}-${idx}`}
              data-ocid={`qa_panel.item.${idx + 1}`}
            >
              <QAEntry
                question={entry.question}
                response={entry.response}
                at={entry.at}
                defaultOpen={idx === history.length - 1}
              />
            </div>
          ))}
          <div ref={listBottomRef} />
        </div>
      ) : hasApiKey ? (
        <p
          className="text-sm text-muted-foreground font-body"
          data-ocid="qa_panel.empty_state"
        >
          No questions yet. Ask your first one above!
        </p>
      ) : null}
    </div>
  );
}
