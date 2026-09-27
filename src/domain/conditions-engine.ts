import type {
  AssessmentInput,
  AssessmentReason,
  ConditionsAssessment,
  NormalizedConditions,
} from "./conditions";

export const CONDITIONS_ENGINE_VERSION = "0.1.0";

const scoredFields: (keyof NormalizedConditions)[] = [
  "windSpeedKph",
  "windGustKph",
  "waveHeightM",
  "wavePeriodS",
  "swellHeightM",
  "seaLevelHeightMslM",
  "oceanCurrentVelocityKph",
  "visibilityM",
];

function compareMaximum(actual: number | null, maximum: number): "pass" | "fail" | "unknown" {
  if (actual === null) return "unknown";
  return actual <= maximum ? "pass" : "fail";
}

export function assessConditions(input: AssessmentInput): ConditionsAssessment {
  const reasons: AssessmentReason[] = [];
  let score = 100;
  let gated = false;

  for (const rule of input.rules) {
    let result: "pass" | "fail" | "unknown" = "unknown";

    if (rule.kind === "maximum_wave_height" && typeof rule.value === "number") {
      result = compareMaximum(input.conditions.waveHeightM, rule.value);
    }
    if (rule.kind === "maximum_wind_speed" && typeof rule.value === "number") {
      result = compareMaximum(input.conditions.windSpeedKph, rule.value);
    }
    if (rule.kind === "minimum_visibility" && typeof rule.value === "number") {
      const actual = input.conditions.visibilityM;
      result = actual === null ? "unknown" : actual >= rule.value ? "pass" : "fail";
    }

    if (result === "fail") {
      const isGate = rule.effect === "hard_gate";
      const points = isGate ? -100 : -25;
      score += points;
      gated ||= isGate;
      reasons.push({
        code: `rule.${rule.kind}.failed`,
        label: rule.rationale,
        impact: isGate ? "gate" : "negative",
        points,
        ruleId: rule.id,
      });
    } else if (result === "unknown" && rule.effect !== "information") {
      reasons.push({
        code: `rule.${rule.kind}.unknown`,
        label: `Not enough normalized data to evaluate: ${rule.rationale}`,
        impact: "neutral",
        points: 0,
        ruleId: rule.id,
      });
    }
  }

  const availableFields = scoredFields.filter((field) => input.conditions[field] !== null).length;
  const dataCompleteness = availableFields / scoredFields.length;
  if (dataCompleteness < 0.5) {
    score -= 15;
    reasons.push({
      code: "data.incomplete",
      label: "Less than half of the expected condition fields are available.",
      impact: "negative",
      points: -15,
    });
  }

  score = Math.max(0, Math.min(100, score));
  const grade =
    dataCompleteness === 0
      ? "unavailable"
      : gated || score < 50
        ? "poor"
        : score < 75
          ? "mixed"
          : "favorable";

  return {
    score,
    grade,
    gated,
    dataCompleteness,
    reasons,
    engineVersion: CONDITIONS_ENGINE_VERSION,
    evaluatedAt: input.evaluatedAt ?? new Date().toISOString(),
  };
}

