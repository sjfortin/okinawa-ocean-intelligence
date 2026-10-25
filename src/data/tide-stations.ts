import type { TideStation } from "@/domain/tides";

export const nahaTideStation: TideStation = {
  id: "NH", name: "Naha", latitude: 26 + 13 / 60, longitude: 127 + 40 / 60,
  sourceUrl: "https://www.data.jma.go.jp/kaiyou/db/tide/suisan/suisan.php?stn=NH",
  datum: "JMA Naha tide-table datum",
};
// TODO: verify North Wall time/height offsets with an authoritative local source.
// This mapping selects a nearby reference, not a validated prediction at the entry.
export const siteTideStations: Record<string, TideStation> = { "kadena-north": nahaTideStation };
