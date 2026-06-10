import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaQuoteLeft,
  FaStar,
  FaMapMarkerAlt,
  FaHeart,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const staggerWrap = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

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

    const onScroll = () => {
      const nextActive = Math.round(el.scrollLeft / el.clientWidth);
      setActive(nextActive);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const jumpTo = (index) => {
    const el = trackRef.current;
    if (!el) return;

    el.scrollTo({
      left: index * el.clientWidth,
      behavior: "smooth",
    });

    setActive(index);
  };

  const goPrev = () => {
    const next = active === 0 ? stories.length - 1 : active - 1;
    jumpTo(next);
  };

  const goNext = () => {
    const next = active === stories.length - 1 ? 0 : active + 1;
    jumpTo(next);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f3ef] pt-[74px] text-slate-800">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl"
        />

        <motion.div
          animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-0 top-40 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mt-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl md:text-5xl md:leading-[1.08]">
              Success Stories
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              Real stories from couples who found meaningful connections through
              verified profiles, family-friendly communication, and trusted
              matchmaking support.
            </p>
          </motion.div>

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            animate="visible"
            className="mx-auto mt-9 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <StatCard value="2k+" label="Successful connections" />
            <StatCard value="4.9/5" label="Member satisfaction" />
            <StatCard value="100%" label="Verified story reviews" />
          </motion.div>

          <div className="mt-12 block lg:hidden">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="mb-4 flex items-center justify-between"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                Featured couples
              </h2>

              <div className="flex items-center gap-2">
                <motion.button
                  type="button"
                  onClick={goPrev}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
                  aria-label="Previous story"
                >
                  <FaChevronLeft className="text-sm" />
                </motion.button>

                <motion.button
                  type="button"
                  onClick={goNext}
                  whileHover={{ y: -2, scale: 1.04 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-4 focus:ring-rose-100"
                  aria-label="Next story"
                >
                  <FaChevronRight className="text-sm" />
                </motion.button>
              </div>
            </motion.div>

            <div
              ref={trackRef}
              className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.snap-x::-webkit-scrollbar{display:none}`}</style>

              {stories.map((story) => (
                <div key={story.id} className="w-full shrink-0 snap-center px-1">
                  <StoryCard story={story} />
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-center gap-2">
              {stories.map((_, index) => (
                <motion.button
                  key={index}
                  type="button"
                  aria-label={`Go to story ${index + 1}`}
                  onClick={() => jumpTo(index)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className={`h-2.5 cursor-pointer rounded-full transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-rose-100 ${
                    active === index
                      ? "w-7 bg-rose-600"
                      : "w-2.5 bg-slate-300 hover:bg-rose-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-12 hidden gap-6 lg:grid lg:grid-cols-3 xl:grid-cols-4"
          >
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-14 overflow-hidden rounded-[28px] border border-rose-100 bg-white p-7 text-center shadow-xl shadow-rose-100/50 md:p-9"
          >
            <motion.div
              whileHover={{ rotate: -6, scale: 1.06 }}
              className="mx-auto flex h-14 w-14 cursor-default items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm"
            >
              <FaHeart className="text-lg" />
            </motion.div>

            <h3 className="mt-4 text-xl font-semibold text-slate-900 sm:text-2xl">
              Ready to create your own story?
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Create your profile, verify your details, and start exploring
              trusted matches with a safer and cleaner matchmaking experience.
            </p>

            <motion.a
              href="/register"
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 inline-flex h-12 cursor-pointer items-center justify-center rounded-xl bg-rose-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-100"
            >
              Join Now
            </motion.a>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

function StoryCard({ story }) {
  const stars = Math.round(story.rating);

  return (
    <motion.article
      variants={cardMotion}
      whileHover={{ y: -6, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="group h-full cursor-default overflow-hidden rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:border-rose-100 hover:shadow-xl hover:shadow-rose-100/60"
    >
      <div className="relative h-44 w-full overflow-hidden rounded-[20px] bg-slate-100">
        <motion.img
          src={story.cover}
          alt={story.names}
          className="h-full w-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.06 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-slate-950/10 to-transparent" />

        <motion.div
          whileHover={{ scale: 1.03 }}
          className="absolute left-3 top-3 inline-flex cursor-default items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-rose-700 shadow-sm backdrop-blur"
        >
          <FaCheckCircle className="text-emerald-500" />
          {story.year}
        </motion.div>
      </div>

      <div className="relative -mt-8 flex items-end justify-between px-1">
        <CoupleAvatars
          brideSrc={story.bride_photo}
          groomSrc={story.groom_photo}
          brideAlt={`${story.names} bride`}
          groomAlt={`${story.names} groom`}
        />

        <motion.div
          whileHover={{ y: -2, scale: 1.03 }}
          className="mb-1 cursor-default rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-slate-100"
        >
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
              >
                <FaStar
                  className={`h-3.5 w-3.5 ${
                    index < stars ? "text-rose-500" : "text-slate-200"
                  }`}
                />
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="mt-4 px-1">
        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
          {story.names}
        </h3>

        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <FaMapMarkerAlt className="shrink-0 text-rose-500" />
          {story.city}
        </p>

        <motion.div
          whileHover={{ y: -2 }}
          className="mt-4 rounded-2xl bg-[#fbf7f4] p-4"
        >
          <p className="relative pl-6 text-sm leading-6 text-slate-600">
            <FaQuoteLeft className="absolute left-0 top-1 text-rose-400" />
            {story.quote}
          </p>
        </motion.div>

        <motion.a
          href="#"
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-rose-600 transition hover:text-rose-700 hover:underline focus:outline-none"
        >
          View full story
          <span aria-hidden>↗</span>
        </motion.a>
      </div>
    </motion.article>
  );
}

function CoupleAvatars({ brideSrc, groomSrc, brideAlt, groomAlt }) {
  return (
    <div className="relative h-16 w-28 cursor-default">
      <motion.div
        whileHover={{ y: -3, scale: 1.04 }}
        className="absolute left-0 top-0 h-16 w-16 rounded-full bg-white p-1 shadow-sm ring-1 ring-rose-100"
      >
        <img
          src={groomSrc}
          alt={groomAlt}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
        />
      </motion.div>

      <motion.div
        whileHover={{ y: -3, scale: 1.04 }}
        className="absolute left-11 top-0 h-16 w-16 rounded-full bg-white p-1 shadow-sm ring-1 ring-rose-100"
      >
        <img
          src={brideSrc}
          alt={brideAlt}
          className="h-full w-full rounded-full object-cover"
          loading="lazy"
        />
      </motion.div>
    </div>
  );
}

function StatCard({ value, label }) {
  return (
    <motion.div
      variants={cardMotion}
      whileHover={{ y: -5, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="cursor-default rounded-[22px] border border-slate-100 bg-white p-5 text-center shadow-sm transition-shadow hover:border-rose-100 hover:shadow-lg hover:shadow-rose-100/50"
    >
      <div className="text-2xl font-semibold text-rose-600">{value}</div>
      <p className="mt-1 text-sm font-normal text-slate-500">{label}</p>
    </motion.div>
  );
}