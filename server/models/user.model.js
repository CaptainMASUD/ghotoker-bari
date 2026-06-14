import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    /* =====================================================
       ROLE SYSTEM
    ===================================================== */

    role: {
      type: String,
      enum: ["user", "moderator", "superadmin"],
      default: "user",
      index: true,
    },

    /* =====================================================
       COMMON AUTH FIELDS
    ===================================================== */

    first_name: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
      maxlength: 80,
    },

    last_name: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
      maxlength: 80,
    },

    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
      maxlength: 80,
    },

    email_address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone_number: {
      type: String,
      required: function () {
        return this.role === "user";
      },
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
      minlength: 6,
    },

    /* =====================================================
       NORMALIZED SEARCH FIELDS
       These help faster filtering/searching.
    ===================================================== */

    full_name_normalized: {
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

    /* =====================================================
       ADMIN / MODERATOR FIELDS
    ===================================================== */

    permissions: {
      type: [String],
      default: [],
      index: true,
    },

    admin_status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    last_login: {
      type: Date,
      default: null,
    },

    /* =====================================================
       BASIC MATRIMONY PROFILE
    ===================================================== */

    dob: {
      type: Date,
      index: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      index: true,
    },

    profile_created_by: {
      type: String,
      enum: ["self", "parent", "sibling", "relative", "friend", "other"],
      default: "self",
    },

    marital_status: {
      type: String,
      enum: ["never_married", "divorced", "widowed", "separated"],
      index: true,
    },

    children: {
      has_children: {
        type: Boolean,
        default: false,
      },
      number_of_children: {
        type: Number,
        default: 0,
        min: 0,
      },
      children_living_with: {
        type: String,
        enum: ["me", "ex_partner", "family", "not_applicable"],
        default: "not_applicable",
      },
    },

    religion: {
      type: String,
      enum: ["Islam", "Hinduism", "Buddhism", "Christianity", "Other"],
      index: true,
    },

    sect: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    caste_or_community: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    mother_tongue: {
      type: String,
      default: "Bangla",
      trim: true,
      index: true,
    },

    nationality: {
      type: String,
      default: "Bangladeshi",
      trim: true,
    },

    nid: {
      type: String,
      trim: true,
      select: false,
    },

    passport: {
      type: String,
      trim: true,
      select: false,
    },

    about_me: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    profile_photos: {
      type: [String],
      default: [],
    },

    profile_photo_visibility: {
      type: String,
      enum: ["public", "members_only", "premium_only", "private"],
      default: "members_only",
    },

    /* =====================================================
       PHYSICAL DETAILS
    ===================================================== */

    height: {
      type: String,
      trim: true,
    },

    height_cm: {
      type: Number,
      index: true,
      min: 0,
    },

    weight: {
      type: String,
      trim: true,
    },

    weight_kg: {
      type: Number,
      min: 0,
    },

    body_type: {
      type: String,
      enum: ["slim", "average", "athletic", "heavy", "other"],
    },

    complexion: {
      type: String,
      enum: ["very_fair", "fair", "wheatish", "brown", "dark", "other"],
    },

    blood_group: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    disability: {
      has_disability: {
        type: Boolean,
        default: false,
      },
      details: {
        type: String,
        trim: true,
        maxlength: 500,
      },
    },

    /* =====================================================
       LOCATION DETAILS - BANGLADESH
    ===================================================== */

    current_country: {
      type: String,
      default: "Bangladesh",
      trim: true,
      index: true,
    },

    current_division: {
      type: String,
      trim: true,
      index: true,
    },

    current_district: {
      type: String,
      trim: true,
      index: true,
    },

    current_city: {
      type: String,
      trim: true,
      index: true,
    },

    present_address: {
      type: String,
      trim: true,
      select: false,
    },

    permanent_division: {
      type: String,
      trim: true,
      index: true,
    },

    permanent_district: {
      type: String,
      trim: true,
      index: true,
    },

    permanent_upazila: {
      type: String,
      trim: true,
    },

    permanent_address: {
      type: String,
      trim: true,
      select: false,
    },

    preferred_location: {
      type: String,
      trim: true,
    },

    willing_to_relocate: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       EDUCATION DETAILS
    ===================================================== */

    highest_education: {
      type: String,
      trim: true,
      index: true,
    },

    education_details: {
      degree_name: {
        type: String,
        trim: true,
      },
      institution_name: {
        type: String,
        trim: true,
      },
      passing_year: {
        type: Number,
      },
      result: {
        type: String,
        trim: true,
      },
    },

    /* =====================================================
       PROFESSION DETAILS
    ===================================================== */

    profession: {
      type: String,
      trim: true,
      index: true,
    },

    occupation_type: {
      type: String,
      enum: [
        "government_job",
        "private_job",
        "business",
        "freelancer",
        "student",
        "doctor",
        "engineer",
        "teacher",
        "lawyer",
        "banker",
        "housewife",
        "unemployed",
        "other",
      ],
      index: true,
    },

    company_or_business_name: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    annual_income: {
      type: String,
      trim: true,
      index: true,
    },

    monthly_income: {
      type: String,
      trim: true,
    },

    monthly_income_min: {
      type: Number,
      index: true,
      min: 0,
    },

    monthly_income_max: {
      type: Number,
      index: true,
      min: 0,
    },

    /* =====================================================
       FAMILY DETAILS
    ===================================================== */

    family: {
      father_name: {
        type: String,
        trim: true,
        select: false,
      },

      father_occupation: {
        type: String,
        trim: true,
      },

      mother_name: {
        type: String,
        trim: true,
        select: false,
      },

      mother_occupation: {
        type: String,
        trim: true,
      },

      family_type: {
        type: String,
        enum: ["nuclear", "joint", "extended"],
      },

      family_status: {
        type: String,
        enum: ["lower_middle_class", "middle_class", "upper_middle_class", "rich", "elite"],
        index: true,
      },

      family_values: {
        type: String,
        enum: ["traditional", "moderate", "liberal"],
      },

      number_of_brothers: {
        type: Number,
        default: 0,
        min: 0,
      },

      number_of_sisters: {
        type: Number,
        default: 0,
        min: 0,
      },

      brothers_married: {
        type: Number,
        default: 0,
        min: 0,
      },

      sisters_married: {
        type: Number,
        default: 0,
        min: 0,
      },

      family_details: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },

    /* =====================================================
       LIFESTYLE DETAILS
    ===================================================== */

    lifestyle: {
      diet: {
        type: String,
        enum: ["halal", "vegetarian", "non_vegetarian", "eggetarian", "other"],
      },

      smoking: {
        type: String,
        enum: ["no", "yes", "occasionally"],
        default: "no",
        index: true,
      },

      drinking: {
        type: String,
        enum: ["no", "yes", "occasionally"],
        default: "no",
        index: true,
      },

      prayer: {
        type: String,
        enum: ["regular", "sometimes", "rarely", "prefer_not_to_say"],
      },

      hijab_or_beard_preference: {
        type: String,
        trim: true,
      },

      hobbies: {
        type: [String],
        default: [],
      },
    },

    /* =====================================================
       PARTNER PREFERENCES
    ===================================================== */

    partner_preferences: {
      looking_for: {
        type: String,
        enum: ["bride", "groom"],
      },

      age_range_min: {
        type: Number,
        min: 18,
      },

      age_range_max: {
        type: Number,
        min: 18,
      },

      preferred_height_min_cm: {
        type: Number,
      },

      preferred_height_max_cm: {
        type: Number,
      },

      preferred_religion: {
        type: String,
        trim: true,
      },

      preferred_marital_status: {
        type: [String],
        default: [],
      },

      preferred_education: {
        type: [String],
        default: [],
      },

      preferred_profession: {
        type: [String],
        default: [],
      },

      preferred_division: {
        type: [String],
        default: [],
      },

      preferred_district: {
        type: [String],
        default: [],
      },

      preferred_country: {
        type: [String],
        default: ["Bangladesh"],
      },

      preferred_family_status: {
        type: [String],
        default: [],
      },

      accept_divorced: {
        type: Boolean,
        default: false,
      },

      accept_widowed: {
        type: Boolean,
        default: false,
      },

      accept_with_children: {
        type: Boolean,
        default: false,
      },

      other_expectations: {
        type: String,
        trim: true,
        maxlength: 2000,
      },
    },

    /* =====================================================
       OLD FLAT COMPATIBILITY FIELDS
    ===================================================== */

    looking_for: {
      type: String,
      trim: true,
    },

    age_range_min: {
      type: Number,
    },

    age_range_max: {
      type: Number,
    },

    /* =====================================================
       VERIFICATION
    ===================================================== */

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    verification: {
      email_verified: {
        type: Boolean,
        default: false,
      },

      phone_verified: {
        type: Boolean,
        default: false,
      },

      nid_verified: {
        type: Boolean,
        default: false,
      },

      photo_verified: {
        type: Boolean,
        default: false,
      },

      biodata_verified: {
        type: Boolean,
        default: false,
      },

      verification_status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        index: true,
      },

      rejection_reason: {
        type: String,
        trim: true,
        maxlength: 1000,
      },
    },

    /* =====================================================
       MEMBERSHIP
    ===================================================== */

    membership: {
      type: Schema.Types.ObjectId,
      ref: "Membership",
      default: null,
      index: true,
    },

    membership_started_at: {
      type: Date,
      default: null,
    },

    membership_expiry: {
      type: Date,
      default: null,
      index: true,
    },

    membership_status: {
      type: String,
      enum: ["free", "active", "expired", "cancelled"],
      default: "free",
      index: true,
    },

    /* =====================================================
       PRIVACY
    ===================================================== */

    privacy: {
      show_phone: {
        type: Boolean,
        default: false,
      },

      show_email: {
        type: Boolean,
        default: false,
      },

      show_address: {
        type: Boolean,
        default: false,
      },

      show_income: {
        type: Boolean,
        default: false,
      },

      show_family_details: {
        type: Boolean,
        default: true,
      },

      allow_profile_view: {
        type: Boolean,
        default: true,
        index: true,
      },

      allow_messages: {
        type: Boolean,
        default: true,
      },
    },

    /* =====================================================
       PROFILE / ACCOUNT STATUS
    ===================================================== */

    profile_status: {
      type: String,
      enum: ["incomplete", "pending_review", "approved", "rejected", "hidden"],
      default: "incomplete",
      index: true,
    },

    account_status: {
      type: String,
      enum: ["active", "inactive", "suspended", "deleted"],
      default: "active",
      index: true,
    },

    profile_completeness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },

    profile_views_count: {
      type: Number,
      default: 0,
    },

    shortlisted_by_count: {
      type: Number,
      default: 0,
    },

    last_active_at: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* =====================================================
   VIRTUALS
