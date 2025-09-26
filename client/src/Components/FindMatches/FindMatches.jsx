import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaHeart,
  FaStar,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaBriefcase,
  FaMale,
  FaFemale,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";

/* -------------------- Demo data (all verified) -------------------- */
const baseProfiles = [
  { id: 1,  first_name: "Ayesha", last_name: "Khan",       age: 27, city: "Dhaka",       profession: "Software Engineer", education: "Masters",   gender: "female", profile_photo: "https://randomuser.me/api/portraits/women/44.jpg", isVerified: true, score: 92 },
  { id: 2,  first_name: "Rahim",  last_name: "Ahmed",      age: 30, city: "Chittagong",  profession: "Business Analyst",  education: "Bachelors", gender: "male",   profile_photo: "https://randomuser.me/api/portraits/men/46.jpg",   isVerified: true, score: 84 },
  { id: 3,  first_name: "Sara",   last_name: "Haque",      age: 25, city: "Dhaka",       profession: "Doctor",            education: "Masters",   gender: "female", profile_photo: "https://randomuser.me/api/portraits/women/65.jpg", isVerified: true, score: 88 },
  { id: 4,  first_name: "Karim",  last_name: "Chowdhury",  age: 28, city: "Sylhet",      profession: "Engineer",          education: "Bachelors", gender: "male",   profile_photo: "https://randomuser.me/api/portraits/men/68.jpg",   isVerified: true, score: 79 },
  { id: 5,  first_name: "Nusrat", last_name: "Jahan",      age: 24, city: "Khulna",      profession: "Teacher",           education: "Masters",   gender: "female", profile_photo: "https://randomuser.me/api/portraits/women/31.jpg", isVerified: true, score: 86 },
  { id: 6,  first_name: "Amin",   last_name: "Rahman",     age: 29, city: "Barishal",    profession: "Engineer",          education: "Bachelors", gender: "male",   profile_photo: "https://randomuser.me/api/portraits/men/62.jpg",   isVerified: true, score: 81 },
];

const cities = ["Dhaka", "Chittagong", "Sylhet", "Khulna", "Barishal"];
const professions = ["Software Engineer", "Doctor", "Engineer", "Business Analyst", "Teacher"];
const educations  = ["Bachelors", "Masters", "HSC", "PhD"];

/* Expand to more demo results so “See more” has something to load */
const profilesData = Array.from({ length: 18 }).map((_, i) => {
  const p = baseProfiles[i % baseProfiles.length];
  return { ...p, id: i + 1, score: Math.min(96, p.score + ((i * 7) % 12)) };
});

/* ------------------------ Small utilities ------------------------ */
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

/* ----------------------- Premium Dropdown ----------------------- */
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

/* ---------------------------- Main ---------------------------- */
export default function FindMatches() {
  const defaults = { city: "", minAge: "", maxAge: "", profession: "", education: "" };

  const [profiles, setProfiles] = useState([]);
  const [filters, setFilters] = useState(defaults);
  const [applied, setApplied] = useState(defaults);
  const [visibleCount, setVisibleCount] = useState(8); // initial cards
  const loadMoreStep = 8;

  useEffect(() => setProfiles(profilesData), []);

  const onSearch = () => {
    setApplied({ ...filters });
    setVisibleCount(8); // reset page when searching
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

  const filtered = useMemo(() => {
    return profiles.filter(
      (p) =>
        (!applied.city || p.city === applied.city) &&
        (!applied.profession || p.profession === applied.profession) &&
        (!applied.education || p.education === applied.education) &&
        (!applied.minAge || p.age >= parseInt(applied.minAge)) &&
        (!applied.maxAge || p.age <= parseInt(applied.maxAge))
    );
  }, [profiles, applied]);

  const visible = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;
  const showClear = hasAnyValue(applied);

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
        {/* subtle brand glow */}
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
            <Dropdown label="City"       options={cities}      selected={filters.city}       onChange={(v) => setFilters({ ...filters, city: v })} />
            <Dropdown label="Profession" options={professions} selected={filters.profession} onChange={(v) => setFilters({ ...filters, profession: v })} />
            <Dropdown label="Education"  options={educations}  selected={filters.education}  onChange={(v) => setFilters({ ...filters, education: v })} />
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
          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {chips.map((c) => (
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
          Matching Profiles <span className="text-white/60">({filtered.length})</span>
        </motion.h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.length === 0 ? (
            <p className="text-center text-white/60 col-span-full">No profiles found. Try adjusting your filters.</p>
          ) : (
            visible.map((profile, idx) => {
              const deg = profile.score * 3.6; // 0-360
              const conic = `conic-gradient(
                  from 0deg,
                  #f0abfc 0deg,
                  #f9a8d4 ${deg / 2}deg,
                  #fecdd3 ${deg}deg,
                  rgba(255,255,255,0.12) ${deg}deg
                )`;
              return (
                <motion.article
                  key={profile.id}
                  {...fadeUp(0.06 + idx * 0.02)}
                  className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur
                             px-6 pt-8 pb-6 hover:border-rose-300/60 hover:shadow-[0_12px_30px_-12px_rgba(244,114,182,0.45)] transition"
                >
                  {/* Avatar with compatibility ring */}
                  <div className="relative w-28 h-28 mx-auto mb-6">
                    {/* conic ring */}
                    <div className="absolute inset-0 rounded-full" style={{ background: conic }} />
                    {/* inner mask */}
                    <div className="absolute inset-[6px] rounded-full overflow-hidden bg-[#0f0e1a] border-2 border-white/10">
                      <img src={profile.profile_photo} alt={profile.first_name} className="w-full h-full object-cover" />
                    </div>
                    {/* score label */}
                    <div className="absolute -top-2 -right-2 text-[11px] bg-white/10 border border-white/15 backdrop-blur px-2 py-0.5 rounded-full">
                      {profile.score}%
                    </div>
                    {/* verified */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaStar /> Verified
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-center">
                    {profile.first_name} {profile.last_name}
                  </h3>

                  {/* Age first */}
                  <p className="text-sm text-white/70 flex items-center gap-2 mt-1 justify-center">
                    {profile.gender === "male" ? <FaMale /> : <FaFemale />} {profile.age} yrs
                  </p>

                  {/* Then the other features, left-aligned */}
                  <div className="mt-4 space-y-2 text-sm text-white/80 text-left">
                    <p className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-rose-300" /> {profile.city}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaBriefcase className="text-rose-300" /> {profile.profession}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaGraduationCap className="text-rose-300" /> {profile.education}
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    className="mt-6 w-full bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 text-neutral-900 font-semibold px-4 py-2 rounded-xl
                               hover:shadow-md shadow-rose-900/20 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FaHeart /> Connect
                  </button>
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
              Showing {visible.length} of {filtered.length}
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
