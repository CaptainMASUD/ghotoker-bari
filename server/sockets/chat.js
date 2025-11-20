import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { canChatAndWithinLimit } from "../middlewares/capabilities.js";

/**
 * Socket middleware to auth users by Bearer token in query: ?token=...
 */
const authSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).populate("membership");
    if (!user) return next(new Error("User not found"));

    // reset counter if day changed
    user.resetDailyCounterIfNeeded();
    await user.save();

    socket.user = user;
    next();
  } catch (e) {
    next(new Error("Unauthorized"));
  }
};

export default function chatSocket(io) {
  const nsp = io.of("/chat");
  nsp.use(authSocket);

  nsp.on("connection", (socket) => {
    const me = socket.user;

    // Join a personal room for direct delivery
    socket.join(me._id.toString());

    // Send message {to, content}
    socket.on("send_message", async ({ to, content }, cb) => {
      try {
        if (!to || !content?.trim()) {
          return cb?.({ ok: false, error: "Invalid payload" });
        }

        // Check capability & limit
        const check = canChatAndWithinLimit(me);
        if (!check.ok) return cb?.({ ok: false, error: check.reason });

        const receiver = await User.findById(to);
        if (!receiver) return cb?.({ ok: false, error: "Receiver not found" });

        // Save message
        const msg = await Message.create({
          sender: me._id,
          receiver: receiver._id,
          content: content.trim(),
        });

        // Increment sender counter
        me.messages_sent_today += 1;
        await me.save();

        // Emit to both parties
        const payload = {
          _id: msg._id,
          sender: me._id,
          receiver: receiver._id,
          content: msg.content,
          createdAt: msg.createdAt,
        };

        nsp.to(me._id.toString()).emit("message", payload);
        nsp.to(receiver._id.toString()).emit("message", payload);

        cb?.({ ok: true, message: payload });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });

    // Fetch conversation history with userId
    socket.on("fetch_conversation", async ({ withUserId, limit = 50, skip = 0 }, cb) => {
      try {
        const q = {
          $or: [
            { sender: me._id, receiver: withUserId },
            { sender: withUserId, receiver: me._id },
          ],
        };
        const messages = await Message.find(q)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Math.min(limit, 100));
        cb?.({ ok: true, messages });
      } catch (e) {
        cb?.({ ok: false, error: e.message });
      }
    });
  });
}
