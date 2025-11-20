// FindMatches.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaHeart, FaStar, FaMapMarkerAlt, FaGraduationCap, FaBriefcase,
  FaMale, FaFemale, FaChevronDown, FaTimes, FaLock, FaEnvelope
} from "react-icons/fa";
import { motion } from "framer-motion";

/* ------------------------ Config ------------------------ */
const API = "https://ghotoker-bari-api.vercel.app";

/* ------------------------ UI helpers ------------------------ */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, delay } },
});

const hasAnyValue = (obj) =>
  Object.values(obj).some((v) => v !== "" && v !== null && v !== undefined);

function useOutsideClose(ref, onClose) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

/* ----------------------- Reusable Dropdown ----------------------- */
function Dropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  useOutsideClose(boxRef, () => setOpen(false));

  return (
    <div className="relative w-full md:w-48" ref={boxRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full px-4 py-3 rounded-xl border border-white/15 bg-white/10 text-white
                   flex justify-between items-center backdrop-blur focus:outline-none
                   focus:ring-2 focus:ring-rose-300/70 cursor-pointer"
        aria-haspopup="listbox" aria-expanded={open}
      >
        <span className="truncate">{selected || label}</span>
        <FaChevronDown />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute w-full mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/15
                     bg-neutral-900/95 text-white z-50 backdrop-blur"
        >
          {options.map((opt) => (
            <li
              key={opt}
              role="option"
              aria-selected={opt === selected}
              className={`px-4 py-2 cursor-pointer text-sm transition
                          ${opt === selected
                            ? "bg-rose-300 text-neutral-900"
                            : "hover:bg-white/10 hover:text-white"}`}
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ----------------------- Profile Modal (uses /api/user/:id/profile) ----------------------- */
function ProfileDetailsModal({ open, onClose, userId, canViewFull }) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useOutsideClose(ref, onClose);

  useEffect(() => {
    if (!open || !userId) return;
    (async () => {
      try {
        setLoading(true);
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        const res = await fetch(`${API}/api/user/${userId}/profile`, { headers });
        const data = await res.json();
        setProfile(data);
      } catch (e) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, userId, token]);

  if (!open) return null;

  const name = profile
    ? (profile.full_name ||
       `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
       profile.username ||
       "User")
    : "Profile";

  const avatar = profile?.profile_photos?.[0] || "/placeholder.svg";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4">
      <div
        ref={ref}
        className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Profile details</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10">
            <FaTimes className="text-white" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="md:col-span-3 text-white/80">Loading…</div>
          ) : profile ? (
            <>
              <div className="md:col-span-1">
                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  <img src={avatar} alt={name} className="w-full h-64 object-cover" />
                  {!canViewFull && (
                    <div className="absolute inset-0 grid place-items-center bg-black/55">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className="p-3 rounded-full bg-white/10 border border-white/15">
                          <FaLock className="text-white text-lg" />
                        </div>
                        <p className="text-white text-sm">Upgrade membership to unlock full profile</p>
                      </div>
                    </div>
                  )}
                </div>
                <h4 className="mt-4 text-xl font-semibold">{name}</h4>
                <p className="text-white/70">{profile.profession || "—"}</p>
                {profile.isVerified && (
                  <span className="mt-2 inline-flex items-center gap-2 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full border border-emerald-400/30">
                    <FaStar /> Verified
                  </span>
                )}
              </div>

              <div className="md:col-span-2">
                {canViewFull ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      ["Email", profile.email_address],
                      ["Phone", profile.phone_number],
                      ["Gender", profile.gender],
                      ["Age", profile.age ?? (profile.dob ? Math.floor((Date.now() - new Date(profile.dob)) / (365.25*24*3600*1000)) : "—")],
                      ["City", profile.current_city],
                      ["Profession", profile.profession],
                      ["Education", profile.highest_education],
                      ["Religion", profile.religion],
                      ["Marital status", profile.marital_status],
                      ["Height", profile.height],
                      ["Mother tongue", profile.mother_tongue],
                      ["Preferred location", profile.preferred_location],
                      ["Annual income", profile.annual_income],
                      ["About", profile.about_me],
                      ["Looking for", profile.looking_for],
                    ]
                      .filter(([, v]) => v !== undefined && v !== null && v !== "")
                      .map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-wider text-white/60">{label}</p>
                          <p className="mt-1 text-white break-words">{String(value)}</p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/80">
                    You’re on a free plan. Upgrade to view all details.
                  </div>
                )}

                <div className="mt-6 flex items-center gap-3">
                  <button
                    disabled={!canViewFull}
                    className={`px-5 py-2 rounded-xl inline-flex items-center gap-2 font-semibold ${
                      canViewFull
                        ? "bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 text-neutral-900"
                        : "bg-white/10 text-white/60 cursor-not-allowed border border-white/15"
                    }`}
                    title={canViewFull ? "Send a message" : "Upgrade to message"}
                  >
                    <FaEnvelope /> Message
                  </button>
                  <button onClick={onClose} className="px-5 py-2 rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/15">
                    Close
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="md:col-span-3 text-white/80">Profile not found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- Find Matches ---------------------------- */
export default function FindMatches() {
  const defaults = { city: "", minAge: "", maxAge: "", profession: "", education: "" };

  const [filters, setFilters] = useState(defaults);
  const [applied, setApplied] = useState(defaults);

  // data from /api/user/browse
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // me (to gate)
  const [canViewFull, setCanViewFull] = useState(false);

  // ui state
  const [visibleCount, setVisibleCount] = useState(8);
  const loadMoreStep = 8;
  const [loading, setLoading] = useState(true);

  // modal
  const [openUserId, setOpenUserId] = useState(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // fetch /me to determine gating
  const fetchMe = async () => {
    try {
      const headers = { ...(token && { Authorization: `Bearer ${token}` }) };
      const res = await fetch(`${API}/api/user/me`, { headers });
      if (!res.ok) throw new Error("me failed");
      const data = await res.json();

      const m = data?.user?.membership_status;
      const active = m?.active === true;
      const allowed = active && m?.can_view_full_profiles === true;
      setCanViewFull(Boolean(allowed));
    } catch {
      // if /me fails or unauthenticated → treat as free
      setCanViewFull(false);
    }
  };

  // fetch list from /browse with current applied filters
  const fetchBrowse = async () => {
    const params = new URLSearchParams();
    if (applied.city) params.set("city", applied.city);
    if (applied.profession) params.set("profession", applied.profession);
    if (applied.education) params.set("education", applied.education);
    if (applied.minAge) params.set("minAge", applied.minAge);
    if (applied.maxAge) params.set("maxAge", applied.maxAge);
    params.set("limit", "60");
    params.set("page", "1");

    const url = `${API}/api/user/browse?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();

    const items = Array.isArray(data?.items) ? data.items : [];
    setRows(items);
    setTotal(Number(data?.total || items.length || 0));
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchMe(), fetchBrowse()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied]); // refetch when filters applied

  const onSearch = () => {
    setApplied({ ...filters });
    setVisibleCount(8);
  };

  const onClearAll = () => {
    setFilters(defaults);
    setApplied(defaults);
    setVisibleCount(8);
  };

  const clearOne = (key) => {
    const next = { ...applied, [key]: "" };
    setApplied(next);
    setFilters((f) => ({ ...f, [key]: "" }));
  };

  const chips = useMemo(() => {
    const list = [];
    if (applied.city)       list.push({ key: "city", label: applied.city });
    if (applied.profession) list.push({ key: "profession", label: applied.profession });
    if (applied.education)  list.push({ key: "education", label: applied.education });
    if (applied.minAge)     list.push({ key: "minAge", label: `Min ${applied.minAge}` });
    if (applied.maxAge)     list.push({ key: "maxAge", label: `Max ${applied.maxAge}` });
    return list;
  }, [applied]);

  const visible = rows.slice(0, visibleCount);
  const canLoadMore = visibleCount < rows.length;
  const showClear = hasAnyValue(applied);

  const renderLockedOverlay = () => (
    <div className="absolute inset-0 grid place-items-center bg-black/55">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="p-3 rounded-full bg-white/10 border border-white/15">
          <FaLock className="text-white text-lg" />
        </div>
        <p className="text-white text-sm">Upgrade membership to unlock photos & details</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0b0a12] text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0a12] text-white">
      {/* Hero + Filter Bar */}
      <section
        className="relative py-20"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(20,14,40,0.65), rgba(12,10,24,0.9)), url('https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(244,114,182,0.10),transparent_60%)]" />
        <motion.div className="relative z-10 max-w-7xl mx-auto px-6 text-center" {...fadeUp(0)}>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Find Your{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Perfect Match
            </span>
          </h1>
          <p className="mb-10 text-white/80 max-w-2xl mx-auto">
            Search verified profiles with premium filters and elegant cards.
          </p>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center flex-wrap bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur">
            <Dropdown label="City"       options={["Dhaka","Chittagong","Sylhet","Khulna","Barishal"]} selected={filters.city}       onChange={(v) => setFilters({ ...filters, city: v })} />
            <Dropdown label="Profession" options={["Software Engineer", "Doctor", "Engineer", "Business Analyst", "Teacher"]} selected={filters.profession} onChange={(v) => setFilters({ ...filters, profession: v })} />
            <Dropdown label="Education"  options={["Bachelors","Masters","HSC","PhD"]} selected={filters.education}  onChange={(v) => setFilters({ ...filters, education: v })} />
            <input
              type="number" placeholder="Min Age"
              className="px-4 py-3 rounded-xl w-full md:w-36 border border-white/15 bg-white/10 text-white
                         placeholder-white/60 focus:ring-2 focus:ring-rose-300/70 focus:outline-none backdrop-blur"
              value={filters.minAge}
              onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
            />
            <input
              type="number" placeholder="Max Age"
              className="px-4 py-3 rounded-xl w-full md:w-36 border border-white/15 bg-white/10 text-white
                         placeholder-white/60 focus:ring-2 focus:ring-rose-300/70 focus:outline-none backdrop-blur"
              value={filters.maxAge}
              onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
            />
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={onSearch}
                className="flex-1 md:flex-none bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 text-neutral-900 font-semibold px-6 py-3 rounded-xl
                           hover:shadow-lg shadow-rose-900/20 transition cursor-pointer"
              >
                Search
              </button>
              {showClear && (
                <button
                  onClick={onClearAll}
                  className="flex-1 md:flex-none border border-white/15 bg-white/10 text-white px-6 py-3 rounded-xl
                             hover:bg-white/15 transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Chips */}
          {hasAnyValue(applied) && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                applied.city && { key: "city", label: applied.city },
                applied.profession && { key: "profession", label: applied.profession },
                applied.education && { key: "education", label: applied.education },
                applied.minAge && { key: "minAge", label: `Min ${applied.minAge}` },
                applied.maxAge && { key: "maxAge", label: `Max ${applied.maxAge}` },
              ].filter(Boolean).map((c) => (
                <span key={c.key} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm">
                  {c.label}
                  <button
                    className="rounded-full bg-white/10 hover:bg-white/20 p-1 cursor-pointer"
                    onClick={() => clearOne(c.key)}
                    aria-label={`Remove ${c.label}`}
                  >
                    <FaTimes />
                  </button>
                </span>
              ))}
              <button onClick={onClearAll} className="ml-2 text-sm text-white/70 underline underline-offset-4 hover:text-white">
                Clear all
              </button>
            </div>
          )}
        </motion.div>
      </section>

      {/* Profiles */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <motion.h2 className="text-3xl md:text-4xl font-extrabold mb-10 text-center" {...fadeUp(0.05)}>
          Matching Profiles <span className="text-white/60">({total})</span>
        </motion.h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.length === 0 ? (
            <p className="text-center text-white/60 col-span-full">No profiles found. Try adjusting your filters.</p>
          ) : (
            visible.map((u, idx) => {
              const name = (u.full_name || `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.username || "User");
              const avatar = Array.isArray(u.profile_photos) && u.profile_photos.length ? u.profile_photos[0] : "/placeholder.svg";
              const score = typeof u.score === "number" ? u.score : 80;
              const deg = score * 3.6;
              const conic = `conic-gradient(
                  from 0deg,
                  #f0abfc 0deg,
                  #f9a8d4 ${deg / 2}deg,
                  #fecdd3 ${deg}deg,
                  rgba(255,255,255,0.12) ${deg}deg
                )`;

              return (
                <motion.article
                  key={u._id || idx}
                  {...fadeUp(0.06 + idx * 0.02)}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur
                             px-6 pt-8 pb-6 hover:border-rose-300/60 hover:shadow-[0_12px_30px_-12px_rgba(244,114,182,0.45)] transition relative"
                >
                  {/* Avatar with compatibility ring */}
                  <div className="relative w-28 h-28 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full" style={{ background: conic }} />
                    <div className="absolute inset-[6px] rounded-full overflow-hidden bg-[#0f0e1a] border-2 border-white/10">
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                      {!canViewFull && (
                        <div className="absolute inset-0 grid place-items-center bg-black/55">
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className="p-3 rounded-full bg-white/10 border border-white/15">
                              <FaLock className="text-white text-lg" />
                            </div>
                            <p className="text-white text-xs">Upgrade to unlock photos</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute -top-2 -right-2 text-[11px] bg-white/10 border border-white/15 backdrop-blur px-2 py-0.5 rounded-full">
                      {score}%
                    </div>
                    {u.isVerified && (
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                        <FaStar /> Verified
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-center">{name}</h3>

                  {/* Age */}
                  <p className="text-sm text-white/70 flex items-center gap-2 mt-1 justify-center">
                    {(u.gender ?? "").toLowerCase() === "male" ? <FaMale /> : <FaFemale />} {u.age ?? "—"} yrs
                  </p>

                  {/* Basics */}
                  <div className="mt-4 space-y-2 text-sm text-white/80 text-left relative">
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-rose-300" /> {u.current_city ?? "—"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaBriefcase className="text-rose-300" /> {u.profession ?? "—"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaGraduationCap className="text-rose-300" /> {u.highest_education ?? "—"}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setOpenUserId(u._id)}
                      className={`w-full font-semibold px-4 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-2
                        ${canViewFull
                          ? "bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 text-neutral-900 hover:shadow-md shadow-rose-900/20"
                          : "bg-white/10 text-white/90 border border-white/15"}`}
                      title={canViewFull ? "View full profile" : "View limited profile"}
                    >
                      <FaHeart /> View
                    </button>

                    <button
                      onClick={() => setOpenUserId(u._id)}
                      className={`w-full font-semibold px-4 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-2
                        ${canViewFull
                          ? "border border-white/15 bg-white/10 hover:bg-white/15"
                          : "bg-white/10 text-white/70 border border-white/15"}`}
                      title={canViewFull ? "Message" : "Upgrade to message"}
                    >
                      <FaEnvelope /> Message
                    </button>
                  </div>
                </motion.article>
              );
            })
          )}
        </div>

        {/* See more */}
        {canLoadMore && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <button
              onClick={() => setVisibleCount((c) => c + loadMoreStep)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 text-neutral-900 font-semibold
                         hover:shadow-md shadow-rose-900/20 transition cursor-pointer"
            >
              See more
            </button>
            <span className="text-sm text-white/60">
              Showing {visible.length} of {rows.length} (Total {total})
            </span>
          </div>
        )}
      </section>

      {/* Full profile modal (uses /api/user/:id/profile; gated by /me) */}
      <ProfileDetailsModal
        open={!!openUserId}
        onClose={() => setOpenUserId(null)}
        userId={openUserId}
        canViewFull={canViewFull}
      />
    </div>
  );
}
