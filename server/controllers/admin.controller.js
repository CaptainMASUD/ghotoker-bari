import User from "../models/user.model.js";
import mongoose from "mongoose";
import uploadCloudinary from "../utils/cloudinary.js";

/* =====================================================
   CONSTANTS
===================================================== */

const ADMIN_ROLES = ["moderator", "superadmin"];

const ADMIN_PERMISSIONS = {
  CREATE_USERS: "create_users",
  VIEW_USERS: "view_users",
  UPDATE_USERS: "update_users",
  DELETE_USERS: "delete_users",
  VERIFY_USERS: "verify_users",
  REJECT_USERS: "reject_users",
  SUSPEND_USERS: "suspend_users",
  MANAGE_MEMBERSHIPS: "manage_memberships",
  MANAGE_MODERATORS: "manage_moderators",
};

const DEFAULT_MODERATOR_PERMISSIONS = [
  ADMIN_PERMISSIONS.VIEW_USERS,
  ADMIN_PERMISSIONS.UPDATE_USERS,
  ADMIN_PERMISSIONS.VERIFY_USERS,
  ADMIN_PERMISSIONS.REJECT_USERS,
];

const FULL_SAFE_SELECT =
  "-password -nid -passport -present_address -permanent_address -family.father_name -family.mother_name";

const ADMIN_SAFE_SELECT =
  "-password -nid -passport -present_address -permanent_address -family.father_name -family.mother_name";

/* =====================================================
   BASIC HELPERS
===================================================== */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
   PERMISSION HELPERS
===================================================== */

const isSuperAdmin = (admin) => {
  return admin?.role === "superadmin";
};

const hasPermission = (admin, permission) => {
  if (!admin) return false;
  if (admin.role === "superadmin") return true;
  return Array.isArray(admin.permissions) && admin.permissions.includes(permission);
};

