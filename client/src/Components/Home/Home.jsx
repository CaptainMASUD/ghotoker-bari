"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Search,
  MapPin,
  ShieldCheck,
  Users,
  Star,
  Crown,
  CheckCircle,
  PhoneCall,
  MessageCircle,
  CalendarHeart,
  UserCheck,
  BadgeCheck,
  ArrowRight,
  ChevronDown,
  Quote,
  Gem,
  Headphones,
  WalletCards,
  UserRoundCheck,
  FileCheck2,
  HandHeart,
  Lock,
  Home as HomeIcon,
  BookOpenCheck,
  Camera,
  ClipboardCheck,
  Building2,
  GraduationCap,
  ShieldAlert,
  MapPinned,
  Landmark,
  FileHeart,
  UserCog,
  EyeOff,
  Sparkle,
} from "lucide-react";

const bannerImage =
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=2400&q=90";

const aboutImage =
  "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1400&q=90";

const familyImage =
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1400&q=90";

const biodataImage =
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1400&q=90";

const sliderImages = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1400&q=90",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=90",
];

const divisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

const religions = ["Islam", "Hinduism", "Buddhism", "Christianity", "Other"];
const ageRanges = ["18 - 25", "26 - 30", "31 - 35", "36 - 40", "40+"];

const stats = [
  { value: "85K+", label: "Verified Profiles", icon: ShieldCheck },
  { value: "9.6/10", label: "Match Satisfaction", icon: Star },
  { value: "24/7", label: "Human Support", icon: Headphones },
];

const featuredProfiles = [
  {
    name: "Verified Bride Profiles",
    title: "Education, family background, location and privacy protected biodata.",
    meta: "Dhaka · Bachelor · Family reviewed",
    badge: "Bride Profiles",
  },
  {
    name: "Verified Groom Profiles",
    title: "Profession, education, family values and lifestyle based matches.",
    meta: "Chattogram · Engineer · Verified",
    badge: "Groom Profiles",
  },
  {
    name: "Family Assisted Matching",
    title: "For parents and guardians who want a safe and guided match process.",
    meta: "Bangladesh · Family focused · Safe",
    badge: "Family Match",
  },
  {
    name: "Premium Match Support",
    title: "Human support team helps shortlist better matches with privacy.",
    meta: "Dedicated support · Better response · Secure",
    badge: "Premium Support",
  },
];

const howItWorks = [
  {
    title: "Create Biodata",
    description:
      "Add personal, education, profession, family, lifestyle and partner preference details.",
    icon: UserCheck,
  },
  {
    title: "Profile Review",
    description:
      "Admin checks profile quality and verification details before better visibility.",
    icon: FileCheck2,
  },
  {
    title: "Find Suitable Matches",
    description:
      "Use Bangladeshi location, religion, education, profession and age filters.",
    icon: Search,
  },
  {
    title: "Connect Safely",
    description:
      "Full biodata, contact and communication are controlled by privacy and membership rules.",
    icon: HandHeart,
  },
];

const bdBenefits = [
  {
    title: "Division & District Search",
    description:
      "Find matches by Bangladeshi division, district, city and preferred family location.",
    icon: MapPinned,
    shape: "Location",
  },
  {
    title: "Family Biodata Focus",
    description:
      "Show family type, values, siblings and guardian-friendly details in a clean format.",
    icon: HomeIcon,
    shape: "Family",
  },
  {
    title: "Education & Profession",
    description:
      "Highlight degree, institution, job type, profession and career background clearly.",
    icon: GraduationCap,
    shape: "Career",
  },
  {
    title: "Privacy Protected",
    description:
      "Profile photos, phone, email, address, NID and sensitive details stay controlled.",
    icon: Lock,
    shape: "Safe",
  },
];

