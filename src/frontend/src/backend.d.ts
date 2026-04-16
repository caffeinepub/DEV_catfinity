import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface HttpTransformArgs {
    context: Uint8Array;
    response: HttpResponse;
}
export type TweetResult = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface TokenStatus {
    isExpired: boolean;
    hasRefreshToken: boolean;
    hasToken: boolean;
}
export interface HttpResponse {
    status: bigint;
    body: Uint8Array;
    headers: Array<HttpHeader>;
}
export type TokenExchangeResult = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface CompletedLesson {
    lessonId: string;
    completedAt: bigint;
}
export interface HttpHeader {
    value: string;
    name: string;
}
export interface backendInterface {
    disconnectX(): Promise<void>;
    exchangeToken(code: string, codeVerifier: string, redirectUri: string): Promise<TokenExchangeResult>;
    /**
     * / Get the global X (Twitter) OAuth 2.0 Client ID.
     */
    getClientId(): Promise<string | null>;
    getProgress(): Promise<Array<CompletedLesson>>;
    getTokenStatus(): Promise<TokenStatus>;
    markComplete(lessonId: string): Promise<void>;
    postTweet(lessonId: string, lessonTitle: string): Promise<TweetResult>;
    resetProgress(): Promise<void>;
    /**
     * / Set the global X (Twitter) OAuth 2.0 Client ID.
     */
    setClientId(id: string): Promise<void>;
    storeTokens(accessToken: string, refreshToken: string, expiresAt: bigint): Promise<void>;
    transformTokenResponse(args: HttpTransformArgs): Promise<HttpResponse>;
}
