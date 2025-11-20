// models/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    content: { type: String, trim: true },
    // If you plan to add attachments later:
    attachments: [
      {
        url: String,
        type: { type: String }, // "image" | "file" | ...
      },
    ],
    seen: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Speed up “recent chats”
messageSchema.index({ createdAt: -1 });
// Handy compound for a conversation
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
