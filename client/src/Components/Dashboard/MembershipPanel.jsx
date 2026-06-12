// MembershipPanel.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Edit3,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MEMBERSHIP_ENDPOINT = `${API_BASE_URL}/api/memberships`;

const INPUT_CLASS =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const TEXTAREA_CLASS =
  "min-h-[92px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const FEATURE_NUMBER_INPUT_CLASS =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100";

const DEFAULT_FEATURES = {
  can_browse_profiles: true,
  profile_view_limit: 10,

  can_view_full_profiles: false,
  can_view_profile_photos: false,
  can_view_biodata: false,

  can_send_connection_request: true,
  connection_request_limit: 3,
  can_accept_connection_request: true,

  can_send_messages: false,
  message_limit: 0,

  can_request_photo_access: false,
  photo_request_limit: 0,

  can_request_guardian_contact: false,
  guardian_contact_request_limit: 0,

  can_view_phone: false,
  can_view_email: false,
  can_view_address: false,

  can_shortlist_profiles: true,
  shortlist_limit: 5,

  can_see_who_viewed_me: false,
  can_boost_profile: false,
  profile_boost_days: 0,

  priority_support: false,
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  currency: "BDT",
  duration_days: 30,
  is_active: true,
  sort_order: 0,
  features: DEFAULT_FEATURES,
};

const FEATURE_GROUPS = [
  {
    title: "Profile Browsing",
    desc: "Control profile visibility and biodata access.",
    items: [
      ["can_browse_profiles", "Can browse profiles", "boolean"],
      ["profile_view_limit", "Profile view limit", "number"],
      ["can_view_full_profiles", "Can view full profile", "boolean"],
      ["can_view_profile_photos", "Can view profile photos", "boolean"],
      ["can_view_biodata", "Can view biodata", "boolean"],
    ],
  },
  {
    title: "Connection / Interest",
    desc: "Control interest and connection request permissions.",
    items: [
      ["can_send_connection_request", "Can send connection request", "boolean"],
      ["connection_request_limit", "Connection request limit", "number"],
      ["can_accept_connection_request", "Can accept connection request", "boolean"],
    ],
  },
  {
    title: "Messaging",
    desc: "Control chat and message limits.",
    items: [
      ["can_send_messages", "Can send messages", "boolean"],
      ["message_limit", "Message limit", "number"],
    ],
  },
  {
    title: "Photo & Guardian Contact",
    desc: "Control private photo/contact request limits.",
    items: [
      ["can_request_photo_access", "Can request photo access", "boolean"],
      ["photo_request_limit", "Photo request limit", "number"],
      ["can_request_guardian_contact", "Can request guardian contact", "boolean"],
      ["guardian_contact_request_limit", "Guardian contact request limit", "number"],
    ],
  },
  {
    title: "Direct Contact Visibility",
    desc: "Control sensitive contact info visibility.",
    items: [
      ["can_view_phone", "Can view phone", "boolean"],
      ["can_view_email", "Can view email", "boolean"],
      ["can_view_address", "Can view address", "boolean"],
    ],
  },
  {
    title: "Shortlist & Premium",
    desc: "Control shortlist, boost, and support features.",
    items: [
      ["can_shortlist_profiles", "Can shortlist profiles", "boolean"],
      ["shortlist_limit", "Shortlist limit", "number"],
      ["can_see_who_viewed_me", "Can see who viewed me", "boolean"],
      ["can_boost_profile", "Can boost profile", "boolean"],
      ["profile_boost_days", "Profile boost days", "number"],
      ["priority_support", "Priority support", "boolean"],
    ],
  },
];

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function getId(item) {
  return item?._id || item?.id;
}

function cleanDate(value) {
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

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function buildSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildQuery(filters) {
  const params = new URLSearchParams();

  params.set("page", String(filters.page || 1));
  params.set("limit", String(filters.limit || 20));

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);

  return params.toString();
}

