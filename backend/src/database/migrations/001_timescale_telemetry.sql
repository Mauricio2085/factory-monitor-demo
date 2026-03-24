-- Requires PostgreSQL with TimescaleDB (e.g. timescale/timescaledb image).
-- Prerequisite: relational schema with production_lines (see schema.sql).

CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE TABLE IF NOT EXISTS machine_telemetry (
  time TIMESTAMPTZ NOT NULL,
  line_id INTEGER NOT NULL REFERENCES production_lines(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  value DOUBLE PRECISION,
  quality SMALLINT,
  metadata JSONB DEFAULT '{}'::jsonb
);

SELECT create_hypertable('machine_telemetry', 'time', if_not_exists => TRUE);

CREATE INDEX IF NOT EXISTS idx_machine_telemetry_line_time
  ON machine_telemetry (line_id, time DESC);
CREATE INDEX IF NOT EXISTS idx_machine_telemetry_tag_time
  ON machine_telemetry (tag, time DESC);

COMMENT ON TABLE machine_telemetry IS 'Time-series telemetry from MQTT/OPC-UA ingestion; partitioned by time';
