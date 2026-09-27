import { SiteCard } from "@/components/site-card";
import { siteSeeds } from "@/data/site-seeds";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Milestone 1 · Local build</p>
        <h1>Where and when should I get in the water?</h1>
        <p className="lede">
          Okinawa Ocean Intelligence combines curated site knowledge with normalized marine and
          weather forecasts. It supports planning; it does not certify that conditions are safe.
        </p>
        <div className="status-row">
          <span>{siteSeeds.length} starter sites</span>
          <span>MCCS provenance attached</span>
          <span>Open-Meteo adapter ready</span>
        </div>
      </section>

      <section className="catalog">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Curated catalog</p>
            <h2>Starter site records</h2>
          </div>
          <p>Coordinates and current access remain deliberately unverified.</p>
        </div>
        <div className="site-grid">
          {siteSeeds.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      </section>
    </main>
  );
}

