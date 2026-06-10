import React from "react";
import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaEnvelope,
} from "react-icons/fa";
import logo from "../../Logo/logo.svg";

function scrollToPageTop() {
  requestAnimationFrame(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });
}

export default function Footer() {
  const quickLinks = [
    { label: "Home", to: "/" },
    { label: "Find Matches", to: "/find-matches" },
    { label: "Success Stories", to: "/success-stories" },
    { label: "Contact", to: "/contact" },
  ];

  const resourceLinks = [
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms-conditions" },
    { label: "FAQ", to: "/contact" },
    { label: "Support", to: "/contact" },
  ];

  const socialLinks = [
    { Icon: FaFacebookF, label: "Facebook", href: "#" },
    { Icon: FaTwitter, label: "Twitter / X", href: "#" },
    { Icon: FaInstagram, label: "Instagram", href: "#" },
    { Icon: FaLinkedinIn, label: "LinkedIn", href: "#" },
  ];

  return (
    <footer className="w-full bg-[#242424] text-white">
      <div className="border-t border-white/10 bg-[#242424]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <Link
                to="/"
                onClick={scrollToPageTop}
                className="inline-flex items-center gap-3"
                aria-label="ঘটকদের বাড়ি home"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-white/10">
                  <img
                    src={logo}
                    alt="ঘটকদের বাড়ি"
                    className="h-9 w-9 object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="leading-none">
                  <h2
                    style={{ fontFamily: "Atma" }}
                    className="text-2xl font-extrabold tracking-tight md:text-3xl"
                  >
                    <span className="text-rose-500">ঘটকদের</span>
                    <span className="ml-1 text-white">বাড়ি</span>
                  </h2>

                  <p className="mt-1 text-[11px] font-medium text-white/45">
                    Trusted matrimony platform
                  </p>
                </div>
              </Link>

              <p className="max-w-sm text-sm leading-6 text-white/65">
                Connecting hearts safely through verified profiles, trusted
                matchmaking, and family-friendly communication.
              </p>

              <div className="flex gap-3 pt-1">
                {socialLinks.map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/75 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                  >
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            <FooterNav
              title="Quick Links"
              links={quickLinks}
              onNavigate={scrollToPageTop}
            />

            <FooterNav
              title="Resources"
              links={resourceLinks}
              onNavigate={scrollToPageTop}
            />

            <div className="space-y-4">
              <h3 className="text-base font-bold text-white">Newsletter</h3>

              <p className="text-sm leading-6 text-white/65">
                Get the latest updates, feature releases, and success stories.
              </p>

              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <label className="block">
                  <span className="sr-only">Email address</span>

                  <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 transition focus-within:border-rose-500/50 focus-within:ring-4 focus-within:ring-rose-500/10">
                    <FaEnvelope className="shrink-0 text-sm text-rose-400" />

                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                    />
                  </div>
                </label>

                <button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md"
                >
                  Subscribe
                </button>

                <p className="text-xs leading-5 text-white/45">
                  By subscribing you agree to our{" "}
                  <Link
                    to="/terms-conditions"
                    onClick={scrollToPageTop}
                    className="font-medium text-white/65 underline-offset-4 hover:text-rose-400 hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    onClick={scrollToPageTop}
                    className="font-medium text-white/65 underline-offset-4 hover:text-rose-400 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 bg-[#202020]">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-sm text-white/50 sm:px-6 md:flex-row md:text-left lg:px-8">
            <p>
              © {new Date().getFullYear()}{" "}
              <span style={{ fontFamily: "Atma" }}>
                <span className="text-rose-400">ঘটকদের</span>
                <span className="ml-1 text-white/70">বাড়ি</span>
              </span>
              . All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/privacy-policy"
                onClick={scrollToPageTop}
                className="transition hover:text-rose-400"
              >
                Privacy
              </Link>

              <Link
                to="/terms-conditions"
                onClick={scrollToPageTop}
                className="transition hover:text-rose-400"
              >
                Terms
              </Link>

              <Link
                to="/contact"
                onClick={scrollToPageTop}
                className="transition hover:text-rose-400"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNav({ title, links, onNavigate }) {
  return (
    <nav className="space-y-4">
      <h3 className="text-base font-bold text-white">{title}</h3>

      <ul className="space-y-2.5 text-sm font-medium">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              to={link.to}
              onClick={onNavigate}
              className="inline-flex text-white/65 transition hover:translate-x-1 hover:text-rose-400"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}