import Link from "next/link";
import { TidePanel } from "@/components/tide-panel";
import { siteTideStations } from "@/data/tide-stations";
import { SiteForecast } from "@/components/site-forecast";
import { planningReferences } from "@/data/site-focus";
import type { Site } from "@/domain/site";

export function SiteDashboard({ site }: { site: Site }) {
  const point = site.coordinates?.status === "verified" ? site.coordinates : site.forecastPoint;
  const references = planningReferences[site.slug] ?? [];
  return <main>
    <nav className="topbar" aria-label="Page navigation"><Link className="wordmark" href="/">OCEAN / OKINAWA</Link><a href="#before-you-go">Before you go <span aria-hidden="true">↗</span></a></nav>
    <header className="site-header"><p className="eyebrow">Kadena town · Okinawa west coast</p><h1>{site.slug === "kadena-north" ? "Kadena North Wall" : site.name}</h1><p className="lede">A clearer picture before you get in.</p><p className="location-note">{site.name} · Shore diving & snorkeling planning</p></header>
    {point ? <><p className="location-caveat">{point.status === "verified" ? "Sourced forecast point." : "Regional forecast preview · exact seawall entry is unverified."} <a href="#site-notes">Location details ↓</a></p><SiteForecast key={site.slug} slug={site.slug} /></> : <p className="notice">Forecast unavailable until a sourced location is added.</p>}
    {siteTideStations[site.slug] && <TidePanel key={site.slug} slug={site.slug} />}
    <section className="before-section" id="before-you-go"><div className="conditions-heading"><div><p className="eyebrow">Complete the picture</p><h2>Before you go</h2></div><span className="manual-label">External checks · not live in this app</span></div>
      <div className="reference-grid">{references.map((reference) => <a className="reference-card" key={reference.id} href={reference.url} target="_blank" rel="noreferrer"><span className="reference-type">{reference.category} <span aria-hidden="true">↗</span></span><h3>{reference.title}</h3><p>{reference.description}</p><small>{reference.coverage}</small></a>)}</div>
      <div className="unknowns"><h3>What still needs eyes on the water</h3><p>Breaking waves at the steps, entry and exit access, underwater visibility, and currents at the reef are unknown here.</p><div className="activity-notes"><p><strong>Snorkeling</strong> Check surface conditions and a clear return route. Snorkeling suitability at this exact entry has not been verified.</p><p><strong>Shore diving</strong> Check conditions for the entire dive and exit, and confirm the entry with a local dive professional.</p></div></div>
    </section>
    <section className="site-notes" id="site-notes"><p className="eyebrow">Know the place</p><h2>The North Wall notebook</h2><p>{site.summary}</p>
      <details><summary>Entry & location</summary><p>{site.accessNotes.value}</p><p>The dashboard’s “North Wall” refers to the Kadena town seawall. The catalog source names the site “Kadena North”; the provisional forecast reference is “Kadena North Steps.” These names are not yet verified as the same exact entry.</p><a href={site.accessNotes.source.canonicalUrl}>MCCS site description ↗</a>
        {point && <><p>Forecast reference: {point.value.latitude}, {point.value.longitude}. This is not a navigation pin or confirmed entry location.</p><p>{point.note}</p><a href={point.source.canonicalUrl}>{point.source.sourceName} ↗</a></>}
      </details>
      <details><summary>Site background & marine life</summary><p>MCCS lists this as a level {site.difficulty.value} site. This is a source description, not a rating of today’s conditions.</p><p>Reported marine life: {site.marineLife.value.join(", ")}.</p><p>Historical site descriptions do not establish today’s underwater visibility.</p><a href={site.marineLife.source.canonicalUrl}>Read the MCCS guide ↗</a></details>
      <details><summary>What is connected, and what is still unknown?</summary><p>Connected: hourly Open-Meteo weather and marine forecasts, with retrieval timestamps and source-run references. JMA Naha high/low tide predictions are displayed in the tide panel.</p><p>Reference links only: Kadena sea conditions, JMA weather and tsunami alerts, and NOWPHAS observations. Opening this app does not check those sources for you.</p><p>No entry recommendation or score is issued: local activity thresholds, tide offsets, exact access, and shoreline exposure need verification. No live underwater visibility or local water-quality feed is connected.</p><p>Reference discovery reviewed 25 October 2026. Kadena’s official page restricted automated access; JMA alert maps require a browser. Their current alert state is unknown here.</p></details>
    </section>
    <footer><span>OCEAN / OKINAWA</span><p>Planning support. Check official alerts, local advice, and conditions at the entry every time.</p></footer>
  </main>;
}
