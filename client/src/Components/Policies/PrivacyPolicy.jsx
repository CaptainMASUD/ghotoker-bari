import React, { useEffect } from "react";

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
  // Smooth scroll for in-page TOC
  useEffect(() => {
    const links = document.querySelectorAll('a[href^="#"]');
    const onClick = (e) => {
      const href = e.currentTarget.getAttribute("href");
      if (href?.startsWith("#")) {
        e.preventDefault();
        const el = document.querySelector(href);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    links.forEach((a) => a.addEventListener("click", onClick));
    return () => links.forEach((a) => a.removeEventListener("click", onClick));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0a12] text-white">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl opacity-25 bg-fuchsia-500/25" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full blur-3xl opacity-20 bg-rose-500/20" />
      </div>

      {/* Header */}
      <header className="relative pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Trust & Safety
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="mt-2 text-white/70">
            Last updated: {lastUpdated}. This policy explains how {company} collects, uses, and protects your
            information when you use our services.
          </p>
        </div>
      </header>

      {/* Frame */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl p-[1px] bg-gradient-to-r from-fuchsia-300/35 via-pink-300/35 to-rose-300/35">
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-10">
              <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* TOC */}
                <aside className="lg:sticky lg:top-24 h-fit">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-white/85 mb-2">On this page</p>
                    <nav className="space-y-1 text-sm">
                      {sections.map((s) => (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          className="block rounded-lg px-3 py-2 text-white/80 hover:text-rose-200 hover:bg-white/10 transition"
                        >
                          {s.title}
                        </a>
                      ))}
                    </nav>
                  </div>
                </aside>

                {/* Content */}
                <main className="min-w-0">
                  <PolicyBlock id="intro" title="Introduction">
                    {company} (“we”, “our”, “us”) provides a privacy-first matchmaking platform designed for
                    individuals and families in Bangladesh and abroad. This policy covers our website, apps, and related
                    services (the “Services”).
                  </PolicyBlock>

                  <PolicyBlock id="data-we-collect" title="Data We Collect">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Account & profile: name, photo, DOB, gender, education, profession, preferences.</li>
                      <li>Verification: phone/email, optional NID/passport, selfie/ID image (for fraud prevention).</li>
                      <li>Usage: device info, IP, analytics, page interactions, feature engagement.</li>
                      <li>Communications: support inquiries, feedback, report/appeal content.</li>
                    </ul>
                  </PolicyBlock>

                  <PolicyBlock id="how-we-use" title="How We Use Your Data">
                    <ul className="list-disc list-inside space-y-1">
                      <li>To create and maintain your account and profile visibility.</li>
                      <li>To perform verification, safety, and moderation.</li>
                      <li>To recommend matches and improve discovery quality.</li>
                      <li>To communicate updates, security alerts, and support.</li>
                      <li>To comply with applicable laws and prevent harmful conduct.</li>
                    </ul>
                  </PolicyBlock>

                  <PolicyBlock id="legal-basis" title="Legal Basis">
                    <p>
                      We process your data based on consent, contract performance, legitimate interests (e.g., safety and
                      fraud prevention), and legal obligations as applicable.
                    </p>
                  </PolicyBlock>

                  <PolicyBlock id="sharing" title="Sharing & Disclosure">
                    <ul className="list-disc list-inside space-y-1">
                      <li>With vendors (e.g., hosting, analytics, verification) under strict confidentiality.</li>
                      <li>With authorities if required by law or to protect rights, safety, and security.</li>
                      <li>With other users per your privacy settings (e.g., photos visible only to verified users).</li>
                    </ul>
                  </PolicyBlock>

                  <PolicyBlock id="security" title="Security & Retention">
                    <p>
                      We use encryption in transit, access controls, and periodic reviews. Retention is limited to the
                      period needed for the purposes described or as required by law. You can request deletion of your
                      account; some logs may be retained for fraud/security.
                    </p>
                  </PolicyBlock>

                  <PolicyBlock id="your-rights" title="Your Rights">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Access, correction, deletion, and export of your data.</li>
                      <li>Withdraw consent where applicable (e.g., marketing).</li>
                      <li>Control visibility via privacy settings.</li>
                      <li>File a complaint with a relevant authority.</li>
                    </ul>
                  </PolicyBlock>

                  <PolicyBlock id="cookies" title="Cookies & Tracking">
                    <p>
                      We use cookies and similar technologies for sign-in, preferences, and analytics. You can modify
                      browser settings to manage cookies; some features may not function without essential cookies.
                    </p>
                  </PolicyBlock>

                  <PolicyBlock id="international" title="International Transfers">
                    <p>
                      Your information may be processed outside Bangladesh. We implement safeguards (e.g., contractual
                      clauses) to protect your data where required.
                    </p>
                  </PolicyBlock>

                  <PolicyBlock id="children" title="Children’s Privacy">
                    <p>
                      Our Services are not intended for individuals under 18. If you believe a minor provided data,
                      contact us to remove it.
                    </p>
                  </PolicyBlock>

                  <PolicyBlock id="updates" title="Updates to this Policy">
                    <p>
                      We may update this policy periodically. Material changes will be communicated in-app or by email.
                      Continued use of the Services after notice signifies acceptance.
                    </p>
                  </PolicyBlock>

                  <PolicyBlock id="contact" title="Contact Us">
                    <p>
                      Questions or requests? Email{" "}
                      <a href={`mailto:${contactEmail}`} className="text-rose-300 underline-offset-4 hover:underline">
                        {contactEmail}
                      </a>
                      .
                    </p>
                  </PolicyBlock>
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PolicyBlock({ id, title, children }) {
  return (
    <section id={id} className="rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 mb-6">
      <h2 className="text-xl md:text-2xl font-bold">
        <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
          {title}
        </span>
      </h2>
      <div className="mt-3 text-white/85 leading-relaxed">{children}</div>
    </section>
  );
}
