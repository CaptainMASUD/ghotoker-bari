import React, { useEffect, useMemo, useState } from "react";
import {
  FaCheck,
  FaCheckCircle,
  FaClock,
  FaEnvelopeOpenText,
  FaFilter,
  FaHandshake,
  FaImages,
  FaPhoneAlt,
  FaShieldAlt,
  FaSpinner,
  FaSyncAlt,
  FaTimes,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ACTION_TYPES = [
  "connection_request",
  "photo_access_request",
  "guardian_contact_request",
];

const TYPE_CONFIG = {
  connection_request: {
    label: "Connection Request",
    shortLabel: "Connection",
    icon: <FaHandshake />,
    tone: "rose",
    description: "A user wants to connect with you.",
    endpoint: "connections",
  },
  photo_access_request: {
    label: "Photo Access Request",
    shortLabel: "Photo Access",
    icon: <FaImages />,
    tone: "violet",
    description: "A user wants permission to view your profile photos.",
    endpoint: "photo-access",
  },
  guardian_contact_request: {
    label: "Guardian Contact Request",
    shortLabel: "Guardian Contact",
    icon: <FaPhoneAlt />,
    tone: "emerald",
    description: "A user wants permission to access guardian contact details.",
    endpoint: "guardian-contact",
  },
};

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
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

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function fetchWithAuth(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const result = await safeJson(response);

  return { response, result };
}

function cleanText(value) {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPersonName(user) {
  return (
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "User"
  );
}

function getPersonAvatar(user) {
  const name = getPersonName(user);

  const photos = Array.isArray(user?.profile_photos)
    ? user.profile_photos.filter(Boolean)
    : [];

  if (photos[0]) return photos[0];

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name
  )}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getToneClass(tone) {
  if (tone === "violet") {
    return {
      soft: "bg-violet-50 text-violet-600",
      border: "border-violet-100",
      hover: "hover:border-violet-200 hover:bg-violet-50",
    };
  }

  if (tone === "emerald") {
    return {
      soft: "bg-emerald-50 text-emerald-600",
      border: "border-emerald-100",
      hover: "hover:border-emerald-200 hover:bg-emerald-50",
    };
  }

  return {
    soft: "bg-rose-50 text-rose-600",
    border: "border-rose-100",
    hover: "hover:border-rose-200 hover:bg-rose-50",
  };
}

function normalizeItems(result) {
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data?.items)) return result.data.items;
  if (Array.isArray(result?.requests)) return result.requests;
  if (Array.isArray(result)) return result;
  return [];
}

