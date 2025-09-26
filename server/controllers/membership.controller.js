import Membership from "../models/membership.model.js";
import User from "../models/user.model.js";

// Create Membership Plan
export const createMembership = async (req, res) => {
  try {
    const membership = new Membership(req.body);
    await membership.save();
    res.status(201).json({ message: "Membership created", membership });
  } catch (error) {
    res.status(500).json({ message: "Error creating membership", error: error.message });
  }
};

// Get All Memberships
export const getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: "Error fetching memberships", error: error.message });
  }
};

// Assign Membership to User
export const assignMembership = async (req, res) => {
  try {
    const { userId, membershipId } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) return res.status(404).json({ message: "Membership not found" });

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + membership.duration);

    const user = await User.findByIdAndUpdate(
      userId,
      { membership: membershipId, membership_expiry: expiry },
      { new: true }
    ).populate("membership");

    res.json({ message: "Membership assigned successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error assigning membership", error: error.message });
  }
};
