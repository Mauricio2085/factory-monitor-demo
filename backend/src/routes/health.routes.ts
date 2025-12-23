import { Router, Request, Response } from "express";
import { query } from "../config/database.js";

const router = Router();

router.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    const result = await query("SELECT NOW()");

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: "connected",
      dbTime: result.rows[0].now,
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: "Service unavailable",
      database: "disconnected",
    });
  }
});

export default router;
