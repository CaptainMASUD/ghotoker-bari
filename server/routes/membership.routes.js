import express from "express";
import {
  createMembership,
  getMemberships,
  assignMembership,
} from "../controllers/membership.controller.js";
import { authenticateAdmin } from "../middlewares//auth.middleware.js";

const router = express.Router();

// ====== MEMBERSHIP MANAGEMENT ======
// Only admins can create or assign memberships
router.post("/", authenticateAdmin, createMembership);
router.get("/", getMemberships);
router.post("/assign", authenticateAdmin, assignMembership);

export default router;
