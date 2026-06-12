"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle,
  ChevronDown,
  Eye,
  FileText,
  Heart,
  Home,
  IdCard,
  Image as ImageIcon,
  Info,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const USERS_ENDPOINT = `${API_BASE_URL}/api/admin/users`;

const DEFAULT_FILTERS = {
  search: "",
  verification: "all",
  profile_status: "all",
  account_status: "all",
  gender: "all",
  religion: "all",
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

function getFullName(user) {
  return (
    user?.full_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    "Unnamed User"
  );
}

function getUserDisplayName(value) {
  if (!value) return "N/A";

  // Never expose raw MongoDB ObjectId strings in the UI.
  if (typeof value === "string") return "N/A";

  if (typeof value === "object") {
    const fullName =
      value.full_name ||
      `${value.first_name || ""} ${value.last_name || ""}`.trim();

    return (
      fullName ||
      value.username ||
      value.email_address ||
      value.email ||
      "N/A"
    );
  }

  return "N/A";
}


function getInitial(name) {
  return String(name || "U").trim().charAt(0).toUpperCase();
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

function cleanStatus(value) {
  return String(value || "unknown").replaceAll("_", " ");
}

function badgeClass(value) {
  const val = String(value || "").toLowerCase();

  if (["active", "approved", "verified", "true", "yes"].includes(val)) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (
    ["pending", "pending_review", "incomplete", "inactive", "unverified", "false", "no"].includes(
      val
    )
  ) {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (["suspended", "rejected", "deleted", "hidden"].includes(val)) {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }

  return "border-slate-100 bg-slate-50 text-slate-700";
}

function isNormalUserOnly(user) {
  const role = String(user?.role || "user").toLowerCase();
  return !["admin", "moderator", "superadmin"].includes(role);
}

function buildQuery(filters, cursor) {
  const params = new URLSearchParams();

  params.set("limit", String(filters.limit || 20));

  if (cursor) params.set("cursor", cursor);
  if (filters.search?.trim()) params.set("search", filters.search.trim());

  if (filters.verification === "verified") params.set("isVerified", "true");
  if (filters.verification === "unverified") params.set("isVerified", "false");

  if (filters.profile_status && filters.profile_status !== "all") {
    params.set("profile_status", filters.profile_status);
  }

  if (filters.account_status && filters.account_status !== "all") {
    params.set("account_status", filters.account_status);
  }

  if (filters.gender && filters.gender !== "all") {
    params.set("gender", filters.gender);
  }

  if (filters.religion && filters.religion !== "all") {
    params.set("religion", filters.religion);
  }

  return params.toString();
}

function formatValue(value) {
  if (value === undefined || value === null || value === "") return "N/A";

  if (typeof value === "boolean") return value ? "Yes" : "No";

  if (Array.isArray(value)) {
    if (!value.length) return "N/A";
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value).replaceAll("_", " ");
}

function valueExists(value) {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

export default function UserVerificationPanel() {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const token = currentUser?.token || localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasNext, setHasNext] = useState(false);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [modal, setModal] = useState({
    open: false,
    type: "",
    data: null,
  });

  const [rejectReason, setRejectReason] = useState("");

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

  const loadUsers = async ({ reset = true, nextFilters = filters } = {}) => {
    setLoading(true);
    setError("");

    try {
      const query = buildQuery(nextFilters, reset ? null : cursor);

      const result = await requestJson(`${USERS_ENDPOINT}?${query}`, {
        method: "GET",
      });

      const rows = result.items || result.users || result.data || [];
      const userOnlyRows = rows.filter(isNormalUserOnly);

      setUsers((prev) => (reset ? userOnlyRows : [...prev, ...userOnlyRows]));
      setCursor(result.nextCursor || null);
      setHasNext(Boolean(result.hasNextPage));
    } catch (err) {
      setError(err.message || "Could not load verification users.");
      if (reset) setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadUsers({ reset: true, nextFilters: filters });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    loadUsers({ reset: true, nextFilters: DEFAULT_FILTERS });
  };

  const switchVerification = (value) => {
    const next = { ...filters, verification: value };
    setFilters(next);
    loadUsers({ reset: true, nextFilters: next });
  };

  const closeModal = () => {
    if (actionLoading) return;

    setModal({
      open: false,
      type: "",
      data: null,
    });

    setRejectReason("");
  };

  const openViewUser = async (user) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${USERS_ENDPOINT}/${getId(user)}`, {
        method: "GET",
      });

      const finalUser = result.user || user;

      if (!isNormalUserOnly(finalUser)) {
        throw new Error("Only normal users can be shown in verification panel.");
      }

      setModal({
        open: true,
        type: "viewUser",
        data: finalUser,
      });
    } catch (err) {
      showToast("error", err.message || "Could not load user details.");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectUser = (user) => {
    setRejectReason("");
    setModal({
      open: true,
      type: "rejectUser",
      data: user,
    });
  };

  const verifyUser = async (user) => {
    if (!user || actionLoading) return;

    setActionLoading(true);

    try {
      const result = await requestJson(`${USERS_ENDPOINT}/${getId(user)}/verify`, {
        method: "PATCH",
        body: JSON.stringify({
          isVerified: true,
          nid_verified: true,
          photo_verified: true,
          phone_verified: true,
          email_verified: true,
        }),
      });

      showToast("success", result.message || "User verified successfully.");
      loadUsers({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not verify user.");
    } finally {
      setActionLoading(false);
    }
  };

  const rejectUser = async (event) => {
    event.preventDefault();

    if (!modal.data || actionLoading) return;

    setActionLoading(true);

    try {
      const result = await requestJson(
        `${USERS_ENDPOINT}/${getId(modal.data)}/verify`,
        {
          method: "PATCH",
          body: JSON.stringify({
            isVerified: false,
            rejection_reason: rejectReason || "Profile rejected by admin.",
          }),
        }
      );

      showToast("success", result.message || "User marked as unverified/rejected.");
      closeModal();
      loadUsers({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not reject user.");
    } finally {
      setActionLoading(false);
    }
  };

  const loadedUsers = users.length;
  const verifiedUsers = users.filter((item) => Boolean(item.isVerified)).length;
  const unverifiedUsers = users.filter((item) => !item.isVerified).length;
  const pendingProfiles = users.filter((item) =>
    ["pending", "pending_review", "incomplete"].includes(
      String(item.profile_status || item?.verification?.verification_status || "").toLowerCase()
    )
  ).length;

  return (
    <div className="relative">
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">User Verification</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review normal users only, see all registered profile data, verify or reject.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => switchVerification("all")}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              filters.verification === "all"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-100"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            } cursor-pointer`}
          >
            <Users className="h-4 w-4 cursor-pointer" />
            All Users
          </button>

          <button
            type="button"
            onClick={() => switchVerification("verified")}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              filters.verification === "verified"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            } cursor-pointer`}
          >
            <UserCheck className="h-4 w-4 cursor-pointer" />
            Verified
          </button>

          <button
            type="button"
            onClick={() => switchVerification("unverified")}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              filters.verification === "unverified"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-100"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            } cursor-pointer`}
          >
            <AlertCircle className="h-4 w-4 cursor-pointer" />
            Unverified
          </button>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat icon={Users} label="Loaded Users" value={loadedUsers} />
        <MiniStat icon={BadgeCheck} label="Verified Loaded" value={verifiedUsers} />
        <MiniStat icon={AlertCircle} label="Unverified Loaded" value={unverifiedUsers} />
        <MiniStat icon={ShieldCheck} label="Pending Profiles" value={pendingProfiles} />
      </div>

      <div className="mb-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_170px_170px_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search by name, email, phone..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
            />
          </div>

          <Select
            value={filters.profile_status}
            onChange={(value) => updateFilter("profile_status", value)}
            options={[
              ["all", "All Profiles"],
              ["incomplete", "Incomplete"],
              ["pending_review", "Pending Review"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
              ["hidden", "Hidden"],
            ]}
          />

          <Select
            value={filters.account_status}
            onChange={(value) => updateFilter("account_status", value)}
            options={[
              ["all", "All Accounts"],
              ["active", "Active"],
              ["inactive", "Inactive"],
              ["suspended", "Suspended"],
              ["deleted", "Deleted"],
            ]}
          />

          <button
            type="button"
            onClick={applyFilters}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""} cursor-pointer`} />
            Apply
          </button>

          <button
            type="button"
            onClick={resetFilters}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
          >
            Reset
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Select
            value={filters.verification}
            onChange={(value) => updateFilter("verification", value)}
            options={[
              ["all", "All Verification"],
              ["verified", "Verified Only"],
              ["unverified", "Unverified Only"],
            ]}
          />

          <Select
            value={filters.gender}
            onChange={(value) => updateFilter("gender", value)}
            options={[
              ["all", "All Gender"],
              ["male", "Male"],
              ["female", "Female"],
              ["other", "Other"],
            ]}
          />

          <Select
            value={filters.religion}
            onChange={(value) => updateFilter("religion", value)}
            options={[
              ["all", "All Religion"],
              ["Islam", "Islam"],
              ["Hinduism", "Hinduism"],
              ["Buddhism", "Buddhism"],
              ["Christianity", "Christianity"],
              ["Other", "Other"],
            ]}
          />
        </div>
      </div>

      <ErrorBox error={error} />

      <VerificationTable
        users={users}
        loading={loading}
        actionLoading={actionLoading}
        onView={openViewUser}
        onVerify={verifyUser}
        onReject={openRejectUser}
      />

      <LoadMore
        show={hasNext}
        loading={loading}
        onClick={() => loadUsers({ reset: false })}
      />

      <Modal open={modal.open} onClose={closeModal}>
        {modal.type === "viewUser" ? (
          <ViewUser
            user={modal.data}
            actionLoading={actionLoading}
            onClose={closeModal}
            onVerify={verifyUser}
            onReject={openRejectUser}
          />
        ) : null}

        {modal.type === "rejectUser" ? (
          <RejectUserForm
            user={modal.data}
            reason={rejectReason}
            setReason={setRejectReason}
            loading={actionLoading}
            onSubmit={rejectUser}
            onClose={closeModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function VerificationTable({
  users,
  loading,
  actionLoading,
  onView,
  onVerify,
  onReject,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="max-h-[650px] overflow-auto">
        <table className="w-full min-w-[1120px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-4 font-bold">User</th>
              <th className="px-4 py-4 font-bold">Contact</th>
              <th className="px-4 py-4 font-bold">Profile</th>
              <th className="px-4 py-4 font-bold">Account</th>
              <th className="px-4 py-4 font-bold">Verification</th>
              <th className="px-4 py-4 font-bold">Membership</th>
              <th className="px-4 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <TableLoading colSpan={7} text="Loading user verification list..." />
            ) : users.length ? (
              users.map((user) => (
                <tr
                  key={getId(user)}
                  onClick={() => onView(user)}
                  className="cursor-pointer transition hover:bg-rose-50/30 active:bg-rose-50"
                >
                  <td className="cursor-pointer px-4 py-4">
                    <UserCell user={user} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <ContactCell user={user} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <StatusBadge value={cleanStatus(user.profile_status)} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <StatusBadge value={cleanStatus(user.account_status)} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <VerifiedBadge verified={user.isVerified} />
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      {user?.membership?.name ||
                        user?.membership_status?.name ||
                        "Free Plan"}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {typeof user?.membership_status === "string"
                        ? user.membership_status
                        : user?.membership_status?.status || "free"}
                    </p>
                  </td>

                  <td className="cursor-pointer px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton title="View All Data" onClick={() => onView(user)}>
                        <Eye className="h-4 w-4" />
                      </IconButton>

                      <button
                        type="button"
                        disabled={actionLoading || Boolean(user.isVerified)}
                        onClick={(event) => {
                          event.stopPropagation();
                          onVerify(user);
                        }}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Verify
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={(event) => {
                          event.stopPropagation();
                          onReject(user);
                        }}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmpty colSpan={7} text="No normal users found." />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ViewUser({ user, actionLoading, onClose, onVerify, onReject }) {
  const photos = Array.isArray(user?.profile_photos) ? user.profile_photos : [];

  return (
    <div>
      <ModalHeader
        title="Full User Verification Data"
        text="All registered normal-user data from the User model. Password is never shown."
        onClose={onClose}
      />

      <div className="mb-5 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-rose-50 text-xl font-black text-rose-600">
            {getInitial(getFullName(user))}
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-950">
              {getFullName(user)}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <VerifiedBadge verified={user?.isVerified} />
              <StatusBadge value={cleanStatus(user?.profile_status)} />
              <StatusBadge value={cleanStatus(user?.account_status)} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={actionLoading || Boolean(user?.isVerified)}
            onClick={() => onVerify(user)}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            Verify User
          </button>

          <button
            type="button"
            disabled={actionLoading}
            onClick={() => onReject(user)}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>
      </div>

      <ProfilePhotos photos={photos} />

      <DataSection icon={Lock} title="Account & System" defaultOpen>
        <Detail label="User ID" value={user?._id} />
        <Detail label="Role" value={user?.role} />
        <Detail label="Username" value={user?.username} />
        <Detail label="First Name" value={user?.first_name} />
        <Detail label="Last Name" value={user?.last_name} />
        <Detail label="Full Name" value={getFullName(user)} />
        <Detail label="Email Address" value={user?.email_address} />
        <Detail label="Phone Number" value={user?.phone_number} />
        <Detail label="Full Name Normalized" value={user?.full_name_normalized} />
        <Detail label="Email Normalized" value={user?.email_normalized} />
        <Detail label="Phone Normalized" value={user?.phone_normalized} />
        <Detail label="Profile Status" value={cleanStatus(user?.profile_status)} />
        <Detail label="Account Status" value={cleanStatus(user?.account_status)} />
        <Detail label="Profile Completeness" value={`${user?.profile_completeness || 0}%`} />
        <Detail label="Profile Views" value={user?.profile_views_count} />
        <Detail label="Shortlisted Count" value={user?.shortlisted_by_count} />
        <Detail label="Last Active" value={formatDateTime(user?.last_active_at)} />
        <Detail label="Last Login" value={formatDateTime(user?.last_login)} />
        <Detail label="Created At" value={formatDateTime(user?.createdAt)} />
        <Detail label="Updated At" value={formatDateTime(user?.updatedAt)} />
      </DataSection>

      <DataSection icon={IdCard} title="Identity & Basic Matrimony Profile">
        <Detail label="Date of Birth" value={formatDate(user?.dob)} />
        <Detail label="Age" value={user?.age} />
        <Detail label="Gender" value={user?.gender} />
        <Detail label="Profile Created By" value={user?.profile_created_by} />
        <Detail label="Marital Status" value={cleanStatus(user?.marital_status)} />
        <Detail label="Religion" value={user?.religion} />
        <Detail label="Sect" value={user?.sect} />
        <Detail label="Caste / Community" value={user?.caste_or_community} />
        <Detail label="Mother Tongue" value={user?.mother_tongue} />
        <Detail label="Nationality" value={user?.nationality} />
        <Detail label="NID" value={user?.nid} sensitive />
        <Detail label="Passport" value={user?.passport} sensitive />
        <Detail label="Photo Visibility" value={user?.profile_photo_visibility} />
        <WideDetail label="About Me" value={user?.about_me} />
      </DataSection>

      <DataSection icon={Users} title="Children Details">
        <Detail label="Has Children" value={user?.children?.has_children} />
        <Detail label="Number of Children" value={user?.children?.number_of_children} />
        <Detail label="Children Living With" value={user?.children?.children_living_with} />
      </DataSection>

      <DataSection icon={Info} title="Physical Details">
        <Detail label="Height" value={user?.height} />
        <Detail label="Height CM" value={user?.height_cm} />
        <Detail label="Weight" value={user?.weight} />
        <Detail label="Weight KG" value={user?.weight_kg} />
        <Detail label="Body Type" value={user?.body_type} />
        <Detail label="Complexion" value={user?.complexion} />
        <Detail label="Blood Group" value={user?.blood_group} />
        <Detail label="Has Disability" value={user?.disability?.has_disability} />
        <WideDetail label="Disability Details" value={user?.disability?.details} />
      </DataSection>

      <DataSection icon={MapPin} title="Location Details">
        <Detail label="Current Country" value={user?.current_country} />
        <Detail label="Current Division" value={user?.current_division} />
        <Detail label="Current District" value={user?.current_district} />
        <Detail label="Current City" value={user?.current_city} />
        <Detail label="Present Address" value={user?.present_address} sensitive />
        <Detail label="Permanent Division" value={user?.permanent_division} />
        <Detail label="Permanent District" value={user?.permanent_district} />
        <Detail label="Permanent Upazila" value={user?.permanent_upazila} />
        <Detail label="Permanent Address" value={user?.permanent_address} sensitive />
        <Detail label="Preferred Location" value={user?.preferred_location} />
        <Detail label="Willing To Relocate" value={user?.willing_to_relocate} />
      </DataSection>

      <DataSection icon={FileText} title="Education Details">
        <Detail label="Highest Education" value={user?.highest_education} />
        <Detail label="Degree Name" value={user?.education_details?.degree_name} />
        <Detail label="Institution Name" value={user?.education_details?.institution_name} />
        <Detail label="Passing Year" value={user?.education_details?.passing_year} />
        <Detail label="Result" value={user?.education_details?.result} />
      </DataSection>

      <DataSection icon={BriefcaseBusiness} title="Profession & Income">
        <Detail label="Profession" value={user?.profession} />
        <Detail label="Occupation Type" value={user?.occupation_type} />
        <Detail label="Company / Business Name" value={user?.company_or_business_name} />
        <Detail label="Designation" value={user?.designation} />
        <Detail label="Annual Income" value={user?.annual_income} />
        <Detail label="Monthly Income" value={user?.monthly_income} />
        <Detail label="Monthly Income Min" value={user?.monthly_income_min} />
        <Detail label="Monthly Income Max" value={user?.monthly_income_max} />
      </DataSection>

      <DataSection icon={Home} title="Family Details">
        <Detail label="Father Name" value={user?.family?.father_name} sensitive />
        <Detail label="Father Occupation" value={user?.family?.father_occupation} />
        <Detail label="Mother Name" value={user?.family?.mother_name} sensitive />
        <Detail label="Mother Occupation" value={user?.family?.mother_occupation} />
        <Detail label="Family Type" value={user?.family?.family_type} />
        <Detail label="Family Status" value={user?.family?.family_status} />
        <Detail label="Family Values" value={user?.family?.family_values} />
        <Detail label="Number of Brothers" value={user?.family?.number_of_brothers} />
        <Detail label="Number of Sisters" value={user?.family?.number_of_sisters} />
        <Detail label="Brothers Married" value={user?.family?.brothers_married} />
        <Detail label="Sisters Married" value={user?.family?.sisters_married} />
        <WideDetail label="Family Details" value={user?.family?.family_details} />
      </DataSection>

      <DataSection icon={Heart} title="Lifestyle Details">
        <Detail label="Diet" value={user?.lifestyle?.diet} />
        <Detail label="Smoking" value={user?.lifestyle?.smoking} />
        <Detail label="Drinking" value={user?.lifestyle?.drinking} />
        <Detail label="Prayer" value={user?.lifestyle?.prayer} />
        <Detail
          label="Hijab / Beard Preference"
          value={user?.lifestyle?.hijab_or_beard_preference}
        />
        <Detail label="Hobbies" value={user?.lifestyle?.hobbies} />
      </DataSection>

      <DataSection icon={Heart} title="Partner Preferences">
        <Detail label="Looking For" value={user?.partner_preferences?.looking_for} />
        <Detail label="Age Range Min" value={user?.partner_preferences?.age_range_min} />
        <Detail label="Age Range Max" value={user?.partner_preferences?.age_range_max} />
        <Detail
          label="Preferred Height Min CM"
          value={user?.partner_preferences?.preferred_height_min_cm}
        />
        <Detail
          label="Preferred Height Max CM"
          value={user?.partner_preferences?.preferred_height_max_cm}
        />
        <Detail
          label="Preferred Religion"
          value={user?.partner_preferences?.preferred_religion}
        />
        <Detail
          label="Preferred Marital Status"
          value={user?.partner_preferences?.preferred_marital_status}
        />
        <Detail
          label="Preferred Education"
          value={user?.partner_preferences?.preferred_education}
        />
        <Detail
          label="Preferred Profession"
          value={user?.partner_preferences?.preferred_profession}
        />
        <Detail
          label="Preferred Division"
          value={user?.partner_preferences?.preferred_division}
        />
        <Detail
          label="Preferred District"
          value={user?.partner_preferences?.preferred_district}
        />
        <Detail
          label="Preferred Country"
          value={user?.partner_preferences?.preferred_country}
        />
        <Detail
          label="Preferred Family Status"
          value={user?.partner_preferences?.preferred_family_status}
        />
        <Detail
          label="Accept Divorced"
          value={user?.partner_preferences?.accept_divorced}
        />
        <Detail
          label="Accept Widowed"
          value={user?.partner_preferences?.accept_widowed}
        />
        <Detail
          label="Accept With Children"
          value={user?.partner_preferences?.accept_with_children}
        />
        <WideDetail
          label="Other Expectations"
          value={user?.partner_preferences?.other_expectations}
        />
      </DataSection>

      <DataSection icon={FileText} title="Old Flat Compatibility Fields">
        <Detail label="Looking For" value={user?.looking_for} />
        <Detail label="Age Range Min" value={user?.age_range_min} />
        <Detail label="Age Range Max" value={user?.age_range_max} />
      </DataSection>

      <DataSection icon={ShieldCheck} title="Verification Details">
        <Detail label="Is Verified" value={user?.isVerified} />
        <Detail label="Verified At" value={formatDateTime(user?.verifiedAt)} />
        <Detail label="Verified By" value={getUserDisplayName(user?.verifiedBy)} />
        <Detail label="Email Verified" value={user?.verification?.email_verified} />
        <Detail label="Phone Verified" value={user?.verification?.phone_verified} />
        <Detail label="NID Verified" value={user?.verification?.nid_verified} />
        <Detail label="Photo Verified" value={user?.verification?.photo_verified} />
        <Detail label="Biodata Verified" value={user?.verification?.biodata_verified} />
        <Detail
          label="Verification Status"
          value={user?.verification?.verification_status}
        />
        <WideDetail
          label="Rejection Reason"
          value={user?.verification?.rejection_reason}
        />
      </DataSection>

      <DataSection icon={BadgeCheck} title="Membership Details">
        <Detail label="Membership ID" value={user?.membership?._id || user?.membership_status?.plan_id} />
        <Detail label="Plan Name" value={user?.membership?.name || user?.membership_status?.name} />
        <Detail label="Plan Slug" value={user?.membership?.slug || user?.membership_status?.slug} />
        <Detail label="Membership Status" value={user?.membership_status?.status || user?.membership_status} />
        <Detail label="Membership Active" value={user?.membership_status?.active} />
        <Detail label="Is Free" value={user?.membership_status?.is_free} />
        <Detail label="Is Paid" value={user?.membership_status?.is_paid} />
        <Detail label="Started At" value={formatDateTime(user?.membership_started_at || user?.membership_status?.started_at)} />
        <Detail label="Expiry" value={formatDateTime(user?.membership_expiry || user?.membership_status?.expiry)} />
        <Detail label="Days Left" value={user?.membership_status?.days_left} />
        <WideDetail label="Membership Features" value={user?.membership_status?.features || user?.membership?.features} />
      </DataSection>

      <DataSection icon={Lock} title="Privacy Settings">
        <Detail label="Show Phone" value={user?.privacy?.show_phone} />
        <Detail label="Show Email" value={user?.privacy?.show_email} />
        <Detail label="Show Address" value={user?.privacy?.show_address} />
        <Detail label="Show Income" value={user?.privacy?.show_income} />
        <Detail label="Show Family Details" value={user?.privacy?.show_family_details} />
        <Detail label="Allow Profile View" value={user?.privacy?.allow_profile_view} />
        <Detail label="Allow Messages" value={user?.privacy?.allow_messages} />
      </DataSection>

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white px-5 pb-5 pt-5 shadow-[0_-10px_25px_rgba(15,23,42,0.06)] sm:-mx-6 sm:-mb-6 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
        <button
          type="button"
          onClick={onClose}
          className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ProfilePhotos({ photos }) {
  if (!photos.length) {
    return (
      <div className="mb-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-400">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">Profile Photos</p>
            <p className="mt-1 text-sm text-slate-500">No profile photos uploaded.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-3xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">Profile Photos</p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {photos.length} photo{photos.length > 1 ? "s" : ""} uploaded
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {photos.map((photo, index) => (
          <a
            key={`${photo}-${index}`}
            href={photo}
            target="_blank"
            rel="noreferrer"
            className="group aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 cursor-pointer"
          >
            <img
              src={photo}
              alt={`Profile ${index + 1}`}
              className="h-full w-full object-cover transition duration-300 ease-out group-hover:scale-105"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function DataSection({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={`mb-4 overflow-hidden rounded-3xl border bg-white shadow-sm transition-all duration-300 ease-out ease-out ${
        open
          ? "border-rose-100 shadow-rose-100/60"
          : "border-slate-100 shadow-slate-100/70 hover:border-rose-100/70 hover:shadow-md"
      } cursor-pointer`}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="group flex w-full cursor-pointer items-center justify-between gap-4 bg-white px-4 py-4 text-left transition-all duration-300 ease-out ease-out hover:bg-rose-50/35 active:scale-[0.995]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 ease-out ease-out ${
              open
                ? "bg-rose-100 text-rose-600"
                : "bg-rose-50 text-rose-500 group-hover:scale-105 group-hover:bg-rose-100"
            } cursor-pointer`}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-[15px] font-semibold text-slate-900 sm:text-base">
              {title}
            </h4>
            <p className="mt-0.5 text-xs font-medium text-slate-400 transition-colors duration-300 group-hover:text-rose-500">
              {open ? "Click to collapse" : "Click to expand"}
            </p>
          </div>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-slate-50 text-slate-500 transition-all duration-300 ease-out ease-out group-hover:border-rose-100 group-hover:bg-white group-hover:text-rose-600 ${
            open ? "rotate-180 border-rose-100 bg-white text-rose-600" : "rotate-0 border-slate-100"
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 bg-white p-4">
            <div
              className={`grid grid-cols-1 gap-3 transition-all duration-300 ease-out ease-out md:grid-cols-2 xl:grid-cols-3 ${
                open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
              }`}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Detail({ label, value, sensitive = false }) {
  const hasValue = valueExists(value);

  return (
    <div
      className={`rounded-2xl border p-4 ${
        sensitive
          ? "border-amber-100 bg-amber-50/50"
          : "border-slate-100 bg-slate-50"
      }`}
    >
      <div className="mb-1 flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        {sensitive ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700">
            Sensitive
          </span>
        ) : null}
      </div>

      <p
        className={`break-words text-sm font-medium capitalize ${
          hasValue ? "text-slate-800" : "text-slate-400"
        }`}
      >
        {formatValue(value)}
      </p>
    </div>
  );
}

