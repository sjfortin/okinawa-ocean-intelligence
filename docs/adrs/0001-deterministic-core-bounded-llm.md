# ADR 0001: Deterministic core with a bounded LLM layer

- Status: Accepted
- Date: 2026-09-27

## Context

The product evaluates time-sensitive environmental inputs and site-specific hazards. Fluent probabilistic output is not an acceptable source of condition facts, thresholds, scores, or safety gates. Natural language is still useful for intent capture and explanation.

## Decision

All facts, normalization, gates, scoring, confidence, and ranking are deterministic and versioned. A later LLM may parse constraints, call read-only tools, retrieve evidence, and explain returned results. It cannot mutate, replace, or independently calculate a decision result.

## Consequences

- The product remains useful without an LLM.
- Decisions are reproducible and testable.
- Agent answers require tool success and citations.
- More explicit domain modeling is required before conversational polish.
- Milestone 1 contains no agent framework.

