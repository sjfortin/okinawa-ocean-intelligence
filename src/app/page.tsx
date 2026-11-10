import Link from "next/link";
import { SitePickerMap } from "@/components/site-picker-map";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dashboardSites, isDashboardSite } from "@/data/site-focus";

const preferenceCookie = "preferred-ocean-site";

async function selectSite(formData: FormData) {
  "use server";

  const slug = formData.get("site");
  if (!isDashboardSite(slug)) redirect("/?choose=1");

  const preferences = await cookies();
  preferences.set(preferenceCookie, slug, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(`/sites/${slug}`);
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ choose?: string }>;
}) {
  const { choose } = await searchParams;
  const saved = (await cookies()).get(preferenceCookie)?.value;
  if (choose !== "1" && isDashboardSite(saved)) redirect(`/sites/${saved}`);

  const sites = Object.entries(dashboardSites);
  return <main className="site-picker">
    <nav className="topbar" aria-label="Page navigation">
      <Link className="wordmark" href="/">OCEAN / OKINAWA</Link>
      {isDashboardSite(saved) && <Link href={`/sites/${saved}`}>Back to saved site</Link>}
    </nav>
    <header className="site-header">
      <p className="eyebrow">Okinawa west coast</p>
      <h1>Choose a site</h1>
      <p className="lede">Check conditions now and plan the next few hours.</p>
    </header>
    <form action={selectSite} className="site-picker-layout">
      <SitePickerMap />
      <section className="site-picker-list" aria-labelledby="site-list-heading">
        <h2 id="site-list-heading">Available sites</h2>
        {sites.map(([slug, site]) => <button key={slug} type="submit" name="site" value={slug}>
          <span><strong>{site.name}</strong><small>{site.area}{saved === slug ? " · Saved site" : ""}</small></span>
          <span aria-hidden="true">↗</span>
        </button>)}
        <p className="small-note">Your selection opens automatically next time on this browser.</p>
      </section>
    </form>
    <footer><span>OCEAN / OKINAWA</span><p>For planning. Check local conditions before entering the water.</p></footer>
  </main>;
}