const profileTips = [
  {
    title: "Complete biodata properly",
    text: "Add education, profession, family values, lifestyle and partner preference to get better responses.",
    icon: ClipboardCheck,
    step: "01",
  },
  {
    title: "Use quality photos safely",
    text: "Upload good photos for verification, but public users will still see locked photos for privacy.",
    icon: Camera,
    step: "02",
  },
  {
    title: "Write clear expectations",
    text: "Mention preferred age, religion, location, education, profession and family expectations honestly.",
    icon: BookOpenCheck,
    step: "03",
  },
  {
    title: "Keep family details updated",
    text: "Bangladeshi marriage decisions often include family, so guardian-friendly biodata is important.",
    icon: Users,
    step: "04",
  },
];

const packages = [
  {
    name: "Basic",
    monthly: 499,
    yearly: 4990,
    description: "For users who want to browse and shortlist public profiles.",
    icon: Heart,
    popular: false,
    features: [
      "Browse public profiles",
      "Limited biodata preview",
      "Photo locked privacy",
      "Basic search filters",
      "Profile shortlist access",
    ],
  },
  {
    name: "Premium",
    monthly: 999,
    yearly: 9990,
    description: "Best for serious users who want full biodata access.",
    icon: Crown,
    popular: true,
    features: [
      "Full biodata access",
      "Better match recommendations",
      "Priority profile visibility",
      "Chat request access",
      "View allowed private details",
      "Human support included",
    ],
  },
  {
    name: "Assisted",
    monthly: 1999,
    yearly: 19990,
    description: "For families who want guided matchmaking support.",
    icon: Gem,
    popular: false,
    features: [
      "Dedicated match assistant",
      "Manual shortlist support",
      "Family-focused matching",
      "Priority verification",
      "Premium support",
      "Best match suggestions",
    ],
  },
];

const testimonials = [
  {
    name: "Rahman Family",
    location: "Dhaka",
    rating: 5,
    text: "The privacy system and verified profile process made us feel safe. The filters helped us find suitable matches quickly.",
  },
  {
    name: "Ayesha & Family",
    location: "Sylhet",
    rating: 5,
    text: "Clean biodata structure, good filtering and helpful support. We liked that profile photos were protected.",
  },
  {
    name: "Mahmud Hasan",
    location: "Chattogram",
    rating: 5,
    text: "The premium package gave us better visibility and serious profile options. Very professional experience.",
  },
];

