export const dashboardSites = {
  "kadena-north": { name: "Kadena North Wall", area: "Kadena town", jmaAreaCode: "4732500" },
  "sunabe-seawall": { name: "Sunabe Seawall", area: "Chatan town", jmaAreaCode: "4732600" },
};

export function isDashboardSite(slug: unknown): slug is keyof typeof dashboardSites {
  return typeof slug === "string" && Object.hasOwn(dashboardSites, slug);
}

export interface PlanningReference {
  id: string;
  title: string;
  url: string;
  category: "alerts" | "tides" | "observations";
  description: string;
  coverage: string;
  reviewedOn: string;
}

/** Reference discovery is not a retrieval of current conditions. */
export const planningReferences: PlanningReference[] = [
    {
      id: "kadena-weather", title: "Kadena sea conditions",
      url: "https://www.kadena.af.mil/Agencies/Local-Weather/html/",
      category: "alerts", description: "Check the west-coast condition and its issue time before leaving.",
      coverage: "Regional advisory · not an entry-point observation", reviewedOn: "2026-10-25",
    },
    {
      id: "jma-warnings", title: "JMA weather warnings",
      url: "https://www.jma.go.jp/bosai/map.html#contents=warning&area_type=offices&area_code=471000&lang=en",
      category: "alerts", description: "Check Okinawa warnings, including high waves, thunderstorms and storm surge.",
      coverage: "Official warnings · select your local area", reviewedOn: "2026-10-25",
    },
    {
      id: "jma-tsunami", title: "JMA tsunami alerts",
      url: "https://www.jma.go.jp/bosai/map.html#contents=tsunami&lang=en",
      category: "alerts", description: "Check current tsunami warnings and advisories before approaching the coast.",
      coverage: "Official alerts · not monitored by this app", reviewedOn: "2026-10-25",
    },
    {
      id: "jma-naha-tides", title: "Naha tide table",
      url: "https://www.data.jma.go.jp/kaiyou/db/tide/suisan/suisan.php?stn=NH",
      category: "tides", description: "Predicted high and low water at Naha. Check the date and height datum.",
      coverage: "Nearby reference station · no site-specific tide or current prediction", reviewedOn: "2026-10-25",
    },
    {
      id: "nowphas", title: "NOWPHAS wave observations",
      url: "https://www.mlit.go.jp/kowan/nowphas/index_eng.html",
      category: "observations", description: "Open the regional map to inspect available wave measurements and timestamps.",
      coverage: "Coastal stations · coverage and distance from the entry vary", reviewedOn: "2026-10-25",
    },
];
