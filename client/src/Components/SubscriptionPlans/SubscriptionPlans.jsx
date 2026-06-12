"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle,
  Copy,
  CreditCard,
  Crown,
  Eye,
  Heart,
  Home,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  ShieldCheck,
  Star,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function getStoredToken() {
  try {
    return (
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      sessionStorage.getItem("authToken") ||
      ""
    );
  } catch {
    return "";
  }
}

function getAuthToken(currentUser) {
  return (
    currentUser?.token ||
    currentUser?.accessToken ||
    currentUser?.user?.token ||
    currentUser?.data?.token ||
    getStoredToken()
  );
}

function getLoggedInUser(currentUser) {
  return currentUser?.user || currentUser?.data || currentUser || null;
}

function formatPrice(plan) {
  const price = Number(plan?.price || 0);

  if (plan?.is_free || plan?.slug === "free" || price <= 0) {
    return "Free";
  }

  return `${price.toLocaleString("en-BD")} ${plan?.currency || "BDT"}`;
}

function formatDuration(plan) {
  if (plan?.is_free || plan?.slug === "free" || !plan?.duration_days) {
    return "Lifetime basic access";
  }

  const days = Number(plan.duration_days);

  if (days >= 365) return `${Math.round(days / 365)} year access`;
  if (days >= 30) return `${Math.round(days / 30)} month access`;

  return `${days} days access`;
}

function formatLimit(value) {
  const number = Number(value);

  if (number === -1) return "Unlimited";
  return number.toLocaleString("en-BD");
}

function providerIcon(providerType) {
  const type = String(providerType || "").toLowerCase();

  if (["bkash", "nagad", "rocket", "wallet", "manual"].includes(type)) {
    return Wallet;
  }

  if (type === "bank") return Banknote;
  if (type === "card") return CreditCard;
  if (type === "cash") return Banknote;

  return CreditCard;
}

function buildFeatureList(features = {}) {
  return [
    {
      icon: Eye,
      label: `${formatLimit(features.profile_view_limit ?? 0)} profile views`,
      active: features.can_browse_profiles !== false,
    },
    {
      icon: Heart,
      label: `${formatLimit(
        features.connection_request_limit ?? 0
      )} connection requests`,
      active: features.can_send_connection_request !== false,
    },
    {
      icon: MessageCircle,
      label:
        Number(features.message_limit || 0) === -1
          ? "Unlimited messages"
          : `${formatLimit(features.message_limit ?? 0)} messages`,
      active: Boolean(features.can_send_messages),
    },
    {
      icon: Star,
      label: `${formatLimit(features.shortlist_limit ?? 0)} shortlists`,
      active: features.can_shortlist_profiles !== false,
    },
    {
      icon: ShieldCheck,
      label: "Full biodata access",
      active: Boolean(
        features.can_view_biodata || features.can_view_full_profiles
      ),
    },
    {
      icon: Eye,
      label: "Profile photo access",
      active: Boolean(features.can_view_profile_photos),
    },
    {
      icon: Phone,
      label: "Phone number access",
      active: Boolean(features.can_view_phone),
    },
    {
      icon: Mail,
      label: "Email access",
      active: Boolean(features.can_view_email),
    },
    {
      icon: Home,
      label: "Address access",
      active: Boolean(features.can_view_address),
    },
    {
      icon: Crown,
      label:
        Number(features.profile_boost_days || 0) > 0
          ? `${features.profile_boost_days} days profile boost`
          : "Profile boost",
      active: Boolean(features.can_boost_profile),
    },
    {
      icon: ShieldCheck,
      label: "Priority support",
      active: Boolean(features.priority_support),
    },
  ];
}

function MessageModal({ modal, onClose }) {
  if (!modal.open) return null;

  const isSuccess = modal.type === "success";
  const isWarning = modal.type === "warning";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
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

function PlanSkeleton() {
  return (
    <div className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm">
      <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-100" />
      <div className="mt-6 h-7 w-36 animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-100" />
      <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-100" />
      <div className="mt-8 h-10 w-44 animate-pulse rounded-xl bg-slate-100" />
      <div className="mt-8 space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="h-4 w-full animate-pulse rounded bg-slate-100"
          />
        ))}
      </div>
      <div className="mt-8 h-12 w-full animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-slate-700">
      {children}
      {required ? <span className="ml-1 text-rose-600">*</span> : null}
    </label>
  );
}

