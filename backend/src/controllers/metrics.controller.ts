import { Request, Response } from "express";
import { MetricsService } from "../services/metrics.service.js";
import { AppError } from "../middleware/errorHandler.js";

const metricsService = new MetricsService();

export const getOEE = async (req: Request, res: Response) => {
  const lineId = parseInt(req.params.id);
  const runId = parseInt(req.query.runId as string);

  if (isNaN(lineId) || isNaN(runId)) {
    throw new AppError("Invalid line ID or run ID", 400);
  }

  const oee = await metricsService.getOEE(lineId, runId);

  if (!oee) {
    throw new AppError("OEE data not found", 404);
  }

  res.json({
    status: "success",
    data: oee,
  });
};

export const getDowntime = async (req: Request, res: Response) => {
  const lineId = parseInt(req.params.id);
  const limit = parseInt(req.query.limit as string) || 10;

  if (isNaN(lineId)) {
    throw new AppError("Invalid line ID", 400);
  }

  const events = await metricsService.getDowntimeEvents(lineId, limit);
  const byCategory = await metricsService.getDowntimeByCategory(lineId);

  res.json({
    status: "success",
    data: {
      events,
      byCategory,
    },
  });
};

export const getQuality = async (req: Request, res: Response) => {
  const lineId = parseInt(req.params.id);
  const runId = parseInt(req.query.runId as string);

  if (isNaN(lineId) || isNaN(runId)) {
    throw new AppError("Invalid line ID or run ID", 400);
  }

  const quality = await metricsService.getQualityMetrics(lineId, runId);

  if (!quality) {
    throw new AppError("Quality data not found", 404);
  }

  res.json({
    status: "success",
    data: quality,
  });
};

export const getMTBFMTTR = async (req: Request, res: Response) => {
  const lineId = parseInt(req.params.id);
  const days = parseInt(req.query.days as string) || 7;

  if (isNaN(lineId)) {
    throw new AppError("Invalid line ID", 400);
  }

  const metrics = await metricsService.getMTBFMTTR(lineId, days);

  res.json({
    status: "success",
    data: metrics,
  });
};
