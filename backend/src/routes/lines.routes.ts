import { Router } from "express";
import {
  getAllLines,
  getLineById,
  getLineStats,
} from "../controllers/lines.controller.js";

const router = Router();

router.get("/", getAllLines);
router.get("/:id", getLineById);
router.get("/:id/stats", getLineStats);

export default router;
