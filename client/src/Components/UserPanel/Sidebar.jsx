// Sidebar.jsx
import React from "react";
import { FaUserFriends, FaUser, FaBell, FaCog, FaSignOutAlt, FaCrown } from "react-icons/fa";
import { FALLBACK_AVATAR } from "./hooks";

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

export default function Sidebar({ name, membership, imgSrc, setImgSrc, active, setActive }) {
  return (
    <>
      {/* user header card */}
      <div className="flex items-center gap-3">
        <div className="relative h-14 w-14 rounded-full overflow-hidden border border-white/10 bg-[#0f172a]">
          <img
            src={imgSrc || FALLBACK_AVATAR}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setImgSrc(FALLBACK_AVATAR)}
          />
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{name || "User"}</p>
          <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px]">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Online
          </div>
        </div>
      </div>

      {/* membership chip */}
      <div className="mt-4 rounded-xl p-[1px] bg-gradient-to-r from-fuchsia-300/40 via-pink-300/40 to-rose-300/40">
        <div className="rounded-xl px-3 py-2 bg-neutral-900/80 border border-white/10 text-sm text-white/90 flex items-center gap-2">
          <FaCrown className="text-rose-300" />
          Membership: <span className="text-rose-300 font-semibold">{membership || "Free (Inactive)"}</span>
        </div>
      </div>

      {/* nav */}
      <nav className="mt-4 space-y-1">
        <SideLink active={active === "overview"}  onClick={() => setActive("overview")}  icon={<FaUserFriends />} label="Overview" />
        <SideLink active={active === "profile"}   onClick={() => setActive("profile")}   icon={<FaUser />}        label="Profile Details" />
        <SideLink active={active === "messaging"} onClick={() => setActive("messaging")} icon={<FaBell />}        label="Inbox (Threads)" />
        <SideLink active={active === "settings"}  onClick={() => setActive("settings")}  icon={<FaCog />}         label="Settings" />
        <div className="pt-2 mt-2 border-t border-white/10" />
        <SideLink
          destructive
          icon={<FaSignOutAlt />}
          label="Logout"
          onClick={() => { localStorage.removeItem("token"); window.location.reload(); }}
        />
      </nav>
    </>
  );
}
