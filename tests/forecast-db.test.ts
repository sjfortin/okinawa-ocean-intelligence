import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres, { type Sql } from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createForecastStore } from "@/server/forecasts/store";
import { OpenMeteoProvider } from "@/providers/open-meteo/client";
import { weather, marine } from "./fixtures/open-meteo/synthetic";

// Use an explicitly selected disposable test database with PostGIS and vector installed.
describe.skipIf(!process.env.TEST_DATABASE_URL)("PostgreSQL forecast transactions", () => {
  let admin: Sql;
  let sql: Sql;
  const schema = `forecast_test_${randomUUID().replaceAll("-", "")}`;
  beforeAll(async () => {
    admin = postgres(process.env.TEST_DATABASE_URL!, { max: 1 });
    const extensions = await admin`SELECT extname FROM pg_extension WHERE extname IN ('postgis', 'vector')`;
    if (extensions.length !== 2) throw new Error("Test database must have PostGIS and vector installed in public");
    await admin.unsafe(`CREATE SCHEMA ${schema}`);
    sql = postgres(process.env.TEST_DATABASE_URL!, { max: 1, connection: { search_path: `${schema},public` } });
    for (const name of ["0001_initial.sql", "0002_forecast_batches.sql"]) {
      await sql.unsafe(await readFile(new URL(`../src/server/db/migrations/${name}`, import.meta.url), "utf8"));
    }
  }, 30000);
  afterAll(async () => {
    await sql?.end();
    if (admin) {
      await admin.unsafe(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
      await admin.end();
    }
  });

  it("round-trips complete provenance and rolls back an invalid batch", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json(weather)).mockResolvedValueOnce(Response.json(marine));
    const request = { latitude: 26.35, longitude: 127.65 };
    const forecast = await new OpenMeteoProvider({ fetchImpl }).getForecast(request);
    const store = createForecastStore(sql);
    const id = await store.save(request, forecast);
    expect(await store.load(id)).toEqual(forecast);
    expect(await store.load(randomUUID())).toBeNull();
    const links = await sql`SELECT * FROM condition_forecast_runs`;
    expect(links).toHaveLength(forecast.hours.length * 2);

    const invalid = structuredClone(forecast);
    const ids = invalid.metadata.map((run) => { run.runId = randomUUID(); return run.runId; });
    invalid.hours.forEach((hour) => { hour.providerRunIds = ids; });
    invalid.hours.push(invalid.hours[0]); // Unique batch/time constraint must abort every insert.
    await expect(store.save(request, invalid)).rejects.toThrow();
    expect(await sql`SELECT id FROM forecast_batches`).toHaveLength(1);
    expect(await sql`SELECT id FROM provider_runs`).toHaveLength(2);
    expect(await sql`SELECT id FROM condition_forecasts`).toHaveLength(forecast.hours.length);
  });
});
