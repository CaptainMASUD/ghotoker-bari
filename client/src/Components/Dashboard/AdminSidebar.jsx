"use client";

import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "../../Redux/UserSlice/UserSlice";
import logo from "../../Logo/logo.svg";

export default function AdminSidebar({
  items = [],
  activeTab,
  onChange,
  user,
}) {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="ঘটকদের বাড়ি"
            className="h-11 w-11 rounded-2xl object-contain"
          />

          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950">
              ঘটকদের বাড়ি
            </h2>
            <p className="truncate text-[11px] font-medium text-slate-500">
              Super Admin Panel
            </p>
          </div>
        </div>
      </div>

      <div className="p-3">
        <div className="rounded-2xl bg-[#f8f3ef] p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-slate-900">
                {user?.full_name ||
                  `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                  "Super Admin"}
              </p>
              <p className="truncate text-[11px] font-semibold capitalize text-rose-600">
                {user?.role || "superadmin"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition ${
                active
                  ? "bg-rose-600 text-white shadow-md shadow-rose-100"
                  : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-rose-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>

              <span className="min-w-0 flex-1 truncate">
                {item.shortLabel}
              </span>

              <ChevronRight
                className={`h-3.5 w-3.5 shrink-0 transition ${
                  active
                    ? "text-white"
                    : "text-slate-300 group-hover:text-rose-500"
                }`}
              />
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <Link
          to="/"
          className="mb-2 flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Website
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-[13px] font-bold text-white transition hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}