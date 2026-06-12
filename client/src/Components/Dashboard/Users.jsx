"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle,
  ChevronDown,
  Crown,
  Eye,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserCog,
  Users,
  X,
  XCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const USERS_ENDPOINT = `${API_BASE_URL}/api/admin/users`;
const STAFF_ENDPOINT = `${API_BASE_URL}/api/admin/staff`;

const ADMIN_PERMISSIONS = [
  { value: "create_users", label: "Create Users" },
  { value: "view_users", label: "View Users" },
  { value: "update_users", label: "Update Users" },
  { value: "delete_users", label: "Delete Users" },
  { value: "verify_users", label: "Verify Users" },
  { value: "reject_users", label: "Reject Users" },
  { value: "suspend_users", label: "Suspend Users" },
  { value: "manage_memberships", label: "Manage Memberships" },
  { value: "manage_moderators", label: "Manage Moderators" },
];

const USER_EMPTY_FORM = {
  first_name: "",
  last_name: "",
  email_address: "",
  phone_number: "",
  password: "",
  dob: "",
  gender: "",
  religion: "",
  marital_status: "",
  current_division: "",
  current_district: "",
  current_city: "",
  profession: "",
  highest_education: "",
  profile_status: "pending_review",
  account_status: "active",
  isVerified: false,
};

const STAFF_EMPTY_FORM = {
  first_name: "",
  last_name: "",
  username: "",
  email_address: "",
  phone_number: "",
  password: "",
  role: "moderator",
  permissions: ["view_users", "update_users", "verify_users", "reject_users"],
  isVerified: true,
  admin_status: "active",
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
    "Unnamed"
  );
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

function getInitial(name) {
  return String(name || "U").trim().charAt(0).toUpperCase();
}

