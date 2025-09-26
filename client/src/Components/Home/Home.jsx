import React from "react";
import { ShieldCheck, Heart, Users, Mail, Phone } from "lucide-react";
import { Button } from "flowbite-react";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import ProfilesSection from "./ProfilesSection";
import SuccessStories from "./SuccessStories";
import MembershipPlans from "./MembershipPlans";

export default function HomePage() {
  const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};
 const viewportCfg = { once: true, amount: 0.2 };
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <HeroSection />
      <ProfilesSection />

      {/* Trust & Safety */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <h4 className="mt-3 font-semibold">ID & Photo Verification</h4>
            <p className="text-white/70 text-sm mt-1">
              Multi-step checks to ensure authenticity and reduce spam.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Heart className="w-8 h-8 text-rose-400" />
            <h4 className="mt-3 font-semibold">Privacy-First Controls</h4>
            <p className="text-white/70 text-sm mt-1">
              Blur photos, limit profile viewers, and control who messages you.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Users className="w-8 h-8 text-sky-400" />
            <h4 className="mt-3 font-semibold">Human Support, 24/7</h4>
            <p className="text-white/70 text-sm mt-1">
              Real people to help with reporting, safety, and onboarding.
            </p>
          </div>
        </div>
      </section>

      {/* Success Stories (dots only, no scrollbars, no arrows) */}
      <SuccessStories />

      {/* Membership / Pricing */}
      <MembershipPlans />

      {/* Contact CTA */}
      <motion.section
        className="max-w-7xl mx-auto px-4 pb-16"
        variants={fadeUp}
        initial="hidden"
        whileInView="show"
        viewport={viewportCfg}
      >
        <div className="rounded-3xl p-[1px] bg-gradient-to-r from-fuchsia-300/35 via-pink-300/35 to-rose-300/35">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <h3 className="text-2xl font-bold">
                  <span className="text-white">Let’s help you</span>{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300">
                    start the conversation
                  </span>
                </h3>
                <p className="text-white/70 mt-2">
                  Our advisors can verify your profile and suggest matches tailored to your preferences.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    className="flex items-center gap-2 cursor-pointer rounded-xl px-4 py-2 font-semibold text-neutral-900
                               bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                               hover:brightness-110 hover:scale-[1.01]
                               focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-white/50"
                  >
                    <Mail className="w-4 h-4" /> Email us
                  </Button>
                  <Button
                    color="gray"
                    className="bg-white/10 border border-white/10 flex items-center gap-2 cursor-pointer rounded-xl
                               hover:bg-white/15 hover:border-white/20 hover:scale-[1.01]
                               focus:!outline-none focus-visible:!ring-2 focus-visible:!ring-white/40"
                  >
                    <Phone className="w-4 h-4" /> Request a call
                  </Button>
                </div>
              </div>

              <div className="hidden sm:block">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 md:p-6 backdrop-blur-md">
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
  );
}
