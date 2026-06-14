import React from "react";
import {
  FaBell,
  FaCog,
  FaCrown,
  FaHandshake,
  FaSignOutAlt,
  FaUser,
  FaUserFriends,
} from "react-icons/fa";
import { FALLBACK_AVATAR } from "./hooks";

function SideLink({ active, label, icon, onClick, destructive = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-xl px-2.5 py-2 text-left transition-all duration-300 ease-out ${
        destructive
          ? "text-rose-600 hover:bg-rose-50"
          : active
          ? "bg-white text-rose-600 shadow-sm ring-1 ring-rose-100"
          : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {active && !destructive ? (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-rose-600" />
      ) : null}

      <span className="flex items-center gap-2.5">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] transition-all duration-300 ${
            destructive
              ? "bg-rose-50 text-rose-600 group-hover:bg-rose-100"
              : active
              ? "bg-rose-50 text-rose-600"
              : "bg-slate-200/70 text-slate-500 group-hover:bg-rose-50 group-hover:text-rose-600"
          }`}
        >
          {icon}
        </span>

        <span className="truncate text-[13px] font-semibold leading-none">
          {label}
        </span>
      </span>
    </button>
  );
}

export default function Sidebar({
  name,
  membership,
  imgSrc,
  setImgSrc,
  active,
  setActive,
  onLogout,
}) {
  const handleLogout = () => {
    if (typeof onLogout === "function") {
      onLogout();
      return;
    }

    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="h-full">
      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <img
              src={imgSrc || FALLBACK_AVATAR}
              alt={name || "User"}
              className="h-full w-full object-cover"
              onError={() => setImgSrc(FALLBACK_AVATAR)}
            />

            <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {name || "User"}
            </p>

            <div className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <FaCrown className="text-sm" />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
              Membership
            </p>
            <p className="truncate text-xs font-bold text-slate-900">
              {membership || "Free Plan • Active"}
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-4 space-y-1.5">
        <SideLink
          active={active === "overview"}
          onClick={() => setActive("overview")}
          icon={<FaUserFriends />}
          label="Overview"
        />

        <SideLink
          active={active === "profile"}
          onClick={() => setActive("profile")}
          icon={<FaUser />}
          label="Profile Details"
        />

        <SideLink
          active={active === "requests"}
          onClick={() => setActive("requests")}
          icon={<FaHandshake />}
          label="Requests & Access"
        />

        <SideLink
          active={active === "messaging"}
          onClick={() => setActive("messaging")}
          icon={<FaBell />}
          label="Inbox"
        />

        <SideLink
          active={active === "settings"}
          onClick={() => setActive("settings")}
          icon={<FaCog />}
          label="Settings"
        />

        <div className="py-1.5">
          <div className="h-px bg-slate-200" />
        </div>

        <SideLink
          destructive
          icon={<FaSignOutAlt />}
          label="Logout"
          onClick={handleLogout}
        />
      </nav>
    </div>
  );
}