// OverviewSection.jsx
import React from "react";
import { FaUserFriends, FaBell, FaEye, FaRegBookmark } from "react-icons/fa";
import { MembershipCard, StatCard, ProfileQuick, ThreadRow, RowSkeleton } from "./blocks";
import { computeAgeFromDOB } from "./hooks"; // re-use util

export default function OverviewSection({ membership, completeness, loadingMe, threads, loadingThreads, token, effectiveMe }) {
  const stats = [
    { key: "threads",   label: "Conversations", value: loadingThreads ? "…" : threads.length, icon: <FaUserFriends />, hint: loadingThreads ? "loading…" : "active chats" },
    { key: "unread",    label: "Unread",        value: loadingThreads ? "…" : threads.reduce((s, t) => s + (t.unread || 0), 0), icon: <FaBell />, hint: "needs attention" },
    { key: "completion",label: "Profile Complete", value: `${completeness}%`, icon: <FaEye />, hint: "fill out missing fields" },
    { key: "bookmark",  label: "Shortlists",    value: "—", icon: <FaRegBookmark />, hint: "coming soon" },
  ];

  return (
    <section className="space-y-6">
      <MembershipCard loading={loadingMe} membership={membership} />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((m) => (
          <StatCard key={m.key} label={m.label} value={m.value} hint={m.hint} icon={m.icon} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ProfileQuick me={effectiveMe} loading={loadingMe} computeAgeFromDOB={computeAgeFromDOB} />

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <h3 className="text-lg font-semibold">Recent Messages</h3>
          <div className="mt-3 space-y-3">
            {loadingThreads ? (
              <RowSkeleton />
            ) : threads.length === 0 ? (
              <div className="text-white/60 text-sm">{token ? "No conversations yet." : "Sign in to view your inbox."}</div>
            ) : (
              threads.slice(0, 6).map((t) => <ThreadRow key={t.peerId} t={t} />)
            )}
          </div>
          <div className="mt-4">
            <a href="/chat" className="text-sm text-rose-300 underline underline-offset-4 hover:text-rose-200">Open chat</a>
          </div>
        </div>
      </div>
    </section>
  );
}
