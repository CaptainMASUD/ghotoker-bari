import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaSyncAlt } from "react-icons/fa";

import Sidebar from "./Sidebar";
import TopTabs from "./TopTabs";
import OverviewSection from "./OverviewSection";
import ProfileSection from "./ProfileSection";
import EditProfileSection from "./EditProfileSection";
import InboxSection from "./InboxSection";
import RequestsAccessSection from "./RequestsAccessSection";
import SettingsSection from "./SettingsSection";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const FALLBACK_AVATAR = "https://api.dicebear.com/7.x/initials/svg?seed=User";

const DASHBOARD_PANELS = [
  "overview",
  "profile",
  "requests",
  "messaging",
  "settings",
];

function getStoredToken() {
  try {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken") ||
      ""
    );
  } catch {
    return "";
  }
}

function clearStoredAuth() {
  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
  } catch {
    return null;
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function fetchWithAuth(url, token) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await safeJson(response);

  return { response, result };
}

function extractUser(result) {
  return (
    result?.user ||
    result?.data?.user ||
    result?.data ||
    result?.profile ||
    result?.me ||
    null
  );
}

function cleanText(value) {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getFullName(user) {
  return (
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "User"
  );
}

function getAvatar(user) {
  const photos = Array.isArray(user?.profile_photos)
    ? user.profile_photos.filter(Boolean)
    : [];

  if (photos[0]) return photos[0];

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    getFullName(user)
  )}`;
}

function getMembershipId(user) {
  const statusObject =
    user?.membership_status && typeof user.membership_status === "object"
      ? user.membership_status
      : null;

  if (statusObject?.plan_id) return statusObject.plan_id;

  const membership = user?.membership;

  if (!membership) return "";

  if (typeof membership === "object") {
    return membership?._id || membership?.id || "";
  }

  return membership;
}

function isDateActive(expiry) {
  if (!expiry) return true;

  const expiryDate = new Date(expiry);

  if (Number.isNaN(expiryDate.getTime())) return true;

  return expiryDate.getTime() >= Date.now();
}

function buildMembershipView(user) {
  const rawStatus = user?.membership_status;
  const statusObject =
    rawStatus && typeof rawStatus === "object" ? rawStatus : null;

  const rawMembership = user?.membership;
  const membershipObject =
    rawMembership && typeof rawMembership === "object" ? rawMembership : null;

  const membershipId = getMembershipId(user);

  const status = String(
    statusObject?.status ||
      (typeof rawStatus === "string" ? rawStatus : "") ||
      ""
  ).toLowerCase();

  const slug = statusObject?.slug || membershipObject?.slug || "";
  const isFree =
    Boolean(statusObject?.is_free || membershipObject?.is_free) ||
    slug === "free" ||
    status === "free";

  const expiry =
    statusObject?.expiry ||
    user?.membership_expiry ||
    membershipObject?.membership_expiry ||
    null;

  let active = false;

  if (typeof statusObject?.active === "boolean") {
    active = statusObject.active && isDateActive(expiry);
  } else if (["expired", "cancelled", "canceled", "inactive"].includes(status)) {
    active = false;
  } else if (membershipId) {
    active = isDateActive(expiry);
  }

  const features = statusObject?.features || membershipObject?.features || {};

  return {
    id: membershipId,
    name:
      statusObject?.name ||
      membershipObject?.name ||
      cleanText(slug || status || "Free Plan"),
    slug,
    status: status || (active ? "active" : "inactive"),
    active,
    is_free: isFree,
    is_paid: Boolean(statusObject?.is_paid || (!isFree && active)),
    started_at:
      statusObject?.started_at ||
      user?.membership_started_at ||
      membershipObject?.membership_started_at ||
      null,
    expiry,
    days_left:
      typeof statusObject?.days_left === "number"
        ? statusObject.days_left
        : null,
    features,
    type:
      statusObject?.name ||
      membershipObject?.name ||
      cleanText(slug || status || "Free"),
    can_chat: Boolean(features.can_send_messages),
    can_view_full_profiles: Boolean(
      features.can_view_full_profiles || features.can_view_biodata
    ),
    message_limit_per_day: features.message_limit ?? 0,
  };
}

function normalizeRoutePanel(panel) {
  if (panel === "edit") return "profile";
  if (DASHBOARD_PANELS.includes(panel)) return panel;
  return "overview";
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { panel } = useParams();

  const token = getStoredToken();
  const isEditProfile = panel === "edit";

  const [active, setActive] = useState(() => normalizeRoutePanel(panel));
  const [mobileOpen, setMobileOpen] = useState(false);

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [threads] = useState([]);
  const [loadingThreads] = useState(false);

  const [sidebarImgSrc, setSidebarImgSrc] = useState(FALLBACK_AVATAR);

  const loadMe = async () => {
    if (!token) {
      setMe(null);
      setLoadingMe(false);
      setProfileError("Login required.");
      return;
    }

    try {
      setLoadingMe(true);
      setProfileError("");

      const { response, result } = await fetchWithAuth(
        `${API_BASE_URL}/api/user/me`,
        token
      );

      if (!response.ok) {
        throw new Error(result?.message || "Could not load user profile.");
      }

      const user = extractUser(result);

      if (!user) {
        throw new Error("User data was not returned from the server.");
      }

      setMe(user);
      setSidebarImgSrc(getAvatar(user));
    } catch (error) {
      setMe(null);
      setProfileError(error?.message || "Could not load user profile.");
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    setActive(normalizeRoutePanel(panel));
  }, [panel]);

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const membership = useMemo(() => buildMembershipView(me), [me]);

  const userCard = useMemo(() => {
    return {
      name: getFullName(me),
      avatar: getAvatar(me),
      membership: `${membership.name || "Free Plan"} • ${
        membership.active ? "Active" : "Inactive"
      }`,
    };
  }, [me, membership]);

  useEffect(() => {
    setSidebarImgSrc(userCard.avatar || FALLBACK_AVATAR);
  }, [userCard.avatar]);

  const completeness = Number(me?.profile_completeness || 0);

  const handleTabChange = (key) => {
    setActive(key);
    setMobileOpen(false);

    if (key === "overview") {
      navigate("/profile");
      return;
    }

    navigate(`/profile/${key}`);
  };

  const handleProfileUpdated = (updatedUser) => {
    if (!updatedUser) return;

    setMe(updatedUser);
    setSidebarImgSrc(getAvatar(updatedUser));
  };

  const content = isEditProfile ? (
    <EditProfileSection
      effectiveMe={me}
      membership={membership}
      completeness={completeness}
      loadingMe={loadingMe}
      onProfileUpdated={handleProfileUpdated}
      onBack={() => navigate("/profile/profile")}
    />
  ) : active === "overview" ? (
    <OverviewSection />
  ) : active === "profile" ? (
    <ProfileSection
      effectiveMe={me}
      membership={membership}
      completeness={completeness}
      loadingMe={loadingMe}
    />
  ) : active === "requests" ? (
    <RequestsAccessSection />
  ) : active === "messaging" ? (
    <InboxSection
      threads={threads}
      loadingThreads={loadingThreads}
      token={token}
    />
  ) : (
    <SettingsSection />
  );

  return (
    <div className="min-h-screen bg-[#f8f3ef] text-slate-800">
      <MobileToggle open={mobileOpen} setOpen={setMobileOpen} />

      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
      />

      <MobileDrawer open={mobileOpen} setOpen={setMobileOpen}>
        <Sidebar
          name={userCard.name}
          membership={userCard.membership}
          imgSrc={sidebarImgSrc}
          setImgSrc={setSidebarImgSrc}
          active={active}
          setActive={handleTabChange}
          onLogout={() => {
            clearStoredAuth();
            window.location.href = "/login";
          }}
        />
      </MobileDrawer>

      <div className="mx-auto max-w-[1500px] px-4 py-6 pt-20 sm:px-6 lg:px-8 lg:py-10 lg:pt-24">
        <div className="mb-6 rounded-[1.8rem] border border-white bg-white p-5 shadow-xl shadow-rose-100/60 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-rose-600">
                Account Dashboard
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                User Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage your profile, membership, requests, and account from one
                place.
              </p>

              {profileError ? (
                <p className="mt-2 text-sm font-medium text-rose-600">
                  {profileError}
                </p>
              ) : null}
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
              <TopTabs active={active} setActive={handleTabChange} />

              <button
                type="button"
                onClick={loadMe}
                disabled={loadingMe}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaSyncAlt
                  className={`text-xs ${loadingMe ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[292px_minmax(0,1fr)]">
          <aside className="hidden lg:block sticky top-24 h-fit">
            <div className="rounded-[1.7rem] bg-slate-100 p-3 shadow-sm ring-1 ring-slate-200">
              <Sidebar
                name={userCard.name}
                membership={userCard.membership}
                imgSrc={sidebarImgSrc}
                setImgSrc={setSidebarImgSrc}
                active={active}
                setActive={handleTabChange}
                onLogout={() => {
                  clearStoredAuth();
                  window.location.href = "/login";
                }}
              />
            </div>
          </aside>

          <main className="min-w-0">
            <div className="overflow-hidden rounded-[1.8rem] bg-white p-3 shadow-xl shadow-rose-100/60 ring-1 ring-white sm:p-4 md:p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isEditProfile ? "edit-profile" : active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function MobileToggle({ open, setOpen }) {
  if (open) return null;

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Open sidebar"
      aria-controls="dashboard-mobile-sidebar"
      className="fixed left-3 top-20 z-[70] inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-lg shadow-rose-100 ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600 lg:hidden"
    >
      <FaChevronRight />
    </button>
  );
}

function MobileDrawer({ open, setOpen, children }) {
  return (
    <aside
      id="dashboard-mobile-sidebar"
      className={`fixed left-0 top-0 z-[65] h-dvh w-[82vw] max-w-[310px] transform transition-transform duration-300 lg:hidden ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <div className="h-full bg-slate-100 p-3 shadow-2xl ring-1 ring-slate-200">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
          className="absolute -right-4 top-20 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <FaChevronLeft />
        </button>

        <div className="h-full overflow-y-auto pr-1">{children}</div>
      </div>
    </aside>
  );
}