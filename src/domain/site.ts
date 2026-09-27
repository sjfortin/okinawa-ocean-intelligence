export const activityKinds = ["snorkel", "shore_dive", "boat_dive"] as const;
export type ActivityKind = (typeof activityKinds)[number];

export type VerificationStatus = "verified" | "needs_verification" | "deprecated";

export interface SourceRef {
  sourceId: string;
  sourceName: string;
  canonicalUrl: string;
  retrievedAt: string;
  locator: string;
}

export interface ProvenancedFact<T> {
  value: T;
  status: VerificationStatus;
  source: SourceRef;
  note?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SiteRule {
  id: string;
  kind:
    | "avoid_tide_phase"
    | "prefer_tide_phase"
    | "maximum_wave_height"
    | "maximum_wind_speed"
    | "minimum_visibility"
    | "advisory";
  effect: "hard_gate" | "penalty" | "preference" | "information";
  value: string | number;
  unit?: string;
  rationale: string;
  provenance: SourceRef;
  verificationStatus: VerificationStatus;
}

export interface Site {
  id: string;
  slug: string;
  name: string;
  summary: string;
  coordinates: ProvenancedFact<Coordinates> | null;
  difficulty: ProvenancedFact<number>;
  activities: ActivityKind[];
  accessNotes: ProvenancedFact<string>;
  hazards: ProvenancedFact<string[]>;
  marineLife: ProvenancedFact<string[]>;
  visibilityTypicalMeters: ProvenancedFact<{ min: number; max: number }> | null;
  rules: SiteRule[];
  catalogStatus: VerificationStatus;
}

