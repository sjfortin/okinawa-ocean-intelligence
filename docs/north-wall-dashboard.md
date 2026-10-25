# Kadena North Wall dashboard

Implemented 2026-10-25. The product now opens on the Kadena town North Wall, with the existing `kadena-north` catalog record as its reference. Other site records and site API routes are retained. `src/data/site-focus.ts` controls the homepage focus and per-site external references; the dashboard accepts a Site rather than embedding provider coordinates.

## Connected data

The existing normalized Open-Meteo pipeline supplies hourly waves, wave period and direction, swell, wind/gusts, air and surface-water temperature, rain and offshore current speed. The page fetches on mount, every ten minutes while visible, on returning to the tab, and on manual refresh. It retains the previous response on failure with an explicit failure message. The current-hour selector never promotes a future forecast into the current slot. All contributing retrievals must be at most one hour old for the freshness label; retrieval age is not model issuance age. Timestamps are JST. Missing numbers remain unavailable.

Forecast points, source hashes and provider-run metadata are preserved. No scoring or recommendation is displayed because no locally validated rules are available. In particular, the existing engine's empty-rule score must not be interpreted as evidence of suitability. Atmospheric visibility and model sea-level height are not presented as underwater visibility or a local tide table.

## Source scan

These are reference discoveries, **not stored observations or snapshots of current alerts**. Source page bodies are not retained. Discovery date: 2026-10-25.

| Source | Use | Integration and limits |
| --- | --- | --- |
| [Kadena Weather Flight](https://www.kadena.af.mil/Agencies/Local-Weather/html/) | Regional west-coast sea conditions | Direct official link. Search index contained dated conditions; direct retrieval returned 403. Do not copy indexed status into the app. TODO: confirm supported retrieval, terms and issue-time semantics before integrating. |
| [JMA warning map](https://www.jma.go.jp/bosai/map.html#contents=warning&area_type=offices&area_code=471000&lang=en) | Okinawa weather warnings | Browser reference only. TODO: validate municipality/region mapping, permitted feed, cancellations, issue timestamps and outage behavior before automation. |
| [JMA tsunami map](https://www.jma.go.jp/bosai/map.html#contents=tsunami&lang=en) | Tsunami warnings and advisories | Browser reference only; no claim of all-clear. TODO: validate an official feed and applicable coastal forecast region before ingestion. |
| [JMA Naha tide predictions](https://www.data.jma.go.jp/kaiyou/db/tide/suisan/suisan.php?stn=NH) | Nearby high/low-water reference | Confirmed Naha station page, not North Wall. TODO: verify local time/height offsets, datum, licensing and supported access. Never equate high/low water with slack current. |
| [MLIT NOWPHAS](https://www.mlit.go.jp/kowan/nowphas/index_eng.html) | Coastal wave and water-level observations | Official observation-network reference. TODO: verify nearby station availability, distance, sensor variables, age and redistribution terms before normalizing observations. |
| [MCCS dive sites](https://www.okinawa.usmc-mccs.org/shopping-services/tsunami-scuba/dive-sites) | Foundational Kadena North site description | Existing curated provenance retained. Exact entry and present access remain unverified. |
| [PADI Kadena North Steps](https://www.padi.com/dive-site/japan/kadena-north-steps/) | Existing provisional forecast coordinate | Does not independently resolve the relationship between North Steps and MCCS Kadena North. |

## Verification work still required

- TODO: independently confirm the user's Kadena town North Wall entry, the MCCS heading, and North Steps coordinate refer to the intended location. The dashboard does not provide entry navigation.
- TODO: confirm legal access, parking, closures, reef/entry hazards, snorkeling suitability and shoreline exposure with local sources.
- TODO: obtain and validate activity-specific thresholds with a local expert before enabling scores, gates or recommended windows.
- TODO: evaluate local underwater visibility, water-quality and reef-current observations. No such live feed is connected; regional weather cannot substitute for these.

The minimalist dashboard deliberately uses typography and condition values rather than decorative imagery. The same dashboard appears at `/` and `/sites/kadena-north`. Additional sites can be surfaced later without changing the provider or domain contract.
