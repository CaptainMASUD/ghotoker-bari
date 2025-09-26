import React, { useRef, useState, useEffect } from "react";
import {
  FaQuoteLeft,
  FaStar,
  FaMapMarkerAlt,
  FaHeart,
  FaCheckCircle,
} from "react-icons/fa";

/**
 * Premium Success Stories (brand gradient edition)
 * - Bride & groom avatars: gradient ring + overlap
 * - Mobile: snap carousel + dots (no arrows)
 * - Desktop: responsive grid
 * - Glass cards, cohesive brand accents (fuchsia → pink → rose)
 */
export default function SuccessStories() {
  const stories = [
    {
      id: 1,
      names: "Ayesha & Rahim",
      city: "Dhaka, Bangladesh",
      year: "Mar 2025",
      rating: 5,
      quote:
        "We matched in a week and felt instantly aligned. The verified profiles gave us confidence to take the next step.",
      cover:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
      bride_photo: "https://randomuser.me/api/portraits/women/44.jpg",
      groom_photo: "https://randomuser.me/api/portraits/men/46.jpg",
    },
    {
      id: 2,
      names: "Sara & Karim",
      city: "Sylhet, Bangladesh",
      year: "Jan 2025",
      rating: 5,
      quote:
        "Our families connected first, and the concierge team guided us with warmth. Couldn’t be happier!",
      cover:
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
      bride_photo: "https://randomuser.me/api/portraits/women/65.jpg",
      groom_photo: "https://randomuser.me/api/portraits/men/68.jpg",
    },
    {
      id: 3,
      names: "Nusrat & Amin",
      city: "Khulna, Bangladesh",
      year: "Nov 2024",
      rating: 5,
      quote:
        "Thoughtful matches, respectful experience. We loved the focus on privacy and real intentions.",
      cover:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
      bride_photo: "https://randomuser.me/api/portraits/women/31.jpg",
      groom_photo: "https://randomuser.me/api/portraits/men/62.jpg",
    },
    {
      id: 4,
      names: "Farhana & Samin",
      city: "Chattogram, Bangladesh",
      year: "Aug 2024",
      rating: 5,
      quote:
        "From the first conversation, everything just flowed. The premium tools made it simple and safe.",
      cover:
        "https://images.unsplash.com/photo-1544006659-f0b21884ce1d?q=80&w=1200&auto=format&fit=crop",
      bride_photo: "https://randomuser.me/api/portraits/women/12.jpg",
      groom_photo: "https://randomuser.me/api/portraits/men/12.jpg",
    },
  ];

  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => setActive(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const jumpTo = (index) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActive(index);
  };

  return (
    <section
      className="relative py-16 text-white"
      style={{
        background:
          "linear-gradient(180deg, rgba(11,10,18,1) 0%, rgba(11,10,18,0.98) 100%), radial-gradient(60% 40% at 50% 0%, rgba(244,114,182,0.10), transparent 60%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <FaHeart className="text-rose-300" /> Real couples, real stories
          </div>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Success Stories
            </span>
          </h2>
          <p className="mt-2 text-white/70 max-w-2xl mx-auto">
            Premium matchmaking that respects families, privacy, and intent — here’s what our couples say.
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="mt-10 block lg:hidden">
          <div
            ref={trackRef}
            className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <style>{`.snap-x::-webkit-scrollbar{display:none}`}</style>
            {stories.map((s) => (
              <div key={s.id} className="w-full shrink-0 snap-center px-1">
                <StoryCard story={s} />
              </div>
            ))}
          </div>

          {/* dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {stories.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => jumpTo(i)}
                className={`h-2.5 rounded-full transition cursor-pointer ${
                  active === i
                    ? "w-6 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300"
                    : "w-2.5 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="mt-10 hidden lg:grid gap-6 grid-cols-3 xl:grid-cols-4">
          {stories.map((s) => (
            <StoryCard key={s.id} story={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Card ---------- */
function StoryCard({ story }) {
  const stars = Math.round(story.rating);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 h-full hover:border-rose-300/60 hover:shadow-[0_12px_30px_-12px_rgba(244,114,182,0.45)] transition">
      {/* cover */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl">
        <img src={story.cover} alt={story.names} className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      </div>

      {/* couple avatars */}
      <div className="relative -mt-8 mb-2 flex items-center">
        <CoupleAvatars
          brideSrc={story.bride_photo}
          groomSrc={story.groom_photo}
          brideAlt={`${story.names} – bride`}
          groomAlt={`${story.names} – groom`}
        />
        <div className="ml-auto text-right">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/80">
            <FaCheckCircle className="text-emerald-400" /> {story.year}
          </span>
          <div className="mt-1 flex items-center justify-end gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < stars ? "text-rose-300" : "text-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* names + location */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{story.names}</h3>
          <p className="mt-0.5 text-sm text-white/70 flex items-center gap-2">
            <FaMapMarkerAlt className="text-rose-300" /> {story.city}
          </p>
        </div>
      </div>

      {/* quote */}
      <p className="mt-3 text-sm text-white/80 leading-relaxed relative pl-6">
        <FaQuoteLeft className="absolute left-0 top-0 text-rose-300/70" />
        {story.quote}
      </p>

      {/* link */}
      <a
        href="#"
        className="mt-4 inline-flex items-center gap-2 text-rose-300 text-sm hover:underline underline-offset-4"
      >
        View full story <span aria-hidden>↗</span>
      </a>
    </article>
  );
}

/* ---------- Couple Avatars (bride & groom) ---------- */
function CoupleAvatars({ brideSrc, groomSrc, brideAlt, groomAlt }) {
  return (
    <div className="relative h-14">
      {/* groom on left */}
      <div className="absolute left-0 top-0 h-14 w-14">
        <div className="relative h-full w-full">
          {/* gradient ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(#f0abfc 0deg, #f9a8d4 180deg, #fecdd3 360deg)",
            }}
          />
          {/* inner */}
          <div className="absolute inset-[4px] rounded-full overflow-hidden bg-[#0f0e1a] border-2 border-white/10">
            <img src={groomSrc} alt={groomAlt} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      {/* bride on right, overlapping */}
      <div className="absolute left-10 top-0 h-14 w-14">
        <div className="relative h-full w-full">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(#f0abfc 0deg, #f9a8d4 180deg, #fecdd3 360deg)",
            }}
          />
          <div className="absolute inset-[4px] rounded-full overflow-hidden bg-[#0f0e1a] border-2 border-white/10">
            <img src={brideSrc} alt={brideAlt} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
}
