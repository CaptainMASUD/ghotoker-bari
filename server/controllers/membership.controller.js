import mongoose from "mongoose";
import Membership from "../models/membership.model.js";
import User from "../models/user.model.js";

/* =====================================================
   CONSTANTS / HELPERS
===================================================== */

const ADMIN_ROLES = ["moderator", "superadmin"];
const MANAGE_MEMBERSHIPS = "manage_memberships";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const resolveUserId = (req) => req.user?._id || req.user?.id || req.admin?._id || req.admin?.id;

const isSuperAdmin = (user) => user?.role === "superadmin";

const canManageMemberships = (user) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return ADMIN_ROLES.includes(user.role) && Array.isArray(user.permissions) && user.permissions.includes(MANAGE_MEMBERSHIPS);
};

const normalizeBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;
  return fallback;
};

const normalizeNumber = (value, fallback = 0) => {
  if (value === "" || value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const buildSlug = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const cleanFeaturesPayload = (features = {}, base = {}) => {
  const source = { ...base, ...features };

  return {
    can_browse_profiles: normalizeBoolean(source.can_browse_profiles, true),
    profile_view_limit: normalizeNumber(source.profile_view_limit, 10),

    can_view_full_profiles: normalizeBoolean(source.can_view_full_profiles, false),
    can_view_profile_photos: normalizeBoolean(source.can_view_profile_photos, false),
    can_view_biodata: normalizeBoolean(source.can_view_biodata, false),

    can_send_connection_request: normalizeBoolean(source.can_send_connection_request, true),
    connection_request_limit: normalizeNumber(source.connection_request_limit, 3),
    can_accept_connection_request: normalizeBoolean(source.can_accept_connection_request, true),

    can_send_messages: normalizeBoolean(source.can_send_messages, false),
    message_limit: normalizeNumber(source.message_limit, 0),

    can_request_photo_access: normalizeBoolean(source.can_request_photo_access, false),
    photo_request_limit: normalizeNumber(source.photo_request_limit, 0),

    can_request_guardian_contact: normalizeBoolean(source.can_request_guardian_contact, false),
    guardian_contact_request_limit: normalizeNumber(source.guardian_contact_request_limit, 0),

    can_view_phone: normalizeBoolean(source.can_view_phone, false),
    can_view_email: normalizeBoolean(source.can_view_email, false),
    can_view_address: normalizeBoolean(source.can_view_address, false),

    can_shortlist_profiles: normalizeBoolean(source.can_shortlist_profiles, true),
    shortlist_limit: normalizeNumber(source.shortlist_limit, 5),

    can_see_who_viewed_me: normalizeBoolean(source.can_see_who_viewed_me, false),
    can_boost_profile: normalizeBoolean(source.can_boost_profile, false),
    profile_boost_days: normalizeNumber(source.profile_boost_days, 0),

    priority_support: normalizeBoolean(source.priority_support, false),
  };
};

const getMembershipExpiry = (membership) => {
  if (membership.is_free || membership.slug === "free" || !membership.duration_days) {
    return null;
  }

  return new Date(Date.now() + Number(membership.duration_days) * 24 * 60 * 60 * 1000);
};

/* =====================================================
   PUBLIC: GET ACTIVE PLANS
   GET /api/memberships
===================================================== */

export const getPublicMembershipPlans = async (req, res) => {
  try {
    const memberships = await Membership.find({ is_active: true })
      .sort({ sort_order: 1, price: 1, _id: -1 })
      .select("-created_by -updated_by")
      .lean();

    res.status(200).json({
      count: memberships.length,
      items: memberships,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching membership plans", error: error.message });
  }
};

/* =====================================================
   ADMIN: CREATE MEMBERSHIP
   POST /api/memberships/admin
===================================================== */

export const createMembership = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManageMemberships(admin)) {
      return res.status(403).json({ message: "You do not have permission to manage memberships" });
    }

    const {
      name,
      slug,
      description,
      price = 0,
      currency = "BDT",
      duration_days = 30,
      is_active = true,
      sort_order = 0,
      features = {},
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Membership name is required" });
    }

    const finalSlug = buildSlug(slug || name);

    if (!finalSlug) {
      return res.status(400).json({ message: "Valid membership slug is required" });
    }

    if (finalSlug === "free") {
      return res.status(400).json({
        message: "Default Free Plan already exists. Update the Free Plan instead of creating it again.",
      });
    }

    const exists = await Membership.exists({ slug: finalSlug });

    if (exists) {
      return res.status(409).json({ message: "Membership slug already exists" });
    }

    const membership = await Membership.create({
      name,
      slug: finalSlug,
      description,
      price: normalizeNumber(price, 0),
      currency,
      duration_days: normalizeNumber(duration_days, 30),
      is_default: false,
      is_free: false,
      is_active: normalizeBoolean(is_active, true),
      sort_order: normalizeNumber(sort_order, 0),
      features: cleanFeaturesPayload(features),
      created_by: resolveUserId(req) || null,
      updated_by: resolveUserId(req) || null,
    });

    res.status(201).json({ message: "Membership created successfully", membership });
  } catch (error) {
    res.status(500).json({ message: "Error creating membership", error: error.message });
  }
};

/* =====================================================
   ADMIN: LIST MEMBERSHIPS
   GET /api/memberships/admin
===================================================== */

export const getMembershipsForAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManageMemberships(admin)) {
      return res.status(403).json({ message: "You do not have permission to manage memberships" });
    }

    const { search = "", status = "", type = "", limit = 50, page = 1 } = req.query;

    const perPage = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const currentPage = Math.max(1, parseInt(page, 10));

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") query.is_active = true;
    if (status === "inactive") query.is_active = false;
    if (type === "free") query.is_free = true;
    if (type === "paid") query.is_free = false;

    const [items, total] = await Promise.all([
      Membership.find(query)
        .sort({ is_default: -1, sort_order: 1, price: 1, _id: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .lean(),
      Membership.countDocuments(query),
    ]);

    res.status(200).json({
      count: items.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / perPage),
      items,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching memberships", error: error.message });
  }
};

/* =====================================================
   ADMIN: GET MEMBERSHIP DETAILS
   GET /api/memberships/admin/:id
===================================================== */

export const getMembershipById = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManageMemberships(admin)) {
      return res.status(403).json({ message: "You do not have permission to manage memberships" });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Valid membership id is required" });
    }

    const membership = await Membership.findById(id).lean();

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const usersCount = await User.countDocuments({ membership: membership._id, account_status: { $ne: "deleted" } });

    res.status(200).json({ membership, usersCount });
  } catch (error) {
    res.status(500).json({ message: "Error fetching membership", error: error.message });
  }
};

