import { NextResponse } from "next/server";
import { siteSeeds } from "@/data/site-seeds";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";
import { env } from "@/config/env";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = siteSeeds.find((item) => item.slug === slug);
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });
  const point = site.coordinates?.status === "verified" ? site.coordinates : site.forecastPoint;
  if (!point) return NextResponse.json({ error: "A sourced forecast location is not yet available for this site." }, { status: 422 });
  try {
    const provider = new OpenMeteoProvider({ weatherBaseUrl: env.OPEN_METEO_WEATHER_BASE_URL, marineBaseUrl: env.OPEN_METEO_MARINE_BASE_URL, timeoutMs: env.PROVIDER_TIMEOUT_MS });
    const forecast = await provider.getForecast({ ...point.value, forecastDays: 2 });
    return NextResponse.json({ ...forecast, siteSlug: slug, forecastPoint: point }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Site forecast failed", error);
    return NextResponse.json({ error: "Forecast temporarily unavailable. Please try again." }, { status: 502 });
  }
}
