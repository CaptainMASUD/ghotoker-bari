// Components/UserPanel/blocks.jsx  (or blocks.js if you prefer)
import React from "react";
import {
  FaShieldAlt, FaClock, FaMapMarkerAlt, FaCalendarAlt, FaTransgender,
  FaUser, FaBriefcase, FaGraduationCap
} from "react-icons/fa";
import { capitalize } from "./hooks";

export function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
      <div className="flex items-center justify-between">
        <div className="text-rose-300 text-xl">{icon}</div>
        <span className="text-xs text-white/60">{hint}</span>
      </div>
      <div className="mt-3 text-3xl font-extrabold">{value}</div>
      <div className="text-sm text-white/75">{label}</div>
    </div>
  );
}

export function DetailField({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

export function ToggleRow({ label, defaultChecked = false }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="accent-rose-300 h-4 w-4 cursor-pointer" />
    </label>
  );
}

export function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-white/70">{label}:</span>
      <span className="font-medium text-white/90 truncate">{value}</span>
    </div>
  );
}

export function MembershipCard({ loading, membership }) {
  const type = capitalize(membership?.type || "free");
  const active = membership?.active;
  const daysLeft = membership?.days_left ?? 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-white/10 border border-white/15">
          <FaShieldAlt className="text-rose-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Membership</h3>
          <p className="text-sm text-white/70">
            {loading ? "Loading…" : `${type} • ${active ? "Active" : "Inactive"}`}
            {active ? (
              <span className="inline-flex items-center gap-2 ml-2 text-xs text-white/70">
                <FaClock /> {daysLeft} day{daysLeft === 1 ? "" : "s"} left
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ProfileQuick({ me, loading, computeAgeFromDOB }) {
  const rows = [
    ["Location", me?.current_city],
    ["Joined", me?.createdAt ? new Date(me.createdAt).toLocaleDateString() : "—"],
    ["Gender", me?.gender],
    ["Age", computeAgeFromDOB(me?.dob)],
    ["Profession", me?.profession],
    ["Education", me?.highest_education],
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
      <h3 className="text-lg font-semibold">Quick Profile</h3>
      {loading ? (
        <GridSkeleton small />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <InfoRow icon={<FaMapMarkerAlt className="text-rose-300" />} label="Location" value={rows[0][1] || "—"} />
          <InfoRow icon={<FaCalendarAlt className="text-rose-300" />} label="Joined" value={rows[1][1] || "—"} />
          <InfoRow icon={<FaTransgender className="text-rose-300" />} label="Gender" value={rows[2][1] || "—"} />
          <InfoRow icon={<FaUser className="text-rose-300" />} label="Age" value={rows[3][1] || "—"} />
          <InfoRow icon={<FaBriefcase className="text-rose-300" />} label="Profession" value={rows[4][1] || "—"} />
          <InfoRow icon={<FaGraduationCap className="text-rose-300" />} label="Education" value={rows[5][1] || "—"} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href="/settings/profile"
          className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition"
        >
          Edit profile
        </a>
        <a
          href="/settings/account"
          className="rounded-2xl px-4 py-2 text-sm border border-white/15 bg-white/5 hover:bg-white/10 transition"
        >
          Manage privacy
        </a>
      </div>
    </div>
  );
}

export function ThreadRow({ t }) {
  const time = t.lastAt ? new Date(t.lastAt).toLocaleString([], { hour: "2-digit", minute: "2-digit" }) : "—";
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mt-1">
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${t.unread > 0 ? "bg-rose-300" : "bg-white/30"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="font-semibold truncate">{t.name}</p>
          <span className="text-xs text-white/60 shrink-0 ml-3">{time}</span>
        </div>
        <p className="text-sm text-white/75 mt-0.5 line-clamp-2">{t.lastMessage || "No messages yet."}</p>

        <div className="mt-3 flex flex-wrap gap-3">
          <a
            href={`/chat?peer=${encodeURIComponent(t.peerId)}`}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 hover:shadow-md shadow-rose-900/20 transition"
          >
            Open chat
          </a>
          {t.unread > 0 && (
            <span className="rounded-xl px-3 py-1.5 text-xs border border-white/10 bg-white/[0.03]">
              Unread: <span className="text-white/80 ml-1">{t.unread}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* Skeletons */
export function RowSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
      ))}
    </div>
  );
}

export function GridSkeleton({ small = false }) {
  const n = small ? 6 : 8;
  return (
    <div className={`mt-4 grid ${small ? "grid-cols-2" : "md:grid-cols-2"} gap-3`}>
      {[...Array(n)].map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/10 animate-pulse" />
      ))}
    </div>
  );
}