function badgeClass(type, value) {
  const val = String(value || "").toLowerCase();

  if (type === "role") {
    if (val === "superadmin") return "border-rose-100 bg-rose-50 text-rose-700";
    if (val === "moderator")
      return "border-violet-100 bg-violet-50 text-violet-700";
    return "border-slate-100 bg-slate-50 text-slate-700";
  }

  if (["active", "approved"].includes(val)) {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (["pending", "pending_review", "incomplete", "inactive"].includes(val)) {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (["suspended", "rejected", "deleted", "hidden"].includes(val)) {
    return "border-rose-100 bg-rose-50 text-rose-700";
  }

  return "border-slate-100 bg-slate-50 text-slate-700";
}

function cleanStatus(value) {
  return String(value || "unknown").replaceAll("_", " ");
}

function buildQuery(filters, cursor) {
  const params = new URLSearchParams();

  params.set("limit", String(filters.limit || 20));

  if (cursor) params.set("cursor", cursor);
  if (filters.search) params.set("search", filters.search.trim());

  Object.entries(filters).forEach(([key, value]) => {
    if (["search", "limit"].includes(key)) return;
    if (!value || value === "all") return;
    params.set(key, value);
  });

  return params.toString();
}

export default function UsersPanel() {
  const currentUser = useSelector((state) => state.user?.currentUser);
  const token = currentUser?.token;

  const [activeSection, setActiveSection] = useState("users");

  const [users, setUsers] = useState([]);
  const [staff, setStaff] = useState([]);

  const [usersCursor, setUsersCursor] = useState(null);
  const [staffCursor, setStaffCursor] = useState(null);

  const [usersHasNext, setUsersHasNext] = useState(false);
  const [staffHasNext, setStaffHasNext] = useState(false);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [userFilters, setUserFilters] = useState({
    search: "",
    profile_status: "all",
    account_status: "all",
    isVerified: "all",
    verification_status: "all",
    gender: "all",
    religion: "all",
    limit: 20,
  });

  const [staffFilters, setStaffFilters] = useState({
    search: "",
    role: "all",
    admin_status: "all",
    isVerified: "all",
    limit: 20,
  });

  const [modal, setModal] = useState({
    open: false,
    type: "",
    mode: "create",
    data: null,
  });

  const [userForm, setUserForm] = useState(USER_EMPTY_FORM);
  const [staffForm, setStaffForm] = useState(STAFF_EMPTY_FORM);
  const [rejectReason, setRejectReason] = useState("");
  const [resetPasswordValue, setResetPasswordValue] = useState("");

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

  const loadUsers = async ({ reset = true } = {}) => {
    setLoading(true);
    setError("");

    try {
      const query = buildQuery(userFilters, reset ? null : usersCursor);
      const result = await requestJson(`${USERS_ENDPOINT}?${query}`, {
        method: "GET",
      });

      const rows = result.items || result.users || result.data || [];

      setUsers((prev) => (reset ? rows : [...prev, ...rows]));
      setUsersCursor(result.nextCursor || null);
      setUsersHasNext(Boolean(result.hasNextPage));
    } catch (err) {
      setError(err.message || "Could not load users.");
      if (reset) setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async ({ reset = true } = {}) => {
    setLoading(true);
    setError("");

    try {
      const query = buildQuery(staffFilters, reset ? null : staffCursor);
      const result = await requestJson(`${STAFF_ENDPOINT}?${query}`, {
        method: "GET",
      });

      const rows = result.items || result.admins || result.staff || result.data || [];

      setStaff((prev) => (reset ? rows : [...prev, ...rows]));
      setStaffCursor(result.nextCursor || null);
      setStaffHasNext(Boolean(result.hasNextPage));
    } catch (err) {
      setError(err.message || "Could not load staff admins.");
      if (reset) setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrent = () => {
    if (activeSection === "staff") {
      loadStaff({ reset: true });
    } else {
      loadUsers({ reset: true });
    }
  };

  useEffect(() => {
    loadUsers({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUserFilter = (key, value) => {
    setUserFilters((prev) => ({ ...prev, [key]: value }));
  };

  const updateStaffFilter = (key, value) => {
    setStaffFilters((prev) => ({ ...prev, [key]: value }));
  };

  const openCreateUser = () => {
    setUserForm(USER_EMPTY_FORM);
    setModal({ open: true, type: "userForm", mode: "create", data: null });
  };

  const openEditUser = (user) => {
    setUserForm({
      ...USER_EMPTY_FORM,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email_address: user.email_address || "",
      phone_number: user.phone_number || "",
      password: "",
      dob: user.dob ? String(user.dob).slice(0, 10) : "",
      gender: user.gender || "",
      religion: user.religion || "",
      marital_status: user.marital_status || "",
      current_division: user.current_division || "",
      current_district: user.current_district || "",
      current_city: user.current_city || "",
      profession: user.profession || "",
      highest_education: user.highest_education || "",
      profile_status: user.profile_status || "pending_review",
      account_status: user.account_status || "active",
      isVerified: Boolean(user.isVerified),
    });

    setModal({ open: true, type: "userForm", mode: "edit", data: user });
  };

  const openViewUser = async (user) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${USERS_ENDPOINT}/${getId(user)}`, {
        method: "GET",
      });

      setModal({
        open: true,
        type: "viewUser",
        mode: "view",
        data: result.user || user,
      });
    } catch (err) {
      showToast("error", err.message || "Could not load user details.");
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectUser = (user) => {
    setRejectReason("");
    setModal({ open: true, type: "rejectUser", mode: "reject", data: user });
  };

  const openCreateStaff = () => {
    setStaffForm(STAFF_EMPTY_FORM);
    setModal({ open: true, type: "staffForm", mode: "create", data: null });
  };

  const openEditStaff = (admin) => {
    setStaffForm({
      ...STAFF_EMPTY_FORM,
      first_name: admin.first_name || "",
      last_name: admin.last_name || "",
      username: admin.username || "",
      email_address: admin.email_address || "",
      phone_number: admin.phone_number || "",
      password: "",
      role: admin.role || "moderator",
      permissions: Array.isArray(admin.permissions)
        ? admin.permissions
        : STAFF_EMPTY_FORM.permissions,
      isVerified: Boolean(admin.isVerified),
      admin_status: admin.admin_status || "active",
    });

    setModal({ open: true, type: "staffForm", mode: "edit", data: admin });
  };

  const openResetStaffPassword = (admin) => {
    setResetPasswordValue("");
    setModal({
      open: true,
      type: "resetStaffPassword",
      mode: "password",
      data: admin,
    });
  };

  const closeModal = () => {
    if (actionLoading) return;
    setModal({ open: false, type: "", mode: "create", data: null });
  };

  const submitUserForm = async (event) => {
    event.preventDefault();
    setActionLoading(true);

    try {
      const isCreate = modal.mode === "create";
      const id = getId(modal.data);

      const payload = {
        ...userForm,
        isVerified: Boolean(userForm.isVerified),
      };

      if (!isCreate) {
        delete payload.email_address;
        delete payload.password;
      }

      if (isCreate && !payload.password) {
        throw new Error("Password is required to create a user.");
      }

      const result = await requestJson(isCreate ? USERS_ENDPOINT : `${USERS_ENDPOINT}/${id}`, {
        method: isCreate ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      });

      showToast("success", result.message || "User saved successfully.");
      closeModal();
      loadUsers({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not save user.");
    } finally {
      setActionLoading(false);
    }
  };

  const submitStaffForm = async (event) => {
    event.preventDefault();
    setActionLoading(true);

    try {
      const isCreate = modal.mode === "create";
      const id = getId(modal.data);

      const payload = {
        ...staffForm,
        isVerified: Boolean(staffForm.isVerified),
      };

      if (!isCreate) {
        delete payload.email_address;
        delete payload.password;
      }

      if (isCreate && !payload.password) {
        throw new Error("Password is required to create staff.");
      }

      const result = await requestJson(isCreate ? STAFF_ENDPOINT : `${STAFF_ENDPOINT}/${id}`, {
        method: isCreate ? "POST" : "PATCH",
        body: JSON.stringify(payload),
      });

      showToast("success", result.message || "Staff saved successfully.");
      closeModal();
      loadStaff({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not save staff.");
    } finally {
      setActionLoading(false);
    }
  };

  const verifyUser = async (user) => {
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

      showToast("success", result.message || "User rejected successfully.");
      closeModal();
      loadUsers({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not reject user.");
    } finally {
      setActionLoading(false);
    }
  };

  const changeUserStatus = async (user, account_status) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${USERS_ENDPOINT}/${getId(user)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ account_status }),
      });

      showToast("success", result.message || "User status updated.");
      loadUsers({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not update status.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteUser = async (user, hard = false) => {
    const confirmText = hard
      ? "Permanently delete this user? This cannot be undone."
      : "Soft delete this user?";

    if (!window.confirm(confirmText)) return;

    setActionLoading(true);

    try {
      const result = await requestJson(
        `${USERS_ENDPOINT}/${getId(user)}?hard=${hard ? "true" : "false"}`,
        { method: "DELETE" }
      );

      showToast("success", result.message || "User deleted.");
      loadUsers({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  const verifyStaff = async (admin) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${STAFF_ENDPOINT}/${getId(admin)}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ isVerified: true }),
      });

      showToast("success", result.message || "Staff verified.");
      loadStaff({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not verify staff.");
    } finally {
      setActionLoading(false);
    }
  };

  const changeStaffStatus = async (admin, admin_status) => {
    setActionLoading(true);

    try {
      const result = await requestJson(`${STAFF_ENDPOINT}/${getId(admin)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ admin_status }),
      });

      showToast("success", result.message || "Staff status updated.");
      loadStaff({ reset: true });
    } catch (err) {
      showToast("error", err.message || "Could not update staff status.");
    } finally {
      setActionLoading(false);
    }
  };

  const resetStaffPassword = async (event) => {
    event.preventDefault();
    setActionLoading(true);

    try {
      if (!resetPasswordValue || resetPasswordValue.length < 6) {
        throw new Error("New password must be at least 6 characters.");
      }

      const result = await requestJson(
        `${STAFF_ENDPOINT}/${getId(modal.data)}/password`,
        {
          method: "PATCH",
          body: JSON.stringify({ password: resetPasswordValue }),
        }
      );

      showToast("success", result.message || "Password reset successfully.");
      closeModal();
    } catch (err) {
      showToast("error", err.message || "Could not reset password.");
    } finally {
      setActionLoading(false);
    }
  };

  const totalUsers = users.length;
  const verifiedUsers = users.filter((item) => item.isVerified).length;
  const pendingUsers = users.filter((item) =>
    ["pending", "pending_review", "incomplete"].includes(
      String(item.profile_status || item?.verification?.verification_status).toLowerCase()
    )
  ).length;

  const totalStaff = staff.length;
  const activeStaff = staff.filter((item) => item.admin_status === "active").length;

  return (
    <div className="relative">
      {toast ? <Toast type={toast.type} message={toast.message} /> : null}

      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Users & Admin Access
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage normal users, profile verification, account status, and admin staff.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveSection("users");
              loadUsers({ reset: true });
            }}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              activeSection === "users"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-100"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Users className="h-4 w-4" />
            Users
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSection("staff");
              loadStaff({ reset: true });
            }}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition ${
              activeSection === "staff"
                ? "bg-rose-600 text-white shadow-lg shadow-rose-100"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <UserCog className="h-4 w-4" />
            Staff Admins
          </button>
        </div>
      </div>

      {activeSection === "users" ? (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MiniStat icon={Users} label="Loaded Users" value={totalUsers} />
            <MiniStat icon={BadgeCheck} label="Verified" value={verifiedUsers} />
            <MiniStat icon={AlertCircle} label="Pending" value={pendingUsers} />
          </div>

          <PanelToolbar
            search={userFilters.search}
            onSearch={(value) => updateUserFilter("search", value)}
            onRefresh={() => loadUsers({ reset: true })}
            onCreate={openCreateUser}
            createLabel="Create User"
            loading={loading}
          >
            <Select
              value={userFilters.profile_status}
              onChange={(value) => updateUserFilter("profile_status", value)}
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
              value={userFilters.account_status}
              onChange={(value) => updateUserFilter("account_status", value)}
              options={[
                ["all", "All Accounts"],
                ["active", "Active"],
                ["inactive", "Inactive"],
                ["suspended", "Suspended"],
                ["deleted", "Deleted"],
              ]}
            />

            <Select
              value={userFilters.isVerified}
              onChange={(value) => updateUserFilter("isVerified", value)}
              options={[
                ["all", "All Verification"],
                ["true", "Verified"],
                ["false", "Not Verified"],
              ]}
            />

            <Select
              value={userFilters.gender}
              onChange={(value) => updateUserFilter("gender", value)}
              options={[
                ["all", "All Gender"],
                ["male", "Male"],
                ["female", "Female"],
                ["other", "Other"],
              ]}
            />
          </PanelToolbar>

          <ErrorBox error={error} />

          <UsersTable
            users={users}
            loading={loading}
            actionLoading={actionLoading}
            onView={openViewUser}
            onEdit={openEditUser}
            onVerify={verifyUser}
            onReject={openRejectUser}
            onStatus={changeUserStatus}
            onDelete={deleteUser}
          />

          <LoadMore
            show={usersHasNext}
            loading={loading}
            onClick={() => loadUsers({ reset: false })}
          />
        </>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MiniStat icon={UserCog} label="Loaded Staff" value={totalStaff} />
            <MiniStat icon={ShieldCheck} label="Active Staff" value={activeStaff} />
            <MiniStat icon={Crown} label="Super Admins" value={staff.filter((s) => s.role === "superadmin").length} />
          </div>

          <PanelToolbar
            search={staffFilters.search}
            onSearch={(value) => updateStaffFilter("search", value)}
            onRefresh={() => loadStaff({ reset: true })}
            onCreate={openCreateStaff}
            createLabel="Create Staff"
            loading={loading}
          >
            <Select
              value={staffFilters.role}
              onChange={(value) => updateStaffFilter("role", value)}
              options={[
                ["all", "All Roles"],
                ["moderator", "Moderator"],
                ["superadmin", "Super Admin"],
              ]}
            />

            <Select
              value={staffFilters.admin_status}
              onChange={(value) => updateStaffFilter("admin_status", value)}
              options={[
                ["all", "All Status"],
                ["active", "Active"],
                ["inactive", "Inactive"],
                ["suspended", "Suspended"],
              ]}
            />

            <Select
              value={staffFilters.isVerified}
              onChange={(value) => updateStaffFilter("isVerified", value)}
              options={[
                ["all", "All Verification"],
                ["true", "Verified"],
                ["false", "Not Verified"],
              ]}
            />
          </PanelToolbar>

          <ErrorBox error={error} />

          <StaffTable
            staff={staff}
            loading={loading}
            actionLoading={actionLoading}
            onEdit={openEditStaff}
            onVerify={verifyStaff}
            onStatus={changeStaffStatus}
            onResetPassword={openResetStaffPassword}
          />

          <LoadMore
            show={staffHasNext}
            loading={loading}
            onClick={() => loadStaff({ reset: false })}
          />
        </>
      )}

      <Modal open={modal.open} onClose={closeModal}>
        {modal.type === "userForm" ? (
          <UserForm
            mode={modal.mode}
            form={userForm}
            setForm={setUserForm}
            loading={actionLoading}
            onSubmit={submitUserForm}
            onClose={closeModal}
          />
        ) : null}

        {modal.type === "viewUser" ? (
          <ViewUser user={modal.data} onClose={closeModal} />
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

        {modal.type === "staffForm" ? (
          <StaffForm
            mode={modal.mode}
            form={staffForm}
            setForm={setStaffForm}
            loading={actionLoading}
            onSubmit={submitStaffForm}
            onClose={closeModal}
          />
        ) : null}

        {modal.type === "resetStaffPassword" ? (
          <ResetPasswordForm
            admin={modal.data}
            value={resetPasswordValue}
            setValue={setResetPasswordValue}
            loading={actionLoading}
            onSubmit={resetStaffPassword}
            onClose={closeModal}
          />
        ) : null}
      </Modal>
    </div>
  );
}

function PanelToolbar({
  search,
  onSearch,
  onRefresh,
  onCreate,
  createLabel,
  loading,
  children,
}) {
  return (
    <div className="mb-5 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by name, email, phone..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Apply / Refresh
        </button>

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
        >
          <Plus className="h-4 w-4" />
          {createLabel}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

function UsersTable({
  users,
  loading,
  actionLoading,
  onView,
  onEdit,
  onVerify,
  onReject,
  onStatus,
  onDelete,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="max-h-[610px] overflow-auto">
        <table className="w-full min-w-[1150px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-4 font-bold">User</th>
              <th className="px-4 py-4 font-bold">Contact</th>
              <th className="px-4 py-4 font-bold">Profile</th>
              <th className="px-4 py-4 font-bold">Account</th>
              <th className="px-4 py-4 font-bold">Verified</th>
              <th className="px-4 py-4 font-bold">Membership</th>
              <th className="px-4 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <TableLoading colSpan={7} text="Loading users..." />
            ) : users.length ? (
              users.map((user) => (
                <tr key={getId(user)} className="transition hover:bg-rose-50/30">
                  <td className="px-4 py-4">
                    <UserCell user={user} />
                  </td>

                  <td className="px-4 py-4">
                    <ContactCell item={user} />
                  </td>

                  <td className="px-4 py-4">
                    <Badge value={cleanStatus(user.profile_status)} />
                  </td>

                  <td className="px-4 py-4">
                    <Badge value={cleanStatus(user.account_status)} />
                  </td>

                  <td className="px-4 py-4">
                    <VerifiedBadge verified={user.isVerified} />
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      {user?.membership_status?.name ||
                        user?.membership?.name ||
                        "Free Plan"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {user?.membership_status?.status ||
                        user?.membership_status ||
                        "free"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton title="View" onClick={() => onView(user)}>
                        <Eye className="h-4 w-4" />
                      </IconButton>

                      <IconButton title="Edit" onClick={() => onEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title="Verify"
                        disabled={actionLoading}
                        onClick={() => onVerify(user)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title="Reject"
                        disabled={actionLoading}
                        onClick={() => onReject(user)}
                      >
                        <XCircle className="h-4 w-4" />
                      </IconButton>

                      <ActionSelect
                        disabled={actionLoading}
                        placeholder="Status"
                        onChange={(value) => onStatus(user, value)}
                        options={[
                          ["active", "Active"],
                          ["inactive", "Inactive"],
                          ["suspended", "Suspend"],
                          ["deleted", "Deleted"],
                        ]}
                      />

                      <IconButton
                        title="Soft Delete"
                        disabled={actionLoading}
                        danger
                        onClick={() => onDelete(user, false)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title="Hard Delete"
                        disabled={actionLoading}
                        danger
                        onClick={() => onDelete(user, true)}
                      >
                        <X className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmpty colSpan={7} text="No users found." />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StaffTable({
  staff,
  loading,
  actionLoading,
  onEdit,
  onVerify,
  onStatus,
  onResetPassword,
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100">
      <div className="max-h-[610px] overflow-auto">
        <table className="w-full min-w-[1050px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-4 font-bold">Admin</th>
              <th className="px-4 py-4 font-bold">Contact</th>
              <th className="px-4 py-4 font-bold">Role</th>
              <th className="px-4 py-4 font-bold">Status</th>
              <th className="px-4 py-4 font-bold">Verified</th>
              <th className="px-4 py-4 font-bold">Permissions</th>
              <th className="px-4 py-4 text-right font-bold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <TableLoading colSpan={7} text="Loading staff admins..." />
            ) : staff.length ? (
              staff.map((admin) => (
                <tr key={getId(admin)} className="transition hover:bg-rose-50/30">
                  <td className="px-4 py-4">
                    <UserCell user={admin} />
                  </td>

                  <td className="px-4 py-4">
                    <ContactCell item={admin} />
                  </td>

                  <td className="px-4 py-4">
                    <Badge value={cleanStatus(admin.role)} type="role" />
                  </td>

                  <td className="px-4 py-4">
                    <Badge value={cleanStatus(admin.admin_status)} />
                  </td>

                  <td className="px-4 py-4">
                    <VerifiedBadge verified={admin.isVerified} />
                  </td>

                  <td className="px-4 py-4">
                    <p className="max-w-[220px] truncate text-sm font-semibold text-slate-600">
                      {admin.role === "superadmin"
                        ? "All permissions"
                        : Array.isArray(admin.permissions)
                        ? admin.permissions.join(", ")
                        : "No permissions"}
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton title="Edit" onClick={() => onEdit(admin)}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title="Verify"
                        disabled={actionLoading}
                        onClick={() => onVerify(admin)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </IconButton>

                      <IconButton
                        title="Reset Password"
                        disabled={actionLoading}
                        onClick={() => onResetPassword(admin)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </IconButton>

                      <ActionSelect
                        disabled={actionLoading}
                        placeholder="Status"
                        onChange={(value) => onStatus(admin, value)}
                        options={[
                          ["active", "Active"],
                          ["inactive", "Inactive"],
                          ["suspended", "Suspend"],
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmpty colSpan={7} text="No staff admins found." />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserForm({ mode, form, setForm, loading, onSubmit, onClose }) {
  const isCreate = mode === "create";

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form onSubmit={onSubmit}>
      <ModalHeader
        title={isCreate ? "Create User" : "Update User"}
        text={
          isCreate
            ? "Create a normal matrimony user from admin panel."
            : "Update profile, status and verification fields."
        }
        onClose={onClose}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="First Name" value={form.first_name} onChange={(v) => update("first_name", v)} required />
        <Input label="Last Name" value={form.last_name} onChange={(v) => update("last_name", v)} required />
        <Input label="Email" type="email" value={form.email_address} onChange={(v) => update("email_address", v)} disabled={!isCreate} required />
        <Input label="Phone" value={form.phone_number} onChange={(v) => update("phone_number", v)} required />
        {isCreate ? (
          <Input label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} required />
        ) : null}
        <Input label="Date of Birth" type="date" value={form.dob} onChange={(v) => update("dob", v)} />
        <SelectInput label="Gender" value={form.gender} onChange={(v) => update("gender", v)} options={[["", "Select"], ["male", "Male"], ["female", "Female"], ["other", "Other"]]} />
        <SelectInput label="Religion" value={form.religion} onChange={(v) => update("religion", v)} options={[["", "Select"], ["Islam", "Islam"], ["Hinduism", "Hinduism"], ["Buddhism", "Buddhism"], ["Christianity", "Christianity"], ["Other", "Other"]]} />
        <SelectInput label="Marital Status" value={form.marital_status} onChange={(v) => update("marital_status", v)} options={[["", "Select"], ["never_married", "Never Married"], ["divorced", "Divorced"], ["widowed", "Widowed"], ["separated", "Separated"]]} />
        <Input label="Division" value={form.current_division} onChange={(v) => update("current_division", v)} />
        <Input label="District" value={form.current_district} onChange={(v) => update("current_district", v)} />
        <Input label="City" value={form.current_city} onChange={(v) => update("current_city", v)} />
        <Input label="Profession" value={form.profession} onChange={(v) => update("profession", v)} />
        <Input label="Highest Education" value={form.highest_education} onChange={(v) => update("highest_education", v)} />

        <SelectInput
          label="Profile Status"
          value={form.profile_status}
          onChange={(v) => update("profile_status", v)}
          options={[
            ["incomplete", "Incomplete"],
            ["pending_review", "Pending Review"],
            ["approved", "Approved"],
            ["rejected", "Rejected"],
            ["hidden", "Hidden"],
          ]}
        />

        <SelectInput
          label="Account Status"
          value={form.account_status}
          onChange={(v) => update("account_status", v)}
          options={[
            ["active", "Active"],
            ["inactive", "Inactive"],
            ["suspended", "Suspended"],
            ["deleted", "Deleted"],
          ]}
        />
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
        <input
          type="checkbox"
          checked={form.isVerified}
          onChange={(event) => update("isVerified", event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
        />
        Mark as verified
      </label>

      <ModalFooter loading={loading} onClose={onClose} submitLabel={isCreate ? "Create User" : "Update User"} />
    </form>
  );
}

function StaffForm({ mode, form, setForm, loading, onSubmit, onClose }) {
  const isCreate = mode === "create";

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePermission = (permission) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(permission);

      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((item) => item !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  return (
    <form onSubmit={onSubmit}>
      <ModalHeader
        title={isCreate ? "Create Staff Admin" : "Update Staff Admin"}
        text="Only superadmin can manage moderator and superadmin staff accounts."
        onClose={onClose}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="First Name" value={form.first_name} onChange={(v) => update("first_name", v)} />
        <Input label="Last Name" value={form.last_name} onChange={(v) => update("last_name", v)} />
        <Input label="Username" value={form.username} onChange={(v) => update("username", v)} />
        <Input label="Email" type="email" value={form.email_address} onChange={(v) => update("email_address", v)} disabled={!isCreate} required />
        <Input label="Phone" value={form.phone_number} onChange={(v) => update("phone_number", v)} />
        {isCreate ? (
          <Input label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} required />
        ) : null}

        <SelectInput
          label="Role"
          value={form.role}
          onChange={(v) => update("role", v)}
          options={[
            ["moderator", "Moderator"],
            ["superadmin", "Super Admin"],
          ]}
        />

        <SelectInput
          label="Admin Status"
          value={form.admin_status}
          onChange={(v) => update("admin_status", v)}
          options={[
            ["active", "Active"],
            ["inactive", "Inactive"],
            ["suspended", "Suspended"],
          ]}
        />
      </div>

      <label className="mt-4 flex items-center gap-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">
        <input
          type="checkbox"
          checked={form.isVerified}
          onChange={(event) => update("isVerified", event.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
        />
        Mark staff as verified
      </label>

      {form.role !== "superadmin" ? (
        <div className="mt-4 rounded-3xl border border-slate-100 bg-slate-50/70 p-4">
          <p className="mb-3 text-sm font-bold text-slate-900">
            Moderator Permissions
          </p>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ADMIN_PERMISSIONS.map((permission) => (
              <label
                key={permission.value}
                className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-600"
              >
                <input
                  type="checkbox"
                  checked={form.permissions.includes(permission.value)}
                  onChange={() => togglePermission(permission.value)}
                  className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                {permission.label}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
          Superadmin automatically receives all permissions.
        </div>
      )}

      <ModalFooter loading={loading} onClose={onClose} submitLabel={isCreate ? "Create Staff" : "Update Staff"} />
    </form>
  );
}

function ViewUser({ user, onClose }) {
  return (
    <div>
      <ModalHeader title="User Details" text="Full profile summary from admin endpoint." onClose={onClose} />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Detail label="Name" value={getFullName(user)} />
        <Detail label="Email" value={user.email_address} />
        <Detail label="Phone" value={user.phone_number} />
        <Detail label="Gender" value={user.gender} />
        <Detail label="Age" value={user.age} />
        <Detail label="Religion" value={user.religion} />
        <Detail label="Marital Status" value={cleanStatus(user.marital_status)} />
        <Detail label="Location" value={[user.current_city, user.current_district, user.current_division].filter(Boolean).join(", ")} />
        <Detail label="Profession" value={user.profession} />
        <Detail label="Education" value={user.highest_education} />
        <Detail label="Profile Status" value={cleanStatus(user.profile_status)} />
        <Detail label="Account Status" value={cleanStatus(user.account_status)} />
        <Detail label="Completeness" value={`${user.profile_completeness || 0}%`} />
        <Detail label="Membership" value={user?.membership_status?.name || user?.membership?.name || "Free Plan"} />
      </div>

      <div className="mt-5 rounded-3xl bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          About
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {user.about_me || "No about information added."}
        </p>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function RejectUserForm({ user, reason, setReason, loading, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit}>
      <ModalHeader
        title="Reject User Profile"
        text={`Reject profile for ${getFullName(user)}.`}
        onClose={onClose}
      />

      <label className="block">
        <span className="mb-1.5 block text-sm font-bold text-slate-700">
          Rejection Reason
        </span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Write rejection reason..."
          rows={5}
          className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
        />
      </label>

      <ModalFooter loading={loading} onClose={onClose} submitLabel="Reject Profile" danger />
    </form>
  );
}

function ResetPasswordForm({ admin, value, setValue, loading, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit}>
      <ModalHeader
        title="Reset Staff Password"
        text={`Set a new password for ${getFullName(admin)}.`}
        onClose={onClose}
      />

      <Input
        label="New Password"
        type="password"
        value={value}
        onChange={setValue}
        required
      />

      <ModalFooter loading={loading} onClose={onClose} submitLabel="Reset Password" />
    </form>
  );
}

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 px-4 py-6 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-5 shadow-2xl sm:p-6">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, text, onClose }) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <h3 className="text-xl font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-slate-100"
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
        className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
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
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </button>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
        {required ? <span className="ml-1 text-rose-600">*</span> : null}
      </span>

      <input
        type={type}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        required={required}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      />
    </label>
  );
}

function SelectInput({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <select
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
      >
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
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

function ActionSelect({ options, onChange, placeholder, disabled }) {
  return (
    <select
      disabled={disabled}
      defaultValue=""
      onChange={(event) => {
        if (!event.target.value) return;
        onChange(event.target.value);
        event.target.value = "";
      }}
      className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-xs font-bold text-slate-600 outline-none transition hover:bg-slate-50 disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

function IconButton({ title, children, onClick, disabled, danger = false }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
          : "border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
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
          Joined {formatDate(user.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ContactCell({ item }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Mail className="h-3.5 w-3.5 text-slate-400" />
        <span className="max-w-[220px] truncate">{item.email_address || "No email"}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Phone className="h-3.5 w-3.5 text-slate-400" />
        <span className="max-w-[220px] truncate">{item.phone_number || "No phone"}</span>
      </div>
    </div>
  );
}

function Badge({ value, type = "status" }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${badgeClass(
        type,
        value
      )}`}
    >
      {value || "Unknown"}
    </span>
  );
}

function VerifiedBadge({ verified }) {
  return verified ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
      <UserCheck className="h-3.5 w-3.5" />
      Yes
    </span>
  ) : (
    <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
      Pending
    </span>
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

function ErrorBox({ error }) {
  if (!error) return null;

  return (
    <div className="mb-5 rounded-3xl border border-amber-100 bg-amber-50 p-4">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <h3 className="text-sm font-bold text-amber-900">
            Request Failed
          </h3>
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
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Load More
      </button>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold capitalize text-slate-800">
        {value || "N/A"}
      </p>
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
        <p className="text-sm font-bold">{message}</p>
      </div>
    </div>
  );
}