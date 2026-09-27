# ADR 0003: Normalize external APIs behind typed adapters

- Status: Accepted
- Date: 2026-09-27

## Context

Weather and marine providers differ in field names, units, direction conventions, timestamps, grids, and failure behavior. Letting these shapes reach UI or engine code would make provider changes risky and scoring inconsistent.

## Decision

Each provider implements a typed adapter, validates responses at runtime, and emits the common `NormalizedConditions` contract. Normalization happens before storage/assessment. Preserve provider-run metadata and raw-response hashes/locators. Missing values stay null. Join series by timestamp, never assumed index alignment.

## Consequences

- Providers can be replaced or compared without rewriting the domain.
- Schema drift fails visibly at the boundary.
- Adapter fixtures must verify units and semantics.
- Some provider-specific metadata remains available only through provenance/run records.

