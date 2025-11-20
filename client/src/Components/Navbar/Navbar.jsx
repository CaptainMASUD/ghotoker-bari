import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import { FaUserCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Redux/UserSlice/UserSlice";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../Logo/logo.svg";

/* ---------- DESKTOP link styles (with footer-style hover underline) ---------- */
const linkBase =
  "relative block px-3 py-2 font-medium transition duration-300 ease-in-out";
const desktopHoverUnderline =
  "after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:scale-x-0 after:origin-left after:bg-gradient-to-r after:from-fuchsia-300 after:via-pink-300 after:to-rose-300 hover:after:scale-x-100 after:transition-transform after:duration-200 after:ease-out";
const linkInactiveDesktop =
  "text-white/90 hover:text-rose-200 " + desktopHoverUnderline;
const linkActiveDesktop =
  "text-rose-300 font-semibold after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-[2px] after:rounded-full after:bg-gradient-to-r after:from-fuchsia-300 after:via-pink-300 after:to-rose-300";

/* ---------- MOBILE link styles (no underline animation) ---------- */
const linkInactiveMobile = "text-white/90 hover:bg-white/5 hover:text-rose-200";
const linkActiveMobile = "bg-white/10 text-rose-300";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const { currentUser } = useSelector((state) => state.user);
  const username = currentUser?.first_name || "User";

  // Scroll effect for glass background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    setShowProfileMenu(false);
  };

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-500 ease-in-out ${
        scrolled ? "backdrop-blur-md shadow-xl" : "bg-transparent"
      }`}
      style={{ backgroundColor: scrolled ? "#141414cc" : "transparent" }}
      animate={{ backgroundColor: scrolled ? "#141414cc" : "transparent" }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-12 flex justify-between items-center h-14 lg:h-[60px]">
        {/* Logo + Bangla brand text */}
        <NavLink
          to="/"
          className="flex items-center gap-3 group"
          aria-label="Go to home"
        >
          <img
            src={logo}
            alt="GhotokerBari logo"
            className="h-10 sm:h-11 lg:h-12 w-auto select-none pointer-events-none transition-transform duration-300 group-hover:scale-105"
            loading="eager"
            decoding="async"
          />
          {/* Bangla brand text: 'ঘটকদের' (reddish) + 'বাড়ি' (white) */}
          <span style={{fontFamily: "Atma"}} className="flex items-baseline leading-none font-extrabold tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
            <span className="text-rose-400 text-xl sm:text-2xl">ঘটকদের</span>
            <span className="text-white text-xl sm:text-2xl ml-1">বাড়ি</span>
          </span>
        </NavLink>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-2 relative">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActiveDesktop : linkInactiveDesktop}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/find-matches"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActiveDesktop : linkInactiveDesktop}`
            }
          >
            Find Matches
          </NavLink>
          <NavLink
            to="/success-stories"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActiveDesktop : linkInactiveDesktop}`
            }
          >
            Success Stories
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActiveDesktop : linkInactiveDesktop}`
            }
          >
            Contact
          </NavLink>

          {!currentUser ? (
            <div className="ml-2 flex items-center gap-3">
              <NavLink
                to="/register"
                className="cursor-pointer rounded-xl px-4 py-2 font-semibold text-neutral-900
                           bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                           shadow-lg shadow-rose-900/20 hover:shadow-xl transition"
              >
                Join Now
              </NavLink>
              <NavLink
                to="/login"
                className="cursor-pointer rounded-xl px-4 py-2 font-semibold text-rose-300
                           border border-rose-300/70 bg-white/0 hover:bg-rose-300/10 transition"
              >
                Login
              </NavLink>
            </div>
          ) : (
            <div className="relative ml-3">
              <button
                onClick={() => setShowProfileMenu((s) => !s)}
                className="flex items-center gap-3 text-white font-medium focus:outline-none cursor-pointer"
                aria-haspopup="menu"
                aria-expanded={showProfileMenu}
              >
                <FaUserCircle className="text-3xl text-rose-300" />
                <span className="text-white/90 hover:text-rose-200 transition">
                  {username}
                </span>
              </button>

              {/* Premium user submenu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 mt-3 z-[60]"
                  >
                    {/* Gradient ring wrapper */}
                    <div className="rounded-2xl p-[1px] bg-gradient-to-br from-fuchsia-300/50 via-pink-300/50 to-rose-300/50">
                      <div className="w-60 rounded-2xl border border-white/10 bg-neutral-900/90 backdrop-blur-xl shadow-2xl">
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm text-white/60">Signed in as</p>
                          <p className="text-sm font-semibold text-white">
                            {username}
                          </p>
                        </div>
                        <div className="p-2">
                          <NavLink
                            to="/profile"
                            onClick={() => setShowProfileMenu(false)}
                            className="block w-full text-left rounded-xl px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white transition cursor-pointer"
                          >
                            Profile
                          </NavLink>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left rounded-xl px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white transition cursor-pointer"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsOpen((o) => !o)}
            className="text-white text-3xl focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu — keep without underline animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden"
          >
            {/* Gradient ring frame */}
            <div className="rounded-b-2xl p-[1px] bg-gradient-to-r from-fuchsia-300/40 via-pink-300/40 to-rose-300/40">
              <div
                className="bg-neutral-900/90 backdrop-blur-xl shadow-2xl px-6 py-6 flex flex-col gap-3 rounded-b-2xl border border-white/10"
                role="menu"
                aria-label="Mobile navigation"
              >
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `${linkBase} rounded-xl ${
                      isActive ? linkActiveMobile : linkInactiveMobile
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/find-matches"
                  className={({ isActive }) =>
                    `${linkBase} rounded-xl ${
                      isActive ? linkActiveMobile : linkInactiveMobile
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  Find Matches
                </NavLink>
                <NavLink
                  to="/success-stories"
                  className={({ isActive }) =>
                    `${linkBase} rounded-xl ${
                      isActive ? linkActiveMobile : linkInactiveMobile
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  Success Stories
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `${linkBase} rounded-xl ${
                      isActive ? linkActiveMobile : linkInactiveMobile
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </NavLink>

                {!currentUser ? (
                  <div className="mt-1 grid grid-cols-1 gap-3">
                    <NavLink
                      to="/register"
                      className="cursor-pointer text-center rounded-xl px-4 py-2 font-semibold text-neutral-900
                                 bg-gradient-to-r from-fuchsia-300 via-pink-300 to-rose-300
                                 shadow-lg shadow-rose-900/20 hover:shadow-xl transition"
                      onClick={() => setIsOpen(false)}
                    >
                      Join Now
                    </NavLink>
                    <NavLink
                      to="/login"
                      className="cursor-pointer text-center rounded-xl px-4 py-2 font-semibold text-rose-300
                                 border border-rose-300/70 bg-white/0 hover:bg-rose-300/10 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </NavLink>
                  </div>
                ) : (
                  <div className="mt-1 grid grid-cols-1 gap-3">
                    <NavLink
                      to="/profile"
                      className="cursor-pointer text-center rounded-xl px-4 py-2 font-semibold text-white
                                 bg-white/10 border border-white/10 hover:bg-white/15 transition"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="cursor-pointer text-center rounded-xl px-4 py-2 font-semibold text-rose-300
                                 border border-rose-300/70 bg-white/0 hover:bg-rose-300/10 transition"
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
};

export default Navbar;
