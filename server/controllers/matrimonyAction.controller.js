import mongoose from "mongoose";
import User from "../models/user.model.js";
import MatrimonyAction from "../models/matrimonyAction.model.js";

/* =====================================================
   CONSTANTS
===================================================== */

const ADMIN_ROLES = ["moderator", "superadmin"];

const USER_SAFE_SELECT = `
  first_name
  last_name
  email_address
  phone_number
  dob
  gender
  religion
  marital_status
  current_division
  current_district
  current_city
  profession
  highest_education
  profile_photos
  profile_photo_visibility
  privacy
  account_status
  profile_status
  isVerified
  membership
  membership_started_at
  membership_expiry
  membership_status
`;

const PUBLIC_USER_SELECT = `
  first_name
  last_name
  dob
  gender
  religion
  marital_status
  current_division
  current_district
  current_city
  profession
  highest_education
  profile_status
  account_status
  isVerified
`;

/* =====================================================
   BASIC HELPERS
===================================================== */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const resolveUserId = (req) => req.user?._id || req.user?.id;

const buildError = (res, status, message, extra = {}) => {
  return res.status(status).json({
    message,
    ...extra,
  });
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

const buildUserCard = (user) => {
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
    current_division: user?.current_division || null,
    current_district: user?.current_district || null,
    current_city: user?.current_city || null,
    profession: user?.profession || null,
    highest_education: user?.highest_education || null,
    profile_status: user?.profile_status || null,
    account_status: user?.account_status || null,
    isVerified: Boolean(user?.isVerified),
  };
};

const getUserWithMembership = async (userId) => {
  return User.findById(userId)
    .select(USER_SAFE_SELECT)
    .populate("membership")
    .lean({ virtuals: true });
};

const getTargetUser = async (userId) => {
  return User.findById(userId)
    .select(PUBLIC_USER_SELECT)
    .lean({ virtuals: true });
};

const validateTargetUser = async (res, viewerId, targetUserId) => {
  if (!targetUserId || !isValidObjectId(targetUserId)) {
    buildError(res, 400, "Valid target user id is required");
    return null;
  }

  if (String(viewerId) === String(targetUserId)) {
    buildError(res, 400, "You cannot perform this action on your own profile");
    return null;
  }

  const targetUser = await getTargetUser(targetUserId);

  if (!targetUser) {
    buildError(res, 404, "Target user not found");
    return null;
  }

  if (targetUser.account_status !== "active") {
    buildError(res, 403, "This user account is not active");
    return null;
  }

  if (!["approved", "pending_review"].includes(targetUser.profile_status)) {
    buildError(res, 403, "This profile is not available");
    return null;
  }

  return targetUser;
};

