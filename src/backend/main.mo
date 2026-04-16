// main.mo — composition root for CatFinity backend
import Map "mo:core/Map";
import ProgressLib "lib/progress";
import TwitterLib "lib/twitter";
import ProgressApi "mixins/progress-api";
import TwitterApi "mixins/twitter-api";



actor {
  // --- Persistent state (enhanced orthogonal persistence) ---
  // All let/var bindings in this actor are automatically persisted across
  // upgrades by the --default-persistent-actors compiler flag. Map.empty()
  // runs only on first canister install; subsequent upgrades restore the
  // saved state from stable memory without re-initialising.

  // Per-principal lesson progress: Principal -> List<CompletedLesson>
  let progressMap : ProgressLib.ProgressMap = Map.empty();

  // Per-principal OAuth tokens: Principal -> OAuthTokens
  let tokenMap : TwitterLib.TokenMap = Map.empty();

  // Global X (Twitter) OAuth 2.0 Client ID — single value shared across all users.
  var xClientId : ?Text = null;

  // --- HTTP outcall transform for OAuth token endpoint ---
  // Strips all non-deterministic headers so ICP replicas reach consensus.
  type HttpHeader = { name : Text; value : Text };
  type HttpResponse = { status : Nat; headers : [HttpHeader]; body : Blob };
  type HttpTransformArgs = { response : HttpResponse; context : Blob };

  public shared query func transformTokenResponse(args : HttpTransformArgs) : async HttpResponse {
    { args.response with headers = [] };
  };

  // --- Mixin includes ---
  include ProgressApi(progressMap);
  include TwitterApi(tokenMap, func() = xClientId, transformTokenResponse);

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
