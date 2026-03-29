import { z } from "zod";
import pool from "../config/database.js";

const telemetryPayloadSchema = z
  .object({
    tag: z.string().min(1).max(512),
    value: z.number().finite().optional().nullable(),
    quality: z.number().int().min(-32768).max(32767).optional().nullable(),
    time: z.string().datetime({ offset: true }).optional(),
    source_ts: z.string().datetime({ offset: true }).optional(),
    metadata: z.record(z.unknown()).optional(),
    line_id: z.number().int().positive().optional(),
  })
  .strict();

export type TelemetryPayloadInput = z.infer<typeof telemetryPayloadSchema>;

function resolveEventTime(parsed: TelemetryPayloadInput): Date {
  const iso = parsed.time ?? parsed.source_ts;
  if (iso) return new Date(iso);
  return new Date();
}

export async function insertTelemetryPoint(
  lineId: number,
  raw: unknown
): Promise<{ rowCount: number }> {
  const parsed = telemetryPayloadSchema.parse(raw);
  const eventTime = resolveEventTime(parsed);
  const metadata = parsed.metadata ?? {};

  const result = await pool.query(
    `INSERT INTO machine_telemetry (time, line_id, tag, value, quality, metadata)
     VALUES ($1::timestamptz, $2, $3, $4, $5, $6::jsonb)`,
    [
      eventTime.toISOString(),
      lineId,
      parsed.tag,
      parsed.value ?? null,
      parsed.quality ?? null,
      JSON.stringify(metadata),
    ]
  );

  return { rowCount: result.rowCount ?? 0 };
}

export function parseTelemetryPayload(raw: unknown): TelemetryPayloadInput {
  return telemetryPayloadSchema.parse(raw);
}

/**
 * Parses `{prefix}/line/{id}/telemetry` (prefix from MQTT_TOPIC_PREFIX, no trailing slash).
 */
export function parseLineIdFromTelemetryTopic(
  topic: string,
  topicPrefix: string
): number | null {
  const suffix = "/telemetry";
  if (!topic.endsWith(suffix)) return null;
  const head = `${topicPrefix}/line/`;
  if (!topic.startsWith(head)) return null;
  const idStr = topic.slice(head.length, -suffix.length);
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id) || id < 1) return null;
  return id;
}
