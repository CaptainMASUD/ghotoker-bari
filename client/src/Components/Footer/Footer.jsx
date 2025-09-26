import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden bg-[#0b0a12]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl opacity-30 bg-fuchsia-500/35" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full blur-3xl opacity-25 bg-rose-500/30" />
        <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
      </div>

      {/* Full-bleed frame; ONLY top rounded */}
      <div className="pt-16 pb-0">
        <div className="rounded-t-3xl rounded-b-none p-[1px] bg-gradient-to-r from-fuchsia-300/45 via-pink-300/45 to-rose-300/45">
          <div className="rounded-t-3xl rounded-b-none border border-white/10 bg-white/5 backdrop-blur-xl px-5 md:px-10 pt-10 md:pt-14 pb-0 text-white/90">
            <div className="grid gap-10 md:grid-cols-4">
              {/* Branding */}
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                  GhotokerBari
                </h2>
                <p className="text-white/70 leading-relaxed">
                  Connecting hearts safely. Join our trusted community to meet
                  and chat with verified singles.
                </p>

                {/* Socials */}
                <div className="flex gap-3 pt-2">
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
                      className="group rounded-xl p-[1px] bg-gradient-to-r from-fuchsia-300/60 via-pink-300/60 to-rose-300/60"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-neutral-900/90 border border-white/10 transition group-hover:bg-white/10">
                        <Icon className="text-white/90" size={18} />
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <nav className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Quick Links</h3>
                <ul className="space-y-2 text-sm font-medium">
                  {[
                    { label: "Home", href: "/" },
                    { label: "Find Matches", href: "/find-matches" },
                    { label: "Success Stories", href: "/success-stories" },
                    { label: "Contact", href: "/contact" },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="group relative inline-block py-1 text-white/85 hover:text-rose-200 transition"
                      >
                        {l.label}
                        <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] scale-x-0 transform bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Resources */}
              <nav className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Resources</h3>
                <ul className="space-y-2 text-sm font-medium">
                  {[
                    { label: "Privacy Policy", href: "#" },
                    { label: "Terms of Service", href: "#" },
                    { label: "FAQ", href: "#" },
                    { label: "Support", href: "#" },
                  ].map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="group relative inline-block py-1 text-white/85 hover:text-rose-200 transition"
                      >
                        {l.label}
                        <span className="absolute left-0 right-0 -bottom-0.5 h-[2px] scale-x-0 transform bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 rounded-full transition-transform duration-200 ease-out group-hover:scale-x-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Newsletter */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">Newsletter</h3>
                <p className="text-white/70">
                  Subscribe to our newsletter to get the latest updates and
                  offers.
                </p>

                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                  }}
                >
                  <label className="block">
                    <span className="sr-only">Email address</span>
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 focus-within:ring-2 focus-within:ring-rose-300/60">
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        className="h-12 w-full bg-transparent px-1 text-white placeholder-white/55 outline-none"
                      />
                    </div>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="submit"
                      className="h-12 w-full sm:w-auto cursor-pointer rounded-xl px-5 font-semibold text-neutral-900
                                 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                                 shadow-lg shadow-rose-900/20 hover:shadow-xl transition"
                    >
                      Subscribe
                    </button>
                    <p className="text-xs text-white/60 sm:pl-2 sm:self-center">
                      By subscribing you agree to our{" "}
                      <a href="#" className="underline hover:text-rose-200">
                        Terms
                      </a>{" "}
                      and{" "}
                      <a href="#" className="underline hover:text-rose-200">
                        Privacy Policy
                      </a>
                      .
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom row (flush, no extra bottom padding) */}
            <div className="mt-10 border-t border-white/10 py-5 text-center text-sm text-white/60">
              © 2025 GhotokerBari. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
