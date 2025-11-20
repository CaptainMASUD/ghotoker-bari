// routes/membership.routes.js
import express from "express";
import {
  createMembership,
  getMemberships,
  assignMembership,
} from "../controllers/membership.controller.js";
import { authenticateAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// ====== ADMIN MEMBERSHIP MANAGEMENT ======
router.post("/", authenticateAdmin, createMembership);        // create plan
router.get("/", getMemberships);                              // list all plans
router.post("/assign", authenticateAdmin, assignMembership);  // assign plan to any user

export default router;
