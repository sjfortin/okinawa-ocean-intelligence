# Minimal site dashboard

Status — implemented first pass, 2026-11-13.

## User goal

Open the preferred site and understand waves, wind, air and water temperature, and what needs checking before entry within a few seconds. Continue into near-term planning without having to read a full report.

## Default screen

- Show the selected site and one Change site action.
- Show a short entry check with active municipal coastal weather alerts. Keep alert failures visible.
- Show four primary measurements for the current hour. Waves include period and direction. Wind includes direction and gusts. Water and air use degrees Celsius.
- Show six upcoming hourly columns for waves and wind. Use Japan time.
- Use large numbers, restrained color, generous spacing and short labels. Keep the mobile view readable with two columns of measurements and a horizontally scrollable outlook.

## Progressive disclosure

Keep the 24-hour forecast, past 24 hours, tides, additional conditions, source metadata and site notes closed by default. Give every disclosure a clear label. Preserve access to existing provenance and historical estimates.

## Entry status

The two sites currently have no verified local entry thresholds. Display “Check the entry locally” with the specific gaps in surf, currents and access. Surface JMA alerts verbatim in meaning through deterministic code mappings and show issue and retrieval times. Missing or incomplete alerts must remain visible as unknown coverage.

Future suitability assessments require verified activity-specific rules and enough local evidence. Preserve ADR 0002 and deterministic assessment results. Avoid deriving an entry recommendation from wave height alone.

## Acceptance

- Waves, wind, air and water temperatures are visible without opening details.
- Active warnings and failed alert checks remain visible.
- Six upcoming hours are visible without opening the full forecast.
- Historic conditions, tides and provenance remain reachable.
- Missing data displays a dash with a short explanation.
- Saved site selection and switching continue to work.
- Run the repository check before handoff.
