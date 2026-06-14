import React, { useEffect, useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaCommentDots,
  FaEnvelope,
  FaExclamationCircle,
  FaEye,
  FaHome,
  FaImage,
  FaLock,
  FaLockOpen,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaSave,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken") ||
    ""
  );
}

function extractUser(data) {
  return (
    data?.user ||
    data?.data?.user ||
    data?.data ||
    data?.profile ||
    data?.me ||
    null
  );
}

function getPrivacy(user) {
  const privacy = user?.privacy || {};

  return {
    show_phone: Boolean(privacy.show_phone),
    show_email: Boolean(privacy.show_email),
    show_address: Boolean(privacy.show_address),
    show_income: Boolean(privacy.show_income),
    show_family_details: Boolean(privacy.show_family_details),
    allow_profile_view: privacy.allow_profile_view === false ? false : true,
    allow_messages: privacy.allow_messages === false ? false : true,
  };
}

function getPhotoVisibility(user) {
  return user?.profile_photo_visibility || "members_only";
}

export default function PrivacySettingsSection({
  effectiveMe,
  loadingMe = false,
  onPrivacyUpdated,
}) {
  const [localUser, setLocalUser] = useState(effectiveMe || null);
  const [fetching, setFetching] = useState(!effectiveMe);
  const [saving, setSaving] = useState(false);

  const [privacy, setPrivacy] = useState(() => getPrivacy(effectiveMe));
  const [profilePhotoVisibility, setProfilePhotoVisibility] = useState(() =>
    getPhotoVisibility(effectiveMe)
  );

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!effectiveMe) return;

    setLocalUser(effectiveMe);
    setPrivacy(getPrivacy(effectiveMe));
    setProfilePhotoVisibility(getPhotoVisibility(effectiveMe));
    setFetching(false);
  }, [effectiveMe]);

  useEffect(() => {
    if (effectiveMe) return;

    let ignore = false;

    async function fetchMe() {
      try {
        setFetching(true);
        setError("");

        const token = getToken();

        const res = await fetch(`${API_BASE_URL}/api/user/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load privacy settings.");
        }

        const user = extractUser(data);

        if (!ignore) {
          setLocalUser(user);
          setPrivacy(getPrivacy(user));
          setProfilePhotoVisibility(getPhotoVisibility(user));
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Could not load privacy settings.");
        }
      } finally {
        if (!ignore) {
          setFetching(false);
        }
      }
    }

    fetchMe();

    return () => {
      ignore = true;
    };
  }, [effectiveMe]);

  const activeCount = useMemo(() => {
    return Object.values(privacy).filter(Boolean).length;
  }, [privacy]);

  const privacyStatus = privacy.allow_profile_view ? "Visible" : "Hidden";

  function updatePrivacy(key, value) {
    setPrivacy((prev) => ({
      ...prev,
      [key]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      const res = await fetch(`${API_BASE_URL}/api/user/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          privacy,
          profile_photo_visibility: profilePhotoVisibility,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update privacy settings.");
      }

      const updatedUser = extractUser(data);

      setLocalUser(updatedUser);
      setPrivacy(getPrivacy(updatedUser));
      setProfilePhotoVisibility(getPhotoVisibility(updatedUser));
      onPrivacyUpdated?.(updatedUser);

      setSuccess("Privacy settings updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update privacy settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingMe || fetching) {
    return (
      <section className="space-y-5">
        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-7 w-52 animate-pulse rounded-xl bg-slate-100" />

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-[#fbf7f4] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium tracking-wide text-rose-600">
                Privacy
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Manage profile visibility
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Choose what information members can see and how they can contact
                you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:w-auto">
              <MiniStat
                icon={<FaUserShield />}
                label="Enabled"
                value={`${activeCount}/7`}
              />

              <MiniStat
                icon={privacy.allow_profile_view ? <FaLockOpen /> : <FaLock />}
                label="Profile"
                value={privacyStatus}
              />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {error ? (
            <AlertBox
              type="error"
              icon={<FaExclamationCircle />}
              message={error}
            />
          ) : null}

          {success ? (
            <AlertBox
              type="success"
              icon={<FaCheckCircle />}
              message={success}
            />
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <PrivacyCard
              icon={<FaPhoneAlt />}
              title="Phone number"
              description="Show your phone number to permitted members."
              checked={privacy.show_phone}
              onChange={(value) => updatePrivacy("show_phone", value)}
            />

            <PrivacyCard
              icon={<FaEnvelope />}
              title="Email address"
              description="Show your email address on your profile."
              checked={privacy.show_email}
              onChange={(value) => updatePrivacy("show_email", value)}
            />

            <PrivacyCard
              icon={<FaMapMarkerAlt />}
              title="Address details"
              description="Show your address or location information."
              checked={privacy.show_address}
              onChange={(value) => updatePrivacy("show_address", value)}
            />

            <PrivacyCard
              icon={<FaMoneyBillWave />}
              title="Income details"
              description="Show your income details in your biodata."
              checked={privacy.show_income}
              onChange={(value) => updatePrivacy("show_income", value)}
            />

            <PrivacyCard
              icon={<FaHome />}
              title="Family details"
              description="Show family background information."
              checked={privacy.show_family_details}
              onChange={(value) => updatePrivacy("show_family_details", value)}
            />

            <PrivacyCard
              icon={<FaEye />}
              title="Profile visibility"
              description="Allow members to open and view your profile."
              checked={privacy.allow_profile_view}
              onChange={(value) => updatePrivacy("allow_profile_view", value)}
            />

            <PrivacyCard
              icon={<FaCommentDots />}
              title="Messages"
              description="Allow eligible members to send you messages."
              checked={privacy.allow_messages}
              onChange={(value) => updatePrivacy("allow_messages", value)}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <FaImage />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Profile photo visibility
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Select who can see your profile photos.
                  </p>
                </div>
              </div>

              <select
                value={profilePhotoVisibility}
                onChange={(event) => {
                  setProfilePhotoVisibility(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-50 lg:w-[260px]"
              >
                <option value="members_only">Members only</option>
                <option value="premium_only">Premium only</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <FaShieldAlt />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Visibility reminder
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Your profile may still follow membership and verification
                  rules for safety.
                </p>
              </div>
            </div>
          </div>

          <div className="sticky bottom-4 z-20 mt-6 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/70 backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-500">
                Save your changes to apply the selected privacy options.
              </p>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSave />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrivacyCard({ icon, title, description, checked, onChange }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        checked
          ? "border-rose-200 bg-rose-50/60"
          : "border-slate-200 bg-white hover:border-rose-100 hover:bg-rose-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition ${
            checked ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {icon}
        </div>

        <button
          type="button"
          onClick={() => onChange(!checked)}
          className={`relative h-7 w-12 shrink-0 rounded-full transition ${
            checked ? "bg-rose-600" : "bg-slate-300"
          }`}
          aria-label={title}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
              checked ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>

      <p className="mt-1 min-h-[42px] text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div
        className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
          checked
            ? "bg-white text-rose-600 ring-1 ring-rose-100"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {checked ? "On" : "Off"}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-slate-400">
        <span className="text-rose-600">{icon}</span>
        {label}
      </div>

      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function AlertBox({ icon, message, type }) {
  const isSuccess = type === "success";

  return (
    <div
      className={`mb-5 flex items-start gap-3 rounded-2xl border px-4 py-3 ${
        isSuccess
          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
          : "border-rose-100 bg-rose-50 text-rose-700"
      }`}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <p className="text-sm font-medium leading-6">{message}</p>
    </div>
  );
}