/* =====================================================
   ADMIN: UPDATE MEMBERSHIP
   PATCH /api/memberships/admin/:id
===================================================== */

export const updateMembership = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManageMemberships(admin)) {
      return res.status(403).json({ message: "You do not have permission to manage memberships" });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Valid membership id is required" });
    }

    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const existingFeatures = membership.features?.toObject?.() || membership.features || {};
    const isFreePlan = membership.slug === "free" || membership.is_default || membership.is_free;

    const { name, description, price, currency, duration_days, is_active, sort_order, features } = req.body;

    if (name !== undefined) membership.name = name;
    if (description !== undefined) membership.description = description;
    if (currency !== undefined) membership.currency = currency;
    if (sort_order !== undefined) membership.sort_order = normalizeNumber(sort_order, membership.sort_order || 0);

    if (features && typeof features === "object") {
      membership.features = cleanFeaturesPayload(features, existingFeatures);
    }

    if (isFreePlan) {
      membership.slug = "free";
      membership.is_default = true;
      membership.is_free = true;
      membership.is_active = true;
      membership.price = 0;
      membership.duration_days = null;
    } else {
      if (price !== undefined) membership.price = normalizeNumber(price, membership.price || 0);
      if (duration_days !== undefined) membership.duration_days = normalizeNumber(duration_days, membership.duration_days || 30);
      if (is_active !== undefined) membership.is_active = normalizeBoolean(is_active, membership.is_active);
    }

    membership.updated_by = resolveUserId(req) || null;

    await membership.save();

    res.status(200).json({ message: "Membership updated successfully", membership });
  } catch (error) {
    res.status(500).json({ message: "Error updating membership", error: error.message });
  }
};

