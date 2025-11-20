// UserDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

import Sidebar from "./Sidebar";
import TopTabs from "./TopTabs";
import OverviewSection from "./OverviewSection";
import ProfileSection from "./ProfileSection";
import InboxSection from "./InboxSection";
import SettingsSection from "./SettingsSection";

import {
  API, useAuthAndIdentity, buildUserCardFrom, FALLBACK_AVATAR, resolvePeerName
} from "./hooks";

export default function UserDashboard() {
  const { token, myId, myName, userObj, authHeaders } = useAuthAndIdentity();

  const [active, setActive] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [threads, setThreads] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);

  const [sidebarImgSrc, setSidebarImgSrc] = useState(FALLBACK_AVATAR);

  // shadow user (instant UI)
  const shadowMe = useMemo(
    () => ({
      username: userObj?.username || myName,
      first_name: userObj?.first_name || null,
      last_name: userObj?.last_name || null,
      profile_photos: userObj?.profile_photos || [],
      current_city: userObj?.current_city || null,
      gender: userObj?.gender || null,
      highest_education: userObj?.highest_education || null,
      profession: userObj?.profession || null,
      createdAt: userObj?.createdAt || null,
      dob: userObj?.dob || null,
      membership_status: { type: "free", active: false, days_left: 0, can_chat: false, can_view_full_profiles: false, message_limit_per_day: 0 },
      profile_completeness: 0,
    }),
    [userObj, myName]
  );

  // Load my profile
  useEffect(() => {
    (async () => {
      try {
        setLoadingMe(true);

        if (token) {
          const r = await fetch(`${API}/api/user/me`, { headers: authHeaders });
          if (!r.ok) throw new Error("failed /me");
          const d = await r.json();
          setMe(d.user || null);
        } else if (myId) {
          const r = await fetch(`${API}/api/user/${myId}/profile`, { headers: authHeaders });
          if (r.ok) {
            const d = await r.json();
            setMe({ ...shadowMe, ...d, membership_status: shadowMe.membership_status });
          } else {
            setMe(shadowMe);
          }
        } else {
          setMe(shadowMe);
        }
      } catch {
        setMe(shadowMe);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, [token, myId, authHeaders, shadowMe]);

  // Load threads (protected endpoints)
  useEffect(() => {
    (async () => {
      if (!token) { setThreads([]); setLoadingThreads(false); return; }
      try {
        setLoadingThreads(true);
        const res = await fetch(`${API}/api/messages/threads`, { headers: authHeaders });
        const json = await res.json();
        const raw = Array.isArray(json?.threads) ? json.threads : [];
        const enriched = await Promise.all(
          raw.map(async (t) => {
            const peerId = t._id;
            const name = await resolvePeerName(peerId, token);
            return {
              peerId,
              name,
              lastMessage: t.lastMessage?.content || "",
              lastAt: t.lastMessage?.createdAt || null,
              unread: t.unreadCount || 0,
            };
          })
        );
        enriched.sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
        setThreads(enriched);
      } catch {
        setThreads([]);
      } finally {
        setLoadingThreads(false);
      }
    })();
  }, [token, authHeaders]);

  const effectiveMe = me || shadowMe;
  const membership = effectiveMe?.membership_status || { type: "free", active: false, days_left: 0 };
  const completeness = effectiveMe?.profile_completeness ?? 0;

  const userCard = buildUserCardFrom(effectiveMe, myName);
  useEffect(() => {
    if (userCard?.avatar) setSidebarImgSrc(userCard.avatar);
    else setSidebarImgSrc(FALLBACK_AVATAR);
  }, [userCard?.avatar]);

  // esc to close mobile drawer
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const content =
    active === "overview" ? (
      <OverviewSection
        membership={membership}
        completeness={completeness}
        loadingMe={loadingMe}
        threads={threads}
        loadingThreads={loadingThreads}
        token={token}
        effectiveMe={effectiveMe}
      />
    ) : active === "profile" ? (
      <ProfileSection
        effectiveMe={effectiveMe}
        membership={membership}
        completeness={completeness}
        loadingMe={loadingMe}
      />
    ) : active === "messaging" ? (
      <InboxSection threads={threads} loadingThreads={loadingThreads} token={token} />
    ) : (
      <SettingsSection />
    );

  return (
    <div className="min-h-screen bg-[#0b0a12] text-white relative">
      {/* halo */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(244,114,182,0.10),transparent_60%)]" />

      {/* mobile toggle */}
      <MobileToggle open={mobileOpen} setOpen={setMobileOpen} />

      {/* overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!mobileOpen}
      />

      {/* drawer */}
      <MobileDrawer open={mobileOpen} setOpen={setMobileOpen}>
        <Sidebar
          name={userCard.name}
          membership={userCard.membership}
          imgSrc={sidebarImgSrc}
          setImgSrc={setSidebarImgSrc}
          active={active}
          setActive={(k) => { setActive(k); setMobileOpen(false); }}
        />
      </MobileDrawer>

      {/* page */}
      <div className="mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* header */}
        <div className="flex items-center justify-between mb-6 mt-14">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Users Dashboard
            </span>
          </h1>
          <TopTabs active={active} setActive={setActive} />
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
          {/* left */}
          <aside className="hidden lg:block sticky top-20 h-fit">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
              <Sidebar
                name={userCard.name}
                membership={userCard.membership}
                imgSrc={sidebarImgSrc}
                setImgSrc={setSidebarImgSrc}
                active={active}
                setActive={setActive}
              />
            </div>
          </aside>

          {/* right */}
          <main className="min-w-0 space-y-6">{content}</main>
        </div>
      </div>
    </div>
  );
}

/* ------------------ small local pieces for layout ------------------ */
function MobileToggle({ open, setOpen }) {
  return !open ? (
    <button
      onClick={() => setOpen(true)}
      aria-label="Open sidebar"
      aria-controls="dashboard-mobile-sidebar"
      className="lg:hidden fixed left-3 top-14 z-[70] inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/10 backdrop-blur hover:bg-white/15 transition"
    >
      <FaChevronRight />
    </button>
  ) : null;
}

function MobileDrawer({ open, setOpen, children }) {
  return (
    <aside
      id="dashboard-mobile-sidebar"
      className={`lg:hidden fixed top-0 left-0 z-[65] h-dvh w-[82vw] max-w-[320px] transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
      aria-hidden={!open}
    >
      <div className="h-full rounded-r-2xl p-[1px] bg-gradient-to-b from-fuchsia-300/35 via-pink-300/35 to-rose-300/35">
        <div className="h-full rounded-r-2xl border border-white/10 bg-white/5 backdrop-blur p-4 relative">
          <button
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            className="absolute -right-4 top-14 inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/10 backdrop-blur hover:bg-white/15 transition"
          >
            <FaChevronLeft />
          </button>
          {children}
        </div>
      </div>
    </aside>
  );
}
