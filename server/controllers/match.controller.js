import User from "../models/user.model.js";
import mongoose from "mongoose";

/* =====================================================
   CONSTANTS
===================================================== */

const ADMIN_ROLES = ["moderator", "superadmin"];

const MATCH_CARD_PROJECTION = `
  first_name
  last_name
  dob
  gender
  marital_status
  religion
  current_country
  current_division
  current_district
  current_city
  profession
  highest_education
  occupation_type
  height_cm
  family.family_status
  isVerified
  profile_status
  last_active_at
  createdAt
`;

const VIEWER_SELECT = `
  role
  dob
  gender
  marital_status
  religion
  current_country
  current_division
  current_district
  current_city
  profession
  highest_education
  occupation_type
  height_cm
  family.family_status
  partner_preferences
  membership
  membership_expiry
  profile_status
  account_status
`;

/* =====================================================
   HELPERS
===================================================== */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const resolveUserId = (req) => req.user?._id || req.user?.id;

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return [value].filter(Boolean);
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

const resolveLookingForGender = (viewer) => {
  const lookingFor = viewer?.partner_preferences?.looking_for || viewer?.looking_for;

  if (lookingFor === "bride") return "female";
  if (lookingFor === "groom") return "male";

  if (viewer?.gender === "male") return "female";
  if (viewer?.gender === "female") return "male";

  return null;
};

const buildMembershipStatus = (user) => {
  const m = user?.membership || null;
  const expiry = user?.membership_expiry ? new Date(user.membership_expiry) : null;
  const now = new Date();
  const active = Boolean(m && expiry && expiry > now);

  return {
    active,
    can_view_full_profiles: Boolean(active && m?.can_view_full_profiles),
  };
};

const viewerCanSeeFull = (viewer) => {
  if (!viewer) return false;
  if (ADMIN_ROLES.includes(viewer.role)) return true;

  const membershipStatus = buildMembershipStatus(viewer);
  return Boolean(membershipStatus.active && membershipStatus.can_view_full_profiles);
};

const buildLockedMatchCard = (user, matchScore = 0, reasons = []) => {
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
    match_score: matchScore,
    match_reasons: reasons.slice(0, 4),

    // Never expose profile photo URLs in match list.
    profile_photos: [],
    profile_photo_locked: true,
    profile_locked: true,
    locked: true,
  };
};

const buildFullMatchCard = (user, matchScore = 0, reasons = []) => {
  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  return {
    _id: user?._id,
    full_name: fullName || "User",
    first_name: user?.first_name || null,
    last_name: user?.last_name || null,
    age: calculateAge(user?.dob),
    gender: user?.gender || null,
    religion: user?.religion || null,
    marital_status: user?.marital_status || null,
    current_country: user?.current_country || null,
    current_division: user?.current_division || null,
    current_district: user?.current_district || null,
    current_city: user?.current_city || null,
    profession: user?.profession || null,
    highest_education: user?.highest_education || null,
    occupation_type: user?.occupation_type || null,
    height_cm: user?.height_cm || null,
    family_status: user?.family?.family_status || null,
    isVerified: Boolean(user?.isVerified),
    match_score: matchScore,
    match_reasons: reasons.slice(0, 6),

    // Keep photos locked here too. Let /:id/profile handle photo visibility.
    profile_photos: [],
    profile_photo_locked: true,
    locked: false,
  };
};

