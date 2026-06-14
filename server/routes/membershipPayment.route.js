import express from "express";

import {
  createPaymentMethod,
  getPublicPaymentMethods,
  getPaymentMethodsForAdmin,
  updatePaymentMethod,
  togglePaymentMethodStatus,
  deletePaymentMethod,
  createMembershipPaymentRequest,
  getMyMembershipPayments,
  cancelMyMembershipPayment,
  getMembershipPaymentRequestsForAdmin,
  getMembershipPaymentRequestByIdForAdmin,
  approveMembershipPaymentRequest,
  rejectMembershipPaymentRequest,
} from "../controllers/membershipPayment.controller.js";

import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   PUBLIC PAYMENT METHODS
===================================================== */

router.get("/methods", getPublicPaymentMethods);

/* =====================================================
   USER PAYMENT REQUESTS
===================================================== */

router.post("/purchase", authenticateUser, createMembershipPaymentRequest);
router.get("/my", authenticateUser, getMyMembershipPayments);
router.patch("/my/:id/cancel", authenticateUser, cancelMyMembershipPayment);

/* =====================================================
   ADMIN PAYMENT METHOD MANAGEMENT
   Keep fixed admin routes before dynamic routes.
===================================================== */

router.post("/admin/methods", authenticateUser, createPaymentMethod);
router.get("/admin/methods", authenticateUser, getPaymentMethodsForAdmin);
router.patch(
  "/admin/methods/:id/status",
  authenticateUser,
  togglePaymentMethodStatus
);
router.patch("/admin/methods/:id", authenticateUser, updatePaymentMethod);
router.delete("/admin/methods/:id", authenticateUser, deletePaymentMethod);

/* =====================================================
   ADMIN PAYMENT REQUEST MANAGEMENT
===================================================== */

router.get(
  "/admin/requests",
  authenticateUser,
  getMembershipPaymentRequestsForAdmin
);

router.get(
  "/admin/requests/:id",
  authenticateUser,
  getMembershipPaymentRequestByIdForAdmin
);

router.patch(
  "/admin/requests/:id/approve",
  authenticateUser,
  approveMembershipPaymentRequest
);

router.patch(
  "/admin/requests/:id/reject",
  authenticateUser,
  rejectMembershipPaymentRequest
);

export default router;