import { createHash, randomUUID } from "node:crypto";
import type { NormalizedConditions } from "@/domain/conditions";
import type {
  ConditionsProvider,
  ForecastRequest,
  ForecastResult,
  ProviderMetadata,
} from "@/providers/types";
import {
  marineResponseSchema,
  weatherResponseSchema,
  type OpenMeteoMarineResponse,
  type OpenMeteoWeatherResponse,
} from "./schemas";

const WEATHER_FIELDS = [
  "temperature_2m",
  "precipitation",
  "visibility",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
] as const;

const MARINE_FIELDS = [
  "wave_height",
  "wave_direction",
  "wave_period",
  "swell_wave_height",
  "swell_wave_direction",
  "sea_level_height_msl",
  "sea_surface_temperature",
  "ocean_current_velocity",
  "ocean_current_direction",
] as const;

interface OpenMeteoConfig {
  weatherBaseUrl?: string;
  marineBaseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

function valueAt(values: (number | null)[], index: number): number | null {
  return values[index] ?? null;
}

function indexByTime(times: string[]): Map<string, number> {
  return new Map(times.map((time, index) => [time, index]));
}

function mergeForecasts(
  weather: OpenMeteoWeatherResponse,
  marine: OpenMeteoMarineResponse,
  providerRunIds: string[],
): NormalizedConditions[] {
  const marineIndexes = indexByTime(marine.hourly.time);

  return weather.hourly.time.map((validAt, weatherIndex) => {
    const marineIndex = marineIndexes.get(validAt);
    const m = marineIndex === undefined ? null : marineIndex;
    return {
      validAt,
      latitude: weather.latitude,
      longitude: weather.longitude,
      airTemperatureC: valueAt(weather.hourly.temperature_2m, weatherIndex),
      precipitationMm: valueAt(weather.hourly.precipitation, weatherIndex),
      visibilityM: valueAt(weather.hourly.visibility, weatherIndex),
      windSpeedKph: valueAt(weather.hourly.wind_speed_10m, weatherIndex),
      windDirectionDeg: valueAt(weather.hourly.wind_direction_10m, weatherIndex),
      windGustKph: valueAt(weather.hourly.wind_gusts_10m, weatherIndex),
      waveHeightM: m === null ? null : valueAt(marine.hourly.wave_height, m),
      waveDirectionDeg: m === null ? null : valueAt(marine.hourly.wave_direction, m),
      wavePeriodS: m === null ? null : valueAt(marine.hourly.wave_period, m),
      swellHeightM: m === null ? null : valueAt(marine.hourly.swell_wave_height, m),
      swellDirectionDeg:
        m === null ? null : valueAt(marine.hourly.swell_wave_direction, m),
      seaLevelHeightMslM:
        m === null ? null : valueAt(marine.hourly.sea_level_height_msl, m),
      seaSurfaceTemperatureC:
        m === null ? null : valueAt(marine.hourly.sea_surface_temperature, m),
      oceanCurrentVelocityKph:
        m === null ? null : valueAt(marine.hourly.ocean_current_velocity, m),
      oceanCurrentDirectionDeg:
        m === null ? null : valueAt(marine.hourly.ocean_current_direction, m),
      providerRunIds,
    };
  });
}

export class OpenMeteoProvider implements ConditionsProvider {
  readonly name = "open-meteo";
  private readonly weatherBaseUrl: string;
  private readonly marineBaseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(config: OpenMeteoConfig = {}) {
    this.weatherBaseUrl = config.weatherBaseUrl ?? "https://api.open-meteo.com/v1";
    this.marineBaseUrl = config.marineBaseUrl ?? "https://marine-api.open-meteo.com/v1";
    this.timeoutMs = config.timeoutMs ?? 8_000;
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async getForecast(request: ForecastRequest): Promise<ForecastResult> {
    const common = new URLSearchParams({
      latitude: String(request.latitude),
      longitude: String(request.longitude),
      timezone: request.timezone ?? "Asia/Tokyo",
      forecast_days: String(request.forecastDays ?? 7),
      timeformat: "unixtime",
      wind_speed_unit: "kmh",
    });
    const weatherUrl = new URL(`${this.weatherBaseUrl}/forecast`);
    weatherUrl.search = common.toString();
    weatherUrl.searchParams.set("hourly", WEATHER_FIELDS.join(","));
    weatherUrl.searchParams.set("temperature_unit", "celsius");
    weatherUrl.searchParams.set("precipitation_unit", "mm");

    const marineUrl = new URL(`${this.marineBaseUrl}/marine`);
    marineUrl.search = common.toString();
    marineUrl.searchParams.set("hourly", MARINE_FIELDS.join(","));
    marineUrl.searchParams.set("length_unit", "metric");

    const requestedAt = new Date().toISOString();
    const weatherRunId = randomUUID();
    const marineRunId = randomUUID();
    const signal = AbortSignal.timeout(this.timeoutMs);
    const [weatherResponse, marineResponse] = await Promise.all([
      this.fetchImpl(weatherUrl, { signal }),
      this.fetchImpl(marineUrl, { signal }),
    ]);

    if (!weatherResponse.ok || !marineResponse.ok) {
      throw new Error(
        `Open-Meteo request failed (weather=${weatherResponse.status}, marine=${marineResponse.status})`,
      );
    }

    const [weatherBody, marineBody] = await Promise.all([
      weatherResponse.text(),
      marineResponse.text(),
    ]);
    const weather = weatherResponseSchema.parse(JSON.parse(weatherBody));
    const marine = marineResponseSchema.parse(JSON.parse(marineBody));
    const responseReceivedAt = new Date().toISOString();
    const metadata: ProviderMetadata[] = [
      {
        provider: "open-meteo-weather",
        runId: weatherRunId,
        requestedAt,
        responseReceivedAt,
        endpoint: weatherUrl.origin + weatherUrl.pathname,
        requestParameters: Object.fromEntries(weatherUrl.searchParams),
        responseHash: createHash("sha256").update(weatherBody).digest("hex"),
        requestedLocation: { latitude: request.latitude, longitude: request.longitude },
        gridLocation: { latitude: weather.latitude, longitude: weather.longitude },
      },
      {
        provider: "open-meteo-marine",
        runId: marineRunId,
        requestedAt,
        responseReceivedAt,
        endpoint: marineUrl.origin + marineUrl.pathname,
        requestParameters: Object.fromEntries(marineUrl.searchParams),
        responseHash: createHash("sha256").update(marineBody).digest("hex"),
        requestedLocation: { latitude: request.latitude, longitude: request.longitude },
        gridLocation: { latitude: marine.latitude, longitude: marine.longitude },
      },
    ];

    return {
      metadata,
      hours: mergeForecasts(weather, marine, [weatherRunId, marineRunId]),
      warnings: [
        "Forecasts are planning inputs, not a declaration that entry is safe.",
        "Open-Meteo sea_level_height_msl is not suitable for coastal navigation and may be unreliable near shore.",
      ],
    };
  }
}
