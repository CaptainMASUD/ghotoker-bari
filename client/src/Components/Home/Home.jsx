import React, { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Button, Badge, Tooltip, Carousel } from "flowbite-react"
import {
  Search,
  Users,
  MapPin,
  ShieldCheck,
  Heart,
  Mail,
  Phone,
  Crown,
  CheckCircle2,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  Zap,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  MessageSquare,
  Award,
  Shield,
  TrendingUp,
  PhoneCall,
  CalendarCheck2,
} from "lucide-react"

export default function HomePage() {
  const [billing, setBilling] = useState("monthly")
  const isYearly = billing === "yearly"

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  }

  const viewportCfg = { once: true, amount: 0.2 }

  const sampleProfiles = [
    {
      id: 1,
      name: "Ayesha Rahman",
      age: 26,
      profession: "Software Engineer",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=900",
      location: "Dhaka, Bangladesh",
      verified: true,
      premium: true,
    },
    {
      id: 2,
      name: "Imran Hossain",
      age: 29,
      profession: "Physician",
      image:
        "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=900",
      location: "Chattogram, Bangladesh",
      verified: true,
      premium: false,
    },
    {
      id: 3,
      name: "Mitu Akter",
      age: 25,
      profession: "Lecturer",
      image:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900",
      location: "Sylhet, Bangladesh",
      verified: true,
      premium: true,
    },
    {
      id: 4,
      name: "Arman Ali",
      age: 30,
      profession: "Civil Engineer",
      image:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900",
      location: "Rajshahi, Bangladesh",
      verified: true,
      premium: false,
    },
  ]

  const stories = [
    {
      couple: "Tanjila & Farhan",
      text: "We matched on day 3 and met our families within a month. The verification-first approach gave us total peace of mind.",
      img: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1600",
    },
    {
      couple: "Sadia & Nayeem",
      text: "Crystal-clear filters and genuine profiles—exactly what we needed. We tied the knot in six months!",
      img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600",
    },
    {
      couple: "Mehedi & Jannat",
      text: "The premium spotlight made discovery effortless. Loved the privacy controls throughout.",
      img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600",
    },
  ]

  const formatBDT = (n) => `৳${Number(n).toLocaleString()}`

  const roundHundreds = (n) => Math.round(n / 100) * 100

  const prices = useMemo(() => {
    const premiumMonthly = 1990
    const eliteMonthly = 7900
    const premiumYearly = roundHundreds(premiumMonthly * 12 * 0.8)
    const eliteYearly = roundHundreds(eliteMonthly * 12 * 0.8)

    return {
      free: { monthly: 0, yearly: 0 },
      premium: { monthly: premiumMonthly, yearly: premiumYearly },
      elite: { monthly: eliteMonthly, yearly: eliteYearly },
    }
  }, [])

  const LeftIcon = <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
  const RightIcon = <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/26056318/pexels-photo-26056318.jpeg"
            alt="Wedding hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-700/30 via-black/60 to-black" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 text-white">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-bold leading-tight md:text-6xl"
          >
            Where Authentic Profiles
            <span className="block bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Meet Serious Intentions
            </span>
          </motion.h1>

          <p className="mt-5 max-w-2xl text-white/80">
            Bangladesh’s premium matrimony experience with verified profiles,
            discreet privacy, and smart matching—designed for families and
            individuals who value trust.
          </p>

          <motion.div
            id="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
          >
            <div className="grid gap-3 md:grid-cols-4">
              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:ring-2 focus-within:ring-white/20">
                <Search className="h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder="Name or Keyword"
                  className="w-full bg-transparent outline-none placeholder:text-white/40"
                  aria-label="Name or Keyword"
                />
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:ring-2 focus-within:ring-white/20">
                <Users className="h-5 w-5 text-white/60" />
                <select
                  className="w-full bg-transparent text-white/90 outline-none"
                  aria-label="Looking for"
                  defaultValue="Bride"
                >
                  <option className="bg-neutral-900" value="Bride">
                    Bride
                  </option>
                  <option className="bg-neutral-900" value="Groom">
                    Groom
                  </option>
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 focus-within:ring-2 focus-within:ring-white/20">
                <MapPin className="h-5 w-5 text-white/60" />
                <input
                  type="text"
                  placeholder="City / District"
                  className="w-full bg-transparent outline-none placeholder:text-white/40"
                  aria-label="City or District"
                />
              </label>

              <button
                type="button"
                className="relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 px-4 py-2 font-semibold text-neutral-900 shadow-lg shadow-rose-900/20 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-300/60"
                aria-label="Search"
              >
                <span className="relative z-10">Search</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-white opacity-0 transition-opacity hover:opacity-10"
                  style={{
                    maskImage:
                      "linear-gradient(120deg, transparent 40%, black 50%, transparent 60%)",
                  }}
                />
              </button>
            </div>

            <div className="mt-2 text-xs text-white/50">
              Advanced filters: Education, Profession, Community, Height,
              Lifestyle
            </div>
          </motion.div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
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
                <div className="text-sm text-white/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section
        id="featured"
        className="mx-auto max-w-7xl px-4 py-14 text-white"
      >
        <h2 className="mb-8 text-center text-2xl font-bold md:text-3xl">
          Featured Premium Profiles
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sampleProfiles.map((p, idx) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.05 }}
              className="group"
              aria-label={`${p.name}, ${p.age}`}
            >
              <div className="h-full rounded-2xl bg-gradient-to-br from-fuchsia-300/40 via-pink-300/40 to-rose-300/40 p-[1px]">
                <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
                  <div className="relative">
                    <img
                      src={p.image}
                      alt={`${p.name}'s profile photo`}
                      className="h-56 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />

                    <div className="absolute left-3 top-3 flex items-center gap-2">
                      {p.premium && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 px-2.5 py-1 text-xs font-medium text-neutral-900 shadow-sm">
                          <Crown className="h-3.5 w-3.5" /> Premium
                        </span>
                      )}

                      {p.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-300/90 px-2.5 py-1 text-xs font-medium text-emerald-900 shadow-sm backdrop-blur">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold leading-snug">
                      {p.name}, {p.age}
                    </h3>

                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center gap-2 text-white/80">
                        <Briefcase className="h-4 w-4" />
                        <span className="text-sm">{p.profession}</span>
                      </div>

                      <div className="flex items-center gap-2 text-white/80">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{p.location}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-4">
                      <button
                        type="button"
                        className="relative w-full cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 px-3.5 py-2 text-sm font-semibold text-neutral-900 shadow-lg shadow-rose-900/20 transition-all duration-300 hover:translate-y-[-1px] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-fuchsia-300/60"
                        aria-label={`View ${p.name}'s profile`}
                      >
                        <span className="relative z-10">View Profile</span>
                      </button>

                      <button
                        type="button"
                        className="w-full cursor-pointer rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-sm font-semibold text-white/90 backdrop-blur transition-all duration-300 hover:border-white/25 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
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

        <p className="mt-6 text-center text-xs text-white/60">
          Tip: Premium members are prioritized in search and can send direct
          connection requests.
        </p>
      </section>

      {/* Trust & Safety */}
      <section className="py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            <h4 className="mt-3 font-semibold">ID & Photo Verification</h4>
            <p className="mt-1 text-sm text-white/70">
              Multi-step checks to ensure authenticity and reduce spam.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Heart className="h-8 w-8 text-rose-400" />
            <h4 className="mt-3 font-semibold">Privacy-First Controls</h4>
            <p className="mt-1 text-sm text-white/70">
              Blur photos, limit profile viewers, and control who messages you.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Users className="h-8 w-8 text-sky-400" />
            <h4 className="mt-3 font-semibold">Human Support, 24/7</h4>
            <p className="mt-1 text-sm text-white/70">
              Real people to help with reporting, safety, and onboarding.
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section
        id="stories"
        className="mx-auto max-w-7xl px-4 py-14 text-white"
        aria-labelledby="stories-heading"
      >
        <h2
          id="stories-heading"
          className="mb-6 text-center text-2xl font-bold text-white md:text-3xl"
        >
          <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
            S
          </span>
          <span>uccess </span>
          <span>St</span>
          <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
            o
          </span>
          <span>ries</span>
        </h2>

        <div className="rounded-3xl bg-gradient-to-r from-fuchsia-300/50 via-pink-300/50 to-rose-300/50 p-[1px]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
            <Carousel
              className="h-[320px] overflow-hidden md:h-[360px]
              [&>div>button]:cursor-pointer
              [&>div>button]:border
              [&>div>button]:border-white/15
              [&>div>button]:bg-white/10
              [&>div>button]:backdrop-blur
              [&>div>button:hover]:border-white/25
              [&>div>button:hover]:bg-white/15
              [&>div>button:focus]:ring-2
              [&>div>button:focus]:ring-white/40
              [&>div>button]:focus:outline-none"
              indicators={true}
              leftControl={LeftIcon}
              rightControl={RightIcon}
              slide
              slideInterval={6000}
            >
              {stories.map((s) => (
                <div key={s.couple} className="relative h-full w-full">
                  <img
                    src={s.img}
                    alt={s.couple}
                    className="absolute inset-0 h-full w-full object-cover opacity-30"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />

                  <div className="relative flex h-full items-center px-6 md:px-10">
                    <figure className="max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-4 shadow-[0_6px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl md:p-6">
                      <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
                        <Quote className="h-4 w-4" />
                        <span>Real experiences from verified couples</span>
                      </div>

                      <figcaption className="text-lg font-semibold md:text-xl">
                        {s.couple}
                      </figcaption>

                      <blockquote className="mt-2 leading-relaxed text-white/85 md:mt-3">
                        “{s.text}”
                      </blockquote>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="cursor-pointer rounded-full bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-lg shadow-rose-900/20 transition hover:-translate-y-0.5 hover:shadow-xl"
                        >
                          Explore similar stories
                        </button>

                        <button
                          type="button"
                          className="cursor-pointer rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur transition hover:border-white/25 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/40"
                        >
                          Start your journey
                        </button>
                      </div>
                    </figure>
                  </div>
                </div>
              ))}
            </Carousel>

            <div className="pointer-events-none absolute bottom-3 left-1/2 w-[90%] -translate-x-1/2 md:w-[60%]">
              <div className="mx-auto h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-1/3 animate-[pulse_2s_ease-in-out_infinite] bg-gradient-to-r from-fuchsia-300/70 via-pink-300/70 to-rose-300/70" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section
        id="pricing"
        className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 text-white"
        aria-labelledby="pricing-title"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-600/35 opacity-30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-rose-500/30 opacity-20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
        </div>

        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <Star className="h-3.5 w-3.5" /> Premium plans designed for real
            results
          </div>

          <h2
            id="pricing-title"
            className="mt-3 text-3xl font-bold tracking-tight md:text-4xl"
          >
            <span className="text-white">Flexible pricing that</span>{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              grows with you
            </span>
          </h2>

          <p className="mt-2 text-sm text-white/70">
            Switch billing to save more with yearly plans.
          </p>

          <div
            className="mt-6 inline-flex rounded-full bg-white/10 p-1 text-sm font-medium shadow-lg"
            role="tablist"
            aria-label="Billing period"
          >
            <button
              role="tab"
              aria-selected={billing === "monthly"}
              onClick={() => setBilling("monthly")}
              className={`cursor-pointer rounded-full px-5 py-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                billing === "monthly"
                  ? "scale-105 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg"
                  : "text-white/70 hover:scale-105 hover:text-white"
              }`}
            >
              Monthly
            </button>

            <button
              role="tab"
              aria-selected={billing === "yearly"}
              onClick={() => setBilling("yearly")}
              className={`cursor-pointer rounded-full px-5 py-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                billing === "yearly"
                  ? "scale-105 bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-lg"
                  : "text-white/70 hover:scale-105 hover:text-white"
              }`}
            >
              Yearly{" "}
              <span className="ml-1 text-[11px] font-normal">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <TierCard
            title="Free"
            icon={<Star className="h-5 w-5 text-white/60" aria-hidden />}
            price={prices.free[billing]}
            cadence={isYearly ? "/year" : "/month"}
            formatPrice={formatBDT}
            cta="Continue Free"
            buttonProps={{
              color: "light",
              className:
                "w-full bg-white/10 border border-white/10 hover:bg-white/20 hover:scale-105 cursor-pointer transition",
            }}
            borderClass="border-white/10"
            glowClass="from-white/10 to-transparent"
            features={[
              {
                label: "Create & browse profiles",
                available: true,
                icon: <Users className="h-4 w-4" />,
              },
              {
                label: "Basic filters",
                available: true,
                icon: <Shield className="h-4 w-4" />,
              },
              {
                label: "Limited connects",
                available: true,
                icon: <MessageSquare className="h-4 w-4" />,
              },
              {
                label: "Basic verification badge",
                available: false,
                icon: <Award className="h-4 w-4" />,
              },
              {
                label: "See who viewed you",
                available: false,
                icon: <Eye className="h-4 w-4" />,
              },
            ]}
            footnote="Best for getting started"
          />

          <div className="relative">
            <Badge className="absolute -top-3 right-4 z-10 bg-gradient-to-r from-amber-400 to-amber-500 font-semibold text-black shadow-md">
              Most Popular
            </Badge>

            <TierCard
              title="Premium"
              icon={
                <Crown
                  className="h-5 w-5 text-amber-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                  aria-hidden
                />
              }
              highlight
              price={prices.premium[billing]}
              cadence={isYearly ? "/year" : "/month"}
              formatPrice={formatBDT}
              cta="Upgrade"
              buttonProps={{
                className:
                  "w-full cursor-pointer hover:brightness-110 hover:scale-105 hover:shadow-[0_8px_30px_-10px_rgba(217,70,239,0.5)] transition text-neutral-900 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300",
              }}
              borderClass="border-fuchsia-400/40"
              glowClass="from-fuchsia-500/15 to-transparent"
              features={[
                {
                  label: "Spotlight in searches (+Boost)",
                  available: true,
                  icon: <TrendingUp className="h-4 w-4" />,
                },
                {
                  label: "Unlimited connects",
                  available: true,
                  icon: <MessageSquare className="h-4 w-4" />,
                },
                {
                  label: "Read receipts & priority support",
                  available: true,
                  icon: <ShieldCheck className="h-4 w-4" />,
                },
                {
                  label: "Advanced privacy controls",
                  available: true,
                  icon: <EyeOff className="h-4 w-4" />,
                },
                {
                  label: "Weekly profile boost",
                  available: true,
                  icon: <Rocket className="h-4 w-4" />,
                },
                {
                  label: "See who viewed you",
                  available: true,
                  icon: <Eye className="h-4 w-4" />,
                },
              ]}
              footnote="Great for power users who want reach & speed"
            />
          </div>

          <TierCard
            title="Elite"
            icon={
              <Crown
                className="h-5 w-5 text-amber-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                aria-hidden
              />
            }
            badge={{
              text: "Concierge",
              className: "bg-indigo-500/90 text-white",
            }}
            price={prices.elite[billing]}
            cadence={isYearly ? "/year" : "/month"}
            formatPrice={formatBDT}
            cta="Talk to us"
            buttonProps={{
              className:
                "w-full cursor-pointer transition bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black hover:scale-105 hover:shadow-[0_8px_30px_-10px_rgba(251,191,36,0.5)]",
            }}
            borderClass="border-white/15"
            glowClass="from-rose-400/15 to-transparent"
            features={[
              {
                label: "Dedicated matchmaker",
                available: true,
                icon: <PhoneCall className="h-4 w-4" />,
              },
              {
                label: "Family-assisted onboarding",
                available: true,
                icon: <Users className="h-4 w-4" />,
              },
              {
                label: "Handpicked introductions",
                available: true,
                icon: <Award className="h-4 w-4" />,
              },
              {
                label: "Priority verification (24h)",
                available: true,
                icon: <ShieldCheck className="h-4 w-4" />,
              },
              {
                label: "VIP scheduling support",
                available: true,
                icon: <CalendarCheck2 className="h-4 w-4" />,
              },
              {
                label: "Maximum privacy suite",
                available: true,
                icon: <Lock className="h-4 w-4" />,
              },
            ]}
            footnote="For discerning members who prefer 1:1 concierge"
          />
        </div>

        <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-4 w-4" />
              <span className="text-sm">
                All plans include secure messaging & basic privacy
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm">
                We never share your data without consent
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/80">
              <Zap className="h-4 w-4" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <motion.section
        className="mx-auto max-w-7xl px-4 pb-16"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportCfg}
      >
        <div className="rounded-3xl bg-gradient-to-r from-fuchsia-300/35 via-pink-300/35 to-rose-300/35 p-[1px]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md md:p-8">
            <div className="grid items-center gap-8 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-bold">
                  <span className="text-white">Let’s help you</span>{" "}
                  <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                    start the conversation
                  </span>
                </h3>

                <p className="mt-2 text-white/70">
                  Our advisors can verify your profile and suggest matches
                  tailored to your preferences.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 px-4 py-2 font-semibold text-neutral-900 hover:scale-[1.01] hover:brightness-110 focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-white/50">
                    <Mail className="h-4 w-4" /> Email us
                  </Button>

                  <Button
                    color="gray"
                    className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/10 hover:scale-[1.01] hover:border-white/20 hover:bg-white/15 focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-white/40"
                  >
                    <Phone className="h-4 w-4" /> Request a call
                  </Button>
                </div>
              </div>

              <div className="hidden sm:block">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md md:p-6">
                  <ul className="space-y-3 text-sm text-white/80">
                    <li className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Verified by multi-step checks
                    </li>

                    <li className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-400" />
                      Privacy-first profiles
                    </li>

                    <li className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-sky-400" />
                      Human support 24/7
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

function TierCard({
  title,
  icon,
  badge,
  price,
  cadence,
  cta,
  buttonProps,
  features,
  highlight = false,
  borderClass = "border-white/10",
  glowClass = "from-white/10 to-transparent",
  footnote,
  formatPrice = (n) => n,
}) {
  return (
    <div className="group h-full">
      <div
        className={`rounded-2xl p-[1px] ${
          highlight
            ? "bg-gradient-to-br from-fuchsia-300/50 via-pink-300/50 to-rose-300/50"
            : "bg-white/10"
        }`}
      >
        <div
          className={[
            "relative h-full rounded-2xl border p-6 backdrop-blur-xl transition",
            highlight
              ? "bg-gradient-to-b from-fuchsia-500/10 to-transparent group-hover:-translate-y-0.5 group-hover:shadow-lg"
              : "bg-white/5 group-hover:-translate-y-0.5 group-hover:shadow-md",
            borderClass,
          ].join(" ")}
        >
          <div
            className={`pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b ${glowClass}`}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {icon || <Star className="h-5 w-5 text-white/50" aria-hidden />}
              <span className="text-2xl font-bold">{title}</span>
            </div>

            {badge ? (
              <Badge className={`text-white ${badge.className || "bg-white/10"}`}>
                {badge.text}
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-extrabold tracking-tight">
              {price === 0 ? "Free" : formatPrice(price)}
            </span>

            {price !== 0 && (
              <span className="pb-1 text-sm text-white/70">{cadence}</span>
            )}
          </div>

          <ul className="mt-4 space-y-2 text-sm">
            {features?.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2 text-white/90">
                {f.available ? (
                  <span className="mt-0.5 inline-flex items-center justify-center rounded-full bg-emerald-400/10 p-0.5">
                    <CheckCircle2
                      className="h-4 w-4 text-emerald-400"
                      aria-hidden
                    />
                  </span>
                ) : (
                  <Tooltip content="Upgrade to unlock" style="light">
                    <span className="mt-0.5 inline-flex items-center justify-center rounded-full bg-white/5 p-0.5">
                      <Lock className="h-4 w-4 text-white/40" aria-hidden />
                    </span>
                  </Tooltip>
                )}

                <span className={f.available ? "" : "text-white/60"}>
                  <span className="inline-flex items-center gap-1.5">
                    {f.icon}
                    {f.label}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <Button
            {...buttonProps}
            className={
              (buttonProps?.className || "") +
              " mt-5 rounded-xl px-4 py-2 font-semibold focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-white/50"
            }
          >
            {cta}
          </Button>

          {footnote && <p className="mt-3 text-xs text-white/60">{footnote}</p>}
        </div>
      </div>
    </div>
  )
}