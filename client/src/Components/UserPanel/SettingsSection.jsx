// SettingsSection.jsx
import React from "react";
import { ToggleRow } from "./blocks";

export default function SettingsSection() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <h3 className="text-lg font-semibold">Settings</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <ToggleRow label="Email notifications" defaultChecked />
          <ToggleRow label="WhatsApp notifications" />
          <ToggleRow label="Profile visibility" defaultChecked />
          <ToggleRow label="Show online status" defaultChecked />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition">
            Save settings
          </button>
          <button className="rounded-xl px-4 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition">
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
