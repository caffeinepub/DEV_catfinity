import { e as useQueryClient } from "./index-C0tN0U_T.js";
import { u as useActor, a as useQuery, c as createActor } from "./backend-C-R7NMV0.js";
import { d as useMutation } from "./useOpenAI-SYY3ZfFV.js";
function asActor(actor) {
  return actor;
}
function useTokenStatus() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["tokenStatus"],
    queryFn: async () => {
      if (!actor)
        return { hasToken: false, isExpired: false, hasRefreshToken: false };
      const status = await asActor(actor).getTokenStatus();
      return {
        hasToken: status.hasToken,
        isExpired: status.isExpired,
        hasRefreshToken: status.hasRefreshToken
      };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 6e4
  });
}
function useDisconnectX() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await asActor(actor).disconnectX();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokenStatus"] });
    }
  });
}
function useClientId() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["clientId"],
    queryFn: async () => {
      if (!actor) return null;
      return await asActor(actor).getClientId();
    },
    enabled: !!actor && !isFetching
  });
}
function useSetClientId() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (clientId) => {
      if (!actor) throw new Error("Actor not available");
      await asActor(actor).setClientId(clientId);
      return { written: clientId, actor: asActor(actor) };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientId"] });
    }
  });
}
export {
  useClientId as a,
  useSetClientId as b,
  useDisconnectX as c,
  useTokenStatus as u
};
