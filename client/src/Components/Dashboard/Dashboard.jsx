"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BadgeCheck,
  Crown,
  CreditCard,
  MessageSquare,
  Settings,
  BarChart3,
  ShieldCheck,
  Menu,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import DashboardOverview from "./DashboardOverview";
import UsersPanel from "./Users";
import MembershipPanel from "./MembershipPanel";
import AdminPaymentPanel from "./AdminPaymentPanel";
import UserVerificationPanel from "./UserVerificationPanel";
import ContactAdminPage from "./ContactAdminPage";

const ADMIN_TABS = [
  {
    id: "overview",
    label: "Dashboard Overview",
    shortLabel: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "Users Management",
    shortLabel: "Users",
    icon: Users,
  },
  {
    id: "verification",
    label: "Profile Verification",
    shortLabel: "Verification",
    icon: BadgeCheck,
  },
  {
    id: "memberships",
    label: "Membership Plans",
    shortLabel: "Memberships",
    icon: Crown,
  },
  {
    id: "payments",
    label: "Payments",
    shortLabel: "Payments",
    icon: CreditCard,
  },
  {
    id: "messages",
    label: "Contact Messages",
    shortLabel: "Messages",
    icon: MessageSquare,
  },
  {
    id: "reports",
    label: "Reports & Analytics",
    shortLabel: "Reports",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "System Settings",
    shortLabel: "Settings",
    icon: Settings,
  },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canRender, setCanRender] = useState(false);

  const currentUser = useSelector((state) => state.user?.currentUser);

  const token = currentUser?.token;
  const authUser = currentUser?.user;
  const role = String(authUser?.role || "").toLowerCase();

  const activeTabData =
    ADMIN_TABS.find((item) => item.id === activeTab) || ADMIN_TABS[0];

  useEffect(() => {
    if (!currentUser || !token || !authUser || role !== "superadmin") {
      setCanRender(false);
      navigate("/", { replace: true });
      return;
    }

    setCanRender(true);
  }, [currentUser, token, authUser, role, navigate]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UsersPanel />;

      case "verification":
        return <UserVerificationPanel />;

      case "memberships":
        return <MembershipPanel />;

      case "payments":
        return <AdminPaymentPanel />;

      case "messages":
        return <ContactAdminPage />;

      case "reports":
        return (
          <ComingSoonPanel
            icon={BarChart3}
            title="Reports & Analytics"
            text="Track users, payments, memberships, profile approval and platform growth."
          />
        );

      case "settings":
        return (
          <ComingSoonPanel
            icon={Settings}
            title="System Settings"
            text="Manage platform settings, admin controls, privacy rules and system preferences."
          />
        );

      case "overview":
      default:
        return <DashboardOverview onNavigate={setActiveTab} />;
    }
  };

  if (!canRender) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f3ef] pt-20 text-slate-800 lg:pt-24">
      <div className="mx-auto flex w-full max-w-[1600px] gap-5 px-4 pb-8 sm:px-6 lg:px-8">
        {sidebarOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close sidebar"
              className="absolute inset-0 cursor-pointer bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="absolute left-0 top-0 h-full w-[290px] bg-white shadow-2xl">
              <AdminSidebar
                items={ADMIN_TABS}
                activeTab={activeTab}
                onChange={handleTabChange}
                user={authUser}
                mobile
              />
            </div>
          </div>
        ) : null}

        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-[290px] shrink-0 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-rose-100/60 lg:block">
          <AdminSidebar
            items={ADMIN_TABS}
            activeTab={activeTab}
            onChange={setActiveTab}
            user={authUser}
          />
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-slate-800 shadow-md shadow-rose-100/60 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <Menu className="h-5 w-5 text-rose-600" />
              Menu
            </button>

            <div className="min-w-0 flex-1 rounded-2xl bg-white px-4 py-3 text-right shadow-md shadow-rose-100/60">
              <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-400">
                Active Module
              </p>
              <p className="truncate text-sm font-extrabold text-slate-950">
                {activeTabData.shortLabel}
              </p>
            </div>
          </div>

          <section className="rounded-[2rem] border border-white bg-white p-4 shadow-xl shadow-rose-100/60 sm:p-6">
            {renderContent()}
          </section>
        </main>
      </div>
    </div>
  );
}

function ComingSoonPanel({ icon: Icon, title, text }) {
  return (
    <div className="flex min-h-[520px] items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
          <Icon className="h-8 w-8" />
        </div>

        <h2 className="mt-5 text-2xl font-bold text-slate-950">{title}</h2>

        <p className="mt-3 text-sm leading-6 text-slate-500">{text}</p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          <ShieldCheck className="h-4 w-4" />
          Component Ready Slot
        </div>
      </div>
    </div>
  );
}