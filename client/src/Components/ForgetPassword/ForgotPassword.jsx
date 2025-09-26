import React, { useState } from "react";
import { motion } from "framer-motion";
import { HiCheckCircle, HiExclamation } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaEnvelope } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";

const BG_IMG =
  "https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setToast({ show: true, type: "error", message: "Enter a valid email." });
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 2000);
      return;
    }
    try {
      setSubmitting(true);
      await axios.post("http://localhost:4000/api/user/forgot-password", {
        email_address: email,
      });
      setToast({
        show: true,
        type: "success",
        message:
          "If an account exists for this email, we’ve sent a reset link.",
      });
    } catch (err) {
      setToast({
        show: true,
        type: "error",
        message:
          err.response?.data?.message || "Could not send reset link. Try again.",
      });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToast({ show: false, type: "", message: "" }), 2800);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${BG_IMG})` }}
    >
      {/* overlay + halo */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(244,114,182,0.18),transparent_60%)]" />
      </div>

      {/* toast */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-6 right-6 z-50 w-[22rem] p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-start gap-3
            ${
              toast.type === "success"
                ? "bg-emerald-500/15 border-emerald-400/40"
                : "bg-rose-500/15 border-rose-400/40"
            }`}
          role="status"
        >
          {toast.type === "success" ? (
            <HiCheckCircle className="h-6 w-6 text-emerald-300" />
          ) : (
            <HiExclamation className="h-6 w-6 text-rose-300" />
          )}
          <div className="text-sm text-white/90">{toast.message}</div>
        </motion.div>
      )}

      {/* card */}
      <div className="relative z-10 w-full max-w-lg px-4">
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-fuchsia-300/50 via-pink-300/50 to-rose-300/50 shadow-[0_20px_60px_-20px_rgba(244,114,182,0.35)]">
          <div className="rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-8 sm:p-10 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                <FaEnvelope className="text-rose-300" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Reset password</h1>
                <p className="text-white/70 text-sm">
                  Enter your email and we’ll send you a reset link.
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-5">
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 rounded-xl bg-white/5 text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-300/70 px-4"
                />
              </label>

              <motion.button
                type="submit"
                disabled={submitting}
                whileTap={{ scale: 0.985 }}
                className="w-full h-12 rounded-xl font-semibold text-neutral-900
                           bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                           hover:brightness-105 transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <AiOutlineLoading3Quarters className="animate-spin" />
                    Sending link…
                  </>
                ) : (
                  "Send reset link"
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link to="/login" className="text-rose-300 hover:text-rose-200">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
