import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();
router.get("/stats", requireAuth, getDashboardStats);

export default router;
