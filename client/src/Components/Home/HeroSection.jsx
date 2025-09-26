import React from "react";
import { motion } from "framer-motion";
import { Search, Users, MapPin } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen">
      {/* Background image fills entire section */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/26056318/pexels-photo-26056318.jpeg"
          alt="hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-700/30 via-black/60 to-black" />
      </div>

      {/* Foreground content */}
      <div className="relative max-w-7xl mx-auto px-4 pt-20 pb-16 text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-6xl font-bold leading-tight"
        >
          Where Authentic Profiles
          <span className="block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
            Meet Serious Intentions
          </span>
        </motion.h1>

        <p className="mt-5 max-w-2xl text-white/80">
          Bangladesh’s premium matrimony experience with verified profiles, discreet privacy,
          and smart matching—designed for families and individuals who value trust.
        </p>

        {/* Glass Search */}
        <motion.div
          id="search"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4"
        >
          <div className="grid md:grid-cols-4 gap-3">
            {/* Name / Keyword */}
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:ring-2 focus-within:ring-white/20">
              <Search className="h-5 w-5 text-white/60" />
              <input
                type="text"
                placeholder="Name or Keyword"
                className="w-full bg-transparent outline-none placeholder:text-white/40"
                aria-label="Name or Keyword"
              />
            </label>

            {/* Bride / Groom */}
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:ring-2 focus-within:ring-white/20">
              <Users className="h-5 w-5 text-white/60" />
              <select
                className="w-full bg-transparent outline-none text-white/90"
                aria-label="Looking for"
                defaultValue="Bride"
              >
                <option className="bg-neutral-900" value="Bride">Bride</option>
                <option className="bg-neutral-900" value="Groom">Groom</option>
              </select>
            </label>

            {/* Location */}
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:ring-2 focus-within:ring-white/20">
              <MapPin className="h-5 w-5 text-white/60" />
              <input
                type="text"
                placeholder="City / District"
                className="w-full bg-transparent outline-none placeholder:text-white/40"
                aria-label="City or District"
              />
            </label>

            {/* Premium gradient button (same size) */}
            <button
              type="button"
              className="w-full relative overflow-hidden rounded-xl px-4 py-2 font-semibold text-neutral-900
                         bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                         shadow-lg shadow-rose-900/20
                         transition-all duration-300
                         hover:shadow-xl hover:scale-[1.01]
                         focus:outline-none focus:ring-2 focus:ring-fuchsia-300/60
                         cursor-pointer"
              aria-label="Search"
            >
              <span className="relative z-10">Search</span>
              {/* subtle glossy sheen */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-10 transition-opacity bg-white"
                style={{ maskImage: "linear-gradient(120deg, transparent 40%, black 50%, transparent 60%)" }}
              />
            </button>
          </div>

          <div className="mt-2 text-xs text-white/50">
            Advanced filters: Education, Profession, Community, Height, Lifestyle
          </div>
        </motion.div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { k: "85K+", l: "Verified Profiles" },
            { k: "9.6/10", l: "Match Satisfaction" },
            { k: "24/7", l: "Human Support" },
            { k: "Top 1%", l: "Safety & Privacy" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl border border-white/10 bg-white/5 p-4 text-center"
            >
              <div className="text-2xl font-bold">{s.k}</div>
              <div className="text-white/60 text-sm">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