===================================================== */

userSchema.virtual("full_name").get(function () {
  return `${this.first_name || ""} ${this.last_name || ""}`.trim();
});

userSchema.virtual("age").get(function () {
  if (!this.dob) return null;

  const today = new Date();
  const birthDate = new Date(this.dob);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
});

/* =====================================================
   NORMALIZATION
===================================================== */

userSchema.pre("validate", function (next) {
  if (this.email_address) {
    this.email_address = String(this.email_address).toLowerCase().trim();
    this.email_normalized = this.email_address;
  }

  if (this.username) {
    this.username = String(this.username).toLowerCase().trim();
  }

  if (this.phone_number) {
    this.phone_number = String(this.phone_number).trim();
    this.phone_normalized = this.phone_number.replace(/\s+/g, "");
  }

  const fullName = `${this.first_name || ""} ${this.last_name || ""}`.trim();
  this.full_name_normalized = fullName.toLowerCase();

  next();
});

/* =====================================================
   PASSWORD HASHING
===================================================== */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

/* =====================================================
   METHODS
===================================================== */

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this.toObject({ virtuals: true });

  delete user.password;
  delete user.nid;
  delete user.passport;
  delete user.present_address;
  delete user.permanent_address;

  if (user.family) {
    delete user.family.father_name;
    delete user.family.mother_name;
  }

  return user;
};

/* =====================================================
   HIGH-PERFORMANCE INDEXES
===================================================== */

// Main browse index
userSchema.index({
  role: 1,
  account_status: 1,
  profile_status: 1,
  gender: 1,
  religion: 1,
  marital_status: 1,
  current_division: 1,
  current_district: 1,
  isVerified: -1,
  _id: -1,
});

// Cursor pagination index
userSchema.index({
  role: 1,
  account_status: 1,
  profile_status: 1,
  _id: -1,
});

// Age filter index
userSchema.index({
  dob: 1,
  _id: -1,
});

// Admin list index
userSchema.index({
  role: 1,
  admin_status: 1,
  isVerified: 1,
  _id: -1,
});

// Verification panel index
userSchema.index({
  role: 1,
  "verification.verification_status": 1,
  profile_status: 1,
  _id: -1,
});

// Search text index
userSchema.index({
  full_name_normalized: "text",
  email_normalized: "text",
  phone_normalized: "text",
  current_city: "text",
  current_district: "text",
  profession: "text",
  highest_education: "text",
});

const User = mongoose.model("User", userSchema);

export default User;