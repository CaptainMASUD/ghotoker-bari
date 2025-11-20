import mongoose from "mongoose";

export const MEMBERSHIP_TIERS = ["free", "basic", "premium", "elite"];

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: MEMBERSHIP_TIERS, // "free" | "basic" | "premium" | "elite"
    },
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // days
    features: [String],

    // Capabilities by tier
    can_chat: { type: Boolean, default: false },
    can_view_full_profiles: { type: Boolean, default: false },
    message_limit_per_day: { type: Number, default: 0 }, // only used if can_chat = true
  },
  { timestamps: true }
);

const Membership = mongoose.model("Membership", membershipSchema);
export default Membership;
