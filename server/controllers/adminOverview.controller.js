import mongoose from "mongoose";

import User from "../models/user.model.js";
import Contact from "../models/contact.model.js";
import MatrimonyAction from "../models/matrimonyAction.model.js";
import Membership from "../models/membership.model.js";
import MembershipPayment from "../models/membershipPayment.model.js";
import PaymentMethod from "../models/paymentMethod.model.js";

/* =====================================================
   ADMIN OVERVIEW CONTROLLER
   Optimized dashboard data for admin panel
===================================================== */

const ADMIN_ROLES = ["moderator", "superadmin"];

const MONEY_CURRENCY = "BDT";

const USER_SAFE_SELECT =
  "_id first_name last_name full_name_normalized email_address phone_number role gender religion current_division current_district current_city profile_photos isVerified profile_status account_status membership membership_status membership_expiry createdAt last_active_at";

const ADMIN_SAFE_SELECT =
  "_id first_name last_name username email_address phone_number role isVerified admin_status account_status permissions createdAt last_login";

const PAYMENT_POPULATE_USER_SELECT =
  "_id first_name last_name email_address phone_number profile_photos role";

const BASIC_USER_POPULATE_SELECT =
  "_id first_name last_name email_address phone_number profile_photos role isVerified profile_status account_status";

const sendSuccess = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data,
  });
};

const sendError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
  });
};

const isAdminUser = (user) => {
  return ADMIN_ROLES.includes(String(user?.role || "").toLowerCase());
};

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const clampLimit = (value, fallback = 10, max = 50) => {
  return Math.min(Math.max(toNumber(value, fallback), 1), max);
};

const normalizeDays = (value) => {
  const days = toNumber(value, 30);

  if ([7, 14, 30, 60, 90, 180, 365].includes(days)) return days;

  return 30;
};

const startOfDay = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const endOfDay = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999
  );
};

const getDateRange = (days = 30) => {
  const now = new Date();
  const to = endOfDay(now);
  const from = startOfDay(new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000));

  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = startOfDay(
    new Date(previousTo.getTime() - (days - 1) * 24 * 60 * 60 * 1000)
  );

  return {
    from,
    to,
    previousFrom,
    previousTo,
  };
};

const getGrowth = (current = 0, previous = 0) => {
  const now = toNumber(current);
  const before = toNumber(previous);

  if (before === 0 && now === 0) return 0;
  if (before === 0) return 100;

  return Number((((now - before) / before) * 100).toFixed(2));
};

const safeAmount = (value) => {
  const num = Number(value || 0);
  return Number.isFinite(num) ? num : 0;
};

const compactUser = (user) => {
  if (!user) return null;

  const plain = user?.toObject ? user.toObject({ virtuals: true }) : user;

  return {
    _id: plain._id,
    first_name: plain.first_name,
    last_name: plain.last_name,
    full_name:
      plain.full_name ||
      `${plain.first_name || ""} ${plain.last_name || ""}`.trim(),
    email_address: plain.email_address,
    phone_number: plain.phone_number,
    role: plain.role,
    gender: plain.gender,
    religion: plain.religion,
    current_division: plain.current_division,
    current_district: plain.current_district,
    current_city: plain.current_city,
    profile_photos: plain.profile_photos || [],
    isVerified: Boolean(plain.isVerified),
    profile_status: plain.profile_status,
    account_status: plain.account_status,
    membership: plain.membership || null,
    membership_status: plain.membership_status,
    membership_expiry: plain.membership_expiry,
    createdAt: plain.createdAt,
    last_active_at: plain.last_active_at,
  };
};

const compactAdmin = (admin) => {
  if (!admin) return null;

  const plain = admin?.toObject ? admin.toObject({ virtuals: true }) : admin;

  return {
    _id: plain._id,
    username: plain.username,
    first_name: plain.first_name,
    last_name: plain.last_name,
    full_name:
      plain.full_name ||
      `${plain.first_name || ""} ${plain.last_name || ""}`.trim(),
    email_address: plain.email_address,
    phone_number: plain.phone_number,
    role: plain.role,
    isVerified: Boolean(plain.isVerified),
    admin_status: plain.admin_status,
    account_status: plain.account_status,
    permissions: plain.permissions || [],
    createdAt: plain.createdAt,
    last_login: plain.last_login,
  };
};

