import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;

const ADMIN_ROLES = ["moderator", "superadmin"];

/* =====================================================
   ADMIN AUTH
   Allows moderator/superadmin only
===================================================== */

export const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.type && decoded.type !== "admin") {
      return res.status(403).json({
        ok: false,
        error: "Access denied. Not an admin token.",
      });
    }

    const admin = await User.findOne({
      _id: decoded.id,
      role: { $in: ADMIN_ROLES },
      account_status: "active",
      admin_status: "active",
      isVerified: true,
    }).select(
      "first_name last_name username email_address phone_number role permissions isVerified admin_status account_status"
    );

    if (!admin) {
      return res.status(403).json({
        ok: false,
        error: "Access denied. Admin account not found or not active.",
      });
    }

    req.user = admin;
    req.admin = admin;
    req.userId = String(admin._id);
    req.adminId = String(admin._id);

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: "Invalid or expired token.",
    });
  }
};

/* =====================================================
   USER AUTH
   Allows any logged-in account: user/moderator/superadmin
===================================================== */

export const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "Authentication required.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).populate("membership");

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: "User not found.",
      });
    }

    if (["suspended", "deleted"].includes(user.account_status)) {
      return res.status(403).json({
        ok: false,
        error: "This account is not available.",
      });
    }

    req.user = user;
    req.userId = String(user._id);

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: "Invalid or expired token.",
    });
  }
};

/* =====================================================
   OPTIONAL AUTH
   Used for browse/profile public pages
===================================================== */

export const optionalUserAuth = async (req, _res, next) => {
  const authHeader = req.header("Authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).populate("membership");

    if (user && !["suspended", "deleted"].includes(user.account_status)) {
      req.user = user;
      req.userId = String(user._id);
    }
  } catch {
    // ignore invalid token and continue as guest
  }

  next();
};