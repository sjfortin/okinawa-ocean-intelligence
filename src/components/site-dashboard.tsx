import Link from "next/link";
import { TidePanel } from "@/components/tide-panel";
import { siteTideStations } from "@/data/tide-stations";
import { SiteAlerts } from "@/components/site-alerts";
import { SiteForecast } from "@/components/site-forecast";
import { dashboardSites, planningReferences } from "@/data/site-focus";
import type { Site } from "@/domain/site";

export function SiteDashboard({ site, slug }: { site: Site; slug: keyof typeof dashboardSites }) {
  const point = site.coordinates?.status === "verified" ? site.coordinates : site.forecastPoint;
  const references = planningReferences;
  const hasTides = Boolean(siteTideStations[site.slug]);
  return <main className="minimal-dashboard">
    <nav className="topbar" aria-label="Page navigation">
      <Link className="wordmark" href="/?choose=1">OCEAN / OKINAWA</Link>
      <div className="page-links"><Link href="/?choose=1">Change site</Link></div>
    </nav>
    <header className="site-header">
      <p className="eyebrow">{dashboardSites[slug].area} · Okinawa west coast</p>
      <h1>{dashboardSites[slug].name}</h1>

    </header>
    <SiteAlerts key={slug} slug={slug} area={dashboardSites[slug].area} areaCode={dashboardSites[slug].jmaAreaCode} />
    {point ? <SiteForecast key={`forecast-${site.slug}`} slug={site.slug} /> : <p className="notice">Forecast unavailable until a sourced location is added.</p>}
    {hasTides && <details className="tide-disclosure"><summary>Tides <span className="summary-note">Naha reference</span></summary><TidePanel key={`tides-${site.slug}`} slug={site.slug} /></details>}
    <section className="site-notes" id="site-notes" aria-label="Site and source details">
      <details><summary>About this spot</summary>
        <p>{site.summary}</p><p>{site.accessNotes.value}</p>
        <p>{slug === "kadena-north"
          ? "MCCS calls the site “Kadena North”; the forecast reference is “Kadena North Steps.” The exact entry and the match between these locations remain unverified."
          : "The regional forecast is anchored at the published South Steps point. The exact entry and current access still need local confirmation."}</p>
        {slug === "sunabe-seawall" && <p>{site.hazards.value.join(". ")}.</p>}
        <p>Reported marine life: {site.marineLife.value.join(", ")}. These are historical reports, not current sightings.</p>
        <a href={site.accessNotes.source.canonicalUrl}>MCCS site guide ↗</a>
        {point && <><p className="detail-spacing">Forecast point: {point.value.latitude}, {point.value.longitude} · {point.status.replaceAll("_", " ")}. Not an entry navigation pin.</p><a href={point.source.canonicalUrl}>{point.source.sourceName} ↗</a></>}
      </details>
      <details><summary>Data coverage & other sources</summary>
        <p>Weather and marine forecasts come from Open-Meteo; tides are JMA predictions for Naha. Offshore conditions and Naha tides may differ at the seawall.</p>
        <p>Local surf, currents, water quality, access and underwater visibility are unverified. No entry score is issued; local snorkeling and diving limits need verification.</p>
        <p>The alert panel checks JMA municipal weather bulletins for waves, wind, thunderstorms and storm surge. Follow the source links for tsunami alerts and Kadena sea conditions.</p>
        <ul className="source-links">{references.filter((reference) => reference.category !== "alerts").map((reference) => <li key={reference.id}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title} ↗</a><p>{reference.coverage}</p></li>)}</ul>
      </details>
    </section>
    <footer><span>OCEAN / OKINAWA</span><p>Planning support, not a safe-entry clearance.</p></footer>
  </main>;
}
