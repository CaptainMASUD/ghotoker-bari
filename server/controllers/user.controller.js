import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import uploadCloudinary from "../utils/cloudinary.js";

/* =====================================================
   CONSTANTS
===================================================== */

const ADMIN_ROLES = ["moderator", "superadmin"];

const PUBLIC_CARD_PROJECTION = `
  first_name
  last_name
  dob
  gender
  marital_status
  religion
  current_division
  current_district
  current_city
  profession
  isVerified
  profile_status
  createdAt
`;

const FULL_SAFE_SELECT =
  "-password -nid -passport -present_address -permanent_address -family.father_name -family.mother_name";

/* =====================================================
   JWT
===================================================== */

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      type: user.role === "user" ? "user" : "admin",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIREY || "7d",
    }
  );
};

/* =====================================================
   BASIC HELPERS
===================================================== */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const resolveUserId = (req) => {
  return req.user?._id || req.user?.id;
};

const normalizeString = (value) => {
  if (value === undefined || value === null) return value;
  return String(value).trim();
};

const normalizeEmail = (value) => {
  return String(value || "").toLowerCase().trim();
};

const normalizePhone = (value) => {
  return String(value || "").replace(/\s+/g, "").trim();
};

const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return Boolean(value);
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const parseJsonObject = (value) => {
  if (!value) return {};
  if (typeof value === "object" && !Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch {
      return {};
    }
  }

  return {};
};

const calculateAge = (dob) => {
  if (!dob) return null;

  const today = new Date();
  const birthDate = new Date(dob);

  if (Number.isNaN(birthDate.getTime())) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

const calculateDobRange = (minAge, maxAge) => {
  const now = new Date();
  const dobQuery = {};

  if (minAge) {
    dobQuery.$lte = new Date(
      now.getFullYear() - Number(minAge),
      now.getMonth(),
      now.getDate()
    );
  }

  if (maxAge) {
    dobQuery.$gte = new Date(
      now.getFullYear() - Number(maxAge),
      now.getMonth(),
      now.getDate()
    );
  }

  return dobQuery;
};

const applyCursor = (query, cursor) => {
  if (cursor && isValidObjectId(cursor)) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  return query;
};

const getNextCursor = (items) => {
  if (!items || items.length === 0) return null;
  return String(items[items.length - 1]._id);
};

const uploadProfilePhotos = async (files = []) => {
  if (!files || files.length === 0) return [];

  const uploadedPhotos = [];

  for (const file of files) {
    const uploadedUrl = await uploadCloudinary(file.buffer);
    if (uploadedUrl) uploadedPhotos.push(uploadedUrl);
  }

  return uploadedPhotos;
};

/* =====================================================
   PROFILE COMPLETENESS
===================================================== */

const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
};

const computeProfileCompleteness = (user) => {
  const u = user?._doc ? user._doc : user;

  const importantFields = [
    "first_name",
    "last_name",
    "email_address",
    "phone_number",
    "dob",
    "gender",
    "marital_status",
    "religion",
    "mother_tongue",
    "height",
    "current_division",
    "current_district",
    "current_city",
    "highest_education",
    "profession",
    "annual_income",
    "about_me",
    "profile_photos",
    "family.father_occupation",
    "family.mother_occupation",
    "family.family_type",
    "family.family_status",
    "lifestyle.smoking",
    "lifestyle.drinking",
    "partner_preferences.looking_for",
    "partner_preferences.age_range_min",
    "partner_preferences.age_range_max",
    "partner_preferences.preferred_religion",
  ];

  let completed = 0;

  for (const field of importantFields) {
    const value = getNestedValue(u, field);

    if (Array.isArray(value)) {
      if (value.length > 0) completed++;
    } else if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      completed++;
    }
  }

  return Math.round((completed / importantFields.length) * 100);
};

/* =====================================================
   RESPONSE BUILDERS
===================================================== */

const buildMembershipStatus = (user) => {
  const m = user?.membership || null;
  const expiry = user?.membership_expiry ? new Date(user.membership_expiry) : null;
  const now = new Date();
  const active = Boolean(m && expiry && expiry > now);

  return {
    type: m?.name || "free",
    active,
    expiry: user?.membership_expiry || null,
    can_chat: Boolean(active && m?.can_chat),
    can_view_full_profiles: Boolean(active && m?.can_view_full_profiles),
    message_limit_per_day: active ? m?.message_limit_per_day ?? 0 : 0,
    days_left:
      active && expiry
        ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
        : 0,
  };
};

