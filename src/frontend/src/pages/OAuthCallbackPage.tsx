import { Button } from "@/components/ui/button";
import { useActor } from "@caffeineai/core-infrastructure";
import { useRouter } from "@tanstack/react-router";
import { AlertCircle, Loader2, Twitter } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createActor } from "../backend";

type Step =
  | "idle"
  | "code"
  | "clientId"
  | "verifier"
  | "exchange"
  | "success"
  | "error";

interface BackendActor {
  getClientId: () => Promise<[] | [string]>;
  exchangeToken: (
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ) => Promise<{ ok: string } | { err: string }>;
}

function asActor(actor: unknown): BackendActor {
  return actor as BackendActor;
}

const STEP_LABELS: Record<Step, string> = {
  idle: "Initializing…",
  code: "Reading authorization code…",
  clientId: "Fetching Client ID from backend…",
  verifier: "Retrieving code verifier…",
  exchange: "Exchanging tokens with X…",
  success: "Connected! Redirecting…",
  error: "Connection failed",
};

export function OAuthCallbackPage() {
  const router = useRouter();
  const { actor, isFetching } = useActor(createActor);
  const [step, setStep] = useState<Step>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasRun = useRef(false);

  useEffect(() => {
    // Wait until actor is ready
    if (isFetching || !actor) return;
    // Run only once
    if (hasRun.current) return;
    hasRun.current = true;

    void runOAuthFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, isFetching]);

  async function runOAuthFlow() {
    try {
      // ── Step 1: Read authorization code from URL ────────────────────────
      setStep("code");
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");

      if (!code || !state) {
        const missing =
          !code && !state ? "code and state" : !code ? "code" : "state";
        console.error(`[OAuth] Missing URL params: ${missing}`);
        throw new Error(
          `Missing required OAuth parameters: ${missing}. This link may be invalid or expired.`,
        );
      }

      console.log(
        `[OAuth] Authorization code received: ${code.slice(0, 8)}… (state=${state.slice(0, 8)}…)`,
      );

      // ── Step 2: Fetch Client ID from backend ────────────────────────────
      setStep("clientId");
      const clientIdResult = await asActor(actor).getClientId();
      const clientId: string | null =
        clientIdResult.length > 0 ? (clientIdResult[0] as string) : null;

      if (!clientId) {
        console.error("[OAuth] Client ID not configured in backend");
        throw new Error(
          "X Client ID is not configured. Please go to Settings and add your OAuth 2.0 Client ID before connecting.",
        );
      }
      console.log("[OAuth] Client ID fetched from backend ✓");

      // ── Step 3: Retrieve code_verifier from sessionStorage ──────────────
      setStep("verifier");
      const codeVerifier = sessionStorage.getItem("oauth_code_verifier");

      if (!codeVerifier) {
        console.error("[OAuth] code_verifier not found in sessionStorage");
        throw new Error(
          "Authorization session expired. The code verifier was not found. Please try connecting again.",
        );
      }
      console.log("[OAuth] Code verifier retrieved from sessionStorage ✓");

      // Clean up after reading
      sessionStorage.removeItem("oauth_code_verifier");

      // ── Step 4: Exchange token via backend ──────────────────────────────
      setStep("exchange");
      const redirectUri = `${window.location.origin}/oauth/callback`;
      console.log(
        `[OAuth] Token exchange initiated (redirectUri=${redirectUri})`,
      );

      const result = await asActor(actor).exchangeToken(
        code,
        codeVerifier,
        redirectUri,
      );

      if ("err" in result) {
        console.error("[OAuth] Token exchange failed:", result.err);
        throw new Error(`Token exchange failed: ${result.err}`);
      }

      // ── Step 5: Success ─────────────────────────────────────────────────
      console.log(
        "[OAuth] Tokens stored successfully, redirecting to settings ✓",
      );
      setStep("success");

      setTimeout(() => {
        router.navigate({ to: "/settings" });
      }, 1200);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("[OAuth] Flow failed:", message);
      setErrorMessage(message);
      setStep("error");
    }
  }

  const isLoading = step !== "error" && step !== "success";

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center px-4"
      data-ocid="oauth_callback.page"
    >
      <div
        className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-card text-center space-y-6"
        data-ocid="oauth_callback.card"
      >
        {/* Icon */}
        <div className="flex justify-center">
          {step === "error" ? (
            <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-destructive" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              {isLoading ? (
                <Loader2
                  className="w-7 h-7 text-primary animate-spin"
                  data-ocid="oauth_callback.loading_state"
                />
              ) : (
                <Twitter className="w-7 h-7 text-primary" />
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="font-display text-xl font-semibold text-foreground">
            {step === "error" ? "Connection Failed" : "Connecting to X"}
          </h1>
          <p
            className="text-sm text-muted-foreground"
            data-ocid="oauth_callback.status_label"
          >
            {STEP_LABELS[step]}
          </p>
        </div>

        {/* Progress steps (visible while loading) */}
        {isLoading && (
          <div
            className="space-y-2 text-left"
            data-ocid="oauth_callback.progress_steps"
          >
            {(
              [
                { key: "code", label: "Read authorization code" },
                { key: "clientId", label: "Fetch Client ID from backend" },
                { key: "verifier", label: "Retrieve code verifier" },
                { key: "exchange", label: "Exchange tokens with X" },
              ] as const
            ).map(({ key, label }) => {
              const stepOrder: Step[] = [
                "idle",
                "code",
                "clientId",
                "verifier",
                "exchange",
                "success",
              ];
              const currentIdx = stepOrder.indexOf(step);
              const stepIdx = stepOrder.indexOf(key);
              const isDone = stepIdx < currentIdx;
              const isCurrent = stepIdx === currentIdx;

              return (
                <div
                  key={key}
                  className="flex items-center gap-2.5 text-sm"
                  data-ocid={`oauth_callback.step.${stepIdx}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex-shrink-0 border transition-smooth ${
                      isDone
                        ? "bg-primary border-primary"
                        : isCurrent
                          ? "border-primary/60 bg-primary/10"
                          : "border-border bg-muted"
                    }`}
                  >
                    {isDone && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="w-full h-full p-0.5"
                        aria-label="Step complete"
                        role="img"
                      >
                        <path
                          d="M3 8l3.5 3.5L13 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary-foreground"
                        />
                      </svg>
                    )}
                  </span>
                  <span
                    className={
                      isDone
                        ? "text-foreground"
                        : isCurrent
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                    }
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Error details */}
        {step === "error" && (
          <div
            className="text-sm text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-4 py-3 text-left leading-relaxed"
            data-ocid="oauth_callback.error_state"
          >
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        {step === "error" && (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="default"
              onClick={() => router.navigate({ to: "/settings" })}
              data-ocid="oauth_callback.go_to_settings_button"
            >
              Go to Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                hasRun.current = false;
                setStep("idle");
                setErrorMessage("");
                void runOAuthFlow();
              }}
              data-ocid="oauth_callback.retry_button"
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
