# Agent design — deferred and bounded

## Timing

Do not build the agent in Milestone 1. The useful prerequisite is a trustworthy site catalog, normalized provider data, deterministic assessments, and stable query APIs.

## Later role

The agent is a planning interface. It may:

- Extract explicit constraints from a user request.
- Ask for one material missing constraint.
- Call read-only site, assessment, window, distance, and evidence tools.
- Compare deterministic results.
- Explain reasons and cite selected evidence.
- State uncertainty and unavailable data.

It may not calculate or modify facts, scores, gates, units, tide phases, or safety thresholds. It may not declare an entry safe.

## Proposed tools

- `search_sites(activity, origin, radius, capability)`
- `get_site(site_id)`
- `get_site_assessments(site_id, activity, from, to)`
- `find_windows(origin, radius, activity, from, to, constraints)`
- `get_evidence(source_fact_ids)`
- `get_official_alerts(area, time)` once an authority is selected

Tool results should carry IDs, timestamps, confidence, warnings, and citation objects. The final answer must distinguish explicit user constraints from inferred preferences.

## Retrieval design

Prefer relational filters and fact IDs for structured site knowledge. Use embeddings only for longer approved evidence that cannot be effectively queried by fields. Retrieval chunks retain snapshot ID, site ID, content hash, locator, and verification status. Unverified/deprecated evidence is filtered or labeled.

pgvector is reserved in the schema but is not a reason to add RAG prematurely.

## Response policy

1. Repeat the activity, area, time, and capability assumptions.
2. Present deterministic candidates and exclusions.
3. Explain the strongest reasons with valid/fetched times.
4. Cite site facts and providers.
5. Surface unknowns and official/on-site checks.
6. Never use “safe”; use calibrated planning language.

## Guardrails

- Read-only tools for the user-facing agent.
- Structured outputs validated before rendering.
- Maximum time/radius and result bounds.
- Prompt-injection isolation for retrieved text.
- No hidden fallback to model knowledge for live conditions.
- A response is blocked or downgraded when required tool results fail.

## Evaluation gate before release

The agent is not released until it passes constraint retention, tool selection, citation entailment, no-invention, missing-data, hard-gate preservation, and adversarial retrieved-text tests. Disabling the model must leave every ranking and gate unchanged.

