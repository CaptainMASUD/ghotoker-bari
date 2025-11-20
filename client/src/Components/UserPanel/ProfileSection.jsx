// ProfileSection.jsx
import React, { useMemo, useState } from "react";
import {
  FaUserCheck,
  FaCrown,
  FaInfoCircle,
  FaMars,
  FaVenus,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaIdCard,
} from "react-icons/fa";
import { DetailField, GridSkeleton } from "./blocks";
import { capitalize, computeAgeFromDOB, useMe } from "./hooks";

/**
 * Flexible component:
 * - Self-fetching by default via useMe() to show ALL data from /api/user/me.
 * - If you pass props (effectiveMe/membership/completeness/loadingMe), it will
 *   use those instead (controlled mode) and skip fetching.
 *
 * Props (optional):
 * - effectiveMe: object from GET /api/user/me (buildPublicUser)
 * - membership: effectiveMe.membership_status
 * - completeness: effectiveMe.profile_completeness
 * - loadingMe: boolean
 */
export default function ProfileSection(props) {
  const usingProps = !!props.effectiveMe || props.loadingMe !== undefined;
  const { me: fetchedMe, loading: fetching } = useMe({ skip: usingProps });

  const effectiveMe = props.effectiveMe ?? fetchedMe;
  const loadingMe = props.loadingMe ?? fetching;
  const membership = props.membership ?? effectiveMe?.membership_status ?? null;
  const completeness =
    props.completeness ?? effectiveMe?.profile_completeness ?? 0;

  if (loadingMe) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <h3 className="text-lg font-semibold">Profile</h3>
          <GridSkeleton />
        </div>
      </section>
    );
  }

  if (!effectiveMe) {
    return (
      <section className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <h3 className="text-lg font-semibold">Profile</h3>
          <p className="mt-3 text-white/70">Couldn’t load your profile.</p>
        </div>
      </section>
    );
  }

  const name =
    effectiveMe.full_name ||
    [effectiveMe.first_name, effectiveMe.last_name].filter(Boolean).join(" ") ||
    effectiveMe.username ||
    "—";

  const age = computeAgeFromDOB(effectiveMe.dob);
  const photos = Array.isArray(effectiveMe.profile_photos)
    ? effectiveMe.profile_photos.filter(Boolean)
    : [];
  const avatarFallback =
    photos[0] ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      name || "User"
    )}`;

  const completenessTone =
    (completeness ?? 0) >= 80
      ? "ok"
      : (completeness ?? 0) >= 50
      ? "warn"
      : "muted";

  const genderLower = String(effectiveMe.gender || "").toLowerCase();
  const genderIcon =
    genderLower === "male"
      ? <FaMars />
      : genderLower === "female"
      ? <FaVenus />
      : <FaInfoCircle />;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        {/* =================== PHOTO GALLERY =================== */}
        <PhotoGallery photos={photos} fallback={avatarFallback} />

        {/* =================== HEADER =================== */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">{name}</h2>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <Chip
                icon={<FaUserCheck />}
                label={effectiveMe.isVerified ? "Verified" : "Not verified"}
                tone={effectiveMe.isVerified ? "ok" : "muted"}
              />
              <Chip
                icon={<FaCrown />}
                label={`${capitalize(membership?.type || "free")} • ${
                  membership?.active ? "Active" : "Inactive"
                }`}
                tone={membership?.active ? "ok" : "warn"}
              />
              <Chip
                label={`Profile ${completeness ?? 0}%`}
                tone={completenessTone}
              />
            </div>

            {/* completeness bar */}
            <div className="mt-3 h-2 w-full max-w-[360px] rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full ${
                  completenessTone === "ok"
                    ? "bg-emerald-400/70"
                    : completenessTone === "warn"
                    ? "bg-amber-300/70"
                    : "bg-white/30"
                }`}
                style={{ width: `${Math.min(100, completeness ?? 0)}%` }}
              />
            </div>
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-2 gap-3 md:text-right">
            <MiniFact icon={genderIcon} value={effectiveMe.gender || "—"} />
            <MiniFact
              icon={<FaInfoCircle />}
              value={age != null ? `${age} yrs` : "Age —"}
            />
          </div>
        </div>

        {/* =================== CONTACT =================== */}
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <CardRow
            icon={<FaEnvelope className="text-rose-300" />}
            label="Email"
            value={effectiveMe.email_address || "—"}
          />
          <CardRow
            icon={<FaPhoneAlt className="text-rose-300" />}
            label="Phone"
            value={effectiveMe.phone_number || "—"}
          />
          <CardRow
            icon={<FaMapMarkerAlt className="text-rose-300" />}
            label="City"
            value={effectiveMe.current_city || "—"}
          />
        </div>

        {/* =================== CORE DETAILS GRID =================== */}
        <h3 className="mt-8 text-lg font-semibold">Profile Details</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <DetailField label="Full Name" value={name} />
          <DetailField label="Username" value={effectiveMe.username || "—"} />

          <DetailField label="Gender" value={effectiveMe.gender || "—"} />
          <DetailField label="Age" value={age ?? "—"} />
          <DetailField
            label="Date of Birth"
            value={
              effectiveMe.dob
                ? new Date(effectiveMe.dob).toLocaleDateString()
                : "—"
            }
          />

          <DetailField
            label="Current City"
            value={effectiveMe.current_city || "—"}
          />
          <DetailField
            label="Preferred Location"
            value={effectiveMe.preferred_location || "—"}
          />

          <DetailField
            label="Profession"
            value={effectiveMe.profession || "—"}
          />
          <DetailField
            label="Highest Education"
            value={effectiveMe.highest_education || "—"}
          />
          <DetailField
            label="Annual Income"
            value={effectiveMe.annual_income || "—"}
          />

          <DetailField label="Religion" value={effectiveMe.religion || "—"} />
          <DetailField
            label="Marital Status"
            value={effectiveMe.marital_status || "—"}
          />

          <DetailField label="Height" value={effectiveMe.height || "—"} />
          <DetailField
            label="Mother Tongue"
            value={effectiveMe.mother_tongue || "—"}
          />

          <DetailField
            label="Looking For"
            value={effectiveMe.looking_for || "—"}
          />
          <DetailField
            label="Preferred Age Range"
            value={formatRange(
              effectiveMe.age_range_min,
              effectiveMe.age_range_max
            )}
          />
        </div>

        {/* =================== GOVERNMENT IDS =================== */}
        <h3 className="mt-8 text-lg font-semibold">Verification</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <DetailField
            icon={<FaIdCard />}
            label="NID"
            value={effectiveMe.nid || "—"}
          />
          <DetailField
            icon={<FaIdCard />}
            label="Passport"
            value={effectiveMe.passport || "—"}
          />
        </div>

        {/* =================== MEMBERSHIP =================== */}
        <h3 className="mt-8 text-lg font-semibold">Membership</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <DetailField
            label="Type"
            value={capitalize(membership?.type || "free")}
          />
          <DetailField
            label="Status"
            value={membership?.active ? "Active" : "Inactive"}
          />
          <DetailField
            label="Expires (Status)"
            value={
              membership?.expiry
                ? new Date(membership.expiry).toLocaleDateString()
                : "—"
            }
          />
          <DetailField
            label="Days Left"
            value={
              typeof membership?.days_left === "number"
                ? String(membership.days_left)
                : "—"
            }
          />
          <DetailField
            label="Can Chat"
            value={membership?.can_chat ? "Yes" : "No"}
          />
          <DetailField
            label="Can View Full Profiles"
            value={membership?.can_view_full_profiles ? "Yes" : "No"}
          />
          <DetailField
            label="Message Limit / Day"
            value={String(membership?.message_limit_per_day ?? 0)}
          />
        </div>

        {/* =================== ABOUT / TIMESTAMPS =================== */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="text-xs text-white/60 flex items-center gap-2">
              <FaInfoCircle className="text-rose-300" />
              About Me
            </div>
            <p className="mt-2 text-white/90 whitespace-pre-wrap">
              {effectiveMe.about_me || "—"}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4">
            <div className="text-xs text-white/60 flex items-center gap-2">
              <FaClock className="text-rose-300" />
              Account Timestamps
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm">
              <RowKV
                k="Joined"
                v={
                  effectiveMe.createdAt
                    ? new Date(effectiveMe.createdAt).toLocaleString()
                    : "—"
                }
              />
              <RowKV
                k="Updated"
                v={
                  effectiveMe.updatedAt
                    ? new Date(effectiveMe.updatedAt).toLocaleString()
                    : "—"
                }
              />
            </div>
          </div>
        </div>

        {/* =================== IDS & META (All Remaining) =================== */}
        <h3 className="mt-8 text-lg font-semibold">IDs & Meta</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <DetailField label="User ID" value={effectiveMe._id || "—"} />
          <DetailField
            label="Membership (Object / Id)"
            value={
              effectiveMe.membership
                ? typeof effectiveMe.membership === "object"
                  ? effectiveMe.membership._id || "[populated object]"
                  : String(effectiveMe.membership)
                : "—"
            }
          />
          <DetailField
            label="Membership Expiry (Raw)"
            value={
              effectiveMe.membership_expiry
                ? new Date(effectiveMe.membership_expiry).toLocaleDateString()
                : "—"
            }
          />
        </div>

        {/* =================== RAW JSON (for completeness visibility) =================== */}
        <details className="mt-6 group">
          <summary className="cursor-pointer text-sm text-white/70 hover:text-white/90">
            Raw user JSON (debug)
          </summary>
          <pre className="mt-3 whitespace-pre-wrap text-xs bg-black/30 rounded-xl p-3 border border-white/10">
            {safeStringify(effectiveMe)}
          </pre>
        </details>

        {/* =================== ACTIONS =================== */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/settings/profile"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition"
          >
            Edit profile
          </a>
          <a
            href="/settings/account"
            className="rounded-xl px-4 py-2 text-sm border border-white/15 bg-white/5 hover:bg_WHITE/10 transition"
          >
            Change password
          </a>
        </div>
      </div>
    </section>
  );
}

