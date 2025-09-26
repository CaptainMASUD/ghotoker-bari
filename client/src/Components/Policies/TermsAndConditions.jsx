import React, { useEffect } from "react";

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
            Legal & Agreements
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              Terms & Conditions
            </span>
          </h1>
          <p className="mt-2 text-white/70">Last updated: {lastUpdated}</p>
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
                  <TermsBlock id="acceptance" title="Acceptance of Terms">
                    By accessing or using the services provided by {company} (the “Service”), you agree to be bound by
                    these Terms. If you do not agree, do not use the Service.
                  </TermsBlock>

                  <TermsBlock id="eligibility" title="Eligibility & Accounts">
                    <ul className="list-disc list-inside space-y-1">
                      <li>You must be at least 18 years old to use the Service.</li>
                      <li>Provide accurate information and maintain account security.</li>
                      <li>We may request verification (e.g., phone, email, optional NID/passport).</li>
                    </ul>
                  </TermsBlock>

                  <TermsBlock id="use-of-service" title="Use of the Service">
                    <p>
                      The Service is for lawful, personal matchmaking purposes only. You may not impersonate others,
                      harass users, or engage in fraudulent or harmful activities. We reserve the right to moderate and
                      remove content for safety.
                    </p>
                  </TermsBlock>

                  <TermsBlock id="payments" title="Payments & Subscriptions">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Premium plans are billed in BDT; taxes may apply.</li>
                      <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
                      <li>Refunds are governed by our refund policy (where applicable by law).</li>
                    </ul>
                  </TermsBlock>

                  <TermsBlock id="content" title="Content & Intellectual Property">
                    <p>
                      You retain ownership of content you upload but grant {company} a license to host and display it to
                      provide the Service. Our trademarks, logos, and UI are protected. Do not copy, scrape, or reverse
                      engineer the Service.
                    </p>
                  </TermsBlock>

                  <TermsBlock id="conduct" title="User Conduct & Safety">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Be respectful and truthful. No scams, hate, or explicit/abusive content.</li>
                      <li>Report concerns using in-app tools or via support.</li>
                      <li>We may suspend accounts for violations to protect the community.</li>
                    </ul>
                  </TermsBlock>

                  <TermsBlock id="termination" title="Suspension & Termination">
                    <p>
                      We may suspend or terminate access for violating these Terms or for safety, fraud, or legal
                      reasons. You may delete your account at any time via settings.
                    </p>
                  </TermsBlock>

                  <TermsBlock id="disclaimers" title="Disclaimers">
                    <p>
                      The Service is provided “as is” and “as available.” We do not guarantee specific outcomes or the
                      behavior of any user. Availability may vary due to maintenance or network conditions.
                    </p>
                  </TermsBlock>

                  <TermsBlock id="liability" title="Limitation of Liability">
                    <p>
                      To the maximum extent permitted by law, {company} is not liable for indirect, incidental, or
                      consequential damages arising from your use of the Service.
                    </p>
                  </TermsBlock>

                  <TermsBlock id="governing-law" title="Governing Law">
                    <p>
                      These Terms are governed by the laws of Bangladesh. Disputes shall be subject to the exclusive
                      jurisdiction of the courts of Dhaka, Bangladesh.
                    </p>
                  </TermsBlock>

                  <TermsBlock id="changes" title="Changes to Terms">
                    <p>
                      We may update these Terms from time to time. Changes take effect when posted. Material updates
                      will be notified in-app or via email.
                    </p>
                  </TermsBlock>

                  <TermsBlock id="contact" title="Contact">
                    <p>
                      For legal inquiries, email{" "}
                      <a href={`mailto:${contactEmail}`} className="text-rose-300 underline-offset-4 hover:underline">
                        {contactEmail}
                      </a>
                      .
                    </p>
                  </TermsBlock>
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TermsBlock({ id, title, children }) {
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
