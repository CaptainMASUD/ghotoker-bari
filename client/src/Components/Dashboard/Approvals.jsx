"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Check,
  X,
  Eye,
  Filter,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Crown,
  Settings,
  DollarSign,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Approvals() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // holds the approval object

  // Modal details pagination (7 per section)
  const [detailPage, setDetailPage] = useState(0);
  const DETAILS_PER_SECTION = 7;

  const refreshApprovals = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch("https://ghotoker-bari-api.vercel.app/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const users = await response.json();

      const allApprovals = Array.isArray(users)
        ? users.map((user) => ({
            id: user._id,
            type: "profile",
            user: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
            email: user.email_address,
            phone: user.phone_number,
            requestDate: user.createdAt,
            status: user.isVerified ? "approved" : "pending",
            details: user.isVerified ? "User verification completed" : "User verification request",
            priority: user.isVerified ? "low" : "medium",
            avatar: `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(
              `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
            )}`,
            userData: user,
          }))
        : [];

      setApprovals(allApprovals);
    } catch (error) {
      console.error("[approvals] fetch error:", error);
      // You can set fallback data here if desired
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshApprovals();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`https://ghotoker-bari-api.vercel.app/api/admin/verify/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        await refreshApprovals();
      } else {
        throw new Error("Failed to approve user");
      }
    } catch (error) {
      console.error("[approvals] approve error:", error);
      alert("Failed to approve user");
    }
  };

  const handleReject = async (id) => {
    if (confirm("Are you sure you want to reject this request?")) {
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "rejected", details: "Request rejected by admin" } : a))
      );
    }
  };

  const openViewModal = (approval) => {
    setSelectedUser(approval);
    setDetailPage(0); // reset internal pagination
    setShowViewModal(true);
  };

  const filteredApprovals = useMemo(() => {
    return approvals.filter((approval) => {
      const matchesType = filterType === "all" || approval.type === filterType;
      const matchesStatus = filterStatus === "all" || approval.status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [approvals, filterType, filterStatus]);

  // Dark/glass badges
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-amber-500/10 text-amber-300 border border-amber-400/30",
      approved: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30",
      rejected: "bg-rose-500/10 text-rose-300 border border-rose-400/30",
    };
    const statusIcons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <CheckCircle className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
    };
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${statusStyles[status]}`}>
        {statusIcons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: "bg-rose-500/10 text-rose-300 border border-rose-400/30",
      medium: "bg-amber-500/10 text-amber-300 border border-amber-400/30",
      low: "bg-white/10 text-white/70 border border-white/20",
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[priority]}`}>{priority[0].toUpperCase() + priority.slice(1)}</span>;
  };

  const getTypeIcon = (type) => {
    const cls = "w-6 h-6 text-white";
    const icons = {
      membership: <Crown className={cls} />,
      profile: <User className={cls} />,
      refund: <DollarSign className={cls} />,
      account: <Settings className={cls} />,
    };
    return icons[type] || <FileText className={cls} />;
  };

  // Build flat details for modal (7 per page)
  const buildDetails = (obj) => {
    if (!obj) return [];
    const skip = new Set(["password", "__v"]);
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

    // Prioritize common fields
    push("First name", obj.first_name);
    push("Last name", obj.last_name);
    push("Email", obj.email_address);
    push("Phone", obj.phone_number);
    push("Verified", obj.isVerified ? "Yes" : "No");
    push("Membership", obj?.membership?.name || (obj.membership ? JSON.stringify(obj.membership) : "None"));
    push("Membership expiry", obj.membership_expiry ? new Date(obj.membership_expiry).toLocaleString() : "—");
    push("Created", obj.createdAt ? new Date(obj.createdAt).toLocaleString() : "—");
    push("Address", obj.address);
    push("Date of birth", obj.date_of_birth);

    // Add the rest
    Object.entries(obj).forEach(([k, v]) => {
      if (
        skip.has(k) ||
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

  const modalDetails = buildDetails(selectedUser?.userData);
  const totalDetailPages = Math.max(1, Math.ceil(modalDetails.length / DETAILS_PER_SECTION));
  const visibleDetails = modalDetails.slice(
    detailPage * DETAILS_PER_SECTION,
    detailPage * DETAILS_PER_SECTION + DETAILS_PER_SECTION
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Approvals</h1>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <div className="text-white/60 mt-4">Loading approvals...</div>
        </div>
      </div>
    );
  }

  const pendingCount = filteredApprovals.filter((a) => a.status === "pending").length;
  const approvedCount = filteredApprovals.filter((a) => a.status === "approved").length;
  const rejectedCount = filteredApprovals.filter((a) => a.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Approvals</h1>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-300" />
            <span className="text-white/70">{pendingCount} pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-300" />
            <span className="text-white/70">{approvedCount} approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-rose-300" />
            <span className="text-white/70">{rejectedCount} rejected</span>
          </div>
        </div>
      </div>

      {/* Filters (glass) */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Filter className="w-5 h-5 text-white/60" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          >
            <option className="bg-slate-900" value="all">All Types</option>
            <option className="bg-slate-900" value="membership">Membership</option>
            <option className="bg-slate-900" value="profile">Profile</option>
            <option className="bg-slate-900" value="refund">Refund</option>
            <option className="bg-slate-900" value="account">Account</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl bg-white/10 border border-white/15 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
          >
            <option className="bg-slate-900" value="all">All Status</option>
            <option className="bg-slate-900" value="pending">Pending</option>
            <option className="bg-slate-900" value="approved">Approved</option>
            <option className="bg-slate-900" value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Approval cards (glass) */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-12 text-center">
            <User className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <div className="text-white/70">No approvals found</div>
          </div>
        ) : (
          filteredApprovals.map((approval) => (
            <div
              key={approval.id}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/15">{getTypeIcon(approval.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md border border-white/20">
                        <span className="text-white font-semibold">
                          {approval.user?.split(" ")[0]?.[0]}
                          {approval.user?.split(" ")[1]?.[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{approval.user || "Unknown user"}</h3>
                        {approval.email && <p className="text-sm text-white/70">{approval.email}</p>}
                        {approval.phone && <p className="text-sm text-white/60">{approval.phone}</p>}
                      </div>
                    </div>

                    <p className="text-white/80 mb-4">{approval.details}</p>

                    <div className="flex items-center flex-wrap gap-4 text-sm">
                      <div className="flex items-center text-white/70">
                        <Calendar className="w-4 h-4 mr-2" />
                        {approval.requestDate ? new Date(approval.requestDate).toLocaleDateString() : "—"}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white/70">Priority:</span>
                        {getPriorityBadge(approval.priority || "low")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {getStatusBadge(approval.status)}
                  <button
                    onClick={() => openViewModal(approval)}
                    className="text-blue-300 hover:text-white p-2 rounded-lg hover:bg-blue-500/10 border border-blue-400/30"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  {approval.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleApprove(approval.id)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(approval.id)}
                        className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-4 py-2 rounded-xl hover:from-rose-700 hover:to-rose-800 transition-all shadow-md"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* VIEW MODAL — glass / dark with 7-field paging */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-2xl font-bold text-white">User Details for Approval</h3>
              <p className="text-white/70 mt-1">Review user information before making a decision</p>
            </div>

            <div className="p-6">
              {/* Top summary */}
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg border border-white/20">
                  <span className="text-white font-bold text-2xl">
                    {selectedUser.user?.split(" ")[0]?.[0]}
                    {selectedUser.user?.split(" ")[1]?.[0]}
                  </span>
                </div>
                <div className="ml-6">
                  <h4 className="text-xl font-bold text-white">{selectedUser.user || "Unknown user"}</h4>
                  {selectedUser.email && <p className="text-white/80">{selectedUser.email}</p>}
                  <div className="mt-2 flex items-center gap-3">
                    {getStatusBadge(selectedUser.status)}
                    {getPriorityBadge(selectedUser.priority || "low")}
                  </div>
                </div>
              </div>

              {/* Request info + Paged user data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-white mb-3">Request Information</h5>
                  <div className="space-y-2 text-sm text-white/80">
                    <div>
                      <span className="text-white/60">Type:</span>{" "}
                      <span className="font-medium capitalize">{selectedUser.type}</span>
                    </div>
                    <div>
                      <span className="text-white/60">Request Date:</span>{" "}
                      <span className="font-medium">
                        {selectedUser.requestDate ? new Date(selectedUser.requestDate).toLocaleDateString() : "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/60">Details:</span>{" "}
                      <span className="font-medium">{selectedUser.details}</span>
                    </div>
                  </div>
                </div>

                {/* Paged full user data */}
                <div>
                  <h5 className="font-semibold text-white mb-3">User Data</h5>

                  {visibleDetails.length > 0 ? (
                    <div className="space-y-3">
                      {visibleDetails.map((item, idx) => (
                        <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                          <div className="text-[11px] font-semibold text-white/60 uppercase tracking-wide">
                            {item.label}
                          </div>
                          <div className="mt-1 text-white whitespace-pre-wrap break-words text-sm">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-white/70">No additional data.</div>
                  )}

                  {/* Pager */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-white/70">
                      Section <span className="font-semibold text-white">{detailPage + 1}</span> of {totalDetailPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailPage((p) => Math.max(0, p - 1))}
                        disabled={detailPage === 0}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white disabled:opacity-50"
                      >
                        <ChevronLeft className="w-4 h-4" /> Prev
                      </button>
                      <button
                        onClick={() => setDetailPage((p) => Math.min(totalDetailPages - 1, p + 1))}
                        disabled={detailPage >= totalDetailPages - 1}
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-white disabled:opacity-50"
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-white/10 flex justify-between">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                Close
              </button>

              {selectedUser.status === "pending" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleReject(selectedUser.id);
                      setShowViewModal(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      handleApprove(selectedUser.id);
                      setShowViewModal(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
