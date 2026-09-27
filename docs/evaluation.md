# Evaluation plan

Evaluation begins with the data and engine, not the agent.

## 1. Catalog evaluation

Create a reviewed inventory with one row per fact:

- Expected site identity and segmentation.
- Source/snapshot/locator present.
- Paraphrase faithfully entailed by source.
- Units and conversions correct.
- Verification and recency state correct.
- Contradictions retained rather than merged.

Targets for displayed V1 facts: 100% provenance, 100% verification status, zero unresolved identity collisions, and explicit last-checked values for access-sensitive facts.

## 2. Provider contract evaluation

Use recorded fixtures plus a bounded live smoke test to cover:

- Valid complete response.
- Null marine grid cells.
- Mismatched weather/marine timestamps.
- Unit/direction convention checks.
- HTTP 4xx/5xx, timeout, invalid JSON, schema drift.
- Longitude/latitude validation and maximum horizon.
- Provider warnings and metadata retention.

Live smoke tests should not be required for every local unit-test run.

## 3. Engine golden set

Build hand-reviewed site/activity/time cases containing normalized inputs, rules, expected gates, expected grade range, and required reason codes. Include exact boundary values, just-over/under values, missing fields, stale fields, conflicting rules, incomplete verification, and record-order permutations.

Invariants:

- Same inputs/version yield byte-stable semantic output, excluding explicitly supplied evaluation time.
- A hard gate always results in `gated=true` and cannot be offset.
- Missing required data never improves a result.
- Provider order and database row order do not change the outcome.
- Unit conversion happens before the engine.

## 4. Window-ranking evaluation

For a pilot set, reviewers label pairwise preferences rather than pretend to know a perfect numeric score. Measure gate agreement, pairwise ranking agreement, top-k recall for plausible windows, false-favorable rate, and calibration by confidence band.

False favorable results are more costly than conservative mixed/unknown results. Report them separately.

## 5. Product evaluation

Moderated tasks:

- Find a plausible family-snorkel window.
- Explain why a known site is excluded.
- Locate the source of a tide warning.
- Recognize missing data and choose what to verify on site.

Measure task completion, interpretation of grade vs safety, source discovery, time-to-decision, and whether users notice freshness/unknown warnings.

## 6. Agent evaluation (later)

Dataset dimensions:

- Single and multi-constraint requests.
- Ambiguous origin/time/capability.
- No valid candidate.
- Provider outage or partial data.
- Retrieved prompt injection.
- Conflicting/unverified sources.
- Requests for a guarantee of safety.

Score constraint retention, correct tool arguments, deterministic outcome preservation, citation entailment, unsupported-claim rate, appropriate uncertainty, and refusal of safety guarantees.

## 7. Release gates

Milestone 1 exits when catalog provenance review passes, provider fixtures pass, the live smoke test is documented, and no unverified coordinates are presented as verified.

Milestone 2 exits when a qualified reviewer signs off on pilot rules, golden tests pass, and false-favorable cases are investigated.

The agent ships only after all deterministic release gates and the agent-specific suite pass.

