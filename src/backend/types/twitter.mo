// types/twitter.mo — Twitter/X OAuth and tweet domain types
module {
  public type TokenStatus = {
    hasToken : Bool;
    isExpired : Bool;
    hasRefreshToken : Bool;
  };

  public type OAuthTokens = {
    accessToken : Text;
    refreshToken : Text;
    expiresAt : Int;
  };

  public type TweetResult = {
    #ok : Text;
    #err : Text;
  };

  public type TokenExchangeResult = {
    #ok : Text;
    #err : Text;
  };
};
