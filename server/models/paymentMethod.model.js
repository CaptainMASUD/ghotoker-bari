import mongoose from "mongoose";

const { Schema } = mongoose;

const paymentFieldSchema = new Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
    },

    type: {
      type: String,
      enum: [
        "text",
        "number",
        "email",
        "phone",
        "textarea",
        "select",
        "date",
        "time",
      ],
      default: "text",
    },

    required: {
      type: Boolean,
      default: false,
    },

    placeholder: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    help_text: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    options: {
      type: [String],
      default: [],
    },

    validation_regex: {
      type: String,
      trim: true,
    },

    sort_order: {
      type: Number,
      default: 0,
    },
  },
  { _id: true }
);

const paymentMethodSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    provider_type: {
      type: String,
      enum: [
        "bkash",
        "nagad",
        "rocket",
        "bank",
        "card",
        "cash",
        "manual",
        "other",
      ],
      default: "manual",
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    instructions: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    account_name: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    account_number: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    branch_name: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    routing_number: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    currency: {
      type: String,
      default: "BDT",
      trim: true,
      uppercase: true,
    },

    min_amount: {
      type: Number,
      default: 0,
      min: 0,
    },

    max_amount: {
      type: Number,
      default: null,
      min: 0,
    },

    fields: {
      type: [paymentFieldSchema],
      default: [],
    },

    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },

    sort_order: {
      type: Number,
      default: 0,
      index: true,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const makeSlug = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

paymentMethodSchema.pre("validate", function (next) {
  if (this.name) {
    this.name = String(this.name).trim();
  }

  if (!this.slug && this.name) {
    this.slug = makeSlug(this.name);
  }

  if (this.slug) {
    this.slug = makeSlug(this.slug);
  }

  if (Array.isArray(this.fields)) {
    this.fields = this.fields.map((field, index) => {
      const finalName = field.name || field.label || `field_${index + 1}`;

      return {
        ...field,
        name: makeSlug(finalName).replace(/-/g, "_"),
        sort_order: field.sort_order ?? index,
      };
    });
  }

  next();
});

paymentMethodSchema.index({
  is_active: 1,
  sort_order: 1,
  _id: -1,
});

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

export default PaymentMethod;