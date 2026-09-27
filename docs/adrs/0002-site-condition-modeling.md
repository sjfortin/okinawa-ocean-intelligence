# ADR 0002: Model conditions as site- and activity-specific rules

- Status: Accepted
- Date: 2026-09-27

## Context

The same regional forecast can create different entry conditions at sites with different orientation, reef form, currents, access, and tide response. Snorkeling and shore diving also have different constraints. A single Okinawa-wide “good/bad” formula would hide this.

## Decision

Represent site knowledge as versioned facts and activity-scoped rules with four effects: hard gate, penalty, preference, and information. Rules reference provenance, verification state, explicit parameters, and engine compatibility. Directional exposure and tide-phase rules remain disabled until the required geometry/data is validated.

## Consequences

- Assessments can explain exactly which local rules applied.
- Rules can differ by activity and later capability profile.
- Curation and expert review are first-class work.
- Narrative warnings cannot execute until transformed into a validated predicate.

