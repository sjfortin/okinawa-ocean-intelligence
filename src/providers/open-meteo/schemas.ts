import { z } from "zod";

const nullableNumberArray = z.array(z.number().nullable());

export const weatherResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    temperature_2m: nullableNumberArray,
    precipitation: nullableNumberArray,
    visibility: nullableNumberArray,
    wind_speed_10m: nullableNumberArray,
    wind_direction_10m: nullableNumberArray,
    wind_gusts_10m: nullableNumberArray,
  }),
});

export const marineResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  hourly: z.object({
    time: z.array(z.string()),
    wave_height: nullableNumberArray,
    wave_direction: nullableNumberArray,
    wave_period: nullableNumberArray,
    swell_wave_height: nullableNumberArray,
    swell_wave_direction: nullableNumberArray,
    sea_level_height_msl: nullableNumberArray,
    sea_surface_temperature: nullableNumberArray,
    ocean_current_velocity: nullableNumberArray,
    ocean_current_direction: nullableNumberArray,
  }),
});

export type OpenMeteoWeatherResponse = z.infer<typeof weatherResponseSchema>;
export type OpenMeteoMarineResponse = z.infer<typeof marineResponseSchema>;