/* =====================================================
   ADMIN: TOGGLE STATUS
   PATCH /api/memberships/admin/:id/status
===================================================== */

export const toggleMembershipStatus = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManageMemberships(admin)) {
      return res.status(403).json({ message: "You do not have permission to manage memberships" });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Valid membership id is required" });
    }

    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    if (membership.slug === "free" || membership.is_default || membership.is_free) {
      return res.status(400).json({ message: "Default Free Plan cannot be disabled" });
    }

    membership.is_active = req.body.is_active !== undefined ? normalizeBoolean(req.body.is_active, membership.is_active) : !membership.is_active;
    membership.updated_by = resolveUserId(req) || null;

    await membership.save();

    res.status(200).json({ message: "Membership status updated successfully", membership });
  } catch (error) {
    res.status(500).json({ message: "Error updating membership status", error: error.message });
  }
};

/* =====================================================
   ADMIN: DELETE MEMBERSHIP
   DELETE /api/memberships/admin/:id
===================================================== */

export const deleteMembership = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManageMemberships(admin)) {
      return res.status(403).json({ message: "You do not have permission to manage memberships" });
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Valid membership id is required" });
    }

    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    if (membership.slug === "free" || membership.is_default || membership.is_free) {
      return res.status(400).json({ message: "Default Free Plan cannot be deleted" });
    }

    const usedByUsers = await User.countDocuments({ membership: membership._id });

    if (usedByUsers > 0) {
      return res.status(400).json({ message: "This membership is assigned to users. Disable it instead of deleting." });
    }

    await membership.deleteOne();

    res.status(200).json({ message: "Membership deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting membership", error: error.message });
  }
};

/* =====================================================
   ADMIN: ASSIGN MEMBERSHIP TO USER
   PATCH /api/memberships/admin/assign-user
===================================================== */

export const assignMembershipToUser = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManageMemberships(admin)) {
      return res.status(403).json({ message: "You do not have permission to manage memberships" });
    }

    const { userId, membershipId } = req.body;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    if (!isValidObjectId(membershipId)) {
      return res.status(400).json({ message: "Valid membership id is required" });
    }

    const [user, membership] = await Promise.all([
      User.findOne({ _id: userId, role: "user" }),
      Membership.findById(membershipId),
    ]);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!membership) return res.status(404).json({ message: "Membership not found" });
    if (!membership.is_active) return res.status(400).json({ message: "Cannot assign inactive membership" });

    user.membership = membership._id;
    user.membership_started_at = new Date();
    user.membership_expiry = getMembershipExpiry(membership);
    user.membership_status = membership.is_free || membership.slug === "free" ? "free" : "active";

    await user.save();

    const savedUser = await User.findById(user._id)
      .select("-password -nid -passport -present_address -permanent_address -family.father_name -family.mother_name")
      .populate("membership")
      .lean({ virtuals: true });

    res.status(200).json({ message: "Membership assigned successfully", user: savedUser });
  } catch (error) {
    res.status(500).json({ message: "Error assigning membership", error: error.message });
  }
};

/* =====================================================
   ADMIN: ENSURE FREE PLAN
   POST /api/memberships/admin/ensure-free-plan
===================================================== */

export const ensureDefaultFreePlan = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManageMemberships(admin)) {
      return res.status(403).json({ message: "You do not have permission to manage memberships" });
    }

    const membership = await Membership.ensureDefaultFreePlan();

    res.status(200).json({ message: "Default Free Plan is ready", membership });
  } catch (error) {
    res.status(500).json({ message: "Error ensuring default free plan", error: error.message });
  }
};