const requirePermission = (admin, permission) => {
  return isSuperAdmin(admin) || hasPermission(admin, permission);
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

/* =====================================================
   ADMIN USER UPDATE PAYLOAD
===================================================== */

const allowedUserFlatFields = [
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
  "profile_status",
  "account_status",
];

const allowedNestedObjects = [
  "children",
  "disability",
  "education_details",
  "family",
  "lifestyle",
  "partner_preferences",
  "privacy",
  "verification",
];

const blockedAdminUserUpdateFields = [
  "role",
  "permissions",
  "admin_status",
  "verifiedBy",
  "membership",
  "membership_expiry",
  "profile_views_count",
  "shortlisted_by_count",
  "email_address",
  "email_normalized",
  "phone_normalized",
  "full_name_normalized",
  "password",
];

const buildAdminUserUpdatePayload = (body) => {
  const $set = {};

  for (const field of allowedUserFlatFields) {
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
            "email_verified",
            "phone_verified",
            "nid_verified",
            "photo_verified",
            "biodata_verified",
          ].includes(key)
        ) {
          finalValue = parseBoolean(value);
        }

        $set[`${objectName}.${key}`] = finalValue;
      }
    }
  }

  for (const [key, value] of Object.entries(body)) {
    if (blockedAdminUserUpdateFields.includes(key)) continue;

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
      key.includes("accept_") ||
      key.includes("_verified")
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
   ADMIN CRUD: CREATE NORMAL USER
   POST /api/admin/users
===================================================== */

export const createUserByAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!requirePermission(admin, ADMIN_PERMISSIONS.CREATE_USERS)) {
      return res.status(403).json({
        message: "You do not have permission to create users",
      });
    }

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
      profile_status = "pending_review",
      account_status = "active",
      isVerified = false,
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

    const exists = await User.exists({ email_address: normalizedEmail });

    if (exists) {
      return res.status(400).json({
        message: "Email already registered",
      });
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
      profile_status,
      account_status,
      isVerified: parseBoolean(isVerified),
      verifiedAt: parseBoolean(isVerified) ? new Date() : null,
      verifiedBy: parseBoolean(isVerified) ? admin._id : null,
      verification: {
        verification_status: parseBoolean(isVerified) ? "approved" : "pending",
        biodata_verified: parseBoolean(isVerified),
      },
      last_active_at: new Date(),
    });

    user.profile_completeness = computeProfileCompleteness(user);

    await user.save();

    const savedUser = await User.findById(user._id)
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    res.status(201).json({
      message: "User created successfully",
      user: buildFullUser(savedUser),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN CRUD: GET USERS
   GET /api/admin/users?limit=20&cursor=
===================================================== */

export const getUsersForAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!requirePermission(admin, ADMIN_PERMISSIONS.VIEW_USERS)) {
      return res.status(403).json({
        message: "You do not have permission to view users",
      });
    }

    const {
      profile_status,
      account_status,
      isVerified,
      verification_status,
      gender,
      religion,
      division,
      district,
      city,
      search,
      cursor,
      limit = 20,
    } = req.query;

    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const query = {
      role: "user",
    };

    applyCursor(query, cursor);

    if (profile_status) query.profile_status = profile_status;
    if (account_status) query.account_status = account_status;
    if (isVerified === "true") query.isVerified = true;
    if (isVerified === "false") query.isVerified = false;
    if (verification_status) query["verification.verification_status"] = verification_status;
    if (gender) query.gender = gender;
    if (religion) query.religion = religion;
    if (division) query.current_division = division;
    if (district) query.current_district = district;
    if (city) query.current_city = city;

    if (search) {
      query.$text = {
        $search: String(search).trim(),
      };
    }

    const rows = await User.find(query)
      .select(FULL_SAFE_SELECT)
      .sort({ _id: -1 })
      .limit(perPage + 1)
      .populate("membership")
      .lean({ virtuals: true });

    const hasNextPage = rows.length > perPage;
    const itemsRaw = hasNextPage ? rows.slice(0, perPage) : rows;

    res.status(200).json({
      limit: perPage,
      count: itemsRaw.length,
      hasNextPage,
      nextCursor: hasNextPage ? getNextCursor(itemsRaw) : null,
      items: itemsRaw.map((user) => buildFullUser(user)),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching users",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN CRUD: GET SINGLE USER
   GET /api/admin/users/:id
===================================================== */

export const getUserByIdForAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;

    if (!requirePermission(admin, ADMIN_PERMISSIONS.VIEW_USERS)) {
      return res.status(403).json({
        message: "You do not have permission to view user details",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid user id is required",
      });
    }

    const user = await User.findOne({
      _id: id,
      role: "user",
    })
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user: buildFullUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching user",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN CRUD: UPDATE NORMAL USER
   PATCH /api/admin/users/:id
===================================================== */

export const updateUserByAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;

    if (!requirePermission(admin, ADMIN_PERMISSIONS.UPDATE_USERS)) {
      return res.status(403).json({
        message: "You do not have permission to update users",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid user id is required",
      });
    }

    const $set = buildAdminUserUpdatePayload(req.body);
    const uploadedPhotos = await uploadProfilePhotos(req.files);

    const updateQuery = {};

    if (Object.keys($set).length > 0) {
      updateQuery.$set = $set;
    }

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
        message: "No valid user fields provided for update",
      });
    }

    let updatedUser = await User.findOneAndUpdate(
      {
        _id: id,
        role: "user",
      },
      updateQuery,
      {
        new: true,
        runValidators: true,
      }
    )
      .select(FULL_SAFE_SELECT)
      .populate("membership");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const profileCompleteness = computeProfileCompleteness(updatedUser);

    updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          profile_completeness: profileCompleteness,
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

    res.status(200).json({
      message: "User updated successfully",
      user: buildFullUser(updatedUser),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN CRUD: DELETE NORMAL USER
   DELETE /api/admin/users/:id?hard=true
===================================================== */

export const deleteUserByAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;
    const { hard = "false" } = req.query;

    if (!requirePermission(admin, ADMIN_PERMISSIONS.DELETE_USERS)) {
      return res.status(403).json({
        message: "You do not have permission to delete users",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid user id is required",
      });
    }

    const isHardDelete = parseBoolean(hard);

    if (isHardDelete && !isSuperAdmin(admin)) {
      return res.status(403).json({
        message: "Only superadmin can permanently delete users",
      });
    }

    if (isHardDelete) {
      const deleted = await User.findOneAndDelete({
        _id: id,
        role: "user",
      });

      if (!deleted) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      return res.status(200).json({
        message: "User permanently deleted successfully",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: id,
        role: "user",
      },
      {
        $set: {
          account_status: "deleted",
          profile_status: "hidden",
          "privacy.allow_profile_view": false,
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User deleted successfully",
      user: buildFullUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: VERIFY / REJECT USER
   PATCH /api/admin/users/:id/verify
===================================================== */

export const verifyUserProfile = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;

    const {
      isVerified = true,
      rejection_reason = "",
      nid_verified,
      photo_verified,
      phone_verified,
      email_verified,
    } = req.body;

    const finalVerified = parseBoolean(isVerified);

    if (finalVerified && !requirePermission(admin, ADMIN_PERMISSIONS.VERIFY_USERS)) {
      return res.status(403).json({
        message: "You do not have permission to verify users",
      });
    }

    if (!finalVerified && !requirePermission(admin, ADMIN_PERMISSIONS.REJECT_USERS)) {
      return res.status(403).json({
        message: "You do not have permission to reject users",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid user id is required",
      });
    }

    const updateData = {
      isVerified: finalVerified,
      verifiedAt: finalVerified ? new Date() : null,
      verifiedBy: finalVerified ? admin._id : null,
      profile_status: finalVerified ? "approved" : "rejected",
      "verification.verification_status": finalVerified ? "approved" : "rejected",
      "verification.rejection_reason": finalVerified ? "" : rejection_reason,
      "verification.biodata_verified": finalVerified,
    };

    if (nid_verified !== undefined) {
      updateData["verification.nid_verified"] = parseBoolean(nid_verified);
    }

    if (photo_verified !== undefined) {
      updateData["verification.photo_verified"] = parseBoolean(photo_verified);
    }

    if (phone_verified !== undefined) {
      updateData["verification.phone_verified"] = parseBoolean(phone_verified);
    }

    if (email_verified !== undefined) {
      updateData["verification.email_verified"] = parseBoolean(email_verified);
    }

    const user = await User.findOneAndUpdate(
      {
        _id: id,
        role: "user",
      },
      {
        $set: updateData,
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: finalVerified
        ? "User profile verified successfully"
        : "User profile rejected successfully",
      user: buildFullUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying user",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: UPDATE USER STATUS
   PATCH /api/admin/users/:id/status
===================================================== */

export const updateUserAccountStatus = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;
    const { account_status } = req.body;

    if (!requirePermission(admin, ADMIN_PERMISSIONS.SUSPEND_USERS)) {
      return res.status(403).json({
        message: "You do not have permission to update user account status",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid user id is required",
      });
    }

    if (!["active", "inactive", "suspended", "deleted"].includes(account_status)) {
      return res.status(400).json({
        message: "Invalid account status",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        _id: id,
        role: "user",
      },
      {
        $set: {
          account_status,
          profile_status: account_status === "suspended" ? "hidden" : undefined,
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User account status updated successfully",
      user: buildFullUser(user),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating user account status",
      error: error.message,
    });
  }
};

/* =====================================================
   SUPERADMIN: CREATE MODERATOR / SUPERADMIN
   POST /api/admin/staff
===================================================== */

export const createAdminUser = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!isSuperAdmin(admin)) {
      return res.status(403).json({
        message: "Only superadmin can create admin or moderator accounts",
      });
    }

    const {
      username,
      first_name,
      last_name,
      email_address,
      email,
      phone_number,
      password,
      role = "moderator",
      permissions,
      isVerified = true,
      admin_status = "active",
    } = req.body;

    const finalEmail = email_address || email;

    if (!finalEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    if (!ADMIN_ROLES.includes(role)) {
      return res.status(400).json({
        message: "Role must be moderator or superadmin",
      });
    }

    const normalizedEmail = normalizeEmail(finalEmail);
    const normalizedUsername = username
      ? String(username).toLowerCase().trim()
      : undefined;

    const existing = await User.exists({
      $or: [
        { email_address: normalizedEmail },
        ...(normalizedUsername ? [{ username: normalizedUsername }] : []),
      ],
    });

    if (existing) {
      return res.status(400).json({
        message: "Email or username already exists",
      });
    }

    const finalPermissions =
      role === "superadmin"
        ? Object.values(ADMIN_PERMISSIONS)
        : Array.isArray(permissions)
          ? permissions
          : DEFAULT_MODERATOR_PERMISSIONS;

    const newAdmin = new User({
      role,
      username: normalizedUsername,
      first_name: first_name ? normalizeString(first_name) : role,
      last_name: last_name ? normalizeString(last_name) : "Account",
      email_address: normalizedEmail,
      phone_number: phone_number ? normalizePhone(phone_number) : undefined,
      password,
      permissions: finalPermissions,
      isVerified: parseBoolean(isVerified),
      verifiedAt: parseBoolean(isVerified) ? new Date() : null,
      verifiedBy: admin._id,
      admin_status,
      account_status: "active",
      profile_status: "approved",
      verification: {
        email_verified: true,
        biodata_verified: true,
        verification_status: "approved",
      },
    });

    await newAdmin.save();

    const createdAdmin = await User.findById(newAdmin._id)
      .select(ADMIN_SAFE_SELECT)
      .lean({ virtuals: true });

    res.status(201).json({
      message: `${role} created successfully`,
      admin: buildAdminUser(createdAdmin),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating admin account",
      error: error.message,
    });
  }
};

/* =====================================================
   SUPERADMIN: GET STAFF
   GET /api/admin/staff
===================================================== */

export const getAdminUsers = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!isSuperAdmin(admin)) {
      return res.status(403).json({
        message: "Only superadmin can view admin accounts",
      });
    }

    const {
      role,
      admin_status,
      isVerified,
      search,
      cursor,
      limit = 20,
    } = req.query;

    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const query = {
      role: { $in: ADMIN_ROLES },
    };

    applyCursor(query, cursor);

    if (role && ADMIN_ROLES.includes(role)) query.role = role;
    if (admin_status) query.admin_status = admin_status;
    if (isVerified === "true") query.isVerified = true;
    if (isVerified === "false") query.isVerified = false;

    if (search) {
      query.$text = {
        $search: String(search).trim(),
      };
    }

    const rows = await User.find(query)
      .select(ADMIN_SAFE_SELECT)
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
      items: itemsRaw.map((item) => buildAdminUser(item)),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching admin accounts",
      error: error.message,
    });
  }
};

/* =====================================================
   SUPERADMIN: UPDATE STAFF
   PATCH /api/admin/staff/:id
===================================================== */

export const updateAdminUser = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;

    if (!isSuperAdmin(admin)) {
      return res.status(403).json({
        message: "Only superadmin can update admin accounts",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid admin id is required",
      });
    }

    if (
      String(admin._id) === String(id) &&
      req.body.role &&
      req.body.role !== "superadmin"
    ) {
      return res.status(400).json({
        message: "Superadmin cannot downgrade their own role",
      });
    }

    const allowedUpdates = [
      "username",
      "first_name",
      "last_name",
      "phone_number",
      "permissions",
      "admin_status",
      "isVerified",
      "role",
    ];

    const $set = {};

    for (const key of allowedUpdates) {
      if (!Object.prototype.hasOwnProperty.call(req.body, key)) continue;

      if (key === "role") {
        if (!ADMIN_ROLES.includes(req.body.role)) {
          return res.status(400).json({
            message: "Role must be moderator or superadmin",
          });
        }

        $set.role = req.body.role;

        if (req.body.role === "superadmin") {
          $set.permissions = Object.values(ADMIN_PERMISSIONS);
        }
      } else if (key === "permissions") {
        $set.permissions = normalizeArray(req.body.permissions);
      } else if (key === "isVerified") {
        const verified = parseBoolean(req.body.isVerified);
        $set.isVerified = verified;
        $set.verifiedAt = verified ? new Date() : null;
        $set.verifiedBy = verified ? admin._id : null;
      } else if (key === "username") {
        $set.username = String(req.body.username).toLowerCase().trim();
      } else if (key === "phone_number") {
        $set.phone_number = normalizePhone(req.body.phone_number);
      } else {
        $set[key] =
          typeof req.body[key] === "string"
            ? normalizeString(req.body[key])
            : req.body[key];
      }
    }

    if (Object.keys($set).length === 0) {
      return res.status(400).json({
        message: "No valid admin fields provided for update",
      });
    }

    const updatedAdmin = await User.findOneAndUpdate(
      {
        _id: id,
        role: { $in: ADMIN_ROLES },
      },
      {
        $set,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select(ADMIN_SAFE_SELECT)
      .lean({ virtuals: true });

    if (!updatedAdmin) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    res.status(200).json({
      message: "Admin account updated successfully",
      admin: buildAdminUser(updatedAdmin),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating admin account",
      error: error.message,
    });
  }
};

/* =====================================================
   SUPERADMIN: VERIFY STAFF
   PATCH /api/admin/staff/:id/verify
===================================================== */

export const verifyAdminUser = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;
    const { isVerified = true } = req.body;

    if (!isSuperAdmin(admin)) {
      return res.status(403).json({
        message: "Only superadmin can verify admin accounts",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid admin id is required",
      });
    }

    const verified = parseBoolean(isVerified);

    if (String(admin._id) === String(id) && !verified) {
      return res.status(400).json({
        message: "Superadmin cannot unverify their own account",
      });
    }

    const updatedAdmin = await User.findOneAndUpdate(
      {
        _id: id,
        role: { $in: ADMIN_ROLES },
      },
      {
        $set: {
          isVerified: verified,
          verifiedAt: verified ? new Date() : null,
          verifiedBy: verified ? admin._id : null,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select(ADMIN_SAFE_SELECT)
      .lean({ virtuals: true });

    if (!updatedAdmin) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    res.status(200).json({
      message: verified
        ? "Admin account verified successfully"
        : "Admin account unverified successfully",
      admin: buildAdminUser(updatedAdmin),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying admin account",
      error: error.message,
    });
  }
};

/* =====================================================
   SUPERADMIN: UPDATE STAFF STATUS
   PATCH /api/admin/staff/:id/status
===================================================== */

export const updateAdminStatus = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;
    const { admin_status } = req.body;

    if (!isSuperAdmin(admin)) {
      return res.status(403).json({
        message: "Only superadmin can update admin status",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid admin id is required",
      });
    }

    if (!["active", "inactive", "suspended"].includes(admin_status)) {
      return res.status(400).json({
        message: "Admin status must be active, inactive, or suspended",
      });
    }

    if (String(admin._id) === String(id) && admin_status !== "active") {
      return res.status(400).json({
        message: "Superadmin cannot deactivate or suspend their own account",
      });
    }

    const updatedAdmin = await User.findOneAndUpdate(
      {
        _id: id,
        role: { $in: ADMIN_ROLES },
      },
      {
        $set: {
          admin_status,
          account_status: admin_status === "suspended" ? "suspended" : "active",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select(ADMIN_SAFE_SELECT)
      .lean({ virtuals: true });

    if (!updatedAdmin) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    res.status(200).json({
      message: "Admin status updated successfully",
      admin: buildAdminUser(updatedAdmin),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating admin status",
      error: error.message,
    });
  }
};

/* =====================================================
   SUPERADMIN: RESET STAFF PASSWORD
   PATCH /api/admin/staff/:id/password
===================================================== */

export const resetAdminPassword = async (req, res) => {
  try {
    const admin = req.admin || req.user;
    const { id } = req.params;
    const { new_password } = req.body;

    if (!isSuperAdmin(admin)) {
      return res.status(403).json({
        message: "Only superadmin can reset admin password",
      });
    }

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        message: "Valid admin id is required",
      });
    }

    if (!new_password || String(new_password).length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters long",
      });
    }

    const target = await User.findOne({
      _id: id,
      role: { $in: ADMIN_ROLES },
    }).select("+password");

    if (!target) {
      return res.status(404).json({
        message: "Admin account not found",
      });
    }

    target.password = new_password;
    await target.save();

    res.status(200).json({
      message: "Admin password reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error resetting admin password",
      error: error.message,
    });
  }
};