/* =====================================================
   MEMBERSHIP HELPERS
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

  return {
    active,
    is_free: isFreeActive,
    is_paid: isPaidActive,
    membership_id: membership?._id || null,
    membership_name: membership?.name || "Free Plan",
    started_at: user?.membership_started_at || user?.createdAt || null,
    expiry: user?.membership_expiry || null,
    features: membership?.features || {},
  };
};

const hasFeature = (user, featureKey) => {
  if (!user) return false;
  if (ADMIN_ROLES.includes(user.role)) return true;

  const membershipStatus = buildMembershipStatus(user);

  if (!membershipStatus.active) return false;

  return Boolean(membershipStatus.features?.[featureKey]);
};

const getFeatureLimit = (user, limitKey, fallback = 0) => {
  if (!user) return fallback;
  if (ADMIN_ROLES.includes(user.role)) return -1;

  const membershipStatus = buildMembershipStatus(user);

  if (!membershipStatus.active) return fallback;

  const value = membershipStatus.features?.[limitKey];

  if (value === undefined || value === null) return fallback;

  return Number(value);
};

const getLimitStartDate = (user) => {
  const membershipStatus = buildMembershipStatus(user);

  if (membershipStatus.started_at) {
    return new Date(membershipStatus.started_at);
  }

  return new Date(0);
};

const checkFeatureOrReject = (res, user, featureKey) => {
  if (!hasFeature(user, featureKey)) {
    buildError(res, 403, "Your current membership does not allow this action", {
      required_feature: featureKey,
    });

    return false;
  }

  return true;
};

const checkLimitOrReject = async ({
  res,
  user,
  type,
  limitKey,
  fallbackLimit = 0,
}) => {
  const limit = getFeatureLimit(user, limitKey, fallbackLimit);

  if (limit === -1) {
    return {
      allowed: true,
      limit,
      used: 0,
      remaining: -1,
    };
  }

  const startDate = getLimitStartDate(user);

  const used = await MatrimonyAction.countDocuments({
    from_user: user._id,
    type,
    status: {
      $nin: ["rejected", "cancelled", "removed"],
    },
    createdAt: {
      $gte: startDate,
    },
  });

  const remaining = Math.max(0, limit - used);

  if (used >= limit) {
    buildError(res, 403, "Your membership limit is finished for this action", {
      limit_key: limitKey,
      limit,
      used,
      remaining: 0,
    });

    return {
      allowed: false,
      limit,
      used,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    limit,
    used,
    remaining,
  };
};

const findAcceptedConnection = async (userA, userB) => {
  return MatrimonyAction.findOne({
    type: "connection_request",
    status: "accepted",
    $or: [
      {
        from_user: userA,
        to_user: userB,
      },
      {
        from_user: userB,
        to_user: userA,
      },
    ],
  });
};

const hasAcceptedConnection = async (userA, userB) => {
  const connection = await findAcceptedConnection(userA, userB);
  return Boolean(connection);
};

const hasAcceptedPhotoAccess = async (viewerId, targetUserId) => {
  const request = await MatrimonyAction.findOne({
    type: "photo_access_request",
    from_user: viewerId,
    to_user: targetUserId,
    status: "accepted",
  });

  return Boolean(request);
};

const hasAcceptedGuardianContact = async (viewerId, targetUserId) => {
  const request = await MatrimonyAction.findOne({
    type: "guardian_contact_request",
    from_user: viewerId,
    to_user: targetUserId,
    status: "accepted",
  });

  return Boolean(request);
};

/* =====================================================
   1. PROFILE VIEW CHECK / TRACK
   POST /api/matrimony-actions/profile-view/:targetUserId
===================================================== */

export const viewProfileAction = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    const viewer = await getUserWithMembership(viewerId);

    if (!viewer) {
      return buildError(res, 404, "User not found");
    }

    const targetUser = await validateTargetUser(
      res,
      viewerId,
      req.params.targetUserId
    );

    if (!targetUser) return;

    if (!checkFeatureOrReject(res, viewer, "can_browse_profiles")) return;

    const limitCheck = await checkLimitOrReject({
      res,
      user: viewer,
      type: "profile_view",
      limitKey: "profile_view_limit",
      fallbackLimit: 10,
    });

    if (!limitCheck.allowed) return;

    let action = await MatrimonyAction.findOne({
      type: "profile_view",
      from_user: viewerId,
      to_user: targetUser._id,
    });

    if (!action) {
      action = await MatrimonyAction.create({
        type: "profile_view",
        from_user: viewerId,
        to_user: targetUser._id,
        status: "seen",
        seen_at: new Date(),
      });

      await User.updateOne(
        { _id: targetUser._id },
        { $inc: { profile_views_count: 1 } }
      );
    } else {
      action.status = "seen";
      action.seen_at = new Date();
      await action.save();
    }

    res.status(200).json({
      message: "Profile view allowed",
      action,
      targetUser: buildUserCard(targetUser),
      limit: limitCheck,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error tracking profile view",
      error: error.message,
    });
  }
};

/* =====================================================
   2. SEND CONNECTION REQUEST
   POST /api/matrimony-actions/connections/:targetUserId
===================================================== */

export const sendConnectionRequest = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    const viewer = await getUserWithMembership(viewerId);

    if (!viewer) {
      return buildError(res, 404, "User not found");
    }

    const targetUser = await validateTargetUser(
      res,
      viewerId,
      req.params.targetUserId
    );

    if (!targetUser) return;

    if (!checkFeatureOrReject(res, viewer, "can_send_connection_request")) return;

    const alreadyAccepted = await hasAcceptedConnection(viewerId, targetUser._id);

    if (alreadyAccepted) {
      return buildError(res, 409, "You are already connected with this user");
    }

    const existingRequest = await MatrimonyAction.findOne({
      type: "connection_request",
      $or: [
        {
          from_user: viewerId,
          to_user: targetUser._id,
        },
        {
          from_user: targetUser._id,
          to_user: viewerId,
        },
      ],
      status: {
        $in: ["pending", "accepted"],
      },
    });

    if (existingRequest) {
      return buildError(res, 409, "Connection request already exists", {
        request: existingRequest,
      });
    }

    const limitCheck = await checkLimitOrReject({
      res,
      user: viewer,
      type: "connection_request",
      limitKey: "connection_request_limit",
      fallbackLimit: 3,
    });

    if (!limitCheck.allowed) return;

    const request = await MatrimonyAction.create({
      type: "connection_request",
      from_user: viewerId,
      to_user: targetUser._id,
      status: "pending",
      message: req.body.message || "",
    });

    res.status(201).json({
      message: "Connection request sent successfully",
      request,
      targetUser: buildUserCard(targetUser),
      limit: limitCheck,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending connection request",
      error: error.message,
    });
  }
};

