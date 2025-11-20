import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import uploadCloudinary from "../utils/cloudinary.js";

/* ------------------------- helpers ------------------------- */

// issue JWT
const generateToken = (userId) =>
  jwt.sign({ id: userId, type: "user" }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIREY || "7d",
  });
// build safe user object for responses
const buildPublicUser = (userDoc) => {
  // make sure we can read plain values whether it's a mongoose doc or plain obj
  const u = userDoc?._doc ? userDoc._doc : userDoc;

  // membership details if populated
  const m = u?.membership || null;
  const now = new Date();
  const expiry = u?.membership_expiry ? new Date(u.membership_expiry) : null;
  const isActive = !!(m && expiry && expiry > now);

  // profile completeness (0–100)
  const completeness = computeProfileCompleteness(u);

  // hide password
  const { password, ...rest } = u;

  return {
    ...rest,
    membership_status: {
      type: m?.name || "free",
      active: isActive,
      expiry: u?.membership_expiry || null,
      can_chat: !!m?.can_chat,
      can_view_full_profiles: !!m?.can_view_full_profiles,
      message_limit_per_day: m?.message_limit_per_day ?? 0,
      days_left:
        expiry && expiry > now
          ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
          : 0,
    },
    profile_completeness: completeness,
  };
};

// compute completeness percentage based on fields you care about
const computeProfileCompleteness = (u) => {
  // You can tweak this list any time
  const fields = [
    "first_name",
    "last_name",
    "email_address",
    "phone_number",
    "dob",
    "gender",
    "current_city",
    "preferred_location",
    "profession",
    "highest_education",
    "annual_income",
    "religion",
    "marital_status",
    "height",
    "mother_tongue",
    "about_me",
    "looking_for",
    "age_range_min",
    "age_range_max",
    "profile_photos", // array
  ];

  let have = 0;
  fields.forEach((f) => {
    const val = u?.[f];
    if (Array.isArray(val)) {
      if (val.length > 0) have += 1;
    } else if (val !== null && val !== undefined && String(val).trim() !== "") {
      have += 1;
    }
  });

  const pct = Math.round((have / fields.length) * 100);
  return Math.max(0, Math.min(100, pct));
};

/* ------------------------- AUTH (existing) ------------------------- */

// Format user object (hide password + include membership info)
const formatUser = (user) => buildPublicUser(user);

/* ------------------------- REGISTER (existing) ------------------------- */
export const registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email_address,
      phone_number,
      password,
      dob,
      gender,
      nid,
      passport,
      current_city,
      preferred_location,
      profession,
      highest_education,
      annual_income,
      religion,
      marital_status,
      height,
      mother_tongue,
      about_me,
      looking_for,
      age_range_min,
      age_range_max,
    } = req.body;

    const existingUser = await User.findOne({ email_address });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Upload photos if files exist
    let profilePhotos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedUrl = await uploadCloudinary(file.buffer);
        if (uploadedUrl) profilePhotos.push(uploadedUrl);
      }
    }

    const user = new User({
      first_name,
      last_name,
      email_address,
      phone_number,
      password, // hashed in model
      dob,
      gender,
      nid,
      passport,
      current_city,
      preferred_location,
      profession,
      highest_education,
      annual_income,
      religion,
      marital_status,
      height,
      mother_tongue,
      about_me,
      profile_photos: profilePhotos,
      looking_for,
      age_range_min,
      age_range_max,
    });

    await user.save();
    const populated = await User.findById(user._id).populate("membership");

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: formatUser(populated),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

/* ------------------------- LOGIN (existing) ------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email_address, password } = req.body;

    const user = await User.findOne({ email_address }).populate("membership");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error logging in", error: error.message });
  }
};

/* ------------------------- NEW: Get my profile ------------------------- */
// GET /api/user/me
export const getMe = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    if (!uid) {
      return res.status(400).json({ message: "userId is required (query/body/header)" });
    }

    const user = await User.findById(uid).populate("membership");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: buildPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};