const buildFullUser = (userDoc) => {
  const user = userDoc?.toObject ? userDoc.toObject({ virtuals: true }) : userDoc;

  return {
    ...user,
    full_name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
    age: calculateAge(user?.dob),
    membership_status: buildMembershipStatus(user),
    profile_completeness: computeProfileCompleteness(user),
  };
};

const buildAdminUser = (userDoc) => {
  const user = userDoc?.toObject ? userDoc.toObject({ virtuals: true }) : userDoc;

  return {
    _id: user._id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    full_name: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
    email_address: user.email_address,
    phone_number: user.phone_number,
    role: user.role,
    permissions: user.permissions || [],
    isVerified: Boolean(user.isVerified),
    verifiedAt: user.verifiedAt || null,
    verifiedBy: user.verifiedBy || null,
    admin_status: user.admin_status,
    account_status: user.account_status,
    last_login: user.last_login || null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const buildLockedProfile = (user) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  return {
    _id: user?._id,
    full_name: fullName || "User",
    first_name: user?.first_name || null,
    age: calculateAge(user?.dob),
    gender: user?.gender || null,
    religion: user?.religion || null,
    marital_status: user?.marital_status || null,
    current_division: user?.current_division || null,
    current_district: user?.current_district || null,
    profession: user?.profession || null,
    isVerified: Boolean(user?.isVerified),
    profile_status: user?.profile_status,

    // Public/locked users must never receive real image URLs.
    profile_photos: [],
    profile_photo_locked: true,
    profile_locked: true,
    locked: true,
  };
};

const sanitizeFullProfileForViewer = (user, viewer) => {
  const safeUser = buildFullUser(user);

  const isAdminViewer = viewer && ADMIN_ROLES.includes(viewer.role);
  const isOwner = viewer && String(viewer._id || viewer.id) === String(user?._id);
  const membershipStatus = buildMembershipStatus(viewer);

  const canSeePhotos =
    isAdminViewer ||
    isOwner ||
    (membershipStatus.active &&
      membershipStatus.can_view_full_profiles &&
      ["members_only", "premium_only", "public"].includes(
        user?.profile_photo_visibility || "members_only"
      ));

  if (!canSeePhotos) {
    safeUser.profile_photos = [];
    safeUser.profile_photo_locked = true;
  } else {
    safeUser.profile_photo_locked = false;
  }

  return safeUser;
};

const viewerCanSeeFull = (viewer) => {
  if (!viewer) return false;

  if (ADMIN_ROLES.includes(viewer.role)) return true;

  const membershipStatus = buildMembershipStatus(viewer);

  return Boolean(membershipStatus.active && membershipStatus.can_view_full_profiles);
};

/* =====================================================
   UPDATE PAYLOAD BUILDER
===================================================== */

const allowedFlatFields = [
  "first_name",
  "last_name",
  "phone_number",
  "dob",
  "gender",
  "profile_created_by",
  "marital_status",
  "religion",
  "sect",
  "caste_or_community",
  "mother_tongue",
  "nationality",
  "nid",
  "passport",
  "about_me",
  "profile_photo_visibility",
  "height",
  "height_cm",
  "weight",
  "weight_kg",
  "body_type",
  "complexion",
  "blood_group",
  "current_country",
  "current_division",
  "current_district",
  "current_city",
  "present_address",
  "permanent_division",
  "permanent_district",
  "permanent_upazila",
  "permanent_address",
  "preferred_location",
  "willing_to_relocate",
  "highest_education",
  "profession",
  "occupation_type",
  "company_or_business_name",
  "designation",
  "annual_income",
  "monthly_income",
  "monthly_income_min",
  "monthly_income_max",
  "looking_for",
  "age_range_min",
  "age_range_max",
];

const allowedNestedObjects = [
  "children",
  "disability",
  "education_details",
  "family",
  "lifestyle",
  "partner_preferences",
  "privacy",
];

const blockedUserUpdateFields = [
  "role",
  "permissions",
  "admin_status",
  "isVerified",
  "verifiedAt",
  "verifiedBy",
  "verification",
  "membership",
  "membership_expiry",
  "account_status",
  "profile_status",
  "profile_completeness",
  "profile_views_count",
  "shortlisted_by_count",
  "email_address",
  "email_normalized",
  "phone_normalized",
  "full_name_normalized",
  "password",
];

const buildProfileUpdatePayload = (body) => {
  const $set = {};

  for (const field of allowedFlatFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      let value = body[field];

      if (
        [
          "height_cm",
          "weight_kg",
          "monthly_income_min",
          "monthly_income_max",
          "age_range_min",
          "age_range_max",
        ].includes(field)
      ) {
        value = parseNumber(value);
      }

      if (field === "willing_to_relocate") {
        value = parseBoolean(value);
      }

      $set[field] = typeof value === "string" ? normalizeString(value) : value;
    }
  }

  for (const objectName of allowedNestedObjects) {
    if (Object.prototype.hasOwnProperty.call(body, objectName)) {
      const nestedObject = parseJsonObject(body[objectName]);

      for (const [key, value] of Object.entries(nestedObject)) {
        let finalValue = value;

        if (typeof value === "string") finalValue = normalizeString(value);

        if (
          [
            "age_range_min",
            "age_range_max",
            "number_of_children",
            "number_of_brothers",
            "number_of_sisters",
            "brothers_married",
            "sisters_married",
            "passing_year",
            "preferred_height_min_cm",
            "preferred_height_max_cm",
          ].includes(key)
        ) {
          finalValue = parseNumber(value);
        }

        if (
          [
            "has_children",
            "has_disability",
            "show_phone",
            "show_email",
            "show_address",
            "show_income",
            "show_family_details",
            "allow_profile_view",
            "allow_messages",
            "accept_divorced",
            "accept_widowed",
            "accept_with_children",
          ].includes(key)
        ) {
          finalValue = parseBoolean(value);
        }

        $set[`${objectName}.${key}`] = finalValue;
      }
    }
  }

  for (const [key, value] of Object.entries(body)) {
    if (blockedUserUpdateFields.includes(key)) continue;

    const isNestedAllowed = allowedNestedObjects.some((obj) =>
      key.startsWith(`${obj}.`)
    );

    if (!isNestedAllowed) continue;

    let finalValue = value;

    if (typeof value === "string") finalValue = normalizeString(value);

    if (
      key.includes("age_range") ||
      key.includes("number_of") ||
      key.includes("married") ||
      key.includes("passing_year") ||
      key.includes("_cm")
    ) {
      finalValue = parseNumber(value);
    }

    if (
      key.includes("has_children") ||
      key.includes("has_disability") ||
      key.includes("show_") ||
      key.includes("allow_") ||
      key.includes("accept_")
    ) {
      finalValue = parseBoolean(value);
    }

    $set[key] = finalValue;
  }

  const arrayFields = [
    "lifestyle.hobbies",
    "partner_preferences.preferred_marital_status",
    "partner_preferences.preferred_education",
    "partner_preferences.preferred_profession",
    "partner_preferences.preferred_division",
    "partner_preferences.preferred_district",
    "partner_preferences.preferred_country",
    "partner_preferences.preferred_family_status",
  ];

  for (const field of arrayFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      $set[field] = normalizeArray(body[field]);
    }
  }

  return $set;
};

