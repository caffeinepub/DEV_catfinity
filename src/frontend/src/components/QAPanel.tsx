import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, MessageCircleQuestion, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
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

/** Apply inline bold, italic, and code transforms to a plain text segment */
function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Matches **bold**, *italic*, `code`
  const pattern = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let last = 0;
  let start: number;
  let matched: string;
  let b: string | undefined;
  let it: string | undefined;
  let c: string | undefined;

  // Use exec loop without assignment-in-expression
  const execNext = (): RegExpExecArray | null => pattern.exec(text);
  let m = execNext();
  while (m !== null) {
    start = m.index;
    matched = m[0];
    b = m[2];
    it = m[3];
    c = m[4];

    if (start > last) {
      parts.push(text.slice(last, start));
    }

    if (matched.startsWith("**") && b) {
      parts.push(<strong key={start}>{b}</strong>);
    } else if (matched.startsWith("*") && it) {
      parts.push(<em key={start}>{it}</em>);
    } else if (c) {
      parts.push(
        <code
          key={start}
          className="bg-muted rounded px-1 py-0.5 text-xs font-mono"
        >
          {c}
        </code>,
      );
    }
    last = start + matched.length;
    m = execNext();
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Minimal markdown renderer — handles headers, bullets, numbered lists, blank lines, inline styles */
function renderMarkdown(text: string): ReactNode {
  const lines = text.split("\n");
  const nodes: ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let numberedBuffer: string[] = [];

  const flushBullets = (key: string) => {
    if (bulletBuffer.length === 0) return;
    nodes.push(
      <ul key={key} className="list-disc list-inside space-y-0.5 mb-2 text-sm">
        {bulletBuffer.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable list
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  };

  const flushNumbered = (key: string) => {
    if (numberedBuffer.length === 0) return;
    nodes.push(
      <ol
        key={key}
        className="list-decimal list-inside space-y-0.5 mb-2 text-sm"
      >
        {numberedBuffer.map((item, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: stable list
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ol>,
    );
    numberedBuffer = [];
  };

  lines.forEach((line, i) => {
    const key = `line-${i}`;

    // H1 → h3
    if (line.startsWith("# ")) {
      flushBullets(`${key}-bu`);
      flushNumbered(`${key}-nu`);
      nodes.push(
        <h3
          key={key}
          className="font-display font-semibold text-base mt-3 mb-1"
        >
          {renderInline(line.slice(2))}
        </h3>,
      );
      return;
    }

    // H2 → h4
    if (line.startsWith("## ")) {
      flushBullets(`${key}-bu`);
      flushNumbered(`${key}-nu`);
      nodes.push(
        <h4 key={key} className="font-display font-semibold text-sm mt-2 mb-1">
          {renderInline(line.slice(3))}
        </h4>,
      );
      return;
    }

    // Bullet list
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushNumbered(`${key}-nu`);
      bulletBuffer.push(line.slice(2));
      return;
    }

    // Numbered list: "1. ", "2. " etc.
    if (/^\d+\.\s/.test(line)) {
      flushBullets(`${key}-bu`);
      numberedBuffer.push(line.replace(/^\d+\.\s/, ""));
      return;
    }

    // Flush any open lists before non-list content
    flushBullets(`${key}-bu`);
    flushNumbered(`${key}-nu`);

    // Blank line
    if (line.trim() === "") {
      nodes.push(<br key={key} />);
      return;
    }

    // Plain paragraph line
    nodes.push(
      <p key={key} className="mb-1 leading-relaxed text-sm">
        {renderInline(line)}
      </p>,
    );
  });

  // Flush any trailing lists
  flushBullets("final-bu");
  flushNumbered("final-nu");

  return <>{nodes}</>;
}

function QAEntry({
  question,
  response,
  at,
}: {
  question: string;
  response: string;
  at: bigint;
}) {
  const timestamp = new Date(Number(at / 1_000_000n)).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="space-y-2 py-4 border-b border-border last:border-0">
      <div className="flex items-start justify-between gap-3">
        <p className="font-body font-semibold text-sm text-foreground leading-snug">
          {question}
        </p>
        <time className="text-xs text-muted-foreground font-mono shrink-0 mt-0.5">
          {timestamp}
        </time>
      </div>
      <div className="text-muted-foreground font-body">
        {renderMarkdown(response)}
      </div>
    </div>
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
          className="divide-y divide-border rounded-lg border border-border bg-muted/20 px-4 overflow-hidden"
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
