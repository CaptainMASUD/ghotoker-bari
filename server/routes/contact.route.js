import express from "express";

import {
  createContactMessage,
  getContactsForAdmin,
  getContactByIdForAdmin,
  deleteContactByAdmin,
  getContactStatsForAdmin,
} from "../controllers/contact.controller.js";

import { authenticateAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   PUBLIC CONTACT
   Anyone can send contact message
===================================================== */

router.post("/", createContactMessage);

/* =====================================================
   ADMIN CONTACT MANAGEMENT
   Admin can only view and delete contacts
===================================================== */

router.use("/admin", authenticateAdmin);

router.get("/admin/stats", getContactStatsForAdmin);
router.get("/admin", getContactsForAdmin);
router.get("/admin/:id", getContactByIdForAdmin);
router.delete("/admin/:id", deleteContactByAdmin);

export default router;