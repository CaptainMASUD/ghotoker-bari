import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email_address: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true },
    password: { type: String, required: true },
    dob: Date,
    gender: String,
    nid: String,
    passport: String,
    current_city: String,
    preferred_location: String,
    profession: String,
    highest_education: String,
    annual_income: String,
    religion: String,
    marital_status: String,
    height: String,
    mother_tongue: String,
    about_me: String,
    profile_photos: [String],

    // Verification by admin
    isVerified: { type: Boolean, default: false },

    // Membership
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
      default: null,
    },
    membership_expiry: Date,
  },
  { timestamps: true }
);

// Password hashing
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
