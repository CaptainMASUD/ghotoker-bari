// src/Components/UserPanel/InboxSection.jsx
import React from "react";
import { ThreadRow, RowSkeleton } from "./blocks.jsx";

export default function InboxSection({ loadingThreads, threads }) {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Inbox — Conversations</h3>
          <a
            href="/chat"
            className="text-sm rounded-xl px-3 py-1.5 border border-white/15 bg-white/5 hover:bg-white/10 transition"
            title="Open chat"
          >
            Open chat
          </a>
        </div>

        <div className="mt-4 space-y-3">
          {loadingThreads ? (
            <RowSkeleton />
          ) : threads.length === 0 ? (
            <div className="text-white/60 text-sm">No conversations yet.</div>
          ) : (
            threads.map((t) => <ThreadRow key={t.peerId} t={t} />)
          )}
        </div>

        <p className="mt-4 text-sm text-white/60">
          This panel lists your conversation heads (unread counts & last message). Use the chat page to reply.
        </p>
      </div>
    </section>
  );
}
