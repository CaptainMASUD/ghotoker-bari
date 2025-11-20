// PremiumChatUI.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, MoreVertical, Phone, Video, Check, CheckCheck, Send,
  Paperclip, Image as ImageIcon, Smile, Mic, Bell, Settings, LogOut,
} from "lucide-react";

/** =========================
 *  CONFIG
 *  ========================= */
const API_BASE = "https://ghotoker-bari-api.vercel.app";        // REST base
const SOCKET_URL = "https://ghotoker-bari-api.vercel.app/chat"; // Socket.IO namespace

/** =========================
 *  Auth helpers
 *  ========================= */
const parseLS = (key) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
};

const useAuthToken = () => {
  const reduxCurrent = useSelector((s) => s.user?.currentUser ?? null);
  const tokenFromRedux =
    typeof reduxCurrent === "string"
      ? reduxCurrent
      : reduxCurrent?.token ?? null;

  const tokenFromLS = localStorage.getItem("token") || null;
  return tokenFromRedux || tokenFromLS || null;
};

const useMyUserObject = () => {
  const reduxCurrent = useSelector((s) => s.user?.currentUser ?? null);
  if (reduxCurrent && typeof reduxCurrent === "object" && reduxCurrent._id) {
    return reduxCurrent;
  }
  const candidates = ["currentUser", "user", "authUser"];
  for (const key of candidates) {
    const obj = parseLS(key);
    if (obj && typeof obj === "object" && obj._id) return obj;
  }
  return null;
};

const useMyIdentity = () => {
  const token = useAuthToken();
  const u = useMyUserObject();

  const myId =
    u?._id ||
    (token
      ? (() => {
          try { return jwtDecode(token)?.id || null; } catch { return null; }
        })()
      : null);

  const myName =
    u?.username ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
    "You";

  return { myId, myName, token };
};

