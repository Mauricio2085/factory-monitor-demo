import { Request, Response } from "express";
import { LinesService } from "../services/lines.service.js";
import { AppError } from "../middleware/errorHandler.js";

const linesService = new LinesService();

export const getAllLines = async (req: Request, res: Response) => {
  const lines = await linesService.getAllLines();
  res.json({
    status: "success",
    data: lines,
  });
};

export const getLineById = async (req: Request, res: Response) => {
  const lineId = parseInt(req.params.id);

  if (isNaN(lineId)) {
    throw new AppError("Invalid line ID", 400);
  }

  const line = await linesService.getLineById(lineId);

  if (!line) {
    throw new AppError("Production line not found", 404);
  }

  res.json({
    status: "success",
    data: line,
  });
};

export const getLineStats = async (req: Request, res: Response) => {
  const lineId = parseInt(req.params.id);

  if (isNaN(lineId)) {
    throw new AppError("Invalid line ID", 400);
  }

  const stats = await linesService.getLineStats(lineId);

  if (!stats) {
    throw new AppError("Production line or current run not found", 404);
  }

  res.json({
    status: "success",
    data: stats,
  });
};
