import { describe, expect, it, vi } from "vitest";
import type { Sql } from "postgres";
import { createForecastStore } from "@/server/forecasts/store";
import { fetchAndStoreForecast, ForecastStorageError } from "@/server/forecasts/service";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";
import { weather, marine } from "./fixtures/open-meteo/synthetic";

const request = { latitude: 26.35, longitude: 127.65, forecastDays: 1 };
async function forecast() {
  const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(weather)).mockResolvedValueOnce(Response.json(marine));
  return new OpenMeteoProvider({ fetchImpl }).getForecast(request);
}

describe("forecast persistence", () => {
  it("keeps the database-free path and returns an ID only after storage succeeds", async () => {
    const result = await forecast();
    const provider = { name: "test", getForecast: vi.fn().mockResolvedValue(result) };
    expect(await fetchAndStoreForecast(request, provider)).toEqual(result);
    const store = { save: vi.fn().mockResolvedValue("saved-id"), load: vi.fn() };
    expect(await fetchAndStoreForecast(request, provider, store)).toEqual({ ...result, forecastId: "saved-id" });
    expect(store.save).toHaveBeenCalledWith(request, result);
    store.save.mockRejectedValue(new Error("database down"));
    await expect(fetchAndStoreForecast(request, provider, store)).rejects.toBeInstanceOf(ForecastStorageError);
  });

  it("never writes a partial result after provider failure", async () => {
    const store = { save: vi.fn(), load: vi.fn() };
    const provider = { name: "test", getForecast: vi.fn().mockRejectedValue(new Error("provider down")) };
    await expect(fetchAndStoreForecast(request, provider, store)).rejects.toThrow("provider down");
    expect(store.save).not.toHaveBeenCalled();
  });

  it("writes hashes, both provider dependencies, and hours inside one transaction", async () => {
    const result = await forecast();
    const tx = vi.fn().mockResolvedValue([]);
    const begin = vi.fn(async (work: (transaction: unknown) => Promise<void>) => work(tx));
    const store = createForecastStore({ begin } as unknown as Sql);
    await store.save(request, result);
    expect(begin).toHaveBeenCalledOnce();
    const inserts = tx.mock.calls.map(([parts, ...values]) => ({ sql: parts.join("?"), values }));
    const runs = inserts.filter((query) => query.sql.includes("INSERT INTO provider_runs"));
    expect(runs).toHaveLength(2);
    expect(runs[0].values).toContain(result.metadata[0].responseHash);
    const links = inserts.filter((query) => query.sql.includes("INSERT INTO condition_forecast_runs"));
    expect(links).toHaveLength(result.hours.length * 2);
    expect(new Set(links.map((query) => query.values[1]))).toEqual(new Set(result.metadata.map((run) => run.runId)));
    const hours = inserts.filter((query) => query.sql.includes("INSERT INTO condition_forecasts ("));
    expect(hours.map((query) => JSON.parse(query.values.at(-1)))).toEqual(result.hours);
  });

  it("rejects orphan run references before opening a transaction", async () => {
    const result = await forecast();
    result.hours[0].providerRunIds = ["missing"];
    const begin = vi.fn();
    await expect(createForecastStore({ begin } as unknown as Sql).save(request, result)).rejects.toThrow("missing or duplicate");
    expect(begin).not.toHaveBeenCalled();
  });

  it("propagates transaction failures instead of returning a forecast ID", async () => {
    const result = await forecast();
    const begin = vi.fn().mockRejectedValue(new Error("transaction rolled back"));
    await expect(createForecastStore({ begin } as unknown as Sql).save(request, result)).rejects.toThrow("transaction rolled back");
  });
});
