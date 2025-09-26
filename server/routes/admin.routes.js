import express from "express";
import Admin from "../models/admin.model.js";
import {
  registerAdmin,
  loginAdmin,
  verifyUser,
  getAllUsers,
  deleteUser,
  getMe,
  verifyAdmin,
} from "../controllers/admin.controller.js";
import { authenticateAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

const requireVerifiedAdmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId).select("isVerified");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (!admin.isVerified) {
      return res.status(403).json({ message: "Admin not verified" });
    }
    next();
  } catch (e) {
    res.status(500).json({ message: "Verification check failed", error: e.message });
  }
};

const requireSuperadmin = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.adminId).select("role");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    if (admin.role !== "superadmin") {
      return res.status(403).json({ message: "Superadmin only" });
    }
    next();
  } catch (e) {
    res.status(500).json({ message: "Role check failed", error: e.message });
  }
};

// ====== AUTH ======
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);

// Self profile for frontend guard
router.get("/me", authenticateAdmin, getMe);

// ====== ADMIN MANAGEMENT ======
router.put("/verify-admin/:adminId", authenticateAdmin, requireSuperadmin, verifyAdmin);

// ====== USER MANAGEMENT (verified admins only) ======
router.get("/users", authenticateAdmin, requireVerifiedAdmin, getAllUsers);
router.put("/verify/:userId", authenticateAdmin, requireVerifiedAdmin, verifyUser);
router.delete("/users/:userId", authenticateAdmin, requireVerifiedAdmin, deleteUser);

export default router;
