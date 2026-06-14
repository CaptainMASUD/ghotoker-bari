import mongoose from "mongoose";

const { Schema } = mongoose;

const membershipPaymentSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    membership: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      required: true,
      index: true,
    },

    payment_method: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },

    currency: {
      type: String,
      default: "BDT",
      trim: true,
      uppercase: true,
    },

    transaction_id: {
      type: String,
      trim: true,
      index: true,
    },

    payment_values: {
      type: Schema.Types.Mixed,
      default: {},
    },

    payment_note: {
      type: String,
      trim: true,
      maxlength: 1500,
    },

    proof_files: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    plan_snapshot: {
      name: String,
      slug: String,
      price: Number,
      currency: String,
      duration_days: Number,
      features: Schema.Types.Mixed,
    },

    payment_method_snapshot: {
      name: String,
      slug: String,
      provider_type: String,
      account_name: String,
      account_number: String,
      fields: Schema.Types.Mixed,
    },

    submitted_at: {
      type: Date,
      default: Date.now,
      index: true,
    },

    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    reviewed_at: {
      type: Date,
      default: null,
    },

    review_note: {
      type: String,
      trim: true,
      maxlength: 1500,
    },

    approved_at: {
      type: Date,
      default: null,
    },

    rejected_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

membershipPaymentSchema.index({
  user: 1,
  status: 1,
  _id: -1,
});

membershipPaymentSchema.index({
  membership: 1,
  status: 1,
  _id: -1,
});

membershipPaymentSchema.index({
  status: 1,
  submitted_at: -1,
  _id: -1,
});

const MembershipPayment = mongoose.model(
  "MembershipPayment",
  membershipPaymentSchema
);

export default MembershipPayment;