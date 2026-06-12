"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Phone,
  BadgeCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import logo from "../../Logo/logo.svg";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const SUPERADMIN_REGISTER_ENDPOINT = `${API_BASE_URL}/api/user/register-superadmin`;

const PERMISSIONS = [
  {
    value: "dashboard_manage",
    label: "Dashboard Access",
  },
  {
    value: "users_manage",
    label: "Users Manage",
  },
  {
    value: "profiles_verify",
    label: "Profile Verification",
  },
  {
    value: "membership_manage",
    label: "Membership Manage",
  },
  {
    value: "payment_manage",
    label: "Payment Manage",
  },
  {
    value: "settings_manage",
    label: "Settings Manage",
  },
];

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function FieldLabel({ htmlFor, children, required = true }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-semibold text-slate-700"
    >
      {children}
      {required ? <span className="ml-1 text-rose-600">*</span> : null}
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
  required = true,
}) {
  return (
    <div>
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>

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

function PasswordField({ id, label, value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter password"
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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
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

export default function AdminRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email_address: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    permissions: [
      "dashboard_manage",
      "users_manage",
      "profiles_verify",
      "membership_manage",
      "payment_manage",
      "settings_manage",
    ],
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

  const fullNamePreview =
    `${formData.first_name || ""} ${formData.last_name || ""}`.trim();

  const update = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));

    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const togglePermission = (permission) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permission);

      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((item) => item !== permission)
          : [...prev.permissions, permission],
      };
    });

    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: "" }));
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
      navigate(redirectTo, { replace: true });
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.first_name.trim()) {
      nextErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      nextErrors.last_name = "Last name is required";
    }

    if (!formData.email_address.trim()) {
      nextErrors.email_address = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email_address)) {
      nextErrors.email_address = "Enter a valid email address";
    }

    if (formData.phone_number.trim()) {
      if (formData.phone_number.trim().length < 6) {
        nextErrors.phone_number = "Enter a valid phone number";
      }
    }

    if (!formData.password) {
      nextErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirm_password) {
      nextErrors.confirm_password = "Confirm password is required";
    } else if (formData.password !== formData.confirm_password) {
      nextErrors.confirm_password = "Passwords do not match";
    }

    if (!formData.permissions.length) {
      nextErrors.permissions = "Select at least one permission";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      username: "",
      email_address: "",
      phone_number: "",
      password: "",
      confirm_password: "",
      permissions: [
        "dashboard_manage",
        "users_manage",
        "profiles_verify",
        "membership_manage",
        "payment_manage",
        "settings_manage",
      ],
    });
    setErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        username: formData.username.trim() || undefined,
        email_address: formData.email_address.trim().toLowerCase(),
        phone_number: formData.phone_number.trim() || undefined,
        password: formData.password,
        permissions: formData.permissions,
      };

      const response = await fetch(SUPERADMIN_REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await safeJson(response);

      if (!response.ok) {
        const message =
          result.message ||
          result.error ||
          "Super admin account could not be created.";

        showModal({
          type: "error",
          title: "Super Admin Creation Failed",
          message,
          details: result.error || "",
          buttonText: "Try Again",
        });

        return;
      }

      resetForm();

      showModal({
        type: "success",
        title: "Super Admin Created",
        message:
          result.message ||
          "The super admin account has been created successfully. You can login now.",
        buttonText: "Go to Login",
        redirectTo: "/login",
      });
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

      <div className="min-h-screen bg-[#f8f3ef] px-4 pb-8 pt-28 text-slate-800 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-1 overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-rose-100/60 lg:grid-cols-[420px_1fr]">
          <aside className="bg-[#fbf7f4] p-6 sm:p-8 lg:p-10">
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
                  Super Admin Setup
                </p>
              </div>
            </div>

            <div className="mt-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-100 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Temporary Public Setup
              </div>

              <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-slate-900">
                Create your first super admin account.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                This page uses the public superadmin register route. After
                creating your superadmin, remove this route from backend for
                security.
              </p>
            </div>

            <div className="mt-8 rounded-3xl border border-white bg-white/75 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <BadgeCheck className="h-6 w-6" />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Super Admin Preview
                  </h3>
                  <p className="text-xs text-slate-500">
                    Account overview before creation
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <PreviewRow
                  label="Name"
                  value={fullNamePreview || "Not added yet"}
                />
                <PreviewRow
                  label="Email"
                  value={formData.email_address || "Not added yet"}
                />
                <PreviewRow label="Role" value="Super Admin" />
                <PreviewRow
                  label="Permissions"
                  value={`${formData.permissions.length} selected`}
                />
              </div>
            </div>
          </aside>

          <main className="p-5 sm:p-8 lg:p-10">
            <div className="mb-8 flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Register Super Admin
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create the first superadmin account without authentication.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Login
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <section>
                <div className="mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-rose-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <InputField
                    id="first_name"
                    label="First Name"
                    icon={User}
                    value={formData.first_name}
                    onChange={(value) => update("first_name", value)}
                    placeholder="Enter first name"
                    error={errors.first_name}
                  />

                  <InputField
                    id="last_name"
                    label="Last Name"
                    icon={User}
                    value={formData.last_name}
                    onChange={(value) => update("last_name", value)}
                    placeholder="Enter last name"
                    error={errors.last_name}
                  />

                  <InputField
                    id="username"
                    label="Username"
                    icon={KeyRound}
                    value={formData.username}
                    onChange={(value) => update("username", value)}
                    placeholder="superadmin"
                    error={errors.username}
                    required={false}
                  />

                  <InputField
                    id="email_address"
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    value={formData.email_address}
                    onChange={(value) => update("email_address", value)}
                    placeholder="admin@example.com"
                    error={errors.email_address}
                  />

                  <InputField
                    id="phone_number"
                    label="Phone Number"
                    icon={Phone}
                    value={formData.phone_number}
                    onChange={(value) => update("phone_number", value)}
                    placeholder="+8801XXXXXXXXX"
                    error={errors.phone_number}
                    required={false}
                  />

                  <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                      Role
                    </p>
                    <p className="mt-1 text-lg font-bold text-rose-700">
                      Super Admin
                    </p>
                    <p className="mt-1 text-xs leading-5 text-rose-500">
                      This page only creates a superadmin account.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-rose-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Security
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <PasswordField
                    id="password"
                    label="Password"
                    value={formData.password}
                    onChange={(value) => update("password", value)}
                    error={errors.password}
                  />

                  <PasswordField
                    id="confirm_password"
                    label="Confirm Password"
                    value={formData.confirm_password}
                    onChange={(value) => update("confirm_password", value)}
                    error={errors.confirm_password}
                  />
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-rose-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Permissions
                  </h3>
                </div>

                <div
                  className={`grid grid-cols-1 gap-3 rounded-3xl border p-4 sm:grid-cols-2 lg:grid-cols-3 ${
                    errors.permissions
                      ? "border-rose-300 bg-rose-50"
                      : "border-slate-100 bg-slate-50/70"
                  }`}
                >
                  {PERMISSIONS.map((permission) => {
                    const checked = formData.permissions.includes(
                      permission.value
                    );

                    return (
                      <label
                        key={permission.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm font-semibold transition ${
                          checked
                            ? "border-rose-200 bg-white text-rose-700 shadow-sm"
                            : "border-slate-100 bg-white text-slate-600 hover:border-slate-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(permission.value)}
                          className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                        />
                        {permission.label}
                      </label>
                    );
                  })}
                </div>

                {errors.permissions ? (
                  <p className="mt-1 text-xs font-medium text-rose-600">
                    {errors.permissions}
                  </p>
                ) : null}
              </section>

              <div className="rounded-3xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-800">
                      Security Reminder
                    </h4>
                    <p className="mt-1 text-sm leading-6 text-amber-700">
                      This page uses a public no-auth route. After creating your
                      superadmin, remove the backend route and remove this page
                      from frontend.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Reset
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-rose-600 px-7 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Creating Super Admin..."
                    : "Create Super Admin"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <span className="text-right text-sm font-bold text-slate-800">
        {value}
      </span>
    </div>
  );
}