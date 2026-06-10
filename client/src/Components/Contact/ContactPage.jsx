import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  FaTimes,
  FaSpinner,
  FaHeart,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const staggerWrap = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardMotion = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

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
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const topics = useMemo(
    () => [
      "Profile verification",
      "Premium membership",
      "Matchmaking & concierge",
      "Report an issue",
      "Partnerships",
      "Other",
    ],
    []
  );

  const channels = useMemo(() => ["Email", "Phone", "WhatsApp"], []);

  function validate() {
    const e = {};

    if (!form.name.trim()) {
      e.name = "Your name is required.";
    } else if (form.name.trim().length < 2) {
      e.name = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      e.email = "Email address is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      e.email = "Enter a valid email address.";
    }

    if (form.phone && !/^[0-9+()\-.\s]{7,30}$/.test(form.phone.trim())) {
      e.phone = "Enter a valid phone number.";
    }

    if (!form.topic) {
      e.topic = "Please select a topic.";
    }

    if (!form.channel) {
      e.channel = "Please select your preferred channel.";
    }

    if (!form.message.trim()) {
      e.message = "Message is required.";
    } else if (form.message.trim().length < 10) {
      e.message = "Message must be at least 10 characters.";
    } else if (form.message.trim().length > 3000) {
      e.message = "Message cannot be more than 3000 characters.";
    }

    if (!form.consent) {
      e.consent = "Please accept the privacy policy.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        topic: form.topic,
        channel: form.channel,
        message: form.message.trim(),
        consent: form.consent,
      };

      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.errors && typeof data.errors === "object") {
          setErrors(data.errors);
        }

        setServerError(
          data.message || "Failed to send your message. Please try again."
        );
        return;
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        topic: "",
        channel: "Email",
        message: "",
        consent: false,
      });

      setErrors({});
      setSuccessModal(true);
    } catch (error) {
      console.error("Contact submit error:", error);
      setServerError(
        "Server connection failed. Please check your internet or try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f3ef] pt-[60px] text-slate-800">
      <section className="relative overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-rose-200/30 blur-3xl"
        />

        <motion.div
          animate={{ y: [0, 18, 0], x: [0, -12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-orange-100/70 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mt-0 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-[56px] md:leading-[1.03]">
              Contact Us
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              Need help with profile verification, premium membership,
              matchmaking, or account support? Send us your message and our team
              will review it carefully.
            </p>

            <motion.div
              whileHover={{ y: -2, scale: 1.01 }}
              className="mt-5 inline-flex cursor-default items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm"
            >
              <FaClock className="text-rose-600" />
              Support available:
              <span className="font-bold text-rose-600">
                Sat–Thu, 9 AM–10 PM
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            animate="visible"
            className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <QuickCard
              icon={<FaEnvelope />}
              title="Email support"
              sub="support@example.com"
            />

            <QuickCard
              icon={<FaPhoneAlt />}
              title="Phone support"
              sub="+880 1234-567890"
            />

            <QuickCard
              icon={<FaWhatsapp />}
              title="WhatsApp"
              sub="+880 1234-567890"
            />

            <QuickCard
              icon={<FaComments />}
              title="Member help"
              sub="Verification, plans, reports"
            />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-xl shadow-rose-100/50 sm:p-7"
          >
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-950 sm:text-[28px]">
                  Send us a message
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Fill out the form below. Your message will be saved for admin
                  review.
                </p>
              </div>

              <motion.div
                whileHover={{ scale: 1.03 }}
                className="inline-flex w-fit cursor-default items-center gap-2 rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
              >
                <FaCheckCircle />
                Secure contact form
              </motion.div>
            </div>

            <AnimatePresence>
              {serverError ? (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
                >
                  {serverError}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <form className="mt-6 space-y-5" onSubmit={onSubmit} noValidate>
              <motion.div
                variants={staggerWrap}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid gap-4 md:grid-cols-2"
              >
                <motion.div variants={cardMotion}>
                  <Field
                    label="Full name"
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, name: v }));
                      clearFieldError("name", setErrors);
                    }}
                    error={errors.name}
                  />
                </motion.div>

                <motion.div variants={cardMotion}>
                  <Field
                    label="Email address"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, email: v }));
                      clearFieldError("email", setErrors);
                    }}
                    error={errors.email}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                variants={staggerWrap}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid gap-4 md:grid-cols-2"
              >
                <motion.div variants={cardMotion}>
                  <Field
                    label="Phone optional"
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, phone: v }));
                      clearFieldError("phone", setErrors);
                    }}
                    error={errors.phone}
                  />
                </motion.div>

                <motion.div variants={cardMotion}>
                  <SelectField
                    label="Topic"
                    id="topic"
                    value={form.topic}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, topic: v }));
                      clearFieldError("topic", setErrors);
                    }}
                    options={["", ...topics]}
                    error={errors.topic}
                  />
                </motion.div>
              </motion.div>

              <motion.div
                variants={cardMotion}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <SelectField
                  label="Preferred channel"
                  id="channel"
                  value={form.channel}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, channel: v }));
                    clearFieldError("channel", setErrors);
                  }}
                  options={channels}
                  error={errors.channel}
                />
              </motion.div>

              <motion.div
                variants={cardMotion}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <label
                  htmlFor="message"
                  className="mb-1.5 block cursor-pointer text-sm font-semibold text-slate-700"
                >
                  Your message
                  <span className="ml-1 text-rose-600">*</span>
                </label>

                <textarea
                  id="message"
                  rows={5}
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition duration-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
                    errors.message
                      ? "border-rose-400 bg-rose-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  placeholder="Tell us how we can help..."
                  value={form.message}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, message: e.target.value }));
                    clearFieldError("message", setErrors);
                  }}
                />

                <div className="mt-1.5 flex items-center justify-between gap-3">
                  <AnimatePresence mode="wait">
                    {errors.message ? (
                      <motion.div
                        key="message-error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                      >
                        <ErrorText text={errors.message} />
                      </motion.div>
                    ) : (
                      <motion.span
                        key="message-help"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-slate-400"
                      >
                        Minimum 10 characters
                      </motion.span>
                    )}
                  </AnimatePresence>

                  <span
                    className={`text-xs font-medium ${
                      form.message.length > 3000
                        ? "text-rose-600"
                        : "text-slate-400"
                    }`}
                  >
                    {form.message.length}/3000
                  </span>
                </div>
              </motion.div>

              <motion.div
                variants={cardMotion}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <label className="inline-flex cursor-pointer items-start gap-2 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 cursor-pointer rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    checked={form.consent}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, consent: e.target.checked }));
                      clearFieldError("consent", setErrors);
                    }}
                  />

                  <span>
                    I agree to the{" "}
                    <a
                      href="/privacy-policy"
                      className="cursor-pointer font-semibold text-rose-600 transition hover:text-rose-700 hover:underline"
                    >
                      privacy policy
                    </a>
                    .
                  </span>
                </label>

                <AnimatePresence>
                  {errors.consent ? (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      <ErrorText text={errors.consent} />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>

              <motion.div
                variants={cardMotion}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-wrap items-center gap-3 pt-1"
              >
                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={!submitting ? { y: -2, scale: 1.01 } : {}}
                  whileTap={!submitting ? { scale: 0.97 } : {}}
                  className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:bg-rose-600"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send message
                    </>
                  )}
                </motion.button>

                <p className="text-xs leading-5 text-slate-500">
                  Your message will be visible only to the admin team.
                </p>
              </motion.div>
            </form>
          </motion.div>

          <motion.aside
            variants={staggerWrap}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-5"
          >
            <InfoCard
              title="Our promise"
              icon={<FaShieldAlt />}
              lines={[
                "Dedicated member support",
                "Private message handling",
                "Helpful guidance from our team",
              ]}
              foot={
                <div className="mt-3 inline-flex cursor-default items-center gap-1 text-xs font-normal text-slate-500">
                  <FaStar className="text-rose-500" />
                  Trusted support for serious members
                </div>
              }
            />

            <InfoCard
              title="Business hours"
              icon={<FaClock />}
              lines={[
                "Sat–Thu: 9:00 – 22:00",
                "Friday: 10:00 – 18:00",
                "Premium members get priority support",
              ]}
            />

            <motion.div
              variants={cardMotion}
              whileHover={{ y: -4 }}
              className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-rose-100/50"
            >
              <div className="flex items-center gap-2 text-slate-900">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <FaMapMarkerAlt />
                </span>

                <h3 className="text-base font-bold">Visit us</h3>
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
            </motion.div>
          </motion.aside>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm sm:p-7"
        >
          <div>
            <h3 className="text-2xl font-bold text-slate-950 sm:text-[28px]">
              FAQs
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Common questions about support and membership.
            </p>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {[
              {
                q: "How fast will you respond?",
                a: "Our support team reviews contact messages during working hours. Premium member requests may be prioritized.",
              },
              {
                q: "Can you help verify my profile?",
                a: "Yes. Send your details through the form and our team will guide you through profile, photo, and biodata verification.",
              },
              {
                q: "How do I upgrade to Premium?",
                a: "Choose a plan on the Membership page or contact us here. The support team can guide you through the process.",
              },
              {
                q: "Do you offer private matchmaking?",
                a: "Yes. Premium matchmaking support can include profile review, handpicked suggestions, and guided support.",
              },
            ].map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                open={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </motion.div>
      </section>

      <SuccessModal
        open={successModal}
        onClose={() => setSuccessModal(false)}
      />
    </div>
  );
}

