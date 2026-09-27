import type { Site } from "@/domain/site";
import Link from "next/link";

export function SiteCard({ site }: { site: Site }) {
  return (
    <article className="site-card">
      <div className="site-card__heading">
        <h3>{site.name}</h3>
        <span>Level {site.difficulty.value}</span>
      </div>
      <p>{site.summary}</p>
      <dl>
        <div>
          <dt>Activities</dt>
          <dd>{site.activities.map((activity) => activity.replace("_", " ")).join(" · ")}</dd>
        </div>
        <div>
          <dt>Catalog</dt>
          <dd>{site.catalogStatus.replace("_", " ")}</dd>
        </div>
      </dl>
      {site.hazards.value.length > 0 && (
        <p className="site-card__hazards">Watch: {site.hazards.value.join("; ")}</p>
      )}
      <p><Link href={`/sites/${site.slug}`}>View site & conditions →</Link></p>
    </article>
  );
}
