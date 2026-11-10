import type { ForecastResult } from "@/providers/types";

const HOUR = 3_600_000;
/** Retrieval freshness only; does not assert model issuance or observation age. */
export function forecastView(forecast: ForecastResult | null, now: number) {
  const received = forecast?.metadata.map((run) => Date.parse(run.responseReceivedAt)) ?? [];
  const oldest = received.length ? Math.min(...received) : NaN;
  const stale = !Number.isFinite(oldest) || now - oldest > HOUR || oldest > now + 60_000;
  const sorted = [...(forecast?.hours ?? [])].sort((a, b) => Date.parse(a.validAt) - Date.parse(b.validAt));
  const current = sorted.find((hour) => {
    const timestamp = Date.parse(hour.validAt);
    return timestamp <= now && now < timestamp + HOUR;
  }) ?? null;
  const upcoming = sorted.filter((hour) => Date.parse(hour.validAt) > now && Date.parse(hour.validAt) <= now + 24 * HOUR);
  const recent = sorted.filter((hour) => {
    const timestamp = Date.parse(hour.validAt);
    return timestamp >= now - 24 * HOUR && timestamp + HOUR <= now;
  }).reverse();
  return { current, upcoming, recent, stale, retrievedAt: Number.isFinite(oldest) ? new Date(oldest).toISOString() : null };
}

export function compass(degrees: number | null | undefined) {
  if (degrees == null || !Number.isFinite(degrees)) return "—";
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(((degrees % 360 + 360) % 360) / 45) % 8];
}
