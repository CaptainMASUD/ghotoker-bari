import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, ShieldCheck, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * AdminLogin.jsx (Updated)
 * - Posts to ghotoker-bari-api.vercel.app/api/admin/login
 * - On success, saves JWT to localStorage as 'token'
 * - Verifies session via GET ghotoker-bari-api.vercel.app/api/admin/me
 * - Redirects to `redirectTo` (default: /admin) when verified
 * - TailwindCSS + Framer Motion + Lucide icons
 */

export default function AdminLogin({ onSuccess, redirectTo = "/admin" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Login
      const res = await fetch("ghotoker-bari-api.vercel.app/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Login failed");

      // 2) Save token immediately
      if (data?.token) {
        localStorage.setItem("token", data.token);
      } else {
        throw new Error("Missing token in response");
      }

      // 3) Verify admin session (/me)
      try {
        const meRes = await fetch("ghotoker-bari-api.vercel.app/api/admin/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });
        if (!meRes.ok) throw new Error("Auth check failed");
        const me = await meRes.json();
        const admin = me?.admin || me;
        const isVerified = admin?.isVerified !== undefined ? !!admin.isVerified : true;

        if (!admin?._id || !isVerified) {
          localStorage.removeItem("token");
          throw new Error(!isVerified ? "Admin not verified" : "Admin not found");
        }
      } catch (meErr) {
        throw new Error(meErr.message || "Unable to verify admin session");
      }

      setSuccess("Login successful");

      // 4) Bubble success up, or redirect immediately
      if (typeof onSuccess === "function") onSuccess(data);
      else if (redirectTo) window.location.assign(redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8"
      >
        {/* Left: Brand / Copy */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="hidden md:flex flex-col justify-between rounded-3xl p-10 shadow-2xl bg-[radial-gradient(65%_90%_at_30%_20%,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0)_60%)] border border-white/10"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/15">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-white tracking-tight">Admin Console</h1>
                <p className="text-white/60 text-sm">Secure access to membership and user management</p>
              </div>
            </div>

            <ul className="mt-10 space-y-4 text-white/80">
              {[
                "JWT-based authentication with role guards",
                "View, verify and delete users securely",
                "Fast, modern UI with Tailwind and Framer Motion",
                "Local token storage with graceful redirect",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 text-white/50 text-xs">
            <p>Server: ghotoker-bari-api.vercel.app/api/admin/login</p>
            <p>Self-check: GET ghotoker-bari-api.vercel.app/api/admin/me</p>
            <p>Storage key: <span className="font-mono">token</span></p>
          </div>
        </motion.div>

        {/* Right: Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit} className="relative p-8 md:p-10 space-y-6">
            <div className="mb-2">
              <h2 className="text-white text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="text-white/60 text-sm">Sign in with your admin credentials</p>
            </div>

            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-red-200">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div className="text-sm">{error}</div>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-emerald-200">
                <CheckCircle2 className="h-5 w-5 mt-0.5" />
                <div className="text-sm">{success}</div>
              </div>
            )}

            {/* Email */}
            <label className="block">
              <span className="text-white/80 text-sm">Email</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 focus-within:border-white/30">
                <span className="pl-3">
                  <Mail className="h-5 w-5 text-white/70" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-white placeholder-white/40 focus:outline-none"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="text-white/80 text-sm">Password</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 focus-within:border-white/30">
                <span className="pl-3">
                  <Lock className="h-5 w-5 text-white/70" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent py-3.5 px-0 text-white placeholder-white/40 focus:outline-none"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="pr-3 text-white/60 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <input id="remember" type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent text-white focus:ring-0" />
                <label htmlFor="remember" className="text-white/70 text-sm">Remember me</label>
              </div>
              <a href="#" className="text-sm text-white/70 hover:text-white">Forgot password?</a>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full rounded-2xl bg-white text-slate-900 font-semibold py-3.5 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </motion.button>

            <p className="text-center text-xs text-white/50">By continuing, you agree to the Terms and Privacy Policy.</p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
