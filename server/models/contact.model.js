import mongoose from "mongoose";

const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 160,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
      index: true,
    },

    topic: {
      type: String,
      required: [true, "Topic is required"],
      enum: [
        "Profile verification",
        "Premium membership",
        "Matchmaking & concierge",
        "Report an issue",
        "Partnerships",
        "Other",
      ],
      index: true,
    },

    channel: {
      type: String,
      enum: ["Email", "Phone", "WhatsApp"],
      default: "Email",
      index: true,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: 10,
      maxlength: 3000,
    },

    consent: {
      type: Boolean,
      required: true,
      validate: {
        validator: (value) => value === true,
        message: "Privacy policy consent is required",
      },
    },

    name_normalized: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    email_normalized: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    phone_normalized: {
      type: String,
      trim: true,
      index: true,
    },

    is_deleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deleted_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    deleted_at: {
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
   NORMALIZATION
===================================================== */

contactSchema.pre("validate", function (next) {
  if (this.name) {
    this.name = String(this.name).trim();
    this.name_normalized = this.name.toLowerCase();
  }

  if (this.email) {
    this.email = String(this.email).toLowerCase().trim();
    this.email_normalized = this.email;
  }

  if (this.phone) {
    this.phone = String(this.phone).trim();
    this.phone_normalized = this.phone.replace(/\s+/g, "");
  }

  next();
});

/* =====================================================
   INDEXES
===================================================== */

contactSchema.index({
  is_deleted: 1,
  createdAt: -1,
  _id: -1,
});

contactSchema.index({
  is_deleted: 1,
  topic: 1,
  channel: 1,
  _id: -1,
});

contactSchema.index({
  name_normalized: "text",
  email_normalized: "text",
  phone_normalized: "text",
  topic: "text",
  message: "text",
});

const Contact = mongoose.model("Contact", contactSchema);

export default Contact;