export default function MembershipPanel() {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const token = currentUser?.token;

  const [plans, setPlans] = useState([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    count: 0,
  });

  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    type: "all",
    page: 1,
    limit: 20,
  });

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    mode: "create",
    data: null,
  });

  const [form, setForm] = useState(EMPTY_FORM);

  const authHeaders = useMemo(() => {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, [token]);

  const showToast = (type, message) => {
    setToast({ type, message });
    window.setTimeout(() => setToast(null), 2600);
  };

  const requestJson = async (url, options = {}) => {
    if (!token) {
      throw new Error("Admin token not found. Please login again.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...(options.headers || {}),
      },
    });

    const result = await safeJson(response);

    if (!response.ok) {
      throw new Error(result.message || result.error || "Request failed.");
    }

    return result;
  };

  const loadMemberships = async (nextFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const query = buildQuery(nextFilters);
      const result = await requestJson(`${MEMBERSHIP_ENDPOINT}/admin?${query}`, {
        method: "GET",
      });

      setPlans(result.items || result.memberships || result.data || []);
      setMeta({
        total: result.total || 0,
        page: result.page || nextFilters.page || 1,
        totalPages: result.totalPages || 1,
        count: result.count || 0,
      });
    } catch (err) {
      setError(err.message || "Could not load memberships.");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const applyFilters = () => {
    const next = { ...filters, page: 1 };
    setFilters(next);
    loadMemberships(next);
  };

  const changePage = (page) => {
    const next = { ...filters, page };
    setFilters(next);
    loadMemberships(next);
  };

  const openCreate = () => {
    setForm({
      ...EMPTY_FORM,
      features: { ...DEFAULT_FEATURES },
    });
    setModal({ open: true, type: "form", mode: "create", data: null });
  };

  const openEdit = (plan) => {
    const features = {
      ...DEFAULT_FEATURES,
      ...(plan.features || {}),
    };

    setForm({
      name: plan.name || "",
      slug: plan.slug || "",
      description: plan.description || "",
      price: safeNumber(plan.price, 0),
      currency: plan.currency || "BDT",
      duration_days: plan.duration_days || 30,
      is_active: Boolean(plan.is_active),
      sort_order: safeNumber(plan.sort_order, 0),
      features,
    });

    setModal({ open: true, type: "form", mode: "edit", data: plan });
  };

  const openView = async (plan) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${MEMBERSHIP_ENDPOINT}/admin/${getId(plan)}`, {
        method: "GET",
      });

      setModal({
        open: true,
        type: "view",
        mode: "view",
        data: {
          ...(result.membership || plan),
          usersCount: result.usersCount || 0,
        },
      });
    } catch (err) {
      showToast("error", err.message || "Could not load membership details.");
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    if (actionLoading) return;
    setModal({ open: false, type: "", mode: "create", data: null });
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setActionLoading(true);

    try {
      const isCreate = modal.mode === "create";
      const id = getId(modal.data);

      if (!form.name.trim()) {
        throw new Error("Membership name is required.");
      }

      const payload = {
        name: form.name.trim(),
        slug: buildSlug(form.slug || form.name),
        description: form.description,
        price: safeNumber(form.price, 0),
        currency: String(form.currency || "BDT").toUpperCase(),
        duration_days: form.slug === "free" ? null : safeNumber(form.duration_days, 30),
        is_active: Boolean(form.is_active),
        sort_order: safeNumber(form.sort_order, 0),
        features: form.features,
      };

      if (!isCreate && modal.data?.slug === "free") {
        delete payload.slug;
        payload.price = 0;
        payload.duration_days = null;
        payload.is_active = true;
      }

      const result = await requestJson(
        isCreate
          ? `${MEMBERSHIP_ENDPOINT}/admin`
          : `${MEMBERSHIP_ENDPOINT}/admin/${id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          body: JSON.stringify(payload),
        }
      );

      showToast("success", result.message || "Membership saved successfully.");
      closeModal();
      loadMemberships(filters);
    } catch (err) {
      showToast("error", err.message || "Could not save membership.");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleStatus = async (plan) => {
    if (plan.slug === "free" || plan.is_default || plan.is_free) {
      showToast("error", "Default Free Plan cannot be disabled.");
      return;
    }

    setActionLoading(true);

    try {
      const result = await requestJson(
        `${MEMBERSHIP_ENDPOINT}/admin/${getId(plan)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ is_active: !plan.is_active }),
        }
      );

      showToast("success", result.message || "Membership status updated.");
      loadMemberships(filters);
    } catch (err) {
      showToast("error", err.message || "Could not update membership status.");
    } finally {
      setActionLoading(false);
    }
  };

  const deletePlan = async (plan) => {
    if (plan.slug === "free" || plan.is_default || plan.is_free) {
      showToast("error", "Default Free Plan cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete "${plan.name}" membership?`)) return;

    setActionLoading(true);

    try {
      const result = await requestJson(`${MEMBERSHIP_ENDPOINT}/admin/${getId(plan)}`, {
        method: "DELETE",
      });

      showToast("success", result.message || "Membership deleted successfully.");
      loadMemberships(filters);
    } catch (err) {
      showToast("error", err.message || "Could not delete membership.");
    } finally {
      setActionLoading(false);
    }
  };

  const ensureFreePlan = async () => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${MEMBERSHIP_ENDPOINT}/admin/ensure-free-plan`, {
        method: "POST",
      });

      showToast("success", result.message || "Default Free Plan is ready.");
      loadMemberships(filters);
    } catch (err) {
      showToast("error", err.message || "Could not ensure Free Plan.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPlans = meta.total || plans.length;
  const activePlans = plans.filter((item) => item.is_active).length;
  const paidPlans = plans.filter((item) => !item.is_free && item.slug !== "free").length;

  return (
    <div className="relative">
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">Membership Plans</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create, update, activate, disable, and control feature limits for matrimony memberships.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={ensureFreePlan}
            disabled={actionLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
          >
            {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Ensure Free Plan
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            Create Membership
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat icon={Crown} label="Total Plans" value={totalPlans} />
        <MiniStat icon={BadgeCheck} label="Active Loaded" value={activePlans} />
        <MiniStat icon={Sparkles} label="Paid Loaded" value={paidPlans} />
      </div>

      <div className="mb-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_180px_180px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search by plan name, slug, description..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </div>

          <Select
            value={filters.status}
            onChange={(value) => updateFilter("status", value)}
            options={[
              ["all", "All Status"],
              ["active", "Active"],
              ["inactive", "Inactive"],
            ]}
          />

          <Select
            value={filters.type}
            onChange={(value) => updateFilter("type", value)}
            options={[
              ["all", "All Types"],
              ["free", "Free"],
              ["paid", "Paid"],
            ]}
          />

          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Apply / Refresh
          </button>
        </div>
      </div>

      <ErrorBox error={error} />

      <MembershipTable
        plans={plans}
        loading={loading}
        actionLoading={actionLoading}
        onView={openView}
        onEdit={openEdit}
        onToggle={toggleStatus}
        onDelete={deletePlan}
      />

      <Pagination
        page={meta.page}
        totalPages={meta.totalPages}
        loading={loading}
        onPage={changePage}
      />

      <Modal open={modal.open} onClose={closeModal}>
        {modal.type === "form" ? (
          <MembershipForm
            mode={modal.mode}
            form={form}
            setForm={setForm}
            loading={actionLoading}
            onSubmit={submitForm}
            onClose={closeModal}
            lockedFreePlan={modal.mode === "edit" && (modal.data?.slug === "free" || modal.data?.is_free)}
          />
        ) : null}

        {modal.type === "view" ? (
          <MembershipView plan={modal.data} onClose={closeModal} />
        ) : null}
      </Modal>
    </div>
  );
}

function MembershipTable({
  plans,
  loading,
  actionLoading,
  onView,
  onEdit,
  onToggle,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="max-h-[620px] overflow-auto">
        <table className="w-full min-w-[1150px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-4 font-bold">Plan</th>
              <th className="px-4 py-4 font-bold">Price</th>
              <th className="px-4 py-4 font-bold">Duration</th>
              <th className="px-4 py-4 font-bold">Type</th>
              <th className="px-4 py-4 font-bold">Status</th>
              <th className="px-4 py-4 font-bold">Main Features</th>
              <th className="px-4 py-4 font-bold">Sort</th>
              <th className="px-4 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <TableLoading colSpan={8} text="Loading memberships..." />
            ) : plans.length ? (
              plans.map((plan) => (
                <tr key={getId(plan)} className="transition hover:bg-rose-50/30">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                        {plan.is_default || plan.slug === "free" ? (
                          <ShieldCheck className="h-5 w-5" />
                        ) : (
                          <Crown className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <p className="text-sm font-extrabold text-slate-900">
                          {plan.name || "Unnamed Plan"}
                        </p>
                        <p className="mt-0.5 text-xs font-medium text-slate-400">
                          /{plan.slug || "no-slug"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-slate-900">
                      {plan.currency || "BDT"} {safeNumber(plan.price, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {plan.price > 0 ? "Paid plan" : "No payment"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-slate-700">
                      {plan.duration_days ? `${plan.duration_days} days` : "No expiry"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      value={plan.is_free || plan.slug === "free" ? "Free" : "Paid"}
                      tone={plan.is_free || plan.slug === "free" ? "emerald" : "violet"}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <Badge
                      value={plan.is_active ? "Active" : "Inactive"}
                      tone={plan.is_active ? "emerald" : "rose"}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex max-w-[330px] flex-wrap gap-1.5">
                      <FeatureChip active={plan.features?.can_send_messages} label="Messages" />
                      <FeatureChip active={plan.features?.can_view_phone} label="Phone" />
                      <FeatureChip active={plan.features?.can_view_profile_photos} label="Photos" />
                      <FeatureChip active={plan.features?.can_boost_profile} label="Boost" />
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-sm font-bold text-slate-600">
                      {plan.sort_order ?? 0}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton title="View" onClick={() => onView(plan)}>
                        <Eye className="h-4 w-4" />
                      </IconButton>

                      <IconButton title="Edit" onClick={() => onEdit(plan)}>
                        <Edit3 className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title={plan.is_active ? "Disable" : "Activate"}
                        disabled={actionLoading || plan.slug === "free" || plan.is_default || plan.is_free}
                        onClick={() => onToggle(plan)}
                      >
                        {plan.is_active ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </IconButton>

                      <IconButton
                        title="Delete"
                        danger
                        disabled={actionLoading || plan.slug === "free" || plan.is_default || plan.is_free}
                        onClick={() => onDelete(plan)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmpty colSpan={8} text="No memberships found." />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MembershipForm({
  mode,
  form,
  setForm,
  loading,
  onSubmit,
  onClose,
  lockedFreePlan,
}) {
  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateFeature = (key, value) => {
    setForm((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value,
      },
    }));
  };

  const autoSlug = () => {
    if (mode === "create" && !form.slug) {
      update("slug", buildSlug(form.name));
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex max-h-[92vh] w-full flex-col overflow-hidden">
      <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wide text-rose-500">
            Membership Setup
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-slate-950 sm:text-xl">
            {mode === "create" ? "Create Membership" : "Update Membership"}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            Set plan details, price, duration, visibility permissions, and feature limits.
          </p>
        </div>

        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {lockedFreePlan ? (
          <div className="mb-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-700">
            Free Plan is protected. Price, expiry, slug, and active status are locked by backend.
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Basic Information</h4>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Keep the plan name, pricing, and duration clear for admins.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Plan Name" required>
              <input
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                onBlur={autoSlug}
                placeholder="Gold Membership"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Slug">
              <input
                value={form.slug}
                onChange={(event) => update("slug", buildSlug(event.target.value))}
                disabled={lockedFreePlan}
                placeholder="gold-membership"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Price">
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(event) => update("price", event.target.value)}
                disabled={lockedFreePlan}
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Currency">
              <input
                value={form.currency}
                onChange={(event) => update("currency", event.target.value.toUpperCase())}
                placeholder="BDT"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Duration Days">
              <input
                type="number"
                min="1"
                value={form.duration_days || ""}
                onChange={(event) => update("duration_days", event.target.value)}
                disabled={lockedFreePlan}
                placeholder="30"
                className={INPUT_CLASS}
              />
            </Field>

            <Field label="Sort Order">
              <input
                type="number"
                value={form.sort_order}
                onChange={(event) => update("sort_order", event.target.value)}
                className={INPUT_CLASS}
              />
            </Field>

            <div className="md:col-span-2 xl:col-span-3">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) => update("description", event.target.value)}
                  rows={3}
                  placeholder="Describe the plan for admin/public understanding..."
                  className={TEXTAREA_CLASS}
                />
              </Field>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <ToggleRow
                label="Active Plan"
                desc="Inactive paid plans will not be assignable or visible publicly."
                checked={form.is_active}
                disabled={lockedFreePlan}
                onChange={(value) => update("is_active", value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">Membership Features</h4>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Toggle permissions and set limits. Use <b>-1</b> for unlimited limits.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            {FEATURE_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4"
              >
                <div className="mb-4">
                  <h5 className="text-sm font-extrabold text-slate-900">{group.title}</h5>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{group.desc}</p>
                </div>

                <div className="space-y-3">
                  {group.items.map(([key, label, type]) =>
                    type === "boolean" ? (
                      <ToggleRow
                        key={key}
                        label={label}
                        checked={Boolean(form.features?.[key])}
                        onChange={(value) => updateFeature(key, value)}
                        compact
                      />
                    ) : (
                      <div
                        key={key}
                        className="grid grid-cols-1 gap-2 rounded-2xl border border-slate-100 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_140px] sm:items-center"
                      >
                        <label className="min-w-0 text-sm font-semibold leading-5 text-slate-700">
                          {label}
                        </label>
                        <input
                          type="number"
                          min={key.includes("limit") ? "-1" : "0"}
                          value={form.features?.[key] ?? 0}
                          onChange={(event) =>
                            updateFeature(key, safeNumber(event.target.value, 0))
                          }
                          className={FEATURE_NUMBER_INPUT_CLASS}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:flex-row sm:justify-end sm:px-6">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {mode === "create" ? "Create Plan" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function MembershipView({ plan, onClose }) {
  const features = { ...DEFAULT_FEATURES, ...(plan?.features || {}) };

  return (
    <div className="flex max-h-[92vh] w-full flex-col overflow-hidden">
      <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wide text-rose-500">
            Membership Details
          </p>
          <h3 className="mt-1 text-lg font-extrabold text-slate-950 sm:text-xl">
            {plan?.name || "Membership Details"}
          </h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Slug: <b>{plan?.slug || "N/A"}</b> · Users: <b>{plan?.usersCount || 0}</b>
          </p>
        </div>

        <button
          type="button"
          aria-label="Close modal"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Price" value={`${plan?.currency || "BDT"} ${safeNumber(plan?.price, 0).toLocaleString()}`} />
          <InfoCard label="Duration" value={plan?.duration_days ? `${plan.duration_days} days` : "No expiry"} />
          <InfoCard label="Status" value={plan?.is_active ? "Active" : "Inactive"} />
          <InfoCard label="Created" value={cleanDate(plan?.createdAt)} />
        </div>

        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
          <h4 className="mb-3 text-sm font-extrabold text-slate-900">Features</h4>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {Object.entries(features).map(([key, value]) => (
              <div
                key={key}
                className="flex min-w-0 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3"
              >
                <span className="min-w-0 text-sm font-semibold capitalize leading-5 text-slate-600">
                  {key.replaceAll("_", " ")}
                </span>
                <span className="shrink-0 text-sm font-extrabold text-slate-900">
                  {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p>
        </div>

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    >
      {options.map(([val, label]) => (
        <option key={val} value={val}>
          {label}
        </option>
      ))}
    </select>
  );
}

function Badge({ value, tone = "slate" }) {
  const colors = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    slate: "border-slate-100 bg-slate-50 text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold capitalize ${
        colors[tone] || colors.slate
      }`}
    >
      {value}
    </span>
  );
}