const scoreCandidate = (viewer, candidate) => {
  const pref = viewer?.partner_preferences || {};
  let score = 0;
  let total = 0;
  const reasons = [];

  const addScore = (condition, points, reason) => {
    total += points;
    if (condition) {
      score += points;
      if (reason) reasons.push(reason);
    }
  };

  const candidateAge = calculateAge(candidate?.dob);

  addScore(
    Boolean(candidate?.gender === resolveLookingForGender(viewer)),
    20,
    "Preferred gender matched"
  );

  if (pref.preferred_religion) {
    addScore(candidate?.religion === pref.preferred_religion, 18, "Religion matched");
  } else if (viewer?.religion) {
    addScore(candidate?.religion === viewer.religion, 12, "Same religion");
  }

  if (pref.age_range_min || pref.age_range_max) {
    const minOk = pref.age_range_min ? candidateAge >= Number(pref.age_range_min) : true;
    const maxOk = pref.age_range_max ? candidateAge <= Number(pref.age_range_max) : true;
    addScore(Boolean(candidateAge && minOk && maxOk), 16, "Age preference matched");
  }

  if (pref.preferred_height_min_cm || pref.preferred_height_max_cm) {
    const minOk = pref.preferred_height_min_cm
      ? Number(candidate?.height_cm) >= Number(pref.preferred_height_min_cm)
      : true;
    const maxOk = pref.preferred_height_max_cm
      ? Number(candidate?.height_cm) <= Number(pref.preferred_height_max_cm)
      : true;
    addScore(Boolean(candidate?.height_cm && minOk && maxOk), 8, "Height preference matched");
  }

  const preferredMarital = normalizeArray(pref.preferred_marital_status);
  if (preferredMarital.length > 0) {
    addScore(preferredMarital.includes(candidate?.marital_status), 10, "Marital status matched");
  } else {
    addScore(candidate?.marital_status === viewer?.marital_status, 5, "Similar marital status");
  }

  const preferredEducation = normalizeArray(pref.preferred_education);
  if (preferredEducation.length > 0) {
    addScore(preferredEducation.includes(candidate?.highest_education), 8, "Education preference matched");
  }

  const preferredProfession = normalizeArray(pref.preferred_profession);
  if (preferredProfession.length > 0) {
    addScore(preferredProfession.includes(candidate?.profession), 8, "Profession preference matched");
  }

  const preferredDivisions = normalizeArray(pref.preferred_division);
  if (preferredDivisions.length > 0) {
    addScore(preferredDivisions.includes(candidate?.current_division), 8, "Preferred division matched");
  } else if (viewer?.current_division) {
    addScore(candidate?.current_division === viewer.current_division, 5, "Same division");
  }

  const preferredDistricts = normalizeArray(pref.preferred_district);
  if (preferredDistricts.length > 0) {
    addScore(preferredDistricts.includes(candidate?.current_district), 8, "Preferred district matched");
  } else if (viewer?.current_district) {
    addScore(candidate?.current_district === viewer.current_district, 5, "Same district");
  }

  const preferredFamilyStatus = normalizeArray(pref.preferred_family_status);
  if (preferredFamilyStatus.length > 0) {
    addScore(
      preferredFamilyStatus.includes(candidate?.family?.family_status),
      4,
      "Family status preference matched"
    );
  }

  addScore(Boolean(candidate?.isVerified), 5, "Verified profile");

  if (total === 0) return { matchScore: 0, reasons };

  return {
    matchScore: Math.min(100, Math.round((score / total) * 100)),
    reasons,
  };
};

const buildMatchQuery = (viewer, reqQuery = {}) => {
  const pref = viewer?.partner_preferences || {};
  const query = {
    _id: { $ne: viewer._id },
    role: "user",
    account_status: "active",
    profile_status: { $in: ["approved", "pending_review"] },
    "privacy.allow_profile_view": { $ne: false },
  };

  const wantedGender = resolveLookingForGender(viewer);
  if (wantedGender) query.gender = wantedGender;

  if (pref.preferred_religion) query.religion = pref.preferred_religion;

  const preferredMarital = normalizeArray(pref.preferred_marital_status);
  if (preferredMarital.length > 0) {
    query.marital_status = { $in: preferredMarital };
  } else {
    const allowed = ["never_married"];
    if (pref.accept_divorced) allowed.push("divorced");
    if (pref.accept_widowed) allowed.push("widowed");
    query.marital_status = { $in: allowed };
  }

  if (pref.age_range_min || pref.age_range_max) {
    query.dob = calculateDobRange(pref.age_range_min, pref.age_range_max);
  }

  if (pref.preferred_height_min_cm || pref.preferred_height_max_cm) {
    query.height_cm = {};
    if (pref.preferred_height_min_cm) {
      query.height_cm.$gte = Number(pref.preferred_height_min_cm);
    }
    if (pref.preferred_height_max_cm) {
      query.height_cm.$lte = Number(pref.preferred_height_max_cm);
    }
  }

  const preferredCountries = normalizeArray(pref.preferred_country);
  if (preferredCountries.length > 0) {
    query.current_country = { $in: preferredCountries };
  }

  const preferredDivisions = normalizeArray(pref.preferred_division);
  if (preferredDivisions.length > 0) {
    query.current_division = { $in: preferredDivisions };
  }

  const preferredDistricts = normalizeArray(pref.preferred_district);
  if (preferredDistricts.length > 0) {
    query.current_district = { $in: preferredDistricts };
  }

  const preferredEducation = normalizeArray(pref.preferred_education);
  if (preferredEducation.length > 0) {
    query.highest_education = { $in: preferredEducation };
  }

  const preferredProfession = normalizeArray(pref.preferred_profession);
  if (preferredProfession.length > 0) {
    query.profession = { $in: preferredProfession };
  }

  // Optional query overrides from UI filters.
  if (reqQuery.religion) query.religion = reqQuery.religion;
  if (reqQuery.division) query.current_division = reqQuery.division;
  if (reqQuery.district) query.current_district = reqQuery.district;
  if (reqQuery.profession) query.profession = reqQuery.profession;
  if (reqQuery.education) query.highest_education = reqQuery.education;
  if (reqQuery.verified === "true") query.isVerified = true;

  if (reqQuery.minAge || reqQuery.maxAge) {
    query.dob = calculateDobRange(reqQuery.minAge, reqQuery.maxAge);
  }

  return query;
};