/* =====================================================
   3. RESPOND CONNECTION REQUEST
   PATCH /api/matrimony-actions/connections/:requestId/respond
===================================================== */

export const respondConnectionRequest = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);
    const { requestId } = req.params;
    const { action, note = "" } = req.body;

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    if (!isValidObjectId(requestId)) {
      return buildError(res, 400, "Valid request id is required");
    }

    if (!["accept", "reject"].includes(action)) {
      return buildError(res, 400, "Action must be accept or reject");
    }

    const viewer = await getUserWithMembership(viewerId);

    if (!viewer) {
      return buildError(res, 404, "User not found");
    }

    if (!checkFeatureOrReject(res, viewer, "can_accept_connection_request")) return;

    const request = await MatrimonyAction.findOne({
      _id: requestId,
      type: "connection_request",
      to_user: viewerId,
      status: "pending",
    });

    if (!request) {
      return buildError(res, 404, "Pending connection request not found");
    }

    request.status = action === "accept" ? "accepted" : "rejected";
    request.note = note;
    request.responded_at = new Date();

    await request.save();

    res.status(200).json({
      message:
        action === "accept"
          ? "Connection request accepted"
          : "Connection request rejected",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error responding to connection request",
      error: error.message,
    });
  }
};

/* =====================================================
   4. CANCEL / REMOVE CONNECTION
   PATCH /api/matrimony-actions/connections/:requestId/cancel
===================================================== */

export const cancelOrRemoveConnection = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);
    const { requestId } = req.params;

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    if (!isValidObjectId(requestId)) {
      return buildError(res, 400, "Valid request id is required");
    }

    const request = await MatrimonyAction.findOne({
      _id: requestId,
      type: "connection_request",
      $or: [
        {
          from_user: viewerId,
        },
        {
          to_user: viewerId,
        },
      ],
      status: {
        $in: ["pending", "accepted"],
      },
    });

    if (!request) {
      return buildError(res, 404, "Connection request not found");
    }

    request.status = request.status === "pending" ? "cancelled" : "removed";
    request.responded_at = new Date();

    await request.save();

    res.status(200).json({
      message:
        request.status === "cancelled"
          ? "Connection request cancelled"
          : "Connection removed successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling/removing connection",
      error: error.message,
    });
  }
};

/* =====================================================
   5. REQUEST PHOTO ACCESS
   POST /api/matrimony-actions/photo-access/:targetUserId
===================================================== */

export const requestPhotoAccess = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    const viewer = await getUserWithMembership(viewerId);

    if (!viewer) {
      return buildError(res, 404, "User not found");
    }

    const targetUser = await validateTargetUser(
      res,
      viewerId,
      req.params.targetUserId
    );

    if (!targetUser) return;

    if (!checkFeatureOrReject(res, viewer, "can_request_photo_access")) return;

    const alreadyAccepted = await hasAcceptedPhotoAccess(viewerId, targetUser._id);

    if (alreadyAccepted) {
      return buildError(res, 409, "Photo access already approved");
    }

    const existing = await MatrimonyAction.findOne({
      type: "photo_access_request",
      from_user: viewerId,
      to_user: targetUser._id,
      status: "pending",
    });

    if (existing) {
      return buildError(res, 409, "Photo access request already pending", {
        request: existing,
      });
    }

    const limitCheck = await checkLimitOrReject({
      res,
      user: viewer,
      type: "photo_access_request",
      limitKey: "photo_request_limit",
      fallbackLimit: 0,
    });

    if (!limitCheck.allowed) return;

    const request = await MatrimonyAction.create({
      type: "photo_access_request",
      from_user: viewerId,
      to_user: targetUser._id,
      status: "pending",
      message: req.body.message || "",
    });

    res.status(201).json({
      message: "Photo access request sent successfully",
      request,
      targetUser: buildUserCard(targetUser),
      limit: limitCheck,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error requesting photo access",
      error: error.message,
    });
  }
};

