import { describe, expect, it } from "vitest";
import { compass, forecastView } from "@/domain/forecast-view";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";
import { weather, marine } from "./fixtures/open-meteo/synthetic";

async function fixture() {
  const provider = new OpenMeteoProvider({ fetchImpl: async (url) => new Response(JSON.stringify(String(url).includes("/marine?") ? marine : weather)) });
  const result = await provider.getForecast({ latitude: 26.3594, longitude: 127.7392 });
  result.metadata.forEach((run) => { run.responseReceivedAt = "2026-09-27T00:30:00Z"; });
  result.hours = [0, 1, 2, 25].map((offset) => ({ ...result.hours[0], validAt: new Date(Date.parse("2026-09-27T00:00:00Z") + offset * 3600000).toISOString() }));
  return result;
}

describe("forecast dashboard time semantics", () => {
  it("selects the containing hour, never a future hour as current", async () => {
    const data = await fixture();
    const view = forecastView(data, Date.parse("2026-09-27T00:30:00Z"));
    expect(view.current?.validAt).toBe("2026-09-27T00:00:00.000Z");
    expect(view.upcoming).toHaveLength(2);
    expect(view.stale).toBe(false);
    expect(forecastView(data, Date.parse("2026-09-26T23:59:00Z")).current).toBeNull();
  });
  it("returns completed hours from the past 24 hours, latest first", async () => {
    const data = await fixture();
    const now = Date.parse("2026-09-27T00:30:00Z");
    data.hours = [-25, -24, -23, -1, 0, 1].map((offset) => ({
      ...data.hours[0],
      validAt: new Date(Date.parse("2026-09-27T00:00:00Z") + offset * 3600000).toISOString(),
    }));
    expect(forecastView(data, now).recent.map((hour) => hour.validAt)).toEqual([
      "2026-09-26T23:00:00.000Z",
      "2026-09-26T01:00:00.000Z",
    ]);
  });
  it("expires the current hour and flags old retrievals even if forecast extends forward", async () => {
    const data = await fixture();
    const view = forecastView(data, Date.parse("2026-09-27T03:00:00Z"));
    expect(view.current).toBeNull();
    expect(view.stale).toBe(true);
    expect(view.upcoming).toHaveLength(1);
  });
  it("uses the oldest contributing retrieval and treats missing metadata as stale", async () => {
    const data = await fixture();
    data.metadata[1].responseReceivedAt = "2026-09-26T20:00:00Z";
    expect(forecastView(data, Date.parse("2026-09-27T00:30:00Z")).stale).toBe(true);
    expect(forecastView({ ...data, metadata: [] }, Date.now()).stale).toBe(true);
    expect(forecastView(null, Date.now())).toMatchObject({ current: null, upcoming: [], stale: true });
  });
  it("orders hours without mutating the source and preserves missing wave data", async () => {
    const data = await fixture();
    data.hours.reverse();
    const before = data.hours.map((h) => h.validAt);
    const view = forecastView(data, Date.parse("2026-09-27T00:30:00Z"));
    expect(view.current?.waveHeightM).toBeNull();
    expect(data.hours.map((h) => h.validAt)).toEqual(before);
    expect(view.upcoming[0].validAt).toBe("2026-09-27T01:00:00.000Z");
  });
  it("formats compass bearings and retains unknown direction", () => {
    expect(compass(360)).toBe("N");
    expect(compass(225)).toBe("SW");
    expect(compass(null)).toBe("—");
  });
});
