# Okinawa Ocean Intelligence — V1 Product & Technical Specification

**Status:** Draft baseline  
**Version:** 0.3  
**Initial market:** Okinawa, Japan  
**Primary activities:** Snorkeling and shore diving  
**Source context:** Continued from the “Recommend Affordable Courses” product-design conversation. This document carries forward the recoverable decisions and marks unrecovered details for verification.

## 1. Product vision

Okinawa Ocean Intelligence is a real-time conditions and planning platform that helps snorkelers and divers answer:

> Where and when should I get in the water?

Generic forecasts describe a region. This product combines weather, marine forecasts, tides or sea-level signals, location-specific knowledge, historical observations, and later marine-life evidence to evaluate conditions at individual sites.

It must support quick checks such as “How is Sunabe this morning?” and constrained planning such as “Where within 45 minutes of Kadena might suit a family snorkeling tomorrow morning?”

The core principle is:

> Use deterministic computation for facts and conditions. Use AI only where reasoning, synthesis, and natural-language interaction add value.

AI may explain trusted results. It may not invent conditions, silently alter scores, or independently declare water entry safe.

## 2. V1 goals

V1 demonstrates that the system can:

1. Maintain structured knowledge about Okinawa snorkeling and shore-diving locations.
2. Preserve first-class provenance for each curated fact and site rule.
3. Retrieve current and forecast weather/marine conditions from typed providers.
4. Normalize provider data into a stable, provider-independent schema.
5. Evaluate conditions against site and activity characteristics with deterministic logic.
6. Produce a versioned score, hard-gate result, confidence/completeness measure, and human-readable reasons.
7. Identify promising upcoming time windows without representing them as safety guarantees.
8. Display relevant hazards, access notes, skill requirements, and source evidence.
9. Support later natural-language planning without making an LLM part of the factual computation path.

## 3. Non-goals for V1

- Certifying a site as safe or replacing training, judgment, a buddy, a guide, lifeguards, or official warnings.
- Emergency response, rescue dispatch, navigation, decompression planning, or medical advice.
- Fully automated scraping and publishing of third-party catalog text.
- Crowdsourced moderation, social feeds, bookings, payments, or a full dive log.
- Exact marine-life sighting prediction.
- Boat routing, offshore navigation, or dive-computer integration.
- A general autonomous agent or chat-first interface before the deterministic product works.

## 4. Users and jobs

### Primary users

- Local or visiting snorkeler choosing a shore site and time.
- Certified shore diver comparing known sites.
- Parent or group organizer applying conservative activity and capability constraints.

### Secondary users

- Instructor or guide checking planning inputs.
- Curator reviewing site facts, provenance, and outdated access details.
- Product operator investigating provider failures and engine decisions.

### Core jobs

- Check a known site for a chosen activity and time.
- Discover sites within a travel radius that match activity, capability, and conditions.
- Compare multiple windows at one or more sites.
- Understand why a site ranked well or poorly.
- See when data is stale, missing, uncertain, or contradicted.
- Verify where a claim came from.

## 5. Product principles

1. **Evidence before fluency.** A terse cited result beats an eloquent unsupported one.
2. **Site-specific over island-wide.** Exposure, entry, currents, reef form, and tide response matter.
3. **Rules are inspectable.** Each gate or adjustment has inputs, version, rationale, and provenance.
4. **Unknown is a result.** Missing coastal forecast data must reduce confidence, not become zero.
5. **Activity and capability matter.** A window can be plausible for an advanced dive and unsuitable for family snorkeling.
6. **Current access is separate from natural conditions.** Closures, parking, construction, and local restrictions require recency.
7. **No safety theater.** Avoid green “safe” badges. Use planning grades, reasons, and explicit limitations.

## 6. V1 user experience

### 6.1 Site catalog

List and detail views include:

- Canonical name and aliases.
- Verified map location and geographic region.
- Supported activities and MCCS difficulty level where available.
- Entry/exit and access notes with last-checked date.
- Typical depth/visibility only when sourced and unit-normalized.
- Hazards, tide guidance, current behavior, exposure, and applicable rules.
- Representative marine life as descriptive evidence, not a guarantee.
- Verification state and field-level sources.

### 6.2 Site conditions

For a selected activity and time, show:

- Planning grade and numeric score.
- Any hard gate prominently.
- Top positive and negative reasons.
- Data completeness, age, provider, and valid time.
- Wind, gust, wave, swell, current, precipitation, visibility, temperature, and tide/sea-level inputs where available.
- Site-specific warnings and provenance.
- A reminder to check official alerts and on-site conditions.

### 6.3 Window finder

Inputs:

- Origin or map area and travel-time/radius limit.
- Date/time range.
- Activity.
- User capability/group profile.
- Optional preferences: lower exposure, easier entry, marine-life interests, less walking.

Outputs:

