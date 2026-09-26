import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentAdmin,
  logoutAdmin,
} from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // CLEAR AUTH SESSION
  // ==========================================

  const clearAuth = useCallback(() => {
    logoutAdmin();
    setAdmin(null);
  }, []);

  // ==========================================
  // LOAD CURRENT ADMIN
  // ==========================================

  const loadAdmin = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data = await getCurrentAdmin();

      if (data?.admin) {
        setAdmin(data.admin);

        localStorage.setItem(
          "admin",
          JSON.stringify(data.admin)
        );
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  // ==========================================
  // INITIAL AUTH CHECK
  // ==========================================

  useEffect(() => {
    loadAdmin();
  }, [loadAdmin]);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = useCallback(
    async (token, adminData = null) => {
      if (!token) {
        throw new Error("Authentication token is required.");
      }

      localStorage.setItem("token", token);
      setLoading(true);

      if (adminData) {
        setAdmin(adminData);

        localStorage.setItem(
          "admin",
          JSON.stringify(adminData)
        );

        setLoading(false);
        return adminData;
      }

      try {
        const data = await getCurrentAdmin();

        if (!data?.admin) {
          throw new Error("Unable to load administrator profile.");
        }

        setAdmin(data.admin);

        localStorage.setItem(
          "admin",
          JSON.stringify(data.admin)
        );

        return data.admin;
      } catch (error) {
        console.error(
          "Failed to load admin after login:",
          error
        );

        clearAuth();
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clearAuth]
  );

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  // ==========================================
  // AUTH CONTEXT
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: Boolean(admin),
        login,
        logout,
        loadAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// CUSTOM AUTH HOOK
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
