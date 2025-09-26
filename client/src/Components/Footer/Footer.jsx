import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative w-full bg-[#0b0a12] text-white">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-20 bg-fuchsia-500/25" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full blur-3xl opacity-15 bg-rose-500/20" />
      </div>

      {/* Frame with gradient ring (top-rounded only) – edge-to-edge */}
      <div className="w-full">
        <div className="rounded-t-3xl p-[1px] bg-gradient-to-r from-fuchsia-300/35 via-pink-300/35 to-rose-300/35">
          <div className="rounded-t-3xl border border-white/10 bg-[#0e0d15]/95 backdrop-blur-xl">
            {/* Content */}
            <div className="mx-auto max-w-7xl px-6 py-12">
              <div className="grid gap-10 md:grid-cols-4">
                {/* Branding */}
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                    GhotokerBari
                  </h2>
                  <p className="text-white/75 leading-relaxed">
                    Connecting hearts safely. Join our trusted community of verified singles and families.
                  </p>

                  {/* Socials */}
                  <div className="flex gap-3 pt-1">
                    {[
                      { Icon: FaFacebookF, label: "Facebook", href: "#" },
                      { Icon: FaTwitter, label: "Twitter / X", href: "#" },
                      { Icon: FaInstagram, label: "Instagram", href: "#" },
                      { Icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
                    ].map(({ Icon, label, href }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        className="group rounded-xl p-[1px] bg-gradient-to-r from-fuchsia-300/50 via-pink-300/50 to-rose-300/50"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#0e0d15]/90 border border-white/10 hover:bg-white/5 transition">
                          <Icon size={16} className="text-white/90 group-hover:text-white" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <nav className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Quick Links</h3>
                  <ul className="space-y-2 text-sm font-medium">
                    {[
                      { label: "Home", to: "/" },
                      { label: "Find Matches", to: "/find-matches" },
                      { label: "Success Stories", to: "/success-stories" },
                      { label: "Contact", to: "/contact" },
                    ].map((l) => (
                      <li key={l.label}>
                        <Link
                          to={l.to}
                          className="relative inline-block py-1 text-white/85 hover:text-rose-200 transition group"
                        >
                          {l.label}
                          <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] scale-x-0 transform bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Resources (includes your new routes) */}
                <nav className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Resources</h3>
                  <ul className="space-y-2 text-sm font-medium">
                    <li>
                      <Link
                        to="/privacy-policy"
                        className="relative inline-block py-1 text-white/85 hover:text-rose-200 transition group"
                      >
                        Privacy Policy
                        <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] scale-x-0 transform bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-100" />
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/terms-conditions"
                        className="relative inline-block py-1 text-white/85 hover:text-rose-200 transition group"
                      >
                        Terms & Conditions
                        <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] scale-x-0 transform bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-100" />
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="relative inline-block py-1 text-white/85 hover:text-rose-200 transition group">
                        FAQ
                        <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] scale-x-0 transform bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-100" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="relative inline-block py-1 text-white/85 hover:text-rose-200 transition group">
                        Support
                        <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] scale-x-0 transform bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-100" />
                      </a>
                    </li>
                  </ul>
                </nav>

                {/* Newsletter */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Newsletter</h3>
                  <p className="text-white/75">
                    Get the latest updates, feature drops, and success stories.
                  </p>
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      // handle subscribe…
                    }}
                  >
                    <label className="block">
                      <span className="sr-only">Email address</span>
                      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 focus-within:ring-2 focus-within:ring-rose-300/60">
                        <input
                          type="email"
                          required
                          placeholder="Enter your email"
                          className="h-12 w-full bg-transparent px-1 text-white placeholder-white/50 outline-none"
                        />
                      </div>
                    </label>
                    <button
                      type="submit"
                      className="h-12 w-full cursor-pointer rounded-xl px-4 font-semibold text-neutral-900
                                 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                                 shadow-lg shadow-rose-900/20 hover:shadow-xl transition"
                    >
                      Subscribe
                    </button>
                    <p className="text-xs text-white/60 leading-relaxed">
                      By subscribing you agree to our{" "}
                      <Link to="/terms-conditions" className="underline hover:text-rose-200">
                        Terms
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy-policy" className="underline hover:text-rose-200">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </form>
                </div>
              </div>
            </div>

            {/* Bottom bar (no extra bottom spacing, no bottom rounding) */}
            <div className="border-t border-white/10 text-center text-sm text-white/60 py-4">
              © {new Date().getFullYear()} GhotokerBari. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
