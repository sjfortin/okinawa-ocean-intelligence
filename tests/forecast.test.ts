import { describe, expect, it, vi } from "vitest";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";
import { GET } from "@/app/api/sites/[slug]/forecast/route";

const weather = { latitude: 26.4, longitude: 127.7, hourly: {
  time: [1790463600, 1790467200], temperature_2m: [28, 29], precipitation: [0, null], visibility: [10000, null], wind_speed_10m: [12, 15], wind_direction_10m: [90, 90], wind_gusts_10m: [20, 25],
} };
const marine = { latitude: 26.5, longitude: 127.5, hourly: {
  time: [1790467200], wave_height: [null], wave_direction: [90], wave_period: [6], swell_wave_height: [0.4], swell_wave_direction: [100], sea_level_height_msl: [0.1], sea_surface_temperature: [27], ocean_current_velocity: [1.2], ocean_current_direction: [180],
} };

describe("forecast contracts", () => {
  it("joins by UTC instant, preserves missing marine hours/nulls, and requests explicit units", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(weather)).mockResolvedValueOnce(Response.json(marine));
    const result = await new OpenMeteoProvider({ fetchImpl }).getForecast({ latitude: 26.3594, longitude: 127.7392, forecastDays: 2 });
    expect(result.hours[0].validAt).toBe(new Date(1790463600 * 1000).toISOString());
    expect(result.hours[0].seaSurfaceTemperatureC).toBeNull();
    expect(result.hours[1].seaSurfaceTemperatureC).toBe(27);
    expect(result.hours[1].waveHeightM).toBeNull();
    expect(result.hours[1].precipitationMm).toBeNull();
    expect(result.hours[1].providerRunIds).toEqual(result.metadata.map((run) => run.runId));
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