/* =====================================================
   GET MY MATCHES
   GET /api/user/matches?limit=20&cursor=&minScore=0
===================================================== */

export const getMyMatches = async (req, res) => {
  try {
    const uid = resolveUserId(req);

    if (!uid || !isValidObjectId(uid)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    const { cursor, limit = 20, minScore = 0 } = req.query;
    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const minimumScore = Math.min(100, Math.max(0, Number(minScore) || 0));

    const viewer = await User.findById(uid)
      .select(VIEWER_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    if (!viewer) {
      return res.status(404).json({ message: "User not found" });
    }

    if (viewer.role !== "user") {
      return res.status(403).json({ message: "Only normal users can find matches" });
    }

    if (viewer.account_status !== "active") {
      return res.status(403).json({ message: "Your account is not active" });
    }

    const query = buildMatchQuery(viewer, req.query);
    applyCursor(query, cursor);

    // Fetch extra rows because score filtering happens after query.
    const rows = await User.find(query)
      .select(MATCH_CARD_PROJECTION)
      .sort({ isVerified: -1, last_active_at: -1, _id: -1 })
      .limit(perPage * 3 + 1)
      .lean({ virtuals: true });

    const scored = rows
      .map((candidate) => {
        const { matchScore, reasons } = scoreCandidate(viewer, candidate);
        return { candidate, matchScore, reasons };
      })
      .filter((item) => item.matchScore >= minimumScore)
      .sort((a, b) => b.matchScore - a.matchScore);

    const pageItems = scored.slice(0, perPage);
    const hasNextPage = rows.length > perPage * 3 || scored.length > perPage;

    const canSeeFull = viewerCanSeeFull(viewer);

    res.status(200).json({
      limit: perPage,
      count: pageItems.length,
      hasNextPage,
      nextCursor: hasNextPage ? getNextCursor(pageItems.map((i) => i.candidate)) : null,
      items: pageItems.map((item) =>
        canSeeFull
          ? buildFullMatchCard(item.candidate, item.matchScore, item.reasons)
          : buildLockedMatchCard(item.candidate, item.matchScore, item.reasons)
      ),
    });
  } catch (error) {
    res.status(500).json({
      message: "Error finding matches",
      error: error.message,
    });
  }
};

/* =====================================================
   GET RECOMMENDED MATCHES
   GET /api/user/matches/recommended?limit=10
===================================================== */

export const getRecommendedMatches = async (req, res) => {
  req.query.minScore = req.query.minScore || "60";
  req.query.limit = req.query.limit || "10";
  return getMyMatches(req, res);
};

/* =====================================================
   GET NEARBY MATCHES
   GET /api/user/matches/nearby?limit=20&cursor=
===================================================== */

export const getNearbyMatches = async (req, res) => {
  try {
    const uid = resolveUserId(req);

    if (!uid || !isValidObjectId(uid)) {
      return res.status(400).json({ message: "Valid user id is required" });
    }

    const viewer = await User.findById(uid)
      .select(VIEWER_SELECT)
      .populate("membership")
      .lean({ virtuals: true });

    if (!viewer) {
      return res.status(404).json({ message: "User not found" });
    }

    req.query.division = req.query.division || viewer.current_division;
    req.query.district = req.query.district || viewer.current_district;

    return getMyMatches(req, res);
  } catch (error) {
    res.status(500).json({
      message: "Error finding nearby matches",
      error: error.message,
    });
  }
};