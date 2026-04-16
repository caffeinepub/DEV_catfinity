// migration.mo — explicit migration: drop `settings` Map, extract xClientId
//
// Old stable state had:
//   let settings : Map.Map<Text, Text>  (stored xClientId under key "xClientId")
// New stable state replaces it with:
//   var xClientId : ?Text
import Map "mo:core/Map";

module {
  // Inline types matching the old actor stable state (copied from .old/ dist)
  type OldActor = {
    settings : Map.Map<Text, Text>;
  };

  type NewActor = {
    var xClientId : ?Text;
  };

  public func run(old : OldActor) : NewActor {
    let xClientId : ?Text = old.settings.get("xClientId");
    { var xClientId };
  };
};