function clearFieldError(field, setErrors) {
  setErrors((prev) => {
    if (!prev[field]) return prev;

    const next = { ...prev };
    delete next[field];
    return next;
  });
}

function SuccessModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/80 bg-white p-6 text-center shadow-2xl shadow-slate-950/25"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none absolute -right-20 -top-20 h-44 w-44 rounded-full border border-rose-100"
            />

            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute -left-14 bottom-0 h-36 w-36 rounded-full bg-rose-100 blur-3xl"
            />

            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{ scale: 1.06, rotate: 90 }}
              whileTap={{ scale: 0.92 }}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-4 focus:ring-rose-100"
              aria-label="Close success modal"
            >
              <FaTimes />
            </motion.button>

            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 320,
                  damping: 18,
                  delay: 0.08,
                }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-emerald-50 to-rose-50 text-4xl text-emerald-600 shadow-inner"
              >
                <FaCheckCircle />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="mx-auto mt-4 inline-flex cursor-default items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
              >
                <FaHeart />
                Ghotoker Bari Support
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="mt-5 text-2xl font-bold text-slate-950"
              >
                Message sent successfully
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500"
              >
                Thank you for contacting us. Your message has been received and
                our admin team will review it.
              </motion.p>

              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34 }}
                className="mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-rose-100"
              >
                Done
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function QuickCard({ icon, title, sub }) {
  return (
    <motion.div
      variants={cardMotion}
      whileHover={{ y: -6, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      className="group cursor-default rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:border-rose-100 hover:shadow-lg hover:shadow-rose-100/50"
    >
      <motion.div
        whileHover={{ rotate: -6, scale: 1.08 }}
        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-lg text-rose-600 transition group-hover:bg-rose-600 group-hover:text-white"
      >
        {icon}
      </motion.div>

      <h3 className="mt-3 text-lg font-bold text-slate-950">{title}</h3>

      <p className="mt-1 text-sm leading-5 text-slate-500">{sub}</p>
    </motion.div>
  );
}

function InfoCard({ title, icon, lines = [], foot = null }) {
  return (
    <motion.div
      variants={cardMotion}
      whileHover={{ y: -4 }}
      className="cursor-default rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-rose-100/50"
    >
      <div className="flex items-center gap-2 text-slate-900">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          {icon}
        </span>

        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      </div>

      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-500">
        {lines.map((line, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-2"
          >
            <FaCheckCircle className="mt-1 shrink-0 text-rose-500" />
            <span>{line}</span>
          </motion.li>
        ))}
      </ul>

      {foot}
    </motion.div>
  );
}

function FAQItem({ item, open, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.995 }}
      className="w-full cursor-pointer py-4 text-left focus:outline-none"
    >
      <div className="flex items-center justify-between gap-4 rounded-xl px-1 py-1 transition hover:bg-rose-50/60">
        <span className="text-sm font-bold text-slate-900 sm:text-[15px]">
          {item.q}
        </span>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className={`${open ? "text-rose-600" : "text-slate-400"}`}
        >
          <FaChevronDown className="shrink-0 text-sm" />
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-1 pt-2 text-sm leading-6 text-slate-500">
              {item.a}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}

function Field({ label, id, type = "text", value, onChange, error }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block cursor-pointer text-sm font-semibold text-slate-700"
      >
        {label}
        {id !== "phone" ? <span className="ml-1 text-rose-600">*</span> : null}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded-xl border bg-white px-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition duration-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
          error
            ? "border-rose-400 bg-rose-50"
            : "border-slate-200 hover:border-slate-300"
        }`}
        placeholder={label}
      />

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <ErrorText text={error} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SelectField({ label, id, value, onChange, options = [], error }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block cursor-pointer text-sm font-semibold text-slate-700"
      >
        {label}
        <span className="ml-1 text-rose-600">*</span>
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full cursor-pointer rounded-xl border bg-white px-4 text-sm text-slate-800 outline-none transition duration-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
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

      <AnimatePresence>
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <ErrorText text={error} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ErrorText({ text }) {
  return <p className="mt-1.5 text-xs font-medium text-rose-600">{text}</p>;
}