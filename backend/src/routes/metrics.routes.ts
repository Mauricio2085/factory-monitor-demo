import { Router } from "express";
import {
  getOEE,
  getDowntime,
  getQuality,
  getMTBFMTTR,
} from "../controllers/metrics.controller.js";

const router = Router();

router.get("/:id/oee", getOEE);
router.get("/:id/downtime", getDowntime);
router.get("/:id/quality", getQuality);
router.get("/:id/maintenance", getMTBFMTTR);

export default router;
