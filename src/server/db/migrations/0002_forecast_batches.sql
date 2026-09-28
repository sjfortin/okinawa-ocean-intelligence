-- A merged hourly record depends on multiple independently retrieved provider runs.
CREATE TABLE IF NOT EXISTS forecast_batches (
  id uuid PRIMARY KEY,
  request jsonb NOT NULL,
  warnings jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forecast_batch_runs (
  batch_id uuid NOT NULL REFERENCES forecast_batches(id),
  provider_run_id uuid NOT NULL REFERENCES provider_runs(id),
  ordinal integer NOT NULL CHECK (ordinal >= 0),
  PRIMARY KEY (batch_id, provider_run_id),
  UNIQUE (batch_id, ordinal)
);

ALTER TABLE condition_forecasts
  ADD COLUMN IF NOT EXISTS batch_id uuid REFERENCES forecast_batches(id);

CREATE UNIQUE INDEX IF NOT EXISTS condition_forecasts_batch_time_idx
  ON condition_forecasts (batch_id, valid_at);

CREATE TABLE IF NOT EXISTS condition_forecast_runs (
  forecast_id uuid NOT NULL REFERENCES condition_forecasts(id),
  provider_run_id uuid NOT NULL REFERENCES provider_runs(id),
  PRIMARY KEY (forecast_id, provider_run_id)
);

-- Preserve provenance for any records written using the initial schema.
INSERT INTO condition_forecast_runs (forecast_id, provider_run_id)
SELECT id, provider_run_id FROM condition_forecasts
ON CONFLICT DO NOTHING;