const faqs = [
  {
    question: "Can public users see profile photos?",
    answer:
      "No. Public users see limited profile information only. Profile photos and sensitive details stay locked based on privacy and membership rules.",
  },
  {
    question: "Is this suitable for Bangladeshi family-based marriage search?",
    answer:
      "Yes. The platform focuses on biodata, family background, religion, location, profession, education and privacy-first discovery.",
  },
  {
    question: "Can parents or guardians use the platform?",
    answer:
      "Yes. Profiles can be created by self, parent, sibling, relative or guardian depending on your system settings.",
  },
  {
    question: "How are matches filtered?",
    answer:
      "Users can filter by gender, age, religion, marital status, division, district, city, education and profession.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
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

function SelectBox({ value, onChange, children, icon: Icon }) {
  return (
    <motion.div whileHover={{ y: -1 }} className="relative">
      {Icon ? (
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-600" />
      ) : null}

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-11 w-full appearance-none rounded-2xl border border-white/60 bg-white/95 text-sm font-semibold text-slate-700 shadow-sm outline-none backdrop-blur-md transition hover:bg-white focus:border-rose-300 focus:ring-4 focus:ring-rose-100 ${
          Icon ? "pl-11" : "pl-4"
        } pr-10`}
      >
        {children}
      </select>

      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </motion.div>
  );
}

function StatCard({ item }) {
  const Icon = item.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-white/35 bg-white/20 px-4 py-3 shadow-sm backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 text-rose-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-white">{item.value}</h3>
          <p className="mt-0.5 text-xs font-semibold text-white/75">
            {item.label}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-3xl text-center"
    >
      {eyebrow ? (
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-rose-700 shadow-sm">
          <span className="h-2 w-2 rounded-full bg-rose-600" />
          {eyebrow}
        </div>
      ) : null}

      <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>

      {subtitle ? (
        <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
          {subtitle}
        </p>
      ) : null}
    </motion.div>
  );
}

function BangladeshFeatureCard({ item, index }) {
  const Icon = item.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-[2rem] border border-white bg-white p-6 shadow-sm"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-50 transition group-hover:bg-rose-100" />
      <div className="pointer-events-none absolute bottom-5 right-5 text-6xl font-black text-slate-50">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="relative">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-500">
          <Landmark className="h-3.5 w-3.5 text-rose-500" />
          {item.shape}
        </div>

        <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-8 ring-rose-50/50">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="mt-5 text-lg font-bold text-slate-950">{item.title}</h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {item.description}
        </p>

        <div className="mt-5 h-1.5 w-16 rounded-full bg-rose-100">
          <div className="h-1.5 w-8 rounded-full bg-rose-500 transition-all group-hover:w-16" />
        </div>
      </div>
    </motion.div>
  );
}

function ProfileExperienceSection() {
  return (
    <section className="px-4 pb-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white bg-white p-5 shadow-sm md:p-7 lg:p-8">
          <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-rose-50" />
          <div className="pointer-events-none absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-slate-50" />

          <div className="relative grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="relative overflow-hidden rounded-[2rem] bg-slate-950"
            >
              <img
                src={biodataImage}
                alt="Bangladeshi matrimony biodata"
                className="h-[480px] w-full object-cover opacity-75"
              />

              <div className="absolute inset-0 bg-slate-950/40" />

              <div className="absolute left-5 right-5 top-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-rose-700">
                  <FileHeart className="h-4 w-4" />
                  Better Biodata
                </div>
              </div>

              <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/30 bg-white/20 p-5 text-white backdrop-blur-xl">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Improve your profile experience
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/80">
                  A complete biodata helps families understand education,
                  profession, family values, lifestyle and expectations clearly.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/15 p-3">
                    <p className="text-xl font-bold">70%+</p>
                    <p className="text-xs font-semibold text-white/70">
                      Better completion goal
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-3">
                    <p className="text-xl font-bold">Safe</p>
                    <p className="text-xs font-semibold text-white/70">
                      Public photo locked
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={staggerWrap}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-4"
            >
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-rose-700">
                  <UserCog className="h-4 w-4" />
                  Profile Quality Guide
                </div>

                <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  Guide users to make a stronger marriage biodata.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                  These simple steps help a user improve trust, reduce confusion
                  and get better responses from serious families.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {profileTips.map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      variants={fadeUp}
                      whileHover={{ y: -4 }}
                      className="group relative overflow-hidden rounded-[1.75rem] border border-slate-100 bg-[#fffaf7] p-5"
                    >
                      <div className="absolute -right-6 -top-6 flex h-20 w-20 items-center justify-center rounded-full bg-white text-sm font-bold text-rose-200 transition group-hover:text-rose-300">
                        {item.step}
                      </div>

                      <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>

                      <h3 className="relative mt-5 text-base font-bold text-slate-950">
                        {item.title}
                      </h3>

                      <p className="relative mt-2 text-sm leading-6 text-slate-500">
                        {item.text}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600">
                    <EyeOff className="h-5 w-5" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">
                      Privacy reminder
                    </h4>

                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      Sensitive data should never be shown publicly. Keep photo,
                      phone, email, address, NID and income visibility
                      controlled by membership and privacy rules.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % featuredProfiles.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const current = featuredProfiles[active];

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="rounded-[2rem] border border-white bg-white p-5 shadow-sm md:p-7"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">
            <UserRoundCheck className="h-4 w-4" />
            Smart Match Discovery
          </div>

          <h3 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Discover trusted profiles with privacy-first matching.
          </h3>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Ghotoker Bari helps users and families browse verified matrimony
            profiles, protect sensitive details, and use filters to find better
            bride and groom matches.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              "Verified profile review",
              "Photo locked privacy",
              "Family-friendly biodata",
              "Premium match support",
            ].map((item) => (
              <motion.div
                key={item}
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
              >
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-rose-100 bg-rose-50 p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 35 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -35 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm"
            >
              <div className="relative h-48">
                <img
                  src={sliderImages[active]}
                  alt={current.name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-slate-950/30" />

                <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold text-rose-700">
                  {current.badge}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-slate-950">
                      {current.name}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {current.title}
                    </p>

                    <p className="mt-3 text-xs font-semibold text-slate-400">
                      {current.meta}
                    </p>
                  </div>

                  <BadgeCheck className="h-6 w-6 shrink-0 text-emerald-600" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 flex justify-center gap-2">
            {featuredProfiles.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActive(index)}
                className={`h-2.5 rounded-full transition ${
                  active === index
                    ? "w-8 bg-rose-600"
                    : "w-2.5 bg-rose-200 hover:bg-rose-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoCard({ item }) {
  const Icon = item.icon;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="rounded-[2rem] border border-white bg-white p-6 shadow-sm"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-slate-950">{item.title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {item.description || item.text}
      </p>
    </motion.div>
  );
}

function PackageCard({ item, billing }) {
  const Icon = item.icon;
  const price = billing === "monthly" ? item.monthly : item.yearly;
  const period = billing === "monthly" ? "/month" : "/year";

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5 }}
      className={`relative rounded-[2rem] border bg-white p-6 shadow-sm transition ${
        item.popular
          ? "border-rose-300 shadow-rose-100"
          : "border-white hover:border-rose-100"
      }`}
    >
      {item.popular ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-rose-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-100">
          Most Popular
        </div>
      ) : null}

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-2xl font-bold text-slate-950">{item.name}</h3>

      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
        {item.description}
      </p>

      <div className="mt-6 flex items-end gap-1">
        <span className="text-4xl font-bold text-slate-950">৳{price}</span>
        <span className="mb-1 text-sm font-semibold text-slate-500">
          {period}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {item.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span className="text-sm font-medium leading-5 text-slate-600">
              {feature}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold transition ${
          item.popular
            ? "bg-rose-600 text-white shadow-lg shadow-rose-100 hover:bg-rose-700"
            : "bg-slate-900 text-white hover:bg-rose-700"
        }`}
      >
        Choose Plan
        <ArrowRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function TestimonialCard({ item }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="rounded-[2rem] border border-white bg-white p-6 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-1 text-amber-400">
          {Array.from({ length: item.rating }).map((_, index) => (
            <Star key={index} className="h-4 w-4 fill-current" />
          ))}
        </div>

        <Quote className="h-7 w-7 text-rose-200" />
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-600">“{item.text}”</p>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <Users className="h-5 w-5" />
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
          <p className="text-xs font-semibold text-slate-400">
            {item.location}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white bg-white p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-bold text-slate-900">
          {item.question}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 overflow-hidden text-sm leading-6 text-slate-500"
          >
            {item.answer}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [billing, setBilling] = useState("monthly");

  const [filters, setFilters] = useState({
    lookingFor: "",
    religion: "",
    division: "",
    ageRange: "",
  });

  const yearlySaving = useMemo(() => billing === "yearly", [billing]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (filters.lookingFor) {
      params.set("gender", filters.lookingFor === "bride" ? "female" : "male");
    }

    if (filters.religion) params.set("religion", filters.religion);
    if (filters.division) params.set("division", filters.division);

    if (filters.ageRange) {
      const [min, max] = filters.ageRange.split(" - ");

      if (filters.ageRange === "40+") {
        params.set("minAge", "40");
      } else {
        params.set("minAge", min);
        params.set("maxAge", max);
      }
    }

    const queryString = params.toString();

    window.location.href = queryString
      ? `/find-match?${queryString}`
      : "/find-match";
  };

  return (
    <main className="min-h-screen bg-[#f8f3ef] text-slate-800">
      {/* HERO */}
      <section className="px-3 pt-[92px] sm:px-5 lg:px-6">
        <div className="mx-auto max-w-[1800px]">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-xl shadow-rose-100">
            <img
              src={bannerImage}
              alt="Ghotoker Bari matrimony banner"
              className="h-[500px] w-full object-cover opacity-75 md:h-[530px] xl:h-[560px]"
            />

            <div className="absolute inset-0 bg-slate-950/48" />

            <div className="absolute inset-x-0 top-0 flex justify-center px-5 pt-12 sm:pt-14 lg:pt-16">
              <motion.div
                variants={staggerWrap}
                initial="hidden"
                animate="visible"
                className="max-w-4xl text-center"
              >
                <motion.div
                  variants={fadeUp}
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-wide text-rose-700 shadow-sm backdrop-blur"
                >
                  <CalendarHeart className="h-4 w-4" />
                  Bangladesh Marriage Media Platform
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mx-auto max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
                >
                  Find a trusted life partner with Ghotoker Bari.
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/85 md:text-base"
                >
                  A privacy-first Bangladeshi matrimony platform for verified
                  biodata, family-friendly matching, protected photos and safe
                  communication.
                </motion.p>
              </motion.div>
            </div>

            <div className="absolute inset-x-0 bottom-6 px-5 sm:px-8 lg:px-14 xl:px-20">
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.2 }}
                className="mx-auto max-w-7xl rounded-[1.75rem] border border-white/35 bg-white/18 p-3 shadow-2xl backdrop-blur-xl md:p-4"
              >
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                  <SelectBox
                    value={filters.lookingFor}
                    onChange={(value) => updateFilter("lookingFor", value)}
                    icon={Heart}
                  >
                    <option value="">Looking For</option>
                    <option value="bride">Bride</option>
                    <option value="groom">Groom</option>
                  </SelectBox>

                  <SelectBox
                    value={filters.religion}
                    onChange={(value) => updateFilter("religion", value)}
                    icon={ShieldCheck}
                  >
                    <option value="">Religion</option>
                    {religions.map((religion) => (
                      <option key={religion} value={religion}>
                        {religion}
                      </option>
                    ))}
                  </SelectBox>

                  <SelectBox
                    value={filters.division}
                    onChange={(value) => updateFilter("division", value)}
                    icon={MapPin}
                  >
                    <option value="">Division</option>
                    {divisions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </SelectBox>

                  <SelectBox
                    value={filters.ageRange}
                    onChange={(value) => updateFilter("ageRange", value)}
                    icon={Users}
                  >
                    <option value="">Age Range</option>
                    {ageRanges.map((age) => (
                      <option key={age} value={age}>
                        {age}
                      </option>
                    ))}
                  </SelectBox>

                  <motion.button
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-7 text-sm font-bold text-white shadow-lg shadow-rose-950/20 transition hover:bg-rose-700"
                  >
                    <Search className="h-4 w-4" />
                    Search
                  </motion.button>
                </div>

                <motion.div
                  variants={staggerWrap}
                  initial="hidden"
                  animate="visible"
                  className="mt-3 grid gap-3 md:grid-cols-3"
                >
                  {stats.map((item) => (
                    <StatCard key={item.label} item={item} />
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* BANGLADESH FEATURES */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Made For Bangladesh"
            title="Built for Bangladeshi marriage culture"
            subtitle="A better experience for users and families who want trusted biodata, privacy, verification and location-based matching."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="relative mt-12"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-px w-[80%] -translate-x-1/2 bg-rose-100 lg:block" />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {bdBenefits.map((item, index) => (
                <BangladeshFeatureCard
                  key={item.title}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SLIDER */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FeaturedSlider />
        </div>
      </section>

      {/* PROFILE EXPERIENCE */}
      <ProfileExperienceSection />

      {/* ABOUT */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
          >
            <motion.div
              variants={fadeUp}
              className="overflow-hidden rounded-[2.2rem] border border-white bg-white shadow-sm"
            >
              <img
                src={aboutImage}
                alt="About Ghotoker Bari"
                className="h-72 w-full object-cover"
              />

              <div className="p-6 md:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <Heart className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  About Ghotoker Bari
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                  Ghotoker Bari is a privacy-first marriage media platform built
                  for Bangladeshi families and individuals who want a clean,
                  trusted and professional matchmaking experience.
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                  We focus on verified profiles, limited public visibility,
                  protected profile photos, smart filters and human-assisted
                  support so users can search confidently.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/about";
                  }}
                  className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 text-sm font-bold text-white transition hover:bg-rose-700"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {howItWorks.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.title}
                    variants={fadeUp}
                    whileHover={{ y: -4 }}
                    className="rounded-[2rem] border border-white bg-white p-6 shadow-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="mt-5 text-lg font-bold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SAFETY */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <motion.div
              variants={staggerWrap}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-4 sm:grid-cols-2"
            >
              {[
                {
                  title: "Photo Privacy",
                  text: "Photos stay locked in public browse and match cards.",
                  icon: Lock,
                },
                {
                  title: "Sensitive Data Hidden",
                  text: "Phone, email, address, NID, passport and income are controlled.",
                  icon: ShieldAlert,
                },
                {
                  title: "Admin Verification",
                  text: "Profiles can be reviewed before approval and better visibility.",
                  icon: BadgeCheck,
                },
                {
                  title: "Family-Friendly Flow",
                  text: "Useful biodata structure for parents and guardians.",
                  icon: Building2,
                },
              ].map((item) => (
                <InfoCard key={item.title} item={item} />
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="overflow-hidden rounded-[2.2rem] border border-white bg-white shadow-sm"
            >
              <img
                src={familyImage}
                alt="Family assisted marriage support"
                className="h-80 w-full object-cover"
              />

              <div className="p-6 md:p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <ShieldCheck className="h-7 w-7" />
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  Privacy and trust come first
                </h2>

                <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
                  A marriage platform needs stronger privacy than normal social
                  media. That is why Ghotoker Bari protects profile photos,
                  sensitive information and contact details with controlled
                  visibility.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Membership Packages"
            title="Choose the right plan for your match journey"
            subtitle="Start with browsing, unlock full biodata with premium, or choose assisted support for family-guided matchmaking."
          />

          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-2xl border border-white bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`h-11 rounded-xl px-5 text-sm font-bold transition ${
                  billing === "monthly"
                    ? "bg-rose-600 text-white"
                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() => setBilling("yearly")}
                className={`h-11 rounded-xl px-5 text-sm font-bold transition ${
                  billing === "yearly"
                    ? "bg-rose-600 text-white"
                    : "text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          {yearlySaving ? (
            <p className="mt-3 text-center text-sm font-semibold text-emerald-600">
              Yearly plans include better value for long-term serious search.
            </p>
          ) : null}

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-12 grid gap-6 lg:grid-cols-3"
          >
            {packages.map((item) => (
              <PackageCard key={item.name} item={item} billing={billing} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            eyebrow="Ratings & Reviews"
            title="Trusted by families and serious users"
            subtitle="A clean, privacy-focused marriage media experience made for verified profiles and safe matchmaking."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-12 grid gap-6 lg:grid-cols-3"
          >
            {testimonials.map((item) => (
              <TestimonialCard key={item.name} item={item} />
            ))}
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mt-10 rounded-[2rem] border border-white bg-white p-6 shadow-sm"
          >
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                  <Star className="h-6 w-6 fill-current" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-950">4.9/5</h3>
                  <p className="text-sm font-semibold text-slate-500">
                    Average Rating
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <BadgeCheck className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-950">
                    Verified
                  </h3>
                  <p className="text-sm font-semibold text-slate-500">
                    Profile Review
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <WalletCards className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-950">Secure</h3>
                  <p className="text-sm font-semibold text-slate-500">
                    Membership Access
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <SectionTitle
            eyebrow="Common Questions"
            title="Useful answers before you start"
            subtitle="Clear information helps users and families feel confident before creating a biodata."
          />

          <div className="mt-10 space-y-4">
            {faqs.map((item) => (
              <FAQItem key={item.question} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-[2.5rem] border border-white bg-white p-8 text-center shadow-sm md:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
              <PhoneCall className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              Ready to find a trusted match?
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Create your profile, complete your biodata and start browsing
              verified public profiles with privacy-first protection.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/register";
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-7 text-sm font-bold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700"
              >
                Create Profile
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/find-match";
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 text-sm font-bold text-white transition hover:bg-rose-700"
              >
                Browse Matches
                <Search className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}