// AdminRegister.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  User,
  Key,
} from "lucide-react";

/**
 * AdminRegister.jsx
 * - Posts to https://ghotoker-bari-api.vercel.app/api/admin/register
 * - On success, saves JWT to localStorage as 'token'
 * - Verifies session via GET https://ghotoker-bari-api.vercel.app/api/admin/me
 * - Redirects to `redirectTo` (default: /admin) when verified
 * - TailwindCSS + Framer Motion + Lucide icons
 */

export default function AdminRegister({ onSuccess, redirectTo = "/admin" }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("moderator");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [inviteCode, setInviteCode] = useState(""); // optional: for seeding superadmin or internal flow

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // 1) Register
      const res = await fetch("https://ghotoker-bari-api.vercel.app/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role,          // backend defaults to "moderator" if not sent
          // You can use inviteCode server-side if you want special logic
          inviteCode,    // optional: handled in your controller/model if needed
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Registration failed");
      }

      // 2) Save token
      if (data?.token) {
        localStorage.setItem("token", data.token);
      } else {
        throw new Error("Missing token in response");
      }

      // 3) Verify admin session (/me)
      try {
        const meRes = await fetch("https://ghotoker-bari-api.vercel.app/api/admin/me", {
          headers: { Authorization: `Bearer ${data.token}` },
        });

        if (!meRes.ok) throw new Error("Auth check failed");

        const me = await meRes.json();
        const admin = me?.admin || me;
        const isVerified =
          admin?.isVerified !== undefined ? !!admin.isVerified : true;

        if (!admin?._id || !isVerified) {
          localStorage.removeItem("token");
          throw new Error(
            !isVerified
              ? "Admin registered but not verified yet"
              : "Admin not found after registration"
          );
        }
      } catch (meErr) {
        throw new Error(meErr.message || "Unable to verify admin session");
      }

      setSuccess("Admin registered successfully");

      // 4) Bubble success or redirect
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
                <h1 className="text-2xl font-semibold text-white tracking-tight">
                  Create Admin Account
                </h1>
                <p className="text-white/60 text-sm">
                  Bootstrap secure access to your admin console
                </p>
              </div>
            </div>

            <ul className="mt-10 space-y-4 text-white/80">
              {[
                "Create superadmins and moderators with scoped roles",
                "JWT-based access with verification guards",
                "Modern React + Tailwind + Framer Motion UI",
                "Automatic session validation after registration",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 text-white/50 text-xs">
            <p>Register: POST https://ghotoker-bari-api.vercel.app/api/admin/register</p>
            <p>Self-check: GET https://ghotoker-bari-api.vercel.app/api/admin/me</p>
            <p>
              Storage key: <span className="font-mono">token</span>
            </p>
          </div>
        </motion.div>

        {/* Right: Register Card */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="relative rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

          <form
            onSubmit={handleSubmit}
            className="relative p-8 md:p-10 space-y-6"
          >
            <div className="mb-2">
              <h2 className="text-white text-2xl font-semibold tracking-tight">
                Register new admin
              </h2>
              <p className="text-white/60 text-sm">
                Create a secure admin account for console access
              </p>
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

            {/* Username */}
            <label className="block">
              <span className="text-white/80 text-sm">Username</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 focus-within:border-white/30">
                <span className="pl-3">
                  <User className="h-5 w-5 text-white/70" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-white placeholder-white/40 focus:outline-none"
                  placeholder="e.g. admin_master"
                  autoComplete="off"
                  required
                />
              </div>
            </label>

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

            {/* Role */}
            <label className="block">
              <span className="text-white/80 text-sm">Role</span>
              <div className="mt-2 rounded-2xl border border-white/15 bg-white/5 focus-within:border-white/30">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-transparent py-3.5 px-3 text-white text-sm focus:outline-none"
                >
                  <option value="moderator" className="bg-slate-900">
                    Moderator
                  </option>
                  <option value="superadmin" className="bg-slate-900">
                    Superadmin
                  </option>
                </select>
              </div>
            </label>

            {/* Invite Code (optional) */}
            <label className="block">
              <span className="text-white/80 text-sm">
                Invite / Setup Code (optional)
              </span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 focus-within:border-white/30">
                <span className="pl-3">
                  <Key className="h-5 w-5 text-white/70" />
                </span>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full bg-transparent py-3.5 pr-4 text-white placeholder-white/40 focus:outline-none"
                  placeholder="Optional security / seed code"
                  autoComplete="off"
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
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="pr-3 text-white/60 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>

            {/* Confirm Password */}
            <label className="block">
              <span className="text-white/80 text-sm">Confirm password</span>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 focus-within:border-white/30">
                <span className="pl-3">
                  <Lock className="h-5 w-5 text-white/70" />
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-transparent py-3.5 px-0 text-white placeholder-white/40 focus:outline-none"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="pr-3 text-white/60 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </label>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-white/60">
                Already have an account?{" "}
                <a
                  href="/admin/login"
                  className="underline text-white/80 hover:text-white"
                >
                  Sign in
                </a>
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full rounded-2xl bg-white text-slate-900 font-semibold py-3.5 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating account…" : "Create admin account"}
            </motion.button>

            <p className="text-center text-xs text-white/50">
              By continuing, you agree to the Terms and Privacy Policy.
            </p>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
