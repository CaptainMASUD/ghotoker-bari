import express from "express";

import {
  getAdminOverview,
  getAdminOverviewStats,
  getAdminRecentActivity,
} from "../controllers/adminOverview.controller.js";

import { authenticateAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   ADMIN OVERVIEW ROUTES
   Base path: /api/admin/overview
===================================================== */

router.use(authenticateAdmin);

router.get("/", getAdminOverview);
router.get("/stats", getAdminOverviewStats);
router.get("/recent", getAdminRecentActivity);

export default router;