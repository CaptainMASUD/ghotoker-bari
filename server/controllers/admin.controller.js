import Admin from "../models/admin.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET;
const TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIREY || "7d"; // ensure this var exists

// Generate JWT for admin
const generateAdminToken = (adminId) => {
  return jwt.sign({ id: adminId, type: "admin" }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
};

// ================== REGISTER ADMIN ==================
export const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, role, permissions, isVerified } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      username,
      email,
      password, // gets hashed in model
      role: role || "moderator",
      permissions: permissions || [],
      // allow seeding a verified superadmin when bootstrapping, otherwise default false in model
      isVerified: typeof isVerified === "boolean" ? isVerified : undefined,
      verifiedAt: isVerified ? new Date() : undefined,
    });

    await admin.save();

    res.status(201).json({
      message: "Admin registered successfully",
      token: generateAdminToken(admin._id),
      admin: await Admin.findById(admin._id).select("-password"),
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering admin", error: error.message });
  }
};

// ================== LOGIN ADMIN ==================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // If you want to block login for unverified admins, uncomment next 2 lines:
    // if (!admin.isVerified) return res.status(403).json({ message: "Admin not verified" });

    res.json({
      message: "Admin login successful",
      token: generateAdminToken(admin._id),
      admin: await Admin.findById(admin._id).select("-password"),
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in admin", error: error.message });
  }
};

// ================== ME (SELF) ==================
// Uses req.adminId set by your authenticateAdmin middleware
export const getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    return res.json({ admin });
  } catch (error) {
    res.status(500).json({ message: "Error fetching admin profile", error: error.message });
  }
};

// ================== VERIFY ADMIN (SUPERADMIN ONLY) ==================
export const verifyAdmin = async (req, res) => {
  try {
    // Ensure caller is superadmin
    const caller = await Admin.findById(req.adminId);
    if (!caller) return res.status(404).json({ message: "Caller admin not found" });
    if (caller.role !== "superadmin") {
      return res.status(403).json({ message: "Superadmin only" });
    }

    const { adminId } = req.params;
    const updated = await Admin.findByIdAndUpdate(
      adminId,
      { isVerified: true, verifiedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ message: "Admin not found" });

    res.json({ message: "Admin verified successfully", admin: updated });
  } catch (error) {
    res.status(500).json({ message: "Error verifying admin", error: error.message });
  }
};

// ================== VERIFY USER ==================
export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User verified successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error verifying user", error: error.message });
  }
};

// ================== GET ALL USERS ==================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().populate("membership");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// ================== DELETE USER ==================
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
