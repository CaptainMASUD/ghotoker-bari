"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronRight,
  Crown,
  GraduationCap,
  Heart,
  Home,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatLabel(value) {
  if (value === undefined || value === null || value === "") return "Not provided";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatHeight(user) {
  if (user?.height) return user.height;
  if (user?.height_cm) return `${user.height_cm} cm`;
  return "Not provided";
}

function formatWeight(user) {
  if (user?.weight) return user.weight;
  if (user?.weight_kg) return `${user.weight_kg} kg`;
  return "Not provided";
}

function joinValues(values = []) {
  return values.filter(Boolean).join(", ") || "Not provided";
}

function getProfilePhoto(user) {
  if (!user) return "";

  if (user.profile_photo) return user.profile_photo;
  if (user.profile_photo_url) return user.profile_photo_url;
  if (user.avatar) return user.avatar;

  if (Array.isArray(user.profile_photos) && user.profile_photos.length > 0) {
    return user.profile_photos[0];
  }

  return "";
}

function getArrayText(value) {
  if (!value) return "Not provided";
  if (Array.isArray(value)) {
    return value.length ? value.map(formatLabel).join(", ") : "Not provided";
  }
  return formatLabel(value);
}

function getNestedValue(object, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], object);
}

function normalizeAccess(profileResponse, accessResponse, locked) {
  const profileAccess = profileResponse?.access || {};
  const profilePermissions = profileAccess?.permissions || {};
  const profileMembership = profileAccess?.membership || {};
  const profileRelation = profileAccess?.access_status || {};

  const actionAccess = accessResponse?.access || {};
  const actionMembership = accessResponse?.membership || {};
  const actionRelation = accessResponse?.relation || {};

  return {
    locked: Boolean(locked),

    membership: {
      active: Boolean(profileMembership.active ?? actionMembership.active),
      is_free: Boolean(profileMembership.is_free ?? actionMembership.is_free),
      is_paid: Boolean(profileMembership.is_paid ?? actionMembership.is_paid),
      name:
        profileMembership.name ||
        actionMembership.membership_name ||
        actionMembership.name ||
        "Free Plan",
      status: profileMembership.status || actionMembership.status || "",
      expiry: profileMembership.expiry || actionMembership.expiry || null,
      days_left: profileMembership.days_left ?? actionMembership.days_left ?? null,
    },

    permissions: {
      can_view_full_profile: Boolean(
        profilePermissions.can_view_full_profile ??
          actionAccess.can_view_full_profiles ??
          !locked
      ),
      can_view_biodata: Boolean(
        profilePermissions.can_view_biodata ?? actionAccess.can_view_biodata
      ),
      can_view_profile_photos: Boolean(
        profilePermissions.can_view_profile_photos ??
          actionAccess.can_view_profile_photos
      ),
      can_view_phone: Boolean(
        profilePermissions.can_view_phone ?? actionAccess.can_view_phone
      ),
      can_view_email: Boolean(
        profilePermissions.can_view_email ?? actionAccess.can_view_email
      ),
      can_view_address: Boolean(
        profilePermissions.can_view_address ?? actionAccess.can_view_address
      ),
      can_send_connection_request: Boolean(
        profilePermissions.can_send_connection_request ??
          actionAccess.can_send_connection_request
      ),
      can_send_messages: Boolean(
        profilePermissions.can_send_messages ?? actionAccess.can_send_messages
      ),
      can_request_photo_access: Boolean(
        profilePermissions.can_request_photo_access ??
          actionAccess.can_request_photo_access
      ),
      can_request_guardian_contact: Boolean(
        profilePermissions.can_request_guardian_contact ??
          actionAccess.can_request_guardian_contact
      ),
      can_shortlist_profiles: Boolean(
        profilePermissions.can_shortlist_profiles ??
          actionAccess.can_shortlist_profiles
      ),
    },

    relation: {
      connected: Boolean(profileRelation.connected ?? actionRelation.connected),
      photo_access_approved: Boolean(
        profileRelation.photo_access_approved ?? actionRelation.photo_access_approved
      ),
      guardian_contact_approved: Boolean(
        profileRelation.guardian_contact_approved ??
          actionRelation.guardian_contact_approved
      ),
      shortlisted: Boolean(profileRelation.shortlisted ?? actionRelation.shortlisted),
      pending_connection_request: Boolean(
        profileRelation.pending_connection_request ??
          actionRelation.pending_connection_request
      ),
      pending_photo_request: Boolean(
        profileRelation.pending_photo_request ?? actionRelation.pending_photo_request
      ),
      pending_guardian_contact_request: Boolean(
        profileRelation.pending_guardian_contact_request ??
          actionRelation.pending_guardian_contact_request
      ),
    },
  };
}

