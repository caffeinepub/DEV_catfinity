import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const {
    identity,
    login,
    clear,
    loginStatus,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
  } = useInternetIdentity();

  const isLoading = isInitializing || isLoggingIn;
  const principalText = identity?.getPrincipal().toText() ?? null;

  return {
    identity,
    isAuthenticated,
    isLoading,
    loginStatus,
    principalText,
    login,
    logout: clear,
  };
}
