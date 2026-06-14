import express from "express";
import upload from "../middlewares/multer.js";

import {
  registerUser,
  registerSuperAdminPublic,
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
   TEMP PUBLIC SUPERADMIN REGISTER
   Remove after creating your first superadmin.
===================================================== */

router.post("/register-superadmin", registerSuperAdminPublic);

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
   Keep before /:id/profile
===================================================== */

router.get("/matches", authenticateUser, getMyMatches);
router.get("/matches/recommended", authenticateUser, getRecommendedMatches);
router.get("/matches/nearby", authenticateUser, getNearbyMatches);

/* =====================================================
   PUBLIC BROWSE / PROTECTED PROFILE DETAILS
===================================================== */

router.get("/browse", optionalUserAuth, browseUsers);

/*
  Profile detail needs login.
  Full detail depends on active membership + plan features.
*/
router.get("/:id/profile", authenticateUser, getUserPublicProfile);

export default router;