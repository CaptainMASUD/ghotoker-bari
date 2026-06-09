import React, { useState } from "react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaComments,
  FaMapMarkerAlt,
  FaClock,
  FaShieldAlt,
  FaStar,
  FaChevronDown,
  FaCheckCircle,
  FaPaperPlane,
  FaCalendarAlt,
} from "react-icons/fa";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    topic: "",
    channel: "Email",
    message: "",
    consent: false,
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

    if (form.phone && !/^[0-9+()\-.\s]{7,}$/.test(form.phone)) {
      e.phone = "Enter a valid phone.";
    }

    if (!form.topic) e.topic = "Please pick a topic.";

    if (!form.message.trim() || form.message.trim().length < 10) {
      e.message = "Tell us a bit more. Minimum 10 characters.";
    }

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
    });
  }

  return (
    <div className="min-h-screen bg-[#f8f3ef] pt-[60px] text-slate-800">
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-orange-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mt-0 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              Contact Us
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Need help with profile verification, membership, matchmaking, or
              account support? Send us a message and our team will respond as
              soon as possible.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <FaClock className="text-rose-600" />
              Typical response:
              <span className="text-rose-600">under 2 hours</span>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickCard
              icon={<FaEnvelope />}
              title="Email us"
              sub="support@example.com"
            />

            <QuickCard
              icon={<FaPhoneAlt />}
              title="Call us"
              sub="+880 1234-567890"
            />

            <QuickCard
              icon={<FaWhatsapp />}
              title="WhatsApp"
              sub="+880 1234-567890"
            />

            <QuickCard
              icon={<FaComments />}
              title="Live chat"
              sub="Available 9am–10pm"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-rose-100/50 sm:p-7 md:p-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Send us a message
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Fill out the form below. We’ll get back to you shortly.
              </p>
            </div>

            <form className="mt-7 space-y-5" onSubmit={onSubmit} noValidate>
              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Full name"
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  error={errors.name}
                />

                <Field
                  label="Email address"
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                  error={errors.email}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field
                  label="Phone optional"
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
                <label
                  htmlFor="message"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Your message
                  <span className="ml-1 text-rose-600">*</span>
                </label>

                <textarea
                  id="message"
                  rows={5}
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
                    errors.message
                      ? "border-rose-400 bg-rose-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                />

                {errors.message ? <ErrorText text={errors.message} /> : null}
              </div>

              <div>
                <label className="inline-flex items-start gap-2 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    checked={form.consent}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, consent: e.target.checked }))
                    }
                  />

                  <span>
                    I agree to the{" "}
                    <a
                      href="#"
                      className="font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      privacy policy
                    </a>
                    .
                  </span>
                </label>

                {errors.consent ? <ErrorText text={errors.consent} /> : null}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md"
                >
                  <FaPaperPlane />
                  Send message
                </button>

                <a
                  href="#book"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                >
                  <FaCalendarAlt className="text-rose-600" />
                  Book consultation
                </a>
              </div>
            </form>

            {sent ? (
              <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <FaCheckCircle />
                Message sent! We’ll reply shortly.
              </div>
            ) : null}
          </div>

          <aside className="space-y-5">
            <InfoCard
              title="Our promise"
              icon={<FaShieldAlt />}
              lines={[
                "Dedicated member support",
                "Private & secure handling",
                "Helpful guidance from our team",
              ]}
              foot={
                <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                  <FaStar className="text-rose-500" />
                  4.9/5 satisfaction from members
                </div>
              }
            />

            <InfoCard
              title="Business hours"
              icon={<FaClock />}
              lines={[
                "Sat–Thu: 9:00 – 22:00",
                "Friday: 10:00 – 18:00",
                "Priority support for premium members",
              ]}
            />

            <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <FaMapMarkerAlt />
                </span>

                <h3 className="font-bold">Visit us</h3>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                House 12, Road 8, Gulshan 1, Dhaka 1212
              </p>

              <div className="mt-4 h-44 w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <iframe
                  title="Map"
                  src="https://maps.google.com/maps?q=Gulshan%201%20Dhaka&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  className="h-full w-full"
                />
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-14 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm sm:p-7 md:p-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-2xl font-bold text-slate-900">FAQs</h3>

              <p className="mt-1 text-sm text-slate-500">
                Common questions about support and membership.
              </p>
            </div>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {[
              {
                q: "How fast will you respond?",
                a: "We typically reply within 2 hours during working hours. Premium members are prioritized.",
              },
              {
                q: "Can you help verify my profile?",
                a: "Yes. Share your details through the form or book a call. Our team will guide you through profile and photo verification.",
              },
              {
                q: "How do I upgrade to Premium?",
                a: "Choose a plan on the Membership page or contact us here. We’ll help you activate your benefits.",
              },
              {
                q: "Do you offer private matchmaking?",
                a: "Yes. Premium matchmaking support can include guided profile review, handpicked suggestions, and consultation support.",
              },
            ].map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full py-4 text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-slate-800">
                    {item.q}
                  </span>

                  <FaChevronDown
                    className={`shrink-0 text-sm transition ${
                      openFaq === i
                        ? "rotate-180 text-rose-600"
                        : "text-slate-400"
                    }`}
                  />
                </div>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    openFaq === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-70"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pt-2 text-sm leading-6 text-slate-500">
                      {item.a}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div
          id="book"
          className="mt-12 rounded-[2rem] border border-rose-100 bg-white p-8 text-center shadow-xl shadow-rose-100/50"
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
            <FaCalendarAlt className="text-xl" />
          </div>

          <h3 className="mt-4 text-2xl font-bold text-slate-900">
            Need direct support?
          </h3>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Schedule a free consultation and our team will confirm by email,
            phone, or WhatsApp.
          </p>

          <a
            href="#"
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-7 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md"
          >
            <FaCalendarAlt />
            Schedule a free consultation
          </a>
        </div>
      </section>
    </div>
  );
}

function QuickCard({ icon, title, sub }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-100 hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600">
        {icon}
      </div>

      <h3 className="mt-3 font-bold text-slate-900">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

function InfoCard({ title, icon, lines = [], foot = null }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          {icon}
        </span>

        <h3 className="font-bold">{title}</h3>
      </div>

      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2">
            <FaCheckCircle className="mt-1 shrink-0 text-rose-500" />
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {foot}
    </div>
  );
}

function Field({ label, id, type = "text", value, onChange, error }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
        {id !== "phone" ? <span className="ml-1 text-rose-600">*</span> : null}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
          error
            ? "border-rose-400 bg-rose-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
        placeholder={label}
      />

      {error ? <ErrorText text={error} /> : null}
    </div>
  );
}

function SelectField({ label, id, value, onChange, options = [], error }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-semibold text-slate-700"
      >
        {label}
        <span className="ml-1 text-rose-600">*</span>
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
          error
            ? "border-rose-400 bg-rose-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
      >
        {options.map((opt, i) => (
          <option key={i} value={opt}>
            {opt || "Select..."}
          </option>
        ))}
      </select>

      {error ? <ErrorText text={error} /> : null}
    </div>
  );
}

function ErrorText({ text }) {
  return <p className="mt-1.5 text-xs font-medium text-rose-600">{text}</p>;
}