import mongoose from "mongoose";
import User from "../models/user.model.js";
import Membership from "../models/membership.model.js";
import PaymentMethod from "../models/paymentMethod.model.js";
import MembershipPayment from "../models/membershipPayment.model.js";

/* =====================================================
   CONSTANTS
===================================================== */

const ADMIN_ROLES = ["moderator", "superadmin"];
const MANAGE_MEMBERSHIPS_PERMISSION = "manage_memberships";

/* =====================================================
   BASIC HELPERS
===================================================== */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const resolveUserId = (req) => req.user?._id || req.user?.id;

const isSuperAdmin = (user) => user?.role === "superadmin";

const canManagePayments = (user) => {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;

  return (
    ADMIN_ROLES.includes(user.role) &&
    Array.isArray(user.permissions) &&
    user.permissions.includes(MANAGE_MEMBERSHIPS_PERMISSION)
  );
};

const buildError = (res, status, message) => {
  return res.status(status).json({ message });
};

const parseBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
};

const parseNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
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

const normalizeString = (value) => {
  if (value === undefined || value === null) return value;
  return String(value).trim();
};

const makeSlug = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const normalizeFieldName = (value) => {
  return makeSlug(value).replace(/-/g, "_");
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
        .mapproveMembershipPaymentRequest ((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const normalizePaymentFields = (fields = []) => {
  if (!Array.isArray(fields)) return [];

  return fields.map((field, index) => {
    const label = normalizeString(field.label);
    const name = normalizeFieldName(field.name || field.label || `field_${index + 1}`);

    return {
      label,
      name,
      type: field.type || "text",
      required: parseBoolean(field.required, false),
      placeholder: normalizeString(field.placeholder || ""),
      help_text: normalizeString(field.help_text || ""),
      options: normalizeArray(field.options),
      validation_regex: normalizeString(field.validation_regex || ""),
      sort_order: parseNumber(field.sort_order, index),
    };
  });
};

const cleanPaymentValuesByMethod = (paymentMethod, rawValues) => {
  const values = parseJsonObject(rawValues);
  const cleaned = {};
  const errors = [];

  const fields = Array.isArray(paymentMethod.fields) ? paymentMethod.fields : [];

  for (const field of fields) {
    const name = field.name;
    const value = values[name];

    if (
      field.required &&
      (value === undefined || value === null || String(value).trim() === "")
    ) {
      errors.push(`${field.label || name} is required`);
      continue;
    }

    if (value !== undefined && value !== null && String(value).trim() !== "") {
      if (field.type === "number") {
        const num = Number(value);

        if (!Number.isFinite(num)) {
          errors.push(`${field.label || name} must be a valid number`);
          continue;
        }

        cleaned[name] = num;
      } else {
        cleaned[name] = String(value).trim();
      }

      if (field.validation_regex) {
        try {
          const regex = new RegExp(field.validation_regex);

          if (!regex.test(String(cleaned[name]))) {
            errors.push(`${field.label || name} format is invalid`);
          }
        } catch {
          // Ignore invalid admin regex instead of crashing user purchase.
        }
      }

      if (
        field.type === "select" &&
        Array.isArray(field.options) &&
        field.options.length > 0 &&
        !field.options.includes(String(cleaned[name]))
      ) {
        errors.push(`${field.label || name} selected value is invalid`);
      }
    }
  }

  return { cleaned, errors };
};

const calculateMembershipExpiry = (membership) => {
  if (!membership || membership.is_free || membership.slug === "free") return null;

  const durationDays = membership.duration_days || 30;
  const now = new Date();

  return new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
};

const buildMembershipSnapshot = (membership) => {
  return {
    name: membership.name,
    slug: membership.slug,
    price: membership.price,
    currency: membership.currency,
    duration_days: membership.duration_days,
    features: membership.features,
  };
};

const buildPaymentMethodSnapshot = (method) => {
  return {
    name: method.name,
    slug: method.slug,
    provider_type: method.provider_type,
    account_name: method.account_name,
    account_number: method.account_number,
    fields: method.fields,
  };
};

/* =====================================================
   ADMIN: CREATE PAYMENT METHOD
   POST /api/membership-payments/admin/methods
===================================================== */

export const createPaymentMethod = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(res, 403, "You do not have permission to manage payment methods");
    }

    const {
      name,
      slug,
      provider_type = "manual",
      description = "",
      instructions = "",
      account_name = "",
      account_number = "",
      branch_name = "",
      routing_number = "",
      currency = "BDT",
      min_amount = 0,
      max_amount = null,
      fields = [],
      is_active = true,
      sort_order = 0,
    } = req.body;

    if (!name) {
      return buildError(res, 400, "Payment method name is required");
    }

    const finalSlug = makeSlug(slug || name);

    const exists = await PaymentMethod.findOne({ slug: finalSlug });

    if (exists) {
      return buildError(res, 409, "Payment method slug already exists");
    }

    const paymentMethod = await PaymentMethod.create({
      name,
      slug: finalSlug,
      provider_type,
      description,
      instructions,
      account_name,
      account_number,
      branch_name,
      routing_number,
      currency,
      min_amount: parseNumber(min_amount, 0),
      max_amount:
        max_amount === null || max_amount === undefined || max_amount === ""
          ? null
          : parseNumber(max_amount, null),
      fields: normalizePaymentFields(fields),
      is_active: parseBoolean(is_active, true),
      sort_order: parseNumber(sort_order, 0),
      created_by: resolveUserId(req) || null,
      updated_by: resolveUserId(req) || null,
    });

    res.status(201).json({
      message: "Payment method created successfully",
      paymentMethod,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating payment method",
      error: error.message,
    });
  }
};

