// AdminPaymentPanel.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Edit3,
  Eye,
  FileText,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const PAYMENT_ENDPOINT = `${API_BASE_URL}/api/membership-payments`;

const PROVIDER_TYPES = [
  ["manual", "Manual"],
  ["bkash", "bKash"],
  ["nagad", "Nagad"],
  ["rocket", "Rocket"],
  ["bank", "Bank"],
  ["card", "Card"],
  ["cash", "Cash"],
  ["other", "Other"],
];

const FIELD_TYPES = [
  ["text", "Text"],
  ["number", "Number"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["textarea", "Textarea"],
  ["select", "Select"],
  ["date", "Date"],
  ["time", "Time"],
];

const EMPTY_METHOD_FORM = {
  name: "",
  slug: "",
  provider_type: "manual",
  description: "",
  instructions: "",
  account_name: "",
  account_number: "",
  branch_name: "",
  routing_number: "",
  currency: "BDT",
  min_amount: 0,
  max_amount: "",
  is_active: true,
  sort_order: 0,
  fields: [],
};

const EMPTY_FIELD = {
  label: "",
  name: "",
  type: "text",
  required: false,
  placeholder: "",
  help_text: "",
  options: [],
  validation_regex: "",
  sort_order: 0,
};

function getId(item) {
  return item?._id || item?.id;
}

function safeNumber(value, fallback = 0) {
  if (value === "" || value === null || value === undefined) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
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

function buildFieldName(value) {
  return buildSlug(value).replace(/-/g, "_");
}

function cleanDate(value) {
  if (!value) return "N/A";

  try {
    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
}

function getUserName(user) {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
  return fullName || user?.email_address || user?.phone_number || "Unknown user";
}

function buildRequestsQuery(filters) {
  const params = new URLSearchParams();

  params.set("page", String(filters.page || 1));
  params.set("limit", String(filters.limit || 20));

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.paymentMethodId && filters.paymentMethodId !== "all") {
    params.set("paymentMethodId", filters.paymentMethodId);
  }

  return params.toString();
}

function buildMethodsQuery(filters) {
  const params = new URLSearchParams();

  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.provider_type && filters.provider_type !== "all") {
    params.set("provider_type", filters.provider_type);
  }

  return params.toString();
}

function normalizeOptions(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminPaymentPanel() {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const token = currentUser?.token;

  const [activeTab, setActiveTab] = useState("requests");

  const [requests, setRequests] = useState([]);
  const [requestsMeta, setRequestsMeta] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    count: 0,
  });

  const [requestFilters, setRequestFilters] = useState({
    search: "",
    status: "pending",
    paymentMethodId: "all",
    page: 1,
    limit: 20,
  });

  const [methods, setMethods] = useState([]);
  const [methodFilters, setMethodFilters] = useState({
    search: "",
    status: "all",
    provider_type: "all",
  });

  const [methodForm, setMethodForm] = useState(EMPTY_METHOD_FORM);
  const [reviewForm, setReviewForm] = useState({ action: "approve", review_note: "" });

  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    mode: "create",
    data: null,
  });

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
    if (!token) throw new Error("Admin token not found. Please login again.");

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

  const loadRequests = async (nextFilters = requestFilters) => {
    setLoadingRequests(true);
    setError("");

    try {
      const query = buildRequestsQuery(nextFilters);
      const result = await requestJson(`${PAYMENT_ENDPOINT}/admin/requests?${query}`, {
        method: "GET",
      });

      setRequests(result.items || []);
      setRequestsMeta({
        total: result.total || 0,
        page: result.page || nextFilters.page || 1,
        totalPages: result.totalPages || 1,
        count: result.count || 0,
      });
    } catch (err) {
      setError(err.message || "Could not load payment requests.");
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadMethods = async (nextFilters = methodFilters) => {
    setLoadingMethods(true);
    setError("");

    try {
      const query = buildMethodsQuery(nextFilters);
      const result = await requestJson(`${PAYMENT_ENDPOINT}/admin/methods?${query}`, {
        method: "GET",
      });

      setMethods(result.items || []);
    } catch (err) {
      setError(err.message || "Could not load payment methods.");
      setMethods([]);
    } finally {
      setLoadingMethods(false);
    }
  };

  useEffect(() => {
    loadMethods();
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateRequestFilter = (key, value) => {
    setRequestFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const updateMethodFilter = (key, value) => {
    setMethodFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyRequestFilters = () => {
    const next = { ...requestFilters, page: 1 };
    setRequestFilters(next);
    loadRequests(next);
  };

  const applyMethodFilters = () => {
    loadMethods(methodFilters);
  };

  const changeRequestPage = (page) => {
    const next = { ...requestFilters, page };
    setRequestFilters(next);
    loadRequests(next);
  };

  const refreshAll = () => {
    loadMethods(methodFilters);
    loadRequests(requestFilters);
  };

  const openCreateMethod = () => {
    setMethodForm({ ...EMPTY_METHOD_FORM, fields: [] });
    setModal({ open: true, type: "method-form", mode: "create", data: null });
  };

  const openEditMethod = (method) => {
    setMethodForm({
      name: method.name || "",
      slug: method.slug || "",
      provider_type: method.provider_type || "manual",
      description: method.description || "",
      instructions: method.instructions || "",
      account_name: method.account_name || "",
      account_number: method.account_number || "",
      branch_name: method.branch_name || "",
      routing_number: method.routing_number || "",
      currency: method.currency || "BDT",
      min_amount: safeNumber(method.min_amount, 0),
      max_amount: method.max_amount ?? "",
      is_active: Boolean(method.is_active),
      sort_order: safeNumber(method.sort_order, 0),
      fields: Array.isArray(method.fields)
        ? method.fields.map((field, index) => ({
            ...EMPTY_FIELD,
            ...field,
            options: Array.isArray(field.options) ? field.options : normalizeOptions(field.options),
            sort_order: field.sort_order ?? index,
          }))
        : [],
    });

    setModal({ open: true, type: "method-form", mode: "edit", data: method });
  };

  const openRequestDetails = async (payment) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${PAYMENT_ENDPOINT}/admin/requests/${getId(payment)}`, {
        method: "GET",
      });

      setModal({
        open: true,
        type: "request-view",
        mode: "view",
        data: result.payment || payment,
      });
    } catch (err) {
      showToast("error", err.message || "Could not load payment request.");
    } finally {
      setActionLoading(false);
    }
  };

  const openReviewModal = (payment, action) => {
    setReviewForm({
      action,
      review_note:
        action === "approve"
          ? "Payment verified by admin. Membership activated."
          : "Payment information could not be verified.",
    });

    setModal({ open: true, type: "review", mode: action, data: payment });
  };

  const closeModal = () => {
    if (actionLoading) return;
    setModal({ open: false, type: "", mode: "create", data: null });
  };

  const submitMethodForm = async (event) => {
    event.preventDefault();
    setActionLoading(true);

    try {
      const isCreate = modal.mode === "create";
      const id = getId(modal.data);

      if (!methodForm.name.trim()) {
        throw new Error("Payment method name is required.");
      }

      const payload = {
        name: methodForm.name.trim(),
        slug: buildSlug(methodForm.slug || methodForm.name),
        provider_type: methodForm.provider_type || "manual",
        description: methodForm.description,
        instructions: methodForm.instructions,
        account_name: methodForm.account_name,
        account_number: methodForm.account_number,
        branch_name: methodForm.branch_name,
        routing_number: methodForm.routing_number,
        currency: String(methodForm.currency || "BDT").toUpperCase(),
        min_amount: safeNumber(methodForm.min_amount, 0),
        max_amount:
          methodForm.max_amount === "" || methodForm.max_amount === null
            ? null
            : safeNumber(methodForm.max_amount, null),
        is_active: Boolean(methodForm.is_active),
        sort_order: safeNumber(methodForm.sort_order, 0),
        fields: methodForm.fields
          .filter((field) => String(field.label || "").trim())
          .map((field, index) => ({
            label: String(field.label || "").trim(),
            name: buildFieldName(field.name || field.label || `field_${index + 1}`),
            type: field.type || "text",
            required: Boolean(field.required),
            placeholder: field.placeholder || "",
            help_text: field.help_text || "",
            options: normalizeOptions(field.options),
            validation_regex: field.validation_regex || "",
            sort_order: safeNumber(field.sort_order, index),
          })),
      };

      const result = await requestJson(
        isCreate ? `${PAYMENT_ENDPOINT}/admin/methods` : `${PAYMENT_ENDPOINT}/admin/methods/${id}`,
        {
          method: isCreate ? "POST" : "PATCH",
          body: JSON.stringify(payload),
        }
      );

      showToast("success", result.message || "Payment method saved successfully.");
      closeModal();
      loadMethods(methodFilters);
    } catch (err) {
      showToast("error", err.message || "Could not save payment method.");
    } finally {
      setActionLoading(false);
    }
  };

  const togglePaymentMethod = async (method) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${PAYMENT_ENDPOINT}/admin/methods/${getId(method)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !method.is_active }),
      });

      showToast("success", result.message || "Payment method status updated.");
      loadMethods(methodFilters);
    } catch (err) {
      showToast("error", err.message || "Could not update payment method status.");
    } finally {
      setActionLoading(false);
    }
  };

  const deletePaymentMethod = async (method) => {
    if (!window.confirm(`Delete "${method.name}" payment method?`)) return;

    setActionLoading(true);

    try {
      const result = await requestJson(`${PAYMENT_ENDPOINT}/admin/methods/${getId(method)}`, {
        method: "DELETE",
      });

      showToast("success", result.message || "Payment method deleted successfully.");
      loadMethods(methodFilters);
    } catch (err) {
      showToast("error", err.message || "Could not delete payment method.");
    } finally {
      setActionLoading(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setActionLoading(true);

    try {
      const paymentId = getId(modal.data);
      const endpoint =
        reviewForm.action === "approve"
          ? `${PAYMENT_ENDPOINT}/admin/requests/${paymentId}/approve`
          : `${PAYMENT_ENDPOINT}/admin/requests/${paymentId}/reject`;

      const result = await requestJson(endpoint, {
        method: "PATCH",
        body: JSON.stringify({ review_note: reviewForm.review_note }),
      });

      showToast("success", result.message || "Payment request updated successfully.");
      closeModal();
      loadRequests(requestFilters);
    } catch (err) {
      showToast("error", err.message || "Could not update payment request.");
    } finally {
      setActionLoading(false);
    }
  };

  const pendingLoaded = requests.filter((item) => item.status === "pending").length;
  const approvedLoaded = requests.filter((item) => item.status === "approved").length;
  const activeMethods = methods.filter((item) => item.is_active).length;

  return (
    <div className="relative space-y-5">
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-rose-700">
            <WalletCards className="h-3.5 w-3.5" />
            Payment Control
          </p>
          <h2 className="mt-3 text-2xl font-black text-slate-950">Membership Payments</h2>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
            Review user payment requests, approve memberships, reject invalid payments, and manage dynamic payment methods.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refreshAll}
            disabled={loadingRequests || loadingMethods}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loadingRequests || loadingMethods ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateMethod}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-extrabold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
          >
            <Plus className="h-4 w-4" />
            Add Method
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MiniStat icon={ClipboardCheck} label="Pending Loaded" value={pendingLoaded} tone="rose" />
        <MiniStat icon={ShieldCheck} label="Approved Loaded" value={approvedLoaded} tone="emerald" />
        <MiniStat icon={CreditCard} label="Active Methods" value={activeMethods} tone="violet" />
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <TabButton
            active={activeTab === "requests"}
            icon={Banknote}
            label="Payment Requests"
            onClick={() => setActiveTab("requests")}
          />
          <TabButton
            active={activeTab === "methods"}
            icon={Settings2}
            label="Payment Methods"
            onClick={() => setActiveTab("methods")}
          />
        </div>
      </div>

      <ErrorBox error={error} />

      {activeTab === "requests" ? (
        <section className="space-y-4">
          <RequestsFilterBar
            filters={requestFilters}
            methods={methods}
            loading={loadingRequests}
            onChange={updateRequestFilter}
            onApply={applyRequestFilters}
          />

          <PaymentRequestsTable
            requests={requests}
            loading={loadingRequests}
            actionLoading={actionLoading}
            onView={openRequestDetails}
            onApprove={(payment) => openReviewModal(payment, "approve")}
            onReject={(payment) => openReviewModal(payment, "reject")}
          />

          <Pagination
            page={requestsMeta.page}
            totalPages={requestsMeta.totalPages}
            loading={loadingRequests}
            onPage={changeRequestPage}
          />
        </section>
      ) : null}

      {activeTab === "methods" ? (
        <section className="space-y-4">
          <MethodsFilterBar
            filters={methodFilters}
            loading={loadingMethods}
            onChange={updateMethodFilter}
            onApply={applyMethodFilters}
          />

          <PaymentMethodsTable
            methods={methods}
            loading={loadingMethods}
            actionLoading={actionLoading}
            onEdit={openEditMethod}
            onToggle={togglePaymentMethod}
            onDelete={deletePaymentMethod}
          />
        </section>
      ) : null}

      <Modal open={modal.open} onClose={closeModal} size={modal.type === "method-form" ? "wide" : "normal"}>
        {modal.type === "method-form" ? (
          <PaymentMethodForm
            mode={modal.mode}
            form={methodForm}
            setForm={setMethodForm}
            loading={actionLoading}
            onClose={closeModal}
            onSubmit={submitMethodForm}
          />
        ) : null}

        {modal.type === "request-view" ? (
          <PaymentRequestView
            payment={modal.data}
            loading={actionLoading}
            onClose={closeModal}
            onApprove={(payment) => openReviewModal(payment, "approve")}
            onReject={(payment) => openReviewModal(payment, "reject")}
          />
        ) : null}

        {modal.type === "review" ? (
          <ReviewPaymentForm
            payment={modal.data}
            form={reviewForm}
            setForm={setReviewForm}
            loading={actionLoading}
            onSubmit={submitReview}
            onClose={closeModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function RequestsFilterBar({ filters, methods, loading, onChange, onApply }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-700">
        <Filter className="h-4 w-4 text-rose-600" />
        Filter payment requests
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_170px_220px_auto]">
        <SearchInput
          value={filters.search}
          onChange={(value) => onChange("search", value)}
          placeholder="Search transaction ID, payment note, review note..."
        />

        <Select
          value={filters.status}
          onChange={(value) => onChange("status", value)}
          options={[
            ["all", "All Status"],
            ["pending", "Pending"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
            ["cancelled", "Cancelled"],
          ]}
        />

        <Select
          value={filters.paymentMethodId}
          onChange={(value) => onChange("paymentMethodId", value)}
          options={[
            ["all", "All Methods"],
            ...methods.map((method) => [getId(method), method.name || method.slug || "Method"]),
          ]}
        />

        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Apply
        </button>
      </div>
    </div>
  );
}

function MethodsFilterBar({ filters, loading, onChange, onApply }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-extrabold text-slate-700">
        <SlidersHorizontal className="h-4 w-4 text-rose-600" />
        Filter payment methods
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_170px_190px_auto]">
        <SearchInput
          value={filters.search}
          onChange={(value) => onChange("search", value)}
          placeholder="Search method name, slug, account number..."
        />

        <Select
          value={filters.status}
          onChange={(value) => onChange("status", value)}
          options={[
            ["all", "All Status"],
            ["active", "Active"],
            ["inactive", "Inactive"],
          ]}
        />

        <Select
          value={filters.provider_type}
          onChange={(value) => onChange("provider_type", value)}
          options={[["all", "All Providers"], ...PROVIDER_TYPES]}
        />

        <button
          type="button"
          onClick={onApply}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Apply
        </button>
      </div>
    </div>
  );
}

function PaymentRequestsTable({ requests, loading, actionLoading, onView, onApprove, onReject }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full min-w-[1180px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-4 font-extrabold">User</th>
              <th className="px-4 py-4 font-extrabold">Plan</th>
              <th className="px-4 py-4 font-extrabold">Amount</th>
              <th className="px-4 py-4 font-extrabold">Method</th>
              <th className="px-4 py-4 font-extrabold">Transaction</th>
              <th className="px-4 py-4 font-extrabold">Status</th>
              <th className="px-4 py-4 font-extrabold">Submitted</th>
              <th className="px-4 py-4 text-right font-extrabold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableLoading colSpan={8} text="Loading payment requests..." />
            ) : requests.length ? (
              requests.map((payment) => (
                <tr key={getId(payment)} className="transition hover:bg-rose-50/30">
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-sm font-black text-slate-900">{getUserName(payment.user)}</p>
                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        {payment.user?.phone_number || payment.user?.email_address || "No contact"}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-slate-800">
                      {payment.membership?.name || payment.plan_snapshot?.name || "Plan"}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                      /{payment.membership?.slug || payment.plan_snapshot?.slug || "no-slug"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-black text-slate-900">
                      {payment.currency || payment.plan_snapshot?.currency || "BDT"} {safeNumber(payment.amount, 0).toLocaleString()}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-slate-700">
                      {payment.payment_method?.name || payment.payment_method_snapshot?.name || "Method"}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold capitalize text-slate-400">
                      {payment.payment_method?.provider_type || payment.payment_method_snapshot?.provider_type || "manual"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex max-w-[180px] truncate rounded-full bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-slate-600">
                      {payment.transaction_id || "N/A"}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge status={payment.status} />
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-slate-600">{cleanDate(payment.submitted_at || payment.createdAt)}</p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton title="View" onClick={() => onView(payment)} disabled={actionLoading}>
                        <Eye className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title="Approve"
                        success
                        disabled={actionLoading || payment.status !== "pending"}
                        onClick={() => onApprove(payment)}
                      >
                        <Check className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title="Reject"
                        danger
                        disabled={actionLoading || payment.status !== "pending"}
                        onClick={() => onReject(payment)}
                      >
                        <X className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmpty colSpan={8} text="No payment requests found." />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentMethodsTable({ methods, loading, actionLoading, onEdit, onToggle, onDelete }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="max-h-[640px] overflow-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-4 font-extrabold">Method</th>
              <th className="px-4 py-4 font-extrabold">Provider</th>
              <th className="px-4 py-4 font-extrabold">Account</th>
              <th className="px-4 py-4 font-extrabold">Amount Rules</th>
              <th className="px-4 py-4 font-extrabold">Fields</th>
              <th className="px-4 py-4 font-extrabold">Status</th>
              <th className="px-4 py-4 font-extrabold">Sort</th>
              <th className="px-4 py-4 text-right font-extrabold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <TableLoading colSpan={8} text="Loading payment methods..." />
            ) : methods.length ? (
              methods.map((method) => (
                <tr key={getId(method)} className="transition hover:bg-rose-50/30">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-600">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{method.name || "Unnamed Method"}</p>
                        <p className="mt-0.5 text-xs font-semibold text-slate-400">/{method.slug || "no-slug"}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <Badge value={method.provider_type || "manual"} tone="violet" />
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-slate-700">{method.account_name || "N/A"}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">{method.account_number || "No account number"}</p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-extrabold text-slate-700">
                      Min: {method.currency || "BDT"} {safeNumber(method.min_amount, 0).toLocaleString()}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-400">
                      Max: {method.max_amount ? `${method.currency || "BDT"} ${safeNumber(method.max_amount, 0).toLocaleString()}` : "No limit"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex max-w-[260px] flex-wrap gap-1.5">
                      {(method.fields || []).slice(0, 3).map((field) => (
                        <span key={field._id || field.name} className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-slate-500">
                          {field.label}
                        </span>
                      ))}
                      {(method.fields || []).length > 3 ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-extrabold text-slate-500">
                          +{method.fields.length - 3}
                        </span>
                      ) : null}
                      {!(method.fields || []).length ? <span className="text-xs font-bold text-slate-400">No extra fields</span> : null}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <Badge value={method.is_active ? "Active" : "Inactive"} tone={method.is_active ? "emerald" : "rose"} />
                  </td>

                  <td className="px-4 py-4">
                    <span className="text-sm font-black text-slate-700">{method.sort_order ?? 0}</span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton title="Edit" onClick={() => onEdit(method)} disabled={actionLoading}>
                        <Edit3 className="h-4 w-4" />
                      </IconButton>

                      <IconButton title={method.is_active ? "Disable" : "Activate"} onClick={() => onToggle(method)} disabled={actionLoading}>
                        {method.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </IconButton>

                      <IconButton title="Delete" danger onClick={() => onDelete(method)} disabled={actionLoading}>
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmpty colSpan={8} text="No payment methods found." />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentMethodForm({ mode, form, setForm, loading, onSubmit, onClose }) {
  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateField = (index, key, value) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)),
    }));
  };

  const addField = () => {
    setForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          ...EMPTY_FIELD,
          sort_order: prev.fields.length,
        },
      ],
    }));
  };

  const removeField = (index) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const autoSlug = () => {
    if (mode === "create" && !form.slug) update("slug", buildSlug(form.name));
  };

  return (
    <form onSubmit={onSubmit} className="flex max-h-[88vh] flex-col overflow-hidden rounded-3xl bg-white">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5">
        <div>
          <h3 className="text-xl font-black text-slate-950">
            {mode === "create" ? "Create Payment Method" : "Update Payment Method"}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Add account details, payment instructions, limits, and user input fields.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto p-5">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Field label="Method Name" required>
            <Input value={form.name} onChange={(value) => update("name", value)} onBlur={autoSlug} placeholder="bKash Personal" />
          </Field>

          <Field label="Slug">
            <Input value={form.slug} onChange={(value) => update("slug", buildSlug(value))} placeholder="bkash-personal" />
          </Field>

          <Field label="Provider Type">
            <Select value={form.provider_type} onChange={(value) => update("provider_type", value)} options={PROVIDER_TYPES} />
          </Field>

          <Field label="Account Name">
            <Input value={form.account_name} onChange={(value) => update("account_name", value)} placeholder="Ghotoker Bari" />
          </Field>

          <Field label="Account Number">
            <Input value={form.account_number} onChange={(value) => update("account_number", value)} placeholder="01XXXXXXXXX" />
          </Field>

          <Field label="Currency">
            <Input value={form.currency} onChange={(value) => update("currency", value.toUpperCase())} placeholder="BDT" />
          </Field>

          <Field label="Branch Name">
            <Input value={form.branch_name} onChange={(value) => update("branch_name", value)} placeholder="Bank branch name" />
          </Field>

          <Field label="Routing Number">
            <Input value={form.routing_number} onChange={(value) => update("routing_number", value)} placeholder="Bank routing number" />
          </Field>

          <Field label="Sort Order">
            <Input type="number" value={form.sort_order} onChange={(value) => update("sort_order", value)} />
          </Field>

          <Field label="Min Amount">
            <Input type="number" min="0" value={form.min_amount} onChange={(value) => update("min_amount", value)} />
          </Field>

          <Field label="Max Amount">
            <Input type="number" min="0" value={form.max_amount} onChange={(value) => update("max_amount", value)} placeholder="Empty = no limit" />
          </Field>

          <div className="lg:col-span-1">
            <ToggleRow
              label="Active Method"
              desc="Inactive methods will not show to users."
              checked={form.is_active}
              onChange={(value) => update("is_active", value)}
            />
          </div>

          <div className="lg:col-span-3">
            <Field label="Short Description">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(value) => update("description", value)}
                placeholder="Example: Send money to this number and submit your transaction ID."
              />
            </Field>
          </div>

          <div className="lg:col-span-3">
            <Field label="Payment Instructions">
              <Textarea
                rows={5}
                value={form.instructions}
                onChange={(value) => update("instructions", value)}
                placeholder="Write clear instructions for users. Example: 1. Open bKash app 2. Send Money 3. Enter transaction ID."
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-950">User Payment Input Fields</h4>
              <p className="mt-1 text-xs font-medium text-slate-500">
                These fields will be shown to users during membership purchase.
              </p>
            </div>

            <button
              type="button"
              onClick={addField}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-extrabold text-white transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </button>
          </div>

          <div className="space-y-4">
            {form.fields.length ? (
              form.fields.map((field, index) => (
                <div key={index} className="rounded-3xl border border-slate-100 bg-white p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">Field #{index + 1}</p>
                      <p className="text-xs font-semibold text-slate-400">
                        Name: {field.name || buildFieldName(field.label) || "not-set"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <Field label="Label" required>
                      <Input
                        value={field.label}
                        onChange={(value) => {
                          updateField(index, "label", value);
                          if (!field.name) updateField(index, "name", buildFieldName(value));
                        }}
                        placeholder="Transaction ID"
                      />
                    </Field>

                    <Field label="Name">
                      <Input value={field.name} onChange={(value) => updateField(index, "name", buildFieldName(value))} placeholder="transaction_id" />
                    </Field>

                    <Field label="Type">
                      <Select value={field.type} onChange={(value) => updateField(index, "type", value)} options={FIELD_TYPES} />
                    </Field>

                    <Field label="Sort Order">
                      <Input type="number" value={field.sort_order ?? index} onChange={(value) => updateField(index, "sort_order", value)} />
                    </Field>

                    <Field label="Placeholder">
                      <Input value={field.placeholder} onChange={(value) => updateField(index, "placeholder", value)} placeholder="Enter transaction ID" />
                    </Field>

                    <Field label="Help Text">
                      <Input value={field.help_text} onChange={(value) => updateField(index, "help_text", value)} placeholder="Shown under input" />
                    </Field>

                    <Field label="Validation Regex">
                      <Input value={field.validation_regex} onChange={(value) => updateField(index, "validation_regex", value)} placeholder="Optional regex" />
                    </Field>

                    <ToggleRow
                      label="Required"
                      desc="User must fill this field."
                      checked={Boolean(field.required)}
                      onChange={(value) => updateField(index, "required", value)}
                    />

                    {field.type === "select" ? (
                      <div className="lg:col-span-4">
                        <Field label="Select Options">
                          <Input
                            value={Array.isArray(field.options) ? field.options.join(", ") : field.options || ""}
                            onChange={(value) => updateField(index, "options", value)}
                            placeholder="Option 1, Option 2, Option 3"
                          />
                        </Field>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
                <FileText className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-extrabold text-slate-600">No custom fields added</p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Add fields like Transaction ID, Sender Number, Payment Date, or Bank Slip Number.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white p-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {mode === "create" ? "Create Method" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function PaymentRequestView({ payment, onClose, onApprove, onReject }) {
  const values = payment?.payment_values || {};
  const methodSnapshot = payment?.payment_method_snapshot || {};
  const planSnapshot = payment?.plan_snapshot || {};
  const proofFiles = Array.isArray(payment?.proof_files) ? payment.proof_files : [];

  return (
    <div className="flex max-h-[88vh] flex-col overflow-hidden rounded-3xl bg-white">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5">
        <div>
          <h3 className="text-xl font-black text-slate-950">Payment Request Details</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Review submitted payment information before approving membership.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="overflow-y-auto p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <InfoCard label="Status" value={<StatusBadge status={payment?.status} />} />
          <InfoCard label="Amount" value={`${payment?.currency || planSnapshot.currency || "BDT"} ${safeNumber(payment?.amount, 0).toLocaleString()}`} />
          <InfoCard label="Submitted" value={cleanDate(payment?.submitted_at || payment?.createdAt)} />
          <InfoCard label="Reviewed" value={cleanDate(payment?.reviewed_at)} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DetailCard title="User Information">
            <InfoLine label="Name" value={getUserName(payment?.user)} />
            <InfoLine label="Email" value={payment?.user?.email_address || "N/A"} />
            <InfoLine label="Phone" value={payment?.user?.phone_number || "N/A"} />
            <InfoLine label="Current Status" value={payment?.user?.membership_status || "N/A"} />
          </DetailCard>

          <DetailCard title="Membership Plan">
            <InfoLine label="Plan" value={payment?.membership?.name || planSnapshot.name || "N/A"} />
            <InfoLine label="Slug" value={payment?.membership?.slug || planSnapshot.slug || "N/A"} />
            <InfoLine label="Price" value={`${planSnapshot.currency || payment?.currency || "BDT"} ${safeNumber(planSnapshot.price || payment?.amount, 0).toLocaleString()}`} />
            <InfoLine label="Duration" value={payment?.membership?.duration_days || planSnapshot.duration_days ? `${payment?.membership?.duration_days || planSnapshot.duration_days} days` : "No expiry"} />
          </DetailCard>

          <DetailCard title="Payment Method">
            <InfoLine label="Method" value={payment?.payment_method?.name || methodSnapshot.name || "N/A"} />
            <InfoLine label="Provider" value={payment?.payment_method?.provider_type || methodSnapshot.provider_type || "manual"} />
            <InfoLine label="Account Name" value={methodSnapshot.account_name || "N/A"} />
            <InfoLine label="Account Number" value={methodSnapshot.account_number || "N/A"} />
          </DetailCard>

          <DetailCard title="Submitted Payment Info">
            <InfoLine label="Transaction ID" value={payment?.transaction_id || "N/A"} />
            {Object.keys(values).length ? (
              Object.entries(values).map(([key, value]) => (
                <InfoLine key={key} label={key.replaceAll("_", " ")} value={String(value || "N/A")} />
              ))
            ) : (
              <p className="text-sm font-semibold text-slate-400">No custom payment values submitted.</p>
            )}
          </DetailCard>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <DetailCard title="Payment Note">
            <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
              {payment?.payment_note || "No payment note provided."}
            </p>
          </DetailCard>

          <DetailCard title="Review Note">
            <p className="whitespace-pre-wrap text-sm font-medium leading-6 text-slate-600">
              {payment?.review_note || "No review note yet."}
            </p>
          </DetailCard>
        </div>

        {proofFiles.length ? (
          <DetailCard title="Proof Files" className="mt-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {proofFiles.map((file, index) => (
                <a
                  key={`${file}-${index}`}
                  href={file}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-extrabold text-rose-600 transition hover:bg-rose-50"
                >
                  Proof file #{index + 1}
                </a>
              ))}
            </div>
          </DetailCard>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white p-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50"
        >
          Close
        </button>

        {payment?.status === "pending" ? (
          <>
            <button
              type="button"
              onClick={() => onReject(payment)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-5 text-sm font-extrabold text-rose-700 transition hover:bg-rose-100"
            >
              <X className="h-4 w-4" />
              Reject
            </button>

            <button
              type="button"
              onClick={() => onApprove(payment)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700"
            >
              <Check className="h-4 w-4" />
              Approve & Activate
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ReviewPaymentForm({ payment, form, setForm, loading, onSubmit, onClose }) {
  const isApprove = form.action === "approve";

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h3 className="text-xl font-black text-slate-950">
            {isApprove ? "Approve Payment" : "Reject Payment"}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {isApprove
              ? "Approving will activate the purchased membership for this user."
              : "Rejecting will keep the user membership unchanged."}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-5">
        <div className={`mb-4 rounded-2xl border p-4 ${isApprove ? "border-emerald-100 bg-emerald-50 text-emerald-800" : "border-rose-100 bg-rose-50 text-rose-800"}`}>
          <p className="text-sm font-black">
            {payment?.membership?.name || payment?.plan_snapshot?.name || "Membership Plan"}
          </p>
          <p className="mt-1 text-xs font-bold opacity-80">
            User: {getUserName(payment?.user)} · Amount: {payment?.currency || "BDT"} {safeNumber(payment?.amount, 0).toLocaleString()}
          </p>
        </div>

        <Field label="Admin Review Note">
          <Textarea
            rows={5}
            value={form.review_note}
            onChange={(value) => setForm((prev) => ({ ...prev, review_note: value }))}
            placeholder="Write a short note for audit trail..."
          />
        </Field>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-white shadow-lg transition disabled:opacity-60 ${
            isApprove ? "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700" : "bg-rose-600 shadow-rose-100 hover:bg-rose-700"
          }`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isApprove ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {isApprove ? "Approve & Activate" : "Reject Payment"}
        </button>
      </div>
    </form>
  );
}

function MiniStat({ icon: Icon, label, value, tone = "rose" }) {
  const tones = {
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
        </div>

        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone] || tones.rose}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-black transition ${
        active ? "bg-rose-600 text-white shadow-lg shadow-rose-100" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
      />
    </div>
  );
}

function Input({ value, onChange, onBlur, type = "text", min, placeholder }) {
  return (
    <input
      type={type}
      min={min}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    />
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-extrabold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
    >
      {options.map(([val, label]) => (
        <option key={val} value={val}>
          {label}
        </option>
      ))}
    </select>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-700">
        {label} {required ? <span className="text-rose-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex min-h-[68px] items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-black text-slate-800">{label}</p>
        {desc ? <p className="mt-1 text-xs font-medium text-slate-500">{desc}</p> : null}
      </div>

      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-rose-600" : "bg-slate-200"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </div>
  );
}

function Badge({ value, tone = "slate" }) {
  const colors = {
    emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
    rose: "border-rose-100 bg-rose-50 text-rose-700",
    violet: "border-violet-100 bg-violet-50 text-violet-700",
    amber: "border-amber-100 bg-amber-50 text-amber-700",
    slate: "border-slate-100 bg-slate-50 text-slate-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-black capitalize ${colors[tone] || colors.slate}`}>
      {value || "N/A"}
    </span>
  );
}

function StatusBadge({ status }) {
  const tone = {
    pending: "amber",
    approved: "emerald",
    rejected: "rose",
    cancelled: "slate",
  }[status] || "slate";

  return <Badge value={status || "unknown"} tone={tone} />;
}

function IconButton({ children, title, onClick, disabled, danger, success }) {
  let classes = "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100";

  if (danger) classes = "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100";
  if (success) classes = "border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100";

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-9 w-9 place-items-center rounded-xl border text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${classes}`}
    >
      {children}
    </button>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-2 text-sm font-black text-slate-900">{value}</div>
    </div>
  );
}

function DetailCard({ title, children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-slate-100 bg-slate-50/70 p-4 ${className}`}>
      <h4 className="mb-3 text-sm font-black text-slate-950">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
      <span className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-extrabold text-slate-800">{value || "N/A"}</span>
    </div>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-bold text-rose-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{error}</span>
    </div>
  );
}

function TableLoading({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 text-sm font-black text-slate-500">
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
        <p className="text-sm font-black text-slate-500">{text}</p>
      </td>
    </tr>
  );
}

function Pagination({ page, totalPages, loading, onPage }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        type="button"
        disabled={loading || page <= 1}
        onClick={() => onPage(page - 1)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <span className="rounded-xl bg-slate-50 px-4 py-2 text-sm font-black text-slate-600">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        disabled={loading || page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Modal({ open, onClose, children, size = "normal" }) {
  if (!open) return null;

  const sizeClass = size === "wide" ? "max-w-6xl" : "max-w-4xl";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <button type="button" aria-label="Close modal" className="absolute inset-0" onClick={onClose} />
      <div className={`relative w-full ${sizeClass} overflow-hidden rounded-3xl shadow-2xl`}>{children}</div>
    </div>
  );
}

function Toast({ type, message }) {
  const isError = type === "error";

  return (
    <div
      className={`fixed right-5 top-5 z-[1000] flex max-w-sm items-start gap-3 rounded-2xl border p-4 text-sm font-black shadow-xl ${
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