/* =====================================================
   6. RESPOND PHOTO ACCESS
   PATCH /api/matrimony-actions/photo-access/:requestId/respond
===================================================== */

export const respondPhotoAccess = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);
    const { requestId } = req.params;
    const { action, note = "" } = req.body;

    if (!isValidObjectId(requestId)) {
      return buildError(res, 400, "Valid request id is required");
    }

    if (!["accept", "reject"].includes(action)) {
      return buildError(res, 400, "Action must be accept or reject");
    }

    const request = await MatrimonyAction.findOne({
      _id: requestId,
      type: "photo_access_request",
      to_user: viewerId,
      status: "pending",
    });

    if (!request) {
      return buildError(res, 404, "Pending photo access request not found");
    }

    request.status = action === "accept" ? "accepted" : "rejected";
    request.note = note;
    request.responded_at = new Date();

    await request.save();

    res.status(200).json({
      message:
        action === "accept"
          ? "Photo access approved"
          : "Photo access rejected",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error responding to photo access request",
      error: error.message,
    });
  }
};

/* =====================================================
   7. REQUEST GUARDIAN CONTACT ACCESS
   POST /api/matrimony-actions/guardian-contact/:targetUserId
===================================================== */

export const requestGuardianContact = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    const viewer = await getUserWithMembership(viewerId);

    if (!viewer) {
      return buildError(res, 404, "User not found");
    }

    const targetUser = await validateTargetUser(
      res,
      viewerId,
      req.params.targetUserId
    );

    if (!targetUser) return;

    if (!checkFeatureOrReject(res, viewer, "can_request_guardian_contact")) return;

    const connected = await hasAcceptedConnection(viewerId, targetUser._id);

    if (!connected) {
      return buildError(
        res,
        403,
        "Guardian contact can be requested only after accepted connection"
      );
    }

    const alreadyAccepted = await hasAcceptedGuardianContact(
      viewerId,
      targetUser._id
    );

    if (alreadyAccepted) {
      return buildError(res, 409, "Guardian contact access already approved");
    }

    const existing = await MatrimonyAction.findOne({
      type: "guardian_contact_request",
      from_user: viewerId,
      to_user: targetUser._id,
      status: "pending",
    });

    if (existing) {
      return buildError(res, 409, "Guardian contact request already pending", {
        request: existing,
      });
    }

    const limitCheck = await checkLimitOrReject({
      res,
      user: viewer,
      type: "guardian_contact_request",
      limitKey: "guardian_contact_request_limit",
      fallbackLimit: 0,
    });

    if (!limitCheck.allowed) return;

    const request = await MatrimonyAction.create({
      type: "guardian_contact_request",
      from_user: viewerId,
      to_user: targetUser._id,
      status: "pending",
      message: req.body.message || "",
    });

    res.status(201).json({
      message: "Guardian contact request sent successfully",
      request,
      targetUser: buildUserCard(targetUser),
      limit: limitCheck,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error requesting guardian contact",
      error: error.message,
    });
  }
};

/* =====================================================
   8. RESPOND GUARDIAN CONTACT ACCESS
   PATCH /api/matrimony-actions/guardian-contact/:requestId/respond
===================================================== */

export const respondGuardianContact = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);
    const { requestId } = req.params;
    const { action, note = "" } = req.body;

    if (!isValidObjectId(requestId)) {
      return buildError(res, 400, "Valid request id is required");
    }

    if (!["accept", "reject"].includes(action)) {
      return buildError(res, 400, "Action must be accept or reject");
    }

    const request = await MatrimonyAction.findOne({
      _id: requestId,
      type: "guardian_contact_request",
      to_user: viewerId,
      status: "pending",
    });

    if (!request) {
      return buildError(res, 404, "Pending guardian contact request not found");
    }

    request.status = action === "accept" ? "accepted" : "rejected";
    request.note = note;
    request.responded_at = new Date();

    await request.save();

    res.status(200).json({
      message:
        action === "accept"
          ? "Guardian contact request approved"
          : "Guardian contact request rejected",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error responding to guardian contact request",
      error: error.message,
    });
  }
};

