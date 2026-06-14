import mongoose from "mongoose";

const { Schema } = mongoose;

const matrimonyActionSchema = new Schema(
  {
    type: {
      type: String,
      enum: [
        "profile_view",
        "connection_request",
        "photo_access_request",
        "guardian_contact_request",
        "shortlist",
        "message",
      ],
      required: true,
      index: true,
    },

    from_user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    to_user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
        "removed",
        "sent",
        "seen",
      ],
      default: "pending",
      index: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 1500,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    responded_at: {
      type: Date,
      default: null,
    },

    seen_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =====================================================
   INDEXES
===================================================== */

matrimonyActionSchema.index({
  type: 1,
  from_user: 1,
  to_user: 1,
  status: 1,
});

matrimonyActionSchema.index({
  type: 1,
  from_user: 1,
  createdAt: -1,
});

matrimonyActionSchema.index({
  type: 1,
  to_user: 1,
  status: 1,
  createdAt: -1,
});

matrimonyActionSchema.index({
  from_user: 1,
  to_user: 1,
  type: 1,
  createdAt: -1,
});

const MatrimonyAction = mongoose.model("MatrimonyAction", matrimonyActionSchema);

export default MatrimonyAction;