function StatusMessage({ type = "info", message, onClose }) {
  if (!message) return null;

  const styles =
    type === "success"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : type === "error"
      ? "border-rose-100 bg-rose-50 text-rose-700"
      : "border-amber-100 bg-amber-50 text-amber-700";

  return (
    <div className={`mb-5 rounded-3xl border p-4 ${styles}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold leading-6">{message}</p>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#f8f3ef] pt-[120px]">
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-5">
        <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <h3 className="mt-5 text-lg font-black text-slate-950">
            Loading profile details
          </h3>

          <p className="mt-1 text-sm font-semibold text-slate-500">
            Please wait a moment.
          </p>
        </div>
      </div>
    </div>
  );
}

function LockedAvatar({ user, canViewPhoto }) {
  const photoUrl = getProfilePhoto(user);
  const canShowPhoto = Boolean(photoUrl && canViewPhoto && !user?.profile_photo_locked);

  return (
    <div className="relative h-36 w-36 shrink-0 rounded-full bg-white p-1.5 shadow-2xl shadow-rose-100 ring-1 ring-rose-100">
      <div className="h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-rose-50 via-white to-orange-50">
        {canShowPhoto ? (
          <img
            src={photoUrl}
            alt={user?.full_name || "Profile"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-rose-600">
            <Lock className="h-12 w-12" />
          </div>
        )}
      </div>

      {user?.isVerified ? (
        <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-emerald-600 text-white shadow-lg">
          <BadgeCheck className="h-4 w-4" />
        </div>
      ) : null}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, locked = false }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
          {locked ? <Lock className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p
            className={`mt-1 break-words text-sm font-black ${
              locked ? "text-slate-400" : "text-slate-800"
            }`}
          >
            {locked ? "Locked by plan" : value || "Not provided"}
          </p>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, icon: Icon, locked = false, children }) {
  return (
    <section className="rounded-[32px] border border-white bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            {locked ? <Lock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            {subtitle ? (
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {children}
    </section>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  variant = "dark",
  loading = false,
}) {
  const styles =
    variant === "rose"
      ? "bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-200"
      : variant === "light"
      ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400"
      : "bg-slate-950 text-white hover:bg-rose-700 disabled:bg-slate-300";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition disabled:cursor-not-allowed ${styles}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}

export default function ProfileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profileResponse, setProfileResponse] = useState(null);
  const [accessResponse, setAccessResponse] = useState(null);
  const [user, setUser] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState({ type: "", message: "" });

  const token = getToken();

  const access = useMemo(() => {
    return normalizeAccess(profileResponse, accessResponse, Boolean(profileResponse?.locked));
  }, [profileResponse, accessResponse]);

  const permissions = access.permissions;
  const relation = access.relation;
  const membership = access.membership;

  const location = joinValues([
    user?.current_city,
    user?.current_district,
    user?.current_division,
    user?.current_country,
  ]);

  const canShowFull = Boolean(!profileResponse?.locked && permissions.can_view_full_profile);
  const canShowBiodata = Boolean(canShowFull && permissions.can_view_biodata);
  const canShowPhone = Boolean(canShowFull && permissions.can_view_phone);
  const canShowEmail = Boolean(canShowFull && permissions.can_view_email);
  const canShowAddress = Boolean(canShowFull && permissions.can_view_address);
  const canShowPhoto = Boolean(permissions.can_view_profile_photos);

  const loadProfile = async () => {
    if (!id) return;

    setIsLoading(true);
    setError("");

    try {
      if (!token) {
        setError("Please login to view profile details.");
        setIsLoading(false);
        return;
      }

      const profileRes = await fetch(`${API_BASE_URL}/api/user/${id}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData = await safeJson(profileRes);

      if (!profileRes.ok && !profileData?.user) {
        throw new Error(profileData.message || "Could not load profile details.");
      }

      setProfileResponse(profileData);
      setUser(profileData.user || null);

      const accessRes = await fetch(`${API_BASE_URL}/api/matrimony-actions/access/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const accessData = await safeJson(accessRes);

      if (accessRes.ok) {
        setAccessResponse(accessData);
      } else {
        setAccessResponse(null);
      }
    } catch (err) {
      setError(err?.message || "Something went wrong while loading profile.");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const runAction = async ({ key, url, method = "POST", body = null, success }) => {
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/find-matches/${id}`)}`);
      return;
    }

    setActionLoading(key);
    setNotice({ type: "", message: "" });

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(result.message || "Action failed. Please try again.");
      }

      setNotice({
        type: "success",
        message: success || result.message || "Action completed successfully.",
      });

      await loadProfile();
    } catch (err) {
      setNotice({
        type: "error",
        message: err?.message || "Something went wrong. Please try again.",
      });
    } finally {
      setActionLoading("");
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleConnection = () => {
    runAction({
      key: "connection",
      url: `/api/matrimony-actions/connections/${id}`,
      body: {
        message: "I am interested in your profile.",
      },
      success: "Connection request sent successfully.",
    });
  };

  const handlePhotoRequest = () => {
    runAction({
      key: "photo",
      url: `/api/matrimony-actions/photo-access/${id}`,
      success: "Photo access request sent successfully.",
    });
  };

  const handleGuardianRequest = () => {
    runAction({
      key: "guardian",
      url: `/api/matrimony-actions/guardian-contact/${id}`,
      success: "Guardian contact request sent successfully.",
    });
  };

  const handleShortlist = () => {
    runAction({
      key: "shortlist",
      url: `/api/matrimony-actions/shortlist/${id}`,
      method: relation.shortlisted ? "DELETE" : "POST",
      success: relation.shortlisted
        ? "Profile removed from shortlist."
        : "Profile added to shortlist.",
    });
  };

  const handleOpenChat = () => {
    if (!token) {
      navigate(`/login?redirect=${encodeURIComponent(`/find-matches/${id}`)}`);
      return;
    }

    if (!relation.connected) {
      setNotice({
        type: "error",
        message: "You need an accepted connection before starting a chat.",
      });
      return;
    }

    if (!permissions.can_send_messages) {
      setNotice({
        type: "error",
        message: "Your current membership does not allow messaging.",
      });
      return;
    }

    navigate("/chat", {
      state: {
        selectedUserId: id,
        selectedProfile: {
          _id: id,
          full_name: user?.full_name || "Profile",
          profile_photo: getProfilePhoto(user),
          isVerified: user?.isVerified || false,
        },
      },
    });
  };

  if (isLoading) return <PageLoader />;

  if (error && !user) {
    return (
      <div className="min-h-screen bg-[#f8f3ef] pt-[120px]">
        <div className="mx-auto max-w-3xl px-5 pb-10">
          <div className="rounded-[32px] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Lock className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-2xl font-black text-slate-950">
              Profile details unavailable
            </h1>

            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {error}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/find-matches"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Matches
              </Link>

              {!token ? (
                <Link
                  to={`/login?redirect=${encodeURIComponent(`/find-matches/${id}`)}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-black text-white"
                >
                  Login Now
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f3ef] pt-[112px] text-slate-800">
      <div className="mx-auto max-w-[1540px] px-5 pb-10 sm:px-7 lg:px-10 xl:px-14 2xl:px-20">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <Link
            to="/plans"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Crown className="h-4 w-4 text-amber-600" />
            Plans
          </Link>
        </div>

        <StatusMessage
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice({ type: "", message: "" })}
        />

        <div className="mb-6 overflow-hidden rounded-[36px] border border-white bg-white shadow-sm">
          <div className="relative bg-gradient-to-br from-rose-100 via-orange-50 to-white p-5 sm:p-7">
            <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-white/40" />
            <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-rose-200/35" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                <LockedAvatar user={user} canViewPhoto={canShowPhoto} />

                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    {user?.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Profile
                      </span>
                    ) : null}

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-white">
                      <Crown className="h-3.5 w-3.5 text-amber-600" />
                      {membership.name}
                    </span>

                    {profileResponse?.locked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-700 ring-1 ring-rose-100">
                        <Lock className="h-3.5 w-3.5" />
                        Limited View
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-black text-slate-700 ring-1 ring-white">
                        <Sparkles className="h-3.5 w-3.5 text-rose-600" />
                        Details Available
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    {user?.full_name || "Profile"}
                  </h1>

                  <p className="mt-2 text-sm font-bold text-slate-600 sm:text-base">
                    {user?.age ? `${user.age} years` : "Age hidden"} ·{" "}
                    {formatLabel(user?.marital_status)} · {formatLabel(user?.religion)}
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
                      <MapPin className="h-3.5 w-3.5 text-rose-600" />
                      {location}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
                      <Briefcase className="h-3.5 w-3.5 text-rose-600" />
                      {user?.profession || "Profession hidden"}
                    </span>

                    <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
                      <GraduationCap className="h-3.5 w-3.5 text-rose-600" />
                      {user?.highest_education || "Education hidden"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <ActionButton
                  icon={Users}
                  label={
                    relation.connected
                      ? "Connected"
                      : relation.pending_connection_request
                      ? "Request Sent"
                      : "Connect"
                  }
                  onClick={handleConnection}
                  loading={actionLoading === "connection"}
                  disabled={
                    relation.connected ||
                    relation.pending_connection_request ||
                    !permissions.can_send_connection_request
                  }
                />

                <ActionButton
                  icon={Star}
                  label={relation.shortlisted ? "Shortlisted" : "Shortlist"}
                  variant="light"
                  onClick={handleShortlist}
                  loading={actionLoading === "shortlist"}
                  disabled={!permissions.can_shortlist_profiles}
                />

                <ActionButton
                  icon={MessageCircle}
                  label="Message"
                  variant="rose"
                  onClick={handleOpenChat}
                  disabled={!permissions.can_send_messages || !relation.connected}
                />
              </div>
            </div>
          </div>
        </div>

        {profileResponse?.locked ? (
          <div className="mb-6 rounded-[32px] border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                  <Crown className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-amber-900">
                    Upgrade required for full details
                  </h3>
                  <p className="mt-1 text-sm font-bold leading-6 text-amber-800">
                    You can see basic profile information now. Full biodata, photos, and contact access depend on your active plan.
                  </p>
                </div>
              </div>

              <Link
                to="/plans"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-amber-600 px-5 text-sm font-black text-white transition hover:bg-amber-700"
              >
                View Plans
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-6 xl:sticky xl:top-[112px] xl:h-fit">
            <SectionCard title="Access Summary" subtitle="Your current profile access" icon={Crown}>
              <div className="space-y-3">
                <DetailItem icon={Crown} label="Current Plan" value={membership.name} />
                <DetailItem icon={CheckCircle2} label="Plan Status" value={membership.active ? "Active" : "Limited"} />
                <DetailItem
                  icon={CalendarDays}
                  label="Expiry"
                  value={
                    membership.expiry
                      ? `${formatDate(membership.expiry)}${
                          membership.days_left ? ` · ${membership.days_left} days left` : ""
                        }`
                      : "No expiry"
                  }
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2">
                <ActionButton
                  icon={Camera}
                  label={
                    relation.photo_access_approved
                      ? "Photo Approved"
                      : relation.pending_photo_request
                      ? "Photo Requested"
                      : "Request Photo"
                  }
                  variant="light"
                  onClick={handlePhotoRequest}
                  loading={actionLoading === "photo"}
                  disabled={
                    permissions.can_view_profile_photos ||
                    relation.photo_access_approved ||
                    relation.pending_photo_request ||
                    !permissions.can_request_photo_access
                  }
                />

                <ActionButton
                  icon={Phone}
                  label={
                    relation.guardian_contact_approved
                      ? "Contact Approved"
                      : relation.pending_guardian_contact_request
                      ? "Contact Requested"
                      : "Request Contact"
                  }
                  variant="light"
                  onClick={handleGuardianRequest}
                  loading={actionLoading === "guardian"}
                  disabled={
                    relation.guardian_contact_approved ||
                    relation.pending_guardian_contact_request ||
                    !permissions.can_request_guardian_contact
                  }
                />
              </div>
            </SectionCard>

            <SectionCard title="Quick Contact" subtitle="Available after permission" icon={Phone}>
              <div className="space-y-3">
                <DetailItem icon={Phone} label="Phone" value={user?.phone_number} locked={!canShowPhone} />
                <DetailItem icon={Mail} label="Email" value={user?.email_address} locked={!canShowEmail} />
                <DetailItem
                  icon={Home}
                  label="Address"
                  value={joinValues([user?.present_address, user?.permanent_address])}
                  locked={!canShowAddress}
                />
              </div>
            </SectionCard>
          </aside>

          <main className="space-y-6">
            <SectionCard title="Basic Information" subtitle="General profile overview" icon={UserRound}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <DetailItem icon={UserRound} label="Gender" value={formatLabel(user?.gender)} />
                <DetailItem icon={CalendarDays} label="Age" value={user?.age ? `${user.age} years` : "Not provided"} />
                <DetailItem icon={Heart} label="Marital Status" value={formatLabel(user?.marital_status)} />
                <DetailItem icon={Heart} label="Religion" value={formatLabel(user?.religion)} />
                <DetailItem icon={MapPin} label="Location" value={location} />
                <DetailItem icon={Briefcase} label="Profession" value={user?.profession || "Not provided"} />
                <DetailItem icon={GraduationCap} label="Education" value={user?.highest_education || "Not provided"} />
                <DetailItem icon={ShieldCheck} label="Verified" value={user?.isVerified ? "Verified" : "Not verified"} />
              </div>
            </SectionCard>

            <SectionCard
              title="Biodata Details"
              subtitle={canShowBiodata ? "Detailed personal information" : "Available based on plan access"}
              icon={Sparkles}
              locked={!canShowBiodata}
            >
              {canShowBiodata ? (
                <div className="space-y-5">
                  <div className="rounded-3xl bg-slate-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-400">About</p>
                    <p className="mt-2 text-sm font-bold leading-7 text-slate-700">
                      {user?.about_me || "Not provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <DetailItem icon={UserRound} label="Mother Tongue" value={formatLabel(user?.mother_tongue)} />
                    <DetailItem icon={UserRound} label="Height" value={formatHeight(user)} />
                    <DetailItem icon={UserRound} label="Weight" value={formatWeight(user)} />
                    <DetailItem icon={UserRound} label="Body Type" value={formatLabel(user?.body_type)} />
                    <DetailItem icon={UserRound} label="Complexion" value={formatLabel(user?.complexion)} />
                    <DetailItem icon={UserRound} label="Blood Group" value={formatLabel(user?.blood_group)} />
                    <DetailItem icon={Briefcase} label="Occupation Type" value={formatLabel(user?.occupation_type)} />
                    <DetailItem icon={Briefcase} label="Designation" value={user?.designation || "Not provided"} />
                    <DetailItem icon={Briefcase} label="Company / Business" value={user?.company_or_business_name || "Not provided"} />
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <Lock className="mx-auto h-8 w-8 text-slate-400" />
                  <h3 className="mt-3 text-base font-black text-slate-800">Biodata is locked</h3>
                  <p className="mx-auto mt-1 max-w-md text-sm font-semibold leading-6 text-slate-500">
                    Your current plan does not include full biodata access for this profile.
                  </p>
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Family & Lifestyle"
              subtitle={canShowBiodata ? "Family background and lifestyle details" : "Available with biodata access"}
              icon={Users}
              locked={!canShowBiodata}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <DetailItem icon={Users} label="Family Type" value={formatLabel(getNestedValue(user, "family.family_type"))} locked={!canShowBiodata} />
                <DetailItem icon={Users} label="Family Status" value={formatLabel(getNestedValue(user, "family.family_status"))} locked={!canShowBiodata} />
                <DetailItem icon={Briefcase} label="Father Occupation" value={formatLabel(getNestedValue(user, "family.father_occupation"))} locked={!canShowBiodata} />
                <DetailItem icon={Briefcase} label="Mother Occupation" value={formatLabel(getNestedValue(user, "family.mother_occupation"))} locked={!canShowBiodata} />
                <DetailItem icon={Users} label="Brothers" value={formatLabel(getNestedValue(user, "family.number_of_brothers"))} locked={!canShowBiodata} />
                <DetailItem icon={Users} label="Sisters" value={formatLabel(getNestedValue(user, "family.number_of_sisters"))} locked={!canShowBiodata} />
                <DetailItem icon={Sparkles} label="Smoking" value={formatLabel(getNestedValue(user, "lifestyle.smoking"))} locked={!canShowBiodata} />
                <DetailItem icon={Sparkles} label="Drinking" value={formatLabel(getNestedValue(user, "lifestyle.drinking"))} locked={!canShowBiodata} />
                <DetailItem icon={Sparkles} label="Hobbies" value={getArrayText(getNestedValue(user, "lifestyle.hobbies"))} locked={!canShowBiodata} />
              </div>
            </SectionCard>

            <SectionCard
              title="Partner Preference"
              subtitle={canShowBiodata ? "Preferred match information" : "Available with biodata access"}
              icon={Heart}
              locked={!canShowBiodata}
            >
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <DetailItem icon={Heart} label="Looking For" value={formatLabel(getNestedValue(user, "partner_preferences.looking_for"))} locked={!canShowBiodata} />
                <DetailItem
                  icon={CalendarDays}
                  label="Preferred Age"
                  value={joinValues([
                    getNestedValue(user, "partner_preferences.age_range_min"),
                    getNestedValue(user, "partner_preferences.age_range_max"),
                  ])}
                  locked={!canShowBiodata}
                />
                <DetailItem icon={Heart} label="Preferred Religion" value={formatLabel(getNestedValue(user, "partner_preferences.preferred_religion"))} locked={!canShowBiodata} />
                <DetailItem icon={GraduationCap} label="Preferred Education" value={getArrayText(getNestedValue(user, "partner_preferences.preferred_education"))} locked={!canShowBiodata} />
                <DetailItem icon={Briefcase} label="Preferred Profession" value={getArrayText(getNestedValue(user, "partner_preferences.preferred_profession"))} locked={!canShowBiodata} />
                <DetailItem
                  icon={MapPin}
                  label="Preferred Location"
                  value={joinValues([
                    getArrayText(getNestedValue(user, "partner_preferences.preferred_division")),
                    getArrayText(getNestedValue(user, "partner_preferences.preferred_district")),
                  ])}
                  locked={!canShowBiodata}
                />
              </div>
            </SectionCard>
          </main>
        </div>
      </div>
    </div>
  );
}