/* =====================================================
   PUBLIC: GET ACTIVE PAYMENT METHODS
   GET /api/membership-payments/methods
===================================================== */

export const getPublicPaymentMethods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find({ is_active: true })
      .sort({ sort_order: 1, _id: -1 })
      .select("-created_by -updated_by")
      .lean();

    res.status(200).json({
      count: methods.length,
      items: methods,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment methods",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: GET PAYMENT METHODS
   GET /api/membership-payments/admin/methods
===================================================== */

export const getPaymentMethodsForAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(res, 403, "You do not have permission to view payment methods");
    }

    const { search = "", status = "", provider_type = "" } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { account_number: { $regex: search, $options: "i" } },
      ];
    }

    if (status === "active") query.is_active = true;
    if (status === "inactive") query.is_active = false;
    if (provider_type) query.provider_type = provider_type;

    const methods = await PaymentMethod.find(query)
      .sort({ sort_order: 1, _id: -1 })
      .lean();

    res.status(200).json({
      count: methods.length,
      items: methods,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment methods",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: UPDATE PAYMENT METHOD
   PATCH /api/membership-payments/admin/methods/:id
===================================================== */

export const updatePaymentMethod = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(res, 403, "You do not have permission to update payment methods");
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return buildError(res, 400, "Valid payment method id is required");
    }

    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod) {
      return buildError(res, 404, "Payment method not found");
    }

    const editableFields = [
      "name",
      "provider_type",
      "description",
      "instructions",
      "account_name",
      "account_number",
      "branch_name",
      "routing_number",
      "currency",
    ];

    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        paymentMethod[field] = req.body[field];
      }
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "min_amount")) {
      paymentMethod.min_amount = parseNumber(
        req.body.min_amount,
        paymentMethod.min_amount
      );
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "max_amount")) {
      paymentMethod.max_amount =
        req.body.max_amount === null ||
        req.body.max_amount === undefined ||
        req.body.max_amount === ""
          ? null
          : parseNumber(req.body.max_amount, paymentMethod.max_amount);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "is_active")) {
      paymentMethod.is_active = parseBoolean(
        req.body.is_active,
        paymentMethod.is_active
      );
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "sort_order")) {
      paymentMethod.sort_order = parseNumber(
        req.body.sort_order,
        paymentMethod.sort_order
      );
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "fields")) {
      paymentMethod.fields = normalizePaymentFields(req.body.fields);
    }

    paymentMethod.updated_by = resolveUserId(req) || null;

    await paymentMethod.save();

    res.status(200).json({
      message: "Payment method updated successfully",
      paymentMethod,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating payment method",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: TOGGLE PAYMENT METHOD STATUS
   PATCH /api/membership-payments/admin/methods/:id/status
===================================================== */

export const togglePaymentMethodStatus = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(res, 403, "You do not have permission to update payment methods");
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return buildError(res, 400, "Valid payment method id is required");
    }

    const paymentMethod = await PaymentMethod.findById(id);

    if (!paymentMethod) {
      return buildError(res, 404, "Payment method not found");
    }

    paymentMethod.is_active =
      req.body.is_active !== undefined
        ? parseBoolean(req.body.is_active, paymentMethod.is_active)
        : !paymentMethod.is_active;

    paymentMethod.updated_by = resolveUserId(req) || null;

    await paymentMethod.save();

    res.status(200).json({
      message: "Payment method status updated successfully",
      paymentMethod,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating payment method status",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: DELETE PAYMENT METHOD
   DELETE /api/membership-payments/admin/methods/:id
===================================================== */

export const deletePaymentMethod = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(res, 403, "You do not have permission to delete payment methods");
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return buildError(res, 400, "Valid payment method id is required");
    }

    const used = await MembershipPayment.exists({ payment_method: id });

    if (used) {
      return buildError(
        res,
        400,
        "This payment method has payment requests. Disable it instead of deleting."
      );
    }

    const deleted = await PaymentMethod.findByIdAndDelete(id);

    if (!deleted) {
      return buildError(res, 404, "Payment method not found");
    }

    res.status(200).json({
      message: "Payment method deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting payment method",
      error: error.message,
    });
  }
};

