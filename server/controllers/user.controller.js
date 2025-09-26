import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import uploadCloudinary from "../utils/cloudinary.js";

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIREY || "7d", // fallback 7 days
  });
};

// Format user object (hide password)
const formatUser = (user) => {
  const { password, ...rest } = user._doc;
  return rest;
};

// ================== REGISTER ==================
export const registerUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email_address,
      phone_number,
      password,
      dob,
      gender,
      nid,
      passport,
      current_city,
      preferred_location,
      profession,
      highest_education,
      annual_income,
      religion,
      marital_status,
      height,
      mother_tongue,
      about_me,
      looking_for,
      age_range_min,
      age_range_max,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email_address });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Upload photos if files exist
    let profilePhotos = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedUrl = await uploadCloudinary(file.buffer);
        if (uploadedUrl) profilePhotos.push(uploadedUrl);
      }
    }

    // Create new user
    const user = new User({
      first_name,
      last_name,
      email_address,
      phone_number,
      password, // gets hashed in model
      dob,
      gender,
      nid,
      passport,
      current_city,
      preferred_location,
      profession,
      highest_education,
      annual_income,
      religion,
      marital_status,
      height,
      mother_tongue,
      about_me,
      profile_photos: profilePhotos,
      looking_for,
      age_range_min,
      age_range_max,
    });

    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// ================== LOGIN ==================
export const loginUser = async (req, res) => {
  try {
    const { email_address, password } = req.body;

    // Find user
    const user = await User.findOne({ email_address });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      token: generateToken(user._id),
      user: formatUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};
