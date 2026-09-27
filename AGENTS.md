# Okinawa Ocean Intelligence repository guidance

## Product boundaries

- Treat this product as planning support, never a declaration that ocean entry is safe.
- Compute observations, hard gates, scores, and rankings deterministically. LLM output may explain but may not overwrite them.
- Preserve provenance at source, snapshot, fact, forecast-run, and assessment levels.
- MCCS/Tsunami Scuba is the foundational curated source for the initial site catalog; do not silently convert paraphrases into verified facts.
- Keep provider-specific response shapes inside `src/providers`; the domain and UI consume normalized types only.
- Milestone 1 is site catalog plus Open-Meteo weather/marine integration. Do not add an agent framework until the deterministic path is evaluated.

## Working agreements

- Read the relevant ADR and domain type before changing a boundary.
- Add or update tests when condition scoring or provider normalization changes.
- Mark uncertain site coordinates, access rules, thresholds, and API behavior with a concrete verification TODO.
- Never commit API keys, scraped copyrighted page bodies, or personal observations without consent.
- Run `npm run check` before handing off a material implementation change.

