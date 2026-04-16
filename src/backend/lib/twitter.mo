// lib/twitter.mo — domain logic for Twitter/X OAuth tokens and tweet posting
import Map "mo:core/Map";
import Time "mo:core/Time";
import Types "../types/twitter";

module {
  public type TokenMap = Map.Map<Principal, Types.OAuthTokens>;

  /// Store OAuth tokens for the given principal.
  public func storeTokens(
    tokenMap : TokenMap,
    caller : Principal,
    accessToken : Text,
    refreshToken : Text,
    expiresAt : Int,
  ) {
    tokenMap.add(caller, { accessToken; refreshToken; expiresAt });
  };

  /// Get token status for the given principal.
  public func getTokenStatus(
    tokenMap : TokenMap,
    caller : Principal,
  ) : Types.TokenStatus {
    switch (tokenMap.get(caller)) {
      case (?tokens) {
        {
          hasToken = true;
          isExpired = isExpired(tokens, Time.now());
          hasRefreshToken = tokens.refreshToken != "";
        };
      };
      case null {
        { hasToken = false; isExpired = false; hasRefreshToken = false };
      };
    };
  };

  /// Remove stored tokens for the given principal (disconnect X).
  public func disconnectX(
    tokenMap : TokenMap,
    caller : Principal,
  ) {
    tokenMap.remove(caller);
  };

  /// Get raw tokens for the given principal (used internally for API calls).
  public func getTokens(
    tokenMap : TokenMap,
    caller : Principal,
  ) : ?Types.OAuthTokens {
    tokenMap.get(caller);
  };

  /// Check whether the access token is expired at a given time.
  /// Adds a 60-second buffer to account for clock skew.
  public func isExpired(tokens : Types.OAuthTokens, now : Int) : Bool {
    // expiresAt is in nanoseconds (from Time.now())
    // Add 60-second buffer (60_000_000_000 nanoseconds)
    now >= tokens.expiresAt - 60_000_000_000;
  };
};
