# Architecture

## Shape of the system

The system has four deliberately separated layers:

1. **Evidence:** sources, immutable snapshots, field-level facts, verification, and supersession.
2. **Conditions:** provider calls, raw response references, normalized time series, and freshness.
3. **Decision:** versioned deterministic rules, gates, component scores, reasons, and window ranking.
4. **Experience:** Next.js pages/APIs and, later, a bounded natural-language planner.

The dependency direction is inward: UI and providers depend on domain contracts. The domain does not import Next.js, database, or provider types.

## Runtime flow

### Curated data

1. Register a source and usage notes.
2. Retrieve and hash a snapshot; store a private locator if full storage is allowed.
3. Extract short structured facts with exact source locators.
4. Review facts and site identity separately.
5. Publish only verified/current fields; keep contradictions visible.

### Forecast data

1. Request weather and marine values for a coordinate.
2. Assign provider run IDs and retain request parameters and response hashes.
3. Validate the response at runtime.
4. Verify returned units and join by UTC instant.
5. When a database is configured, atomically persist a forecast batch, successful provider runs, and hourly records with every contributing provider run ID.
6. Mark missing fields as null and attach warnings.

### Assessment

1. Load the site, activity, active rules, and normalized forecast hour.
2. Check data freshness/completeness.
3. Apply hard gates, then weighted/penalty rules.
4. Persist the score, grade, reasons, exact inputs, rules, and engine version.
5. Serve precomputed or on-demand windows.

## Code map

- `src/app`: pages and HTTP boundaries.
- `src/components`: presentation components.
- `src/domain`: stable provider-independent types and pure engine code.
- `src/providers`: external API adapters and runtime schemas.
- `src/data`: temporary Milestone 1 seed records.
- `src/server/db`: database client and migrations.
- `tests`: pure domain and adapter contract tests.

The seed array is not the long-term database. It makes the first local build useful before curation tooling is complete.

## Storage model

PostgreSQL is authoritative. PostGIS provides point/radius queries and can later model coast/exposure sectors. pgvector is installed but unused in Milestone 1; its reserved `knowledge_chunks` table avoids making embeddings a prerequisite.

Key chains:

- `source → source_snapshot → site_fact → site_condition_rule`
- `provider_run → condition_forecast → condition_assessment`
- `forecast_batch → forecast_batch_runs → provider_run`, with `condition_forecast_runs` retaining the full dependency set for each merged hour
- `site + activity + valid_at + engine_version → condition_assessment`

Raw third-party content should usually remain out of the database; retain hashes, retrieval metadata, locators, and authorized storage pointers.

The initial `condition_forecasts.provider_run_id` column remains a primary-run anchor for compatibility. It is not the complete lineage of a merged weather/marine record; use `condition_forecast_runs` for that. Successful runs and forecast batches are immutable inserts. Each fresh retrieval receives new run and batch IDs. A repeated save of the same run IDs fails and rolls back instead of overwriting history.

Both live forecast endpoints use the shared forecast service. With no `DATABASE_URL`, they keep the database-free preview behavior. With a configured database, they return `forecastId` only after the transaction commits; storage failures return HTTP 503. `GET /api/forecasts/:id` reads the saved batch without contacting a provider and labels it `archived: true`; it makes no freshness claim. Unknown IDs return 404, malformed IDs return 400, and unconfigured/unavailable storage returns 503.

Only successful, validated pairs are persisted currently. TODO: add durable started/failed run lifecycle records and response status/error summaries before operational ingestion jobs are introduced. No automatic retries, deduplication, retention policy, or cached fallback is implemented yet.

## Failure behavior

- One failed Open-Meteo half currently fails the combined request; it never returns a falsely complete forecast.
- Invalid response shapes produce a provider error, not partial zeros.
- Missing normalized data lowers completeness and can make an assessment unavailable.
- Stale or failed access verification does not silently remain current.
- Agent failure affects only explanation, never underlying assessments.

## Caching and jobs

Planned ingestion jobs should deduplicate by request/location/model window and use provider-aware TTLs. HTTP cache headers can be added after provider terms and update cadence are verified. Job retries must preserve one logical run ID or explicitly link attempts.

## Security and privacy

- Provider credentials, if later required, stay server-side.
- Validate query coordinates, date ranges, and bounded forecast days.
- Do not log precise user origins by default.
- Treat retrieved source text and user observations as untrusted data.
- Rate-limit costly planning endpoints before public release.

## Deployment posture

The app is a standard Next.js service plus PostgreSQL. Initial deployment can colocate web and scheduled jobs, but ingestion should later have explicit ownership and locks. Database backups must include provenance and assessment traces. No agent infrastructure is required for Milestones 1–3.

## Architecture TODOs

- Add Drizzle schema/query modules after the SQL model survives the first curation pass.
- Run the opt-in PostgreSQL integration suite against the deployment database version; offline tests do not prove transaction rollback in a real server.
- Choose a background job mechanism based on deployment target.
- Define cache and retention policies from verified provider terms.
- Add an internal curation/review surface rather than editing seeds by hand.
