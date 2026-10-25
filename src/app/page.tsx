import { SiteDashboard } from "@/components/site-dashboard";
import { focusedSiteSlug } from "@/data/site-focus";
import { siteSeeds } from "@/data/site-seeds";

export default function Home() {
  const site = siteSeeds.find((item) => item.slug === focusedSiteSlug);
  if (!site) throw new Error("The focused site must exist in the catalog.");
  return <SiteDashboard site={site} />;
}
