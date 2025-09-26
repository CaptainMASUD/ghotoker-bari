"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
} from "lucide-react";

export default function Memberships() {
  const [filterPlan, setFilterPlan] = useState("all");
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [membershipStats, setMembershipStats] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    features: [""],
  });

  const refreshMemberships = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const membershipsResponse = await fetch("http://localhost:4000/api/memberships", { headers });
      const memberships = await membershipsResponse.json();

      const usersResponse = await fetch("http://localhost:4000/api/admin/users", { headers });
      const users = await usersResponse.json();

      if (Array.isArray(memberships) && Array.isArray(users)) {
        const plansWithStats = memberships.map((plan) => {
          const planMembers = users.filter(
            (user) =>
              user.membership &&
              user.membership._id === plan._id &&
              user.membership_expiry &&
              new Date(user.membership_expiry) > new Date()
          );
          return {
            ...plan,
            id: plan._id,
            price: `$${Number(plan.price || 0).toLocaleString()}`,
            interval: "month",
            members: planMembers.length,
            revenue: `$${Number((plan.price || 0) * planMembers.length).toLocaleString()}`,
            features: plan.features || ["Basic Support", "Standard Features"],
            status: "active",
          };
        });

        setMembershipPlans(plansWithStats);

        const totalMembers = users.filter(
          (u) => u.membership && u.membership_expiry && new Date(u.membership_expiry) > new Date()
        ).length;

        const totalRevenue = plansWithStats.reduce((sum, p) => {
          const num = parseFloat(String(p.price).replace(/[$,]/g, "")) || 0;
          const members = p.members || 0;
          return sum + num * members;
        }, 0);

        const expiringMembers = users.filter((u) => {
          if (!u.membership_expiry) return false;
          const expiry = new Date(u.membership_expiry);
          const now = new Date();
          const in30 = new Date();
          in30.setDate(in30.getDate() + 30);
          return expiry <= in30 && expiry > now;
        }).length;

        setMembershipStats([
          {
            title: "Total Members",
            value: totalMembers.toLocaleString(),
            icon: Users,
            ring: "from-blue-500/30 to-blue-400/20",
            chip: "bg-blue-500/10 text-blue-300 border border-blue-400/30",
          },
          {
            title: "Monthly Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: TrendingUp,
            ring: "from-emerald-500/30 to-emerald-400/20",
            chip: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30",
          },
          {
            title: "Active Plans",
            value: plansWithStats.length.toString(),
            icon: CreditCard,
            ring: "from-fuchsia-500/30 to-purple-400/20",
            chip: "bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/30",
          },
          {
            title: "Expiring Soon",
            value: expiringMembers.toString(),
            icon: Calendar,
            ring: "from-amber-500/30 to-amber-400/20",
            chip: "bg-amber-500/10 text-amber-300 border border-amber-400/30",
          },
        ]);

        const activeMembers = users
          .filter((u) => u.membership && u.membership_expiry && new Date(u.membership_expiry) > new Date())
          .slice(0, 5)
          .map((u) => ({
            id: u._id,
            name: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
            plan: u.membership?.name || "Unknown",
            joinDate: u.createdAt,
            status: "active",
            avatar: `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(
              `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()
            )}`,
          }));

        setRecentMembers(activeMembers);
      }
    } catch (err) {
      console.error("[memberships] fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMemberships();
  }, []);

  const filteredPlans = membershipPlans.filter((plan) => {
    return filterPlan === "all" || plan.name.toLowerCase() === filterPlan;
  });

  const getStatusBadge = (status) => {
    const map = {
      active: "bg-emerald-500/10 text-emerald-300 border border-emerald-400/30",
      inactive: "bg-white/10 text-white/70 border border-white/20",
      expiring: "bg-amber-500/10 text-amber-300 border border-amber-400/30",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${map[status] || map.active}`}>
        {status[0].toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch("http://localhost:4000/api/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number.parseFloat(formData.price),
          duration: Number.parseInt(formData.duration),
          features: formData.features.filter((f) => f.trim() !== ""),
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setFormData({ name: "", price: "", duration: "", features: [""] });
        await refreshMemberships();
      }
    } catch (err) {
      console.error("[memberships] create error:", err);
    }
  };

  const handleEditPlan = async (e) => {
    e.preventDefault();
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`http://localhost:4000/api/memberships/${selectedPlan.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: formData.name,
          price: Number.parseFloat(formData.price),
          duration: Number.parseInt(formData.duration),
          features: formData.features.filter((f) => f.trim() !== ""),
        }),
      });

      if (response.ok) {
        setShowEditModal(false);
        setSelectedPlan(null);
        setFormData({ name: "", price: "", duration: "", features: [""] });
        await refreshMemberships();
      }
    } catch (err) {
      console.error("[memberships] update error:", err);
    }
  };

  const handleDeletePlan = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(`http://localhost:4000/api/memberships/${selectedPlan.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedPlan(null);
        await refreshMemberships();
      }
    } catch (err) {
      console.error("[memberships] delete error:", err);
    }
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: String(plan.price).replace(/[$,]/g, ""),
      duration: plan.duration || "30",
      features: plan.features || [""],
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setShowDeleteModal(true);
  };

  const addFeature = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  };

  const updateFeature = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Memberships</h1>
        </div>
        <div className="text-center py-12 text-white/70">Loading memberships...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Memberships</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 flex items-center shadow-lg border border-emerald-400/30"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Plan
        </button>
      </div>

      {/* Stats Grid (glass) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {membershipStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
            >
              <div className={`pointer-events-none absolute -inset-1 opacity-70 bg-gradient-to-br ${stat.ring}`} />
              <div className="relative flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-white/70 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/10 border border-white/15">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="relative mt-4 inline-flex items-center gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-full ${stat.chip}`}>live</span>
                <span className="text-white/60">updated</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Membership Plans (glass) */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Membership Plans</h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-white/60" />
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="rounded-lg bg-white/10 border border-white/15 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                >
                  <option className="bg-slate-900" value="all">All Plans</option>
                  {membershipPlans.map((p) => (
                    <option className="bg-slate-900" key={p.id} value={p.name.toLowerCase()}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              {filteredPlans.length === 0 ? (
                <div className="text-center py-10 text-white/60">No membership plans found</div>
              ) : (
                filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                          {getStatusBadge(plan.status)}
                        </div>
                        <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                          {plan.price}
                          <span className="text-sm text-white/60">/{plan.interval}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-emerald-500/10 border border-emerald-400/30"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(plan)}
                          className="text-rose-300 hover:text-white p-2 rounded-lg hover:bg-rose-500/10 border border-rose-400/30"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-white/60">Members</p>
                        <p className="text-lg font-semibold text-white">{plan.members}</p>
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Monthly Revenue</p>
                        <p className="text-lg font-semibold text-white">{plan.revenue}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-white/60 mb-2">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {plan.features.map((f, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-white/10 text-white/80 text-xs rounded-md border border-white/15"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Members (glass) */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white">Recent Members</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentMembers.length === 0 ? (
                <div className="text-center text-white/60">No recent members</div>
              ) : (
                recentMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <img className="h-10 w-10 rounded-full border border-white/20" src={m.avatar || "/placeholder.svg"} alt={m.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{m.name}</p>
                      <p className="text-sm text-white/70 truncate">{m.plan} Plan</p>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(m.status)}
                      <p className="text-[11px] text-white/60 mt-1">{new Date(m.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CREATE MODAL (dark & responsive) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Create Membership Plan</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="e.g., Premium, Gold, Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                    placeholder="29.99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Duration (days)</label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Features</label>
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                        placeholder="Enter feature"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-rose-300 hover:text-white p-2 rounded-lg hover:bg-rose-500/10 border border-rose-400/30"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-emerald-300 hover:text-white text-sm font-medium inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-emerald-400/30"
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 inline-flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL (dark & responsive) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Membership Plan</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditPlan} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Duration (days)</label>
                <input
                  type="number"
                  required
                  value={formData.duration}
                  onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Features</label>
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
                        placeholder="Enter feature"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-rose-300 hover:text-white p-2 rounded-lg hover:bg-rose-500/10 border border-rose-400/30"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-emerald-300 hover:text-white text-sm font-medium inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-emerald-400/30"
                  >
                    <Plus className="w-4 h-4" />
                    Add Feature
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 inline-flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Update Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL (dark & responsive) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-rose-500/10 border border-rose-400/30 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-rose-300" />
              </div>
              <h2 className="text-xl font-bold text-white text-center mb-2">Delete Membership Plan</h2>
              <p className="text-white/70 text-center mb-6">
                Are you sure you want to delete the{" "}
                <span className="font-semibold text-white">"{selectedPlan?.name}"</span> plan? This action cannot be
                undone.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeletePlan}
                  className="px-6 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                >
                  Delete Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
