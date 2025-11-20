"use client";

import { useEffect, useMemo, useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Mail,
  Key,
  Save,
  Eye,
  EyeOff,
  Phone,
  ShieldCheck,
  IdCard,
} from "lucide-react";

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

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable form state
  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    bio: "",
  });

  // Security form state (local only unless you wire an endpoint)
  const [secForm, setSecForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notifications (local demo-only)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const token = getToken();
        if (!token) throw new Error("no token");
        const data = await fetchAdminMe(token);
        const a = data?.admin || data;
        setAdmin(a);
        setForm({
          username: a?.username || "",
          email: a?.email || "",
          phone: a?.phone || "",
          bio: a?.bio || "",
        });
      } catch (e) {
        console.error("[settings] fetch admin error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const initials = useMemo(() => {
    const n = admin?.username || "";
    const parts = n.split(/\s+/).filter(Boolean);
    if (!parts.length) return (admin?.email || "?").slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [admin]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "system", label: "System", icon: Database },
  ];

  // NOTE: Wire these to your backend if you add endpoints:
  // PUT /api/admin/profile, PUT /api/admin/password, etc.
  const handleSaveProfile = async () => {
    alert("Profile saved (demo). Wire this button to your backend endpoint.");
  };
  const handleSaveNotifications = () => {
    alert("Notification preferences saved (demo).");
  };
  const handleSetup2FA = () => {
    alert("2FA setup flow (demo).");
  };
  const handleSaveSecurity = async () => {
    if (!secForm.newPassword || secForm.newPassword !== secForm.confirmPassword) {
      alert("New password & confirm password must match.");
      return;
    }
    alert("Password updated (demo). Wire this to your backend.");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <div className="animate-pulse h-10 rounded-xl bg-white/10 mb-4" />
          <div className="animate-pulse h-32 rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">Settings</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar (glass/dark) */}
        <aside className="lg:w-72 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-3">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center border border-white/20 text-white font-bold">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-white font-semibold">{admin?.username || "Admin"}</div>
              <div className="text-xs text-white/70">{admin?.email}</div>
            </div>
          </div>

          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-xl transition-colors ${
                    active
                      ? "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30"
                      : "text-white/80 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${active ? "text-emerald-300" : "text-white/70"}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content (glass/dark) */}
        <section className="flex-1 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          {activeTab === "profile" && (
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center border border-white/20 text-white text-2xl font-bold">
                    {initials}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Profile</h3>
                  <p className="text-sm text-white/70">Update your admin profile details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Username</label>
                  <div className="flex items-center rounded-xl bg-white/10 border border-white/15">
                    <div className="pl-3 text-white/60">
                      <IdCard className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                      className="w-full bg-transparent py-3 px-3 text-white placeholder-white/50 focus:outline-none"
                      placeholder="Admin name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                  <div className="flex items-center rounded-xl bg-white/10 border border-white/15">
                    <div className="pl-3 text-white/60">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-transparent py-3 px-3 text-white placeholder-white/50 focus:outline-none"
                      placeholder="admin@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Phone</label>
                  <div className="flex items-center rounded-xl bg-white/10 border border-white/15">
                    <div className="pl-3 text-white/60">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      className="w-full bg-transparent py-3 px-3 text-white placeholder-white/50 focus:outline-none"
                      placeholder="+8801XXXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Role</label>
                  <div className="flex items-center rounded-xl bg-white/10 border border-white/15 px-4 py-3 text-white/90">
                    <ShieldCheck className="w-5 h-5 mr-2 text-emerald-300" />
                    {admin?.role || "moderator"}
                    <span className="mx-2 text-white/40">•</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        admin?.isVerified
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30"
                          : "bg-white/10 text-white/70 border border-white/20"
                      }`}
                    >
                      {admin?.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Bio</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 px-4 py-3 focus:outline-none"
                  placeholder="Tell something about yourself…"
                />
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                <button className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
              <div className="space-y-4">
                {[
                  { key: "email", title: "Email Notifications", desc: "Receive notifications via email" },
                  { key: "push", title: "Push Notifications", desc: "Receive push notifications in browser" },
                  { key: "sms", title: "SMS Notifications", desc: "Receive important alerts via SMS" },
                ].map((row) => (
                  <div
                    key={row.key}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{row.title}</p>
                      <p className="text-sm text-white/70">{row.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!notifications[row.key]}
                        onChange={(e) => setNotifications((p) => ({ ...p, [row.key]: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/15 border border-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={handleSaveNotifications}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white">Password & Security</h3>
                <div className="mt-4 space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? "text" : "password"}
                        value={secForm.currentPassword}
                        onChange={(e) => setSecForm((p) => ({ ...p, currentPassword: e.target.value }))}
                        className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 px-4 py-3 pr-10 focus:outline-none"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass((s) => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={secForm.newPassword}
                        onChange={(e) => setSecForm((p) => ({ ...p, newPassword: e.target.value }))}
                        className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 px-4 py-3 pr-10 focus:outline-none"
                        placeholder="New password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass((s) => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70"
                      >
                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={secForm.confirmPassword}
                        onChange={(e) => setSecForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                        className="w-full rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 px-4 py-3 pr-10 focus:outline-none"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass((s) => !s)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70"
                      >
                        {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">Two-Factor Authentication</p>
                    <p className="text-xs text-white/70">Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={handleSetup2FA}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 inline-flex items-center"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Setup 2FA
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSaveSecurity}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 inline-flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Security
                </button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border-2 border-emerald-500 p-4">
                  <div className="w-full h-20 rounded bg-white mb-2" />
                  <p className="text-sm font-medium text-white">Light</p>
                </div>
                <div className="rounded-2xl border-2 border-white/20 hover:border-emerald-500 p-4">
                  <div className="w-full h-20 rounded bg-slate-900 mb-2" />
                  <p className="text-sm font-medium text-white">Dark</p>
                </div>
                <div className="rounded-2xl border-2 border-white/20 hover:border-emerald-500 p-4">
                  <div className="w-full h-20 rounded bg-gradient-to-br from-white to-slate-900 mb-2" />
                  <p className="text-sm font-medium text-white">Auto</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white/80 mb-3">Accent Color</h4>
                <div className="flex gap-3">
                  {["emerald", "blue", "purple", "rose", "amber"].map((c) => (
                    <div
                      key={c}
                      className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                        c === "emerald" ? "border-emerald-500" : "border-transparent"
                      }`}
                      style={{ backgroundColor: `var(--tw-${c})` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">System Information</h3>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                {[
                  ["Version", "v2.1.0"],
                  ["Last Updated", "Jan 22, 2025"],
                  ["Database", "Connected"],
                  ["Storage Used", "2.4 GB / 10 GB"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-sm text-white/70">{k}</span>
                    <span className="text-sm font-medium text-white">{v}</span>
                  </div>
                ))}
              </div>

              <h4 className="text-sm font-medium text-white/80">Maintenance</h4>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Clear Cache</span>
                    <span className="text-sm text-white/70">Last cleared: 2 hours ago</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">Export Data</span>
                    <span className="text-sm text-white/70">Download system data</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-xl border border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/15">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reset System</span>
                    <span className="text-sm">Danger zone</span>
                  </div>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
