import Link from "next/link";
import { TidePanel } from "@/components/tide-panel";
import { siteTideStations } from "@/data/tide-stations";
import { SiteForecast } from "@/components/site-forecast";
import { dashboardSites, planningReferences } from "@/data/site-focus";
import type { Site } from "@/domain/site";

export function SiteDashboard({ site, slug }: { site: Site; slug: keyof typeof dashboardSites }) {
  const point = site.coordinates?.status === "verified" ? site.coordinates : site.forecastPoint;
  const references = planningReferences;
  const alerts = references.filter((reference) => reference.category === "alerts");
  const hasTides = Boolean(siteTideStations[site.slug]);
  return <main>
    <nav className="topbar" aria-label="Page navigation">
      <Link className="wordmark" href="/?choose=1">OCEAN / OKINAWA</Link>
      <div className="page-links"><Link href="/?choose=1">Change site</Link>{hasTides && <a href="#tides">Tides</a>}<a href="#before-you-go">Alerts</a></div>
    </nav>
    <header className="site-header">
      <p className="eyebrow">{dashboardSites[slug].area} · Okinawa west coast</p>
      <h1>{dashboardSites[slug].name}</h1>
      <p className="location-note">Snorkeling & shore diving · All times Japan time</p>
    </header>
    {point ? <SiteForecast key={`forecast-${site.slug}`} slug={site.slug} /> : <p className="notice">Forecast unavailable until a sourced location is added.</p>}
    {hasTides && <TidePanel key={`tides-${site.slug}`} slug={site.slug} />}
    <section className="before-section" id="before-you-go" aria-labelledby="alerts-heading">
      <div className="conditions-heading"><h2 id="alerts-heading">Official alerts</h2><span className="manual-label">Open source to check current status</span></div>
      <div className="alert-links">{alerts.map((reference) => <a key={reference.id} href={reference.url} target="_blank" rel="noreferrer"><span>{reference.title}</span><span aria-hidden="true">↗</span></a>)}</div>
      <p className="small-note">Alerts, entry access and underwater visibility are not monitored here.</p>
    </section>
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
        <p>Kadena and JMA alert links are references only; their current status is not fetched by this app.</p>
        <ul className="source-links">{references.filter((reference) => reference.category !== "alerts").map((reference) => <li key={reference.id}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title} ↗</a><p>{reference.coverage}</p></li>)}</ul>
      </details>
    </section>
    <footer><span>OCEAN / OKINAWA</span><p>Planning support, not a safe-entry clearance.</p></footer>
  </main>;
}