- Ranked site/time windows with score, confidence, distance, and reasons.
- Explicit exclusions and their hard gates.
- A neutral “insufficient data” state.

Travel-time routing may initially be replaced by radius distance until a routing provider is selected.

## 7. Foundational site source: MCCS Tsunami Scuba

The MCCS/Tsunami Scuba Okinawa dive-sites catalog is the foundational curated source for the initial site database. It provides many fields otherwise requiring manual research: level, snorkel suitability, entry information, currents, tide guidance, visibility, hazards, depth context, marine life, and site warnings.

Examples confirmed in the 2026-09-27 review include:

- Sunabe Seawall: Level 1 / Snorkel; typically stable currents, with larger winter waves possible.
- Maeda Flats: Level 2 / Snorkel; walking at low tide and snorkeling at high tide are described.
- Maeda Point: Level 2 / Snorkel; MCCS warns against diving above a stated surf threshold.
- Junkyard: Level 1; currents are described as generally minimal beyond tidal rise/fall.
- Horseshoe Beach: Level 4; close-to-high-tide timing and high-surf/current warnings are stated.
- Hedo Point: Level 5; entry on an outgoing tide is explicitly warned against.

These are curated facts, not immutable truth. The ingestion workflow must capture retrieval time, source locator, short paraphrase, verification state, and supersession. Current coordinates, access, closures, and transformed numeric rules need independent verification. Do not store or republish entire page bodies unless usage rights are confirmed.

## 8. Data requirements

### 8.1 Site identity

- Stable internal ID, canonical name, aliases, slug.
- Point geometry with coordinate source and verification status.
- Region/locality and optional coastline/exposure sector.
- Activity support and capability/difficulty levels.

### 8.2 Curated facts

- Access, entry/exit, parking, facilities, depth, visibility, hazards, current/tide behavior, seasonal notes, marine life.
- Fact value, source snapshot, locator, retrieval date, validity interval, status, and superseded fact.
- Facts from different sources remain separate until reviewed; disagreement is not silently merged.

### 8.3 Site-condition model

- Coast orientation and exposure sectors.
- Activity-specific hard gates, penalties, preferences, and information rules.
- Threshold unit and rationale.
- Rule provenance and verification state.
- Version compatibility with the conditions engine.

### 8.4 Forecasts and observations

- Provider, run ID, request parameters, timestamps, response hash/status.
- Location, valid time, native and normalized units.
- Missing/null status; never coerce missing to zero.
- Weather: temperature, precipitation, visibility, wind speed/direction, gust.
- Marine: wave height/direction/period, swell height/direction, sea surface temperature, current velocity/direction, sea-level height.
- Later: official alerts, buoy/station observations, user observations with separate trust controls.

## 9. Provider plan

Milestone 1 uses Open-Meteo weather and marine APIs behind typed adapters. The adapter requests hourly values, validates runtime shapes, and emits normalized domain objects. Provider URLs and timeouts are configurable.

Important limitations:

- Offshore model grid cells may not represent shore breaks, reef channels, or local current acceleration.
- Marine and weather time axes must be joined by timestamp, not array position.
- `sea_level_height_msl` includes more than astronomical tide, references mean sea level rather than chart datum, and is not suitable for coastal navigation.
- Coverage, attribution, acceptable use, rate limits, refresh cadence, model selection, coastal null behavior, and commercial terms require verification before launch.

No provider value becomes a site rule automatically.

## 10. Deterministic conditions engine

Inputs are a site version, activity, user/group constraints, normalized time-series conditions, and engine version.

Evaluation order:

1. Validate timestamps, units, freshness, and required fields.
2. Apply availability/access constraints.
3. Evaluate sourced hard gates.
4. Calculate component scores for sea state, wind/exposure, currents/tide, weather/visibility, and entry/access.
5. Apply activity/capability adjustments.
6. Calculate data completeness and confidence.
7. Emit a bounded score, planning grade, gate state, reasons, applied rule IDs, and input forecast IDs.

V1 begins with simple transparent thresholds. Tide-phase and directional-exposure rules stay disabled until validated. A narrative warning such as “avoid high surf” is not automatically given an invented numeric threshold.

## 11. AI and agent boundary

The later agent can parse planning intent, call read-only tools, retrieve source evidence, compare deterministic assessments, and produce a cited explanation. It cannot:

- Alter source facts, provider data, gates, scores, or engine reasons.
- Infer missing conditions.
- Upgrade “unknown” into a favorable recommendation.
- Claim a site is safe.
- Hide failed constraints.

The first useful AI layer is a formatter and constraint-aware planner over existing APIs. Embeddings and RAG are postponed until the catalog, queries, and evaluation set justify them.

## 12. System architecture