function FeatureChip({ active, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"
      }`}
    >
      {label}
    </span>
  );
}

function IconButton({ children, title, onClick, disabled, danger }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-xl border text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;

  return (
    <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{error}</span>
    </div>
  );
}

function TableLoading({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          {text}
        </div>
      </td>
    </tr>
  );
}

function TableEmpty({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <p className="text-sm font-bold text-slate-500">{text}</p>
      </td>
    </tr>
  );
}

function Pagination({ page, totalPages, loading, onPage }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={loading || page <= 1}
        onClick={() => onPage(page - 1)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <span className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-extrabold text-slate-600">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={loading || page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/50 px-3 py-4 backdrop-blur-sm sm:px-5">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-white/40">
        {children}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-extrabold text-slate-700">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function ToggleRow({ label, desc, checked, onChange, disabled, compact }) {
  return (
    <div
      className={`flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white ${
        compact ? "px-3 py-2.5" : "p-4"
      }`}
    >
      <div className="min-w-0">
        <p className="break-words text-sm font-bold leading-5 text-slate-800">{label}</p>
        {desc ? <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p> : null}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-rose-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  );
}

function Toast({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`fixed right-5 top-5 z-[1000] flex max-w-sm items-start gap-3 rounded-2xl border p-4 text-sm font-bold shadow-xl ${
        isError
          ? "border-rose-100 bg-rose-50 text-rose-700"
          : "border-emerald-100 bg-emerald-50 text-emerald-700"
      }`}
    >
      {isError ? <AlertCircle className="mt-0.5 h-4 w-4" /> : <Check className="mt-0.5 h-4 w-4" />}
      <span>{message}</span>
    </div>
  );
}