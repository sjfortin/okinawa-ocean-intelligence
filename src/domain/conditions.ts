import type { ActivityKind, SiteRule } from "./site";

export interface NormalizedConditions {
  validAt: string;
  latitude: number;
  longitude: number;
  airTemperatureC: number | null;
  precipitationMm: number | null;
  visibilityM: number | null;
  windSpeedKph: number | null;
  windDirectionDeg: number | null;
  windGustKph: number | null;
  waveHeightM: number | null;
  waveDirectionDeg: number | null;
  wavePeriodS: number | null;
  swellHeightM: number | null;
  swellDirectionDeg: number | null;
  seaLevelHeightMslM: number | null;
  seaSurfaceTemperatureC: number | null;
  oceanCurrentVelocityKph: number | null;
  oceanCurrentDirectionDeg: number | null;
  providerRunIds: string[];
}

export interface AssessmentReason {
  code: string;
  label: string;
  impact: "gate" | "negative" | "positive" | "neutral";
  points: number;
  ruleId?: string;
}

export interface ConditionsAssessment {
  score: number;
  grade: "favorable" | "mixed" | "poor" | "unavailable";
  gated: boolean;
  dataCompleteness: number;
  reasons: AssessmentReason[];
  engineVersion: string;
  evaluatedAt: string;
}

export interface AssessmentInput {
  activity: ActivityKind;
  conditions: NormalizedConditions;
  rules: SiteRule[];
  evaluatedAt?: string;
}

