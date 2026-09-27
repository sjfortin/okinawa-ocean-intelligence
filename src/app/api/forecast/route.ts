import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";

const querySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  forecastDays: z.coerce.number().int().min(1).max(16).default(7),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid forecast query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const provider = new OpenMeteoProvider({
    weatherBaseUrl: env.OPEN_METEO_WEATHER_BASE_URL,
    marineBaseUrl: env.OPEN_METEO_MARINE_BASE_URL,
    timeoutMs: env.PROVIDER_TIMEOUT_MS,
  });

  try {
    return NextResponse.json(await provider.getForecast(parsed.data));
  } catch (error) {
    console.error("Forecast provider failed", error);
    return NextResponse.json({ error: "Forecast provider unavailable" }, { status: 502 });
  }
}

