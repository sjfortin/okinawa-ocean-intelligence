import { NextResponse } from "next/server";
import { dashboardSites, isDashboardSite } from "@/data/site-focus";
import { fetchSiteAlerts } from "@/providers/jma/alerts";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!isDashboardSite(slug)) return NextResponse.json({ error: "Alerts unavailable for this site." }, { status: 404 });
  const headers = { "Cache-Control": "no-store" };
  try {
    return NextResponse.json(await fetchSiteAlerts(dashboardSites[slug].jmaAreaCode), { headers });
  } catch (error) {
    console.error("Site alerts failed", error);
    return NextResponse.json({ error: "JMA weather alerts could not be checked." }, { status: 502, headers });
  }
}
