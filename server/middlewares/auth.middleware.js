// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

// ================== ADMIN AUTH (unchanged) ==================
export const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ ok: false, error: "Authentication required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type !== "admin") {
      return res
        .status(403)
        .json({ ok: false, error: "Access denied. Not an admin." });
    }

    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ ok: false, error: "Invalid or expired token." });
  }
};

// ================== USER AUTH (no verification/membership checks) ==================
export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ ok: false, error: "Authentication required." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // If token has a type, ensure it's "user". If no type, allow.
    if (decoded.type && decoded.type !== "user") {
      return res
        .status(403)
        .json({ ok: false, error: "Access denied. Not a user token." });
    }

    const user = await User.findById(decoded.id).populate("membership");
    if (!user) {
      return res.status(404).json({ ok: false, error: "User not found." });
    }

    req.user = user;
    req.userId = String(user._id);
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ ok: false, error: "Invalid or expired token." });
  }
};

// Optional: viewer info for browse/profile, but not required
export const optionalUserAuth = async (req, _res, next) => {
  const authHeader = req.header("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) return next();

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type && decoded.type !== "user") return next();

    const user = await User.findById(decoded.id).populate("membership");
    if (user) {
      req.user = user;
      req.userId = String(user._id);
    }
  } catch {
    // ignore, treat as guest
  }

  next();
};
