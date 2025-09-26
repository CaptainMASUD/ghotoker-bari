import React, { useMemo, useState } from "react";
import { Card, Button, Badge, Tooltip } from "flowbite-react";
import {
  Crown,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
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
} from "lucide-react";

export default function MembershipPlans() {
  const [billing, setBilling] = useState("monthly"); // monthly | yearly
  const isYearly = billing === "yearly";

  // Simple BDT formatter (no decimals)
  const formatBDT = (n) => `৳${Number(n).toLocaleString()}`;

  // Sensible BDT pricing; Yearly = 12 * monthly * 0.8 (20% savings), rounded to hundreds
  const roundHundreds = (n) => Math.round(n / 100) * 100;

  const prices = useMemo(() => {
    const premiumMonthly = 1990;
    const eliteMonthly = 7900;
    const premiumYearly = roundHundreds(premiumMonthly * 12 * 0.8); // ~19,100
    const eliteYearly = roundHundreds(eliteMonthly * 12 * 0.8);     // ~75,800

    return {
      free:   { monthly: 0,         yearly: 0 },
      premium:{ monthly: premiumMonthly, yearly: premiumYearly },
      elite:  { monthly: eliteMonthly,   yearly: eliteYearly },
    };
  }, []);

  return (
    <section
      id="pricing"
      className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 text-white"
      aria-labelledby="pricing-title"
    >
      {/* Premium Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-fuchsia-600/35" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full blur-3xl opacity-20 bg-rose-500/30" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.06),rgba(0,0,0,0))]" />
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
          <Sparkles size={14} /> Premium plans designed for real results
        </div>
        <h2
          id="pricing-title"
          className="mt-3 text-3xl font-bold tracking-tight md:text-4xl"
        >
          <span className="text-white">Flexible pricing that</span>{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300">
            grows with you
          </span>
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Switch billing to save more with yearly plans.
        </p>

        {/* Billing Toggle */}
        <div
          className="mt-6 inline-flex rounded-full bg-white/10 p-1 text-sm font-medium shadow-lg"
          role="tablist"
          aria-label="Billing period"
        >
          <button
            role="tab"
            aria-selected={billing === "monthly"}
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-full transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
              billing === "monthly"
                ? "bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white shadow-lg scale-105"
                : "text-white/70 hover:text-white hover:scale-105"
            }`}
          >
            Monthly
          </button>
          <button
            role="tab"
            aria-selected={billing === "yearly"}
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-full transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
              billing === "yearly"
                ? "bg-gradient-to-r from-rose-500 to-fuchsia-500 text-white shadow-lg scale-105"
                : "text-white/70 hover:text-white hover:scale-105"
            }`}
          >
            Yearly <span className="ml-1 text-[11px] font-normal">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* FREE */}
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
            { label: "Create & browse profiles", available: true, icon: <Users className="h-4 w-4" /> },
            { label: "Basic filters", available: true, icon: <Shield className="h-4 w-4" /> },
            { label: "Limited connects", available: true, icon: <MessageSquare className="h-4 w-4" /> },
            { label: "Basic verification badge", available: false, icon: <Award className="h-4 w-4" /> },
            { label: "See who viewed you", available: false, icon: <Eye className="h-4 w-4" /> },
          ]}
          footnote="Best for getting started"
        />

        {/* PREMIUM (Most Popular) */}
        <div className="relative">
          <Badge className="absolute -top-3 right-4 z-10 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold shadow-md">
            Most Popular
          </Badge>
          <TierCard
            title="Premium"
            // Gold crown
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
              { label: "Spotlight in searches (+Boost)", available: true, icon: <TrendingUp className="h-4 w-4" /> },
              { label: "Unlimited connects", available: true, icon: <MessageSquare className="h-4 w-4" /> },
              { label: "Read receipts & priority support", available: true, icon: <ShieldCheck className="h-4 w-4" /> },
              { label: "Advanced privacy controls", available: true, icon: <EyeOff className="h-4 w-4" /> },
              { label: "Weekly profile boost", available: true, icon: <Rocket className="h-4 w-4" /> },
              { label: "See who viewed you", available: true, icon: <Eye className="h-4 w-4" /> },
            ]}
            footnote="Great for power users who want reach & speed"
          />
        </div>

        {/* ELITE */}
        <TierCard
          title="Elite"
          icon={
            <Crown
              className="h-5 w-5 text-amber-300 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]"
              aria-hidden
            />
          }
          badge={{ text: "Concierge", className: "bg-indigo-500/90 text-white" }}
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
            { label: "Dedicated matchmaker", available: true, icon: <PhoneCall className="h-4 w-4" /> },
            { label: "Family-assisted onboarding", available: true, icon: <Users className="h-4 w-4" /> },
            { label: "Handpicked introductions", available: true, icon: <Award className="h-4 w-4" /> },
            { label: "Priority verification (24h)", available: true, icon: <ShieldCheck className="h-4 w-4" /> },
            { label: "VIP scheduling support", available: true, icon: <CalendarCheck2 className="h-4 w-4" /> },
            { label: "Maximum privacy suite", available: true, icon: <Lock className="h-4 w-4" /> },
          ]}
          footnote="For discerning members who prefer 1:1 concierge"
        />
      </div>

      {/* Trust bar */}
      <div className="mt-10 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-white/80">
            <Users className="h-4 w-4" />
            <span className="text-sm">All plans include secure messaging & basic privacy</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-sm">We never share your data without consent</span>
          </div>
          <div className="flex items-center gap-2 text-white/80">
            <Zap className="h-4 w-4" />
            <span className="text-sm">Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
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
      {/* Premium ring wrapper */}
      <div
        className={`rounded-2xl p-[1px] ${
          highlight
            ? "bg-gradient-to-br from-fuchsia-300/50 via-pink-300/50 to-rose-300/50"
            : "bg-white/10"
        }`}
      >
        <Card
          className={[
            "relative rounded-2xl border backdrop-blur-xl transition",
            highlight
              ? "bg-gradient-to-b from-fuchsia-500/10 to-transparent group-hover:shadow-lg group-hover:-translate-y-0.5"
              : "bg-white/5 group-hover:shadow-md group-hover:-translate-y-0.5",
            borderClass,
          ].join(" ")}
        >
          <div
            className={`pointer-events-none absolute inset-0 -z-10 rounded-2xl bg-gradient-to-b ${glowClass}`}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {icon ? icon : <Star className="h-5 w-5 text-white/50" aria-hidden />}
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

          {/* Feature list */}
          <ul className="mt-4 space-y-2 text-sm">
            {features?.map((f, idx) => (
              <li key={idx} className="flex items-start gap-2 text-white/90">
                {f.available ? (
                  <span className="mt-0.5 inline-flex items-center justify-center rounded-full bg-emerald-400/10 p-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
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
            className={(buttonProps?.className || "") + " mt-5 focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-white/50 rounded-xl px-4 py-2 font-semibold"}
          >
            {cta}
          </Button>
          {footnote && <p className="mt-3 text-xs text-white/60">{footnote}</p>}
        </Card>
      </div>
    </div>
  );
}
