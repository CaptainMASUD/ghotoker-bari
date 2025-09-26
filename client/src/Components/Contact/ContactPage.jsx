import React, { useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaComments,
  FaPaperclip,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaStar,
  FaChevronDown,
  FaCheckCircle,
  FaPaperPlane,
  FaCalendarAlt,
} from "react-icons/fa";

/** Premium Contact Us Page (brand gradient)
 * - Deep background, glass cards
 * - Quick contact cards
 * - Contact form with validation + success toast
 * - Sidebar with promise, hours, address (map), social proof
 */
export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    channel: "Email",
    message: "",
    consent: false,
    file: null,
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const topics = [
    "Profile verification",
    "Premium membership",
    "Matchmaking & concierge",
    "Report an issue",
    "Partnerships",
    "Other",
  ];
  const channels = ["Email", "Phone", "WhatsApp"];

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = "Your name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email.";
    if (form.phone && !/^[0-9+()\-.\s]{7,}$/.test(form.phone)) e.phone = "Enter a valid phone.";
    if (!form.topic) e.topic = "Please pick a topic.";
    if (!form.message.trim() || form.message.trim().length < 10)
      e.message = "Tell us a bit more (min 10 chars).";
    if (!form.consent) e.consent = "Please accept our privacy policy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSent(true);
    setTimeout(() => setSent(false), 3500);
    setForm({
      name: "",
      email: "",
      phone: "",
      topic: "",
      channel: "Email",
      message: "",
      consent: false,
      file: null,
    });
  }

  return (
    <div className="min-h-screen bg-[#0b0a12] text-white">
      {/* Hero */}
      <section
        className="relative py-16"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 50% 0%, rgba(244,114,182,0.10), transparent 60%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <FaShieldAlt className="text-rose-300" /> Secure & private support
            </div>
            <h1 className="mt-3 text-3xl md:text-5xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
                Contact Us
              </span>
            </h1>
            <p className="mt-3 text-white/75 max-w-2xl mx-auto">
              Our advisors respond fast. Verified help for premium members, 7 days a week.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
              <FaClock /> Typical response:{" "}
              <span className="text-rose-300 font-semibold">under 2 hours</span>
            </div>
          </div>

          {/* Quick Contact */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickCard icon={<FaEnvelope />} title="Email us" sub="support@example.com" />
            <QuickCard icon={<FaPhoneAlt />} title="Call us" sub="+880 1234-567890" />
            <QuickCard icon={<FaWhatsapp />} title="WhatsApp" sub="+880 1234-567890" />
            <QuickCard icon={<FaComments />} title="Live chat" sub="Available 9am–10pm" />
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
            <h2 className="text-2xl font-bold">Send us a message</h2>
            <p className="text-white/70 mt-1">
              Fill out the form — we’ll get back to you shortly.
            </p>

            <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="Full name"
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  error={errors.name}
                />
                <Field
                  label="Email"
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  error={errors.email}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field
                  label="Phone (optional)"
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                  error={errors.phone}
                />
                <SelectField
                  label="Topic"
                  id="topic"
                  value={form.topic}
                  onChange={(v) => setForm((f) => ({ ...f, topic: v }))}
                  options={["", ...topics]}
                  error={errors.topic}
                />
              </div>

              <SelectField
                label="Preferred channel"
                id="channel"
                value={form.channel}
                onChange={(v) => setForm((f) => ({ ...f, channel: v }))}
                options={channels}
              />

              <div>
                <label htmlFor="message" className="block text-sm text-white/80 mb-1">
                  Your message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-300/70"
                  placeholder="Tell us how we can help…"
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                />
                {errors.message && <ErrorText text={errors.message} />}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Attachment */}
                <label className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 cursor-pointer hover:bg-white/10 transition">
                  <FaPaperclip className="text-rose-300" />
                  <span className="text-sm">
                    {form.file ? form.file.name : "Attach file (optional)"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setForm((f) => ({ ...f, file: file || null }));
                    }}
                  />
                </label>

                {/* Consent */}
                <label className="inline-flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    className="accent-rose-300 h-4 w-4 cursor-pointer"
                    checked={form.consent}
                    onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                  />
                  I agree to the{" "}
                  <a className="text-rose-300 underline-offset-4 hover:underline" href="#">
                    privacy policy
                  </a>
                  .
                </label>
              </div>
              {errors.consent && <ErrorText text={errors.consent} />}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-neutral-900
                             bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                             hover:shadow-md shadow-rose-900/20 transition cursor-pointer"
                >
                  <FaPaperPlane /> Send message
                </button>
                <a
                  href="#book"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 hover:bg-white/10 transition cursor-pointer"
                >
                  <FaCalendarAlt className="text-rose-300" /> Book a free consultation
                </a>
              </div>
            </form>

            {/* Success toast */}
            {sent && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-emerald-200">
                <FaCheckCircle /> Message sent! We’ll reply shortly.
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <InfoCard
              title="Our promise"
              icon={<FaShieldAlt />}
              lines={[
                "Dedicated premium support",
                "Private & secure handling",
                "Tailored guidance for members",
              ]}
              foot={
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-white/70">
                  <FaStar className="text-rose-300" /> 4.9/5 satisfaction (last 90 days)
                </div>
              }
            />

            <InfoCard
              title="Business hours"
              icon={<FaClock />}
              lines={[
                "Sat–Thu: 9:00 – 22:00",
                "Friday: 10:00 – 18:00",
                "Priority after-hours for Premium",
              ]}
            />

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="flex items-center gap-2 text-white/90">
                <FaMapMarkerAlt className="text-rose-300" />
                <h3 className="font-semibold">Visit us</h3>
              </div>
              <p className="text-sm text-white/70 mt-2">
                House 12, Road 8, Gulshan 1, Dhaka 1212
              </p>
              <div className="mt-3 h-40 w-full overflow-hidden rounded-xl border border-white/10">
                {/* Replace with real map embed */}
                <iframe
                  title="Map"
                  src="https://maps.google.com/maps?q=Gulshan%201%20Dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full"
                />
              </div>
            </div>
          </aside>
        </div>

        {/* FAQ */}
        <div className="mt-14 rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
          <h3 className="text-xl font-bold">FAQs</h3>
          <div className="mt-4 divide-y divide-white/10">
            {[
              {
                q: "How fast will you respond?",
                a: "We typically reply within 2 hours during working hours. Premium members are prioritized.",
              },
              {
                q: "Can you help verify my profile?",
                a: "Yes. Share your details via the form or book a call — our team will guide you through ID & photo verification.",
              },
              {
                q: "How do I upgrade to Premium?",
                a: "Choose a plan on the Membership page or contact us here. We’ll activate benefits and concierge onboarding.",
              },
              {
                q: "Do you offer private matchmaking?",
                a: "Our Elite tier includes a dedicated matchmaker, handpicked introductions, and family-assisted onboarding.",
              },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.q}</span>
                  <FaChevronDown
                    className={`transition ${openFaq === i ? "rotate-180 text-rose-300" : "text-white/70"}`}
                  />
                </div>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    openFaq === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-70"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-white/75 pt-2">{item.a}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div id="book" className="mt-12 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 font-semibold text-neutral-900
                       bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                       hover:shadow-md shadow-rose-900/20 transition cursor-pointer"
          >
            <FaCalendarAlt /> Schedule a free consultation
          </a>
          <p className="mt-2 text-sm text-white/70">
            We’ll confirm by email or WhatsApp — whatever you prefer.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ----------------------- Small UI pieces ----------------------- */

function QuickCard({ icon, title, sub }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 hover:border-rose-300/60 transition">
      <div className="text-rose-300 text-xl">{icon}</div>
      <div className="mt-2 font-semibold">{title}</div>
      <div className="text-sm text-white/70">{sub}</div>
    </div>
  );
}

function InfoCard({ title, icon, lines = [], foot = null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <div className="flex items-center gap-2 text-white/90">
        <span className="text-rose-300">{icon}</span>
        <h3 className="font-semibold">{title}</h3>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-white/70 list-disc list-inside">
        {lines.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
      {foot}
    </div>
  );
}

function Field({ label, id, type = "text", value, onChange, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-white/80 mb-1">{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-4 py-3 bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-rose-300/70
          ${error ? "border-red-400/60" : "border-white/15"}`}
        placeholder={label}
      />
      {error && <ErrorText text={error} />}
    </div>
  );
}

function SelectField({ label, id, value, onChange, options = [], error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm text-white/80 mb-1">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-4 py-3 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-rose-300/70
          ${error ? "border-red-400/60" : "border-white/15"}`}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt} className="bg-[#0b0a12]">
            {opt || "Select…"}
          </option>
        ))}
      </select>
      {error && <ErrorText text={error} />}
    </div>
  );
}

function ErrorText({ text }) {
  return <p className="mt-1 text-xs text-red-300">{text}</p>;
}