export default function RequestsAccessSection() {
  const token = getStoredToken();

  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingId, setActingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRequests = async (silent = false) => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      setError("Login required.");
      return;
    }

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setNotice("");

      const { response, result } = await fetchWithAuth(
        `${API_BASE_URL}/api/matrimony-actions/my?box=received&limit=50&page=1`,
        token
      );

      if (!response.ok) {
        throw new Error(result?.message || "Could not load requests.");
      }

      const rows = normalizeItems(result).filter((item) =>
        ACTION_TYPES.includes(item?.type)
      );

      setItems(rows);
    } catch (error) {
      setError(error?.message || "Could not load requests.");
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const stats = useMemo(() => {
    const pending = items.filter((item) => item.status === "pending").length;
    const accepted = items.filter((item) => item.status === "accepted").length;
    const rejected = items.filter((item) => item.status === "rejected").length;

    return {
      total: items.length,
      pending,
      accepted,
      rejected,
    };
  }, [items]);

  const visibleItems = useMemo(() => {
    if (activeTab === "all") return items;
    return items.filter((item) => item.status === activeTab);
  }, [items, activeTab]);

  const handleRespond = async (request, action) => {
    if (!request?._id || !request?.type) return;

    const config = TYPE_CONFIG[request.type];

    if (!config?.endpoint) return;

    try {
      setActingId(`${request._id}-${action}`);
      setError("");
      setNotice("");

      const { response, result } = await fetchWithAuth(
        `${API_BASE_URL}/api/matrimony-actions/${config.endpoint}/${request._id}/respond`,
        token,
        {
          method: "PATCH",
          body: JSON.stringify({
            action,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(result?.message || "Could not update request.");
      }

      const nextStatus = action === "accept" ? "accepted" : "rejected";

      setItems((prev) =>
        prev.map((item) =>
          item._id === request._id
            ? {
                ...item,
                status: nextStatus,
                responded_at: new Date().toISOString(),
              }
            : item
        )
      );

      setNotice(
        action === "accept"
          ? "Request accepted successfully."
          : "Request rejected successfully."
      );
    } catch (error) {
      setError(error?.message || "Could not update request.");
    } finally {
      setActingId("");
    }
  };

  if (loading) {
    return <RequestsLoading />;
  }

  if (!token || error) {
    return (
      <section className="space-y-5">
        <div className="rounded-[1.5rem] border border-rose-100 bg-rose-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
              <FaTimesCircle />
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Requests unavailable
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {error || "Please login again to view your requests."}
              </p>

              {token ? (
                <button
                  type="button"
                  onClick={() => loadRequests(false)}
                  className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700"
                >
                  <FaSyncAlt className="text-xs" />
                  Try Again
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#fbf7f4] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600">
                <FaShieldAlt className="text-[11px]" />
                Requests & Access
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Manage profile access requests
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review connection, photo access, and guardian contact requests
                from one clean panel.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadRequests(true)}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaSyncAlt className="text-xs" />
              )}
              Refresh
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<FaEnvelopeOpenText />}
              label="Total Requests"
              value={stats.total}
              tone="slate"
            />

            <StatCard
              icon={<FaClock />}
              label="Pending"
              value={stats.pending}
              tone="amber"
            />

            <StatCard
              icon={<FaCheckCircle />}
              label="Accepted"
              value={stats.accepted}
              tone="emerald"
            />

            <StatCard
              icon={<FaTimesCircle />}
              label="Rejected"
              value={stats.rejected}
              tone="rose"
            />
          </div>
        </div>
      </div>

      {notice ? (
        <div className="rounded-[1.3rem] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      ) : null}

      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              Incoming Requests
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Accept or reject requests sent to your profile.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-slate-100 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  activeTab === tab.key
                    ? "bg-white text-rose-600 shadow-sm"
                    : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {visibleItems.length > 0 ? (
            <div className="space-y-3">
              {visibleItems.map((request) => (
                <RequestCard
                  key={request._id}
                  request={request}
                  actingId={actingId}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          ) : (
            <EmptyState activeTab={activeTab} />
          )}
        </div>
      </div>
    </section>
  );
}

function RequestCard({ request, actingId, onRespond }) {
  const config = TYPE_CONFIG[request.type] || TYPE_CONFIG.connection_request;
  const tone = getToneClass(config.tone);
  const person = request.from_user || {};
  const pending = request.status === "pending";

  const accepting = actingId === `${request._id}-accept`;
  const rejecting = actingId === `${request._id}-reject`;
  const disabled = Boolean(actingId);

  return (
    <div
      className={`rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tone.hover}`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <img
              src={getPersonAvatar(person)}
              alt={getPersonName(person)}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="truncate text-base font-semibold text-slate-900">
                {getPersonName(person)}
              </h4>

              <StatusBadge status={request.status} />
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.soft}`}
              >
                {config.icon}
                {config.label}
              </span>

              <span className="text-xs font-medium text-slate-400">
                {formatDate(request.createdAt)}
              </span>
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {request.message || config.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              {person?.age ? (
                <MiniInfo icon={<FaUser />} value={`${person.age} years`} />
              ) : null}

              {person?.religion ? (
                <MiniInfo value={cleanText(person.religion)} />
              ) : null}

              {person?.current_district || person?.current_city ? (
                <MiniInfo
                  value={person.current_city || person.current_district}
                />
              ) : null}

              {person?.profession ? (
                <MiniInfo value={cleanText(person.profession)} />
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row xl:justify-end">
          {pending ? (
            <>
              <button
                type="button"
                onClick={() => onRespond(request, "accept")}
                disabled={disabled}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {accepting ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaCheck className="text-xs" />
                )}
                Accept
              </button>

              <button
                type="button"
                onClick={() => onRespond(request, "reject")}
                disabled={disabled}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rejecting ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaTimes className="text-xs" />
                )}
                Reject
              </button>
            </>
          ) : (
            <div className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-500">
              {request.status === "accepted" ? "Accepted" : "Rejected"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, tone = "slate" }) {
  const toneClass =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-600"
      : tone === "amber"
      ? "bg-amber-50 text-amber-600"
      : tone === "rose"
      ? "bg-rose-50 text-rose-600"
      : "bg-slate-100 text-slate-500";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-lg font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "pending").toLowerCase();

  if (value === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <FaCheckCircle className="text-[10px]" />
        Accepted
      </span>
    );
  }

  if (value === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
        <FaTimesCircle className="text-[10px]" />
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <FaClock className="text-[10px]" />
      Pending
    </span>
  );
}

function MiniInfo({ icon, value }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
      {icon || <FaFilter className="text-[10px]" />}
      {value}
    </span>
  );
}

function EmptyState({ activeTab }) {
  return (
    <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
        <FaEnvelopeOpenText />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900">
        No {activeTab === "all" ? "" : activeTab} requests found
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        When someone sends you a connection, photo access, or guardian contact
        request, it will appear here.
      </p>
    </div>
  );
}

function RequestsLoading() {
  return (
    <section className="space-y-5">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <FaSpinner className="animate-spin text-rose-600" />
          Loading requests...
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-32 animate-pulse rounded-[1.4rem] border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
    </section>
  );
}