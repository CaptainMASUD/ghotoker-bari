import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCheck,
  FaCheckCircle,
  FaCrown,
  FaExclamationCircle,
  FaPaperPlane,
  FaRegCommentDots,
  FaSearch,
  FaSpinner,
  FaSyncAlt,
  FaTimesCircle,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getStoredToken() {
  try {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken") ||
      ""
    );
  } catch {
    return "";
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function fetchWithAuth(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const result = await safeJson(response);

  return { response, result };
}

function extractUser(result) {
  return (
    result?.user ||
    result?.data?.user ||
    result?.data ||
    result?.profile ||
    result?.me ||
    null
  );
}

function extractItems(result) {
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.data?.items)) return result.data.items;
  if (Array.isArray(result?.requests)) return result.requests;
  if (Array.isArray(result)) return result;
  return [];
}

function getId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value?._id || value?.id || "");
}

function cleanText(value) {
  if (!value) return "";

  return String(value)
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPersonName(user) {
  return (
    user?.full_name ||
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "User"
  );
}

function getPersonAvatar(user) {
  const name = getPersonName(user);

  const photos = Array.isArray(user?.profile_photos)
    ? user.profile_photos.filter(Boolean)
    : [];

  if (photos[0]) return photos[0];

  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name
  )}`;
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isDateActive(expiry) {
  if (!expiry) return true;

  const expiryDate = new Date(expiry);

  if (Number.isNaN(expiryDate.getTime())) return true;

  return expiryDate.getTime() >= Date.now();
}

function getMembershipId(user) {
  const statusObject =
    user?.membership_status && typeof user.membership_status === "object"
      ? user.membership_status
      : null;

  if (statusObject?.plan_id) return statusObject.plan_id;

  const membership = user?.membership;

  if (!membership) return "";

  if (typeof membership === "object") {
    return membership?._id || membership?.id || "";
  }

  return membership;
}

function buildMembershipView(user) {
  const rawStatus = user?.membership_status;
  const statusObject =
    rawStatus && typeof rawStatus === "object" ? rawStatus : null;

  const rawMembership = user?.membership;
  const membershipObject =
    rawMembership && typeof rawMembership === "object" ? rawMembership : null;

  const membershipId = getMembershipId(user);

  const status = String(
    statusObject?.status ||
      (typeof rawStatus === "string" ? rawStatus : "") ||
      ""
  ).toLowerCase();

  const slug = statusObject?.slug || membershipObject?.slug || "";

  const isFree =
    Boolean(statusObject?.is_free || membershipObject?.is_free) ||
    slug === "free" ||
    status === "free";

  const expiry =
    statusObject?.expiry ||
    user?.membership_expiry ||
    membershipObject?.membership_expiry ||
    null;

  let active = false;

  if (typeof statusObject?.active === "boolean") {
    active = statusObject.active && isDateActive(expiry);
  } else if (["expired", "cancelled", "canceled", "inactive"].includes(status)) {
    active = false;
  } else if (membershipId) {
    active = isDateActive(expiry);
  }

  const features = statusObject?.features || membershipObject?.features || {};

  return {
    id: membershipId,
    name:
      statusObject?.name ||
      membershipObject?.name ||
      cleanText(slug || status || "Free Plan"),
    active,
    is_free: isFree,
    is_paid: Boolean(statusObject?.is_paid || (!isFree && active)),
    can_send_messages: Boolean(features.can_send_messages),
    message_limit: features.message_limit ?? 0,
  };
}

async function loadAllActions({
  token,
  type,
  status = "",
  box = "all",
  maxPages = 6,
}) {
  const rows = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const params = new URLSearchParams();

    if (type) params.set("type", type);
    if (status) params.set("status", status);

    params.set("box", box);
    params.set("limit", "50");
    params.set("page", String(page));

    const { response, result } = await fetchWithAuth(
      `${API_BASE_URL}/api/matrimony-actions/my?${params.toString()}`,
      token
    );

    if (!response.ok) {
      throw new Error(result?.message || "Could not load chat data.");
    }

    const items = extractItems(result);
    rows.push(...items);

    const totalPages = Number(result?.totalPages || 1);

    if (page >= totalPages) break;
  }

  return rows;
}

function getPeerFromConnection(connection, myId) {
  const fromId = getId(connection?.from_user);
  const toId = getId(connection?.to_user);

  if (fromId === myId) return connection?.to_user;
  if (toId === myId) return connection?.from_user;

  return null;
}

function buildMessage(action, myId) {
  const fromId = getId(action?.from_user);
  const toId = getId(action?.to_user);
  const isMine = fromId === myId;

  return {
    id: getId(action) || `${fromId}-${toId}-${action?.createdAt}`,
    peerId: isMine ? toId : fromId,
    fromId,
    toId,
    text: action?.message || "",
    time: action?.createdAt || action?.responded_at || null,
    isMine,
    status: action?.status || "sent",
    raw: action,
  };
}

function groupMessagesByPeer(messages, myId) {
  const grouped = {};

  messages.forEach((action) => {
    const item = buildMessage(action, myId);

    if (!item.peerId) return;

    if (!grouped[item.peerId]) {
      grouped[item.peerId] = [];
    }

    grouped[item.peerId].push(item);
  });

  Object.keys(grouped).forEach((peerId) => {
    grouped[peerId].sort(
      (a, b) => new Date(a.time || 0) - new Date(b.time || 0)
    );
  });

  return grouped;
}

export default function InboxSection({ token: propToken = "" }) {
  const token = propToken || getStoredToken();
  const messageEndRef = useRef(null);

  const [me, setMe] = useState(null);
  const [threads, setThreads] = useState([]);
  const [messagesByPeer, setMessagesByPeer] = useState({});
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [query, setQuery] = useState("");
  const [input, setInput] = useState("");

  const [limitInfo, setLimitInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sendError, setSendError] = useState("");

  const myId = getId(me);
  const membership = useMemo(() => buildMembershipView(me), [me]);

  const currentThread = useMemo(() => {
    return threads.find((item) => item.peerId === selectedPeerId) || null;
  }, [threads, selectedPeerId]);

  const currentMessages = useMemo(() => {
    return messagesByPeer[selectedPeerId] || [];
  }, [messagesByPeer, selectedPeerId]);

  const filteredThreads = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return threads;

    return threads.filter((thread) =>
      String(thread.name || "").toLowerCase().includes(keyword)
    );
  }, [threads, query]);

  const loadChat = async (silent = false) => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      setLoadError("Login required.");
      return;
    }

    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setLoadError("");
      setSendError("");

      const profileRes = await fetchWithAuth(
        `${API_BASE_URL}/api/user/me`,
        token
      );

      if (!profileRes.response.ok) {
        throw new Error(
          profileRes.result?.message || "Could not load your profile."
        );
      }

      const user = extractUser(profileRes.result);

      if (!user) {
        throw new Error("Profile data was not returned from the server.");
      }

      const currentUserId = getId(user);

      const [connections, messageActions] = await Promise.all([
        loadAllActions({
          token,
          type: "connection_request",
          status: "accepted",
          box: "all",
        }),
        loadAllActions({
          token,
          type: "message",
          box: "all",
        }),
      ]);

      const groupedMessages = groupMessagesByPeer(messageActions, currentUserId);

      const connectedThreads = connections
        .map((connection) => {
          const peer = getPeerFromConnection(connection, currentUserId);
          const peerId = getId(peer);

          if (!peerId) return null;

          const peerMessages = groupedMessages[peerId] || [];
          const lastMessage = peerMessages[peerMessages.length - 1] || null;

          return {
            peerId,
            connectionId: getId(connection),
            peer,
            name: getPersonName(peer),
            avatar: getPersonAvatar(peer),
            age: peer?.age || null,
            gender: peer?.gender || null,
            religion: peer?.religion || null,
            profession: peer?.profession || null,
            location:
              peer?.current_city ||
              peer?.current_district ||
              peer?.current_division ||
              "",
            isVerified: Boolean(peer?.isVerified),
            connectedAt:
              connection?.responded_at ||
              connection?.updatedAt ||
              connection?.createdAt,
            lastMessage: lastMessage?.text || "Start conversation",
            lastAt:
              lastMessage?.time ||
              connection?.responded_at ||
              connection?.updatedAt ||
              connection?.createdAt,
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));

      setMe(user);
      setMessagesByPeer(groupedMessages);
      setThreads(connectedThreads);

      setSelectedPeerId((prev) => {
        if (prev && connectedThreads.some((thread) => thread.peerId === prev)) {
          return prev;
        }

        return connectedThreads[0]?.peerId || "";
      });
    } catch (error) {
      setLoadError(error?.message || "Could not load inbox.");
      setThreads([]);
      setMessagesByPeer({});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadChat(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [selectedPeerId, currentMessages.length]);

  const handleSend = async () => {
    const text = input.trim();

    if (!text || !selectedPeerId || sending) return;

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();

    const previousMessages = messagesByPeer[selectedPeerId] || [];
    const previousThread = threads.find((item) => item.peerId === selectedPeerId);

    const optimistic = {
      id: tempId,
      peerId: selectedPeerId,
      fromId: myId,
      toId: selectedPeerId,
      text,
      time: now,
      isMine: true,
      status: "sending",
      raw: null,
    };

    try {
      setSending(true);
      setInput("");
      setSendError("");

      setMessagesByPeer((prev) => ({
        ...prev,
        [selectedPeerId]: [...(prev[selectedPeerId] || []), optimistic],
      }));

      setThreads((prev) =>
        prev
          .map((thread) =>
            thread.peerId === selectedPeerId
              ? {
                  ...thread,
                  lastMessage: text,
                  lastAt: now,
                }
              : thread
          )
          .sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0))
      );

      const { response, result } = await fetchWithAuth(
        `${API_BASE_URL}/api/matrimony-actions/messages/${selectedPeerId}`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(result?.message || "Message could not be sent.");
      }

      const savedAction =
        result?.request ||
        result?.action ||
        result?.item ||
        result?.message_item ||
        null;

      const savedMessage = savedAction
        ? buildMessage(savedAction, myId)
        : {
            ...optimistic,
            id: `sent-${Date.now()}`,
            status: "sent",
          };

      setLimitInfo(result?.limit || null);

      setMessagesByPeer((prev) => ({
        ...prev,
        [selectedPeerId]: (prev[selectedPeerId] || []).map((item) =>
          item.id === tempId ? savedMessage : item
        ),
      }));
    } catch (error) {
      setMessagesByPeer((prev) => ({
        ...prev,
        [selectedPeerId]: previousMessages,
      }));

      setThreads((prev) =>
        prev.map((thread) =>
          thread.peerId === selectedPeerId && previousThread
            ? previousThread
            : thread
        )
      );

      setSendError(error?.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <InboxLoading />;
  }

  if (!token || loadError) {
    return (
      <div className="mt-16 flex h-[calc(100dvh-190px)] min-h-[620px] items-center justify-center rounded-[1.5rem] border border-rose-100 bg-rose-50 p-5 sm:mt-20">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
            <FaExclamationCircle />
          </div>

          <h3 className="mt-4 text-base font-semibold text-slate-900">
            Inbox unavailable
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {loadError || "Please login again to use inbox."}
          </p>

          {token ? (
            <button
              type="button"
              onClick={() => loadChat(false)}
              className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              <FaSyncAlt className="text-xs" />
              Try Again
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 h-[calc(100dvh-190px)] min-h-[620px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm sm:mt-20">
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex h-[255px] min-h-0 flex-col border-b border-slate-200 bg-white lg:h-full lg:border-b-0 lg:border-r">
          <div className="shrink-0 border-b border-slate-100 p-3 sm:p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <FaSearch className="text-sm text-slate-400" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search chats"
                className="w-full bg-transparent text-sm font-medium text-slate-700 outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => loadChat(true)}
                disabled={refreshing}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaSyncAlt className="text-xs" />
                )}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {filteredThreads.length > 0 ? (
              <div className="space-y-2">
                {filteredThreads.map((thread) => (
                  <ThreadButton
                    key={thread.peerId}
                    thread={thread}
                    active={selectedPeerId === thread.peerId}
                    onClick={() => {
                      setSelectedPeerId(thread.peerId);
                      setSendError("");
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <FaRegCommentDots />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  No chats found
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Accepted connections will appear here.
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="flex h-full min-h-0 flex-col bg-white">
          {currentThread ? (
            <>
              <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 bg-white p-3 sm:p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar user={currentThread.peer} size="h-11 w-11" />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {currentThread.name}
                      </h3>

                      {currentThread.isVerified ? (
                        <FaCheckCircle className="shrink-0 text-xs text-emerald-500" />
                      ) : null}
                    </div>

                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                      {[
                        currentThread.location,
                        cleanText(currentThread.profession),
                      ]
                        .filter(Boolean)
                        .join(" • ") || "Connected"}
                    </p>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Connected
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbf7f4] px-4 py-5 sm:px-6">
                {currentMessages.length > 0 ? (
                  <div className="space-y-3">
                    {currentMessages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full min-h-[280px] items-center justify-center">
                    <div className="max-w-sm text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                        <FaRegCommentDots />
                      </div>

                      <h3 className="mt-4 text-base font-semibold text-slate-900">
                        No messages yet
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Send your first message to start the chat.
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messageEndRef} />
              </div>

              <div className="shrink-0 border-t border-slate-100 bg-white p-3 sm:p-4">
                {sendError ? (
                  <div className="mb-3 flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                    <FaTimesCircle className="shrink-0" />
                    <span>{sendError}</span>
                  </div>
                ) : null}

                {!membership.can_send_messages ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                        <FaCrown />
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">
                          Messaging is locked
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Your current membership plan does not allow sending
                          messages.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end gap-3">
                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-rose-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-50">
                      <textarea
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        rows={1}
                        maxLength={2000}
                        placeholder="Write a message..."
                        disabled={sending}
                        className="max-h-24 min-h-[28px] w-full resize-none bg-transparent text-sm font-medium leading-6 text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            handleSend();
                          }
                        }}
                      />

                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[11px] font-medium text-slate-400">
                          {input.length}/2000
                        </p>

                        {limitInfo ? (
                          <p className="text-[11px] font-medium text-slate-400">
                            {limitInfo.limit === -1
                              ? "Unlimited"
                              : `${limitInfo.remaining ?? 0} remaining`}
                          </p>
                        ) : (
                          <p className="text-[11px] font-medium text-slate-400">
                            Enter to send
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-5 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? (
                        <FaSpinner className="animate-spin text-xs" />
                      ) : (
                        <FaPaperPlane className="text-xs" />
                      )}

                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center p-8">
              <div className="max-w-md text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
                  <FaRegCommentDots className="text-xl" />
                </div>

                <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-900">
                  Select a chat
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Accepted connections will show on the left side.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Avatar({ user, size = "h-11 w-11" }) {
  const name = getPersonName(user);
  const avatar = getPersonAvatar(user);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 ${size}`}
    >
      <img src={avatar} alt={name} className="h-full w-full object-cover" />
    </div>
  );
}

