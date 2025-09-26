import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Send,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Mic,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";

// --- Helper avatar (initials) ---
function Avatar({ name, color = "bg-gradient-to-br from-indigo-500 to-violet-600", size = "w-14 h-14", ring = true }) {
  const initials = useMemo(() => name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase(), [name]);
  return (
    <div className={`relative ${size} shrink-0 rounded-full ${color} text-white grid place-items-center font-semibold shadow-lg ${ring ? 'ring-2 ring-white/10' : ''}`}>
      <span>{initials}</span>
      <span className="absolute -bottom-0.5 -right-0.5 block w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-800" />
    </div>
  );
}

// --- Message bubble ---
function Bubble({ message, isMe }) {
  const statusIcon = message.status === 'sent' ? <Check className="w-3 h-3" /> : message.status === 'delivered' ? <CheckCheck className="w-3 h-3" /> : <CheckCheck className="w-3 h-3 text-sky-400" />;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={`flex items-end gap-3 mt-14 ${isMe ? 'justify-end' : 'justify-start'}`}
    >
      {!isMe && <Avatar name={message.from} size="w-12 h-12" ring={false} />}
      <div className={`max-w-[75%] rounded-2xl px-5 py-3 text-base leading-relaxed shadow-sm backdrop-blur border ${isMe ? 'bg-gradient-to-br from-sky-600 to-indigo-600 text-white border-white/10' : 'bg-white/70 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 border-black/5 dark:border-white/5'}`}>
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        {message.image && (
          <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
            <img src={message.image} alt="attachment" className="max-h-72 object-cover" />
          </div>
        )}
        <div className={`mt-2 flex items-center gap-1 text-[11px] ${isMe ? 'text-white/70' : 'text-slate-500 dark:text-slate-400'}`}>
          <span>{message.time}</span>
          {isMe && <span className="ml-1 inline-flex items-center gap-0.5">{statusIcon}</span>}
        </div>
      </div>
      {isMe && <Avatar name="You" size="w-12 h-12" ring={false} />}
    </motion.div>
  );
}

// --- Typing indicator ---
function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/70 border border-black/5 dark:border-white/5 mt-14">
      <motion.span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-300" animate={{ y: [0,-3,0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0 }} />
      <motion.span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-300" animate={{ y: [0,-3,0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.15 }} />
      <motion.span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-300" animate={{ y: [0,-3,0] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut', delay: 0.3 }} />
    </div>
  );
}

