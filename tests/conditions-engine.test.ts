import { describe, expect, it } from "vitest";
import { assessConditions } from "@/domain/conditions-engine";
import type { NormalizedConditions } from "@/domain/conditions";
import type { SiteRule } from "@/domain/site";

const conditions: NormalizedConditions = {
  validAt: "2026-09-27T09:00",
  latitude: 26.3,
  longitude: 127.75,
  airTemperatureC: 28,
  precipitationMm: 0,
  visibilityM: 20_000,
  windSpeedKph: 12,
  windDirectionDeg: 20,
  windGustKph: 18,
  waveHeightM: 0.4,
  waveDirectionDeg: 300,
  wavePeriodS: 8,
  swellHeightM: 0.3,
  swellDirectionDeg: 300,
  seaLevelHeightMslM: 0.2,
  seaSurfaceTemperatureC: 27,
  oceanCurrentVelocityKph: 0.5,
  oceanCurrentDirectionDeg: 45,
  providerRunIds: ["run-1"],
};

const waveRule: SiteRule = {
  id: "test-wave",
  kind: "maximum_wave_height",
  effect: "hard_gate",
  value: 0.6,
  unit: "m",
  rationale: "Wave height must remain below the local threshold.",
  provenance: {
    sourceId: "test",
    sourceName: "Test",
    canonicalUrl: "https://example.com",
    retrievedAt: "2026-09-27T00:00:00Z",
    locator: "test",
  },
  verificationStatus: "verified",
};

describe("assessConditions", () => {
  it("returns a favorable deterministic score when hard thresholds pass", () => {
    const assessment = assessConditions({
      activity: "snorkel",
      conditions,
      rules: [waveRule],
      evaluatedAt: "2026-09-27T00:00:00Z",
    });
    expect(assessment).toMatchObject({ score: 100, grade: "favorable", gated: false });
  });

  it("hard-gates the assessment when a verified threshold fails", () => {
    const assessment = assessConditions({
      activity: "shore_dive",
      conditions: { ...conditions, waveHeightM: 0.8 },
      rules: [waveRule],
      evaluatedAt: "2026-09-27T00:00:00Z",
    });
    expect(assessment).toMatchObject({ score: 0, grade: "poor", gated: true });
    expect(assessment.reasons[0]?.code).toBe("rule.maximum_wave_height.failed");
  });
});
