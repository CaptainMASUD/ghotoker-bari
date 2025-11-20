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
} from "../controllers/user.controller.js";
import {
  authenticateUser,
  optionalUserAuth,
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Auth
router.post("/register", upload.array("profile_photos"), registerUser);
router.post("/login", loginUser);

// Me (must be logged in, but no membership/verification requirement)
router.get("/me", authenticateUser, getMe);
router.patch(
  "/me",
  authenticateUser,
  upload.array("profile_photos"),
  updateMe
);
router.patch("/change-password", authenticateUser, changePassword);

// Browse (public; viewer optional)
router.get("/browse", optionalUserAuth, browseUsers);

// Other user's profile (auth optional, used for gating full vs locked)
router.get("/:id/profile", optionalUserAuth, getUserPublicProfile);

export default router;
