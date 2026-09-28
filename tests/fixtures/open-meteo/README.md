# Open-Meteo forecast fixtures

`2026-09-28/` contains one recorded weather/marine pair for an offshore Okinawa test point (26.35, 127.65). It is not a verified entry location. The manifest retains retrieval timestamps, exact request parameters, grid coordinates, and SHA-256 hashes of the response text. Bodies are unmodified; normalized results are project-generated.

Weather and marine data by [Open-Meteo](https://open-meteo.com/), under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), per the [API data licence](https://open-meteo.com/en/licence) reviewed 2026-09-28. Underlying data providers are listed in the [weather](https://open-meteo.com/en/docs) and [marine](https://open-meteo.com/en/docs/marine-weather-api) documentation; the default best-match response does not identify every selected model. No endorsement is implied.

`synthetic.ts` is separate artificial contract data for null, missing-hour, and failure cases. A successful live pair does not establish coastal accuracy, rate limits, refresh cadence, or universal coverage.

Capture a new dated pair with `npm run forecast:fixture -- tests/fixtures/open-meteo/YYYY-MM-DD`. Existing files are never overwritten. Offline tests replay the committed pair without network access. TODO: record a separate observed coastal-null response before claiming that coverage case has live evidence.
