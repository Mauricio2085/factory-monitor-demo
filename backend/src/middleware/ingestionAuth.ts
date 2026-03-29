import { Request, Response, NextFunction } from "express";
import { config } from "../config/env.js";

export function requireIngestionToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const expected = config.ingestion.token;
  if (!expected) {
    return res.status(503).json({
      status: "error",
      message: "Telemetry HTTP ingestion is not configured (set INGESTION_TOKEN)",
    });
  }

  const header =
    (typeof req.headers["x-ingestion-token"] === "string" &&
      req.headers["x-ingestion-token"]) ||
    (typeof req.headers.authorization === "string" &&
      req.headers.authorization.replace(/^Bearer\s+/i, "")) ||
    "";

  if (header !== expected) {
    return res.status(401).json({
      status: "error",
      message: "Unauthorized",
    });
  }

  next();
}
