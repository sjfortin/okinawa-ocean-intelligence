import { createHash } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";
import { GET } from "@/app/api/sites/[slug]/forecast/route";

import { weather, marine } from "./fixtures/open-meteo/synthetic";

describe("forecast contracts", () => {
  it.each([
    ["unexpected units", (data: typeof weather) => { data.hourly_units.wind_speed_10m = "mp/h"; }],
    ["missing units", (data: typeof weather) => { Reflect.deleteProperty(data, "hourly_units"); }],
    ["short array", (data: typeof weather) => { data.hourly.visibility.pop(); }],
    ["duplicate time", (data: typeof weather) => { data.hourly.time[1] = data.hourly.time[0]; }],
    ["reversed time", (data: typeof weather) => { data.hourly.time.reverse(); }],
    ["invalid timestamp", (data: typeof weather) => { data.hourly.time[0] = 1e16; }],
    ["invalid coordinate", (data: typeof weather) => { data.latitude = 91; }],
  ])("rejects %s instead of silently normalizing it", async (_label, mutate) => {
    const malformed = structuredClone(weather);
    mutate(malformed);
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(malformed)).mockResolvedValueOnce(Response.json(marine));
    await expect(new OpenMeteoProvider({ fetchImpl }).getForecast({ latitude: 26, longitude: 127 })).rejects.toThrow();
  });
  it("rejects marine unit drift independently", async () => {
    const malformed = structuredClone(marine);
    malformed.hourly_units.ocean_current_velocity = "m/s";
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(weather)).mockResolvedValueOnce(Response.json(malformed));
    await expect(new OpenMeteoProvider({ fetchImpl }).getForecast({ latitude: 26, longitude: 127 })).rejects.toThrow();
  });
  it("joins by UTC instant, preserves missing marine hours/nulls, and requests explicit units", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(weather)).mockResolvedValueOnce(Response.json(marine));
    const result = await new OpenMeteoProvider({ fetchImpl }).getForecast({ latitude: 26.3594, longitude: 127.7392, forecastDays: 2 });
    expect(result.metadata[0].responseHash).toBe(createHash("sha256").update(JSON.stringify(weather)).digest("hex"));
    expect(result.metadata[1].responseHash).toBe(createHash("sha256").update(JSON.stringify(marine)).digest("hex"));
    expect(result.metadata[0].requestParameters).toMatchObject({ latitude: "26.3594", forecast_days: "2", temperature_unit: "celsius" });
    expect(result.hours[0].validAt).toBe(new Date(1790463600 * 1000).toISOString());
    expect(result.hours[0].seaSurfaceTemperatureC).toBeNull();
    expect(result.hours[1].seaSurfaceTemperatureC).toBe(27);
    expect(result.hours[1].waveHeightM).toBeNull();
    expect(result.hours[1].precipitationMm).toBeNull();
    expect(result.hours[1].providerRunIds).toEqual(result.metadata.map((run) => run.runId));
    expect(result.metadata.map((run) => run.gridLocation)).toEqual([
      { latitude: 26.4, longitude: 127.7 },
      { latitude: 26.5, longitude: 127.5 },
    ]);
    expect(result.metadata.every((run) => run.requestedLocation.latitude === 26.3594 && run.requestedLocation.longitude === 127.7392)).toBe(true);
    for (const call of fetchImpl.mock.calls) {
      const url = new URL(String(call[0]));
      expect(url.searchParams.get("timeformat")).toBe("unixtime");
      expect(url.searchParams.get("wind_speed_unit")).toBe("kmh");
    }
  });
  it("fails the combined forecast on a provider failure", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(weather)).mockResolvedValueOnce(new Response("", { status: 503 }));
    await expect(new OpenMeteoProvider({ fetchImpl }).getForecast({ latitude: 26, longitude: 127 })).rejects.toThrow("marine=503");
  });
  it("does not request forecasts for unknown or unlocated sites", async () => {
    expect((await GET(new Request("http://localhost"), { params: Promise.resolve({ slug: "unknown" }) })).status).toBe(404);
    expect((await GET(new Request("http://localhost"), { params: Promise.resolve({ slug: "sunabe-seawall" }) })).status).toBe(422);
  });
  it("returns Kadena's sourced preview and handles outages", async () => {
    const spy = vi.spyOn(OpenMeteoProvider.prototype, "getForecast").mockResolvedValue({ hours: [], metadata: [], warnings: [] });
    try {
      const context = { params: Promise.resolve({ slug: "kadena-north" }) };
      const response = await GET(new Request("http://localhost"), context);
      expect(response.status).toBe(200);
      expect((await response.json()).forecastPoint.status).toBe("needs_verification");
      expect(spy).toHaveBeenCalledWith({ latitude: 26.3594, longitude: 127.7392, forecastDays: 2 });
      spy.mockRejectedValue(new Error("outage"));
      expect((await GET(new Request("http://localhost"), context)).status).toBe(502);
    } finally { spy.mockRestore(); }
  });
});