const compactPayment = (payment) => {
  if (!payment) return null;

  return {
    _id: payment._id,
    user: compactUser(payment.user),
    membership: payment.membership,
    payment_method: payment.payment_method,
    amount: payment.amount,
    currency: payment.currency,
    transaction_id: payment.transaction_id,
    status: payment.status,
    plan_snapshot: payment.plan_snapshot,
    payment_method_snapshot: payment.payment_method_snapshot,
    submitted_at: payment.submitted_at,
    reviewed_by: compactAdmin(payment.reviewed_by),
    reviewed_at: payment.reviewed_at,
    review_note: payment.review_note,
    approved_at: payment.approved_at,
    rejected_at: payment.rejected_at,
    createdAt: payment.createdAt,
  };
};

const compactAction = (action) => {
  if (!action) return null;

  return {
    _id: action._id,
    type: action.type,
    status: action.status,
    from_user: compactUser(action.from_user),
    to_user: compactUser(action.to_user),
    message: action.message,
    note: action.note,
    metadata: action.metadata || {},
    responded_at: action.responded_at,
    seen_at: action.seen_at,
    createdAt: action.createdAt,
    updatedAt: action.updatedAt,
  };
};

const groupCountByField = async (Model, match, field) => {
  return Model.aggregate([
    { $match: match },
    {
      $group: {
        _id: `$${field}`,
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

const groupPaymentAmountByStatus = async (match = {}) => {
  return MembershipPayment.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

const buildDateSeries = async ({
  Model,
  match = {},
  dateField = "createdAt",
  amountField = null,
  from,
  to,
}) => {
  const finalMatch = {
    ...match,
    [dateField]: {
      $gte: from,
      $lte: to,
    },
  };

  const groupPayload = {
    _id: {
      $dateToString: {
        format: "%Y-%m-%d",
        date: `$${dateField}`,
      },
    },
    count: { $sum: 1 },
  };

  if (amountField) {
    groupPayload.amount = { $sum: `$${amountField}` };
  }

  return Model.aggregate([
    { $match: finalMatch },
    { $group: groupPayload },
    { $sort: { _id: 1 } },
  ]);
};

const fillDateSeries = ({ from, to, rows = [], includeAmount = false }) => {
  const map = new Map(rows.map((row) => [String(row._id), row]));
  const result = [];

  const cursor = new Date(from);

  while (cursor <= to) {
    const key = cursor.toISOString().slice(0, 10);
    const found = map.get(key);

    result.push({
      date: key,
      count: found?.count || 0,
      ...(includeAmount ? { amount: safeAmount(found?.amount) } : {}),
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

const normalizeBreakdown = (rows = [], fallbackLabel = "Unknown") => {
  return rows.map((item) => ({
    key: item._id || fallbackLabel,
    label: String(item._id || fallbackLabel).replaceAll("_", " "),
    count: item.count || 0,
    amount: item.amount !== undefined ? safeAmount(item.amount) : undefined,
  }));
};

const getTopLocations = async () => {
  return User.aggregate([
    {
      $match: {
        role: "user",
        account_status: { $ne: "deleted" },
      },
    },
    {
      $group: {
        _id: {
          division: "$current_division",
          district: "$current_district",
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        division: "$_id.division",
        district: "$_id.district",
        count: 1,
      },
    },
  ]);
};

const getTopMembershipPlansByPayment = async ({ from, to }) => {
  return MembershipPayment.aggregate([
    {
      $match: {
        status: "approved",
        approved_at: {
          $gte: from,
          $lte: to,
        },
      },
    },
    {
      $group: {
        _id: "$membership",
        plan_name: { $first: "$plan_snapshot.name" },
        plan_slug: { $first: "$plan_snapshot.slug" },
        count: { $sum: 1 },
        revenue: { $sum: "$amount" },
      },
    },
    { $sort: { revenue: -1, count: -1 } },
    { $limit: 10 },
  ]);
};

/* =====================================================
   GET ADMIN OVERVIEW
   GET /api/admin/overview?days=30
===================================================== */

export const getAdminOverview = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!isAdminUser(admin)) {
      return sendError(res, 403, "Admin access required.");
    }

    const days = normalizeDays(req.query.days);
    const { from, to, previousFrom, previousTo } = getDateRange(days);

    const userBaseMatch = {
      role: "user",
      account_status: { $ne: "deleted" },
    };

    const staffBaseMatch = {
      role: { $in: ADMIN_ROLES },
    };

    const contactBaseMatch = {
      is_deleted: false,
    };

    const [
      totalUsers,
      currentUsers,
      previousUsers,
      activeUsers,
      verifiedUsers,
      unverifiedUsers,
      pendingProfiles,
      approvedProfiles,
      rejectedProfiles,
      hiddenProfiles,
      deletedUsers,
      totalStaff,
      activeStaff,
      totalMembershipPlans,
      activeMembershipPlans,
      freePlans,
      paidPlans,
      totalPaymentMethods,
      activePaymentMethods,
      totalContacts,
      currentContacts,
      previousContacts,
      totalActions,
      currentActions,
      previousActions,
      totalPayments,
      currentApprovedPayments,
      previousApprovedPayments,
      approvedRevenueAgg,
      currentRevenueAgg,
      previousRevenueAgg,
      pendingRevenueAgg,
      userProfileStatusBreakdown,
      userAccountStatusBreakdown,
      userGenderBreakdown,
      userReligionBreakdown,
      userDivisionBreakdown,
      membershipStatusBreakdown,
      paymentStatusBreakdown,
      paymentMethodBreakdown,
      contactTopicBreakdown,
      contactChannelBreakdown,
      actionTypeBreakdown,
      actionStatusBreakdown,
      userSeriesRaw,
      paymentRevenueSeriesRaw,
      contactSeriesRaw,
      actionSeriesRaw,
      topLocations,
      topMembershipPlans,
      latestUsers,
      latestStaff,
      latestContacts,
      latestPayments,
      latestActions,
    ] = await Promise.all([
      User.countDocuments(userBaseMatch),

      User.countDocuments({
        ...userBaseMatch,
        createdAt: { $gte: from, $lte: to },
      }),

      User.countDocuments({
        ...userBaseMatch,
        createdAt: { $gte: previousFrom, $lte: previousTo },
      }),

      User.countDocuments({
        ...userBaseMatch,
        account_status: "active",
      }),

      User.countDocuments({
        ...userBaseMatch,
        isVerified: true,
      }),

      User.countDocuments({
        ...userBaseMatch,
        isVerified: false,
      }),

      User.countDocuments({
        role: "user",
        profile_status: { $in: ["incomplete", "pending_review"] },
        account_status: { $ne: "deleted" },
      }),

      User.countDocuments({
        ...userBaseMatch,
        profile_status: "approved",
      }),

      User.countDocuments({
        ...userBaseMatch,
        profile_status: "rejected",
      }),

      User.countDocuments({
        role: "user",
        profile_status: "hidden",
        account_status: { $ne: "deleted" },
      }),

      User.countDocuments({
        role: "user",
        account_status: "deleted",
      }),

      User.countDocuments(staffBaseMatch),

      User.countDocuments({
        ...staffBaseMatch,
        admin_status: "active",
      }),

      Membership.countDocuments({}),

      Membership.countDocuments({ is_active: true }),

      Membership.countDocuments({ is_free: true }),

      Membership.countDocuments({ is_free: false }),

      PaymentMethod.countDocuments({}),

      PaymentMethod.countDocuments({ is_active: true }),

      Contact.countDocuments(contactBaseMatch),

      Contact.countDocuments({
        ...contactBaseMatch,
        createdAt: { $gte: from, $lte: to },
      }),

      Contact.countDocuments({
        ...contactBaseMatch,
        createdAt: { $gte: previousFrom, $lte: previousTo },
      }),

      MatrimonyAction.countDocuments({}),

      MatrimonyAction.countDocuments({
        createdAt: { $gte: from, $lte: to },
      }),

      MatrimonyAction.countDocuments({
        createdAt: { $gte: previousFrom, $lte: previousTo },
      }),

      MembershipPayment.countDocuments({}),

      MembershipPayment.countDocuments({
        status: "approved",
        approved_at: { $gte: from, $lte: to },
      }),

      MembershipPayment.countDocuments({
        status: "approved",
        approved_at: { $gte: previousFrom, $lte: previousTo },
      }),

      MembershipPayment.aggregate([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      MembershipPayment.aggregate([
        {
          $match: {
            status: "approved",
            approved_at: { $gte: from, $lte: to },
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      MembershipPayment.aggregate([
        {
          $match: {
            status: "approved",
            approved_at: { $gte: previousFrom, $lte: previousTo },
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      MembershipPayment.aggregate([
        {
          $match: {
            status: "pending",
          },
        },
        {
          $group: {
            _id: null,
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),

      groupCountByField(User, { role: "user" }, "profile_status"),

      groupCountByField(User, { role: "user" }, "account_status"),

      groupCountByField(User, userBaseMatch, "gender"),

      groupCountByField(User, userBaseMatch, "religion"),

      groupCountByField(User, userBaseMatch, "current_division"),

      groupCountByField(User, { role: "user" }, "membership_status"),

      groupPaymentAmountByStatus({}),

      MembershipPayment.aggregate([
        {
          $group: {
            _id: "$payment_method_snapshot.provider_type",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
        { $sort: { count: -1 } },
      ]),

      groupCountByField(Contact, contactBaseMatch, "topic"),

      groupCountByField(Contact, contactBaseMatch, "channel"),

      groupCountByField(MatrimonyAction, {}, "type"),

      groupCountByField(MatrimonyAction, {}, "status"),

      buildDateSeries({
        Model: User,
        match: userBaseMatch,
        dateField: "createdAt",
        from,
        to,
      }),

      buildDateSeries({
        Model: MembershipPayment,
        match: { status: "approved" },
        dateField: "approved_at",
        amountField: "amount",
        from,
        to,
      }),

      buildDateSeries({
        Model: Contact,
        match: contactBaseMatch,
        dateField: "createdAt",
        from,
        to,
      }),

      buildDateSeries({
        Model: MatrimonyAction,
        match: {},
        dateField: "createdAt",
        from,
        to,
      }),

      getTopLocations(),

      getTopMembershipPlansByPayment({ from, to }),

      User.find(userBaseMatch)
        .select(USER_SAFE_SELECT)
        .populate("membership", "name slug price currency duration_days is_free is_active")
        .sort({ _id: -1 })
        .limit(8)
        .lean({ virtuals: true }),

      User.find(staffBaseMatch)
        .select(ADMIN_SAFE_SELECT)
        .sort({ _id: -1 })
        .limit(6)
        .lean({ virtuals: true }),

      Contact.find(contactBaseMatch)
        .sort({ _id: -1 })
        .limit(8)
        .lean(),

      MembershipPayment.find({})
        .populate("user", PAYMENT_POPULATE_USER_SELECT)
        .populate("membership", "name slug price currency duration_days")
        .populate("payment_method", "name slug provider_type account_name account_number")
        .populate("reviewed_by", ADMIN_SAFE_SELECT)
        .sort({ submitted_at: -1, _id: -1 })
        .limit(8)
        .lean({ virtuals: true }),

      MatrimonyAction.find({})
        .populate("from_user", BASIC_USER_POPULATE_SELECT)
        .populate("to_user", BASIC_USER_POPULATE_SELECT)
        .sort({ _id: -1 })
        .limit(8)
        .lean({ virtuals: true }),
    ]);

    const approvedRevenue = safeAmount(approvedRevenueAgg?.[0]?.amount);
    const currentRevenue = safeAmount(currentRevenueAgg?.[0]?.amount);
    const previousRevenue = safeAmount(previousRevenueAgg?.[0]?.amount);
    const pendingRevenue = safeAmount(pendingRevenueAgg?.[0]?.amount);

    const overview = {
      range: {
        days,
        from,
        to,
        previousFrom,
        previousTo,
      },

      cards: {
        users: {
          total: totalUsers,
          current_period: currentUsers,
          previous_period: previousUsers,
          growth_percent: getGrowth(currentUsers, previousUsers),
          active: activeUsers,
          verified: verifiedUsers,
          unverified: unverifiedUsers,
          pending_profiles: pendingProfiles,
          approved_profiles: approvedProfiles,
          rejected_profiles: rejectedProfiles,
          hidden_profiles: hiddenProfiles,
          deleted: deletedUsers,
        },

        staff: {
          total: totalStaff,
          active: activeStaff,
        },

        memberships: {
          total_plans: totalMembershipPlans,
          active_plans: activeMembershipPlans,
          free_plans: freePlans,
          paid_plans: paidPlans,
        },

        payment_methods: {
          total: totalPaymentMethods,
          active: activePaymentMethods,
        },

        payments: {
          total_requests: totalPayments,
          approved_current_period: currentApprovedPayments,
          approved_previous_period: previousApprovedPayments,
          approved_growth_percent: getGrowth(
            currentApprovedPayments,
            previousApprovedPayments
          ),
          total_approved_revenue: approvedRevenue,
          current_period_revenue: currentRevenue,
          previous_period_revenue: previousRevenue,
          revenue_growth_percent: getGrowth(currentRevenue, previousRevenue),
          pending_amount: pendingRevenue,
          currency: MONEY_CURRENCY,
        },

        contacts: {
          total: totalContacts,
          current_period: currentContacts,
          previous_period: previousContacts,
          growth_percent: getGrowth(currentContacts, previousContacts),
        },

        matrimony_actions: {
          total: totalActions,
          current_period: currentActions,
          previous_period: previousActions,
          growth_percent: getGrowth(currentActions, previousActions),
        },
      },

      breakdowns: {
        users_by_profile_status: normalizeBreakdown(userProfileStatusBreakdown),
        users_by_account_status: normalizeBreakdown(userAccountStatusBreakdown),
        users_by_gender: normalizeBreakdown(userGenderBreakdown),
        users_by_religion: normalizeBreakdown(userReligionBreakdown),
        users_by_division: normalizeBreakdown(userDivisionBreakdown),
        users_by_membership_status: normalizeBreakdown(membershipStatusBreakdown),

        payments_by_status: normalizeBreakdown(paymentStatusBreakdown),
        payments_by_method_type: normalizeBreakdown(paymentMethodBreakdown),

        contacts_by_topic: normalizeBreakdown(contactTopicBreakdown),
        contacts_by_channel: normalizeBreakdown(contactChannelBreakdown),

        actions_by_type: normalizeBreakdown(actionTypeBreakdown),
        actions_by_status: normalizeBreakdown(actionStatusBreakdown),

        top_locations: topLocations,
        top_membership_plans: topMembershipPlans.map((item) => ({
          membership: item._id,
          plan_name: item.plan_name || "Unknown Plan",
          plan_slug: item.plan_slug || "",
          count: item.count || 0,
          revenue: safeAmount(item.revenue),
        })),
      },

      charts: {
        users: fillDateSeries({
          from,
          to,
          rows: userSeriesRaw,
        }),

        revenue: fillDateSeries({
          from,
          to,
          rows: paymentRevenueSeriesRaw,
          includeAmount: true,
        }),

        contacts: fillDateSeries({
          from,
          to,
          rows: contactSeriesRaw,
        }),

        actions: fillDateSeries({
          from,
          to,
          rows: actionSeriesRaw,
        }),
      },

      recent: {
        users: latestUsers.map(compactUser),
        staff: latestStaff.map(compactAdmin),
        contacts: latestContacts,
        payments: latestPayments.map(compactPayment),
        actions: latestActions.map(compactAction),
      },
    };

    return sendSuccess(res, 200, "Admin overview fetched successfully.", {
      overview,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return sendError(res, 500, "Failed to fetch admin overview.");
  }
};

/* =====================================================
   GET OVERVIEW MINI STATS
   GET /api/admin/overview/stats
===================================================== */

export const getAdminOverviewStats = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!isAdminUser(admin)) {
      return sendError(res, 403, "Admin access required.");
    }

    const todayStart = startOfDay(new Date());

    const [
      users,
      pendingProfiles,
      pendingPayments,
      todayContacts,
      activeMembershipPlans,
      activePaymentMethods,
    ] = await Promise.all([
      User.countDocuments({
        role: "user",
        account_status: { $ne: "deleted" },
      }),

      User.countDocuments({
        role: "user",
        account_status: { $ne: "deleted" },
        profile_status: { $in: ["incomplete", "pending_review"] },
      }),

      MembershipPayment.countDocuments({
        status: "pending",
      }),

      Contact.countDocuments({
        is_deleted: false,
        createdAt: { $gte: todayStart },
      }),

      Membership.countDocuments({
        is_active: true,
      }),

      PaymentMethod.countDocuments({
        is_active: true,
      }),
    ]);

    return sendSuccess(res, 200, "Admin overview stats fetched successfully.", {
      stats: {
        users,
        pendingProfiles,
        pendingPayments,
        todayContacts,
        activeMembershipPlans,
        activePaymentMethods,
      },
    });
  } catch (error) {
    console.error("Admin overview stats error:", error);
    return sendError(res, 500, "Failed to fetch admin overview stats.");
  }
};

/* =====================================================
   GET RECENT ACTIVITY ONLY
   GET /api/admin/overview/recent?limit=10
===================================================== */

export const getAdminRecentActivity = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!isAdminUser(admin)) {
      return sendError(res, 403, "Admin access required.");
    }

    const limit = clampLimit(req.query.limit, 10, 30);

    const [latestUsers, latestContacts, latestPayments, latestActions] =
      await Promise.all([
        User.find({
          role: "user",
          account_status: { $ne: "deleted" },
        })
          .select(USER_SAFE_SELECT)
          .populate("membership", "name slug price currency duration_days is_free is_active")
          .sort({ _id: -1 })
          .limit(limit)
          .lean({ virtuals: true }),

        Contact.find({
          is_deleted: false,
        })
          .sort({ _id: -1 })
          .limit(limit)
          .lean(),

        MembershipPayment.find({})
          .populate("user", PAYMENT_POPULATE_USER_SELECT)
          .populate("membership", "name slug price currency duration_days")
          .populate("payment_method", "name slug provider_type")
          .populate("reviewed_by", ADMIN_SAFE_SELECT)
          .sort({ submitted_at: -1, _id: -1 })
          .limit(limit)
          .lean({ virtuals: true }),

        MatrimonyAction.find({})
          .populate("from_user", BASIC_USER_POPULATE_SELECT)
          .populate("to_user", BASIC_USER_POPULATE_SELECT)
          .sort({ _id: -1 })
          .limit(limit)
          .lean({ virtuals: true }),
      ]);

    return sendSuccess(res, 200, "Recent activity fetched successfully.", {
      recent: {
        users: latestUsers.map(compactUser),
        contacts: latestContacts,
        payments: latestPayments.map(compactPayment),
        actions: latestActions.map(compactAction),
      },
    });
  } catch (error) {
    console.error("Recent activity error:", error);
    return sendError(res, 500, "Failed to fetch recent activity.");
  }
};