import express from "express";

import {
  createMembership,
  getPublicMembershipPlans,
  getMembershipsForAdmin,
  getMembershipById,
  updateMembership,
  toggleMembershipStatus,
  deleteMembership,
  assignMembershipToUser,
  ensureDefaultFreePlan,
} from "../controllers/membership.controller.js";

import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   PUBLIC ROUTE
===================================================== */

router.get("/", getPublicMembershipPlans);

/* =====================================================
   ADMIN FIXED ROUTES
   Keep these before /admin/:id
===================================================== */

router.patch("/admin/assign-user", authenticateUser, assignMembershipToUser);
router.post("/admin/ensure-free-plan", authenticateUser, ensureDefaultFreePlan);

/* =====================================================
   ADMIN CRUD ROUTES
===================================================== */

router.post("/admin", authenticateUser, createMembership);
router.get("/admin", authenticateUser, getMembershipsForAdmin);
router.get("/admin/:id", authenticateUser, getMembershipById);
router.patch("/admin/:id", authenticateUser, updateMembership);
router.patch("/admin/:id/status", authenticateUser, toggleMembershipStatus);
router.delete("/admin/:id", authenticateUser, deleteMembership);

export default router;
