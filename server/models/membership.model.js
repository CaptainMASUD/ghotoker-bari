import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., Gold, Silver, Platinum
    price: { type: Number, required: true },
    duration: { type: Number, required: true }, // in days
    features: [String], // list of benefits
  },
  { timestamps: true }
);

const Membership = mongoose.model("Membership", membershipSchema);
export default Membership;