/* ===================== Photo Gallery ===================== */
function PhotoGallery({ photos, fallback }) {
  const [active, setActive] = useState(0);
  const list = useMemo(
    () => (Array.isArray(photos) && photos.length ? photos : [fallback]),
    [photos, fallback]
  );

  return (
    <div>
      {/* Main image */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border_WHITE/10 bg-neutral-900">
        <img
          src={list[active]}
          alt={`profile-${active}`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = fallback;
          }}
        />
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {list.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-xl border transition ${
                active === i
                  ? "border-rose-300/70"
                  : "border-white/10 hover:border-white/20"
              }`}
              aria-label={`photo ${i + 1}`}
              type="button"
            >
              <img
                src={src}
                alt={`thumb-${i}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = fallback;
                }}
              />
              {active === i && (
                <span className="absolute inset-0 ring-2 ring-rose-300/60 rounded-xl pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===================== Small UI helpers ===================== */

function Chip({ icon, label, tone = "muted" }) {
  const toneClass =
    tone === "ok"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
      : tone === "warn"
      ? "border-amber-300/40 bg-amber-300/10 text-amber-200"
      : "border-white/10 bg-white/5 text-white/80";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs border ${toneClass}`}
    >
      {icon ? <span className="text-current">{icon}</span> : null}
      {label}
    </span>
  );
}

function MiniFact({ icon, value }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-white/85 justify-end md:justify-start">
      <span className="text-rose-300">{icon}</span>
      <span>{value}</span>
    </div>
  );
}

function CardRow({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex items-center gap-3">
      {icon}
      <div className="text-xs text-white/60">{label}</div>
      <div className="ml-auto font-medium">{value}</div>
    </div>
  );
}

function RowKV({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function formatRange(min, max) {
  const a = min != null && min !== "" ? String(min) : null;
  const b = max != null && max !== "" ? String(max) : null;
  if (a && b) return `${a} – ${b}`;
  if (a) return `${a}+`;
  if (b) return `≤ ${b}`;
  return "—";
}

function safeStringify(obj) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj ?? "");
  }
}
