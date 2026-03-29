import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middleware/errorHandler.js";
import { insertTelemetryPoint } from "../services/telemetry-ingestion.service.js";

const httpBodySchema = z
  .object({
    line_id: z.number().int().positive(),
    tag: z.string().min(1).max(512),
    value: z.number().finite().optional().nullable(),
    quality: z.number().int().min(-32768).max(32767).optional().nullable(),
    time: z.string().datetime({ offset: true }).optional(),
    source_ts: z.string().datetime({ offset: true }).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .strict();

export async function postTelemetry(req: Request, res: Response) {
  const parsed = httpBodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(parsed.error.message, 400);
  }

  const { line_id, ...rest } = parsed.data;
  await insertTelemetryPoint(line_id, rest);

  res.status(201).json({ status: "ok", inserted: 1 });
}