/* =====================================================
   USER: SUBMIT MEMBERSHIP PAYMENT REQUEST
   POST /api/membership-payments/purchase
===================================================== */

export const createMembershipPaymentRequest = async (req, res) => {
  try {
    const uid = resolveUserId(req);

    if (!uid || !isValidObjectId(uid)) {
      return buildError(res, 400, "Valid user id is required");
    }

    const {
      membershipId,
      paymentMethodId,
      payment_values = {},
      payment_note = "",
      transaction_id = "",
    } = req.body;

    if (!isValidObjectId(membershipId)) {
      return buildError(res, 400, "Valid membership id is required");
    }

    if (!isValidObjectId(paymentMethodId)) {
      return buildError(res, 400, "Valid payment method id is required");
    }

    const [user, membership, paymentMethod] = await Promise.all([
      User.findById(uid),
      Membership.findById(membershipId),
      PaymentMethod.findById(paymentMethodId),
    ]);

    if (!user) {
      return buildError(res, 404, "User not found");
    }

    if (!membership) {
      return buildError(res, 404, "Membership plan not found");
    }

    if (!membership.is_active) {
      return buildError(res, 400, "This membership plan is not active");
    }

    if (membership.is_free || membership.slug === "free") {
      return buildError(res, 400, "Free Plan is automatically assigned. No payment needed.");
    }

    if (!paymentMethod) {
      return buildError(res, 404, "Payment method not found");
    }

    if (!paymentMethod.is_active) {
      return buildError(res, 400, "This payment method is not active");
    }

    const amount = Number(membership.price || 0);

    if (amount <= 0) {
      return buildError(res, 400, "This membership does not require payment");
    }

    if (paymentMethod.min_amount && amount < paymentMethod.min_amount) {
      return buildError(res, 400, "Amount is lower than payment method minimum amount");
    }

    if (paymentMethod.max_amount && amount > paymentMethod.max_amount) {
      return buildError(res, 400, "Amount is higher than payment method maximum amount");
    }

    const { cleaned, errors } = cleanPaymentValuesByMethod(
      paymentMethod,
      payment_values
    );

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Payment information is invalid",
        errors,
      });
    }

    const alreadyPending = await MembershipPayment.findOne({
      user: uid,
      membership: membership._id,
      status: "pending",
    });

    if (alreadyPending) {
      return buildError(
        res,
        409,
        "You already have a pending payment request for this membership"
      );
    }

    const payment = await MembershipPayment.create({
      user: uid,
      membership: membership._id,
      payment_method: paymentMethod._id,
      amount,
      currency: membership.currency || paymentMethod.currency || "BDT",
      transaction_id: normalizeString(transaction_id || cleaned.transaction_id || ""),
      payment_values: cleaned,
      payment_note,
      status: "pending",
      plan_snapshot: buildMembershipSnapshot(membership),
      payment_method_snapshot: buildPaymentMethodSnapshot(paymentMethod),
      submitted_at: new Date(),
    });

    const populatedPayment = await MembershipPayment.findById(payment._id)
      .populate("membership", "name slug price currency duration_days")
      .populate("payment_method", "name slug provider_type")
      .lean();

    res.status(201).json({
      message: "Payment request submitted successfully. Please wait for admin approval.",
      payment: populatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error submitting payment request",
      error: error.message,
    });
  }
};