- **Web:** Next.js App Router and TypeScript.
- **Domain:** provider-independent site, provenance, conditions, rule, and assessment types.
- **Providers:** runtime-validated adapters for Open-Meteo weather/marine; later adapters implement the same contract.
- **Storage:** PostgreSQL as system of record; PostGIS for proximity/exposure geometry; pgvector reserved for later evidence retrieval.
- **Jobs:** later scheduled ingestion and assessment materialization.
- **API:** sites, forecasts, assessments, windows, sources, and later planning tools.
- **Observability:** provider-run logs, source snapshot hashes, engine versions, latency/error metrics, and reproducible assessment traces.

## 13. API outline

Current scaffold:

- `GET /api/health`
- `GET /api/sites`
- `GET /api/forecast?latitude=&longitude=&forecastDays=`

Planned:

- `GET /api/sites/:slug`
- `GET /api/sites/:slug/conditions?activity=&from=&to=`
- `GET /api/windows?origin=&radius=&activity=&from=&to=`
- `GET /api/sources/:id`
- `POST /api/plans` only after deterministic endpoints stabilize.

Public responses must include valid time, fetched time, provider/source IDs, engine version, confidence/completeness, and warnings.

## 14. Non-functional requirements

- Deterministic assessments are reproducible from versioned inputs.
- No provider response shape leaks into UI code.
- Cached stale data is visibly labeled; unavailable data fails closed for hard-gated recommendations.
- Secrets remain server-side. Inputs are validated at the boundary.
- Accessibility target: WCAG 2.2 AA for core planning flows.
- Mobile-first layout and usable degraded experience on slow connections.
- Site and source updates are auditable.
- Personal location/history is opt-in, minimized, and deletable if introduced.

## 15. Success measures

### Product

- Users can find and understand a site/window without reading raw forecast charts.
- Top reasons and missing data are comprehensible.
- Users inspect source/access warnings when relevant.

### Data and engineering

- 100% of displayed curated facts have provenance and verification state.
- 100% of assessments retain provider run IDs, rule IDs, and engine version.
- Golden deterministic cases pass exactly.
- Provider contract failures never produce silently partial favorable results.
- Site coordinate and current-access verification coverage is visible.

V1 does not optimize for engagement or recommendation acceptance. Accuracy, traceability, and calibrated uncertainty come first.

## 16. Four-week learning/build alignment

### Week 1 — model trustworthy places

Learn TypeScript domain modeling, normalized relational design, provenance, and basic PostGIS. Build the source registry, snapshot/fact model, site catalog, review states, and MCCS import queue. Exit when a site card’s claims can be traced and corrected without code changes.

### Week 2 — build reliable provider boundaries

Learn HTTP failure modes, runtime validation, units, time zones, caching, and contract tests. Build Open-Meteo weather/marine adapters, fixtures, persistence, and freshness metadata. Exit when every normalized field has a tested mapping and null policy.

### Week 3 — make decisions inspectable

Learn rules-engine design, uncertainty, calibration, and evaluation datasets. Build gates, component scores, reasons, favorable-window queries, and an internal trace view. Exit when assessments are reproducible and reviewed against hand-labeled cases.

### Week 4 — add a thin planning layer

Learn grounded tool use and retrieval evaluation. Build intent-to-query mapping and, only if valuable, cited explanation over selected site facts. Exit when disabling the LLM leaves all facts, rankings, and gates unchanged.

## 17. Milestones and acceptance

### Milestone 1 — catalog and forecast spine

- Complete a reviewed MCCS site inventory without copying full source text.
- Verify identities and coordinates separately.
- Persist first-class sources, snapshots, facts, and status.
- Normalize Open-Meteo weather/marine data with fixtures and live smoke checks.
- Render catalog and raw condition inputs with timestamps and warnings.

### Milestone 2 — condition assessment

- Establish reviewed activity-specific rules for a limited pilot set.
- Implement tide phase and directional exposure only with evidence.
- Materialize deterministic assessments and rank windows.
- Run golden-case, boundary, missing-data, and regression evaluation.

### Milestone 3 — usable planner

- Add origin/radius and user/group constraints.
- Compare windows and explain exclusions.
- Add mobile and accessibility QA plus operational monitoring.

### Milestone 4 — bounded natural language

- Define tool contracts and retrieval corpus.
- Add citations and refusal/uncertainty behavior.
- Prove the agent cannot change deterministic outcomes.

## 18. Open questions and explicit TODOs

- Confirm the complete earlier conversation spec if a thread export becomes available; reconcile by ADR, not silent overwrite.
- Verify MCCS reuse/attribution expectations, update cadence, exact record boundaries, and all current site/access facts.
- Verify site coordinates and aliases with a second authoritative/current source.
- Determine who is qualified to approve numeric thresholds and transformed narrative rules.
- Validate Open-Meteo coastal coverage, model/grid selection, API limits, licensing/attribution, historical availability, and null behavior around Okinawa.
- Decide whether a separate tide authority is required; assume yes until sea-level phase is validated.
- Select routing, official alert, observation, and marine-life sources later.
- Define user capability profiles with instructors; do not infer them only from MCCS levels.

