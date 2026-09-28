# Site forecast preview — 2026-09-27

All seven catalog entries now have detail pages. Kadena North Seawall has an opt-in regional forecast preview using the North Steps point published by PADI (26.35940, 127.73920). This is a separate provisional forecast point, not a verified site coordinate or legal entry.

Evidence: [MCCS Kadena North heading](https://www.okinawa.usmc-mccs.org/shopping-services/tsunami-scuba/dive-sites) and [PADI North Steps location](https://www.padi.com/dive-site/japan/kadena-north-steps/), reviewed 2026-09-27. PADI says its listing content is third-party supplied. TODO: independently reconcile MCCS Kadena North, North Steps, and nearby Jam, and verify current access before publishing a canonical entry coordinate. Snorkel suitability has not been asserted for this site.

The Open-Meteo adapter now requests Unix timestamps and explicit units. Normalized times are UTC ISO strings; the UI displays JST. Tests cover timestamp joins, missing hours, null values, failed providers, and site endpoint availability. Test responses are synthetic contracts, not recorded live fixtures.

Remaining Milestone 1 work: verified coordinates for all sites; source/fact persistence; database integration verification and provider failure-run logging. Milestone 2 scores still require reviewed local rules. Forecast previews are model inputs and do not validate the entry location.

## Provider contract hardening — 2026-09-28

Weather and marine responses must declare the requested units for every consumed field. Missing or unexpected units fail the combined forecast instead of being labeled with assumed units. The adapter also rejects empty time axes, unequal array lengths, invalid coordinates, out-of-range timestamps, and duplicate or reversed timestamps. Explicit null values and missing marine hours continue to remain unavailable.

Each provider run now retains the requested location and its returned grid location separately. The normalized hour's existing latitude/longitude remains the weather grid reference; marine grid coordinates are available through its linked run metadata. These are model locations, not verified entry coordinates.

Contract references: [Open-Meteo weather documentation](https://open-meteo.com/en/docs) and [marine documentation](https://open-meteo.com/en/docs/marine-weather-api), consulted 2026-09-28.

## Recorded fixture and forecast storage — 2026-09-28

Captured one real 24-hour weather/marine pair at offshore test point 26.35, 127.65. Its manifest and unmodified response bodies live in `tests/fixtures/open-meteo/2026-09-28`; offline replay verifies hashes, requested units, separate grid locations, and timestamp normalization. Artificial null/missing-hour cases remain explicitly synthetic. TODO: record observed coastal-null coverage and verify rate limits/model selection before claiming those cases are validated.

Configured databases now receive successful provider runs, response hashes, exact request parameters, merged hours, warnings, and complete run links in one transaction. Both forecast routes return the committed batch ID; `/api/forecasts/:id` retrieves an archived batch. Database-free previews remain supported. Failed provider calls are not persisted yet.

Database integration test is provided but requires `TEST_DATABASE_URL`; this workstation could not access Docker without a password, so real PostgreSQL round-trip/rollback verification remains pending. Storage orchestration and dependency preservation are covered by offline tests. No site access, coordinates, thresholds, or assessments were upgraded by this work.