/* =====================================================
   9. ADD SHORTLIST
   POST /api/matrimony-actions/shortlist/:targetUserId
===================================================== */

export const addToShortlist = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    const viewer = await getUserWithMembership(viewerId);

    if (!viewer) {
      return buildError(res, 404, "User not found");
    }

    const targetUser = await validateTargetUser(
      res,
      viewerId,
      req.params.targetUserId
    );

    if (!targetUser) return;

    if (!checkFeatureOrReject(res, viewer, "can_shortlist_profiles")) return;

    const existing = await MatrimonyAction.findOne({
      type: "shortlist",
      from_user: viewerId,
      to_user: targetUser._id,
      status: {
        $ne: "removed",
      },
    });

    if (existing) {
      return buildError(res, 409, "Profile already shortlisted", {
        shortlist: existing,
      });
    }

    const limitCheck = await checkLimitOrReject({
      res,
      user: viewer,
      type: "shortlist",
      limitKey: "shortlist_limit",
      fallbackLimit: 5,
    });

    if (!limitCheck.allowed) return;

    const shortlist = await MatrimonyAction.create({
      type: "shortlist",
      from_user: viewerId,
      to_user: targetUser._id,
      status: "accepted",
    });

    await User.updateOne(
      { _id: targetUser._id },
      { $inc: { shortlisted_by_count: 1 } }
    );

    res.status(201).json({
      message: "Profile added to shortlist",
      shortlist,
      targetUser: buildUserCard(targetUser),
      limit: limitCheck,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error adding profile to shortlist",
      error: error.message,
    });
  }
};

/* =====================================================
   10. REMOVE SHORTLIST
   DELETE /api/matrimony-actions/shortlist/:targetUserId
===================================================== */

export const removeFromShortlist = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);
    const { targetUserId } = req.params;

    if (!isValidObjectId(targetUserId)) {
      return buildError(res, 400, "Valid target user id is required");
    }

    const shortlist = await MatrimonyAction.findOne({
      type: "shortlist",
      from_user: viewerId,
      to_user: targetUserId,
      status: {
        $ne: "removed",
      },
    });

    if (!shortlist) {
      return buildError(res, 404, "Shortlisted profile not found");
    }

    shortlist.status = "removed";
    shortlist.responded_at = new Date();

    await shortlist.save();

    await User.updateOne(
      { _id: targetUserId, shortlisted_by_count: { $gt: 0 } },
      { $inc: { shortlisted_by_count: -1 } }
    );

    res.status(200).json({
      message: "Profile removed from shortlist",
      shortlist,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing profile from shortlist",
      error: error.message,
    });
  }
};

/* =====================================================
   11. SEND MESSAGE
   POST /api/matrimony-actions/messages/:targetUserId
===================================================== */

export const sendMessage = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);
    const { targetUserId } = req.params;
    const { message } = req.body;

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    if (!message || String(message).trim().length === 0) {
      return buildError(res, 400, "Message is required");
    }

    const viewer = await getUserWithMembership(viewerId);

    if (!viewer) {
      return buildError(res, 404, "User not found");
    }

    const targetUser = await validateTargetUser(res, viewerId, targetUserId);

    if (!targetUser) return;

    if (!checkFeatureOrReject(res, viewer, "can_send_messages")) return;

    const connected = await hasAcceptedConnection(viewerId, targetUser._id);

    if (!connected) {
      return buildError(res, 403, "You can send message only after accepted connection");
    }

    const limitCheck = await checkLimitOrReject({
      res,
      user: viewer,
      type: "message",
      limitKey: "message_limit",
      fallbackLimit: 0,
    });

    if (!limitCheck.allowed) return;

    const sentMessage = await MatrimonyAction.create({
      type: "message",
      from_user: viewerId,
      to_user: targetUser._id,
      status: "sent",
      message: String(message).trim(),
    });

    res.status(201).json({
      message: "Message sent successfully",
      item: sentMessage,
      targetUser: buildUserCard(targetUser),
      limit: limitCheck,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error sending message",
      error: error.message,
    });
  }
};

/* =====================================================
   12. GET MY CONNECTIONS / REQUESTS / ACTIONS
   GET /api/matrimony-actions/my?type=&status=&box=
===================================================== */

