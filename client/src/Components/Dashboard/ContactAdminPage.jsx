"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Eye,
  Loader2,
  Mail,
  MessageSquareText,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CONTACT_ADMIN_ENDPOINT = `${API_BASE_URL}/api/contact/admin`;
const CONTACT_STATS_ENDPOINT = `${API_BASE_URL}/api/contact/admin/stats`;

const TOPICS = [
  "Profile verification",
  "Premium membership",
  "Matchmaking & concierge",
  "Report an issue",
  "Partnerships",
  "Other",
];

const CHANNELS = ["Email", "Phone", "WhatsApp"];

const DEFAULT_FILTERS = {
  q: "",
  topic: "all",
  channel: "all",
  limit: 20,
};

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getId(item) {
  return item?._id || item?.id;
}

function formatDateTime(value) {
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

function cleanValue(value) {
  if (value === undefined || value === null || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function getInitial(name) {
  return String(name || "C").trim().charAt(0).toUpperCase();
}

function badgeClass(value) {
  const val = String(value || "").toLowerCase();

  if (["email"].includes(val)) {
    return "border-sky-100 bg-sky-50 text-sky-700";
  }

  if (["phone"].includes(val)) {
    return "border-violet-100 bg-violet-50 text-violet-700";
  }

  if (["whatsapp"].includes(val)) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (["report an issue"].includes(val)) {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }

  if (["premium membership"].includes(val)) {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  return "border-slate-100 bg-slate-50 text-slate-700";
}

function buildQuery(filters, cursor) {
  const params = new URLSearchParams();

  params.set("limit", String(filters.limit || 20));

  if (cursor) params.set("cursor", cursor);

  if (filters.q?.trim()) {
    params.set("q", filters.q.trim());
  }

  if (filters.topic && filters.topic !== "all") {
    params.set("topic", filters.topic);
  }

  if (filters.channel && filters.channel !== "all") {
    params.set("channel", filters.channel);
  }

  return params.toString();
}

export default function ContactAdminPage() {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const token = currentUser?.token || localStorage.getItem("token");

  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
  });

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    type: "",
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

    if (!response.ok || result?.success === false) {
      throw new Error(result.message || result.error || "Request failed.");
    }

    return result;
  };

  const loadStats = async () => {
    setStatsLoading(true);

    try {
      const result = await requestJson(CONTACT_STATS_ENDPOINT, {
        method: "GET",
      });

      setStats({
        total: result?.stats?.total || 0,
        today: result?.stats?.today || 0,
      });
    } catch (err) {
      showToast("error", err.message || "Could not load contact stats.");
    } finally {
      setStatsLoading(false);
    }
  };

  const loadContacts = async ({ reset = true, nextFilters = filters } = {}) => {
    setLoading(true);
    setError("");

    try {
      const query = buildQuery(nextFilters, reset ? null : cursor);

      const result = await requestJson(`${CONTACT_ADMIN_ENDPOINT}?${query}`, {
        method: "GET",
      });

      const rows = result.contacts || [];
      const pagination = result.pagination || {};

      setContacts((prev) => (reset ? rows : [...prev, ...rows]));
      setCursor(pagination.nextCursor || null);
      setHasMore(Boolean(pagination.hasMore));
    } catch (err) {
      setError(err.message || "Could not load contact messages.");
      if (reset) setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadContacts({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    loadContacts({ reset: true, nextFilters: filters });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    loadContacts({ reset: true, nextFilters: DEFAULT_FILTERS });
  };

  const refreshAll = () => {
    loadStats();
    loadContacts({ reset: true });
  };

  const closeModal = () => {
    if (actionLoading) return;

    setModal({
      open: false,
      type: "",
      data: null,
    });
  };

  const openViewContact = async (contact) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${CONTACT_ADMIN_ENDPOINT}/${getId(contact)}`, {
        method: "GET",
      });

      setModal({
        open: true,
        type: "view",
        data: result.contact || contact,
      });
    } catch (err) {
      showToast("error", err.message || "Could not load contact details.");
    } finally {
      setActionLoading(false);
    }
  };

  const openDeleteContact = (contact) => {
    setModal({
      open: true,
      type: "delete",
      data: contact,
    });
  };

  const deleteContact = async () => {
    if (!modal.data || actionLoading) return;

    setActionLoading(true);

    try {
      const result = await requestJson(
        `${CONTACT_ADMIN_ENDPOINT}/${getId(modal.data)}`,
        {
          method: "DELETE",
        }
      );

      showToast("success", result.message || "Contact deleted successfully.");

      setContacts((prev) =>
        prev.filter((item) => String(getId(item)) !== String(getId(modal.data)))
      );

      closeModal();
      loadStats();
    } catch (err) {
      showToast("error", err.message || "Could not delete contact.");
    } finally {
      setActionLoading(false);
    }
  };

  const loadedCount = contacts.length;

  return (
    <div className="relative">
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Contact Messages
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            View, search, filter, and delete public contact form messages.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshAll}
          disabled={loading || statsLoading}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading || statsLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MiniStat
          icon={MessageSquareText}
          label="Total Messages"
          value={statsLoading ? "..." : stats.total}
        />
        <MiniStat
          icon={Mail}
          label="Today"
          value={statsLoading ? "..." : stats.today}
        />
        <MiniStat icon={Users} label="Loaded" value={loadedCount} />
      </div>

      <div className="mb-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_230px_170px_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.q}
              onChange={(event) => updateFilter("q", event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") applyFilters();
              }}
              placeholder="Search name, email, phone, topic, message..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </div>

          <Select
            value={filters.topic}
            onChange={(value) => updateFilter("topic", value)}
            options={[
              ["all", "All Topics"],
              ...TOPICS.map((topic) => [topic, topic]),
            ]}
          />

          <Select
            value={filters.channel}
            onChange={(value) => updateFilter("channel", value)}
            options={[
              ["all", "All Channels"],
              ...CHANNELS.map((channel) => [channel, channel]),
            ]}
          />

          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Apply
          </button>

          <button
            type="button"
            onClick={resetFilters}
            disabled={loading}
            className="inline-flex h-11 cursor-pointer items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset
          </button>
        </div>
      </div>

      <ErrorBox error={error} />

      <ContactTable
        contacts={contacts}
        loading={loading}
        actionLoading={actionLoading}
        onView={openViewContact}
        onDelete={openDeleteContact}
      />

      <LoadMore
        show={hasMore}
        loading={loading}
        onClick={() => loadContacts({ reset: false })}
      />

      <Modal open={modal.open} onClose={closeModal}>
        {modal.type === "view" ? (
          <ViewContact contact={modal.data} onClose={closeModal} />
        ) : null}

        {modal.type === "delete" ? (
          <DeleteConfirm
            contact={modal.data}
            loading={actionLoading}
            onClose={closeModal}
            onConfirm={deleteContact}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function ContactTable({
  contacts,
  loading,
  actionLoading,
  onView,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="max-h-[650px] overflow-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-4 font-semibold">Sender</th>
              <th className="px-4 py-4 font-semibold">Contact</th>
              <th className="px-4 py-4 font-semibold">Topic</th>
              <th className="px-4 py-4 font-semibold">Channel</th>
              <th className="px-4 py-4 font-semibold">Message</th>
              <th className="px-4 py-4 font-semibold">Date</th>
              <th className="px-4 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <TableLoading colSpan={7} text="Loading contact messages..." />
            ) : contacts.length ? (
              contacts.map((contact) => (
                <tr
                  key={getId(contact)}
                  onClick={() => onView(contact)}
                  className="cursor-pointer transition hover:bg-rose-50/30 active:bg-rose-50"
                >
                  <td className="cursor-pointer px-4 py-4">
                    <SenderCell contact={contact} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <ContactCell contact={contact} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <StatusBadge value={contact.topic} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <StatusBadge value={contact.channel} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <p className="line-clamp-2 max-w-[300px] text-sm leading-6 text-slate-600">
                      {contact.message || "N/A"}
                    </p>
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <p className="text-sm font-semibold text-slate-700">
                      {formatDate(contact.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(contact.createdAt)}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton
                        title="View Details"
                        onClick={() => onView(contact)}
                        disabled={actionLoading}
                      >
                        <Eye className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title="Delete Contact"
                        onClick={() => onDelete(contact)}
                        disabled={actionLoading}
                        danger
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmpty colSpan={7} text="No contact messages found." />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ViewContact({ contact, onClose }) {
  return (
    <div>
      <ModalHeader
        title="Contact Message Details"
        text="Full message submitted from the public contact form."
        onClose={onClose}
      />

      <div className="mb-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-rose-50 text-lg font-black text-rose-600">
            {getInitial(contact?.name)}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              {cleanValue(contact?.name)}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Submitted {formatDateTime(contact?.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Detail label="Contact ID" value={contact?._id} />
        <Detail label="Name" value={contact?.name} />
        <Detail label="Email" value={contact?.email} />
        <Detail label="Phone" value={contact?.phone} />
        <Detail label="Topic" value={contact?.topic} />
        <Detail label="Preferred Channel" value={contact?.channel} />
        <Detail label="Consent" value={contact?.consent} />
        <Detail label="Created At" value={formatDateTime(contact?.createdAt)} />
        <Detail label="Updated At" value={formatDateTime(contact?.updatedAt)} />
        <Detail label="Deleted" value={contact?.is_deleted} />
      </div>

      <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Message
        </p>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
          {contact?.message || "No message found."}
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-11 cursor-pointer rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.98]"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function DeleteConfirm({ contact, loading, onClose, onConfirm }) {
  return (
    <div>
      <ModalHeader
        title="Delete Contact Message"
        text="This will soft delete the contact message from the admin list."
        onClose={onClose}
      />

      <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <h4 className="text-sm font-semibold text-rose-900">
              Are you sure you want to delete this message?
            </h4>
            <p className="mt-1 text-sm leading-6 text-rose-700">
              Sender: <span className="font-semibold">{contact?.name || "N/A"}</span>
            </p>
            <p className="text-sm leading-6 text-rose-700">
              Topic: <span className="font-semibold">{contact?.topic || "N/A"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Delete Message
        </button>
      </div>
    </div>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalHeader({ title, text, onClose }) {
  return (
    <div className="sticky top-0 z-20 mb-5 flex items-start justify-between gap-4 border-b border-slate-100 bg-white pb-4 shadow-sm">
      <div>
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100 active:scale-[0.98]"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>
            {label}
          </option>
        ))}
      </select>

      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
        </div>
      </div>
    </div>
  );
}

function SenderCell({ contact }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-sm font-black text-rose-600">
        {getInitial(contact?.name)}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">
          {contact?.name || "Unknown Sender"}
        </p>
        <p className="truncate text-xs font-medium text-slate-400">
          {contact?.topic || "No topic"}
        </p>
      </div>
    </div>
  );
}

function ContactCell({ contact }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="max-w-[220px] truncate">
          {contact?.email || "No email"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="max-w-[220px] truncate">
          {contact?.phone || "No phone"}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
        value
      )}`}
    >
      {value || "Unknown"}
    </span>
  );
}

function IconButton({ title, children, onClick, disabled, danger = false }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      disabled={disabled}
      className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border text-sm transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {cleanValue(value)}
      </p>
    </div>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;

  return (
    <div className="mb-5 rounded-3xl border border-amber-100 bg-amber-50 p-4">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h3 className="text-sm font-semibold text-amber-900">Request Failed</h3>
          <p className="mt-1 text-sm leading-6 text-amber-700">{error}</p>
        </div>
      </div>
    </div>
  );
}

function TableLoading({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <div className="mx-auto flex max-w-sm flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
          <p className="mt-3 text-sm font-semibold text-slate-600">{text}</p>
        </div>
      </td>
    </tr>
  );
}

function TableEmpty({ colSpan, text }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center">
        <div className="mx-auto max-w-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <MessageSquareText className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900">{text}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Try refreshing or changing filters.
          </p>
        </div>
      </td>
    </tr>
  );
}

function LoadMore({ show, loading, onClick }) {
  if (!show) return null;

  return (
    <div className="mt-5 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Load More Messages
      </button>
    </div>
  );
}

function Toast({ type, message }) {
  const success = type === "success";

  return (
    <div className="fixed right-5 top-24 z-[1000]">
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-2xl ${
          success
            ? "border-emerald-100 text-emerald-700"
            : "border-rose-100 text-rose-700"
        }`}
      >
        {success ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        <p className="text-sm font-semibold">{message}</p>
      </div>
    </div>
  );
}