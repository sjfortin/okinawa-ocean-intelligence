import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";
import { createForecastStore } from "@/server/forecasts/store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "Invalid forecast ID" }, { status: 400 });
  }
  if (!env.DATABASE_URL) {
    return NextResponse.json({ error: "Forecast storage is not configured" }, { status: 503 });
  }
  try {
    const { queryClient } = await import("@/server/db/client");
    const forecast = await createForecastStore(queryClient).load(id);
    if (!forecast) return NextResponse.json({ error: "Forecast not found" }, { status: 404 });
    return NextResponse.json({ ...forecast, forecastId: id, archived: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Forecast storage unavailable" }, { status: 503 });
  }
}
