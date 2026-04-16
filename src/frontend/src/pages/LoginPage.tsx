import { Button } from "@/components/ui/button";
import { BookOpen, Infinity as InfinityIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { login, isLoading } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="mb-6 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <InfinityIcon className="w-8 h-8 text-primary" />
      </div>
      <h1 className="font-display text-4xl font-semibold text-foreground mb-3 tracking-tight">
        CatFinity
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mb-2 font-body">
        A guided curriculum for (∞, 1)-category theory
      </p>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        Sign in with Internet Identity to track your lesson progress and unlock
        tweet-on-completion.
      </p>
      <Button
        size="lg"
        onClick={() => login()}
        disabled={isLoading}
        className="font-body"
        data-ocid="login.submit_button"
      >
        <BookOpen className="w-4 h-4 mr-2" />
        {isLoading ? "Signing in…" : "Sign in with Internet Identity"}
      </Button>
      <p className="text-xs text-muted-foreground mt-6 max-w-xs">
        Internet Identity is a decentralized authentication system that doesn't
        share your identity across services.
      </p>
    </div>
  );
}
