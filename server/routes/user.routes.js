import express from "express";
import upload from "../middlewares/multer.js";

import {
  registerUser,
  loginUser,
  getMe,
  updateMe,
  changePassword,
  browseUsers,
  getUserPublicProfile,
  removeProfilePhoto,
  updateProfileVisibility,
} from "../controllers/user.controller.js";

import {
  getMyMatches,
  getRecommendedMatches,
  getNearbyMatches,
} from "../controllers/match.controller.js";

import {
  authenticateUser,
  optionalUserAuth,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   AUTH
===================================================== */

router.post("/register", upload.array("profile_photos"), registerUser);
router.post("/login", loginUser);

/* =====================================================
   MY PROFILE
===================================================== */

router.get("/me", authenticateUser, getMe);
router.patch("/me", authenticateUser, upload.array("profile_photos"), updateMe);
router.patch("/change-password", authenticateUser, changePassword);
router.patch("/remove-photo", authenticateUser, removeProfilePhoto);
router.patch("/profile-visibility", authenticateUser, updateProfileVisibility);

/* =====================================================
   MATCH FINDING
   Keep these before /:id/profile
===================================================== */

router.get("/matches", authenticateUser, getMyMatches);
router.get("/matches/recommended", authenticateUser, getRecommendedMatches);
router.get("/matches/nearby", authenticateUser, getNearbyMatches);

/* =====================================================
   PUBLIC USER BROWSE / PROFILE
===================================================== */

router.get("/browse", optionalUserAuth, browseUsers);
router.get("/:id/profile", optionalUserAuth, getUserPublicProfile);

export default router;