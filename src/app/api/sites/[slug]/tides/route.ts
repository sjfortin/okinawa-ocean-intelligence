import { NextResponse } from "next/server";
import { siteSeeds } from "@/data/site-seeds";
import { siteTideStations } from "@/data/tide-stations";
import { getTides } from "@/server/tides/service";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!siteSeeds.some((site) => site.slug === slug)) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const station = siteTideStations[slug];
  if (!station) return NextResponse.json({ error: "No tide reference station configured for this site." }, { status: 422 });
  try {
    return NextResponse.json(await getTides(station), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Tide predictions temporarily unavailable. Please retry." }, { status: 502 });
  }
}