const useApi = (token) => {
  const api = useMemo(() => {
    const a = axios.create({ baseURL: API_BASE });
    a.interceptors.request.use((config) => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return a;
  }, [token]);
  return api;
};

/** =========================
 *  UI helpers
 *  ========================= */
function Avatar({ name, color = "bg-gradient-to-br from-indigo-500 to-violet-600", size = "w-14 h-14", ring = true }) {
  const initials = useMemo(() => name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase(), [name]);
  return (
    <div className={`relative ${size} shrink-0 rounded-full ${color} text-white grid place-items-center font-semibold shadow-lg ${ring ? 'ring-2 ring-white/10' : ''}`}>
      <span>{initials}</span>
      <span className="absolute -bottom-0.5 -right-0.5 block w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-800" />
    </div>
  );
}

function Bubble({ message, isMe }) {
  const statusIcon =
    message.status === "sent" ? (
      <Check className="w-3 h-3" />
    ) : message.status === "delivered" ? (
      <CheckCheck className="w-3 h-3" />
    ) : (
      <CheckCheck className="w-3 h-3 text-sky-400" />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
      className={`flex items-end gap-3 mt-14 ${isMe ? "justify-end" : "justify-start"}`}
    >
      {!isMe && <Avatar name={message.from} size="w-12 h-12" ring={false} />}
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3 text-base leading-relaxed shadow-sm backdrop-blur border ${
          isMe
            ? "bg-gradient-to-br from-sky-600 to-indigo-600 text-white border-white/10"
            : "bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border-black/5 dark:border-white/5"
        }`}
      >
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        {message.image && (
          <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
            <img src={message.image} alt="attachment" className="max-h-72 object-cover" />
          </div>
        )}
        <div
          className={`mt-2 flex items-center gap-1 text-[11px] ${
            isMe ? "text-white/70" : "text-slate-500 dark:text-slate-400"
          }`}
        >
          <span>{message.time}</span>
          {isMe && <span className="ml-1 inline-flex items-center gap-0.5">{statusIcon}</span>}
        </div>
      </div>
      {isMe && <Avatar name="You" size="w-12 h-12" ring={false} />}
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/70 border border-black/5 dark:border-white/5 mt-14">
      <motion.span className="w-2 h-2 rounded-full" style={{ background: "currentColor" }} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0 }} />
      <motion.span className="w-2 h-2 rounded-full" style={{ background: "currentColor" }} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.15 }} />
      <motion.span className="w-2 h-2 rounded-full" style={{ background: "currentColor" }} animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut", delay: 0.3 }} />
    </div>
  );
}

/** =========================
 *  Main Component
 *  ========================= */
export default function PremiumChatUI() {
  const { myId, myName, token } = useMyIdentity();
  const api = useApi(token);

  const [query, setQuery] = useState("");
  const [selectedPeerId, setSelectedPeerId] = useState(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [shouldAutoscroll, setShouldAutoscroll] = useState(false);

  // threads: [{ peerId, name, unread, last, lastAt, color }]
  const [threads, setThreads] = useState([]);
  // messages map: peerId -> [{ id, from, text, time, status, raw }]
  const [messagesByPeer, setMessagesByPeer] = useState({});
  const currentMessages = messagesByPeer[selectedPeerId] || [];
  const messageEndRef = useRef(null);
  const socketRef = useRef(null);

  const fmtTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Peer name fallback only (no admin/user fetch)
  const nameForPeer = (peerId) =>
    threads.find((t) => t.peerId === peerId)?.name || `User ${String(peerId).slice(-4)}`;

  const loadThreads = async () => {
    const { data } = await api.get("/api/messages/threads");
    const enriched = (data?.threads || []).map((t) => {
      const peerId = t._id;
      return {
        peerId,
        name: `User ${String(peerId).slice(-4)}`, // placeholder only
        unread: t.unreadCount || 0,
        last: t.lastMessage?.content || "",
        lastAt: t.lastMessage?.createdAt || null,
        color: "bg-gradient-to-br from-emerald-500 to-cyan-500",
      };
    });
    enriched.sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
    setThreads(enriched);
    if (!selectedPeerId && enriched[0]?.peerId) {
      setSelectedPeerId(enriched[0].peerId);
    }
  };

  const loadConversation = async (peerId) => {
    const { data } = await api.get(`/api/messages/${peerId}?limit=50&skip=0`);
    const display = nameForPeer(peerId);
    const msgs = (data?.messages || [])
      .map((m) => ({
        id: m._id,
        from: m.sender === myId ? "You" : display,
        text: m.content,
        time: fmtTime(m.createdAt),
        status: m.sender === myId ? (m.seen ? "read" : "delivered") : undefined,
        raw: m,
      }))
      .reverse(); // API returns newest-first
    setMessagesByPeer((prev) => ({ ...prev, [peerId]: msgs }));
  };

  useEffect(() => {
    if (!shouldAutoscroll) return;
    messageEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    const t = setTimeout(() => setShouldAutoscroll(false), 0);
    return () => clearTimeout(t);
  }, [currentMessages.length, shouldAutoscroll]);

  useEffect(() => {
    if (!token || !myId) return;

    (async () => {
      await loadThreads();
    })();

    const s = io(SOCKET_URL, { auth: { token } });
    socketRef.current = s;

    s.on("connect_error", (err) => {
      console.error("socket connect_error:", err?.message || err);
    });

    s.on("message", async (payload) => {
      const { sender, receiver, content, createdAt, _id } = payload;
      const peerId = sender === myId ? receiver : sender;

      // ensure thread exists
      let thread = threads.find((t) => t.peerId === peerId);
      if (!thread) {
        thread = {
          peerId,
          name: `User ${String(peerId).slice(-4)}`,
          unread: 0,
          last: content,
          lastAt: createdAt,
          color: "bg-gradient-to-br from-emerald-500 to-cyan-500",
        };
        setThreads((prev) => [thread, ...prev]);
      } else {
        setThreads((prev) =>
          prev
            .map((t) =>
              t.peerId === peerId
                ? {
                    ...t,
                    last: content,
                    lastAt: createdAt,
                    unread:
                      peerId === selectedPeerId
                        ? t.unread
                        : t.unread + (sender !== myId ? 1 : 0),
                  }
                : t
            )
            .sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0))
        );
      }

      // push message
      setMessagesByPeer((prev) => {
        const list = prev[peerId] || [];
        const pretty = {
          id: _id,
          from: sender === myId ? "You" : nameForPeer(peerId),
          text: content,
          time: fmtTime(createdAt),
          status: sender === myId ? "sent" : undefined,
          raw: payload,
        };
        return { ...prev, [peerId]: [...list, pretty] };
      });

      if (peerId === selectedPeerId) setShouldAutoscroll(true);
    });

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, myId, selectedPeerId, threads.length]);

  useEffect(() => {
    if (selectedPeerId && token) {
      loadConversation(selectedPeerId);
      setThreads((prev) =>
        prev.map((t) => (t.peerId === selectedPeerId ? { ...t, unread: 0 } : t))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeerId, token]);

  const handleSend = async () => {
    if (!input.trim() || !selectedPeerId) return;
    const text = input.trim();
    setInput("");

    const optimistic = {
      id: `temp-${Date.now()}`,
      from: "You",
      text,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessagesByPeer((p) => ({
      ...p,
      [selectedPeerId]: [...(p[selectedPeerId] || []), optimistic],
    }));
    setThreads((prev) =>
      prev
        .map((t) =>
          t.peerId === selectedPeerId
            ? { ...t, last: text, lastAt: new Date().toISOString() }
            : t
        )
        .sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0))
    );
    setShouldAutoscroll(true);

    let sentViaSocket = false;
    try {
      await new Promise((resolve, reject) => {
        socketRef.current?.emit(
          "send_message",
          { to: selectedPeerId, content: text },
          (res) => {
            if (!res?.ok) return reject(new Error(res?.error || "Send failed"));
            resolve();
          }
        );
      });
      sentViaSocket = true;
    } catch {
      try {
        await api.post("/api/messages", { to: selectedPeerId, content: text });
      } catch (err) {
        setMessagesByPeer((p) => ({
          ...p,
          [selectedPeerId]: (p[selectedPeerId] || []).filter(
            (m) => m.id !== optimistic.id
          ),
        }));
        alert(err?.response?.data?.message || err.message || "Failed to send");
      }
    }

    if (!sentViaSocket) {
      loadConversation(selectedPeerId);
    }
  };

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? threads.filter((t) => t.name.toLowerCase().includes(q)) : threads;
  }, [threads, query]);

  const currentThread = selectedPeerId
    ? threads.find((t) => t.peerId === selectedPeerId)
    : null;

  if (!token || !myId) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-200">
        <div className="p-8 rounded-2xl bg-slate-800/60 border border-white/10">
          <p className="text-lg">Please sign in to use chat.</p>
          <p className="text-sm opacity-70 mt-2">
            Tip: ensure Redux <code>state.user.currentUser</code> or localStorage has either a token or a user object with <code>_id</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(1000px_600px_at_10%_-10%,#6ea8ff20_0%,transparent_60%),radial-gradient(800px_500px_at_90%_10%,#a78bfa1a_0%,transparent_60%),linear-gradient(180deg,#0f172a_0%,#0b1220_100%)] text-slate-100">
      <div className="mx-auto max-w-[1440px] p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-14 min-h-[78vh]">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="lg:col-span-1 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden h-[78vh]"
          >
            {/* Profile / Controls */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <Avatar name={myName || "You"} color="bg-gradient-to-br from-sky-500 to-indigo-600" />
                <div>
                  <p className="font-semibold text-lg">{myName || "You"}</p>
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <button className="p-2 hover:bg-white/10 rounded-full"><Bell className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-white/10 rounded-full"><Settings className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-white/10 rounded-full"><LogOut className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Search */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Search className="w-4 h-4 text-slate-300" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search chats"
                  className="bg-transparent outline-none placeholder:text-slate-400 text-sm w-full"
                />
                <button className="p-1.5 rounded-xl hover:bg-white/10"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Threads */}
            <div className="h-[calc(78vh-140px)] overflow-y-auto px-3 pb-4">
              {filteredThreads.map((t) => (
                <button
                  key={t.peerId}
                  onClick={() => {
                    setSelectedPeerId(t.peerId);
                    setShouldAutoscroll(false);
                  }}
                  className={`w-full flex items-center gap-4 rounded-2xl px-4 py-4 my-1.5 text-left transition ${
                    selectedPeerId === t.peerId ? "bg-white/15" : "hover:bg-white/5"
                  }`}
                >
                  <Avatar name={t.name} color={t.color} size="w-14 h-14" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{t.name}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {t.lastAt ? fmtTime(t.lastAt) : "—"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1">{t.last || " "}</p>
                  </div>
                  {t.unread > 0 && (
                    <span className="ml-2 inline-grid place-items-center text-[10px] font-semibold w-6 h-6 rounded-full bg-rose-500">
                      {t.unread}
                    </span>
                  )}
                </button>
              ))}
              {filteredThreads.length === 0 && (
                <div className="px-4 py-3 text-slate-400 text-sm">No conversations.</div>
              )}
            </div>
          </motion.aside>

          {/* Chat Area */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className="lg:col-span-2 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[78vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
              {selectedPeerId ? (
                <>
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={nameForPeer(selectedPeerId)}
                      color="bg-gradient-to-br from-emerald-500 to-cyan-500"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{nameForPeer(selectedPeerId)}</h3>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>Active now</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <button className="px-4 py-2 rounded-xl hover:bg-white/10 inline-flex items-center gap-2">
                      <Phone className="w-4 h-4" /> <span className="hidden sm:inline">Call</span>
                    </button>
                    <button className="px-4 py-2 rounded-xl hover:bg-white/10 inline-flex items-center gap-2">
                      <Video className="w-4 h-4" /> <span className="hidden sm:inline">Video</span>
                    </button>
                    <button className="p-2 rounded-xl hover:bg-white/10">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-slate-300">Select a conversation</div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[radial-gradient(600px_200px_at_50%_0%,#ffffff10_0%,transparent_100%)]">
              <AnimatePresence initial={false}>
                {currentMessages.map((m) => (
                  <Bubble key={m.id} message={m} isMe={m.from === "You"} />
                ))}
              </AnimatePresence>
              {isTyping && (
                <div className="mt-2">
                  <TypingDots />
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Composer */}
            <div className="p-4 border-t border-white/10 bg-gradient-to-b from-white/5 to-white/0">
              <div className="flex items-end gap-3">
                <button className="p-3 rounded-xl hover:bg-white/10">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="p-3 rounded-xl hover:bg-white/10">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <div className="rounded-2xl border border-white/10 bg-white/10 focus-within:bg-white/15 transition px-4 py-3">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      rows={1}
                      placeholder={selectedPeerId ? "Write a message…" : "Select a conversation to start"}
                      disabled={!selectedPeerId}
                      className="w-full bg-transparent outline-none resize-none placeholder:text-slate-400 text-slate-50 text-base disabled:opacity-50"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="p-2.5 rounded-xl hover:bg-white/10">
                          <Smile className="w-5 h-5" />
                        </button>
                        <button
                          onMouseDown={() => setIsTyping(true)}
                          onMouseUp={() => setIsTyping(false)}
                          className={`p-2.5 rounded-xl hover:bg-white/10 ${isTyping ? "bg-rose-500/20" : ""}`}
                          title="Hold to simulate typing"
                        >
                          <Mic className={`w-5 h-5 ${isTyping ? "text-rose-400 animate-pulse" : ""}`} />
                        </button>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSend}
                        disabled={!selectedPeerId || !input.trim()}
                        className="inline-flex items-center gap-2 bg-gradient-to-br from-sky-500 to-indigo-600 px-5 py-2.5 rounded-xl shadow-lg hover:shadow-sky-500/20 border border-white/10 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline">Send</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Subtle background sparkles */}
      <div className="pointer-events-none fixed inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0], y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6 + Math.random() * 6, delay: Math.random() * 5 }}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
