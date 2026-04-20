import { c as createLucideIcon, r as reactExports, j as jsxRuntimeExports, P as Primitive, a as cn, S as Separator, f as useAuth, B as Button, u as ue } from "./index-D4juFhwD.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-BS2teR7E.js";
import { I as Input, a as CircleCheck, B as Badge, u as useOpenAIKey, e as useSetOpenAIKey, C as Clock } from "./useOpenAI-Bnugf_iI.js";
import { u as useActor, c as createActor } from "./backend-DIC9yK0L.js";
import { a as useClientId, b as useSetClientId, u as useTokenStatus, c as useDisconnectX } from "./useXToken-NPPWfhKj.js";
import { T as Twitter } from "./twitter-CLkQVDhK.js";
import { C as CircleAlert } from "./circle-alert-B_s8rgel.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const EyeOff = createLucideIcon("eye-off", __iconNode$4);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode$3);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  [
    "path",
    {
      d: "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z",
      key: "1s6t7t"
    }
  ],
  ["circle", { cx: "16.5", cy: "7.5", r: ".5", fill: "currentColor", key: "w0ekpg" }]
];
const KeyRound = createLucideIcon("key-round", __iconNode$2);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", key: "975kel" }],
  ["circle", { cx: "12", cy: "7", r: "4", key: "17ys0d" }]
];
const User = createLucideIcon("user", __iconNode$1);
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
const X = createLucideIcon("x", __iconNode);
var NAME = "Label";
var Label$1 = reactExports.forwardRef((props, forwardedRef) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.label,
    {
      ...props,
      ref: forwardedRef,
      onMouseDown: (event) => {
        var _a;
        const target = event.target;
        if (target.closest("button, input, select, textarea")) return;
        (_a = props.onMouseDown) == null ? void 0 : _a.call(props, event);
        if (!event.defaultPrevented && event.detail > 1) event.preventDefault();
      }
    }
  );
});
Label$1.displayName = NAME;
var Root = Label$1;
function Label({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Root,
    {
      "data-slot": "label",
      className: cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function generateCodeVerifier() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function generateState() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function XConnectionStatus({
  hasToken,
  isExpired
}) {
  if (!hasToken) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Badge,
      {
        variant: "secondary",
        className: "gap-1.5 text-xs font-body",
        "data-ocid": "x.status_badge",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
          "Not connected"
        ]
      }
    );
  }
  if (isExpired) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Badge,
      {
        variant: "outline",
        className: "gap-1.5 text-xs font-body border-accent text-accent",
        "data-ocid": "x.status_badge",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
          "Token expired"
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Badge,
    {
      variant: "outline",
      className: "gap-1.5 text-xs font-body border-primary text-primary",
      "data-ocid": "x.status_badge",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
        "Connected"
      ]
    }
  );
}
function SettingsSection({
  title,
  description,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid md:grid-cols-[1fr_2fr] gap-6 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-base font-semibold text-foreground", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground leading-relaxed font-body", children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children })
  ] });
}
function ClientIdField() {
  const { data: savedClientId, isLoading: isLoadingId } = useClientId();
  const setClientId = useSetClientId();
  const { actor } = useActor(createActor);
  const [value, setValue] = reactExports.useState("");
  const [showValue, setShowValue] = reactExports.useState(false);
  const [verifyError, setVerifyError] = reactExports.useState(null);
  const [verifySuccess, setVerifySuccess] = reactExports.useState(false);
  const [isVerifying, setIsVerifying] = reactExports.useState(false);
  const isSet = !!savedClientId;
  const handleSave = () => {
    const trimmed = value.trim() || (savedClientId ?? "").trim();
    if (!trimmed) {
      ue.error("Client ID cannot be empty");
      return;
    }
    setVerifyError(null);
    setVerifySuccess(false);
    setClientId.mutate(trimmed, {
      onSuccess: async ({ actor: savedActor }) => {
        setIsVerifying(true);
        try {
          console.log("[OAuth] Re-reading Client ID from backend to verify...");
          const result = await savedActor.getClientId();
          const readBack = result ?? null;
          console.log(
            "[OAuth] Re-read Client ID:",
            readBack ? `${readBack.substring(0, 6)}…` : "null"
          );
          if (readBack && readBack === trimmed) {
            setVerifySuccess(true);
            setValue("");
            ue.success("Client ID saved and verified");
          } else {
            const msg = "Client ID could not be verified — please try again.";
            setVerifyError(msg);
            ue.error(msg);
            console.error(
              "[OAuth] Client ID verification failed: written vs read-back mismatch",
              {
                written: `${trimmed.substring(0, 6)}…`,
                readBack: readBack ? `${readBack.substring(0, 6)}…` : "null"
              }
            );
          }
        } catch (err) {
          const msg = "Client ID could not be verified — please try again.";
          setVerifyError(msg);
          ue.error(msg);
          console.error("[OAuth] Client ID re-read error:", err);
        } finally {
          setIsVerifying(false);
        }
      },
      onError: (err) => {
        ue.error(`Failed to save: ${err.message}`);
      }
    });
  };
  const isBusy = setClientId.isPending || isVerifying || isLoadingId;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "client-id", className: "text-sm font-body font-medium", children: "OAuth 2.0 Client ID for X" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 font-body", children: "Your X developer app Client ID (Native App type). This is a global setting shared across all users." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "client-id",
            type: showValue ? "text" : "password",
            placeholder: isLoadingId ? "Loading…" : isSet ? "••••••••••••••••" : "Enter your X Client ID",
            value,
            onChange: (e) => {
              setValue(e.target.value);
              setVerifyError(null);
              setVerifySuccess(false);
            },
            className: "pr-10 font-mono text-sm",
            "data-ocid": "settings.client_id_input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowValue((v) => !v),
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
            "aria-label": showValue ? "Hide Client ID" : "Show Client ID",
            "data-ocid": "settings.client_id_toggle",
            children: showValue ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleSave,
          disabled: isBusy || !actor,
          "data-ocid": "settings.client_id_save_button",
          children: setClientId.isPending ? "Saving…" : isVerifying ? "Verifying…" : "Save"
        }
      )
    ] }),
    isSet && !value && !verifySuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-body", children: "A Client ID is currently saved. Enter a new value above to replace it." }),
    verifySuccess && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "p",
      {
        className: "text-xs text-primary font-body flex items-center gap-1",
        "data-ocid": "settings.client_id_success_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
          "Client ID saved and verified successfully."
        ]
      }
    ),
    verifyError && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-xs text-destructive font-body",
        "data-ocid": "settings.client_id_error_state",
        children: verifyError
      }
    ),
    setClientId.isError && !verifyError && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-xs text-destructive font-body",
        "data-ocid": "settings.client_id_error_state",
        children: setClientId.error.message
      }
    )
  ] });
}
function XConnectionSection() {
  const { data: clientId, isLoading: isLoadingClientId } = useClientId();
  const { data: tokenStatus, isLoading: isLoadingStatus } = useTokenStatus();
  const disconnectX = useDisconnectX();
  const [connectError, setConnectError] = reactExports.useState(null);
  const hasToken = (tokenStatus == null ? void 0 : tokenStatus.hasToken) ?? false;
  const isExpired = (tokenStatus == null ? void 0 : tokenStatus.isExpired) ?? false;
  const handleConnect = async () => {
    setConnectError(null);
    if (!clientId) {
      const msg = "No Client ID set — please enter your X OAuth Client ID in the field above before connecting.";
      setConnectError(msg);
      console.error(
        "[OAuth] Blocked redirect: Client ID is not set in backend"
      );
      return;
    }
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    const redirectUri = `${window.location.origin}/oauth/callback`;
    console.log("[OAuth] Starting PKCE flow");
    console.log(
      "[OAuth] Generated code_verifier:",
      `${codeVerifier.substring(0, 8)}…`
    );
    console.log(
      "[OAuth] Generated code_challenge:",
      `${codeChallenge.substring(0, 8)}…`
    );
    console.log("[OAuth] State:", state);
    console.log("[OAuth] Redirect URI:", redirectUri);
    sessionStorage.setItem("oauth_code_verifier", codeVerifier);
    sessionStorage.setItem("oauth_state", state);
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "tweet.read tweet.write users.read offline.access",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    });
    const authUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;
    console.log("[OAuth] Redirecting to:", authUrl);
    window.location.href = authUrl;
  };
  const handleDisconnect = () => {
    disconnectX.mutate(void 0, {
      onSuccess: () => {
        ue.success("Disconnected from X / Twitter");
      },
      onError: (err) => {
        ue.error(`Disconnect failed: ${err.message}`);
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-body text-muted-foreground", children: "Status:" }),
      isLoadingStatus ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "text-xs font-body", children: "Checking…" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(XConnectionStatus, { hasToken, isExpired })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleConnect,
          disabled: !clientId || isLoadingClientId,
          className: "gap-2",
          "data-ocid": "settings.connect_x_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Twitter, { className: "w-4 h-4" }),
            hasToken && !isExpired ? "Re-connect X / Twitter" : "Connect X / Twitter"
          ]
        }
      ),
      hasToken && /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            className: "gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-smooth",
            disabled: disconnectX.isPending,
            "data-ocid": "settings.disconnect_x_open_modal_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }),
              disconnectX.isPending ? "Disconnecting…" : "Disconnect X / Twitter"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "settings.disconnect_x_dialog", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-display", children: "Disconnect X / Twitter?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { className: "font-body", children: "Your stored OAuth tokens will be permanently deleted. You will need to reconnect and authorize the app again to enable automatic tweet posting on lesson completion." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogCancel,
              {
                className: "font-body",
                "data-ocid": "settings.disconnect_x_cancel_button",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              AlertDialogAction,
              {
                onClick: handleDisconnect,
                className: "bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body",
                "data-ocid": "settings.disconnect_x_confirm_button",
                children: "Yes, disconnect"
              }
            )
          ] })
        ] })
      ] })
    ] }),
    connectError && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "p",
      {
        className: "text-xs text-destructive font-body flex items-start gap-1.5",
        "data-ocid": "settings.connect_x_error_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3 mt-0.5 flex-shrink-0" }),
          connectError
        ]
      }
    ),
    !clientId && !connectError && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-xs text-muted-foreground font-body",
        "data-ocid": "settings.connect_x_warning",
        children: "Save your X Client ID above before connecting."
      }
    ),
    disconnectX.isError && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-xs text-destructive font-body",
        "data-ocid": "settings.disconnect_x_error_state",
        children: disconnectX.error.message
      }
    )
  ] });
}
function OpenAIKeyField() {
  const { data: savedKey, isLoading: isLoadingKey } = useOpenAIKey();
  const setOpenAIKey = useSetOpenAIKey();
  const { actor } = useActor(createActor);
  const [value, setValue] = reactExports.useState("");
  const [showValue, setShowValue] = reactExports.useState(false);
  const [verifyError, setVerifyError] = reactExports.useState(null);
  const [verifySuccess, setVerifySuccess] = reactExports.useState(false);
  const [isVerifying, setIsVerifying] = reactExports.useState(false);
  const isSet = !!savedKey;
  const savedMask = isSet && savedKey ? savedKey.startsWith("sk-") ? "sk-…" : "•••…" : null;
  const handleSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      ue.error("API key cannot be empty");
      return;
    }
    setVerifyError(null);
    setVerifySuccess(false);
    setOpenAIKey.mutate(trimmed, {
      onSuccess: async ({ actor: savedActor }) => {
        setIsVerifying(true);
        try {
          const readBack = await savedActor.getOpenAIKey();
          if (readBack && readBack === trimmed) {
            setVerifySuccess(true);
            setValue("");
            ue.success("OpenAI API key saved and verified");
          } else {
            const msg = "API key could not be verified — please try again.";
            setVerifyError(msg);
            ue.error(msg);
          }
        } catch (err) {
          const msg = "API key could not be verified — please try again.";
          setVerifyError(msg);
          ue.error(msg);
          console.error("[OpenAI] API key re-read error:", err);
        } finally {
          setIsVerifying(false);
        }
      },
      onError: (err) => {
        ue.error(`Failed to save: ${err.message}`);
      }
    });
  };
  const isBusy = setOpenAIKey.isPending || isVerifying || isLoadingKey;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "openai-key", className: "text-sm font-body font-medium", children: "OpenAI API Key" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 font-body", children: [
        "Your personal OpenAI API key (starts with",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: "sk-" }),
        "). Stored per-account and never shared with other users."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "openai-key",
            type: showValue ? "text" : "password",
            placeholder: isLoadingKey ? "Loading…" : isSet ? "••••••••••••••••" : "sk-…",
            value,
            onChange: (e) => {
              setValue(e.target.value);
              setVerifyError(null);
              setVerifySuccess(false);
            },
            className: "pr-10 font-mono text-sm",
            "data-ocid": "settings.openai_key_input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setShowValue((v) => !v),
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors",
            "aria-label": showValue ? "Hide API key" : "Show API key",
            "data-ocid": "settings.openai_key_toggle",
            children: showValue ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: handleSave,
          disabled: isBusy || !actor,
          "data-ocid": "settings.openai_key_save_button",
          children: setOpenAIKey.isPending ? "Saving…" : isVerifying ? "Verifying…" : "Save"
        }
      )
    ] }),
    isSet && !value && !verifySuccess && savedMask && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-body flex items-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "w-3 h-3 flex-shrink-0" }),
      "Currently saved: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "font-mono", children: savedMask }),
      ". Enter a new value above to replace it."
    ] }),
    verifySuccess && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "p",
      {
        className: "text-xs text-primary font-body flex items-center gap-1",
        "data-ocid": "settings.openai_key_success_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
          "OpenAI API key saved and verified successfully."
        ]
      }
    ),
    verifyError && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-xs text-destructive font-body",
        "data-ocid": "settings.openai_key_error_state",
        children: verifyError
      }
    ),
    setOpenAIKey.isError && !verifyError && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "p",
      {
        className: "text-xs text-destructive font-body",
        "data-ocid": "settings.openai_key_error_state",
        children: setOpenAIKey.error.message
      }
    )
  ] });
}
function AccountSection() {
  const { principalText, logout } = useAuth();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide font-body mb-1", children: "Internet Identity Principal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "p",
          {
            className: "text-sm font-mono text-foreground break-all",
            "data-ocid": "settings.principal_display",
            children: principalText ?? "—"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        variant: "outline",
        onClick: logout,
        className: "font-body",
        "data-ocid": "settings.logout_button",
        children: "Sign out"
      }
    )
  ] });
}
function SettingsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "max-w-3xl mx-auto px-4 sm:px-6 py-10",
      "data-ocid": "settings.page",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-semibold text-foreground", children: "Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-muted-foreground font-body text-sm", children: "Manage your account and integrations." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, { className: "my-6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SettingsSection,
          {
            title: "Account",
            description: "Your Internet Identity principal and session management.",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountSection, {})
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          SettingsSection,
          {
            title: "X / Twitter Integration",
            description: "Configure your X developer app Client ID and authorize CatFinity to post tweets when you complete lessons.",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ClientIdField, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm font-body font-medium", children: "Connection" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 mb-3 font-body", children: "Uses OAuth 2.0 PKCE (Native App, no client secret). Tokens are stored per-principal on the Internet Computer canister." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(XConnectionSection, {})
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          SettingsSection,
          {
            title: "OpenAI Integration",
            description: "Your personal OpenAI API key for the Q&A assistant on lessons and the landing page. Stored privately per account — never shared with other users.",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(OpenAIKeyField, {})
          }
        )
      ]
    }
  );
}
export {
  SettingsPage
};
