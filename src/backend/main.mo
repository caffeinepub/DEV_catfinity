// main.mo — composition root for CatFinity backend
import Map "mo:core/Map";
import ProgressLib "lib/progress";
import TwitterLib "lib/twitter";
import ProgressApi "mixins/progress-api";
import TwitterApi "mixins/twitter-api";
import Migration "migration";

(with migration = Migration.run)
actor {
  // --- Stable state ---

  // Per-principal lesson progress: Principal -> List<CompletedLesson>
  let progressMap : ProgressLib.ProgressMap = Map.empty();

  // Per-principal OAuth tokens: Principal -> OAuthTokens
  let tokenMap : TwitterLib.TokenMap = Map.empty();

  // Global X (Twitter) OAuth 2.0 Client ID — single value shared across all users.
  var xClientId : ?Text = null;

  // --- Mixin includes ---
  include ProgressApi(progressMap);
  include TwitterApi(tokenMap, func() = xClientId);

  // --- Settings API (direct, needs write access to xClientId) ---

  /// Set the global X (Twitter) OAuth 2.0 Client ID.
  public shared func setClientId(id : Text) : async () {
    xClientId := ?id;
  };

  /// Get the global X (Twitter) OAuth 2.0 Client ID.
  public shared query func getClientId() : async ?Text {
    xClientId;
  };
};
