import React, { useEffect, useState } from "react";
import {
  FaBell,
  FaUser,
  FaHeart,
  FaUserFriends,
  FaEye,
  FaRegBookmark,
  FaCog,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaGraduationCap,
  FaTransgender,
  FaCalendarAlt,
  FaChevronRight,
  FaChevronLeft,
} from "react-icons/fa";

/**
 * User Profile Dashboard
 * - Sidebar on LEFT for lg+ screens
 * - Mobile: off-canvas sliding sidebar with arrow toggler
 * - Brand: fuchsia → pink → rose
 * - Messaging = notifications only (no chat UI)
 */
export default function UserDashboard() {
  const [active, setActive] = useState("overview"); // overview | profile | messaging | settings
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer with ESC
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Demo user & metrics
  const user = {
    name: "Ayesha Rahman",
    membership: "Premium",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    location: "Dhaka, Bangladesh",
    age: 27,
    gender: "Female",
    profession: "Software Engineer",
    education: "Masters",
    joined: "Feb 2025",
  };

  const metrics = [
    { key: "matches", label: "Matches", value: 32, icon: <FaUserFriends />, hint: "+6 this week" },
    { key: "views", label: "Profile Views", value: 128, icon: <FaEye />, hint: "+24 this week" },
    { key: "likes", label: "Likes", value: 57, icon: <FaHeart />, hint: "+9 this week" },
    { key: "saved", label: "Shortlists", value: 14, icon: <FaRegBookmark />, hint: "Top 5 visible" },
  ];

  const notifications = [
    { id: 1, type: "message", title: "New message from Rahim", preview: "Hi Ayesha, would you like to connect this week?", time: "2m ago", status: "unread" },
    { id: 2, type: "match",   title: "New match suggestion",   preview: "We found a highly compatible profile (92%) in Dhaka.", time: "1h ago", status: "unread" },
    { id: 3, type: "system",  title: "Verification approved",   preview: "Your ID & photo verification are now live.", time: "Yesterday", status: "read" },
    { id: 4, type: "message", title: "Message request from Imran", preview: "Hi! Our families are in Dhaka too — open to chat?", time: "2d ago", status: "read" },
  ];

  return (
    <div className="min-h-screen bg-[#0b0a12] text-white relative">
      {/* Top gradient halo */}
      <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(244,114,182,0.10),transparent_60%)]" />

      {/* MOBILE: floating arrow toggler (only < lg) */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
          aria-controls="dashboard-mobile-sidebar"
          className="lg:hidden fixed left-3 top-14 z-[70] inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/10 backdrop-blur hover:bg-white/15 transition"
        >
          <FaChevronRight />
        </button>
      )}

      {/* MOBILE: Off-canvas sidebar */}
      {/* Backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        aria-hidden={!mobileOpen}
      />
      {/* Drawer */}
      <aside
        id="dashboard-mobile-sidebar"
        className={`lg:hidden fixed top-0 left-0 z-[65] h-dvh w-[82vw] max-w-[320px] transform transition-transform duration-300
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!mobileOpen}
      >
        <div className="h-full rounded-r-2xl p-[1px] bg-gradient-to-b from-fuchsia-300/35 via-pink-300/35 to-rose-300/35">
          <div className="h-full rounded-r-2xl border border-white/10 bg-white/5 backdrop-blur p-4 relative">
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
              className="absolute -right-4 top-14 inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/10 backdrop-blur hover:bg-white/15 transition"
            >
              <FaChevronLeft />
            </button>

            {/* Sidebar content (shared) */}
            <SidebarInner
              user={user}
              active={active}
              setActive={(key) => {
                setActive(key);
                setMobileOpen(false);
              }}
            />
          </div>
        </div>
      </aside>

      {/* DESKTOP/TABLET layout */}
      <div className=" mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 mt-14">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-300  via-pink-300 to-rose-300 bg-clip-text text-transparent">
             Users Dashboard
            </span>
          </h1>

          {/* Mid-size tabs (optional) */}
          <div className="hidden md:flex lg:hidden gap-2">
            {["overview", "profile", "messaging", "settings"].map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className={`px-3 py-2 text-sm rounded-xl border transition
                  ${active === key ? "border-rose-300/70 text-rose-300" : "border-white/10 text-white/80 hover:bg-white/5"}`}
              >
                {capitalize(key)}
              </button>
            ))}
          </div>
        </div>

        {/* IMPORTANT: two-column grid from lg and up */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
          {/* Left column (sidebar) — visible on lg+ */}
          <aside className="hidden lg:block sticky top-20 h-fit">
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-4">
              <SidebarInner user={user} active={active} setActive={setActive} />
            </div>
          </aside>

          {/* Right column (content) */}
          <main className="min-w-0 space-y-6">
            {active === "overview" && (
              <section className="space-y-6">
                {/* Stats */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {metrics.map((m) => (
                    <StatCard key={m.key} label={m.label} value={m.value} hint={m.hint} icon={m.icon} />
                  ))}
                </div>

                {/* Two-up: profile summary + notifications peek */}
                <div className="grid lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                    <h3 className="text-lg font-semibold">Quick Profile</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <InfoRow icon={<FaMapMarkerAlt className="text-rose-300" />} label="Location" value={user.location} />
                      <InfoRow icon={<FaCalendarAlt className="text-rose-300" />} label="Joined" value={user.joined} />
                      <InfoRow icon={<FaTransgender className="text-rose-300" />} label="Gender" value={user.gender} />
                      <InfoRow icon={<FaUser className="text-rose-300" />} label="Age" value={`${user.age}`} />
                      <InfoRow icon={<FaBriefcase className="text-rose-300" />} label="Profession" value={user.profession} />
                      <InfoRow icon={<FaGraduationCap className="text-rose-300" />} label="Education" value={user.education} />
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition">
                        Edit profile
                      </button>
                      <button className="rounded-xl px-4 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition">
                        Manage privacy
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                    <h3 className="text-lg font-semibold">Recent Notifications</h3>
                    <div className="mt-3 space-y-3">
                      {notifications.slice(0, 3).map((n) => (
                        <Notification key={n.id} item={n} />
                      ))}
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setActive("messaging")}
                        className="text-sm text-rose-300 underline underline-offset-4 hover:text-rose-200"
                      >
                        View all
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {active === "profile" && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                  <h3 className="text-lg font-semibold">Profile Details</h3>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <DetailField label="Full Name" value={user.name} />
                    <DetailField label="Membership" value={user.membership} />
                    <DetailField label="Location" value={user.location} />
                    <DetailField label="Age" value={`${user.age}`} />
                    <DetailField label="Gender" value={user.gender} />
                    <DetailField label="Profession" value={user.profession} />
                    <DetailField label="Education" value={user.education} />
                    <DetailField label="Joined" value={user.joined} />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition">
                      Save changes
                    </button>
                    <button className="rounded-xl px-4 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition">
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                  <h3 className="text-lg font-semibold">Preferences</h3>
                  <p className="mt-2 text-sm text-white/70">
                    Add your partner preferences to improve match quality. (UI placeholder)
                  </p>
                  <div className="mt-4 grid md:grid-cols-3 gap-3">
                    <PrefChip label="Age range: 25–32" />
                    <PrefChip label="Location: Dhaka" />
                    <PrefChip label="Education: Bachelors+" />
                  </div>
                </div>
              </section>
            )}

            {active === "messaging" && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Messaging — Notifications</h3>
                    <button
                      onClick={() => alert("Mark all as read")}
                      className="text-sm rounded-xl px-3 py-1.5 border border-white/15 bg-white/5 hover:bg-white/10 transition"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {notifications.map((n) => (
                      <Notification key={n.id} item={n} />
                    ))}
                  </div>

                  <p className="mt-4 text-sm text-white/60">
                    This panel shows message alerts and requests only. Open messages are handled in your inbox
                    (chat UI intentionally omitted).
                  </p>
                </div>
              </section>
            )}

            {active === "settings" && (
              <section className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
                  <h3 className="text-lg font-semibold">Settings</h3>
                  <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <ToggleRow label="Email notifications" defaultChecked />
                    <ToggleRow label="WhatsApp notifications" />
                    <ToggleRow label="Profile visibility" defaultChecked />
                    <ToggleRow label="Show online status" defaultChecked />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition">
                      Save settings
                    </button>
                    <button className="rounded-xl px-4 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition">
                      Reset
                    </button>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sidebar Inner (shared for mobile & desktop) ---------------- */

function SidebarInner({ user, active, setActive }) {
  return (
    <>
      {/* User card */}
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 rounded-full overflow-hidden border border-white/10">
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{user.name}</p>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Online
          </div>
        </div>
      </div>

      {/* Membership chip */}
      <div className="mt-4 rounded-xl p-[1px] bg-gradient-to-r from-fuchsia-300/40 via-pink-300/40 to-rose-300/40">
        <div className="rounded-xl px-3 py-2 bg-neutral-900/80 border border-white/10 text-sm text-white/90">
          Membership: <span className="text-rose-300 font-semibold">{user.membership}</span>
        </div>
      </div>

      {/* Nav list */}
      <nav className="mt-4 space-y-1">
        <SideLink active={active === "overview"}  onClick={() => setActive("overview")}  icon={<FaUserFriends />} label="Overview" />
        <SideLink active={active === "profile"}   onClick={() => setActive("profile")}   icon={<FaUser />}        label="Profile Details" />
        <SideLink active={active === "messaging"} onClick={() => setActive("messaging")} icon={<FaBell />}        label="Messaging (Notifications)" />
        <SideLink active={active === "settings"}  onClick={() => setActive("settings")}  icon={<FaCog />}         label="Settings" />
        <div className="pt-2 mt-2 border-t border-white/10" />
        <SideLink destructive icon={<FaSignOutAlt />} label="Logout" onClick={() => alert("Handle logout…")} />
      </nav>
    </>
  );
}

/* ------------------------ Reusable bits ------------------------ */

function SideLink({ active, label, icon, onClick, destructive = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition
        ${destructive ? "text-red-300 hover:bg-red-400/10" : "text-white/85 hover:bg-white/5"}
        ${active ? "border border-rose-300/60 text-rose-300" : "border border-transparent"}`}
      aria-current={active ? "page" : undefined}
    >
      <span className={`${destructive ? "" : "text-rose-300"}`}>{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
      <div className="flex items-center justify-between">
        <div className="text-rose-300 text-xl">{icon}</div>
        <span className="text-xs text-white/60">{hint}</span>
      </div>
      <div className="mt-3 text-3xl font-extrabold">{value}</div>
      <div className="text-sm text-white/75">{label}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-white/70">{label}:</span>
      <span className="font-medium text-white/90 truncate">{value}</span>
    </div>
  );
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

function PrefChip({ label }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/85">
      {label}
    </span>
  );
}

function Notification({ item }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      {/* Dot */}
      <div className="mt-1">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            item.status === "unread" ? "bg-rose-300" : "bg-white/30"
          }`}
          aria-hidden
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold truncate">{item.title}</p>
          <span className="text-xs text-white/60 shrink-0 ml-3">{item.time}</span>
        </div>
        <p className="text-sm text-white/75 mt-0.5 line-clamp-2">{item.preview}</p>

        <div className="mt-3 flex flex-wrap gap-3">
          <button className="rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition">
            View
          </button>
          <button className="rounded-xl px-3 py-1.5 text-xs border border-white/15 bg-white/5 hover:bg-white/10 transition">
            Mark read
          </button>
          <span className="rounded-xl px-3 py-1.5 text-xs border border-white/10 bg-white/[0.03]">
            Type: <span className="text-white/80 ml-1">{capitalize(item.type)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, defaultChecked = false }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-rose-300 h-4 w-4 cursor-pointer" />
    </label>
  );
}

/* ------------------------ Utils ------------------------ */
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
