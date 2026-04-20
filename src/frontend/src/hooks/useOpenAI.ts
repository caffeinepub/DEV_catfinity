import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { QA, backendInterface } from "../backend";

export type { QA };

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetches the current user's OpenAI API key from the backend.
 * Returns null if not set. The key is per-principal and never exposed across users.
 */
export function useOpenAIKey() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<string | null>({
    queryKey: ["openAIKey"],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as unknown as backendInterface).getOpenAIKey();
    },
    enabled: !!actor && !isFetching,
  });
}

/**
 * Saves the user's OpenAI API key to the backend.
 */
export function useSetOpenAIKey() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      key: string,
    ): Promise<{ written: string; actor: backendInterface }> => {
      if (!actor) throw new Error("Actor not available");
      const typedActor = actor as unknown as backendInterface;
      await typedActor.setOpenAIKey(key);
      return { written: key, actor: typedActor };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["openAIKey"] });
    },
  });
}

/**
 * Submits a question to the OpenAI backend.
 * - lessonId: null for the landing-page global panel
 * - lessonName: null for the landing-page global panel
 */
export function useAskQuestion() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      lessonName,
      question,
    }: {
      lessonId: string | null;
      lessonName: string | null;
      question: string;
    }): Promise<string> => {
      if (!actor) throw new Error("Actor not available");
      const result = await (actor as unknown as backendInterface).askQuestion(
        lessonId,
        lessonName,
        question,
      );
      if (result.__kind__ === "ok") {
        return result.ok;
      }
      throw new Error(result.err);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["qaHistory", variables.lessonId],
      });
    },
  });
}

/**
 * Fetches the Q&A history for the current user.
 * - lessonId: null for the landing-page global panel
 * - lessonId: string for per-lesson panel
 */
export function useGetQAHistory(lessonId: string | null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<QA[]>({
    queryKey: ["qaHistory", lessonId],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as unknown as backendInterface).getQAHistory(lessonId);
    },
    enabled: !!actor && !isFetching,
  });
}
