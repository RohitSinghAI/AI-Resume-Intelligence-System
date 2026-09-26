import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { loginAdmin } from "../../services/authApi";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();

  // ==========================================
  // AUTH CONTEXT
  // ==========================================

  const { login } = useAuth();

  // ==========================================
  // FORM STATES
  // ==========================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const nextFieldErrors = {};

    if (!normalizedEmail) {
      nextFieldErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextFieldErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextFieldErrors.password = "Password is required.";
    }

    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);

      // ======================================
      // CALL LOGIN API
      // ======================================

      const data = await loginAdmin(
        normalizedEmail,
        password
      );

      if (!data?.access_token) {
        throw new Error("Login succeeded but no authentication token was returned.");
      }

      // ======================================
      // SAVE TOKEN + LOAD ADMIN
      // ======================================

      await login(data.access_token);

      // ======================================
      // REDIRECT TO DASHBOARD
      // ======================================

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          error.message ||
          "Invalid email or password."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">

          {/* Logo */}

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">

                <Sparkles size={23} />

              </div>

              <div>

                <h1 className="text-lg font-bold">
                  AI Resume Intelligence
                </h1>

                <p className="text-xs text-indigo-200">
                  Intelligent Recruitment Platform
                </p>

              </div>

            </div>

          </div>

          {/* Hero Content */}

          <div className="max-w-lg">

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
              AI-Powered Recruitment
            </p>

            <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
              Find the right talent with intelligent resume analysis.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-indigo-100">
              Analyze resumes, match candidates with jobs,
              and get AI-powered insights from one centralized
              recruitment platform.
            </p>

          </div>

          {/* Footer */}

          <p className="text-xs text-indigo-200">
            © 2026 AI Resume Intelligence System
          </p>

        </div>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="flex items-center justify-center px-5 py-10 sm:px-8">

          <div className="w-full max-w-md">

            {/* Mobile Logo */}

            <div className="mb-10 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">

                <Sparkles size={23} />

              </div>

              <div>

                <h1 className="text-base font-bold text-slate-800">
                  AI Resume Intelligence
                </h1>

                <p className="text-xs text-slate-400">
                  Intelligent Recruitment Platform
                </p>

              </div>

            </div>

            {/* Header */}

            <div className="mb-8">

              <h2 className="text-3xl font-bold tracking-tight text-slate-800">
                Welcome back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to access your recruitment dashboard.
              </p>

            </div>

            {/* Error */}

            {error && (

              <div
                role="alert"
                aria-live="polite"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
              >

                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span>{error}</span>

              </div>

            )}

            {/* Login Form */}

            <form
              onSubmit={handleLogin}
              noValidate
              className="space-y-5"
            >

              {/* Email */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((previous) => ({
                          ...previous,
                          email: "",
                        }));
                      }
                      if (error) setError("");
                    }}
                    disabled={loading}
                    required
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                </div>

                {fieldErrors.email && (
                  <p
                    id="login-email-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.email}
                  </p>
                )}

              </div>

              {/* Password */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((previous) => ({
                          ...previous,
                          password: "",
                        }));
                      }
                      if (error) setError("");
                    }}
                    disabled={loading}
                    required
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    title={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed"
                  >

                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}

                  </button>

                </div>

                {fieldErrors.password && (
                  <p
                    id="login-password-error"
                    className="mt-2 text-xs font-medium text-red-600"
                  >
                    {fieldErrors.password}
                  </p>
                )}

              </div>

              {/* Login Button */}

              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (

                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Signing in...
                  </>

                ) : (

                  <>
                    <LogIn size={18} />

                    Sign In
                  </>

                )}

              </button>

            </form>

            {/* Register Link */}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 transition hover:text-indigo-700"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Footer */}

            <div className="mt-6 border-t border-slate-100 pt-6 text-center">

              <p className="text-xs leading-5 text-slate-400">

                Secure admin access powered by

                <span className="ml-1 font-semibold text-slate-500">
                  JWT Authentication
                </span>

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;