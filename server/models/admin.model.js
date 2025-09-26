import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const adminSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true, unique: true },
    email:      { type: String, required: true, unique: true },
    password:   { type: String, required: true },
    role: {
      type: String,
      enum: ["superadmin", "moderator"],
      default: "moderator",
    },
    permissions: [String],                 // e.g., ["verify_users", "delete_users"]
    isVerified: { type: Boolean, default: false }, // 🔹 NEW
    verifiedAt: { type: Date },                    // 🔹 optional audit
  },
  { timestamps: true }
);

// Hash password
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