/* ------------------------- NEW: Update my profile ------------------------- */
// PATCH /api/user/me  (supports JSON or multipart with profile_photos[])
export const updateMe = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    if (!uid) {
      return res.status(400).json({ message: "userId is required (query/body/header)" });
    }

    const allowed = [
      "first_name","last_name","phone_number","dob","gender","current_city",
      "preferred_location","profession","highest_education","annual_income",
      "religion","marital_status","height","mother_tongue","about_me",
      "looking_for","age_range_min","age_range_max","profile_photos"
    ];

    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }

    if (req.files && req.files.length > 0) {
      const uploaded = [];
      for (const file of req.files) {
        const url = await uploadCloudinary(file.buffer);
        if (url) uploaded.push(url);
      }
      if (uploaded.length) {
        if (!updates.profile_photos) {
          // append mode
          updates.$push = { profile_photos: { $each: uploaded } };
        }
      }
    }

    if (Array.isArray(req.body.profile_photos)) {
      // explicit replace wins
      updates.profile_photos = req.body.profile_photos;
      if (updates.$push) delete updates.$push;
    }

    const user = await User.findByIdAndUpdate(uid, updates, {
      new: true,
      runValidators: true,
    }).populate("membership");

    res.json({ message: "Profile updated", user: buildPublicUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};

/* ------------------------- NEW: Change my password ------------------------- */
// PATCH /api/user/change-password  { current_password, new_password }
export const changePassword = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    if (!uid) {
      return res.status(400).json({ message: "userId is required (query/body/header)" });
    }

    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }

    const user = await User.findById(uid);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await user.matchPassword(current_password);
    if (!ok) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = new_password; // hashed by pre-save hook
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error: error.message });
  }
};

/* ------------------------- helpers for viewer gating ------------------------- */

// is viewer allowed to see full target profile?
const viewerCanSeeFull = (viewer) => {
  // If not logged in, treat as free
  if (!viewer) return false;

  const m = viewer.membership || null;
  const expiry = viewer.membership_expiry ? new Date(viewer.membership_expiry) : null;
  const now = new Date();
  const active = !!(m && expiry && expiry > now);

  return Boolean(active && m?.can_view_full_profiles);
};

// build a limited/locked profile to show non-paying viewers
const buildLockedProfile = (target) => {
  const u = target?._doc ? target._doc : target;
  const name = `${u?.first_name ?? ""} ${u?.last_name ?? ""}`.trim();

  return {
    _id: u?._id,
    first_name: u?.first_name ?? null,
    last_name: u?.last_name ?? null,
    full_name: name || u?.username || "User",
    gender: u?.gender ?? null,
    age: u?.age ?? (u?.dob ? Math.floor((Date.now() - new Date(u.dob)) / (365.25*24*3600*1000)) : null),
    current_city: u?.current_city ?? null,
    profession: u?.profession ?? null,
    highest_education: u?.highest_education ?? null,
    isVerified: true, // or reflect your own verification flag if you store it
    // Show first photo placeholder; front-end already overlays a lock
    profile_photos: Array.isArray(u?.profile_photos) && u.profile_photos.length ? [u.profile_photos[0]] : [],
    locked: true,
  };
};

/* ------------------------- NEW: Browse users (public/light) ------------------------- */
// GET /api/user/browse?city=&profession=&education=&minAge=&maxAge=&limit=&page=
export const browseUsers = async (req, res) => {
  try {
    const {
      city,
      profession,
      education,
      minAge,
      maxAge,
      limit = 20,
      page = 1,
    } = req.query;

    const q = {};

    if (city) q.current_city = city;
    if (profession) q.profession = profession;
    if (education) q.highest_education = education;

    // Basic DOB-derived age filter if you store dob
    if (minAge || maxAge) {
      const now = new Date();
      q.dob = {};
      // minAge means dob <= now - minAge years
      if (minAge) {
        const maxDOB = new Date(
          now.getFullYear() - parseInt(minAge, 10),
          now.getMonth(),
          now.getDate()
        );
        q.dob.$lte = maxDOB;
      }
      // maxAge means dob >= now - maxAge years
      if (maxAge) {
        const minDOB = new Date(
          now.getFullYear() - parseInt(maxAge, 10),
          now.getMonth(),
          now.getDate()
        );
        q.dob.$gte = minDOB;
      }
    }

    const perPage = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * perPage;

    // Only select safe, lightweight fields for the list
    const projection = `
      first_name last_name username gender dob current_city profession highest_education
      profile_photos
    `;

    const [rows, total] = await Promise.all([
      User.find(q).select(projection).sort({ createdAt: -1 }).skip(skip).limit(perPage),
      User.countDocuments(q),
    ]);

    // Always return locked/lightweight rows from /browse
    const items = rows.map((u) => buildLockedProfile(u));

    res.json({
      page: parseInt(page, 10),
      limit: perPage,
      total,
      items,
    });
  } catch (error) {
    res.status(500).json({ message: "Error browsing users", error: error.message });
  }
};

/* ------------------------- NEW: Get another user's profile (gated) ------------------------- */
// GET /api/user/:id/profile   (requires auth; free users get locked view)
export const getUserPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Load both target & viewer (viewer is req.user from auth middleware)
    const [target, viewer] = await Promise.all([
      User.findById(id).populate("membership"),
      User.findById(req.user?.id).populate("membership"),
    ]);

    if (!target) return res.status(404).json({ message: "User not found" });

    if (viewerCanSeeFull(viewer)) {
      // Return full (but safe) profile
      return res.json(buildPublicUser(target));
    }

    // Return a locked/limited version
    return res.json(buildLockedProfile(target));
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};
