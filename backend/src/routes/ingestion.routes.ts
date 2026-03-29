import { Router } from "express";
import { postTelemetry } from "../controllers/ingestion.controller.js";
import { requireIngestionToken } from "../middleware/ingestionAuth.js";

const router = Router();

router.post("/telemetry", requireIngestionToken, postTelemetry);

export default router;
