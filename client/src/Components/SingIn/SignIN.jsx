"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Heart,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../../Logo/logo.svg";

import {
  signInStart,
  signInSuccess,
  signInError,
} from "../../Redux/UserSlice/UserSlice";

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

function PasswordField({ value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <FieldLabel htmlFor="password">Password</FieldLabel>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          id="password"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter your password"
          className={`h-12 w-full rounded-xl border bg-white pl-10 pr-12 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
            error
              ? "border-rose-400 bg-rose-50"
              : "border-slate-200 hover:border-slate-300"
          }`}
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <FiEyeOff className="h-4 w-4" />
          ) : (
            <FiEye className="h-4 w-4" />
          )}
        </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
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

export default function Login() {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email_address: "",
    password: "",
    rememberMe: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    details: "",
    buttonText: "Okay",
    redirectTo: "",
  });

  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
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
      redirectTo: payload.redirectTo || "",
    });
  };

  const closeModal = () => {
    const redirectTo = modal.redirectTo;

    setModal((prev) => ({
      ...prev,
      open: false,
    }));

    if (redirectTo) {
      window.location.href = redirectTo;
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.email_address.trim()) {
      nextErrors.email_address = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email_address)) {
      nextErrors.email_address = "Enter a valid email address";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getRedirectPath = (user) => {
    if (!user) return "/";

    if (user.role === "superadmin" || user.role === "moderator") {
      return "/admin/dashboard";
    }

    return "/profile";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    dispatch(signInStart());

    try {
      const response = await fetch(`${API_BASE_URL}/api/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: formData.email_address.trim(),
          password: formData.password,
        }),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        const message =
          result.message ||
          result.error ||
          "Login failed. Please check your email and password.";

        dispatch(signInError(message));

        const isNotFound = message.toLowerCase().includes("not found");
        const isInvalid = message.toLowerCase().includes("invalid");
        const isSuspended =
          message.toLowerCase().includes("suspended") ||
          message.toLowerCase().includes("not available");
        const isAdminUnverified = message.toLowerCase().includes("not verified");

        showModal({
          type: isSuspended || isAdminUnverified ? "warning" : "error",
          title: isNotFound
            ? "Account Not Found"
            : isInvalid
            ? "Invalid Login"
            : isSuspended
            ? "Account Restricted"
            : isAdminUnverified
            ? "Admin Not Verified"
            : "Login Failed",
          message: isNotFound
            ? "No account was found with this email address. Please register first."
            : isInvalid
            ? "Your email or password is incorrect. Please try again."
            : message,
          details: result.error || "",
          buttonText: isNotFound ? "Go to Register" : "Try Again",
          redirectTo: isNotFound ? "/register" : "",
        });

        return;
      }

      if (!result.token || !result.user) {
        const message =
          "Login was accepted, but token or user data was not returned from the server.";

        dispatch(signInError(message));

        showModal({
          type: "warning",
          title: "Login Response Incomplete",
          message,
          details:
            "Please check your login controller response. It should return { token, user }.",
          buttonText: "Okay",
        });

        return;
      }

      const reduxUser = {
        token: result.token,
        user: result.user,
      };

      if (formData.rememberMe) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
      } else {
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("user", JSON.stringify(result.user));
      }

      dispatch(signInSuccess(reduxUser));

      const redirectTo = getRedirectPath(result.user);

      showModal({
        type: "success",
        title: "Login Successful",
        message: `Welcome back${
          result.user?.full_name ? `, ${result.user.full_name}` : ""
        }!`,
        buttonText: "Continue",
        redirectTo,
      });
    } catch (error) {
      const message =
        "Could not connect to the server. Please make sure your backend is running on localhost:4000.";

      dispatch(signInError(message));

      showModal({
        type: "error",
        title: "Network Error",
        message,
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

      <div className="min-h-screen bg-[#f8f3ef] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-rose-100/60 lg:mt-16 lg:grid-cols-[1fr_460px]">
          <section className="hidden bg-[#fbf7f4] p-10 lg:block">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="ঘটকদের বাড়ি"
                className="h-14 w-14 rounded-2xl object-contain"
              />

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  ঘটকদের বাড়ি
                </h1>
                <p className="text-sm text-slate-500">
                  Trusted Bangladeshi matrimony platform
                </p>
              </div>
            </div>

            <div className="mt-5 max-w-lg">
             

              <h2 className="text-4xl font-bold leading-tight tracking-tight text-slate-900">
                Find your life partner with verified profiles.
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                Login to manage your biodata, update your profile, view matches,
                and continue your matrimony journey safely.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4">
              <FeatureCard
                icon={ShieldCheck}
                title="Admin verified profiles"
                text="Profiles are reviewed before approval."
              />

              <FeatureCard
                icon={Heart}
                title="Better matching"
                text="Search by location, religion, profession and preference."
              />

              <FeatureCard
                icon={CheckCircle}
                title="Private and secure"
                text="Sensitive details stay protected."
              />
            </div>
          </section>

          <section className="p-5 sm:p-8 md:p-10">
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="ঘটকদের বাড়ি"
                  className="h-12 w-12 rounded-2xl object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-slate-900">
                    ঘটকদের বাড়ি
                  </h1>
                  <p className="text-xs text-slate-500">
                    Trusted matrimony platform
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-100">
                  <Lock className="h-7 w-7" />
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Welcome Back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Login to your ঘটকদের বাড়ি account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <InputField
                  id="email_address"
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  value={formData.email_address}
                  onChange={(value) => update("email_address", value)}
                  placeholder="example@gmail.com"
                  error={errors.email_address}
                />

                <PasswordField
                  value={formData.password}
                  onChange={(value) => update("password", value)}
                  error={errors.password}
                />

                <div className="flex items-center justify-between gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(event) =>
                        update("rememberMe", event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    Remember me
                  </label>

                  <a
                    href="/forgot-password"
                    className="text-sm font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-center text-sm text-slate-600">
                  Don&apos;t have an account?{" "}
                  <a
                    href="/register"
                    className="font-bold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Create account
                  </a>
                </p>
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