// routes/message.routes.js
import express from "express";
import {
  getConversation,
  getThreads,
  markSeen,
  sendMessageHttp,
} from "../controllers/chat.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authenticateUser);

router.get("/threads", getThreads);
router.get("/:withUserId", getConversation);
router.patch("/:messageId/seen", markSeen);
router.post("/", sendMessageHttp);

export default router;
