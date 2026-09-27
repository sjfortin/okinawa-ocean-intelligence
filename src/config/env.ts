import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url().optional(),
    OPEN_METEO_WEATHER_BASE_URL: z.string().url().default("https://api.open-meteo.com/v1"),
    OPEN_METEO_MARINE_BASE_URL: z
      .string()
      .url()
      .default("https://marine-api.open-meteo.com/v1"),
    PROVIDER_TIMEOUT_MS: z.coerce.number().positive().default(8000),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    OPEN_METEO_WEATHER_BASE_URL: process.env.OPEN_METEO_WEATHER_BASE_URL,
    OPEN_METEO_MARINE_BASE_URL: process.env.OPEN_METEO_MARINE_BASE_URL,
    PROVIDER_TIMEOUT_MS: process.env.PROVIDER_TIMEOUT_MS,
  },
  emptyStringAsUndefined: true,
});

