"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  CheckCircle,
  Eye,
  User,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Selected + edit form
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Table pagination (unchanged)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // View modal details pagination (NEW)
  const [detailPage, setDetailPage] = useState(0);
  const DETAILS_PER_SECTION = 7;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const response = await fetch("https://ghotoker-bari-api.vercel.app/api/admin/users", {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("[users] fetch error:", error);
        setUsers([
          {
            _id: "1",
            first_name: "Alice",
            last_name: "Johnson",
            email_address: "alice.johnson@example.com",
            phone_number: "+1 (555) 123-4567",
            isVerified: true,
            membership: { name: "Premium" },
            membership_expiry: "2025-12-31",
            createdAt: "2025-01-15T10:30:00Z",
            address: "123 Main St, New York, NY 10001",
            date_of_birth: "1990-05-15",
            notes: "VIP cohort",
          },
          {
            _id: "2",
            first_name: "Bob",
            last_name: "Smith",
            email_address: "bob.smith@example.com",
            phone_number: "+1 (555) 987-6543",
            isVerified: false,
            membership: null,
            membership_expiry: null,
            createdAt: "2025-02-20T14:45:00Z",
            address: "456 Oak Ave, Los Angeles, CA 90210",
            date_of_birth: "1985-08-22",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleVerifyUser = async (userId) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`https://ghotoker-bari-api.vercel.app/api/admin/verify/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isVerified: true } : u)));
      } else {
        throw new Error("Failed to verify user");
      }
    } catch (err) {
      console.error("[users] verify error:", err);
      alert("Failed to verify user");
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`https://ghotoker-bari-api.vercel.app/api/admin/users/${selectedUser._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== selectedUser._id));
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (err) {
      console.error("[users] delete error:", err);
      alert("Failed to delete user");
    }
  };

  const handleEditUser = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`https://ghotoker-bari-api.vercel.app/api/admin/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(editFormData),
      });
      if (response.ok) {
        const updated = await response.json();
        setUsers((prev) => prev.map((u) => (u._id === selectedUser._id ? updated : u)));
        setShowEditModal(false);
        setSelectedUser(null);
        setEditFormData({});
      } else {
        throw new Error("Failed to update user");
      }
    } catch (err) {
      console.error("[users] update error:", err);
      alert("Failed to update user");
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email_address: user.email_address,
      phone_number: user.phone_number,
      address: user.address,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openViewModal = (user) => {
    setSelectedUser(user);
    setDetailPage(0); // reset to first section
    setShowViewModal(true);
  };

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim().toLowerCase();
      const email = (user.email_address ?? "").toLowerCase();
      const matchesSearch = term ? fullName.includes(term) || email.includes(term) : true;

      let matchesFilter = true;
      if (filterStatus === "verified") matchesFilter = !!user.isVerified;
      else if (filterStatus === "unverified") matchesFilter = !user.isVerified;
      else if (filterStatus === "active")
        matchesFilter =
          user.membership && user.membership_expiry && new Date(user.membership_expiry) > new Date();

      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const pageUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (user) => {
    if (!user.isVerified) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-300 border border-rose-400/30">
          Unverified
        </span>
      );
    }
    if (user.membership && user.membership_expiry && new Date(user.membership_expiry) > new Date()) {
      return (
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/30">
          Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 text-white/70 border border-white/20">
        Inactive
      </span>
    );
  };

  // ==== Helpers for View modal details paging (NEW) ====
  const buildDetails = (u) => {
    if (!u) return [];
    const skipKeys = new Set(["password", "__v"]);
    const out = [];

    const push = (label, value) => {
      if (value === undefined || value === null || value === "") return;
      if (typeof value === "object" && !(value instanceof Date)) {
        try {
          out.push({ label, value: JSON.stringify(value, null, 2) });
        } catch {
          out.push({ label, value: String(value) });
        }
      } else {
        out.push({ label, value: String(value) });
      }
    };

    // Prioritized fields
    push("First name", u.first_name);
    push("Last name", u.last_name);
    push("Email", u.email_address);
    push("Phone", u.phone_number);
    push("Verified", u.isVerified ? "Yes" : "No");
    push("Membership", u?.membership?.name || (u.membership ? JSON.stringify(u.membership) : "None"));
    push("Membership expiry", u.membership_expiry ? new Date(u.membership_expiry).toLocaleString() : "—");
    push("Created", u.createdAt ? new Date(u.createdAt).toLocaleString() : "—");
    push("Address", u.address);
    push("Date of birth", u.date_of_birth);

    // Rest of keys
    Object.entries(u).forEach(([k, v]) => {
      if (
        skipKeys.has(k) ||
        [
          "first_name",
          "last_name",
          "email_address",
          "phone_number",
          "isVerified",
          "membership",
          "membership_expiry",
          "createdAt",
          "address",
          "date_of_birth",
        ].includes(k)
      )
        return;
      push(k, v);
    });

    return out;
  };

  const detailItems = buildDetails(selectedUser);
  const totalDetailPages = Math.max(1, Math.ceil(detailItems.length / DETAILS_PER_SECTION));
  const visibleDetails = detailItems.slice(
    detailPage * DETAILS_PER_SECTION,
    detailPage * DETAILS_PER_SECTION + DETAILS_PER_SECTION
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <button className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 flex items-center shadow-lg border border-emerald-400/30">
          <Plus className="w-5 h-5 mr-2" />
          Add User
        </button>
      </div>

      {/* Filters (unchanged per your request) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-white/60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            >
              <option value="all">All Users</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="active">Active Membership</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table (unchanged) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                {["User", "Contact", "Status", "Membership", "Join Date", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-white/70 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-6">
                      <div className="animate-pulse h-10 rounded-xl bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : pageUsers.length ? (
                pageUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md border border-white/20">
                          <span className="text-white font-semibold text-lg">
                            {user.first_name?.[0]}
                            {user.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-white">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-white/70">{user.email_address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1 text-white/90">
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-white/60" />
                          {user.email_address}
                        </div>
                        <div className="flex items-center text-sm text-white/70">
                          <Phone className="w-4 h-4 mr-2 text-white/60" />
                          {user.phone_number || "—"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(user)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                      {user.membership?.name || "None"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        {!user.isVerified && (
                          <button
                            onClick={() => handleVerifyUser(user._id)}
                            className="text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-emerald-500/10 border border-emerald-400/30"
                            title="Verify User"
                          >
                            <BadgeCheck className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openViewModal(user)}
                          className="text-blue-300 hover:text-white p-2 rounded-lg hover:bg-blue-500/10 border border-blue-400/30"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-indigo-300 hover:text-white p-2 rounded-lg hover:bg-indigo-500/10 border border-indigo-400/30"
                          title="Edit User"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="text-rose-300 hover:text-white p-2 rounded-lg hover:bg-rose-500/10 border border-rose-400/30"
                          title="Delete User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <User className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <div className="text-white/70">No users found</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (unchanged) */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 text-white/70">
            <span className="text-sm">
              Page <span className="font-semibold text-white">{page}</span> of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-white/15 bg-white/5 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-white/15 bg-white/5 disabled:opacity-50"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===================== EDIT USER MODAL (opaque) ===================== */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Edit User</h3>
              <p className="text-gray-600 mt-1">Update user information</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editFormData.first_name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.last_name || ""}
                    onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={editFormData.email_address || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, email_address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editFormData.phone_number || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, phone_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  rows={3}
                  value={editFormData.address || ""}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== DELETE MODAL (opaque) ===================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete User</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {selectedUser?.first_name} {selectedUser?.last_name}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== VIEW MODAL (opaque, 7 items per section) ===================== */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
              <p className="text-gray-600 mt-1">Complete user information</p>
            </div>

            <div className="p-6">
              {/* Header user summary (kept minimal) */}
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.first_name?.[0]}
                    {selectedUser.last_name?.[0]}
                  </span>
                </div>
                <div className="ml-6">
                  <h4 className="text-xl font-bold text-gray-900">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h4>
                  <p className="text-gray-600">{selectedUser.email_address}</p>
                  <div className="mt-2">
                    {/* reuse the existing badge but adapt colors for white bg */}
                    {selectedUser.isVerified ? (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Details grid — 7 per section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleDetails.map((item, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{item.label}</div>
                    <div className="mt-1 text-gray-900 whitespace-pre-wrap break-words text-sm">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Internal pagination */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">
                  Section <span className="font-semibold text-gray-900">{detailPage + 1}</span> of {totalDetailPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDetailPage((p) => Math.max(0, p - 1))}
                    disabled={detailPage === 0}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => setDetailPage((p) => Math.min(totalDetailPages - 1, p + 1))}
                    disabled={detailPage >= totalDetailPages - 1}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-300 bg-white disabled:opacity-50"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
