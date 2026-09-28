import { NextResponse } from "next/server";
import { siteSeeds } from "@/data/site-seeds";
import { ForecastStorageError, getForecast } from "@/server/forecasts/service";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = siteSeeds.find((item) => item.slug === slug);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const point = site.coordinates?.status === "verified" ? site.coordinates : site.forecastPoint;
  if (!point) return NextResponse.json({ error: "A sourced forecast location is not yet available for this site." }, { status: 422 });
  try {
    const forecast = await getForecast({ ...point.value, forecastDays: 2 });
    return NextResponse.json({ ...forecast, siteSlug: slug, forecastPoint: point }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ForecastStorageError) {
      return NextResponse.json({ error: "Forecast storage unavailable. Please try again." }, { status: 503 });
    }
    console.error("Site forecast failed", error);
    return NextResponse.json({ error: "Forecast temporarily unavailable. Please try again." }, { status: 502 });
  }
}
