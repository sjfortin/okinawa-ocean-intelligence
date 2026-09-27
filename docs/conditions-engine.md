# Deterministic conditions engine

## Contract

The engine converts versioned site/activity rules plus one normalized forecast hour into an assessment. For identical inputs and engine version, output must be identical.

Output includes:

- Score from 0–100.
- Planning grade: `favorable`, `mixed`, `poor`, or `unavailable`.
- Hard-gated boolean.
- Data completeness.
- Ordered reason codes, labels, points, and rule IDs.
- Engine version, evaluated time, provider run IDs, and later exact forecast IDs.

Grades describe the model’s planning result, never safety.

## Rule taxonomy

- **Hard gate:** excludes the window for the specified activity/capability.
- **Penalty:** reduces score without exclusion.
- **Preference:** increases rank when satisfied.
- **Information:** displayed but does not change the score.

Initial kinds include maximum wave/wind, minimum visibility, avoided/preferred tide phase, and advisory. Narrative advisories do not execute until they have a tested predicate.

## Evaluation order

1. Validate types, units, timestamp, and provider freshness.
2. Calculate availability and completeness.
3. Apply access/closure and capability gates.
4. Apply site-specific sea-state/current/tide gates.
5. Calculate component scores.
6. Apply penalties/preferences.
7. Clamp score, derive grade, and create reasons.

Hard gates remain visible even if other components are favorable. Missing values never pass a hard gate by being treated as zero.

## Current implementation

Version `0.1.0` in `src/domain/conditions-engine.ts` implements numeric maximum wave/wind, minimum visibility, a completeness penalty, grade mapping, and reason traces. It is intentionally small.

The `prefer_tide_phase`, `avoid_tide_phase`, and narrative advisory seeds are stored but not executed. There is no trusted tide-phase input or validated threshold mapping yet.

## Planned component model

After local review, scores may be decomposed into:

- Sea state: wave/swell height, period, direction relative to exposure.
- Wind: sustained/gust and direction relative to the entry.
- Current/tide: forecast current plus validated tide phase rules.
- Weather/visibility: precipitation, atmospheric visibility, storm/alert signals.
- Access/entry: closure, entry exposure, walking/swim burden.
- Activity/capability: snorkel vs shore dive and conservative group constraints.

Weights must be versioned and justified against labeled cases. They must not create false precision; component bands may be better than fine-grained points.

## Tide and directional cautions

`sea_level_height_msl` is not chart-datum tide height and is not navigation-grade. A tide phase can only be derived after comparing local extrema/timing against an accepted reference. Direction rules must account for provider conventions and site exposure sectors.

The Maeda Point two-foot surf statement cannot automatically become `wave_height <= 0.61 m`: surf at the entry and modeled significant wave height are different measurements. The seed rule is therefore marked `needs_verification`.

## Confidence and missing data

The current completeness ratio counts eight expected fields. Later confidence should combine:

- Required-field coverage.
- Forecast age and horizon.
- Provider/model resolution and coastal representativeness.
- Rule/site verification status.
- Observation agreement where available.

Confidence is not a score multiplier by default; show it separately so a high score with weak evidence is not mistaken for a strong recommendation.

## Invariants

- No LLM input or output enters scoring.
- No unsourced site rule executes in production.
- Missing data is explicit.
- Hard gates cannot be offset by positive points.
- Every output is reproducible and traceable.
- A rules/engine change creates a new version and regression evaluation.

