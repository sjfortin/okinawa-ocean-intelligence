import { randomUUID } from "node:crypto";
import type { Sql } from "postgres";
import type { ForecastRequest, ForecastResult, ProviderMetadata } from "@/providers/types";
import type { NormalizedConditions } from "@/domain/conditions";

export interface ForecastStore {
  save(request: ForecastRequest, forecast: ForecastResult): Promise<string>;
  load(id: string): Promise<ForecastResult | null>;
}

export function createForecastStore(sql: Sql): ForecastStore {
  return {
    async save(request, forecast) {
      const runs = new Set(forecast.metadata.map((run) => run.runId));
      if (!runs.size || runs.size !== forecast.metadata.length || !forecast.hours.length) {
        throw new Error("A forecast requires unique provider runs and at least one hour");
      }
      for (const hour of forecast.hours) {
        if (!hour.providerRunIds.length || new Set(hour.providerRunIds).size !== hour.providerRunIds.length || hour.providerRunIds.some((id) => !runs.has(id))) {
          throw new Error("Forecast hour references missing or duplicate provider runs");
        }
      }
      const batchId = randomUUID();
      await sql.begin(async (tx) => {
        await tx`INSERT INTO forecast_batches (id, request, warnings)
          VALUES (${batchId}, ${JSON.stringify(request)}::jsonb, ${JSON.stringify(forecast.warnings)}::jsonb)`;
        for (const [ordinal, run] of forecast.metadata.entries()) {
          await tx`INSERT INTO provider_runs
            (id, provider, endpoint, request_parameters, requested_at, response_received_at, response_hash, status, provider_metadata)
            VALUES (${run.runId}, ${run.provider}, ${run.endpoint}, ${JSON.stringify(run.requestParameters)}::jsonb,
              ${run.requestedAt}, ${run.responseReceivedAt}, ${run.responseHash}, 'succeeded', ${JSON.stringify(run)}::jsonb)`;
          await tx`INSERT INTO forecast_batch_runs (batch_id, provider_run_id, ordinal)
            VALUES (${batchId}, ${run.runId}, ${ordinal})`;
        }
        for (const hour of forecast.hours) {
          const forecastId = randomUUID();
          // Retain the legacy primary run column; the junction is the full dependency set.
          await tx`INSERT INTO condition_forecasts (id, batch_id, provider_run_id, location, valid_at, normalized_payload)
            VALUES (${forecastId}, ${batchId}, ${hour.providerRunIds[0]},
              ST_SetSRID(ST_MakePoint(${hour.longitude}, ${hour.latitude}), 4326)::geography,
              ${hour.validAt}, ${JSON.stringify(hour)}::jsonb)`;
          for (const runId of hour.providerRunIds) {
            await tx`INSERT INTO condition_forecast_runs (forecast_id, provider_run_id) VALUES (${forecastId}, ${runId})`;
          }
        }
      });
      return batchId;
    },
    async load(id) {
      const [batch] = await sql<{ warnings: string[] }[]>`SELECT warnings FROM forecast_batches WHERE id = ${id}`;
      if (!batch) return null;
      const runs = await sql<{ provider_metadata: ProviderMetadata }[]>`
        SELECT r.provider_metadata FROM forecast_batch_runs b
        JOIN provider_runs r ON r.id = b.provider_run_id
        WHERE b.batch_id = ${id} ORDER BY b.ordinal`;
      const hours = await sql<{ normalized_payload: NormalizedConditions }[]>`
        SELECT normalized_payload FROM condition_forecasts WHERE batch_id = ${id} ORDER BY valid_at`;
      return { metadata: runs.map((run) => run.provider_metadata), hours: hours.map((hour) => hour.normalized_payload), warnings: batch.warnings };
    },
  };
}
