import { c as createLucideIcon, y as useRouter, r as reactExports, j as jsxRuntimeExports, B as Button } from "./index-C0tN0U_T.js";
import { u as useActor, c as createActor } from "./backend-C-R7NMV0.js";
import { C as CircleAlert } from "./circle-alert-CCRQe1aq.js";
import { T as Twitter } from "./twitter-xUpVLCuQ.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [["path", { d: "M21 12a9 9 0 1 1-6.219-8.56", key: "13zald" }]];
const LoaderCircle = createLucideIcon("loader-circle", __iconNode);
function asActor(actor) {
  return actor;
}
const STEP_LABELS = {
  idle: "Initializing…",
  code: "Reading authorization code…",
  clientId: "Fetching Client ID from backend…",
  verifier: "Retrieving code verifier…",
  exchange: "Exchanging tokens with X…",
  success: "Connected! Redirecting…",
  error: "Connection failed"
};
function OAuthCallbackPage() {
  const router = useRouter();
  const { actor, isFetching } = useActor(createActor);
  const [step, setStep] = reactExports.useState("idle");
  const [errorMessage, setErrorMessage] = reactExports.useState("");
  const hasRun = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (isFetching || !actor) return;
    if (hasRun.current) return;
    hasRun.current = true;
    void runOAuthFlow();
  }, [actor, isFetching]);
  async function runOAuthFlow() {
    try {
      setStep("code");
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      if (!code || !state) {
        const missing = !code && !state ? "code and state" : !code ? "code" : "state";
        console.error(`[OAuth] Missing URL params: ${missing}`);
        throw new Error(
          `Missing required OAuth parameters: ${missing}. This link may be invalid or expired.`
        );
      }
      console.log(
        `[OAuth] Authorization code received: ${code.slice(0, 8)}… (state=${state.slice(0, 8)}…)`
      );
      setStep("clientId");
      const clientId = await asActor(actor).getClientId();
      if (!clientId) {
        console.error("[OAuth] Client ID not configured in backend");
        throw new Error(
          "X Client ID is not configured. Please go to Settings and add your OAuth 2.0 Client ID before connecting."
        );
      }
      console.log("[OAuth] Client ID fetched from backend ✓");
      setStep("verifier");
      const codeVerifier = sessionStorage.getItem("oauth_code_verifier");
      if (!codeVerifier) {
        console.error("[OAuth] code_verifier not found in sessionStorage");
        throw new Error(
          "Authorization session expired. The code verifier was not found. Please try connecting again."
        );
      }
      console.log("[OAuth] Code verifier retrieved from sessionStorage ✓");
      sessionStorage.removeItem("oauth_code_verifier");
      setStep("exchange");
      const redirectUri = `${window.location.origin}/oauth/callback`;
      console.log(
        `[OAuth] Token exchange initiated (redirectUri=${redirectUri})`
      );
      const result = await asActor(actor).exchangeToken(
        code,
        codeVerifier,
        redirectUri
      );
      if ("err" in result) {
        console.error("[OAuth] Token exchange failed:", result.err);
        throw new Error(`Token exchange failed: ${result.err}`);
      }
      console.log(
        "[OAuth] Tokens stored successfully, redirecting to settings ✓"
      );
      setStep("success");
      setTimeout(() => {
        router.navigate({ to: "/settings" });
      }, 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      console.error("[OAuth] Flow failed:", message);
      setErrorMessage(message);
      setStep("error");
    }
  }
  const isLoading = step !== "error" && step !== "success";
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "min-h-[70vh] flex flex-col items-center justify-center px-4",
      "data-ocid": "oauth_callback.page",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-card text-center space-y-6",
          "data-ocid": "oauth_callback.card",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: step === "error" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-7 h-7 text-destructive" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              LoaderCircle,
              {
                className: "w-7 h-7 text-primary animate-spin",
                "data-ocid": "oauth_callback.loading_state"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "w-7 h-7 text-primary" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-xl font-semibold text-foreground", children: step === "error" ? "Connection Failed" : "Connecting to X" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "p",
                {
                  className: "text-sm text-muted-foreground",
                  "data-ocid": "oauth_callback.status_label",
                  children: STEP_LABELS[step]
                }
              )
            ] }),
            isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "space-y-2 text-left",
                "data-ocid": "oauth_callback.progress_steps",
                children: [
                  { key: "code", label: "Read authorization code" },
                  { key: "clientId", label: "Fetch Client ID from backend" },
                  { key: "verifier", label: "Retrieve code verifier" },
                  { key: "exchange", label: "Exchange tokens with X" }
                ].map(({ key, label }) => {
                  const stepOrder = [
                    "idle",
                    "code",
                    "clientId",
                    "verifier",
                    "exchange",
                    "success"
                  ];
                  const currentIdx = stepOrder.indexOf(step);
                  const stepIdx = stepOrder.indexOf(key);
                  const isDone = stepIdx < currentIdx;
                  const isCurrent = stepIdx === currentIdx;
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "flex items-center gap-2.5 text-sm",
                      "data-ocid": `oauth_callback.step.${stepIdx}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: `w-4 h-4 rounded-full flex-shrink-0 border transition-smooth ${isDone ? "bg-primary border-primary" : isCurrent ? "border-primary/60 bg-primary/10" : "border-border bg-muted"}`,
                            children: isDone && /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "svg",
                              {
                                viewBox: "0 0 16 16",
                                fill: "none",
                                className: "w-full h-full p-0.5",
                                "aria-label": "Step complete",
                                role: "img",
                                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                                  "path",
                                  {
                                    d: "M3 8l3.5 3.5L13 5",
                                    stroke: "currentColor",
                                    strokeWidth: "2",
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    className: "text-primary-foreground"
                                  }
                                )
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: isDone ? "text-foreground" : isCurrent ? "text-primary font-medium" : "text-muted-foreground",
                            children: label
                          }
                        )
                      ]
                    },
                    key
                  );
                })
              }
            ),
            step === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-left leading-relaxed",
                "data-ocid": "oauth_callback.error_state",
                children: errorMessage
              }
            ),
            step === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "default",
                  onClick: () => router.navigate({ to: "/settings" }),
                  "data-ocid": "oauth_callback.go_to_settings_button",
                  children: "Go to Settings"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => {
                    hasRun.current = false;
                    setStep("idle");
                    setErrorMessage("");
                    void runOAuthFlow();
                  },
                  "data-ocid": "oauth_callback.retry_button",
                  children: "Retry"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}
export {
  OAuthCallbackPage
};
