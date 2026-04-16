import type { backendInterface } from "../backend";

export const mockBackend: backendInterface = {
  disconnectX: async () => undefined,
  exchangeToken: async (_code, _codeVerifier, _redirectUri) => ({
    __kind__: "ok",
    ok: "access_token_mock",
  }),
  getClientId: async () => "mock-client-id-12345",
  getProgress: async () => [
    {
      lessonId: "lesson-1-introduction",
      completedAt: BigInt(1713200000000000000),
    },
  ],
  getTokenStatus: async () => ({
    isExpired: false,
    hasRefreshToken: true,
    hasToken: true,
  }),
  markComplete: async (_lessonId) => undefined,
  postTweet: async (_lessonId, _lessonTitle) => ({
    __kind__: "ok",
    ok: "tweet_id_mock_12345",
  }),
  resetProgress: async () => undefined,
  setClientId: async (_id) => undefined,
  storeTokens: async (_accessToken, _refreshToken, _expiresAt) => undefined,
};