export const getMyActions = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    const {
      type = "",
      status = "",
      box = "all",
      limit = 20,
      page = 1,
    } = req.query;

    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const currentPage = Math.max(1, parseInt(page, 10));

    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    if (box === "sent") {
      query.from_user = viewerId;
    } else if (box === "received") {
      query.to_user = viewerId;
    } else {
      query.$or = [
        {
          from_user: viewerId,
        },
        {
          to_user: viewerId,
        },
      ];
    }

    const [items, total] = await Promise.all([
      MatrimonyAction.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("from_user", PUBLIC_USER_SELECT)
        .populate("to_user", PUBLIC_USER_SELECT)
        .lean({ virtuals: true }),
      MatrimonyAction.countDocuments(query),
    ]);

    res.status(200).json({
      count: items.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / perPage),
      items,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching actions",
      error: error.message,
    });
  }
};

/* =====================================================
   13. GET ACCESS STATUS FOR A PROFILE
   GET /api/matrimony-actions/access/:targetUserId
===================================================== */

export const getProfileAccessStatus = async (req, res) => {
  try {
    const viewerId = resolveUserId(req);
    const { targetUserId } = req.params;

    if (!viewerId || !isValidObjectId(viewerId)) {
      return buildError(res, 400, "Valid user id is required");
    }

    if (!isValidObjectId(targetUserId)) {
      return buildError(res, 400, "Valid target user id is required");
    }

    const viewer = await getUserWithMembership(viewerId);

    if (!viewer) {
      return buildError(res, 404, "User not found");
    }

    const membershipStatus = buildMembershipStatus(viewer);

    const [
      connected,
      photoAccess,
      guardianAccess,
      shortlisted,
      pendingConnection,
      pendingPhoto,
      pendingGuardian,
    ] = await Promise.all([
      hasAcceptedConnection(viewerId, targetUserId),
      hasAcceptedPhotoAccess(viewerId, targetUserId),
      hasAcceptedGuardianContact(viewerId, targetUserId),
      MatrimonyAction.findOne({
        type: "shortlist",
        from_user: viewerId,
        to_user: targetUserId,
        status: { $ne: "removed" },
      }).lean(),
      MatrimonyAction.findOne({
        type: "connection_request",
        from_user: viewerId,
        to_user: targetUserId,
        status: "pending",
      }).lean(),
      MatrimonyAction.findOne({
        type: "photo_access_request",
        from_user: viewerId,
        to_user: targetUserId,
        status: "pending",
      }).lean(),
      MatrimonyAction.findOne({
        type: "guardian_contact_request",
        from_user: viewerId,
        to_user: targetUserId,
        status: "pending",
      }).lean(),
    ]);

    res.status(200).json({
      membership: {
        active: membershipStatus.active,
        is_free: membershipStatus.is_free,
        is_paid: membershipStatus.is_paid,
        membership_name: membershipStatus.membership_name,
        features: membershipStatus.features,
      },
      access: {
        can_browse_profiles: hasFeature(viewer, "can_browse_profiles"),
        can_view_full_profiles: hasFeature(viewer, "can_view_full_profiles"),
        can_view_profile_photos:
          hasFeature(viewer, "can_view_profile_photos") || photoAccess,
        can_view_biodata: hasFeature(viewer, "can_view_biodata"),
        can_send_connection_request: hasFeature(
          viewer,
          "can_send_connection_request"
        ),
        can_accept_connection_request: hasFeature(
          viewer,
          "can_accept_connection_request"
        ),
        can_send_messages: hasFeature(viewer, "can_send_messages") && connected,
        can_request_photo_access: hasFeature(viewer, "can_request_photo_access"),
        can_request_guardian_contact:
          hasFeature(viewer, "can_request_guardian_contact") && connected,
        can_view_phone:
          hasFeature(viewer, "can_view_phone") || Boolean(guardianAccess),
        can_view_email:
          hasFeature(viewer, "can_view_email") || Boolean(guardianAccess),
        can_view_address:
          hasFeature(viewer, "can_view_address") || Boolean(guardianAccess),
        can_shortlist_profiles: hasFeature(viewer, "can_shortlist_profiles"),
      },
      relation: {
        connected: Boolean(connected),
        photo_access_approved: Boolean(photoAccess),
        guardian_contact_approved: Boolean(guardianAccess),
        shortlisted: Boolean(shortlisted),
        pending_connection_request: Boolean(pendingConnection),
        pending_photo_request: Boolean(pendingPhoto),
        pending_guardian_contact_request: Boolean(pendingGuardian),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching profile access status",
      error: error.message,
    });
  }
};