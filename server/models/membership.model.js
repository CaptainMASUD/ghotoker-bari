import mongoose from "mongoose";

const { Schema } = mongoose;

/* =====================================================
   MEMBERSHIP FEATURES
   - Boolean = permission
   - Number = dynamic limit controlled by admin
   - Use -1 for unlimited
===================================================== */

const membershipFeaturesSchema = new Schema(
  {
    /* Profile browsing */
    can_browse_profiles: {
      type: Boolean,
      default: true,
    },

    profile_view_limit: {
      type: Number,
      default: 10,
      min: -1,
    },

    can_view_full_profiles: {
      type: Boolean,
      default: false,
    },

    can_view_profile_photos: {
      type: Boolean,
      default: false,
    },

    can_view_biodata: {
      type: Boolean,
      default: false,
    },

    /* Connection / Interest */
    can_send_connection_request: {
      type: Boolean,
      default: true,
    },

    connection_request_limit: {
      type: Number,
      default: 3,
      min: -1,
    },

    can_accept_connection_request: {
      type: Boolean,
      default: true,
    },

    /* Messaging */
    can_send_messages: {
      type: Boolean,
      default: false,
    },

    message_limit: {
      type: Number,
      default: 0,
      min: -1,
    },

    /* Photo access request */
    can_request_photo_access: {
      type: Boolean,
      default: false,
    },

    photo_request_limit: {
      type: Number,
      default: 0,
      min: -1,
    },

    /* Guardian / contact access */
    can_request_guardian_contact: {
      type: Boolean,
      default: false,
    },

    guardian_contact_request_limit: {
      type: Number,
      default: 0,
      min: -1,
    },

    can_view_phone: {
      type: Boolean,
      default: false,
    },

    can_view_email: {
      type: Boolean,
      default: false,
    },

    can_view_address: {
      type: Boolean,
      default: false,
    },

    /* Shortlist */
    can_shortlist_profiles: {
      type: Boolean,
      default: true,
    },

    shortlist_limit: {
      type: Number,
      default: 5,
      min: -1,
    },

    /* Extra premium features */
    can_see_who_viewed_me: {
      type: Boolean,
      default: false,
    },

    can_boost_profile: {
      type: Boolean,
      default: false,
    },

    profile_boost_days: {
      type: Number,
      default: 0,
      min: 0,
    },

    priority_support: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/* =====================================================
   MEMBERSHIP PLAN SCHEMA
===================================================== */

const membershipSchema = new Schema(
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

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },

    currency: {
      type: String,
      default: "BDT",
      trim: true,
      uppercase: true,
    },

    duration_days: {
      type: Number,
      default: null,
      min: 1,
    },

    /*
      IMPORTANT:
      Do NOT add index: true here because we already create
      a custom unique partial index below using schema.index().
    */
    is_default: {
      type: Boolean,
      default: false,
    },

    is_free: {
      type: Boolean,
      default: false,
      index: true,
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

    features: {
      type: membershipFeaturesSchema,
      default: () => ({}),
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

/* =====================================================
   NORMALIZATION
===================================================== */

membershipSchema.pre("validate", function (next) {
  if (this.name) {
    this.name = String(this.name).trim();
  }

  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  if (this.slug) {
    this.slug = String(this.slug)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /*
    The Free Plan is protected:
    - always default
    - always free
    - price always 0
    - no expiry duration
    - always active
  */
  if (this.slug === "free") {
    this.is_default = true;
    this.is_free = true;
    this.price = 0;
    this.duration_days = null;
    this.is_active = true;
  }

  next();
});

/* =====================================================
   INDEXES
===================================================== */

membershipSchema.index({
  is_active: 1,
  price: 1,
  sort_order: 1,
  _id: -1,
});

/*
  Only one default plan is allowed.
  This is why we do not use index: true on is_default above.
*/
membershipSchema.index(
  { is_default: 1 },
  {
    unique: true,
    partialFilterExpression: { is_default: true },
  }
);

/* =====================================================
   DEFAULT FREE PLAN SEED
   Call this after MongoDB connection.
===================================================== */

membershipSchema.statics.ensureDefaultFreePlan = async function () {
  const existingFreePlan = await this.findOne({ slug: "free" });

  if (existingFreePlan) {
    let needsUpdate = false;

    if (!existingFreePlan.is_default) {
      existingFreePlan.is_default = true;
      needsUpdate = true;
    }

    if (!existingFreePlan.is_free) {
      existingFreePlan.is_free = true;
      needsUpdate = true;
    }

    if (existingFreePlan.price !== 0) {
      existingFreePlan.price = 0;
      needsUpdate = true;
    }

    if (existingFreePlan.duration_days !== null) {
      existingFreePlan.duration_days = null;
      needsUpdate = true;
    }

    if (!existingFreePlan.is_active) {
      existingFreePlan.is_active = true;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await existingFreePlan.save();
    }

    return existingFreePlan;
  }

  return this.create({
    name: "Free Plan",
    slug: "free",
    description: "Default limited free membership for every new user.",
    price: 0,
    currency: "BDT",
    duration_days: null,
    is_default: true,
    is_free: true,
    is_active: true,
    sort_order: 0,
    features: {
      can_browse_profiles: true,
      profile_view_limit: 10,

      can_view_full_profiles: false,
      can_view_profile_photos: false,
      can_view_biodata: false,

      can_send_connection_request: true,
      connection_request_limit: 3,
      can_accept_connection_request: true,

      can_send_messages: false,
      message_limit: 0,

      can_request_photo_access: false,
      photo_request_limit: 0,

      can_request_guardian_contact: false,
      guardian_contact_request_limit: 0,

      can_view_phone: false,
      can_view_email: false,
      can_view_address: false,

      can_shortlist_profiles: true,
      shortlist_limit: 5,

      can_see_who_viewed_me: false,
      can_boost_profile: false,
      profile_boost_days: 0,

      priority_support: false,
    },
  });
};

const Membership = mongoose.model("Membership", membershipSchema);

export default Membership;