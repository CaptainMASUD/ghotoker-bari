export const requireNonFreeForProfiles = (req, res, next) => {
  const m = req.user?.membership;
  const ok = m && m.can_view_full_profiles;
  if (!ok) return res.status(403).json({ message: "Upgrade membership to view full profile details." });
  next();
};

export const canChatAndWithinLimit = (user) => {
  const m = user?.membership;
  if (!m || !m.can_chat) return { ok: false, reason: "Your membership doesn't allow chatting." };

  const limit = m.message_limit_per_day || 0;
  if (limit === 0) return { ok: false, reason: "Your membership message limit is 0." };

  if (user.messages_sent_today >= limit) {
    return { ok: false, reason: `Daily message limit reached (${limit}).` };
  }
  return { ok: true };
};
