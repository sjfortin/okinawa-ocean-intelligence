import Link from "next/link";
import { TidePanel } from "@/components/tide-panel";
import { siteTideStations } from "@/data/tide-stations";
import { SiteForecast } from "@/components/site-forecast";
import { planningReferences } from "@/data/site-focus";
import type { Site } from "@/domain/site";

export function SiteDashboard({ site }: { site: Site }) {
  const point = site.coordinates?.status === "verified" ? site.coordinates : site.forecastPoint;
  const references = planningReferences[site.slug] ?? [];
  const alerts = references.filter((reference) => reference.category === "alerts");
  const hasTides = Boolean(siteTideStations[site.slug]);
  return <main>
    <nav className="topbar" aria-label="Page navigation">
      <Link className="wordmark" href="/">OCEAN / OKINAWA</Link>
      <div className="page-links">{hasTides && <a href="#tides">Tides</a>}<a href="#before-you-go">Alerts</a></div>
    </nav>
    <header className="site-header">
      <p className="eyebrow">Kadena town · Okinawa west coast</p>
      <h1>{site.slug === "kadena-north" ? "Kadena North Wall" : site.name}</h1>
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
        <p>MCCS calls the site “Kadena North”; the forecast reference is “Kadena North Steps.” The exact entry and the match between these locations remain unverified.</p>
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