function DynamicPaymentField({ field, value, onChange, error }) {
  const commonClass = `w-full rounded-xl border bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
    error
      ? "border-rose-400 bg-rose-50"
      : "border-slate-200 hover:border-slate-300"
  }`;

  return (
    <div>
      <FieldLabel required={field.required}>{field.label}</FieldLabel>

      {field.type === "textarea" ? (
        <textarea
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || ""}
          rows={3}
          className={`${commonClass} py-3`}
        />
      ) : field.type === "select" ? (
        <select
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          className={`${commonClass} h-12`}
        >
          <option value="">Select {field.label}</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={
            field.type === "phone"
              ? "tel"
              : field.type === "number"
              ? "number"
              : field.type === "email"
              ? "email"
              : field.type === "date"
              ? "date"
              : field.type === "time"
              ? "time"
              : "text"
          }
          value={value || ""}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder || ""}
          className={`${commonClass} h-12`}
        />
      )}

      {field.help_text ? (
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {field.help_text}
        </p>
      ) : null}

      {error ? (
        <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
    </div>
  );
}

function InfoBox({ label, value, onCopy }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 break-all text-sm font-bold text-slate-800">
            {value}
          </p>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 transition hover:text-rose-600"
          title="Copy"
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PurchaseModal({
  open,
  plan,
  paymentMethods,
  selectedMethodId,
  setSelectedMethodId,
  paymentValues,
  setPaymentValues,
  transactionId,
  setTransactionId,
  paymentNote,
  setPaymentNote,
  errors,
  isSubmitting,
  onClose,
  onSubmit,
}) {
  const selectedMethod = useMemo(() => {
    return paymentMethods.find((method) => method._id === selectedMethodId);
  }, [paymentMethods, selectedMethodId]);

  if (!open || !plan) return null;

  const fields = Array.isArray(selectedMethod?.fields)
    ? [...selectedMethod.fields].sort(
        (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
      )
    : [];

  const copyText = async (text) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-[#fbf7f4] p-5 sm:p-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-rose-600 shadow-sm">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              Membership Purchase
            </div>

            <h3 className="mt-3 text-2xl font-bold text-slate-900">
              {plan.name}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {formatPrice(plan)} · {formatDuration(plan)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-130px)] overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
            <aside className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <h4 className="text-sm font-bold text-slate-900">
                Payment Method
              </h4>

              <div className="mt-4 space-y-3">
                {paymentMethods.length === 0 ? (
                  <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-500">
                    No active payment method found.
                  </div>
                ) : (
                  paymentMethods.map((method) => {
                    const Icon = providerIcon(method.provider_type);
                    const active = selectedMethodId === method._id;

                    return (
                      <button
                        key={method._id}
                        type="button"
                        onClick={() => setSelectedMethodId(method._id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          active
                            ? "border-rose-300 bg-white shadow-md shadow-rose-100"
                            : "border-slate-100 bg-white hover:border-rose-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                              active
                                ? "bg-rose-600 text-white"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {method.name}
                            </p>
                            <p className="mt-0.5 text-xs capitalize text-slate-500">
                              {method.provider_type}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="space-y-5">
              {selectedMethod ? (
                <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <h4 className="text-base font-bold text-slate-900">
                    Payment Details
                  </h4>

                  {selectedMethod.instructions ? (
                    <div className="mt-4 rounded-2xl bg-[#fbf7f4] p-4 text-sm leading-6 text-slate-600">
                      {selectedMethod.instructions}
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {selectedMethod.account_name ? (
                      <InfoBox
                        label="Account Name"
                        value={selectedMethod.account_name}
                        onCopy={() => copyText(selectedMethod.account_name)}
                      />
                    ) : null}

                    {selectedMethod.account_number ? (
                      <InfoBox
                        label="Account Number"
                        value={selectedMethod.account_number}
                        onCopy={() => copyText(selectedMethod.account_number)}
                      />
                    ) : null}

                    {selectedMethod.branch_name ? (
                      <InfoBox
                        label="Branch"
                        value={selectedMethod.branch_name}
                        onCopy={() => copyText(selectedMethod.branch_name)}
                      />
                    ) : null}

                    {selectedMethod.routing_number ? (
                      <InfoBox
                        label="Routing Number"
                        value={selectedMethod.routing_number}
                        onCopy={() => copyText(selectedMethod.routing_number)}
                      />
                    ) : null}
                  </div>
                </div>
              ) : null}

              <form
                onSubmit={onSubmit}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <h4 className="text-base font-bold text-slate-900">
                  Submit Information
                </h4>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FieldLabel required>Transaction ID</FieldLabel>
                    <input
                      value={transactionId}
                      onChange={(event) => setTransactionId(event.target.value)}
                      placeholder="Enter transaction ID"
                      className={`h-12 w-full rounded-xl border bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 ${
                        errors.transaction_id
                          ? "border-rose-400 bg-rose-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    />
                    {errors.transaction_id ? (
                      <p className="mt-1 text-xs font-medium text-rose-600">
                        {errors.transaction_id}
                      </p>
                    ) : null}
                  </div>

                  {fields.map((field) => (
                    <DynamicPaymentField
                      key={field._id || field.name}
                      field={field}
                      value={paymentValues[field.name]}
                      onChange={(value) =>
                        setPaymentValues((prev) => ({
                          ...prev,
                          [field.name]: value,
                        }))
                      }
                      error={errors[field.name]}
                    />
                  ))}

                  <div className="sm:col-span-2">
                    <FieldLabel>Payment Note</FieldLabel>
                    <textarea
                      value={paymentNote}
                      onChange={(event) => setPaymentNote(event.target.value)}
                      placeholder="Optional note for admin"
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition hover:border-slate-300 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedMethod}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 text-sm font-semibold text-white shadow-lg shadow-rose-100 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Purchase Request
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PlanCard({ plan, isCurrentPlan, onPurchase }) {
  const features = buildFeatureList(plan.features || {});
  const isFree =
    plan.is_free || plan.slug === "free" || Number(plan.price || 0) <= 0;
  const isPopular = !isFree && Number(plan.sort_order || 0) === 1;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden rounded-[2rem] border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
        isPopular
          ? "border-rose-200 shadow-rose-100"
          : "border-slate-100"
      }`}
    >
      {isPopular ? (
        <div className="absolute right-5 top-5 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
          Popular
        </div>
      ) : null}

      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          isFree ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-500"
        }`}
      >
        {isFree ? (
          <ShieldCheck className="h-7 w-7" />
        ) : (
          <Crown className="h-7 w-7" />
        )}
      </div>

      <div className="mt-5">
        <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>

        {plan.description ? (
          <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-500">
            {plan.description}
          </p>
        ) : (
          <div className="mt-2 min-h-[48px]" />
        )}
      </div>

      <div className="mt-6">
        <span className="text-4xl font-black tracking-tight text-slate-900">
          {formatPrice(plan)}
        </span>

        <p className="mt-2 text-sm font-medium text-slate-500">
          {formatDuration(plan)}
        </p>
      </div>

      <div className="mt-7 space-y-3">
        {features.map((item) => {
          const Icon = item.icon;

          return (
            <div key={`${item.label}-${item.active}`} className="flex gap-3">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  item.active
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {item.active ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
              </div>

              <div className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                <span
                  className={`text-sm ${
                    item.active ? "text-slate-700" : "text-slate-400"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        disabled={isFree || isCurrentPlan}
        onClick={() => onPurchase(plan)}
        className={`mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition ${
          isCurrentPlan
            ? "cursor-not-allowed bg-emerald-50 text-emerald-700"
            : isFree
            ? "cursor-not-allowed bg-slate-100 text-slate-500"
            : "bg-rose-600 text-white shadow-lg shadow-rose-100 hover:bg-rose-700"
        }`}
      >
        {isCurrentPlan ? (
          <>
            <CheckCircle className="h-4 w-4" />
            Current Plan
          </>
        ) : isFree ? (
          <>
            <ShieldCheck className="h-4 w-4" />
            Free Plan
          </>
        ) : (
          <>
            Purchase Plan
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </motion.article>
  );
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user?.currentUser);
  const loggedInUser = getLoggedInUser(currentUser);
  const token = getAuthToken(currentUser);

  const [plans, setPlans] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [paymentValues, setPaymentValues] = useState({});
  const [transactionId, setTransactionId] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [errors, setErrors] = useState({});

  const [modal, setModal] = useState({
    open: false,
    type: "success",
    title: "",
    message: "",
    details: "",
    buttonText: "Okay",
    redirectTo: "",
  });

  const currentMembershipId =
    typeof loggedInUser?.membership === "object"
      ? loggedInUser?.membership?._id
      : loggedInUser?.membership;

  const activePlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const orderA = Number(a.sort_order || 0);
      const orderB = Number(b.sort_order || 0);
      const priceA = Number(a.price || 0);
      const priceB = Number(b.price || 0);

      if (orderA !== orderB) return orderA - orderB;
      return priceA - priceB;
    });
  }, [plans]);

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
      navigate(redirectTo);
    }
  };

  const fetchData = async (silent = false) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [plansResponse, methodsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/memberships`),
        fetch(`${API_BASE_URL}/api/membership-payments/methods`),
      ]);

      const [plansResult, methodsResult] = await Promise.all([
        safeJson(plansResponse),
        safeJson(methodsResponse),
      ]);

      if (!plansResponse.ok) {
        throw new Error(
          plansResult.message || "Could not load membership plans"
        );
      }

      if (!methodsResponse.ok) {
        throw new Error(
          methodsResult.message || "Could not load payment methods"
        );
      }

      setPlans(Array.isArray(plansResult.items) ? plansResult.items : []);
      setPaymentMethods(
        Array.isArray(methodsResult.items) ? methodsResult.items : []
      );
    } catch (error) {
      showModal({
        type: "error",
        title: "Failed to Load",
        message:
          error?.message ||
          "Could not connect to the server. Please make sure your backend is running.",
        buttonText: "Okay",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
  }, []);

  const openPurchaseModal = (plan) => {
    if (!token) {
      showModal({
        type: "warning",
        title: "Login Required",
        message: "Please login first to purchase a membership plan.",
        buttonText: "Go to Login",
        redirectTo: "/login",
      });
      return;
    }

    const firstMethod = paymentMethods[0];

    if (!firstMethod) {
      showModal({
        type: "warning",
        title: "No Payment Method",
        message: "No active payment method is available right now.",
        buttonText: "Okay",
      });
      return;
    }

    setSelectedPlan(plan);
    setSelectedMethodId(firstMethod._id);
    setPaymentValues({});
    setTransactionId("");
    setPaymentNote("");
    setErrors({});
    setPurchaseOpen(true);
  };

  const closePurchaseModal = () => {
    if (isSubmitting) return;

    setPurchaseOpen(false);
    setSelectedPlan(null);
    setSelectedMethodId("");
    setPaymentValues({});
    setTransactionId("");
    setPaymentNote("");
    setErrors({});
  };

  const validatePurchase = () => {
    const nextErrors = {};

    if (!selectedPlan?._id) {
      nextErrors.plan = "Membership plan is required";
    }

    if (!selectedMethodId) {
      nextErrors.payment_method = "Payment method is required";
    }

    if (!transactionId.trim()) {
      nextErrors.transaction_id = "Transaction ID is required";
    }

    const selectedMethod = paymentMethods.find(
      (method) => method._id === selectedMethodId
    );

    const fields = Array.isArray(selectedMethod?.fields)
      ? selectedMethod.fields
      : [];

    fields.forEach((field) => {
      const value = paymentValues[field.name];

      if (
        field.required &&
        (value === undefined || value === null || String(value).trim() === "")
      ) {
        nextErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitPurchase = async (event) => {
    event.preventDefault();

    if (!validatePurchase()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/membership-payments/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            membershipId: selectedPlan._id,
            paymentMethodId: selectedMethodId,
            transaction_id: transactionId.trim(),
            payment_values: paymentValues,
            payment_note: paymentNote.trim(),
          }),
        }
      );

      const result = await safeJson(response);

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Could not submit membership purchase request"
        );
      }

      closePurchaseModal();

      showModal({
        type: "success",
        title: "Request Submitted",
        message:
          result.message ||
          "Your payment request has been submitted. Please wait for admin approval.",
        buttonText: "View My Payments",
        redirectTo: "/my-membership-payments",
      });
    } catch (error) {
      showModal({
        type: "error",
        title: "Purchase Failed",
        message:
          error?.message ||
          "Something went wrong while submitting your purchase request.",
        buttonText: "Okay",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <MessageModal modal={modal} onClose={closeModal} />

      <PurchaseModal
        open={purchaseOpen}
        plan={selectedPlan}
        paymentMethods={paymentMethods}
        selectedMethodId={selectedMethodId}
        setSelectedMethodId={setSelectedMethodId}
        paymentValues={paymentValues}
        setPaymentValues={setPaymentValues}
        transactionId={transactionId}
        setTransactionId={setTransactionId}
        paymentNote={paymentNote}
        setPaymentNote={setPaymentNote}
        errors={errors}
        isSubmitting={isSubmitting}
        onClose={closePurchaseModal}
        onSubmit={submitPurchase}
      />

      <div className="min-h-screen bg-[#f8f3ef] px-4 pb-12 pt-28 text-slate-800 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 rounded-[2rem] border border-white bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <Crown className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Membership Plans
                </h1>
             
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => fetchData(true)}
                disabled={isRefreshing}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </button>

              <Link
                to="/my-membership-payments"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                My Payments
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <PlanSkeleton />
              <PlanSkeleton />
              <PlanSkeleton />
            </div>
          ) : activePlans.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertCircle className="h-8 w-8" />
              </div>

              <h3 className="mt-5 text-2xl font-bold text-slate-900">
                No Plans Available
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                No active membership plan is available right now.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {activePlans.map((plan) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  isCurrentPlan={
                    String(currentMembershipId || "") === String(plan._id)
                  }
                  onPurchase={openPurchaseModal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