// --- Main component ---
export default function PremiumChatUI() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("t1");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const [shouldAutoscroll, setShouldAutoscroll] = useState(false); // NEW: control auto-scroll
  const [threads, setThreads] = useState([
    {
      id: "t1",
      name: "Sadia Ahmed",
      last: "See you at 6!",
      unread: 2,
      color: "bg-gradient-to-br from-fuchsia-500 to-rose-500",
      messages: [
        { id: 1, from: "Sadia Ahmed", text: "Hey! Reached?", time: "9:12 PM" },
        { id: 2, from: "You", text: "5 mins away.", time: "9:13 PM", status: "read" },
        { id: 3, from: "Sadia Ahmed", text: "Cool. Coffee or juice?", time: "9:14 PM" },
      ],
    },
    {
      id: "t2",
      name: "Team Skunkworks",
      last: "Deck v3 is live",
      unread: 0,
      color: "bg-gradient-to-br from-emerald-500 to-cyan-500",
      messages: [
        { id: 1, from: "Arif", text: "Pushed the API fix.", time: "5:42 PM" },
        { id: 2, from: "You", text: "Nice! I’ll review.", time: "5:45 PM", status: "delivered" },
        { id: 3, from: "Nabila", text: "Deck v3 is live", time: "6:01 PM" },
      ],
    },
    {
      id: "t3",
      name: "Mom",
      last: "Beta, dinner?",
      unread: 1,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      messages: [
        { id: 1, from: "Mom", text: "Beta, dinner?", time: "8:05 PM" },
      ],
    },
  ]);

  const current = threads.find(t => t.id === selectedId);
  const messageEndRef = useRef(null);

  // Only autoscroll when we explicitly send/receive, not when switching threads
  useEffect(() => {
    if (!shouldAutoscroll) return;
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    // reset so subsequent thread switches won't autoscroll
    const t = setTimeout(() => setShouldAutoscroll(false), 0);
    return () => clearTimeout(t);
  }, [current?.messages.length, shouldAutoscroll]);

  // Fake typing when you send a message
  const simulateReply = () => {
    setIsTyping(true);
    const replyIn = setTimeout(() => {
      setThreads(prev => prev.map(t => {
        if (t.id !== selectedId) return t;
        const next = { ...t };
        next.messages = [...next.messages, { id: Date.now()+1, from: current.name, text: "On it!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
        next.last = "On it!";
        return next;
      }));
      setIsTyping(false);
      setShouldAutoscroll(true); // scroll only for new incoming message
    }, 1200);
    return () => clearTimeout(replyIn);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setThreads(prev => prev.map(t => {
      if (t.id !== selectedId) return t;
      const next = { ...t };
      next.messages = [
        ...next.messages,
        { id: Date.now(), from: "You", text: input.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "sent" },
      ];
      next.last = input.trim();
      return next;
    }));
    setInput("");
    setShouldAutoscroll(true); // scroll only when sending
    simulateReply();
  };

  const onSelectThread = (id) => {
    setSelectedId(id);
    setShouldAutoscroll(false); // prevent auto scroll on thread change
  };

  const filteredThreads = React.useMemo(() => {
    if (!query.trim()) return threads;
    return threads.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));
  }, [threads, query]);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(1000px_600px_at_10%_-10%,#6ea8ff20_0%,transparent_60%),radial-gradient(800px_500px_at_90%_10%,#a78bfa1a_0%,transparent_60%),linear-gradient(180deg,#0f172a_0%,#0b1220_100%)] text-slate-100">
      <div className="mx-auto max-w-[1440px] p-6 sm:p-8">
        {/* Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-14 min-h-[78vh]">
          {/* Sidebar */}
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="lg:col-span-1 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden h-[78vh]"
          >
            {/* Profile / Controls */}
            <div className="flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <Avatar name="You" color="bg-gradient-to-br from-sky-500 to-indigo-600" />
                <div>
                  <p className="font-semibold text-lg">Md. Abir Hossain</p>
                  <p className="text-xs text-slate-400">Premium • Online</p>
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
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search chats"
                  className="bg-transparent outline-none placeholder:text-slate-400 text-sm w-full"
                />
                <button className="p-1.5 rounded-xl hover:bg-white/10"><Plus className="w-4 h-4" /></button>
              </div>
            </div>
            {/* Threads */}
            <div className="h-[calc(78vh-140px)] overflow-y-auto px-3 pb-4">
              {filteredThreads.map(t => (
                <button
                  key={t.id}
                  onClick={() => onSelectThread(t.id)}
                  className={`w-full flex items-center gap-4 rounded-2xl px-4 py-4 my-1.5 text-left transition ${selectedId===t.id ? 'bg-white/15' : 'hover:bg-white/5'}`}
                >
                  <Avatar name={t.name} color={t.color} size="w-14 h-14" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{t.name}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{t.messages.at(-1)?.time || '—'}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1">{t.last}</p>
                  </div>
                  {t.unread > 0 && (
                    <span className="ml-2 inline-grid place-items-center text-[10px] font-semibold w-6 h-6 rounded-full bg-rose-500">{t.unread}</span>
                  )}
                </button>
              ))}
            </div>
          </motion.aside>

          {/* Chat Area */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
            className="lg:col-span-2 rounded-3xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl overflow-hidden flex flex-col h-[78vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-4">
                <Avatar name={current.name} color={current.color} />
                <div>
                  <h3 className="font-semibold text-lg">{current.name}</h3>
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Active now</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-200">
                <button className="px-4 py-2 rounded-xl hover:bg-white/10 inline-flex items-center gap-2"><Phone className="w-4 h-4" /> <span className="hidden sm:inline">Call</span></button>
                <button className="px-4 py-2 rounded-xl hover:bg-white/10 inline-flex items-center gap-2"><Video className="w-4 h-4" /> <span className="hidden sm:inline">Video</span></button>
                <button className="p-2 rounded-xl hover:bg-white/10"><MoreVertical className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[radial-gradient(600px_200px_at_50%_0%,#ffffff10_0%,transparent_100%)]">
              <AnimatePresence initial={false}>
                {current.messages.map(m => (
                  <Bubble key={m.id} message={m} isMe={m.from === 'You'} />
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
                <button className="p-3 rounded-xl hover:bg-white/10"><Paperclip className="w-5 h-5" /></button>
                <button className="p-3 rounded-xl hover:bg-white/10"><ImageIcon className="w-5 h-5" /></button>
                <div className="flex-1">
                  <div className="rounded-2xl border border-white/10 bg-white/10 focus-within:bg-white/15 transition px-4 py-3">
                    <textarea
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      rows={1}
                      placeholder="Write a message…"
                      className="w-full bg-transparent outline-none resize-none placeholder:text-slate-400 text-slate-50 text-base"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="p-2.5 rounded-xl hover:bg-white/10"><Smile className="w-5 h-5" /></button>
                        <button
                          onMouseDown={() => setRecording(true)}
                          onMouseUp={() => setRecording(false)}
                          className={`p-2.5 rounded-xl hover:bg-white/10 ${recording ? 'bg-rose-500/20' : ''}`}
                          title="Hold to record"
                        >
                          <Mic className={`w-5 h-5 ${recording ? 'text-rose-400 animate-pulse' : ''}`} />
                        </button>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSend}
                        className="inline-flex items-center gap-2 bg-gradient-to-br from-sky-500 to-indigo-600 px-5 py-2.5 rounded-xl shadow-lg hover:shadow-sky-500/20 border border-white/10"
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
        {[...Array(30)].map((_,i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0], y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6 + Math.random()*6, delay: Math.random()*5 }}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/*
USAGE:
- Ensure Tailwind CSS is configured (https://tailwindcss.com/docs/installation) and dark mode is class-based.
- Install deps: npm i framer-motion lucide-react
- Import & render <PremiumChatUI /> anywhere in your React app.
NOTES:
- Auto-scroll is now suppressed on thread switch. It only triggers when you send/receive messages.
- If you want to always scroll on load, set shouldAutoscroll to true in a useEffect after mount of a conversation.
- Height & spacing: container, panels, bubbles, and typing indicator now use generous sizing; top-level sections include mt-14.
*/
