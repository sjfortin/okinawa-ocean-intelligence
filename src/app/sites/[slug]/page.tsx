import Link from "next/link";
import { notFound } from "next/navigation";
import { siteSeeds } from "@/data/site-seeds";
import { SiteForecast } from "@/components/site-forecast";
import type { ProvenancedFact } from "@/domain/site";

function Evidence({ fact }: { fact: ProvenancedFact<unknown> }) {
  return <p className="evidence"><a href={fact.source.canonicalUrl}>{fact.source.sourceName}</a> · {fact.source.locator} · {fact.status.replaceAll("_", " ")} · reviewed {fact.source.retrievedAt.slice(0, 10)}</p>;
}

export default async function SitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = siteSeeds.find((item) => item.slug === slug);
  if (!site) notFound();
  const point = site.coordinates?.status === "verified" ? site.coordinates : site.forecastPoint;
  return <main>
    <Link href="/">← All sites</Link>
    <header className="site-header"><p className="eyebrow">Okinawa · Site guide</p><h1>{site.name}</h1><p className="lede">{site.summary}</p>
      <p>Level {site.difficulty.value} · {site.activities.map((item) => item.replaceAll("_", " ")).join(" · ")}</p><Evidence fact={site.difficulty} />
    </header>
    <section className="site-card"><h2>Access & site notes</h2><p>{site.accessNotes.value}</p><Evidence fact={site.accessNotes} />
      <h3>Things to check</h3><ul>{site.hazards.value.map((hazard) => <li key={hazard}>{hazard}</li>)}</ul><Evidence fact={site.hazards} />
      <h3>Reported marine life</h3><p>{site.marineLife.value.join(", ")}</p><Evidence fact={site.marineLife} />
      {site.visibilityTypicalMeters && <><p>Source-reported underwater visibility: {site.visibilityTypicalMeters.value.min}–{site.visibilityTypicalMeters.value.max} m. Historical description, not a current measurement.</p><Evidence fact={site.visibilityTypicalMeters} /></>}
    </section>
    <section className="conditions-section"><h2>Forecast conditions</h2>
      {point ? <><p className="notice">{point.status === "verified" ? "Sourced forecast location" : "Provisional regional preview — location still needs verification"}: {point.value.latitude}, {point.value.longitude}.</p><p>{point.note}</p><Evidence fact={point} /><SiteForecast slug={site.slug} /></> : <p className="notice">Forecast pending location verification. An independently sourced forecast point is needed before conditions can be displayed here.</p>}
      <p>Check current access, official alerts, and on-site conditions before entry. Site scores and recommended windows are pending local rule review.</p>
    </section>
  </main>;
}
