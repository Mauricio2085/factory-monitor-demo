import { config } from "../config/env.js";

/**
 * Agreed contract for MQTT → machine_telemetry (Timescale hypertable).
 *
 * Topic (per line): `{prefix}/line/{lineId}/telemetry`
 * Example: `factory/line/1/telemetry`
 *
 * JSON body (UTF-8):
 * - tag (string, required): measurement name, e.g. "motor_rpm"
 * - value (number, optional): reading; may be null if quality is bad
 * - quality (number, optional): OPC-style quality code, smallint
 * - time | source_ts (string, optional): ISO-8601 with offset; defaults to ingest time
 * - metadata (object, optional): extra JSON stored in metadata JSONB
 *
 * When using HTTP POST instead of MQTT, include line_id in the body (required).
 */

export function getTelemetrySubscribePattern(): string {
  const p = config.mqtt.topicPrefix;
  return `${p}/line/+/telemetry`;
}

export function getTelemetryTopicForLine(lineId: number): string {
  const p = config.mqtt.topicPrefix;
  return `${p}/line/${lineId}/telemetry`;
}
