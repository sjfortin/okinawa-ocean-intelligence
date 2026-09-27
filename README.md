# Okinawa Ocean Intelligence

Local-first V1 scaffold for answering one practical question: **where and when should I get in the water?**

The product combines a curated Okinawa snorkel/dive-site catalog with normalized weather and marine forecasts, then evaluates each forecast against explicit site rules. It is planning support, not a safety certification.

## What exists now

- Next.js and TypeScript web app with a visible starter catalog.
- Provenance-carrying domain model and seven MCCS-derived starter records, including Kadena North Seawall.
- Site detail pages with access notes, field-level sources, and explicit forecast availability.
- Kadena North regional forecast preview at a sourced, provisional North Steps point; 24 hours of weather/marine inputs in JST.
- Metadata-only MCCS source snapshots and a 15-heading verification queue.
- Typed Open-Meteo weather/marine adapter with runtime response validation.
- First deterministic scoring rules and tests.
- PostgreSQL schema for PostGIS, pgvector, sources, facts, forecasts, rules, and assessments.
- Product, architecture, provider, conditions-engine, agent, evaluation, and ADR documentation.

## Quick start

Requirements: Node.js 20.9+ (Node 22 recommended), npm, and Docker if you want the database.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The seed catalog renders without a database. To exercise the provider adapter:

Open `/sites/kadena-north` and select **Load forecast preview** to see the first integrated site forecast. Its location identity and access still require independent review. Other detail pages show a pending-location state. No database or environment file is needed for these pages.

```bash
curl "http://localhost:3000/api/forecast?latitude=26.34&longitude=127.75&forecastDays=2"
```

The example coordinate is only for testing the API path; it is not assigned to a catalog site.

`GET /api/sites/kadena-north/forecast` serves a two-day normalized forecast with the point's source and verification status. Unknown sites return 404, sites without a sourced point return 422, and provider failures return 502. Forecast timestamps use UTC instants and are displayed in Japan time. Scores and recommended entry windows are not enabled yet.

### Local database

```bash
npm run db:up
cp .env.example .env.local
npm run db:migrate
```

The container adds PostGIS and pgvector to PostgreSQL 17. The image package name is marked for verification when the base image changes.

### Quality checks

```bash
npm run typecheck
npm test
npm run build
```

Capture a fresh metadata-only MCCS source snapshot (no page body is stored):

```bash
npm run source:snapshot:mccs
```

## Architecture at a glance

```text
MCCS catalog + later sources          Open-Meteo weather + marine
              │                                  │
              ▼                                  ▼
   source snapshots → site facts       typed adapters → normalized hours
              │                                  │
              └──────────────┬───────────────────┘
                             ▼
                    deterministic engine
                  gates + scores + reasons
                             │
                             ▼
                   API / Next.js experience
                             │
                      later, bounded LLM
                    explanation + retrieval
```

Provider-specific data stops at `src/providers`. `src/domain` owns normalized facts and deterministic assessment types. PostgreSQL is the system of record; PostGIS supports proximity, and pgvector is reserved for later evidence retrieval rather than Milestone 1 logic.

## Four-week learning/build alignment

| Week | Learn | Build | Exit evidence |
|---|---|---|---|
| 1 | TypeScript domain modeling, relational provenance, basic geospatial concepts | Curated site schema, source snapshots, MCCS starter import | A reviewer can trace every displayed site claim to a source and verification state |
| 2 | HTTP adapters, schema validation, time series, API failure modes | Open-Meteo weather/marine adapters and normalized forecast storage | Fixture and live-contract checks prove units, time alignment, null handling, and warnings |
| 3 | Rules engines, scoring, uncertainty, evaluation design | Site-condition rules, hard gates, reasons, favorable-window query | Golden cases are deterministic, explainable, versioned, and insensitive to record order |
| 4 | Retrieval basics and grounded generation | Thin planning workflow and optional evidence-grounded explanation prototype | LLM is removable; no score, gate, or safety fact changes when it is disabled |

## Phased milestones

1. **Site catalog and forecast spine (current):** verified site identities/coordinates, MCCS provenance import, Open-Meteo normalization, persistence, and contract tests.
2. **Conditions engine:** validated local thresholds, tide-phase handling, exposure/orientation modeling, scoring, confidence, and time-window ranking.
3. **Planning experience:** map/list discovery, travel radius, activity/skill filters, window comparison, observation feedback, and source display.
4. **Bounded agent/RAG:** natural-language planning over trusted tools and cited evidence. No autonomous safety decision-making.

## Immediate next tasks

1. Review MCCS usage/licensing expectations and store a hashed source snapshot without republishing page bodies.
2. Enumerate all MCCS sites into a review queue; verify canonical names, activity flags, and stable locators.
3. Verify each site coordinate, access status, and legal restrictions with a second current source.
4. Add recorded Open-Meteo fixtures for an Okinawa offshore point; confirm missing coastal cells, units, timezone joins, rate limits, and attribution.
5. Decide whether `sea_level_height_msl` can support tide *phase* after local validation; never present it as chart datum or navigation data.
6. Persist provider runs and normalized hours, then add a site forecast endpoint.
7. Convene a qualified local reviewer before converting narrative warnings into numeric hard gates.

## Repository guide

- [`docs/product-spec.md`](docs/product-spec.md) — full V1 product and technical baseline
- [`docs/architecture.md`](docs/architecture.md) — boundaries, flows, deployment, and data model
- [`docs/data-sources.md`](docs/data-sources.md) — source registry, provenance, and verification backlog
- [`docs/conditions-engine.md`](docs/conditions-engine.md) — deterministic scoring contract
- [`docs/agent-design.md`](docs/agent-design.md) — later bounded-agent design
- [`docs/evaluation.md`](docs/evaluation.md) — product, data, engine, provider, and agent evaluation
- [`docs/adrs`](docs/adrs) — architectural decisions

## Important limitations

- The starter MCCS records are structured paraphrases reviewed on 2026-09-27, not a complete import.
- Site coordinates, current access, closures, and numeric thresholds are deliberately not asserted.
- Forecasts can be missing or wrong near complex coastlines. Ocean conditions can change faster than forecast refreshes.
- Users must check official warnings, on-site conditions, access restrictions, and their own capability before entry.
