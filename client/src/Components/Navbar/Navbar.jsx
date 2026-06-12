import React, { useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Redux/UserSlice/UserSlice";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Crown,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import logo from "../../Logo/logo.svg";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/find-matches", label: "Find Matches" },
  {
    to: "/plans",
    label: "Plans",
    icon: Crown,
    iconClassName: "text-amber-400",
  },
  { to: "/success-stories", label: "Success Stories" },
  { to: "/contact", label: "Contact" },
];

const desktopLinkBase =
  "relative inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all duration-200";

const desktopLinkActive = "bg-rose-600 text-white shadow-sm";

const desktopLinkInactive =
  "text-slate-600 hover:bg-rose-50 hover:text-rose-700";

const mobileLinkBase =
  "flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200";

const mobileLinkActive = "bg-rose-600 text-white shadow-sm";

const mobileLinkInactive =
  "text-slate-700 hover:bg-rose-50 hover:text-rose-700";

function safeParseUser(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function getStoredAuth() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token") || "";

  const storedUser =
    safeParseUser(localStorage.getItem("user")) ||
    safeParseUser(sessionStorage.getItem("user"));

  return {
    token,
    user: storedUser,
  };
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileMenuRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { currentUser } = useSelector((state) => state.user);

  const storedAuth = getStoredAuth();

  const token =
    currentUser?.token ||
    storedAuth.token ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  const authUser =
    currentUser?.user ||
    currentUser?.data ||
    currentUser?.currentUser ||
    storedAuth.user ||
    null;

  const isLoggedIn = Boolean(token);

  const role = String(authUser?.role || "").toLowerCase();

  const isAdmin =
    role === "superadmin" || role === "moderator" || role === "admin";

  const profilePath = isAdmin ? "/admin/dashboard" : "/profile";

  const username = useMemo(() => {
    if (!authUser) return "User";

    if (authUser.full_name) return authUser.full_name;
    if (authUser.name) return authUser.name;
    if (authUser.username) return authUser.username;

    const fullName = `${authUser.first_name || ""} ${
      authUser.last_name || ""
    }`.trim();

    if (fullName) return fullName;

    if (authUser.email_address) return authUser.email_address.split("@")[0];
    if (authUser.email) return authUser.email.split("@")[0];

    return "User";
  }, [authUser]);

  const userEmail =
    authUser?.email_address || authUser?.email || "Logged in account";

  const profileImage =
    authUser?.profileImage ||
    authUser?.profile_image ||
    authUser?.avatar ||
    authUser?.photoURL ||
    "";

  const userInitial = username?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Every time route/component changes, show the new route from the top.
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenus = () => {
    setIsOpen(false);
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    dispatch(logout());

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setShowProfileMenu(false);
    setIsOpen(false);

    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-[#f8f3ef]/95 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          onClick={closeMenus}
          className="flex min-w-0 items-center gap-3"
          aria-label="ঘটকদের বাড়ি home"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
            <img
              src={logo}
              alt="ঘটকদের বাড়ি"
              className="h-9 w-9 object-contain"
              loading="eager"
              decoding="async"
            />
          </div>

          <div className="min-w-0 leading-none">
            <h1
              style={{ fontFamily: "Atma" }}
              className="truncate text-2xl font-extrabold tracking-tight"
            >
              <span className="text-rose-600">ঘটকদের</span>
              <span className="ml-1 text-slate-900">বাড়ি</span>
            </h1>

            <p className="mt-1 hidden truncate text-[11px] font-medium text-slate-500 sm:block">
              Trusted matrimony platform
            </p>
          </div>
        </NavLink>

        <div className="hidden items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-slate-100 lg:flex">
          {navLinks.map((item) => (
            <DesktopNavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              iconClassName={item.iconClassName}
              onNavigate={closeMenus}
            />
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {!isLoggedIn ? (
            <>
              <NavLink
                to="/login"
                onClick={closeMenus}
                className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 shadow-sm transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                onClick={closeMenus}
                className="inline-flex h-11 items-center justify-center rounded-full bg-rose-600 px-6 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md"
              >
                Join Now
              </NavLink>
            </>
          ) : (
            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition-all duration-200 hover:border-rose-200 hover:bg-rose-50"
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={username}
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-rose-100"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white">
                    {userInitial}
                  </div>
                )}

                <div className="max-w-[150px] text-left">
                  <p className="truncate text-sm font-bold leading-4 text-slate-900">
                    {username}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] font-medium capitalize text-slate-500">
                    {isAdmin ? "Admin Account" : role || "Member Account"}
                  </p>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-slate-500 transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-3 w-[300px] rounded-[1.5rem] border border-slate-200/70 bg-white p-2 shadow-lg shadow-slate-200/40 ring-1 ring-slate-100/80"
                    role="menu"
                  >
                    <div className="rounded-[1.15rem] bg-[#fbf7f4] p-4">
                      <div className="flex items-center gap-3">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={username}
                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-base font-bold text-white">
                            {userInitial}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {username}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      <NavLink
                        to={profilePath}
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                      >
                        {isAdmin ? (
                          <LayoutDashboard className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}

                        {isAdmin ? "Dashboard" : "My Profile"}
                      </NavLink>

                      {isAdmin && (
                        <NavLink
                          to="/admin/users"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Manage Users
                        </NavLink>
                      )}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-rose-50 hover:text-rose-700 lg:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <HiOutlineX className="h-6 w-6" />
          ) : (
            <HiOutlineMenu className="h-6 w-6" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-slate-100 bg-white lg:hidden"
          >
            <div className="space-y-2 px-4 py-4 sm:px-6">
              {navLinks.map((item) => (
                <MobileNavItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  iconClassName={item.iconClassName}
                  onNavigate={closeMenus}
                />
              ))}

              <div className="mt-4 border-t border-slate-100 pt-4">
                {!isLoggedIn ? (
                  <div className="grid grid-cols-1 gap-3">
                    <NavLink
                      to="/login"
                      onClick={closeMenus}
                      className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                    >
                      Login
                    </NavLink>

                    <NavLink
                      to="/register"
                      onClick={closeMenus}
                      className="inline-flex h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
                    >
                      Join Now
                    </NavLink>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-3xl bg-[#fbf7f4] p-4">
                      <div className="flex items-center gap-3">
                        {profileImage ? (
                          <img
                            src={profileImage}
                            alt={username}
                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-base font-bold text-white">
                            {userInitial}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {username}
                          </p>
                          <p className="truncate text-xs text-slate-500">
                            {userEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    <NavLink
                      to={profilePath}
                      onClick={closeMenus}
                      className="flex h-12 items-center justify-center rounded-2xl bg-rose-600 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
                    >
                      {isAdmin ? "Dashboard" : "My Profile"}
                    </NavLink>

                    {isAdmin && (
                      <NavLink
                        to="/admin/users"
                        onClick={closeMenus}
                        className="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700"
                      >
                        Manage Users
                      </NavLink>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex h-12 w-full items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

function DesktopNavItem({ to, label, icon: Icon, iconClassName = "", onNavigate }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${desktopLinkBase} ${
          isActive ? desktopLinkActive : desktopLinkInactive
        }`
      }
    >
      {Icon ? <Icon className={`h-4 w-4 ${iconClassName}`} /> : null}
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, icon: Icon, iconClassName = "", onNavigate }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        `${mobileLinkBase} ${isActive ? mobileLinkActive : mobileLinkInactive}`
      }
    >
      {Icon ? <Icon className={`h-4 w-4 ${iconClassName}`} /> : null}
      {label}
    </NavLink>
  );
}