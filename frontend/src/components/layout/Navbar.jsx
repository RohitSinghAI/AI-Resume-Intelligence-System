import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Bell,
  Search,
  UserCircle,
  Settings,
  LogOut,
  User,
  X,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const navigate = useNavigate();

  // ==========================================
  // AUTH
  // ==========================================

  const { admin, logout } = useAuth();

  // ==========================================
  // STATES
  // ==========================================

  const [search, setSearch] = useState("");

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = (e) => {
    e.preventDefault();

    const value = search.trim();

    if (!value) return;

    navigate(
      `/resumes?search=${encodeURIComponent(value)}`
    );
  };

  // ==========================================
  // CLEAR SEARCH
  // ==========================================

  const handleClearSearch = () => {
    setSearch("");
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    logout();

    window.location.replace("/");
  };

  // ==========================================
  // TOGGLE NOTIFICATIONS
  // ==========================================

  const toggleNotifications = () => {
    setShowNotifications(
      (previous) => !previous
    );

    setShowProfile(false);
  };

  // ==========================================
  // TOGGLE PROFILE
  // ==========================================

  const toggleProfile = () => {
    setShowProfile(
      (previous) => !previous
    );

    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-sm backdrop-blur-md sm:px-6">

      {/* ======================================
          LEFT - SEARCH
      ====================================== */}

      <div className="flex min-w-0 flex-1 items-center">

        <form
          onSubmit={handleSearch}
          className="relative w-full max-w-xl"
        >

          <Search
            size={18}
            strokeWidth={2}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search resumes, jobs, candidates..."
            aria-label="Search resumes, jobs, candidates"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-10 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
          />

          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}

        </form>

      </div>

      {/* ======================================
          RIGHT SECTION
      ====================================== */}

      <div className="ml-4 flex items-center gap-2 sm:gap-4">

        {/* ====================================
            NOTIFICATION
        ==================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={toggleNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700"
          >

            <Bell
              size={20}
              strokeWidth={1.9}
            />

            <span className="absolute right-2 top-1.5 flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />

            </span>

          </button>

          {/* Notification Dropdown */}

          {showNotifications && (

            <div className="absolute right-0 top-12 z-50 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>

                  <h3 className="text-sm font-bold text-slate-800">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Stay updated with your activity
                  </p>

                </div>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600">
                  0 New
                </span>

              </div>

              <div className="px-5 py-8 text-center">

                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">

                  <CheckCircle2
                    size={24}
                    className="text-slate-300"
                  />

                </div>

                <p className="mt-3 text-sm font-semibold text-slate-600">
                  You're all caught up
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  No new notifications at the moment.
                </p>

              </div>

              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-center">

                <span className="text-xs font-medium text-slate-400">
                  AI Resume Intelligence System
                </span>

              </div>

            </div>

          )}

        </div>

        {/* Divider */}

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* ====================================
            PROFILE
        ==================================== */}

        <div className="relative">

          <button
            type="button"
            onClick={toggleProfile}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all hover:bg-slate-50"
          >

            {/* Avatar */}

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600 ring-1 ring-indigo-100">

              <UserCircle
                size={25}
                strokeWidth={1.8}
              />

            </div>

            {/* User Info */}

            <div className="hidden text-left lg:block">

              <p className="text-sm font-semibold leading-5 text-slate-700">
                {admin?.name || "Admin"}
              </p>

              <p className="max-w-[150px] truncate text-[11px] font-medium text-slate-400">
                {admin?.email || "Administrator"}
              </p>

            </div>

            <ChevronDown
              size={16}
              className={`hidden text-slate-400 transition-transform lg:block ${showProfile
                  ? "rotate-180"
                  : ""
                }`}
            />

          </button>

          {/* ==================================
              PROFILE DROPDOWN
          ================================== */}

          {showProfile && (

            <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60">

              {/* Profile Header */}

              <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">

                    <UserCircle size={27} />

                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-bold text-slate-800">
                      {admin?.name || "Admin"}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {admin?.email || "Administrator"}
                    </p>

                  </div>

                </div>

              </div>

              {/* Menu */}

              <div className="p-2">

                {/* Profile */}

                <button
                  type="button"
                  onClick={() =>
                    setShowProfile(false)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">

                    <User size={16} />

                  </span>

                  <span>Profile</span>

                </button>

                {/* Settings */}

                <Link
                  to="/settings"
                  onClick={() =>
                    setShowProfile(false)
                  }
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">

                    <Settings size={16} />

                  </span>

                  <span>Settings</span>

                </Link>

              </div>

              {/* Logout */}

              <div className="border-t border-slate-100 p-2">

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">

                    <LogOut size={16} />

                  </span>

                  <span>Logout</span>

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;