import { env } from "@/config/env";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";
import type { ConditionsProvider, ForecastRequest } from "@/providers/types";
import { createForecastStore, type ForecastStore } from "./store";

export class ForecastStorageError extends Error {
  constructor(cause: unknown) { super("Forecast storage unavailable", { cause }); }
}

export async function fetchAndStoreForecast(request: ForecastRequest, provider: ConditionsProvider, store?: ForecastStore) {
  const forecast = await provider.getForecast(request);
  if (!store) return forecast;
  try {
    const forecastId = await store.save(request, forecast);
    return { ...forecast, forecastId };
  } catch (cause) {
    throw new ForecastStorageError(cause);
  }
}

export async function getForecast(request: ForecastRequest) {
  const provider = new OpenMeteoProvider({
    weatherBaseUrl: env.OPEN_METEO_WEATHER_BASE_URL,
    marineBaseUrl: env.OPEN_METEO_MARINE_BASE_URL,
    timeoutMs: env.PROVIDER_TIMEOUT_MS,
  });
  let store: ForecastStore | undefined;
  if (env.DATABASE_URL) {
    const { queryClient } = await import("@/server/db/client");
    store = createForecastStore(queryClient);
  }
  return fetchAndStoreForecast(request, provider, store);
}
