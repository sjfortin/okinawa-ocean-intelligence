CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('verified', 'needs_verification', 'deprecated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_kind AS ENUM ('snorkel', 'shore_dive', 'boat_dive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS sources (
  id text PRIMARY KEY,
  name text NOT NULL,
  canonical_url text NOT NULL,
  publisher text,
  license_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS source_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id text NOT NULL REFERENCES sources(id),
  retrieved_at timestamptz NOT NULL,
  content_hash text NOT NULL,
  storage_uri text,
  http_status integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (source_id, content_hash)
);

CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_key text UNIQUE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  summary text NOT NULL DEFAULT '',
  location geography(Point, 4326),
  location_status verification_status NOT NULL DEFAULT 'needs_verification',
  difficulty smallint CHECK (difficulty BETWEEN 1 AND 5),
  catalog_status verification_status NOT NULL DEFAULT 'needs_verification',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sites_location_gix ON sites USING gist (location);

CREATE TABLE IF NOT EXISTS site_activities (
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  activity activity_kind NOT NULL,
  PRIMARY KEY (site_id, activity)
);

CREATE TABLE IF NOT EXISTS site_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  value jsonb NOT NULL,
  source_snapshot_id uuid NOT NULL REFERENCES source_snapshots(id),
  source_locator text NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'needs_verification',
  valid_from timestamptz,
  valid_to timestamptz,
  supersedes_fact_id uuid REFERENCES site_facts(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_facts_lookup_idx
  ON site_facts (site_id, field_key, verification_status);

CREATE TABLE IF NOT EXISTS site_condition_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  activity activity_kind,
  rule_kind text NOT NULL,
  effect text NOT NULL CHECK (effect IN ('hard_gate', 'penalty', 'preference', 'information')),
  parameters jsonb NOT NULL,
  rationale text NOT NULL,
  source_fact_id uuid REFERENCES site_facts(id),
  verification_status verification_status NOT NULL DEFAULT 'needs_verification',
  engine_compatible_since text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_runs (
  id uuid PRIMARY KEY,
  provider text NOT NULL,
  endpoint text NOT NULL,
  request_parameters jsonb NOT NULL,
  requested_at timestamptz NOT NULL,
  response_received_at timestamptz,
  response_hash text,
  status text NOT NULL CHECK (status IN ('started', 'succeeded', 'failed')),
  error_summary text,
  provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS condition_forecasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_run_id uuid NOT NULL REFERENCES provider_runs(id),
  location geography(Point, 4326) NOT NULL,
  valid_at timestamptz NOT NULL,
  normalized_payload jsonb NOT NULL,
  raw_locator text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_run_id, valid_at)
);

CREATE INDEX IF NOT EXISTS condition_forecasts_location_gix
  ON condition_forecasts USING gist (location);
CREATE INDEX IF NOT EXISTS condition_forecasts_valid_at_idx
  ON condition_forecasts (valid_at);

CREATE TABLE IF NOT EXISTS condition_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  activity activity_kind NOT NULL,
  valid_at timestamptz NOT NULL,
  score numeric(5,2) CHECK (score BETWEEN 0 AND 100),
  grade text NOT NULL,
  gated boolean NOT NULL,
  data_completeness numeric(5,4) NOT NULL,
  reasons jsonb NOT NULL,
  input_forecast_ids uuid[] NOT NULL,
  applied_rule_ids uuid[] NOT NULL,
  engine_version text NOT NULL,
  evaluated_at timestamptz NOT NULL,
  UNIQUE (site_id, activity, valid_at, engine_version)
);

-- Reserved for later RAG. Nothing in Milestone 1 writes embeddings.
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_snapshot_id uuid NOT NULL REFERENCES source_snapshots(id),
  site_id uuid REFERENCES sites(id),
  content text NOT NULL,
  content_hash text NOT NULL,
  embedding vector(1536),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_snapshot_id, content_hash)
);

