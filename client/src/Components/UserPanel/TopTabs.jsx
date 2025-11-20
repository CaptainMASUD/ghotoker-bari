// TopTabs.jsx
import React from "react";
import { capitalize } from "./hooks";

export default function TopTabs({ active, setActive }) {
  const tabs = ["overview", "profile", "messaging", "settings"];
  return (
    <div className="hidden md:flex lg:hidden gap-2">
      {tabs.map((key) => (
        <button
          key={key}
          onClick={() => setActive(key)}
          className={`px-3 py-2 text-sm rounded-xl border transition ${
            active === key ? "border-rose-300/70 text-rose-300" : "border-white/10 text-white/80 hover:bg-white/5"
          }`}
        >
          {capitalize(key)}
        </button>
      ))}
    </div>
  );
}
