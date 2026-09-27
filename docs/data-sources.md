# Data sources and provenance

## Source policy

Every displayed curated claim must answer: who published it, where it appeared, when it was retrieved, what exact record/section it came from, whether it has been verified, and what supersedes it.

Provenance is modeled as data, not a footnote. A source is the publisher/location identity; a snapshot is one retrieval; a fact is one structured assertion from that snapshot; a rule may reference a reviewed fact.

## Initial source registry

| Source | Purpose | V1 status | Required verification |
|---|---|---|---|
| MCCS Tsunami Scuba — Okinawa Dive Sites | Foundational site names, levels, snorkel flags, access, hazards, visibility, currents/tides, marine life | Reviewed 2026-09-27; heading inventory and partial seed complete | Current accuracy, record segmentation, and broader republication/commercial-use confirmation |
| Open-Meteo Weather API | Hourly temperature, precipitation, visibility, wind and gust | Adapter scaffolded | Terms, attribution, rate limits, model/coverage, nulls, update cadence |
| Open-Meteo Marine API | Hourly wave, swell, sea-level, temperature and current fields | Adapter scaffolded | Coastal grid behavior, units, model selection, tide suitability, terms |
| Qualified local review | Numeric thresholds and real-world access confirmation | Not established | Reviewer role, review rubric, renewal interval |
| Official warnings/closures | Later operational constraints | Not selected | Authority, geographic mapping, latency, API/usage terms |

MCCS catalog: <https://www.okinawa.usmc-mccs.org/shopping-services/tsunami-scuba/dive-sites>  
Open-Meteo weather: <https://open-meteo.com/en/docs>  
Open-Meteo marine: <https://open-meteo.com/en/docs/marine-weather-api>

## MCCS import approach

1. Make a source/snapshot record with retrieval time, HTTP status, hash, and page metadata.
2. Identify site headings and associated sections without storing/publishing the entire body by default.
3. Extract short structured values and paraphrases.
4. Retain a locator such as “Maeda Flats — tide guidance,” not a fragile CSS selector alone.
5. Queue identity, coordinate, access, and numeric-rule reviews separately.
6. Mark the overall site `needs_verification` until location and current access are checked.

The current seed covers Sunabe Seawall, Maeda Flats, Maeda Point, Junkyard, Horseshoe Beach, and Hedo Point. `src/data/mccs-site-review-queue.ts` inventories all 15 page headings without copying their descriptions or directions. Combined headings remain explicitly queued for record-segmentation review.

Capture a metadata-only snapshot with:

```bash
npm run source:snapshot:mccs
```

The command hashes the decoded HTTP response bytes with SHA-256 and stores only retrieval metadata under `data/source-snapshots/`. It never writes the response body. A changed hash means the source should be reviewed; it does not identify what changed.

## Fact status

- `verified`: accurately reflects the cited snapshot. This does not automatically mean current in the physical world.
- `needs_verification`: uncertain transformation, identity, recency, or external confirmation.
- `deprecated`: retained for audit but not presented as current.

Recency belongs beside status. Access facts may need short renewal intervals while geological descriptions change slowly.

## Provider normalization

Provider responses are stored or referenced per run, then mapped to SI-oriented domain fields. Preserve native provider metadata and never overwrite raw meaning. Direction conventions need field-level tests because wave direction commonly means “coming from,” while current direction may mean “flowing toward.”

Open-Meteo weather and marine series must be joined by timestamp. Array index alignment is not assumed. Null values remain null. The adapter currently uses local `Asia/Tokyo` timestamps and needs a daylight/time-format contract fixture even though Japan does not observe DST.

## Attribution and content handling

- Display publisher/source links near derived facts.
- Keep copied text minimal; prefer structured values and original paraphrase.
- Record any license or terms constraint on the source row.
- Do not expose private snapshot storage URIs.
- Before production, verify Open-Meteo and MCCS attribution requirements and document the chosen presentation.

### MCCS use review (2026-09-27)

The official MCCS Privacy and Security Notice says information presented on the service that is not identified as copyright-protected is considered public information and may be copied or distributed; it requests appropriate byline, photo, and image credits. The dive-sites page identifies itself as an official U.S. Marine Corps website and does not present a page-specific license or copyright marker in the reviewed page content.

This is enough for the conservative Milestone 1 workflow—source links, credit, hashes, locators, and short structured paraphrases—but it is not treated as blanket permission to mirror page bodies or imagery. Before production or broader commercial republication, confirm the intended use with the MCCS contact named in the notice (`webmaster@usmc-mccs.org`) and record the response as a new source-policy fact.

## Verification backlog

- Full MCCS inventory and canonical record segmentation.
- Coordinates and aliases from a second current source.
- Present-day access, parking, landowner rules, construction, and closures.
- Conversions from feet to meters and narrative surf language to modeled wave variables.
- Whether a model offshore value is representative of each shore entry.
- Current provider limits, caching, attribution, coverage, and commercial-use policy.
- Suitable authoritative sources for tides, warnings, observations, marine hazards, and marine-life seasonality.
