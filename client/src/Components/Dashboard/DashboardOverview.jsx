"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Crown,
  Loader2,
  Mail,
  MessageSquare,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const OVERVIEW_ENDPOINT = `${API_BASE_URL}/api/admin/overview`;

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 60 days", value: 60 },
  { label: "Last 90 days", value: 90 },
];

const PIE_COLORS = [
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#6366f1",
  "#14b8a6",
  "#8b5cf6",
];

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function formatNumber(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("en-BD").format(number);
}

function formatMoney(value, currency = "BDT") {
  const number = Number(value || 0);

  return `${currency} ${new Intl.NumberFormat("en-BD", {
    maximumFractionDigits: 0,
  }).format(number)}`;
}

function formatDate(value) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

function formatDateShort(value) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "N/A";
  }
}

function cleanLabel(value) {
  return String(value || "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPersonName(user) {
  if (!user) return "Unknown User";

  return (
    user.full_name ||
    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
    user.username ||
    user.email_address ||
    "Unknown User"
  );
}

function getInitial(name) {
  return String(name || "U").trim().charAt(0).toUpperCase();
}

function statusBadgeClass(status) {
  const value = String(status || "").toLowerCase();

  if (
    ["active", "approved", "accepted", "seen", "sent", "verified", "email"].includes(
      value
    )
  ) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (
    ["pending", "pending_review", "incomplete", "free", "phone", "whatsapp"].includes(
      value
    )
  ) {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (
    [
      "rejected",
      "cancelled",
      "expired",
      "suspended",
      "deleted",
      "hidden",
      "removed",
    ].includes(value)
  ) {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }

  return "border-slate-100 bg-slate-50 text-slate-700";
}

function getGrowthMeta(value) {
  const number = Number(value || 0);

  if (number > 0) {
    return {
      icon: ArrowUpRight,
      className: "text-emerald-600 bg-emerald-50 border-emerald-100",
      text: `+${number}%`,
    };
  }

  if (number < 0) {
    return {
      icon: ArrowDownRight,
      className: "text-rose-600 bg-rose-50 border-rose-100",
      text: `${number}%`,
    };
  }

  return {
    icon: TrendingUp,
    className: "text-slate-600 bg-slate-50 border-slate-100",
    text: "0%",
  };
}

function CustomTooltip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
      <p className="text-xs font-semibold text-slate-400">
        {formatDate(label)}
      </p>

      <div className="mt-2 space-y-1">
        {payload.map((item, index) => (
          <p key={index} className="text-sm font-semibold text-slate-700">
            {item.name}:{" "}
            <span className="text-slate-950">
              {item.dataKey === "amount"
                ? formatMoney(item.value, currency)
                : formatNumber(item.value)}
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-xl">
      <p className="text-sm font-semibold text-slate-900">
        {cleanLabel(item?.name)}
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-500">
        Count: {formatNumber(item?.value)}
      </p>
    </div>
  );
}

export default function DashboardOverview({ onNavigate }) {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const token = currentUser?.token || localStorage.getItem("token");

  const [days, setDays] = useState(30);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const headers = useMemo(() => {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [token]);

  const requestOverview = async (nextDays = days, silent = false) => {
    if (!token) {
      setError("Admin token not found. Please login again.");
      setLoading(false);
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await fetch(`${OVERVIEW_ENDPOINT}?days=${nextDays}`, {
        method: "GET",
        headers,
      });

      const result = await safeJson(response);

      if (!response.ok || result?.success === false) {
        throw new Error(result.message || "Failed to fetch admin overview.");
      }

      setOverview(result.overview || null);
    } catch (err) {
      setError(err.message || "Failed to fetch admin overview.");
      setOverview(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    requestOverview(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRange = (value) => {
    const nextDays = Number(value);
    setDays(nextDays);
    requestOverview(nextDays);
  };

  const refresh = () => {
    requestOverview(days, true);
  };

  const cards = overview?.cards || {};
  const breakdowns = overview?.breakdowns || {};
  const charts = overview?.charts || {};
  const recent = overview?.recent || {};

  const currency = cards?.payments?.currency || "BDT";

  const profileStatusChart = (breakdowns.users_by_profile_status || []).slice(
    0,
    6
  );
  const paymentStatusChart = (breakdowns.payments_by_status || []).slice(0, 6);
  const actionTypeChart = (breakdowns.actions_by_type || []).slice(0, 6);
  const contactTopicChart = (breakdowns.contacts_by_topic || []).slice(0, 6);

  if (loading) {
    return (
      <div className="flex min-h-[620px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-9 w-9 animate-spin text-rose-600" />
          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading admin overview...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[620px] items-center justify-center">
        <div className="max-w-md rounded-3xl border border-rose-100 bg-rose-50 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-rose-600" />
          <h3 className="mt-4 text-lg font-semibold text-rose-950">
            Overview Failed
          </h3>
          <p className="mt-2 text-sm leading-6 text-rose-700">{error}</p>

          <button
            type="button"
            onClick={() => requestOverview(days)}
            className="mt-5 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin Overview
          </p>

          <h2 className="mt-3 text-2xl font-semibold text-slate-950">
            Dashboard Overview
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">
            See users, verification, payments, memberships, contact messages and
            platform activity in one place.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <select
              value={days}
              onChange={(event) => changeRange(event.target.value)}
              className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 sm:w-[170px]"
            >
              {RANGE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          title="Total Users"
          value={cards?.users?.total}
          subText={`${formatNumber(
            cards?.users?.current_period
          )} new in selected range`}
          growth={cards?.users?.growth_percent}
          onClick={() => onNavigate?.("users")}
        />

        <MetricCard
          icon={BadgeCheck}
          title="Pending Profiles"
          value={cards?.users?.pending_profiles}
          subText={`${formatNumber(cards?.users?.verified)} verified users`}
          tone="amber"
          onClick={() => onNavigate?.("verification")}
        />

        <MetricCard
          icon={CreditCard}
          title="Revenue"
          value={formatMoney(cards?.payments?.current_period_revenue, currency)}
          subText={`${formatNumber(
            cards?.payments?.approved_current_period
          )} approved payments`}
          growth={cards?.payments?.revenue_growth_percent}
          tone="emerald"
          onClick={() => onNavigate?.("payments")}
        />

        <MetricCard
          icon={MessageSquare}
          title="Contact Messages"
          value={cards?.contacts?.total}
          subText={`${formatNumber(
            cards?.contacts?.current_period
          )} new in selected range`}
          growth={cards?.contacts?.growth_percent}
          tone="sky"
          onClick={() => onNavigate?.("messages")}
        />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 xl:grid-cols-3">
        <SmallSummaryCard
          icon={Crown}
          title="Membership Plans"
          value={cards?.memberships?.active_plans}
          text={`${formatNumber(
            cards?.memberships?.paid_plans
          )} paid plans, ${formatNumber(
            cards?.memberships?.free_plans
          )} free plan`}
          onClick={() => onNavigate?.("memberships")}
        />

        <SmallSummaryCard
          icon={CreditCard}
          title="Pending Payment Amount"
          value={formatMoney(cards?.payments?.pending_amount, currency)}
          text={`${formatNumber(
            cards?.payments?.total_requests
          )} total payment requests`}
          onClick={() => onNavigate?.("payments")}
        />

        <SmallSummaryCard
          icon={Zap}
          title="Matrimony Actions"
          value={cards?.matrimony_actions?.total}
          text={`${formatNumber(
            cards?.matrimony_actions?.current_period
          )} actions in selected range`}
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard
          title="User Growth"
          text="New normal users by day"
          rightText={`${days} days`}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.users || []}>
              <defs>
                <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="count"
                name="Users"
                stroke="#f43f5e"
                strokeWidth={3}
                fill="url(#usersGradient)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Approved Revenue"
          text="Approved payment revenue by day"
          rightText={currency}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.revenue || []}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip currency={currency} />} />

              <Area
                type="monotone"
                dataKey="amount"
                name="Revenue"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <ChartCard title="Contact Messages" text="Contact submissions by day">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.contacts || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="count"
                name="Messages"
                fill="#6366f1"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Platform Actions" text="Matrimony actions by day">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={charts.actions || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />

              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar
                dataKey="count"
                name="Actions"
                fill="#f59e0b"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-4">
        <PieBreakdown title="Profile Status" data={profileStatusChart} />
        <PieBreakdown title="Payment Status" data={paymentStatusChart} />
        <PieBreakdown title="Action Types" data={actionTypeChart} />
        <PieBreakdown title="Contact Topics" data={contactTopicChart} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-2">
        <BreakdownList
          title="Top Locations"
          items={(breakdowns.top_locations || []).map((item) => ({
            label:
              [item.district, item.division].filter(Boolean).join(", ") ||
              "Unknown Location",
            count: item.count,
          }))}
        />

        <BreakdownList
          title="Top Membership Plans"
          items={(breakdowns.top_membership_plans || []).map((item) => ({
            label: item.plan_name || "Unknown Plan",
            count: item.count,
            amount: item.revenue,
          }))}
          currency={currency}
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RecentPanel
          title="Latest Users"
          icon={Users}
          emptyText="No recent users found."
          items={(recent.users || []).map((user, index) => ({
            key: `user-${index}`,
            avatar: getInitial(getPersonName(user)),
            title: getPersonName(user),
            subtitle: `${cleanLabel(user.profile_status)} • ${
              user.email_address || "No email"
            }`,
            badge: user.isVerified ? "Verified" : "Unverified",
            badgeClass: user.isVerified
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-amber-100 bg-amber-50 text-amber-700",
            meta: formatDate(user.createdAt),
          }))}
        />

        <RecentPanel
          title="Latest Payments"
          icon={CreditCard}
          emptyText="No recent payments found."
          items={(recent.payments || []).map((payment, index) => ({
            key: `payment-${index}`,
            avatar: getInitial(getPersonName(payment.user)),
            title: getPersonName(payment.user),
            subtitle: `${
              payment.plan_snapshot?.name ||
              payment.membership?.name ||
              "Membership"
            } • ${formatMoney(payment.amount, payment.currency || currency)}`,
            badge: cleanLabel(payment.status),
            badgeClass: statusBadgeClass(payment.status),
            meta: formatDate(payment.submitted_at || payment.createdAt),
          }))}
        />

        <RecentPanel
          title="Latest Contact Messages"
          icon={Mail}
          emptyText="No contact messages found."
          items={(recent.contacts || []).map((contact, index) => ({
            key: `contact-${index}`,
            avatar: getInitial(contact.name),
            title: contact.name || "Unknown Sender",
            subtitle: `${contact.topic || "No topic"} • ${
              contact.email || "No email"
            }`,
            badge: contact.channel || "Email",
            badgeClass: statusBadgeClass(contact.channel),
            meta: formatDate(contact.createdAt),
          }))}
        />

        <RecentPanel
          title="Latest Matrimony Actions"
          icon={MessageSquare}
          emptyText="No recent actions found."
          items={(recent.actions || []).map((action, index) => ({
            key: `action-${index}`,
            avatar: getInitial(getPersonName(action.from_user)),
            title: cleanLabel(action.type),
            subtitle: `${getPersonName(action.from_user)} → ${getPersonName(
              action.to_user
            )}`,
            badge: cleanLabel(action.status),
            badgeClass: statusBadgeClass(action.status),
            meta: formatDate(action.createdAt),
          }))}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subText,
  growth,
  tone = "rose",
  onClick,
}) {
  const growthMeta = getGrowthMeta(growth);
  const GrowthIcon = growthMeta.icon;

  const toneClass =
    {
      rose: "bg-rose-50 text-rose-600",
      amber: "bg-amber-50 text-amber-600",
      emerald: "bg-emerald-50 text-emerald-600",
      sky: "bg-sky-50 text-sky-600",
    }[tone] || "bg-rose-50 text-rose-600";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[148px] cursor-pointer flex-col justify-between rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-100/60 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneClass}`}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>

        {growth !== undefined ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${growthMeta.className}`}
          >
            <GrowthIcon className="h-3.5 w-3.5" />
            {growthMeta.text}
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <h3 className="mt-1 text-2xl font-semibold leading-tight text-slate-950">
          {typeof value === "string" ? value : formatNumber(value)}
        </h3>
        <p className="mt-2 text-xs font-medium leading-5 text-slate-400">
          {subText}
        </p>
      </div>
    </button>
  );
}

function SmallSummaryCard({ icon: Icon, title, value, text, onClick }) {
  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-sm transition ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-100/60 active:scale-[0.99]"
          : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-0.5 truncate text-lg font-semibold text-slate-950">
            {typeof value === "string" ? value : formatNumber(value)}
          </h3>
        </div>
      </div>

      <p className="mt-2 text-xs font-medium leading-5 text-slate-400">{text}</p>
    </Tag>
  );
}

function ChartCard({ title, text, rightText, children }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{text}</p>
        </div>

        {rightText ? (
          <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
            {rightText}
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}

function PieBreakdown({ title, data }) {
  const finalData = Array.isArray(data)
    ? data.filter((item) => item.count > 0)
    : [];

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-950">{title}</h3>

      {finalData.length ? (
        <>
          <div className="mt-4 h-[190px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={48}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {finalData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {finalData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                    }}
                  />
                  <p className="truncate text-xs font-semibold text-slate-600">
                    {cleanLabel(item.label)}
                  </p>
                </div>

                <p className="text-xs font-semibold text-slate-950">
                  {formatNumber(item.count)}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyMini text="No data available." />
      )}
    </div>
  );
}

function BreakdownList({ title, items = [], currency }) {
  const finalItems = items.filter((item) => item?.count || item?.amount);

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <BarChart3 className="h-5 w-5 text-slate-300" />
      </div>

      {finalItems.length ? (
        <div className="space-y-3">
          {finalItems.slice(0, 10).map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-sm font-semibold text-slate-800">
                  {item.label}
                </p>

                <p className="shrink-0 text-sm font-semibold text-slate-950">
                  {formatNumber(item.count)}
                </p>
              </div>

              {item.amount !== undefined ? (
                <p className="mt-1 text-xs font-semibold text-emerald-600">
                  {formatMoney(item.amount, currency)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <EmptyMini text="No data available." />
      )}
    </div>
  );
}

function RecentPanel({ title, icon: Icon, items = [], emptyText }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-xs text-slate-400">
            No database IDs are shown here.
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-rose-600 shadow-sm">
                {item.avatar}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {item.title}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500">
                  {item.subtitle}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${item.badgeClass}`}
                >
                  {item.badge}
                </span>
                <p className="mt-1 text-xs text-slate-400">{item.meta}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyMini text={emptyText} />
      )}
    </div>
  );
}

function EmptyMini({ text }) {
  return (
    <div className="flex min-h-[150px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
      <div>
        <Clock className="mx-auto h-6 w-6 text-slate-300" />
        <p className="mt-2 text-sm font-semibold text-slate-500">{text}</p>
      </div>
    </div>
  );
}
