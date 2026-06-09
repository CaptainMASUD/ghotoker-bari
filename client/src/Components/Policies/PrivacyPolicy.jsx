import React from "react";
import {
  FaCookieBite,
  FaEnvelope,
  FaLock,
  FaShieldAlt,
  FaUserCheck,
  FaChevronDown,
  FaClock,
  FaGlobeAsia,
} from "react-icons/fa";

const sections = [
  { id: "intro", title: "Introduction" },
  { id: "data-we-collect", title: "Data We Collect" },
  { id: "how-we-use", title: "How We Use Your Data" },
  { id: "legal-basis", title: "Legal Basis" },
  { id: "sharing", title: "Sharing & Disclosure" },
  { id: "security", title: "Security & Retention" },
  { id: "your-rights", title: "Your Rights" },
  { id: "cookies", title: "Cookies & Tracking" },
  { id: "international", title: "International Transfers" },
  { id: "children", title: "Children’s Privacy" },
  { id: "updates", title: "Updates to this Policy" },
  { id: "contact", title: "Contact Us" },
];

export default function PrivacyPolicy({
  lastUpdated = "September 26, 2025",
  company = "GhotokerBari",
  contactEmail = "privacy@ghotokerbari.com",
}) {
  const handleSmoothScroll = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-[#f8f3ef] pt-[60px] text-slate-800">
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Trust & Safety
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Privacy Policy
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              This policy explains how {company} collects, uses, protects, and
              manages your information when you use our website, apps, and
              matchmaking services.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <FaClock className="text-rose-600" />
              Last updated:
              <span className="text-rose-600">{lastUpdated}</span>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickPrivacyCard
              icon={<FaShieldAlt />}
              title="Privacy-first"
              sub="Designed to protect sensitive member data"
            />

            <QuickPrivacyCard
              icon={<FaUserCheck />}
              title="User control"
              sub="Access, correct, or delete your information"
            />

            <QuickPrivacyCard
              icon={<FaLock />}
              title="Secure handling"
              sub="Access controls and protected data storage"
            />

            <QuickPrivacyCard
              icon={<FaCookieBite />}
              title="Cookie clarity"
              sub="Transparent tracking and preference usage"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
              <p className="mb-3 text-sm font-bold text-slate-900">
                On this page
              </p>

              <nav className="space-y-1 text-sm">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={(e) => handleSmoothScroll(e, s.id)}
                    className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    <span>{s.title}</span>
                    <FaChevronDown className="-rotate-90 text-xs text-slate-300 transition group-hover:text-rose-500" />
                  </a>
                ))}
              </nav>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-rose-100 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600">
                <FaGlobeAsia />
              </div>

              <h3 className="mt-3 font-bold text-slate-900">
                Bangladesh-focused
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                This policy is prepared for a matchmaking service serving users
                in Bangladesh and abroad.
              </p>
            </div>
          </aside>

          <main className="min-w-0 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-rose-100/50 sm:p-7 md:p-8">
            <PolicyBlock id="intro" title="Introduction">
              {company} “we”, “our”, “us” provides a privacy-first matchmaking
              platform designed for individuals and families in Bangladesh and
              abroad. This policy covers our website, apps, and related services
              the “Services”.
            </PolicyBlock>

            <PolicyBlock id="data-we-collect" title="Data We Collect">
              <ul className="list-inside list-disc space-y-1">
                <li>
                  Account & profile: name, photo, DOB, gender, education,
                  profession, and preferences.
                </li>
                <li>
                  Verification: phone/email, optional NID/passport, selfie or ID
                  image for fraud prevention.
                </li>
                <li>
                  Usage: device info, IP, analytics, page interactions, and
                  feature engagement.
                </li>
                <li>
                  Communications: support inquiries, feedback, report, and
                  appeal content.
                </li>
              </ul>
            </PolicyBlock>

            <PolicyBlock id="how-we-use" title="How We Use Your Data">
              <ul className="list-inside list-disc space-y-1">
                <li>To create and maintain your account and profile.</li>
                <li>To perform verification, safety, and moderation.</li>
                <li>To recommend matches and improve discovery quality.</li>
                <li>To communicate updates, security alerts, and support.</li>
                <li>
                  To comply with applicable laws and prevent harmful conduct.
                </li>
              </ul>
            </PolicyBlock>

            <PolicyBlock id="legal-basis" title="Legal Basis">
              <p>
                We process your data based on consent, contract performance,
                legitimate interests such as safety and fraud prevention, and
                legal obligations as applicable.
              </p>
            </PolicyBlock>

            <PolicyBlock id="sharing" title="Sharing & Disclosure">
              <ul className="list-inside list-disc space-y-1">
                <li>
                  With vendors such as hosting, analytics, and verification
                  providers under strict confidentiality.
                </li>
                <li>
                  With authorities if required by law or to protect rights,
                  safety, and security.
                </li>
                <li>
                  With other users according to your privacy settings, such as
                  photos visible only to verified users.
                </li>
              </ul>
            </PolicyBlock>

            <PolicyBlock id="security" title="Security & Retention">
              <p>
                We use encryption in transit, access controls, and periodic
                reviews. Retention is limited to the period needed for the
                purposes described or as required by law. You can request
                deletion of your account; some logs may be retained for fraud
                and security reasons.
              </p>
            </PolicyBlock>

            <PolicyBlock id="your-rights" title="Your Rights">
              <ul className="list-inside list-disc space-y-1">
                <li>Access, correction, deletion, and export of your data.</li>
                <li>Withdraw consent where applicable, such as marketing.</li>
                <li>Control visibility through privacy settings.</li>
                <li>File a complaint with a relevant authority.</li>
              </ul>
            </PolicyBlock>

            <PolicyBlock id="cookies" title="Cookies & Tracking">
              <p>
                We use cookies and similar technologies for sign-in,
                preferences, and analytics. You can modify browser settings to
                manage cookies; some features may not function without essential
                cookies.
              </p>
            </PolicyBlock>

            <PolicyBlock id="international" title="International Transfers">
              <p>
                Your information may be processed outside Bangladesh. We
                implement safeguards such as contractual clauses to protect your
                data where required.
              </p>
            </PolicyBlock>

            <PolicyBlock id="children" title="Children’s Privacy">
              <p>
                Our Services are not intended for individuals under 18. If you
                believe a minor provided data, contact us to remove it.
              </p>
            </PolicyBlock>

            <PolicyBlock id="updates" title="Updates to this Policy">
              <p>
                We may update this policy periodically. Material changes will be
                communicated in-app or by email. Continued use of the Services
                after notice signifies acceptance.
              </p>
            </PolicyBlock>

            <PolicyBlock id="contact" title="Contact Us">
              <p>
                Questions or requests? Email{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-semibold text-rose-600 underline-offset-4 hover:text-rose-700 hover:underline"
                >
                  {contactEmail}
                </a>
                .
              </p>
            </PolicyBlock>
          </main>
        </div>
      </section>
    </div>
  );
}

function QuickPrivacyCard({ icon, title, sub }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-100 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600">
        {icon}
      </div>

      <h3 className="mt-3 font-bold text-slate-900">{title}</h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">{sub}</p>
    </div>
  );
}

function PolicyBlock({ id, title, children }) {
  return (
    <section
      id={id}
      className="mb-5 scroll-mt-28 rounded-2xl border border-slate-100 bg-[#fffaf7] p-5 transition hover:border-rose-100 md:p-6"
    >
      <h2 className="text-xl font-bold text-slate-900 md:text-2xl">
        {title}
      </h2>

      <div className="mt-3 text-sm leading-7 text-slate-600 md:text-base">
        {children}
      </div>
    </section>
  );
}