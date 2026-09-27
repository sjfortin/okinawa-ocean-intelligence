# ADR 0004: Treat provenance as first-class relational data

- Status: Accepted
- Date: 2026-09-27

## Context

Site access and hazards change, sources disagree, and curated narrative must be transformed into structured facts. A URL column on a site record cannot explain which source supported which field or preserve history.

## Decision

Model sources, immutable retrieval snapshots, field-level facts, locators, verification state, validity, and supersession. Rules reference their supporting facts. Forecasts reference provider runs; assessments reference forecast and rule IDs plus engine version. Store short structured paraphrases by default, not republished source bodies.

## Consequences

- Claims can be reviewed, corrected, and cited independently.
- Conflicts and stale facts remain auditable.
- Ingestion requires more records and review workflow.
- Licensing and storage policies can be applied per source/snapshot.

