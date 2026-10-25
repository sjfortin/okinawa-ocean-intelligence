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
| [JMA Naha tide predictions](https://www.data.jma.go.jp/kaiyou/db/tide/suisan/suisan.php?stn=NH) | Nearby high/low-water reference | Integrated via JMA’s documented annual text download. Heights are meters above the Naha tide-table datum; times are JST. TODO: verify North Wall time/height offsets. Never equate high/low water with slack current. |
| [MLIT NOWPHAS](https://www.mlit.go.jp/kowan/nowphas/index_eng.html) | Coastal wave and water-level observations | Official observation-network reference. TODO: verify nearby station availability, distance, sensor variables, age and redistribution terms before normalizing observations. |
| [MCCS dive sites](https://www.okinawa.usmc-mccs.org/shopping-services/tsunami-scuba/dive-sites) | Foundational Kadena North site description | Existing curated provenance retained. Exact entry and present access remain unverified. |
| [PADI Kadena North Steps](https://www.padi.com/dive-site/japan/kadena-north-steps/) | Existing provisional forecast coordinate | Does not independently resolve the relationship between North Steps and MCCS Kadena North. |

## Verification work still required

- TODO: independently confirm the user's Kadena town North Wall entry, the MCCS heading, and North Steps coordinate refer to the intended location. The dashboard does not provide entry navigation.
- TODO: confirm legal access, parking, closures, reef/entry hazards, snorkeling suitability and shoreline exposure with local sources.
- TODO: obtain and validate activity-specific thresholds with a local expert before enabling scores, gates or recommended windows.
- TODO: evaluate local underwater visibility, water-quality and reef-current observations. No such live feed is connected; regional weather cannot substitute for these.

The minimalist dashboard deliberately uses typography and condition values rather than decorative imagery. The same dashboard appears at `/` and `/sites/kadena-north`. Additional sites can be surfaced later without changing the provider or domain contract.

## In-app daily tide report

`/api/sites/kadena-north/tides` now supplies today and the next two Japan-calendar days from JMA's published Naha astronomical predictions. The responsive tide panel loads automatically, highlights the next high/low event, shows a countdown, and lets the user choose a day. All event times display in JST, including on phones set to another timezone. Heights are converted from centimeters to meters above the station's tide-table datum, not entry depth or mean sea level.

The JMA adapter validates the documented 136-column annual text format, station, dates, timestamps and missing-event sentinels; it reads published extrema rather than inferring peaks from hourly samples. It retains response hash, retrieval metadata and row locators without retaining raw source bodies. Annual downloads are cached in process for one hour, including concurrent-request deduplication. Failures are not cached. Year rollover requests both annual files when necessary; missing requested dates fail visibly. The independent tide fetch cannot take down the weather forecast.

The browser refreshes on opening, returning to the tab, and every 15 minutes while visible. It keeps prior predictions with an explicit error on refresh failure, filters out past calendar dates, and labels data not refreshed for over a day. There is no automatic North Wall tide correction, current-phase inference, entry score, or manual checklist.

References reviewed 2026-10-25:

- [JMA text format](https://www.data.jma.go.jp/kaiyou/db/tide/suisan/readme.html)
- [JMA tide explanation: JST, astronomical predictions and datum](https://www.data.jma.go.jp/kaiyou/db/tide/suisan/explanation.html)
- [JMA usage terms and attribution requirements](https://www.jma.go.jp/jma/kishou/info/coment.html)

The panel attributes JMA and identifies the app's reformatted presentation. TODO: monitor annual publication availability and format changes; there is no upstream availability guarantee.
