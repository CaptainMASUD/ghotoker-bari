import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaUser, FaLock } from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { HiCheckCircle, HiExclamation } from "react-icons/hi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  signInStart,
  signInSuccess,
  signInError,
} from "../../Redux/UserSlice/UserSlice";

const BG_IMG =
  "https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(signInStart());
    try {
      const res = await axios.post("ghotoker-bari-api.vercel.app/api/user/login", {
        email_address: email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      dispatch(signInSuccess(res.data.user));
      setToast({ show: true, type: "success", message: "Login successful." });
      setTimeout(() => navigate("/"), 1400);
    } catch (err) {
      dispatch(signInError(err.response?.data?.message || err.message));
      setToast({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Login failed! Try again.",
      });
    }
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2800);
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

      {/* content */}
      <div className="relative z-10 flex flex-col lg:flex-row w-full max-w-6xl px-4 sm:px-6 py-8">
        {/* left copy */}
        <div className="flex-1 flex flex-col justify-center text-white p-8 lg:p-14">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold mb-4 sm:mb-6"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
              GhotokerBari 
            </span>
          </motion.h1>
          <motion.p
            className="text-base sm:text-lg text-white/85 max-w-xl leading-relaxed"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
          >
            Sign in to your premium matchmaking experience verified profiles,
            privacy-first, genuine intentions.
          </motion.p>
        </div>

        {/* right card */}
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-2xl p-[1px] bg-gradient-to-r from-fuchsia-300/50 via-pink-300/50 to-rose-300/50 shadow-[0_20px_60px_-20px_rgba(244,114,182,0.35)]"
          >
            <div className="rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-8 sm:p-10 text-white">
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold">Login</h2>
                <p className="text-white/70 mt-1">
                  Welcome back! Please sign in to your account.
                </p>
              </div>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                <FcGoogle className="text-xl" />
                <span className="font-medium text-white/90">
                  Continue with Google
                </span>
              </button>

              <div className="flex items-center gap-3 my-6 text-white/60">
                <span className="flex-1 h-px bg-white/10" />
                <span className="text-xs tracking-wide">OR</span>
                <span className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {/* email */}
                <label className="block">
                  <span className="sr-only">Email</span>
                  <div className="relative">
                    <FaUser className="absolute top-1/2 -translate-y-1/2 left-3 text-white/50" />
                    <input
                      type="email"
                      required
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-10 pr-3 rounded-xl bg-white/5 text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-300/70"
                    />
                  </div>
                </label>

                {/* password with eye icon */}
                <label className="block">
                  <span className="sr-only">Password</span>
                  <div className="relative">
                    <FaLock className="absolute top-1/2 -translate-y-1/2 left-3 text-white/50" />
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 pl-10 pr-12 rounded-xl bg-white/5 text-white placeholder-white/50 border border-white/10 focus:outline-none focus:ring-2 focus:ring-rose-300/70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? (
                        <FiEyeOff className="h-5 w-5 text-white/80" />
                      ) : (
                        <FiEye className="h-5 w-5 text-white/80" />
                      )}
                    </button>
                  </div>
                </label>

                <div className="flex items-center justify-between text-sm text-white/80">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="accent-rose-300 h-4 w-4" />
                    Remember me
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-rose-300 hover:text-rose-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.985 }}
                  className="w-full h-12 rounded-xl font-semibold text-neutral-900
                             bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                             hover:brightness-105 transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <AiOutlineLoading3Quarters className="animate-spin" />
                      Logging in…
                    </>
                  ) : (
                    "Login"
                  )}
                </motion.button>
              </form>

              <p className="text-center text-white/75 mt-6">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-rose-300 hover:text-rose-200 underline-offset-4 hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
