import { Navigate, Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck size={28} strokeWidth={1.9} />
          </div>

          <div
            className="mx-auto mt-5 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600"
            aria-hidden="true"
          />

          <h1 className="mt-4 text-sm font-semibold text-slate-800">
            Checking authentication
          </h1>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Please wait while we securely verify your session.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
