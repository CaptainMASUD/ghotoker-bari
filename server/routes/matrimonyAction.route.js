import express from "express";

import {
  viewProfileAction,
  sendConnectionRequest,
  respondConnectionRequest,
  cancelOrRemoveConnection,
  requestPhotoAccess,
  respondPhotoAccess,
  requestGuardianContact,
  respondGuardianContact,
  addToShortlist,
  removeFromShortlist,
  sendMessage,
  getMyActions,
  getProfileAccessStatus,
} from "../controllers/matrimonyAction.controller.js";

import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* =====================================================
   ALL ROUTES REQUIRE USER LOGIN
===================================================== */

router.use(authenticateUser);

/* =====================================================
   PROFILE ACCESS / TRACKING
===================================================== */

router.get("/access/:targetUserId", getProfileAccessStatus);
router.post("/profile-view/:targetUserId", viewProfileAction);

/* =====================================================
   CONNECTION REQUESTS
===================================================== */

router.post("/connections/:targetUserId", sendConnectionRequest);
router.patch("/connections/:requestId/respond", respondConnectionRequest);
router.patch("/connections/:requestId/cancel", cancelOrRemoveConnection);

/* =====================================================
   PHOTO ACCESS REQUESTS
===================================================== */

router.post("/photo-access/:targetUserId", requestPhotoAccess);
router.patch("/photo-access/:requestId/respond", respondPhotoAccess);

/* =====================================================
   GUARDIAN CONTACT REQUESTS
===================================================== */

router.post("/guardian-contact/:targetUserId", requestGuardianContact);
router.patch("/guardian-contact/:requestId/respond", respondGuardianContact);

/* =====================================================
   SHORTLIST
===================================================== */

router.post("/shortlist/:targetUserId", addToShortlist);
router.delete("/shortlist/:targetUserId", removeFromShortlist);

/* =====================================================
   MESSAGES
===================================================== */

router.post("/messages/:targetUserId", sendMessage);

/* =====================================================
   MY ACTIONS / REQUESTS
===================================================== */

router.get("/my", getMyActions);

export default router;