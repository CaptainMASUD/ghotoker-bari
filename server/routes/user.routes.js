import express from "express";
import { registerUser, loginUser } from "../controllers/user.controller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Register with file upload
router.post("/register", upload.array("profile_photos"), registerUser);

// Login
router.post("/login", loginUser);

export default router;
