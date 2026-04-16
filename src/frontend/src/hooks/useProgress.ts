import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { LessonProgress } from "../types";

interface BackendActor {
  getProgress: () => Promise<{ lessonId: string; completedAt: bigint }[]>;
  markComplete: (lessonId: string) => Promise<void>;
  resetProgress: () => Promise<void>;
  postTweet: (
    lessonId: string,
    lessonTitle: string,
  ) => Promise<{ ok: string } | { err: string }>;
}

function asActor(actor: unknown): BackendActor {
  return actor as BackendActor;
}

export function useProgress() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery<LessonProgress[]>({
    queryKey: ["progress"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await asActor(actor).getProgress();
      return raw.map((item) => ({
        lessonId: item.lessonId,
        completedAt: Number(item.completedAt),
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMarkComplete() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) => {
      if (!actor) throw new Error("Actor not available");
      await asActor(actor).markComplete(lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

export function useResetProgress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await asActor(actor).resetProgress();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
}

export function usePostTweet() {
  const { actor } = useActor(createActor);

  return useMutation({
    mutationFn: async ({
      lessonId,
      lessonTitle,
    }: {
      lessonId: string;
      lessonTitle: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await asActor(actor).postTweet(lessonId, lessonTitle);
      if ("ok" in result) {
        console.log("[Tweet] Posted successfully:", result.ok);
        return { success: true, message: result.ok };
      }
      console.warn("[Tweet] Post failed:", result.err);
      return { success: false, message: result.err };
    },
  });
}
