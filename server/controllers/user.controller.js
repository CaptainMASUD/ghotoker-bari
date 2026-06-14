import User from "../models/user.model.js";
import Membership from "../models/membership.model.js";
import MatrimonyAction from "../models/matrimonyAction.model.js";
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
  highest_education
  profile_photos
  profile_photo_visibility
  privacy
  isVerified
  profile_status
  account_status
  createdAt
`;

const FULL_SAFE_SELECT =
  "-password -nid -passport -present_address -permanent_address -family.father_name -family.mother_name";

const PUBLIC_PROFILE_DETAIL_SELECT =
  "-password -nid -passport -email_normalized -phone_normalized -full_name_normalized";

const VIEWER_PROFILE_ACCESS_SELECT = `
  role
  permissions
  account_status
  admin_status
  isVerified
  membership
  membership_started_at
  membership_expiry
  membership_status
`;

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

const resolveUserId = (req) => req.user?._id || req.user?.id;

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
  if (value === "true" || value === "1" || value === 1) return true;
  if (value === "false" || value === "0" || value === 0) return false;
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

const assignDefaultFreeMembership = async (user) => {
  if (!user || user.membership) return user;

  let freePlan = await Membership.findOne({ slug: "free", is_default: true });

  if (!freePlan) {
    freePlan = await Membership.ensureDefaultFreePlan();
  }

  user.membership = freePlan._id;
  user.membership_started_at = new Date();
  user.membership_expiry = null;
  user.membership_status = "free";

  await user.save();
  return user;
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
   MEMBERSHIP / ACCESS HELPERS
===================================================== */

const buildMembershipStatus = (user) => {
  const membership = user?.membership || null;
  const expiry = user?.membership_expiry ? new Date(user.membership_expiry) : null;
  const now = new Date();

  const isFreePlan = Boolean(
    membership?.slug === "free" || membership?.is_free || membership?.is_default
  );

  const isPaidActive = Boolean(
    membership &&
      !isFreePlan &&
      user?.membership_status === "active" &&
      expiry &&
      expiry > now
  );

  const isFreeActive = Boolean(membership && isFreePlan);
  const active = isFreeActive || isPaidActive;
  const features = membership?.features || {};

  return {
    plan_id: membership?._id || null,
    name: membership?.name || "Free Plan",
    slug: membership?.slug || "free",
    status: user?.membership_status || (isFreeActive ? "free" : "expired"),
    active,
    is_free: isFreeActive,
    is_paid: isPaidActive,
    started_at: user?.membership_started_at || null,
    expiry: user?.membership_expiry || null,
    days_left:
      isPaidActive && expiry
        ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
        : null,
    features,
  };
};

const isAdminViewer = (viewer) => {
  return Boolean(viewer && ADMIN_ROLES.includes(viewer.role));
};

const isOwnerViewer = (viewer, target) => {
  return Boolean(
    viewer &&
      target &&
      String(viewer._id || viewer.id) === String(target._id || target.id)
  );
};

const viewerHasFeature = (viewer, featureKey) => {
  if (!viewer) return false;
  if (isAdminViewer(viewer)) return true;

  const membershipStatus = buildMembershipStatus(viewer);
  if (!membershipStatus.active) return false;

  return Boolean(membershipStatus.features?.[featureKey]);
};

const getExistingAccessStatus = async (viewerId, targetUserId) => {
  if (!viewerId || !targetUserId) {
    return {
      connected: false,
      photo_access_approved: false,
      guardian_contact_approved: false,
      shortlisted: false,
    };
  }

  const actions = await MatrimonyAction.find({
    $or: [
      {
        type: "connection_request",
        status: "accepted",
        $or: [
          { from_user: viewerId, to_user: targetUserId },
          { from_user: targetUserId, to_user: viewerId },
        ],
      },
      {
        type: "photo_access_request",
        from_user: viewerId,
        to_user: targetUserId,
        status: "accepted",
      },
      {
        type: "guardian_contact_request",
        from_user: viewerId,
        to_user: targetUserId,
        status: "accepted",
      },
      {
        type: "shortlist",
        from_user: viewerId,
        to_user: targetUserId,
        status: "active",
      },
    ],
  })
    .select("type status from_user to_user")
    .lean();

  return {
    connected: actions.some((item) => item.type === "connection_request"),
    photo_access_approved: actions.some(
      (item) => item.type === "photo_access_request"
    ),
    guardian_contact_approved: actions.some(
      (item) => item.type === "guardian_contact_request"
    ),
    shortlisted: actions.some((item) => item.type === "shortlist"),
  };
};

const resolvePhotoVisibilityAllowed = ({
  target,
  membershipStatus,
  accessStatus,
  admin,
  owner,
}) => {
  if (admin || owner) return true;
  if (accessStatus?.photo_access_approved) return true;

  const visibility = target?.profile_photo_visibility || "members_only";

  if (visibility === "hidden") return false;
  if (visibility === "private") return false;
  if (visibility === "public") return Boolean(membershipStatus?.active);
  if (visibility === "members_only") return Boolean(membershipStatus?.active);
  if (visibility === "premium_only") return Boolean(membershipStatus?.is_paid);

  return false;
};

const canShowPhotoOnBrowseCard = ({
  viewer,
  target,
  acceptedPhotoAccess = false,
}) => {
  if (!target) return false;

  const photos = Array.isArray(target.profile_photos)
    ? target.profile_photos.filter(Boolean)
    : [];

  if (photos.length === 0) return false;

  const admin = isAdminViewer(viewer);
  const owner = isOwnerViewer(viewer, target);

  if (admin || owner) return true;
  if (acceptedPhotoAccess) return true;
  if (!viewer) return false;

  const membershipStatus = buildMembershipStatus(viewer);

  if (!membershipStatus.active) return false;
  if (!membershipStatus.features?.can_view_profile_photos) return false;

  return resolvePhotoVisibilityAllowed({
    target,
    membershipStatus,
    accessStatus: { photo_access_approved: acceptedPhotoAccess },
    admin,
    owner,
  });
};

const buildProfileAccess = async (viewer, target) => {
  const admin = isAdminViewer(viewer);
  const owner = isOwnerViewer(viewer, target);
  const membershipStatus = buildMembershipStatus(viewer);

  const accessStatus =
    admin || owner
      ? {
          connected: true,
          photo_access_approved: true,
          guardian_contact_approved: true,
          shortlisted: false,
        }
      : await getExistingAccessStatus(viewer?._id, target?._id);

  const canViewFullProfile =
    admin || owner || viewerHasFeature(viewer, "can_view_full_profiles");

  const canViewBiodata =
    admin ||
    owner ||
    (canViewFullProfile && viewerHasFeature(viewer, "can_view_biodata"));

  const photoVisibilityAllowed = resolvePhotoVisibilityAllowed({
    target,
    membershipStatus,
    accessStatus,
    admin,
    owner,
  });

  const canViewProfilePhotos =
    admin ||
    owner ||
    (canViewFullProfile &&
      photoVisibilityAllowed &&
      (viewerHasFeature(viewer, "can_view_profile_photos") ||
        accessStatus.photo_access_approved));

  const canViewPhone =
    admin ||
    owner ||
    (canViewFullProfile &&
      (viewerHasFeature(viewer, "can_view_phone") ||
        accessStatus.guardian_contact_approved) &&
      target?.privacy?.show_phone !== false);

  const canViewEmail =
    admin ||
    owner ||
    (canViewFullProfile &&
      (viewerHasFeature(viewer, "can_view_email") ||
        accessStatus.guardian_contact_approved) &&
      target?.privacy?.show_email !== false);

  const canViewAddress =
    admin ||
    owner ||
    (canViewFullProfile &&
      (viewerHasFeature(viewer, "can_view_address") ||
        accessStatus.guardian_contact_approved) &&
      target?.privacy?.show_address !== false);

  return {
    locked: !canViewFullProfile,
    is_owner: owner,
    is_admin: admin,

    membership: {
      active: membershipStatus.active,
      is_free: membershipStatus.is_free,
      is_paid: membershipStatus.is_paid,
      name: membershipStatus.name,
      status: membershipStatus.status,
      expiry: membershipStatus.expiry,
      days_left: membershipStatus.days_left,
    },

    access_status: accessStatus,

    permissions: {
      can_view_full_profile: canViewFullProfile,
      can_view_biodata: canViewBiodata,
      can_view_profile_photos: canViewProfilePhotos,
      can_view_phone: canViewPhone,
      can_view_email: canViewEmail,
      can_view_address: canViewAddress,

      can_send_connection_request: viewerHasFeature(
        viewer,
        "can_send_connection_request"
      ),
      can_send_messages: viewerHasFeature(viewer, "can_send_messages"),
      can_request_photo_access:
        viewerHasFeature(viewer, "can_request_photo_access") &&
        !canViewProfilePhotos,
      can_request_guardian_contact:
        viewerHasFeature(viewer, "can_request_guardian_contact") &&
        !canViewPhone,
      can_shortlist_profiles: viewerHasFeature(
        viewer,
        "can_shortlist_profiles"
      ),
    },
  };
};

/* =====================================================
   RESPONSE BUILDERS
===================================================== */

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
    current_city: user?.current_city || null,
    profession: user?.profession || null,
    highest_education: user?.highest_education || null,
    isVerified: Boolean(user?.isVerified),
    profile_status: user?.profile_status,

    profile_photos: [],
    profile_photo: null,
    profile_photo_url: null,
    profile_photo_locked: true,
    can_view_profile_photo: false,
    profile_locked: true,
    locked: true,
  };
};

const buildBrowseProfileCard = ({
  user,
  viewer,
  acceptedPhotoAccess = false,
}) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();
  const photos = Array.isArray(user?.profile_photos)
    ? user.profile_photos.filter(Boolean)
    : [];

  const showPhoto = canShowPhotoOnBrowseCard({
    viewer,
    target: user,
    acceptedPhotoAccess,
  });

  return {
    _id: user?._id,
    full_name: fullName || "User",
    first_name: user?.first_name || null,
    last_name: user?.last_name || null,
    age: calculateAge(user?.dob),
    gender: user?.gender || null,
    religion: user?.religion || null,
    marital_status: user?.marital_status || null,
    current_division: user?.current_division || null,
    current_district: user?.current_district || null,
    current_city: user?.current_city || null,
    profession: user?.profession || null,
    highest_education: user?.highest_education || null,
    isVerified: Boolean(user?.isVerified),
    profile_status: user?.profile_status,

    profile_photos: showPhoto ? photos : [],
    profile_photo: showPhoto ? photos[0] || null : null,
    profile_photo_url: showPhoto ? photos[0] || null : null,
    profile_photo_locked: !showPhoto,
    can_view_profile_photo: showPhoto,

    profile_locked: true,
    locked: true,
  };
};

const sanitizeProfileForViewer = (user, access) => {
  const safeUser = buildFullUser(user);

  delete safeUser.password;
  delete safeUser.nid;
  delete safeUser.passport;
  delete safeUser.email_normalized;
  delete safeUser.phone_normalized;
  delete safeUser.full_name_normalized;

  delete safeUser.membership;
  delete safeUser.membership_started_at;
  delete safeUser.membership_expiry;
  delete safeUser.membership_status;

  delete safeUser.role;
  delete safeUser.permissions;
  delete safeUser.admin_status;
  delete safeUser.verification;

  if (!access.permissions.can_view_profile_photos) {
    safeUser.profile_photos = [];
    safeUser.profile_photo_locked = true;
  } else {
    safeUser.profile_photo_locked = false;
  }

  if (!access.permissions.can_view_phone) {
    delete safeUser.phone_number;
    safeUser.phone_locked = true;
  } else {
    safeUser.phone_locked = false;
  }

  if (!access.permissions.can_view_email) {
    delete safeUser.email_address;
    safeUser.email_locked = true;
  } else {
    safeUser.email_locked = false;
  }

  if (!access.permissions.can_view_address) {
    delete safeUser.present_address;
    delete safeUser.permanent_address;
    delete safeUser.permanent_division;
    delete safeUser.permanent_district;
    delete safeUser.permanent_upazila;
    safeUser.address_locked = true;
  } else {
    safeUser.address_locked = false;
  }

  if (!access.permissions.can_view_biodata) {
    delete safeUser.about_me;
    delete safeUser.family;
    delete safeUser.lifestyle;
    delete safeUser.children;
    delete safeUser.disability;
    delete safeUser.education_details;
    delete safeUser.partner_preferences;

    delete safeUser.sect;
    delete safeUser.caste_or_community;
    delete safeUser.mother_tongue;
    delete safeUser.nationality;

    delete safeUser.height;
    delete safeUser.height_cm;
    delete safeUser.weight;
    delete safeUser.weight_kg;
    delete safeUser.body_type;
    delete safeUser.complexion;
    delete safeUser.blood_group;

    delete safeUser.annual_income;
    delete safeUser.monthly_income;
    delete safeUser.monthly_income_min;
    delete safeUser.monthly_income_max;
    delete safeUser.company_or_business_name;
    delete safeUser.designation;
    delete safeUser.occupation_type;

    delete safeUser.preferred_location;
    delete safeUser.willing_to_relocate;

    safeUser.biodata_locked = true;
  } else {
    safeUser.biodata_locked = false;
  }

  safeUser.profile_locked = false;
  safeUser.locked = false;

  return safeUser;
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
  "membership_started_at",
  "membership_expiry",
  "membership_status",
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

  for (const blockedField of blockedUserUpdateFields) {
    if (Object.prototype.hasOwnProperty.call(body, blockedField)) {
      delete body[blockedField];
    }
  }

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

      if (field === "phone_number") {
        value = normalizePhone(value);
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

  $set.last_active_at = new Date();

  return $set;
};

/* =====================================================
   AUTH: REGISTER USER
===================================================== */

export const registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email_address,
      email,
      phone_number,
      password,
      dob,
      gender,
      nid,
      passport,
      current_city,
      current_division,
      current_district,
      preferred_location,
      profession,
      highest_education,
      annual_income,
      religion,
      marital_status,
      height,
      mother_tongue,
      about_me,
    } = req.body;

    const loginEmail = email_address || email;

    if (!first_name || !last_name || !loginEmail || !password) {
      return res.status(400).json({
        message: "First name, last name, email and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = normalizeEmail(loginEmail);

    const existingUser = await User.exists({
      email_address: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const uploadedPhotos = await uploadProfilePhotos(req.files || []);

    const user = new User({
      role: "user",
      first_name: normalizeString(first_name),
      last_name: normalizeString(last_name),
      email_address: normalizedEmail,
      phone_number: phone_number ? normalizePhone(phone_number) : undefined,
      password,
      dob,
      gender,
      nid,
      passport,
      current_city: normalizeString(current_city),
      current_division: normalizeString(current_division),
      current_district: normalizeString(current_district),
      preferred_location: normalizeString(preferred_location),
      profession: normalizeString(profession),
      highest_education: normalizeString(highest_education),
      annual_income: normalizeString(annual_income),
      religion: normalizeString(religion),
      marital_status: normalizeString(marital_status),
      height: normalizeString(height),
      mother_tongue: normalizeString(mother_tongue),
      about_me: normalizeString(about_me),
      profile_photos: uploadedPhotos,
      profile_photo_visibility: "members_only",
      privacy: {
        allow_profile_view: true,
        allow_messages: true,
        show_phone: false,
        show_email: false,
        show_address: false,
        show_income: false,
        show_family_details: false,
      },
      account_status: "active",
      profile_status: "pending_review",
      last_login: new Date(),
      last_active_at: new Date(),
    });

    await user.save();
    await assignDefaultFreeMembership(user);

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
   AUTH: LOGIN USER / ADMIN
===================================================== */

export const loginUser = async (req, res) => {
  try {
    const { email_address, email, phone_number, password } = req.body;
    const loginEmail = email_address || email;

    if ((!loginEmail && !phone_number) || !password) {
      return res.status(400).json({
        message: "Email or phone and password are required",
      });
    }

    const query = loginEmail
      ? { email_address: normalizeEmail(loginEmail) }
      : { phone_number: normalizePhone(phone_number) };

    const user = await User.findOne(query).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.account_status && user.account_status !== "active") {
      return res.status(403).json({
        message: "Your account is not active",
      });
    }

    if (user.role === "user") {
      await assignDefaultFreeMembership(user);
    }

    user.last_login = new Date();
    user.last_active_at = new Date();
    await user.save();

    const savedUser = await User.findById(user._id)
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user),
      user: ADMIN_ROLES.includes(savedUser.role)
        ? buildAdminUser(savedUser)
        : buildFullUser(savedUser),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

/* =====================================================
   GET ME
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
   UPDATE ME
===================================================== */

export const updateMe = async (req, res) => {
  try {
    const uid = resolveUserId(req);

    if (!uid || !isValidObjectId(uid)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    const $set = buildProfileUpdatePayload({ ...req.body });
    const uploadedPhotos = await uploadProfilePhotos(req.files || []);

    const update = {
      $set,
    };

    if (uploadedPhotos.length > 0) {
      update.$push = {
        profile_photos: {
          $each: uploadedPhotos,
        },
      };
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: uid,
        role: "user",
      },
      update,
      {
        new: true,
        runValidators: true,
      }
    )
      .select(FULL_SAFE_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

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
   BROWSE USERS
   GET /api/user/browse
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
      const keyword = String(search).trim();

      if (keyword) {
        query.$or = [
          { first_name: { $regex: keyword, $options: "i" } },
          { last_name: { $regex: keyword, $options: "i" } },
          { current_city: { $regex: keyword, $options: "i" } },
          { current_district: { $regex: keyword, $options: "i" } },
          { current_division: { $regex: keyword, $options: "i" } },
          { profession: { $regex: keyword, $options: "i" } },
          { highest_education: { $regex: keyword, $options: "i" } },
        ];
      }
    }

    const viewerId = resolveUserId(req);

    const [rows, viewer] = await Promise.all([
      User.find(query)
        .select(PUBLIC_CARD_PROJECTION)
        .sort({ _id: -1 })
        .limit(perPage + 1)
        .lean({ virtuals: true }),

      viewerId && isValidObjectId(viewerId)
        ? User.findById(viewerId)
            .select(VIEWER_PROFILE_ACCESS_SELECT)
            .populate("membership")
            .lean({ virtuals: true })
        : null,
    ]);

    const hasNextPage = rows.length > perPage;
    const itemsRaw = hasNextPage ? rows.slice(0, perPage) : rows;
    const targetIds = itemsRaw.map((item) => item._id).filter(Boolean);

    let acceptedPhotoAccessSet = new Set();

    if (viewerId && targetIds.length > 0) {
      const acceptedPhotoRequests = await MatrimonyAction.find({
        type: "photo_access_request",
        from_user: viewerId,
        to_user: { $in: targetIds },
        status: "accepted",
      })
        .select("to_user")
        .lean();

      acceptedPhotoAccessSet = new Set(
        acceptedPhotoRequests.map((item) => String(item.to_user))
      );
    }

    const items = itemsRaw.map((user) =>
      buildBrowseProfileCard({
        user,
        viewer,
        acceptedPhotoAccess: acceptedPhotoAccessSet.has(String(user._id)),
      })
    );

    const membershipStatus = viewer ? buildMembershipStatus(viewer) : null;

    res.status(200).json({
      limit: perPage,
      count: items.length,
      hasNextPage,
      nextCursor: hasNextPage ? getNextCursor(itemsRaw) : null,
      viewer_access: {
        logged_in: Boolean(viewer),
        membership_active: Boolean(membershipStatus?.active),
        can_view_profile_photos: Boolean(
          membershipStatus?.active &&
            membershipStatus?.features?.can_view_profile_photos
        ),
      },
      items,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error browsing users",
      error: error.message,
    });
  }
};

/* =====================================================
   GET USER PROFILE DETAILS
   GET /api/user/:id/profile
===================================================== */

export const getUserPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const viewerId = resolveUserId(req);

    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({ message: "Valid profile id is required" });
    }

    if (!viewerId || !isValidObjectId(viewerId)) {
      return res.status(401).json({
        locked: true,
        code: "LOGIN_REQUIRED",
        message: "Please login to view profile details",
      });
    }

    const [target, viewer] = await Promise.all([
      User.findOne({
        _id: id,
        role: "user",
        account_status: "active",
        profile_status: { $in: ["approved", "pending_review"] },
        "privacy.allow_profile_view": { $ne: false },
      })
        .select(PUBLIC_PROFILE_DETAIL_SELECT)
        .populate("membership")
        .lean({ virtuals: true }),

      User.findById(viewerId)
        .select(VIEWER_PROFILE_ACCESS_SELECT)
        .populate("membership")
        .lean({ virtuals: true }),
    ]);

    if (!viewer) {
      return res.status(404).json({
        locked: true,
        code: "VIEWER_NOT_FOUND",
        message: "Logged in user not found",
      });
    }

    if (viewer.account_status !== "active") {
      return res.status(403).json({
        locked: true,
        code: "ACCOUNT_NOT_ACTIVE",
        message: "Your account is not active",
      });
    }

    if (!target) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const access = await buildProfileAccess(viewer, target);

    if (!access.permissions.can_view_full_profile) {
      return res.status(403).json({
        locked: true,
        code: "MEMBERSHIP_REQUIRED",
        message: "Active membership plan is required to view full profile",
        user: buildLockedProfile(target),
        access,
      });
    }

    if (!access.is_owner) {
      User.updateOne(
        { _id: id },
        {
          $inc: { profile_views_count: 1 },
          $set: { last_profile_viewed_at: new Date() },
        }
      ).catch(() => {});
    }

    return res.status(200).json({
      locked: false,
      user: sanitizeProfileForViewer(target, access),
      access,
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

/* =====================================================
   PUBLIC SUPERADMIN REGISTER - TEMPORARY
===================================================== */

export const registerSuperAdminPublic = async (req, res) => {
  try {
    const {
      first_name = "Super",
      last_name = "Admin",
      username,
      email_address,
      email,
      phone_number,
      password,
      permissions = [],
    } = req.body;

    const loginEmail = email_address || email;

    if (!loginEmail || !password) {
      return res.status(400).json({
        message: "Email address and password are required",
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = normalizeEmail(loginEmail);
    const normalizedUsername = username
      ? String(username).toLowerCase().trim()
      : undefined;

    const existingEmail = await User.exists({
      email_address: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    if (normalizedUsername) {
      const existingUsername = await User.exists({
        username: normalizedUsername,
      });

      if (existingUsername) {
        return res.status(400).json({
          message: "Username already taken",
        });
      }
    }

    const superAdmin = new User({
      role: "superadmin",
      first_name: normalizeString(first_name),
      last_name: normalizeString(last_name),
      username: normalizedUsername,
      email_address: normalizedEmail,
      phone_number: phone_number ? normalizePhone(phone_number) : undefined,
      password,
      permissions: Array.isArray(permissions)
        ? permissions
        : normalizeArray(permissions),
      admin_status: "active",
      account_status: "active",
      isVerified: true,
      verifiedAt: new Date(),
      verification: {
        email_verified: true,
        phone_verified: Boolean(phone_number),
        nid_verified: false,
        photo_verified: false,
        biodata_verified: true,
        verification_status: "approved",
      },
      profile_status: "approved",
      last_login: new Date(),
      last_active_at: new Date(),
    });

    await superAdmin.save();

    const savedSuperAdmin = await User.findById(superAdmin._id)
      .select(FULL_SAFE_SELECT)
      .lean({ virtuals: true });

    res.status(201).json({
      message: "Super admin registered successfully",
      token: generateToken(superAdmin),
      user: buildAdminUser(savedSuperAdmin),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering super admin",
      error: error.message,
    });
  }
};