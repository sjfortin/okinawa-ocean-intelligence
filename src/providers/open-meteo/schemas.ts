import { z } from "zod";

const nullableNumberArray = z.array(z.number().finite().nullable());

const timestamp = z.number().int().min(-8640000000000).max(8640000000000)
  .transform((seconds) => new Date(seconds * 1000).toISOString());

function validateHours(hourly: { time: string[]; [key: string]: (string | number | null)[] }, ctx: z.RefinementCtx) {
  for (const [field, values] of Object.entries(hourly)) {
    if (values.length !== hourly.time.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: "Hourly array length must match time" });
    }
  }
  if (hourly.time.some((time, index) => index > 0 && Date.parse(time) <= Date.parse(hourly.time[index - 1]))) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["time"], message: "Timestamps must be unique and increasing" });
  }
}

export const weatherResponseSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  hourly_units: z.object({
    time: z.literal("unixtime"),
    temperature_2m: z.literal("°C"),
    precipitation: z.literal("mm"),
    visibility: z.literal("m"),
    wind_speed_10m: z.literal("km/h"),
    wind_direction_10m: z.literal("°"),
    wind_gusts_10m: z.literal("km/h"),
  }),
  hourly: z.object({
    time: z.array(timestamp).min(1),
    temperature_2m: nullableNumberArray,
    precipitation: nullableNumberArray,
    visibility: nullableNumberArray,
    wind_speed_10m: nullableNumberArray,
    wind_direction_10m: nullableNumberArray,
    wind_gusts_10m: nullableNumberArray,
  }).superRefine(validateHours),
});

export const marineResponseSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  hourly_units: z.object({
    time: z.literal("unixtime"),
    wave_height: z.literal("m"),
    wave_direction: z.literal("°"),
    wave_period: z.literal("s"),
    swell_wave_height: z.literal("m"),
    swell_wave_direction: z.literal("°"),
    sea_level_height_msl: z.literal("m"),
    sea_surface_temperature: z.literal("°C"),
    ocean_current_velocity: z.literal("km/h"),
    ocean_current_direction: z.literal("°"),
  }),
  hourly: z.object({
    time: z.array(timestamp).min(1),
    wave_height: nullableNumberArray,
    wave_direction: nullableNumberArray,
    wave_period: nullableNumberArray,
    swell_wave_height: nullableNumberArray,
    swell_wave_direction: nullableNumberArray,
    sea_level_height_msl: nullableNumberArray,
    sea_surface_temperature: nullableNumberArray,
    ocean_current_velocity: nullableNumberArray,
    ocean_current_direction: nullableNumberArray,
  }).superRefine(validateHours),
});

export type OpenMeteoWeatherResponse = z.infer<typeof weatherResponseSchema>;
export type OpenMeteoMarineResponse = z.infer<typeof marineResponseSchema>;
