// controllers/chat.controller.js
import mongoose from "mongoose";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

/* ----------------------------- helpers ----------------------------- */

const asObjectId = (id) => {
  try { return new mongoose.Types.ObjectId(id); } catch { return null; }
};

// If you want to gate viewing/sending by membership, tweak here:
const canViewMessages = () => true;
const canSendMessages = () => true;

/* ------------------------------ GET /threads ------------------------------ */
/** Returns peers the user has chatted with, with lastMessage + unreadCount */
export const getThreads = async (req, res) => {
  try {
    const myId = asObjectId(req.user.id);
    if (!myId) return res.status(400).json({ message: "Invalid user id" });

    const me = await User.findById(myId).populate("membership");
    if (!me) return res.status(404).json({ message: "User not found" });
    if (!canViewMessages(me)) {
      return res.status(403).json({ message: "Your membership does not allow viewing messages." });
    }

    const pipeline = [
      { $match: { $or: [{ sender: myId }, { receiver: myId }] } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          peer: { $cond: [{ $eq: ["$sender", myId] }, "$receiver", "$sender"] },
        },
      },
      {
        $group: {
          _id: "$peer",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$receiver", myId] }, { $eq: ["$seen", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { "lastMessage.createdAt": -1 } },
      { $limit: 100 },
    ];

    const rows = await Message.aggregate(pipeline);

    res.json({
      threads: rows.map((r) => ({
        _id: r._id, // peer user id
        unreadCount: r.unreadCount,
        lastMessage: {
          _id: r.lastMessage._id,
          sender: r.lastMessage.sender,
          receiver: r.lastMessage.receiver,
          content: r.lastMessage.content,
          createdAt: r.lastMessage.createdAt,
          seen: r.lastMessage.seen,
        },
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching threads", error: err.message });
  }
};

/* ---------------------------- GET /:withUserId ---------------------------- */
/** Paginated conversation with a peer; marks incoming as seen */
export const getConversation = async (req, res) => {
  try {
    const myId = asObjectId(req.user.id);
    const peerId = asObjectId(req.params.withUserId);
    if (!myId || !peerId) return res.status(400).json({ message: "Invalid id(s)" });

    const me = await User.findById(myId).populate("membership");
    if (!me) return res.status(404).json({ message: "User not found" });
    if (!canViewMessages(me)) {
      return res.status(403).json({ message: "Your membership does not allow viewing messages." });
    }

    const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
    const skip = Math.max(parseInt(req.query.skip || "0", 10), 0);

    const filter = {
      $or: [
        { sender: myId, receiver: peerId },
        { sender: peerId, receiver: myId },
      ],
    };

    const docs = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // mark incoming unseen as seen
    await Message.updateMany(
      { sender: peerId, receiver: myId, seen: false },
      { $set: { seen: true } }
    );

    const messages = docs.reverse();

    res.json({
      peerId: String(peerId),
      total: messages.length,
      messages: messages.map((m) => ({
        _id: m._id,
        sender: String(m.sender),
        receiver: String(m.receiver),
        content: m.content,
        seen: m.seen,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching conversation", error: err.message });
  }
};

/* -------------------------- PATCH /:messageId/seen ------------------------- */
/** Mark a single message seen (only if you are sender or receiver) */
export const markSeen = async (req, res) => {
  try {
    const myId = asObjectId(req.user.id);
    const messageId = asObjectId(req.params.messageId);
    if (!myId || !messageId) return res.status(400).json({ message: "Invalid id(s)" });

    const msg = await Message.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (String(msg.sender) !== String(myId) && String(msg.receiver) !== String(myId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (!msg.seen) {
      msg.seen = true;
      await msg.save();
    }

    res.json({ ok: true, message: { _id: msg._id, seen: msg.seen } });
  } catch (err) {
    res.status(500).json({ message: "Error marking seen", error: err.message });
  }
};

/* -------------------------------- POST / -------------------------------- */
/** HTTP send (fallback if socket fails). Body: { to, content } */
export const sendMessageHttp = async (req, res) => {
  try {
    const myId = asObjectId(req.user.id);
    const toId = asObjectId(req.body.to);
    const { content } = req.body || {};
    if (!myId || !toId) return res.status(400).json({ message: "Invalid user id(s)" });
    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    const me = await User.findById(myId).populate("membership");
    if (!me) return res.status(404).json({ message: "User not found" });
    if (!canSendMessages(me)) {
      return res.status(403).json({ message: "Your membership does not allow sending messages." });
    }

    const msg = await Message.create({
      sender: myId,
      receiver: toId,
      content: String(content).trim(),
      seen: false,
    });

    // If you stored io on app (e.g., app.set('io', io)), you can emit:
    // const io = req.app.get("io");
    // io?.of("/chat")?.to(String(toId))?.emit("message", msg);

    res.status(201).json({
      message: {
        _id: msg._id,
        sender: String(msg.sender),
        receiver: String(msg.receiver),
        content: msg.content,
        seen: msg.seen,
        createdAt: msg.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
};
