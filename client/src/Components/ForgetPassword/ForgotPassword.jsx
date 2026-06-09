"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  ShieldCheck,
  Heart,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  KeyRound,
  LockKeyhole,
  ArrowLeft,
} from "lucide-react";
import logo from "../../Logo/logo.svg";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function FieldLabel({ htmlFor, children }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-slate-700"
    >
      {children}
      <span className="ml-1 text-rose-600">*</span>
    </label>
  );
}

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        ) : null}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-12 w-full rounded-xl border bg-white text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
            Icon ? "pl-10" : "pl-3"
          } pr-3 ${
            error
              ? "border-rose-400 bg-rose-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        />
      </div>

      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

function MessageModal({ modal, onClose }) {
  if (!modal.open) return null;

  const isSuccess = modal.type === "success";
  const isWarning = modal.type === "warning";

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"
      >
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            isSuccess
              ? "bg-emerald-50 text-emerald-600"
              : isWarning
              ? "bg-amber-50 text-amber-600"
              : "bg-rose-50 text-rose-600"
          }`}
        >
          {isSuccess ? (
            <CheckCircle className="h-7 w-7" />
          ) : isWarning ? (
            <AlertCircle className="h-7 w-7" />
          ) : (
            <XCircle className="h-7 w-7" />
          )}
        </div>

        <h3 className="mt-4 text-center text-xl font-bold text-slate-900">
          {modal.title}
        </h3>

        <p className="mt-2 text-center text-sm leading-6 text-slate-600">
          {modal.message}
        </p>

        {modal.details ? (
          <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            {modal.details}
          </div>
        ) : null}

        <button
          type="button"
          onClick={onClose}
          className={`mt-6 h-11 w-full rounded-xl text-sm font-semibold text-white transition ${
            isSuccess
              ? "bg-emerald-600 hover:bg-emerald-700"
              : isWarning
              ? "bg-amber-600 hover:bg-amber-700"
              : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          {modal.buttonText || "Okay"}
        </button>
      </motion.div>
    </div>
  );
}

export default function ForgotPassword() {
  const [emailAddress, setEmailAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    details: "",
    buttonText: "Okay",
  });

  const updateEmail = (value) => {
    setEmailAddress(value);

    if (errors.email_address) {
      setErrors((prev) => ({ ...prev, email_address: "" }));
    }
  };

  const showModal = (payload) => {
    setModal({
      open: true,
      type: payload.type || "success",
      title: payload.title || "",
      message: payload.message || "",
      details: payload.details || "",
      buttonText: payload.buttonText || "Okay",
    });
  };

  const closeModal = () => {
    setModal((prev) => ({
      ...prev,
      open: false,
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!emailAddress.trim()) {
      nextErrors.email_address = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(emailAddress.trim())) {
      nextErrors.email_address = "Enter a valid email address";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: emailAddress.trim(),
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        const message =
          result.message ||
          result.error ||
          "Could not send password reset instructions. Please try again.";

        const isNotFound = message.toLowerCase().includes("not found");

        showModal({
          type: isNotFound ? "warning" : "error",
          title: isNotFound ? "Account Not Found" : "Request Failed",
          message: isNotFound
            ? "No account was found with this email address. Please check your email or create a new account."
            : message,
          details: result.error || "",
          buttonText: isNotFound ? "Okay" : "Try Again",
        });

        return;
      }

      showModal({
        type: "success",
        title: "Check Your Email",
        message:
          result.message ||
          "If an account exists with this email, we have sent password reset instructions.",
        buttonText: "Okay",
      });

      setEmailAddress("");
    } catch (error) {
      showModal({
        type: "error",
        title: "Network Error",
        message:
          "Could not connect to the server. Please make sure your backend is running on localhost:4000.",
        details: error?.message || "",
        buttonText: "Okay",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MessageModal modal={modal} onClose={closeModal} />

      <div className="min-h-screen bg-[#f8f3ef] px-4 pb-8 pt-[98px] text-slate-800 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-rose-100/60 lg:grid-cols-[1fr_460px]">
          <section className="hidden bg-[#fbf7f4] p-10 lg:block">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="ঘটকদের বাড়ি"
                className="h-14 w-14 rounded-2xl object-contain"
              />

              <div>
                <h1
                  style={{ fontFamily: "Atma" }}
                  className="text-2xl font-extrabold text-slate-900"
                >
                  <span className="text-rose-600">ঘটকদের</span>
                  <span className="ml-1 text-slate-900">বাড়ি</span>
                </h1>

                <p className="text-sm text-slate-500">
                  Trusted Bangladeshi matrimony platform
                </p>
              </div>
            </Link>

            <div className="mt-10 max-w-lg">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
                <LockKeyhole className="h-7 w-7" />
              </div>

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-slate-900">
                Reset your password safely.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Enter your registered email address and we’ll send you secure
                instructions to reset your password and recover your account.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4">
              <FeatureCard
                icon={ShieldCheck}
                title="Secure reset process"
                text="Password reset instructions are sent only to your registered email."
              />

              <FeatureCard
                icon={KeyRound}
                title="Easy account recovery"
                text="Recover access without contacting support manually."
              />

              <FeatureCard
                icon={Heart}
                title="Keep your profile safe"
                text="Your profile and account details remain protected."
              />
            </div>
          </section>

          <section className="p-5 sm:p-8 md:p-10">
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="ঘটকদের বাড়ি"
                  className="h-12 w-12 rounded-2xl object-contain"
                />

                <div>
                  <h1
                    style={{ fontFamily: "Atma" }}
                    className="text-xl font-extrabold text-slate-900"
                  >
                    <span className="text-rose-600">ঘটকদের</span>
                    <span className="ml-1 text-slate-900">বাড়ি</span>
                  </h1>

                  <p className="text-xs text-slate-500">
                    Trusted matrimony platform
                  </p>
                </div>
              </Link>
            </div>

            <div className="mx-auto max-w-md">
              <Link
                to="/login"
                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-rose-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>

              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
                  <KeyRound className="h-7 w-7" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Forgot Password?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  No worries. Enter your account email and we’ll send reset
                  instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                  id="email_address"
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  value={emailAddress}
                  onChange={updateEmail}
                  placeholder="example@gmail.com"
                  error={errors.email_address}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-center text-sm text-slate-600">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Login now
                  </Link>
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <p className="text-sm leading-6 text-slate-600">
                    For security, password reset links should expire after a
                    short time. Make sure your backend handles token expiry.
                  </p>
                </div>
              </div>

              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                By continuing, you agree to our Terms and Privacy Policy.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white bg-white/70 p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-500">{text}</p>
        </div>
      </div>
    </div>
  );
}