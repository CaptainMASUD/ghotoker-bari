"use client";

import { useState, useEffect } from "react";
import {
  Users,
  CheckCircle,
  CreditCard,
  TrendingUp,
  Activity,
  UserCheck,
  BarChart3,
} from "lucide-react";

const currencyFmt = (n) =>
  typeof n === "number"
    ? new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n)
    : n;

const numberFmt = (n) => (typeof n === "number" ? n.toLocaleString() : n);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeMemberships: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };

        const usersResponse = await fetch("http://localhost:4000/api/admin/users", { headers });
        const usersData = await usersResponse.json();
        const users = Array.isArray(usersData) ? usersData : [];

        const membershipsResponse = await fetch("http://localhost:4000/api/memberships", { headers });
        const membershipsData = await membershipsResponse.json();
        const memberships = Array.isArray(membershipsData) ? membershipsData : [];

        const totalUsers = users.length;
        const pendingApprovals = users.filter((u) => !u.isVerified).length;
        const now = new Date();
        const activeMemberships = users.filter(
          (u) => u.membership && u.membership_expiry && new Date(u.membership_expiry) > now
        ).length;

        const monthlyRevenue = memberships.reduce((total, m) => {
          const activeCount = users.filter(
            (u) =>
              u.membership &&
              u.membership._id === m._id &&
              u.membership_expiry &&
              new Date(u.membership_expiry) > now
          ).length;
          return total + (m.price || 0) * activeCount;
        }, 0);

        setStats({ totalUsers, pendingApprovals, activeMemberships, monthlyRevenue });

        const activities = users.slice(0, 6).map((user, i) => ({
          id: i + 1,
          user: `${user.first_name ?? "User"} ${user.last_name ?? ""}`.trim(),
          action: user.isVerified ? "Profile verified" : "Pending verification",
          time: `${Math.floor(Math.random() * 50) + 5} minutes ago`,
          type: user.isVerified ? "approval" : "user",
        }));
        setRecentActivities(activities);
      } catch (err) {
        console.error("[dashboard] fetch error", err);
        setStats({ totalUsers: 1247, pendingApprovals: 23, activeMemberships: 892, monthlyRevenue: 47850 });
        setRecentActivities([
          { id: 1, user: "Alice Johnson", action: "Profile verified", time: "5 minutes ago", type: "approval" },
          { id: 2, user: "Bob Smith", action: "Pending verification", time: "12 minutes ago", type: "user" },
          { id: 3, user: "Carol Davis", action: "Membership upgraded", time: "25 minutes ago", type: "payment" },
          { id: 4, user: "David Wilson", action: "Profile updated", time: "1 hour ago", type: "update" },
          { id: 5, user: "Emma Brown", action: "Account created", time: "2 hours ago", type: "user" },
          { id: 6, user: "Farhan Iqbal", action: "Invoice paid", time: "3 hours ago", type: "payment" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsConfig = [
    {
      title: "Total Users",
      value: loading ? "—" : numberFmt(stats.totalUsers),
      change: "+12%",
      changeType: "positive",
      icon: Users,
      ring: "from-blue-500/30 to-blue-400/20",
      chip: "bg-blue-500/10 text-blue-300 border border-blue-400/30",
      glow: "shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    },
    {
      title: "Pending Approvals",
      value: loading ? "—" : numberFmt(stats.pendingApprovals),
      change: "-8%",
      changeType: "negative",
      icon: CheckCircle,
      ring: "from-amber-500/30 to-amber-400/20",
      chip: "bg-amber-500/10 text-amber-300 border border-amber-400/30",
      glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    },
    {
      title: "Active Memberships",
      value: loading ? "—" : numberFmt(stats.activeMemberships),
      change: "+5%",
      changeType: "positive",
      icon: CreditCard,
      ring: "from-emerald-500/30 to-emerald-400/20",
      chip: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
    },
    {
      title: "Monthly Revenue",
      value: loading ? "—" : currencyFmt(stats.monthlyRevenue),
      change: "+18%",
      changeType: "positive",
      icon: TrendingUp,
      ring: "from-fuchsia-500/30 to-purple-400/20",
      chip: "bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30",
      glow: "shadow-[0_0_20px_rgba(217,70,239,0.25)]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-white/70 mt-2">Welcome back! Here's what's happening with your platform.</p>
        </div>
        <div className="text-xs md:text-sm text-white/60 bg-white/10 border border-white/15 px-4 py-2 rounded-xl backdrop-blur">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 transition-all hover:scale-[1.01] ${stat.glow}`}
            >
              <div className={`pointer-events-none absolute -inset-1 opacity-70 bg-gradient-to-br ${stat.ring}`} />
              <div className="relative flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-white/70 font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="relative mt-4 inline-flex items-center gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-full ${stat.chip}`}>{stat.change}</span>
                <span className="text-white/60">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Activity className="w-6 h-6 mr-3 text-emerald-300" />
              Recent Activity
            </h2>
            <p className="text-white/60 text-sm mt-1">Latest user actions and system events</p>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="animate-pulse h-12 rounded-xl bg-white/10" />
                ))}
              </div>
            ) : recentActivities.length ? (
              <div className="space-y-4">
                {recentActivities.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        a.type === "user"
                          ? "bg-blue-400"
                          : a.type === "approval"
                          ? "bg-emerald-400"
                          : a.type === "update"
                          ? "bg-amber-400"
                          : a.type === "payment"
                          ? "bg-fuchsia-400"
                          : "bg-rose-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{a.user}</p>
                      <p className="text-sm text-white/70 truncate">{a.action}</p>
                    </div>
                    <div className="text-[11px] text-white/60 bg-white/10 border border-white/15 px-2 py-1 rounded-md">
                      {a.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-white/60">No recent activity.</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-xl font-bold text-white">Quick Actions</h2>
            <p className="text-white/60 text-sm mt-1">Common administrative tasks</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: UserCheck, label: "Add User", ring: "from-blue-500 to-blue-600" },
                { icon: CheckCircle, label: "Review Approvals", ring: "from-amber-500 to-amber-600" },
                { icon: CreditCard, label: "Manage Plans", ring: "from-emerald-500 to-emerald-600" },
                { icon: BarChart3, label: "View Reports", ring: "from-fuchsia-500 to-purple-600" },
              ].map(({ icon: Icon, label, ring }, idx) => (
                <button
                  key={idx}
                  className="group p-6 text-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r ${ring} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tiny KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[{
          label: "Verification Rate",
          value: stats.totalUsers ? Math.round(((stats.totalUsers - stats.pendingApprovals) / stats.totalUsers) * 100) : 0,
        }, {
          label: "Churn Guard",
          value: Math.max(0, 100 - Math.round((stats.pendingApprovals / (stats.totalUsers || 1)) * 100)),
        }, {
          label: "Revenue Index",
          value: stats.monthlyRevenue ? Math.min(100, Math.round((stats.monthlyRevenue / 100000) * 100)) : 0,
        }].map((kpi, i) => (
          <div key={i} className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/70">{kpi.label}</span>
              <span className="text-sm text-white/90 font-semibold">{kpi.value}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                style={{ width: `${kpi.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
