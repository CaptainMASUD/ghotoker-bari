import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

// ================== ADMIN AUTH ==================
export const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ ok: false, error: "Authentication required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Ensure token is for admin
    if (decoded.type !== "admin") {
      return res.status(403).json({ ok: false, error: "Access denied. Not an admin." });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: "Invalid or expired token." });
  }
};

// ================== USER AUTH ==================
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ ok: false, error: "Authentication required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Ensure token is for user
    if (decoded.type !== "user") {
      return res.status(403).json({ ok: false, error: "Access denied. Not a user." });
    }

    // Find user in DB
    const user = await User.findById(decoded.id).populate("membership");
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found." });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(403).json({ ok: false, error: "Account not verified by admin." });
    }

    // Check if membership is active (optional, e.g., for chat)
    const now = new Date();
    if (!user.membership || !user.membership_expiry || user.membership_expiry < now) {
      return res.status(403).json({ ok: false, error: "Membership inactive. Please purchase membership." });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: "Invalid or expired token." });
  }
};
