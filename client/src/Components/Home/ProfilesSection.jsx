import React from "react";
import { motion } from "framer-motion";
import { Crown, CheckCircle2, Briefcase, MapPin } from "lucide-react";

const sampleProfiles = [
  {
    id: 1,
    name: "Ayesha Rahman",
    age: 26,
    profession: "Software Engineer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=900",
    location: "Dhaka, Bangladesh",
    verified: true,
    premium: true,
  },
  {
    id: 2,
    name: "Imran Hossain",
    age: 29,
    profession: "Physician",
    image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=900",
    location: "Chattogram, Bangladesh",
    verified: true,
    premium: false,
  },
  {
    id: 3,
    name: "Mitu Akter",
    age: 25,
    profession: "Lecturer",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900",
    location: "Sylhet, Bangladesh",
    verified: true,
    premium: true,
  },
  {
    id: 4,
    name: "Arman Ali",
    age: 30,
    profession: "Civil Engineer",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900",
    location: "Rajshahi, Bangladesh",
    verified: true,
    premium: false,
  },
];

/**
 * Premium UI/UX goals
 * - Elegant gradient brand (from-fuchsia-300 via-pink-300 to-rose-300)
 * - Accessible focus states, large tap targets
 * - Subtle micro-interactions: lift, glow, image zoom
 * - Clear primary/secondary CTAs
 */

export default function ProfilesSection({
  profiles = sampleProfiles,
  title = "Featured Premium Profiles",
}) {
  return (
    <section id="featured" className="max-w-7xl mx-auto px-4 py-14 text-white">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
        {title}
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {profiles.map((p, idx) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: idx * 0.05 }}
            className="group"
            aria-label={`${p.name}, ${p.age}`}
          >
            {/* Gradient ring card */}
            <div className="h-full rounded-2xl p-[1px] bg-gradient-to-br from-fuchsia-300/40 via-pink-300/40 to-rose-300/40">
              <div className="h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 overflow-hidden">
                {/* Media */}
                <div className="relative">
                  <img
                    src={p.image}
                    alt={`${p.name}'s profile photo`}
                    className="h-56 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    {p.premium && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
                                   text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 shadow-sm"
                        title="Premium member"
                      >
                        <Crown className="w-3.5 h-3.5" /> Premium
                      </span>
                    )}
                    {p.verified && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
                                   text-emerald-900 bg-emerald-300/90 backdrop-blur shadow-sm"
                        title="Verified profile"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold leading-snug">
                    {p.name}, {p.age}
                  </h3>

                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-2 text-white/80">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-sm">{p.profession}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/80">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{p.location}</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="pt-4 grid grid-cols-2 gap-2">
                    {/* Primary */}
                    <button
                      type="button"
                      className="w-full relative overflow-hidden rounded-xl px-3.5 py-2 text-sm font-semibold text-neutral-900
                                 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 shadow-lg shadow-rose-900/20
                                 transition-all duration-300 hover:shadow-xl hover:translate-y-[-1px]
                                 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/60 cursor-pointer"
                      aria-label={`View ${p.name}'s profile`}
                    >
                      <span className="relative z-10">View Profile</span>
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-white"
                        style={{ maskImage: "linear-gradient(120deg, transparent 40%, black 50%, transparent 60%)" }}
                      />
                    </button>

                    {/* Secondary */}
                    <button
                      type="button"
                      className="w-full rounded-xl px-3.5 py-2 text-sm font-semibold text-white/90
                                 bg-white/10 border border-white/15 backdrop-blur
                                 transition-all duration-300 hover:bg-white/15 hover:border-white/25
                                 focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
                      aria-label={`Connect with ${p.name}`}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Subtle helper text for UX clarity */}
      <p className="mt-6 text-center text-xs text-white/60">
        Tip: Premium members are prioritized in search and can send direct connection requests.
      </p>
    </section>
  );
}
