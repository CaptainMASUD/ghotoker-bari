// hooks.js
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

export const API = "https://ghotoker-bari-api.vercel.app";

/* ---------------------- LocalStorage helpers ---------------------- */
const parseLS = (k) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};

/* ---------------------- Identity / Token hook ---------------------- */
/**
 * Finds the auth token & best-known user object from Redux or localStorage.
 * Supports shapes:
 *  - redux: currentUser === "<token>"
 *  - redux: currentUser === { token, ... }
 *  - redux: currentUser === { token, user: {...} }
 *  - localStorage: token, currentUser/user/admin
 */
export function useAuthAndIdentity() {
  const reduxCurrent = useSelector((s) => s.user?.currentUser ?? null);

  const token =
    typeof reduxCurrent === "string"
      ? reduxCurrent
      : reduxCurrent?.token || localStorage.getItem("token") || null;

  const fromReduxObj =
    reduxCurrent &&
    typeof reduxCurrent === "object" &&
    (reduxCurrent._id || reduxCurrent.user?._id)
      ? reduxCurrent._id
        ? reduxCurrent
        : reduxCurrent.user
      : null;

  const fromLS =
    parseLS("currentUser") ||
    parseLS("user") ||
    parseLS("admin") ||
    null;

  const userObj =
    fromReduxObj || (fromLS && typeof fromLS === "object" ? fromLS : null);

  const myId = userObj?._id || null;
  const myName =
    userObj?.full_name ||
    userObj?.username ||
    [userObj?.first_name, userObj?.last_name].filter(Boolean).join(" ") ||
    "User";

  const authHeaders = useMemo(
    () =>
      token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" },
    [token]
  );

  return { token, myId, myName, userObj, authHeaders };
}

/* --------------------------- Utilities --------------------------- */
export function capitalize(s = "") {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function computeAgeFromDOB(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(+d)) return null;
  return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
}

export const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="100%" height="100%" fill="#111827"/><circle cx="28" cy="20" r="10" fill="#4B5563"/><rect x="12" y="34" width="32" height="16" rx="8" fill="#4B5563"/></svg>`
  );

export function buildUserCardFrom(me, fallbackName = "User") {
  const name =
    me?.full_name ||
    [me?.first_name, me?.last_name].filter(Boolean).join(" ") ||
    me?.username ||
    fallbackName;

  const avatar =
    Array.isArray(me?.profile_photos) && me.profile_photos.length
      ? me.profile_photos[0]
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          name || "User"
        )}`;

  const membership =
    capitalize(me?.membership_status?.type || "free") +
    (me?.membership_status?.active ? " (Active)" : " (Inactive)");

  return { name, avatar, membership };
}

/* --------------------------- Normalizers --------------------------- */
/**
 * Ensures we never lose fields if backend omits undefined props.
 * Mirrors your current User model + public fields the API adds.
 */
function normalizeMe(raw) {
  const base = raw || {};
  // Core model fields
  const normalized = {
    _id: base._id ?? null,
    first_name: base.first_name ?? null,
    last_name: base.last_name ?? null,
    username: base.username ?? null, // in case you store it later
    email_address: base.email_address ?? null,
    phone_number: base.phone_number ?? null,
    password: undefined, // never expose
    dob: base.dob ?? null,
    gender: base.gender ?? null,
    nid: base.nid ?? null,
    passport: base.passport ?? null,
    current_city: base.current_city ?? null,
    preferred_location: base.preferred_location ?? null,
    profession: base.profession ?? null,
    highest_education: base.highest_education ?? null,
    annual_income: base.annual_income ?? null,
    religion: base.religion ?? null,
    marital_status: base.marital_status ?? null,
    height: base.height ?? null,
    mother_tongue: base.mother_tongue ?? null,
    about_me: base.about_me ?? null,
    profile_photos: Array.isArray(base.profile_photos) ? base.profile_photos : [],
    isVerified: Boolean(base.isVerified),
    membership: base.membership ?? null, // ObjectId or populated object (server hides details in membership_status)
    membership_expiry: base.membership_expiry ?? null,
    createdAt: base.createdAt ?? null,
    updatedAt: base.updatedAt ?? null,

    // Server-added public fields
    membership_status: {
      type: base?.membership_status?.type ?? "free",
      active: Boolean(base?.membership_status?.active),
      expiry: base?.membership_status?.expiry ?? null,
      can_chat: Boolean(base?.membership_status?.can_chat),
      can_view_full_profiles: Boolean(base?.membership_status?.can_view_full_profiles),
      message_limit_per_day: Number(base?.membership_status?.message_limit_per_day ?? 0),
      days_left: Number(base?.membership_status?.days_left ?? 0),
    },
    profile_completeness: Number(base?.profile_completeness ?? 0),
  };

  // Deriveds
  normalized.full_name =
    base.full_name ||
    [normalized.first_name, normalized.last_name].filter(Boolean).join(" ") ||
    normalized.username ||
    null;
  normalized.age = computeAgeFromDOB(normalized.dob);

  return normalized;
}

/* --------------------------- Fetch /me hook --------------------------- */
/**
 * Fetches ALL user data returned by GET /api/user/me (buildPublicUser shape),
 * normalized to always include every model field (with null/[] defaults).
 *
 * Returns:
 *  - me: normalized user
 *  - loading, error, refetch()
 */
export function useMe(options = {}) {
  const { skip = false } = options;
  const { token, authHeaders } = useAuthAndIdentity();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const doFetch = async () => {
    if (!token) {
      setMe(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/user/me`, { headers: authHeaders });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `Failed to fetch /me (${res.status})`);
      }
      const j = await res.json();
      const raw = j?.user ?? null;
      setMe(normalizeMe(raw));
    } catch (e) {
      setError(e);
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!skip) doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip, token]);

  return { me, loading, error, refetch: doFetch };
}

/* --------------------------- Public profile (gated) --------------------------- */
/**
 * Wrapper for GET /api/user/:id/profile
 * Always normalizes output to your common shape (where possible).
 */
export async function resolvePeerName(userId, token) {
  try {
    const res = await fetch(`${API}/api/user/${userId}/profile`, {
      headers: token
        ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
        : { "Content-Type": "application/json" },
    });
    const data = await res.json();
    const full =
      data?.full_name ||
      [data?.first_name, data?.last_name].filter(Boolean).join(" ") ||
      data?.username ||
      `User ${String(userId).slice(-4)}`;
    return full;
  } catch {
    return `User ${String(userId).slice(-4)}`;
  }
}
