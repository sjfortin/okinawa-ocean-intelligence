import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";
import manifest from "./fixtures/open-meteo/2026-09-28/manifest.json";

describe("recorded Okinawa forecast contract", () => {
  it("replays the unmodified response pair with matching hashes, units, grids, and timestamps", async () => {
    const bodies = await Promise.all(manifest.metadata.map((run) => readFile(
      new URL(`./fixtures/open-meteo/2026-09-28/${run.provider}.json`, import.meta.url), "utf8",
    )));
    for (const [index, body] of bodies.entries()) {
      expect(createHash("sha256").update(body).digest("hex")).toBe(manifest.metadata[index].responseHash);
    }
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(new Response(bodies[0])).mockResolvedValueOnce(new Response(bodies[1]));
    const result = await new OpenMeteoProvider({ fetchImpl }).getForecast(manifest.request);
    expect(result.hours).toHaveLength(24);
    for (const [index, run] of result.metadata.entries()) {
      expect(run.requestParameters).toEqual(manifest.metadata[index].requestParameters);
      expect(run.gridLocation).toEqual(manifest.metadata[index].gridLocation);
      expect(run.responseHash).toBe(manifest.metadata[index].responseHash);
    }
    const rawWeather = JSON.parse(bodies[0]);
    const rawMarine = JSON.parse(bodies[1]);
    for (const [index, hour] of result.hours.entries()) {
      expect(hour.validAt).toBe(new Date(rawWeather.hourly.time[index] * 1000).toISOString());
      expect(hour.windSpeedKph).toBe(rawWeather.hourly.wind_speed_10m[index]);
      const marineIndex = rawMarine.hourly.time.indexOf(rawWeather.hourly.time[index]);
      expect(hour.waveHeightM).toBe(marineIndex < 0 ? null : rawMarine.hourly.wave_height[marineIndex]);
      expect(hour.oceanCurrentVelocityKph).toBe(marineIndex < 0 ? null : rawMarine.hourly.ocean_current_velocity[marineIndex]);
    }
  });
});
