# ADR 0005: Use Open-Meteo for the Milestone 1 forecast spine

- Status: Accepted for Milestone 1; production suitability pending verification
- Date: 2026-09-27

## Context

The first milestone needs accessible weather and marine time series to prove provider normalization and site evaluation. The product needs wind, precipitation, visibility, waves, swell, sea temperature, sea-level signal, and currents without prematurely committing the architecture to one vendor.

## Decision

Implement Open-Meteo weather and marine adapters first. Request only defined hourly variables, validate them, join by timestamp, and attach provider-run IDs and warnings. Keep base URLs configurable. Do not use sea-level data for navigation or assume it is a validated local tide source.

## Alternatives considered

- Start with several providers: rejected because it broadens Milestone 1 before the normalized contract is tested.
- Bind directly to one provider response: rejected because it couples scoring and UI to external schema.
- Defer live data: rejected because provider failure modes are a core V1 risk.

## Consequences

- The local build can exercise real data with no AI dependency.
- Coastal coverage and terms remain launch blockers to verify.
- A second provider can later implement the same contract for redundancy/evaluation.
- Open-Meteo does not automatically become the production or sole provider.

