import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { TokenStatus } from "../types";

interface BackendActor {
  getTokenStatus: () => Promise<{
    hasToken: boolean;
    isExpired: boolean;
    hasRefreshToken: boolean;
  }>;
  exchangeToken: (
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ) => Promise<{ ok: string } | { err: string }>;
  disconnectX: () => Promise<void>;
  getClientId: () => Promise<[] | [string]>;
  setClientId: (id: string) => Promise<void>;
}

function asActor(actor: unknown): BackendActor {
  return actor as BackendActor;
}

export function useTokenStatus() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<TokenStatus>({
    queryKey: ["tokenStatus"],
    queryFn: async () => {
      if (!actor)
        return { hasToken: false, isExpired: false, hasRefreshToken: false };
      const status = await asActor(actor).getTokenStatus();
      return {
        hasToken: status.hasToken,
        isExpired: status.isExpired,
        hasRefreshToken: status.hasRefreshToken,
      };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60_000,
  });
}

export function useExchangeToken() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      codeVerifier,
      redirectUri,
    }: {
      code: string;
      codeVerifier: string;
      redirectUri: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      console.log("[OAuth] Exchanging code for tokens...");
      const result = await asActor(actor).exchangeToken(
        code,
        codeVerifier,
        redirectUri,
      );
      if ("ok" in result) {
        console.log("[OAuth] Token exchange successful");
        return { success: true, message: result.ok };
      }
      console.error("[OAuth] Token exchange failed:", result.err);
      throw new Error(result.err);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokenStatus"] });
    },
  });
}

export function useDisconnectX() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await asActor(actor).disconnectX();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokenStatus"] });
    },
  });
}

export function useClientId() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<string | null>({
    queryKey: ["clientId"],
    queryFn: async () => {
      if (!actor) return null;
      const result = await asActor(actor).getClientId();
      return (result.length > 0 ? result[0] : null) as string | null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetClientId() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      if (!actor) throw new Error("Actor not available");
      await asActor(actor).setClientId(clientId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientId"] });
    },
  });
}
