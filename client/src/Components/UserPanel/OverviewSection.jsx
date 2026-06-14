import React, { useEffect, useMemo, useState } from "react";
import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaHeart,
  FaMapMarkerAlt,
  FaMoneyCheckAlt,
  FaShieldAlt,
  FaSpinner,
  FaTimesCircle,
  FaUserEdit,
  FaUserFriends,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

async function fetchWithAuth(url, token) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await safeJson(response);

  return { response, result };
}

function extractUser(result) {
  return result?.user || result?.data?.user || result?.data || result?.profile || null;
}

function cleanText(value) {
  if (!value) return "—";

  return String(value)
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getName(user) {
  return (
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "User"
  );
}

function getMembershipId(user) {
  const statusObject =
    user?.membership_status && typeof user.membership_status === "object"
      ? user.membership_status
      : null;

  if (statusObject?.plan_id) return statusObject.plan_id;

  const membership = user?.membership;

  if (!membership) return "";

  if (typeof membership === "object") {
    return membership?._id || membership?.id || "";
  }

  return membership;
}

function getMembershipExpiry(user, membershipView) {
  return (
    membershipView?.expiry ||
    user?.membership_expiry ||
    user?.membershipExpiry ||
    user?.membership?.membership_expiry ||
    user?.membership?.membershipExpiry ||
    null
  );
}

function isDateActive(expiry) {
  if (!expiry) return true;

  const expiryDate = new Date(expiry);

  if (Number.isNaN(expiryDate.getTime())) return true;

  return expiryDate.getTime() >= Date.now();
}

function buildMembershipView(user) {
  const rawStatus = user?.membership_status;
  const statusObject =
    rawStatus && typeof rawStatus === "object" ? rawStatus : null;

  const rawMembership = user?.membership;
  const membershipObject =
    rawMembership && typeof rawMembership === "object" ? rawMembership : null;

  const membershipId = getMembershipId(user);

  const status = String(
    statusObject?.status ||
      (typeof rawStatus === "string" ? rawStatus : "") ||
      ""
  ).toLowerCase();

  const slug = statusObject?.slug || membershipObject?.slug || "";
  const isFree =
    Boolean(statusObject?.is_free || membershipObject?.is_free) ||
    slug === "free" ||
    status === "free";

  const expiry =
    statusObject?.expiry ||
    user?.membership_expiry ||
    membershipObject?.membership_expiry ||
    null;

  let active = false;

  if (typeof statusObject?.active === "boolean") {
    active = statusObject.active && isDateActive(expiry);
  } else if (["expired", "cancelled", "canceled", "inactive"].includes(status)) {
    active = false;
  } else if (membershipId) {
    active = isDateActive(expiry);
  }

  return {
    id: membershipId,
    name:
      statusObject?.name ||
      membershipObject?.name ||
      cleanText(slug || status || "Free Plan"),
    slug,
    status: status || (active ? "active" : "inactive"),
    active,
    isFree,
    isPaid: Boolean(statusObject?.is_paid || (!isFree && active)),
    startedAt:
      statusObject?.started_at ||
      user?.membership_started_at ||
      membershipObject?.membership_started_at ||
      null,
    expiry,
    daysLeft:
      typeof statusObject?.days_left === "number"
        ? statusObject.days_left
        : null,
    features: statusObject?.features || membershipObject?.features || {},
  };
}

function getFeature(membership, key) {
  if (
    membership?.features &&
    Object.prototype.hasOwnProperty.call(membership.features, key)
  ) {
    return membership.features[key];
  }

  return false;
}

function formatDate(value, fallback = "Lifetime") {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getProfileCompleteness(user) {
  const number = Number(user?.profile_completeness || 0);

  if (!Number.isFinite(number)) return 0;

  return Math.min(100, Math.max(0, number));
}

function getPaymentStatus(payments) {
  const pending = payments.find(
    (item) => String(item.status || "").toLowerCase() === "pending"
  );

  if (pending) {
    return {
      label: "Pending",
      tone: "amber",
      payment: pending,
    };
  }

  const approved = payments.find(
    (item) => String(item.status || "").toLowerCase() === "approved"
  );

  if (approved) {
    return {
      label: "Approved",
      tone: "emerald",
      payment: approved,
    };
  }

  return {
    label: "Clear",
    tone: "slate",
    payment: null,
  };
}

export default function OverviewSection() {
  const token = getStoredToken();

  const [me, setMe] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOverview = async (silent = false) => {
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

      const [profileRes, paymentRes] = await Promise.all([
        fetchWithAuth(`${API_BASE_URL}/api/user/me`, token),
        fetchWithAuth(
          `${API_BASE_URL}/api/membership-payments/my?limit=20&page=1`,
          token
        ),
      ]);

      if (!profileRes.response.ok) {
        throw new Error(
          profileRes.result?.message || "Could not load your profile."
        );
      }

      const user = extractUser(profileRes.result);

      if (!user) {
        throw new Error("Profile data was not returned from the server.");
      }

      setMe(user);

      if (paymentRes.response.ok) {
        setPayments(Array.isArray(paymentRes.result?.items) ? paymentRes.result.items : []);
      } else {
        setPayments([]);
      }
    } catch (error) {
      setError(error?.message || "Could not load overview.");
      setMe(null);
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverview(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const membership = useMemo(() => buildMembershipView(me), [me]);
  const paymentStatus = useMemo(() => getPaymentStatus(payments), [payments]);

  const completeness = getProfileCompleteness(me);

  const canFullProfile = Boolean(
    getFeature(membership, "can_view_full_profiles") ||
      getFeature(membership, "can_view_biodata")
  );

  const canPhotos = Boolean(getFeature(membership, "can_view_profile_photos"));
  const canMessage = Boolean(getFeature(membership, "can_send_messages"));

  if (loading) {
    return <OverviewLoading />;
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
                Overview unavailable
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {error || "Please login again to view your dashboard."}
              </p>
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
              <p className="text-sm font-medium text-rose-600">
                Dashboard Overview
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                Welcome, {getName(me)}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => loadOverview(true)}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaArrowRight className="text-xs" />
              )}
              Refresh
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<FaUserEdit />}
              label="Profile"
              value={`${completeness}%`}
              tone={completeness >= 70 ? "emerald" : "amber"}
            />

            <StatCard
              icon={<FaCrown />}
              label="Membership"
              value={membership.active ? "Active" : "Inactive"}
              tone={membership.active ? "emerald" : "rose"}
            />

            <StatCard
              icon={<FaShieldAlt />}
              label="Verification"
              value={me?.isVerified ? "Verified" : "Pending"}
              tone={me?.isVerified ? "emerald" : "amber"}
            />

            <StatCard
              icon={<FaMoneyCheckAlt />}
              label="Payment"
              value={paymentStatus.label}
              tone={paymentStatus.tone}
            />
          </div>
        </div>
      </div>

      {paymentStatus.payment &&
      String(paymentStatus.payment.status || "").toLowerCase() === "pending" ? (
        <PaymentNotice payment={paymentStatus.payment} />
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle title="Current Membership" />

          <CurrentMembershipCard membership={membership} />
        </div>

        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle title="Your Profile" />

          <div className="space-y-2.5">
            <InfoRow
              icon={<FaShieldAlt />}
              label="Status"
              value={cleanText(me?.profile_status || "incomplete")}
            />

            <InfoRow
              icon={<FaMapMarkerAlt />}
              label="Location"
              value={
                me?.current_city ||
                me?.current_district ||
                me?.current_division ||
                "—"
              }
            />

            <InfoRow
              icon={<FaHeart />}
              label="Looking For"
              value={cleanText(
                me?.partner_preferences?.looking_for || me?.looking_for || "—"
              )}
            />
          </div>
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle title="Plan Access" />

        <div className="grid gap-3 sm:grid-cols-3">
          <AccessCard title="Full Profile" active={canFullProfile} />
          <AccessCard title="Photos" active={canPhotos} />
          <AccessCard title="Messages" active={canMessage} />
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <SectionTitle title="Quick Actions" />

        <div className="grid gap-3 md:grid-cols-3">
          <QuickAction
            primary
            icon={<FaUserEdit />}
            title="Edit Profile"
            href="/settings/profile"
          />

          <QuickAction
            icon={<FaUserFriends />}
            title="Find Matches"
            href="/find-matches"
          />

          <QuickAction icon={<FaCrown />} title="View Plans" href="/plans" />
        </div>
      </div>
    </section>
  );
}

function OverviewLoading() {
  return (
    <section className="space-y-5">
      <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <FaSpinner className="animate-spin text-rose-600" />
          Loading overview...
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
    </section>
  );
}

function SectionTitle({ title }) {
  return (
    <h3 className="mb-4 text-base font-semibold tracking-tight text-slate-900">
      {title}
    </h3>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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

          <p className="mt-1 truncate text-lg font-medium text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function CurrentMembershipCard({ membership }) {
  const active = Boolean(membership.active);

  return (
    <div
      className={`overflow-hidden rounded-2xl border ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              active ? "bg-white text-emerald-600" : "bg-white text-slate-400"
            }`}
          >
            <FaCrown />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-medium text-slate-900">
                {membership.name || "Free Plan"}
              </h4>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  active
                    ? "bg-white text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-white text-slate-500 ring-1 ring-slate-200"
                }`}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-600">
              {membership.isFree
                ? "Default membership plan"
                : active
                ? "Your current paid membership"
                : "No active paid membership"}
            </p>
          </div>
        </div>

        {!active ? (
          <a
            href="/plans"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            View Plans
            <FaArrowRight className="text-xs" />
          </a>
        ) : null}
      </div>

      <div
        className={`grid border-t ${
          active ? "border-emerald-100" : "border-slate-200"
        } bg-white/70 sm:grid-cols-3`}
      >
        <MembershipMeta label="Started" value={formatDate(membership.startedAt, "—")} />
        <MembershipMeta label="Expires" value={formatDate(membership.expiry)} />
        <MembershipMeta
          label="Days Left"
          value={
            typeof membership.daysLeft === "number"
              ? String(membership.daysLeft)
              : membership.isFree
              ? "Lifetime"
              : "—"
          }
        />
      </div>
    </div>
  );
}

function MembershipMeta({ label, value }) {
  return (
    <div className="border-t border-slate-100 px-4 py-3 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-800">{value || "—"}</p>
    </div>
  );
}

function AccessCard({ title, active }) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
            active ? "bg-white text-emerald-600" : "bg-white text-slate-400"
          }`}
        >
          {active ? <FaCheckCircle /> : <FaTimesCircle />}
        </div>

        <p className="text-sm font-medium text-slate-900">{title}</p>
      </div>

      <p
        className={`mt-2 text-xs font-medium ${
          active ? "text-emerald-700" : "text-slate-400"
        }`}
      >
        {active ? "Enabled" : "Locked"}
      </p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="truncate text-sm font-medium text-slate-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, href, primary = false }) {
  return (
    <a
      href={href}
      className={`group flex items-center gap-3 rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md ${
        primary
          ? "border-rose-600 bg-rose-600 text-white shadow-lg shadow-rose-100"
          : "border-slate-200 bg-white text-slate-800 hover:border-rose-200 hover:bg-rose-50"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          primary ? "bg-white/15 text-white" : "bg-rose-50 text-rose-600"
        }`}
      >
        {icon}
      </div>

      <span className="text-sm font-medium">{title}</span>

      <FaArrowRight className="ml-auto text-xs transition group-hover:translate-x-1" />
    </a>
  );
}

function PaymentNotice({ payment }) {
  return (
    <div className="rounded-[1.6rem] border border-amber-200 bg-amber-50 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
          <FaClock />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900">
            Payment request pending
          </p>

          <p className="truncate text-xs text-slate-600">
            {payment.membership?.name ||
              payment.plan_snapshot?.name ||
              "Membership Plan"}{" "}
            • {payment.amount || payment.plan_snapshot?.price || 0}{" "}
            {payment.currency || payment.plan_snapshot?.currency || "BDT"}
          </p>
        </div>
      </div>
    </div>
  );
}