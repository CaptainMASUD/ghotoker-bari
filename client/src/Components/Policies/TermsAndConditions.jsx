import React from "react";
import {
  FaBalanceScale,
  FaClock,
  FaChevronDown,
  FaEnvelope,
  FaFileContract,
  FaShieldAlt,
  FaUserCheck,
} from "react-icons/fa";

const sections = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "eligibility", title: "Eligibility & Accounts" },
  { id: "use-of-service", title: "Use of the Service" },
  { id: "payments", title: "Payments & Subscriptions" },
  { id: "content", title: "Content & Intellectual Property" },
  { id: "conduct", title: "User Conduct & Safety" },
  { id: "termination", title: "Suspension & Termination" },
  { id: "disclaimers", title: "Disclaimers" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "governing-law", title: "Governing Law" },
  { id: "changes", title: "Changes to Terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsAndConditions({
  lastUpdated = "September 26, 2025",
  company = "GhotokerBari",
  contactEmail = "legal@ghotokerbari.com",
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
              <FaFileContract className="text-rose-600" />
              Legal & Agreements
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Terms & Conditions
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Please read these terms carefully before using {company}. These
              terms explain your rights, responsibilities, and the rules for
              using our matchmaking services.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <FaClock className="text-rose-600" />
              Last updated:
              <span className="text-rose-600">{lastUpdated}</span>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickLegalCard
              icon={<FaUserCheck />}
              title="Account rules"
              sub="Eligibility, verification, and responsible use"
            />

            <QuickLegalCard
              icon={<FaShieldAlt />}
              title="Safety first"
              sub="Clear conduct rules for member protection"
            />

            <QuickLegalCard
              icon={<FaBalanceScale />}
              title="Legal clarity"
              sub="Payments, liability, and governing law"
            />

            <QuickLegalCard
              icon={<FaEnvelope />}
              title="Need help?"
              sub={contactEmail}
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
          </aside>

          <main className="min-w-0 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-rose-100/50 sm:p-7 md:p-8">
            <TermsBlock id="acceptance" title="Acceptance of Terms">
              By accessing or using the services provided by {company} the
              “Service”, you agree to be bound by these Terms. If you do not
              agree, do not use the Service.
            </TermsBlock>

            <TermsBlock id="eligibility" title="Eligibility & Accounts">
              <ul className="list-inside list-disc space-y-1">
                <li>You must be at least 18 years old to use the Service.</li>
                <li>
                  Provide accurate information and maintain account security.
                </li>
                <li>
                  We may request verification such as phone, email, optional
                  NID, or passport.
                </li>
              </ul>
            </TermsBlock>

            <TermsBlock id="use-of-service" title="Use of the Service">
              <p>
                The Service is for lawful, personal matchmaking purposes only.
                You may not impersonate others, harass users, or engage in
                fraudulent or harmful activities. We reserve the right to
                moderate and remove content for safety.
              </p>
            </TermsBlock>

            <TermsBlock id="payments" title="Payments & Subscriptions">
              <ul className="list-inside list-disc space-y-1">
                <li>Premium plans are billed in BDT; taxes may apply.</li>
                <li>
                  Subscriptions auto-renew unless cancelled before the renewal
                  date.
                </li>
                <li>
                  Refunds are governed by our refund policy where applicable by
                  law.
                </li>
              </ul>
            </TermsBlock>

            <TermsBlock
              id="content"
              title="Content & Intellectual Property"
            >
              <p>
                You retain ownership of content you upload but grant {company} a
                license to host and display it to provide the Service. Our
                trademarks, logos, and UI are protected. Do not copy, scrape, or
                reverse engineer the Service.
              </p>
            </TermsBlock>

            <TermsBlock id="conduct" title="User Conduct & Safety">
              <ul className="list-inside list-disc space-y-1">
                <li>
                  Be respectful and truthful. No scams, hate, or explicit or
                  abusive content.
                </li>
                <li>Report concerns using in-app tools or via support.</li>
                <li>
                  We may suspend accounts for violations to protect the
                  community.
                </li>
              </ul>
            </TermsBlock>

            <TermsBlock id="termination" title="Suspension & Termination">
              <p>
                We may suspend or terminate access for violating these Terms or
                for safety, fraud, or legal reasons. You may delete your account
                at any time via settings.
              </p>
            </TermsBlock>

            <TermsBlock id="disclaimers" title="Disclaimers">
              <p>
                The Service is provided “as is” and “as available.” We do not
                guarantee specific outcomes or the behavior of any user.
                Availability may vary due to maintenance or network conditions.
              </p>
            </TermsBlock>

            <TermsBlock id="liability" title="Limitation of Liability">
              <p>
                To the maximum extent permitted by law, {company} is not liable
                for indirect, incidental, or consequential damages arising from
                your use of the Service.
              </p>
            </TermsBlock>

            <TermsBlock id="governing-law" title="Governing Law">
              <p>
                These Terms are governed by the laws of Bangladesh. Disputes
                shall be subject to the exclusive jurisdiction of the courts of
                Dhaka, Bangladesh.
              </p>
            </TermsBlock>

            <TermsBlock id="changes" title="Changes to Terms">
              <p>
                We may update these Terms from time to time. Changes take effect
                when posted. Material updates will be notified in-app or via
                email.
              </p>
            </TermsBlock>

            <TermsBlock id="contact" title="Contact">
              <p>
                For legal inquiries, email{" "}
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-semibold text-rose-600 underline-offset-4 hover:text-rose-700 hover:underline"
                >
                  {contactEmail}
                </a>
                .
              </p>
            </TermsBlock>
          </main>
        </div>
      </section>
    </div>
  );
}

function QuickLegalCard({ icon, title, sub }) {
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

function TermsBlock({ id, title, children }) {
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