"use client";

import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  CheckCircle,
  CreditCard,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";
import Dashboard from "./Dashboard";
import UsersPage from "./Users";
import Approvals from "./Approvals";
import Memberships from "./Memberships";
import SettingsPage from "./Settings";

// Helper: read token
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

// Fetch self admin profile
async function fetchAdminMe(token) {
  const res = await fetch("https://ghotoker-bari-api.vercel.app/api/admin/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("unauthorized");
  return res.json(); // { admin: {...} }
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "approvals", label: "Approvals", icon: CheckCircle },
  { id: "memberships", label: "Memberships", icon: CreditCard },
  { id: "settings", label: "Settings", icon: Settings },
];

const Sidebar = ({ activeSection, setActiveSection, sidebarOpen, setSidebarOpen, onLogout, admin }) => {
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw] 
        bg-slate-900/70 backdrop-blur-xl border-r border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Admin navigation"
      >
        {/* Brand */}
        <div className="relative p-5 border-b border-white/10">
          <div className="absolute -inset-x-2 -top-2 h-16 bg-[radial-gradient(90%_80%_at_20%_10%,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0)_60%)] rounded-b-3xl pointer-events-none" />
          <div className="flex items-center justify-between relative">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-semibold tracking-tight">Admin Console</h2>
                <p className="text-white/50 text-xs">Secure control center</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Admin mini card */}
        <div className="px-5 pt-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-white/70 text-xs">Signed in as</p>
            <p className="text-white font-medium truncate">{admin?.username || admin?.email || "Admin"}</p>
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified access
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-5 px-3">
          <ul className="space-y-1.5">
            {navItems.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => {
                      setActiveSection(id);
                      setSidebarOpen(false);
                    }}
                    className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all
                    ${
                      isActive
                        ? "bg-white text-slate-900 shadow-lg"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {/* Active indicator bar */}
                    <span
                      className={`absolute left-0 top-0 h-full w-1 rounded-r-lg transition-opacity ${
                        isActive ? "bg-emerald-400 opacity-100" : "opacity-0 group-hover:opacity-60 bg-white/40"
                      }`}
                    />

                    <Icon className={`h-5 w-5 ${isActive ? "text-slate-900" : "text-white/80 group-hover:text-white"}`} />
                    <span className={`font-medium ${isActive ? "text-slate-900" : "text-white"}`}>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2.5 text-red-100 hover:bg-red-500/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
          <p className="mt-2 text-center text-[11px] text-white/40">v1.0 • Secure session</p>
        </div>
      </aside>
    </>
  );
};

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [admin, setAdmin] = useState(null);

  // Auth guard: redirect to /adminlogin if no token, not found, or not verified
  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.replace("/adminlogin");
      return;
    }

    let ignore = false;
    (async () => {
      try {
        const data = await fetchAdminMe(token); // { admin }
        const a = data?.admin || data;
        const verified = a?.isVerified !== undefined ? !!a.isVerified : true; // default true if field absent
        if (!a?._id || !verified) {
          localStorage.removeItem("token");
          window.location.replace("/adminlogin");
          return;
        }
        if (!ignore) {
          setAdmin(a);
          setIsChecking(false);
        }
      } catch (e) {
        localStorage.removeItem("token");
        window.location.replace("/adminlogin");
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const onLogout = () => {
    localStorage.removeItem("token");
    window.location.replace("/adminlogin");
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard admin={admin} />;
      case "users":
        return <UsersPage />;
      case "approvals":
        return <Approvals />;
      case "memberships":
        return <Memberships />;
      case "settings":
        return <SettingsPage />;
      default:
        return <Dashboard admin={admin} />;
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen grid place-items-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
          <p className="text-white/90 font-medium">Checking admin session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
        admin={admin}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-white text-xl font-bold">Admin Panel</h1>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* Content card container to match premium style */}
          <div className="min-h-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
