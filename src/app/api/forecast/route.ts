import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ForecastStorageError, getForecast } from "@/server/forecasts/service";

const querySchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  forecastDays: z.coerce.number().int().min(1).max(7).default(7),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid forecast query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await getForecast(parsed.data), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ForecastStorageError) {
      return NextResponse.json({ error: "Forecast storage unavailable" }, { status: 503 });
    }
    console.error("Forecast provider failed", error);
    return NextResponse.json({ error: "Forecast provider unavailable" }, { status: 502 });
  }
}
