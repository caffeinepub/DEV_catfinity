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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Twitter,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../backend";
import { useAuth } from "../hooks/useAuth";
import {
  useClientId,
  useDisconnectX,
  useSetClientId,
  useTokenStatus,
} from "../hooks/useXToken";

function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ─── X Connection Status Badge ────────────────────────────────────────────────
function XConnectionStatus({
  hasToken,
  isExpired,
}: {
  hasToken: boolean;
  isExpired: boolean;
}) {
  if (!hasToken) {
    return (
      <Badge
        variant="secondary"
        className="gap-1.5 text-xs font-body"
        data-ocid="x.status_badge"
      >
        <AlertCircle className="w-3 h-3" />
        Not connected
      </Badge>
    );
  }
  if (isExpired) {
    return (
      <Badge
        variant="outline"
        className="gap-1.5 text-xs font-body border-accent text-accent"
        data-ocid="x.status_badge"
      >
        <Clock className="w-3 h-3" />
        Token expired
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="gap-1.5 text-xs font-body border-primary text-primary"
      data-ocid="x.status_badge"
    >
      <CheckCircle2 className="w-3 h-3" />
      Connected
    </Badge>
  );
}

// ─── Settings Section Wrapper ─────────────────────────────────────────────────
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid md:grid-cols-[1fr_2fr] gap-6 py-8">
      <div>
        <h2 className="font-display text-base font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed font-body">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

// ─── Client ID Field ──────────────────────────────────────────────────────────
function ClientIdField() {
  const { data: savedClientId, isLoading: isLoadingId } = useClientId();
  const setClientId = useSetClientId();
  const { actor } = useActor(createActor);

  const [value, setValue] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isSet = !!savedClientId;

  const handleSave = () => {
    const trimmed = value.trim() || (savedClientId ?? "").trim();
    if (!trimmed) {
      toast.error("Client ID cannot be empty");
      return;
    }
    setVerifyError(null);
    setVerifySuccess(false);

    setClientId.mutate(trimmed, {
      onSuccess: async ({ actor: savedActor }) => {
        // Immediately re-read from backend to confirm the value persisted
        setIsVerifying(true);
        try {
          console.log("[OAuth] Re-reading Client ID from backend to verify...");
          const result = await savedActor.getClientId();
          const readBack: string | null = result ?? null;
          console.log(
            "[OAuth] Re-read Client ID:",
            readBack ? `${readBack.substring(0, 6)}…` : "null",
          );

          if (readBack && readBack === trimmed) {
            setVerifySuccess(true);
            setValue("");
            toast.success("Client ID saved and verified");
          } else {
            const msg = "Client ID could not be verified — please try again.";
            setVerifyError(msg);
            toast.error(msg);
            console.error(
              "[OAuth] Client ID verification failed: written vs read-back mismatch",
              {
                written: `${trimmed.substring(0, 6)}…`,
                readBack: readBack ? `${readBack.substring(0, 6)}…` : "null",
              },
            );
          }
        } catch (err) {
          const msg = "Client ID could not be verified — please try again.";
          setVerifyError(msg);
          toast.error(msg);
          console.error("[OAuth] Client ID re-read error:", err);
        } finally {
          setIsVerifying(false);
        }
      },
      onError: (err) => {
        toast.error(`Failed to save: ${(err as Error).message}`);
      },
    });
  };

  const isBusy = setClientId.isPending || isVerifying || isLoadingId;

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="client-id" className="text-sm font-body font-medium">
          OAuth 2.0 Client ID for X
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5 font-body">
          Your X developer app Client ID (Native App type). This is a global
          setting shared across all users.
        </p>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="client-id"
            type={showValue ? "text" : "password"}
            placeholder={
              isLoadingId
                ? "Loading…"
                : isSet
                  ? "••••••••••••••••"
                  : "Enter your X Client ID"
            }
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setVerifyError(null);
              setVerifySuccess(false);
            }}
            className="pr-10 font-mono text-sm"
            data-ocid="settings.client_id_input"
          />
          <button
            type="button"
            onClick={() => setShowValue((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showValue ? "Hide Client ID" : "Show Client ID"}
            data-ocid="settings.client_id_toggle"
          >
            {showValue ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <Button
          onClick={handleSave}
          disabled={isBusy || !actor}
          data-ocid="settings.client_id_save_button"
        >
          {setClientId.isPending
            ? "Saving…"
            : isVerifying
              ? "Verifying…"
              : "Save"}
        </Button>
      </div>

      {isSet && !value && !verifySuccess && (
        <p className="text-xs text-muted-foreground font-body">
          A Client ID is currently saved. Enter a new value above to replace it.
        </p>
      )}

      {verifySuccess && (
        <p
          className="text-xs text-primary font-body flex items-center gap-1"
          data-ocid="settings.client_id_success_state"
        >
          <CheckCircle2 className="w-3 h-3" />
          Client ID saved and verified successfully.
        </p>
      )}

      {verifyError && (
        <p
          className="text-xs text-destructive font-body"
          data-ocid="settings.client_id_error_state"
        >
          {verifyError}
        </p>
      )}

      {setClientId.isError && !verifyError && (
        <p
          className="text-xs text-destructive font-body"
          data-ocid="settings.client_id_error_state"
        >
          {(setClientId.error as Error).message}
        </p>
      )}
    </div>
  );
}

// ─── X Connection Section ─────────────────────────────────────────────────────
function XConnectionSection() {
  const { data: clientId, isLoading: isLoadingClientId } = useClientId();
  const { data: tokenStatus, isLoading: isLoadingStatus } = useTokenStatus();
  const disconnectX = useDisconnectX();

  const [connectError, setConnectError] = useState<string | null>(null);

  const hasToken = tokenStatus?.hasToken ?? false;
  const isExpired = tokenStatus?.isExpired ?? false;

  const handleConnect = async () => {
    setConnectError(null);

    // Verify Client ID is present before initiating PKCE flow
    if (!clientId) {
      const msg =
        "No Client ID set — please enter your X OAuth Client ID in the field above before connecting.";
      setConnectError(msg);
      console.error(
        "[OAuth] Blocked redirect: Client ID is not set in backend",
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
      `${codeVerifier.substring(0, 8)}…`,
    );
    console.log(
      "[OAuth] Generated code_challenge:",
      `${codeChallenge.substring(0, 8)}…`,
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
      code_challenge_method: "S256",
    });

    const authUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;
    console.log("[OAuth] Redirecting to:", authUrl);
    window.location.href = authUrl;
  };

  const handleDisconnect = () => {
    disconnectX.mutate(undefined, {
      onSuccess: () => {
        toast.success("Disconnected from X / Twitter");
      },
      onError: (err) => {
        toast.error(`Disconnect failed: ${(err as Error).message}`);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-body text-muted-foreground">Status:</span>
        {isLoadingStatus ? (
          <Badge variant="secondary" className="text-xs font-body">
            Checking…
          </Badge>
        ) : (
          <XConnectionStatus hasToken={hasToken} isExpired={isExpired} />
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleConnect}
          disabled={!clientId || isLoadingClientId}
          className="gap-2"
          data-ocid="settings.connect_x_button"
        >
          <Twitter className="w-4 h-4" />
          {hasToken && !isExpired
            ? "Re-connect X / Twitter"
            : "Connect X / Twitter"}
        </Button>

        {hasToken && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-smooth"
                disabled={disconnectX.isPending}
                data-ocid="settings.disconnect_x_open_modal_button"
              >
                <X className="w-4 h-4" />
                {disconnectX.isPending
                  ? "Disconnecting…"
                  : "Disconnect X / Twitter"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent data-ocid="settings.disconnect_x_dialog">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">
                  Disconnect X / Twitter?
                </AlertDialogTitle>
                <AlertDialogDescription className="font-body">
                  Your stored OAuth tokens will be permanently deleted. You will
                  need to reconnect and authorize the app again to enable
                  automatic tweet posting on lesson completion.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className="font-body"
                  data-ocid="settings.disconnect_x_cancel_button"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-body"
                  data-ocid="settings.disconnect_x_confirm_button"
                >
                  Yes, disconnect
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {connectError && (
        <p
          className="text-xs text-destructive font-body flex items-start gap-1.5"
          data-ocid="settings.connect_x_error_state"
        >
          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
          {connectError}
        </p>
      )}

      {!clientId && !connectError && (
        <p
          className="text-xs text-muted-foreground font-body"
          data-ocid="settings.connect_x_warning"
        >
          Save your X Client ID above before connecting.
        </p>
      )}

      {disconnectX.isError && (
        <p
          className="text-xs text-destructive font-body"
          data-ocid="settings.disconnect_x_error_state"
        >
          {(disconnectX.error as Error).message}
        </p>
      )}
    </div>
  );
}

// ─── Account Section ──────────────────────────────────────────────────────────
function AccountSection() {
  const { principalText, logout } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/40 border border-border">
        <User className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide font-body mb-1">
            Internet Identity Principal
          </p>
          <p
            className="text-sm font-mono text-foreground break-all"
            data-ocid="settings.principal_display"
          >
            {principalText ?? "—"}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        onClick={logout}
        className="font-body"
        data-ocid="settings.logout_button"
      >
        Sign out
      </Button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  return (
    <div
      className="max-w-3xl mx-auto px-4 sm:px-6 py-10"
      data-ocid="settings.page"
    >
      <header className="mb-2">
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground font-body text-sm">
          Manage your account and integrations.
        </p>
      </header>

      <Separator className="my-6" />

      <SettingsSection
        title="Account"
        description="Your Internet Identity principal and session management."
      >
        <AccountSection />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="X / Twitter Integration"
        description="Configure your X developer app Client ID and authorize CatFinity to post tweets when you complete lessons."
      >
        <ClientIdField />
        <div className="pt-2">
          <Label className="text-sm font-body font-medium">Connection</Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3 font-body">
            Uses OAuth 2.0 PKCE (Native App, no client secret). Tokens are
            stored per-principal on the Internet Computer canister.
          </p>
          <XConnectionSection />
        </div>
      </SettingsSection>
    </div>
  );
}
