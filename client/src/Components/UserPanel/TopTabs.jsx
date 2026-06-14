import React from "react";
import {
  FaBell,
  FaCog,
  FaHandshake,
  FaUser,
  FaUserFriends,
} from "react-icons/fa";

const tabs = [
  {
    key: "overview",
    label: "Overview",
    icon: <FaUserFriends />,
  },
  {
    key: "profile",
    label: "Profile",
    icon: <FaUser />,
  },
  {
    key: "requests",
    label: "Requests",
    icon: <FaHandshake />,
  },
  {
    key: "messaging",
    label: "Inbox",
    icon: <FaBell />,
  },
  {
    key: "settings",
    label: "Settings",
    icon: <FaCog />,
  },
];

export default function TopTabs({ active, setActive }) {
  return (
    <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-2xl bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActive(tab.key)}
          className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold transition sm:px-4 ${
            active === tab.key
              ? "bg-white text-rose-600 shadow-sm"
              : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
          }`}
        >
          <span className="text-[12px]">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}