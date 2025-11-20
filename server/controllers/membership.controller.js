// controllers/membership.controller.js
import Membership from "../models/membership.model.js";
import User from "../models/user.model.js";

/**
 * Seed default plans if they don't exist.
 * - free: no chat, no full-profile viewing
 * - basic/premium/elite: chat + full-profile, with different daily message limits
 */
export const ensureDefaultPlans = async () => {
  const defaults = [
    {
      name: "free",
      price: 0,
      duration: 36500, // ~100 years so "free" doesn't expire
      features: ["Browse"],
      can_chat: false,
      can_view_full_profiles: false,
      message_limit_per_day: 0,
    },
    {
      name: "basic",
      price: 9.99,
      duration: 30,
      features: ["Limited chat", "View full profiles"],
      can_chat: true,
      can_view_full_profiles: true,
      message_limit_per_day: 10,
    },
    {
      name: "premium",
      price: 19.99,
      duration: 30,
      features: ["More chat", "View full profiles"],
      can_chat: true,
      can_view_full_profiles: true,
      message_limit_per_day: 30,
    },
    {
      name: "elite",
      price: 49.99,
      duration: 30,
      features: ["High chat", "View full profiles"],
      can_chat: true,
      can_view_full_profiles: true,
      message_limit_per_day: 200,
    },
  ];

  for (const plan of defaults) {
    await Membership.updateOne(
      { name: plan.name },
      { $setOnInsert: plan },
      { upsert: true }
    );
  }
};

/**
 * Admin: Create a new membership plan
 * body: { name, price, duration, features?, can_chat?, can_view_full_profiles?, message_limit_per_day? }
 */
export const createMembership = async (req, res) => {
  try {
    const membership = new Membership(req.body);
    await membership.save();
    res.status(201).json({ message: "Membership created", membership });
  } catch (error) {
    res.status(500).json({ message: "Error creating membership", error: error.message });
  }
};

/**
 * Public: Get all membership plans
 */
export const getMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ price: 1 });
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: "Error fetching memberships", error: error.message });
  }
};

/**
 * Admin or Self (via purchase route): Assign a membership to a user
 * body: { userId, membershipId }
 */
export const assignMembership = async (req, res) => {
  try {
    const { userId, membershipId } = req.body;

    const membership = await Membership.findById(membershipId);
    if (!membership) return res.status(404).json({ message: "Membership not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // compute expiry
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + membership.duration);

    // assign & reset daily message counter if your user model supports it
    user.membership = membershipId;
    user.membership_expiry = expiry;
    user.resetDailyCounterIfNeeded?.();
    await user.save();

    const populated = await User.findById(userId).populate("membership");
    res.json({ message: "Membership assigned successfully", user: populated });
  } catch (error) {
    res.status(500).json({ message: "Error assigning membership", error: error.message });
  }
};