/* =====================================================
   REGISTER NORMAL USER
   POST /api/user/register
===================================================== */

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
      religion,
      marital_status,
      current_division,
      current_district,
      current_city,
      profession,
      highest_education,
    } = req.body;

    if (!first_name || !last_name || !email_address || !phone_number || !password) {
      return res.status(400).json({
        message:
          "First name, last name, email address, phone number and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = normalizeEmail(email_address);

    const existingUser = await User.exists({ email_address: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const profilePhotos = await uploadProfilePhotos(req.files);

    const user = new User({
      role: "user",
      first_name: normalizeString(first_name),
      last_name: normalizeString(last_name),
      email_address: normalizedEmail,
      phone_number: normalizePhone(phone_number),
      password,
      dob,
      gender,
      religion,
      marital_status,
      current_division,
      current_district,
      current_city,
      profession,
      highest_education,
      profile_photos: profilePhotos,
      profile_status: "incomplete",
      account_status: "active",
      isVerified: false,
      verification: {
        verification_status: "pending",
      },
      last_active_at: new Date(),
    });

    user.profile_completeness = computeProfileCompleteness(user);

    if (user.profile_completeness >= 70) {
      user.profile_status = "pending_review";
    }

    await user.save();

    const savedUser = await User.findById(user._id)
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user),
      user: buildFullUser(savedUser),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

/* =====================================================
   LOGIN USER / MODERATOR / SUPERADMIN
   POST /api/user/login
===================================================== */

export const loginUser = async (req, res) => {
  try {
    const { email_address, email, password } = req.body;
    const loginEmail = email_address || email;

    if (!loginEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = normalizeEmail(loginEmail);

    const user = await User.findOne({ email_address: normalizedEmail })
      .select("+password")
      .populate("membership");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (["suspended", "deleted"].includes(user.account_status)) {
      return res.status(403).json({
        message: "This account is not available",
      });
    }

    if (ADMIN_ROLES.includes(user.role)) {
      if (user.admin_status !== "active") {
        return res.status(403).json({
          message: "Admin account is not active",
        });
      }

      if (!user.isVerified) {
        return res.status(403).json({
          message: "Admin account is not verified yet",
        });
      }
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          last_login: new Date(),
          last_active_at: new Date(),
        },
      }
    );

    const safeUser = await User.findById(user._id)
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: ADMIN_ROLES.includes(user.role)
        ? buildAdminUser(safeUser)
        : buildFullUser(safeUser),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

/* =====================================================
   GET MY PROFILE
   GET /api/user/me
===================================================== */

export const getMe = async (req, res) => {
  try {
    const uid = resolveUserId(req);

    if (!uid || !isValidObjectId(uid)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    const user = await User.findById(uid)
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: ADMIN_ROLES.includes(user.role) ? buildAdminUser(user) : buildFullUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

/* =====================================================
   UPDATE MY NORMAL USER PROFILE
   PATCH /api/user/me
===================================================== */

export const updateMe = async (req, res) => {
  try {
    const uid = resolveUserId(req);

    if (!uid || !isValidObjectId(uid)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    const currentUser = await User.findById(uid)
      .select("role profile_status profile_photos")
      .lean();

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (ADMIN_ROLES.includes(currentUser.role)) {
      return res.status(403).json({
        message: "Admin/moderator profile update should be handled from admin panel",
      });
    }

    const $set = buildProfileUpdatePayload(req.body);
    const uploadedPhotos = await uploadProfilePhotos(req.files);

    const updateQuery = {};

    if (Object.keys($set).length > 0) updateQuery.$set = $set;

    if (uploadedPhotos.length > 0) {
      updateQuery.$push = {
        profile_photos: {
          $each: uploadedPhotos,
        },
      };
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "profile_photos")) {
      const photos = normalizeArray(req.body.profile_photos);

      updateQuery.$set = {
        ...(updateQuery.$set || {}),
        profile_photos: photos,
      };

      delete updateQuery.$push?.profile_photos;

      if (updateQuery.$push && Object.keys(updateQuery.$push).length === 0) {
        delete updateQuery.$push;
      }
    }

    if (Object.keys(updateQuery).length === 0) {
      return res.status(400).json({
        message: "No valid profile fields provided for update",
      });
    }

    let updatedUser = await User.findByIdAndUpdate(uid, updateQuery, {
      new: true,
      runValidators: true,
    })
      .select(FULL_SAFE_SELECT)
      .populate("membership");

    const profileCompleteness = computeProfileCompleteness(updatedUser);

    const statusSet = {
      profile_completeness: profileCompleteness,
      last_active_at: new Date(),
    };

    if (
      updatedUser.profile_status === "incomplete" &&
      profileCompleteness >= 70
    ) {
      statusSet.profile_status = "pending_review";
    }

    updatedUser = await User.findByIdAndUpdate(
      uid,
      {
        $set: statusSet,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    res.status(200).json({
      message: "Profile updated successfully",
      user: buildFullUser(updatedUser),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
};

/* =====================================================
   CHANGE PASSWORD
   PATCH /api/user/change-password
===================================================== */

export const changePassword = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    const { current_password, new_password } = req.body;

    if (!uid || !isValidObjectId(uid)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    if (!current_password || !new_password) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (String(new_password).length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(uid).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(current_password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    user.password = new_password;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error changing password",
      error: error.message,
    });
  }
};

/* =====================================================
   BROWSE USERS - CURSOR BASED
   GET /api/user/browse?limit=20&cursor=
===================================================== */

export const browseUsers = async (req, res) => {
  try {
    const {
      gender,
      religion,
      marital_status,
      division,
      district,
      city,
      profession,
      education,
      minAge,
      maxAge,
      minHeightCm,
      maxHeightCm,
      verified,
      search,
      cursor,
      limit = 20,
    } = req.query;

    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const query = {
      role: "user",
      account_status: "active",
      profile_status: { $in: ["approved", "pending_review"] },
      "privacy.allow_profile_view": { $ne: false },
    };

    applyCursor(query, cursor);

    if (gender) query.gender = gender;
    if (religion) query.religion = religion;
    if (marital_status) query.marital_status = marital_status;
    if (division) query.current_division = division;
    if (district) query.current_district = district;
    if (city) query.current_city = city;
    if (profession) query.profession = profession;
    if (education) query.highest_education = education;

    if (verified === "true") query.isVerified = true;
    if (verified === "false") query.isVerified = false;

    if (minAge || maxAge) {
      query.dob = calculateDobRange(minAge, maxAge);
    }

    if (minHeightCm || maxHeightCm) {
      query.height_cm = {};
      if (minHeightCm) query.height_cm.$gte = Number(minHeightCm);
      if (maxHeightCm) query.height_cm.$lte = Number(maxHeightCm);
    }

    if (search) {
      query.$text = {
        $search: String(search).trim(),
      };
    }

    const rows = await User.find(query)
      .select(PUBLIC_CARD_PROJECTION)
      .sort({ _id: -1 })
      .limit(perPage + 1)
      .lean({ virtuals: true });

    const hasNextPage = rows.length > perPage;
    const itemsRaw = hasNextPage ? rows.slice(0, perPage) : rows;

    res.status(200).json({
      limit: perPage,
      count: itemsRaw.length,
      hasNextPage,
      nextCursor: hasNextPage ? getNextCursor(itemsRaw) : null,
      items: itemsRaw.map((user) => buildLockedProfile(user)),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error browsing users",
      error: error.message,
    });
  }
};

/* =====================================================
   GET PUBLIC USER PROFILE
   GET /api/user/:id/profile
===================================================== */

export const getUserPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Valid profile id is required" });
    }

    const viewerId = req.user?.id || req.user?._id || null;

    const [target, viewer] = await Promise.all([
      User.findOne({
        _id: id,
        role: "user",
        account_status: "active",
      })
        .select(FULL_SAFE_SELECT)
        .populate("membership")
        .lean({ virtuals: true }),

      viewerId && isValidObjectId(viewerId)
        ? User.findById(viewerId)
            .select("role membership membership_expiry")
            .populate("membership")
            .lean()
        : null,
    ]);

    if (!target) {
      return res.status(404).json({ message: "User profile not found" });
    }

    User.updateOne(
      { _id: id },
      {
        $inc: { profile_views_count: 1 },
      }
    ).catch(() => {});

    if (viewerCanSeeFull(viewer)) {
      return res.status(200).json({
        locked: false,
        user: sanitizeFullProfileForViewer(target, viewer),
      });
    }

    return res.status(200).json({
      locked: true,
      user: buildLockedProfile(target),
      message: "Upgrade membership to view full profile",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

/* =====================================================
   REMOVE PROFILE PHOTO
   PATCH /api/user/remove-photo
===================================================== */

export const removeProfilePhoto = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    const { photo_url } = req.body;

    if (!uid || !isValidObjectId(uid)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    if (!photo_url) {
      return res.status(400).json({ message: "Photo URL is required" });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: uid,
        role: "user",
      },
      {
        $pull: {
          profile_photos: photo_url,
        },
        $set: {
          last_active_at: new Date(),
        },
      },
      {
        new: true,
      }
    )
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile photo removed successfully",
      user: buildFullUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing profile photo",
      error: error.message,
    });
  }
};

/* =====================================================
   PROFILE VISIBILITY
   PATCH /api/user/profile-visibility
===================================================== */

export const updateProfileVisibility = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    const { visible } = req.body;

    if (!uid || !isValidObjectId(uid)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    const isVisible = parseBoolean(visible);

    const user = await User.findOneAndUpdate(
      {
        _id: uid,
        role: "user",
      },
      {
        $set: {
          "privacy.allow_profile_view": isVisible,
          profile_status: isVisible ? "approved" : "hidden",
          last_active_at: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: isVisible ? "Profile is now visible" : "Profile is now hidden",
      user: buildFullUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile visibility",
      error: error.message,
    });
  }
};