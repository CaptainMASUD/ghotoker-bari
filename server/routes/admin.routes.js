import express from "express";
import upload from "../middlewares/multer.js";

import {
  createUserByAdmin,
  getUsersForAdmin,
  getUserByIdForAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  verifyUserProfile,
  updateUserAccountStatus,

  createAdminUser,
  getAdminUsers,
  updateAdminUser,
  verifyAdminUser,
  updateAdminStatus,
  resetAdminPassword,
} from "../controllers/admin.controller.js";

import { authenticateAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticateAdmin);

/* =====================================================
   ADMIN CRUD: NORMAL USERS
===================================================== */

router.post("/users", upload.array("profile_photos"), createUserByAdmin);
router.get("/users", getUsersForAdmin);
router.get("/users/:id", getUserByIdForAdmin);
router.patch("/users/:id", upload.array("profile_photos"), updateUserByAdmin);
router.delete("/users/:id", deleteUserByAdmin);

/* User verification/status */
router.patch("/users/:id/verify", verifyUserProfile);
router.patch("/users/:id/status", updateUserAccountStatus);

/* =====================================================
   SUPERADMIN: STAFF MANAGEMENT
===================================================== */

router.post("/staff", createAdminUser);
router.get("/staff", getAdminUsers);
router.patch("/staff/:id", updateAdminUser);
router.patch("/staff/:id/verify", verifyAdminUser);
router.patch("/staff/:id/status", updateAdminStatus);
router.patch("/staff/:id/password", resetAdminPassword);

export default router;