function ThreadButton({ thread, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[1.25rem] border p-3 text-left transition ${
        active
          ? "border-rose-200 bg-rose-50 shadow-sm"
          : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <Avatar user={thread.peer} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">
              {thread.name}
            </p>

            {thread.isVerified ? (
              <FaCheckCircle className="shrink-0 text-xs text-emerald-500" />
            ) : null}
          </div>

          <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
            {thread.lastMessage}
          </p>
        </div>

        <span className="shrink-0 text-[10px] font-semibold text-slate-400">
          {formatTime(thread.lastAt)}
        </span>
      </div>
    </button>
  );
}

function MessageBubble({ message }) {
  return (
    <div className={`flex ${message.isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
          message.isMine
            ? "rounded-br-md bg-rose-600 text-white"
            : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>

        <div
          className={`mt-2 flex items-center justify-end gap-1 text-[10px] font-medium ${
            message.isMine ? "text-white/75" : "text-slate-400"
          }`}
        >
          <span>{formatTime(message.time)}</span>

          {message.isMine ? (
            <span className="inline-flex items-center gap-0.5">
              <FaCheck className="text-[9px]" />
              {message.status === "sending" ? "Sending" : "Sent"}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InboxLoading() {
  return (
    <div className="mt-16 h-[calc(100dvh-190px)] min-h-[620px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white sm:mt-20">
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex h-[255px] min-h-0 flex-col border-b border-slate-200 p-4 lg:h-full lg:border-b-0 lg:border-r">
          <div className="h-12 shrink-0 animate-pulse rounded-2xl bg-slate-100" />

          <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-[1.25rem] bg-slate-100"
              />
            ))}
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-col">
          <div className="h-20 shrink-0 border-b border-slate-100 p-4">
            <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
          </div>

          <div className="min-h-0 flex-1 bg-[#fbf7f4] p-5">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className={`h-14 w-2/3 animate-pulse rounded-2xl bg-white ${
                    item % 2 === 0 ? "ml-auto" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="h-[92px] shrink-0 border-t border-slate-100 p-4">
            <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}