function WideDetail({ label, value }) {
  const hasValue = valueExists(value);

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 md:col-span-2 xl:col-span-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <pre
        className={`mt-2 whitespace-pre-wrap break-words font-sans text-sm font-medium leading-6 ${
          hasValue ? "text-slate-700" : "text-slate-400"
        }`}
      >
        {formatValue(value)}
      </pre>
    </div>
  );
}

function RejectUserForm({
  user,
  reason,
  setReason,
  loading,
  onSubmit,
  onClose,
}) {
  return (
    <form onSubmit={onSubmit}>
      <ModalHeader
        title="Reject / Mark Unverified"
        text={`Write a reason for ${getFullName(user)}. This keeps the user visible in the unverified list.`}
        onClose={onClose}
      />

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-700">
          Rejection Reason
        </span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Example: NID photo is unclear, profile photo missing, phone not matched..."
          rows={5}
          className="w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        />
      </label>

      <ModalFooter
        loading={loading}
        onClose={onClose}
        submitLabel="Reject / Mark Unverified"
        danger
      />
    </form>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close modal"
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-900/10">
        <div className="isolate overflow-y-auto bg-white p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalHeader({ title, text, onClose }) {
  return (
    <div className="sticky top-0 z-50 -mx-5 -mt-5 mb-5 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 pb-4 pt-5 shadow-[0_10px_28px_rgba(15,23,42,0.08)] sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6">
      <div className="min-w-0">
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{text}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 active:scale-95"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function ModalFooter({ loading, onClose, submitLabel, danger = false }) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="h-11 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white transition disabled:opacity-60 ${
          danger
            ? "bg-rose-600 hover:bg-rose-700"
            : "bg-slate-950 hover:bg-slate-800"
        } cursor-pointer`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin cursor-pointer" /> : null}
        {submitLabel}
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
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 cursor-pointer"
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

function UserCell({ user }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-sm font-black text-rose-600">
        {getInitial(getFullName(user))}
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">
          {getFullName(user)}
        </p>
        <p className="truncate text-xs font-medium text-slate-400">
          Joined {formatDate(user?.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ContactCell({ user }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="max-w-[220px] truncate">
          {user?.email_address || "No email"}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <span className="max-w-[220px] truncate">
          {user?.phone_number || "No phone"}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${badgeClass(
        value
      )} cursor-pointer`}
    >
      {value || "Unknown"}
    </span>
  );
}

function VerifiedBadge({ verified }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
      <UserCheck className="h-3.5 w-3.5" />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
      <AlertCircle className="h-3.5 w-3.5" />
      Unverified
    </span>
  );
}

function IconButton({ title, children, onClick, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-sm text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

function ErrorBox({ error }) {
  if (!error) return null;

  return (
    <div className="mb-5 rounded-3xl border border-amber-100 bg-amber-50 p-4">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h3 className="text-sm font-bold text-amber-900">Request Failed</h3>
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
            <Users className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">{text}</h3>
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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 cursor-pointer"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Load More Users
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
        } cursor-pointer`}
      >
        {success ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        <p className="text-sm font-bold">{message}</p>
      </div>
    </div>
  );
}