/* =====================================================
   USER: GET MY PAYMENT REQUESTS
   GET /api/membership-payments/my
===================================================== */

export const getMyMembershipPayments = async (req, res) => {
  try {
    const uid = resolveUserId(req);

    if (!uid || !isValidObjectId(uid)) {
      return buildError(res, 400, "Valid user id is required");
    }

    const { status = "", limit = 20, page = 1 } = req.query;

    const perPage = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const currentPage = Math.max(1, parseInt(page, 10));

    const query = {
      user: uid,
    };

    if (status) query.status = status;

    const [items, total] = await Promise.all([
      MembershipPayment.find(query)
        .sort({ _id: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("membership", "name slug price currency duration_days")
        .populate("payment_method", "name slug provider_type")
        .lean(),
      MembershipPayment.countDocuments(query),
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
      message: "Error fetching my payment requests",
      error: error.message,
    });
  }
};

/* =====================================================
   USER: CANCEL OWN PENDING PAYMENT
   PATCH /api/membership-payments/my/:id/cancel
===================================================== */

export const cancelMyMembershipPayment = async (req, res) => {
  try {
    const uid = resolveUserId(req);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return buildError(res, 400, "Valid payment id is required");
    }

    const payment = await MembershipPayment.findOne({
      _id: id,
      user: uid,
    });

    if (!payment) {
      return buildError(res, 404, "Payment request not found");
    }

    if (payment.status !== "pending") {
      return buildError(res, 400, "Only pending payment request can be cancelled");
    }

    payment.status = "cancelled";
    payment.review_note = "Cancelled by user";
    payment.reviewed_at = new Date();

    await payment.save();

    res.status(200).json({
      message: "Payment request cancelled successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error cancelling payment request",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: GET MEMBERSHIP PAYMENT REQUESTS
   GET /api/membership-payments/admin/requests
===================================================== */

export const getMembershipPaymentRequestsForAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(res, 403, "You do not have permission to view payment requests");
    }

    const {
      status = "",
      membershipId = "",
      paymentMethodId = "",
      search = "",
      limit = 20,
      page = 1,
    } = req.query;

    const perPage = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const currentPage = Math.max(1, parseInt(page, 10));

    const query = {};

    if (status) query.status = status;
    if (isValidObjectId(membershipId)) query.membership = membershipId;
    if (isValidObjectId(paymentMethodId)) query.payment_method = paymentMethodId;

    if (search) {
      query.$or = [
        { transaction_id: { $regex: search, $options: "i" } },
        { payment_note: { $regex: search, $options: "i" } },
        { review_note: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      MembershipPayment.find(query)
        .sort({ submitted_at: -1, _id: -1 })
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("user", "first_name last_name email_address phone_number")
        .populate("membership", "name slug price currency duration_days")
        .populate("payment_method", "name slug provider_type")
        .populate("reviewed_by", "first_name last_name email_address role")
        .lean(),
      MembershipPayment.countDocuments(query),
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
      message: "Error fetching membership payment requests",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: GET SINGLE PAYMENT REQUEST
   GET /api/membership-payments/admin/requests/:id
===================================================== */

export const getMembershipPaymentRequestByIdForAdmin = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(res, 403, "You do not have permission to view payment request");
    }

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return buildError(res, 400, "Valid payment id is required");
    }

    const payment = await MembershipPayment.findById(id)
      .populate("user", "first_name last_name email_address phone_number membership membership_expiry membership_status")
      .populate("membership")
      .populate("payment_method")
      .populate("reviewed_by", "first_name last_name email_address role")
      .lean();

    if (!payment) {
      return buildError(res, 404, "Payment request not found");
    }

    res.status(200).json({
      payment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching payment request",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: APPROVE PAYMENT REQUEST
   PATCH /api/membership-payments/admin/requests/:id/approve
===================================================== */

export const approveMembershipPaymentRequest = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(
        res,
        403,
        "You do not have permission to approve payment requests"
      );
    }

    const { id } = req.params;
    const { review_note = "" } = req.body;

    if (!isValidObjectId(id)) {
      return buildError(res, 400, "Valid payment id is required");
    }

    const payment = await MembershipPayment.findOne({
      _id: id,
      status: "pending",
    }).populate("membership");

    if (!payment) {
      return buildError(
        res,
        404,
        "Payment request not found or already reviewed"
      );
    }

    const membership = payment.membership;

    if (!membership || !membership.is_active) {
      return buildError(res, 400, "Membership plan is not active");
    }

    const user = await User.findById(payment.user);

    if (!user) {
      return buildError(res, 404, "User not found");
    }

    const now = new Date();

    user.membership = membership._id;
    user.membership_started_at = now;
    user.membership_expiry = calculateMembershipExpiry(membership);
    user.membership_status =
      membership.is_free || membership.slug === "free" ? "free" : "active";

    await user.save();

    payment.status = "approved";
    payment.reviewed_by = resolveUserId(req) || null;
    payment.reviewed_at = now;
    payment.approved_at = now;
    payment.review_note =
      review_note || "Payment verified by admin. Membership activated.";

    await payment.save();

    const populatedPayment = await MembershipPayment.findById(payment._id)
      .populate(
        "user",
        "first_name last_name email_address phone_number membership membership_expiry membership_status"
      )
      .populate("membership", "name slug price currency duration_days")
      .populate("payment_method", "name slug provider_type")
      .populate("reviewed_by", "first_name last_name email_address role")
      .lean();

    const savedUser = await User.findById(user._id)
      .select(
        "_id first_name last_name email_address phone_number membership membership_started_at membership_expiry membership_status"
      )
      .populate("membership", "name slug price currency duration_days")
      .lean();

    res.status(200).json({
      message: "Payment approved and membership activated successfully",
      payment: populatedPayment,
      user: savedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error approving payment request",
      error: error.message,
    });
  }
};

/* =====================================================
   ADMIN: REJECT PAYMENT REQUEST
   PATCH /api/membership-payments/admin/requests/:id/reject
===================================================== */

export const rejectMembershipPaymentRequest = async (req, res) => {
  try {
    const admin = req.admin || req.user;

    if (!canManagePayments(admin)) {
      return buildError(res, 403, "You do not have permission to reject payment requests");
    }

    const { id } = req.params;
    const { review_note = "" } = req.body;

    if (!isValidObjectId(id)) {
      return buildError(res, 400, "Valid payment id is required");
    }

    const payment = await MembershipPayment.findById(id);

    if (!payment) {
      return buildError(res, 404, "Payment request not found");
    }

    if (payment.status !== "pending") {
      return buildError(res, 400, "Only pending payment request can be rejected");
    }

    payment.status = "rejected";
    payment.reviewed_by = resolveUserId(req) || null;
    payment.reviewed_at = new Date();
    payment.rejected_at = new Date();
    payment.review_note = review_note || "Payment rejected by admin";

    await payment.save();

    const populatedPayment = await MembershipPayment.findById(payment._id)
      .populate("user", "first_name last_name email_address phone_number")
      .populate("membership", "name slug price currency duration_days")
      .populate("payment_method", "name slug provider_type")
      .populate("reviewed_by", "first_name last_name email_address role")
      .lean();

    res.status(200).json({
      message: "Payment request rejected successfully",
      payment: populatedPayment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error rejecting payment request",
      error: error.message,
    });
  }
};