# Site forecast preview — 2026-09-27

All seven catalog entries now have detail pages. Kadena North Seawall has an opt-in regional forecast preview using the North Steps point published by PADI (26.35940, 127.73920). This is a separate provisional forecast point, not a verified site coordinate or legal entry.

Evidence: [MCCS Kadena North heading](https://www.okinawa.usmc-mccs.org/shopping-services/tsunami-scuba/dive-sites) and [PADI North Steps location](https://www.padi.com/dive-site/japan/kadena-north-steps/), reviewed 2026-09-27. PADI says its listing content is third-party supplied. TODO: independently reconcile MCCS Kadena North, North Steps, and nearby Jam, and verify current access before publishing a canonical entry coordinate. Snorkel suitability has not been asserted for this site.

The Open-Meteo adapter now requests Unix timestamps and explicit units. Normalized times are UTC ISO strings; the UI displays JST. Tests cover timestamp joins, missing hours, null values, failed providers, and site endpoint availability. Test responses are synthetic contracts, not recorded live fixtures.

Remaining Milestone 1 work: verified coordinates for all sites; recorded Okinawa fixtures; unit-response validation and grid metadata; source/fact and forecast persistence. Milestone 2 scores still require reviewed local rules. Forecast previews are model inputs and do not validate the entry location.
