// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { User, UserRole } from "@/types";
import {
  apiSignup,
  apiLogin,
  apiMe,
  setAuthToken,
  clearAuthToken,
} from "@/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;        // auth busy (e.g., during login)
  isLoading: boolean;      // alias kept for compatibility
  initializing: boolean;   // initial session check
  signup: (payload: any) => Promise<any>;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  isAuthenticated: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return (
      localStorage.getItem("auth_token") ||
      localStorage.getItem("authToken") || // legacy
      null
    );
  });
  const [loading, setLoading] = useState<boolean>(Boolean(token));
  const [initializing, setInitializing] = useState<boolean>(true);

  // alias for compatibility with different naming in other components
  const isLoading = loading;

  // Sync token changes → API layer + localStorage
  useEffect(() => {
    if (token) {
      setAuthToken(token);
      localStorage.setItem("auth_token", token);
      localStorage.setItem("authToken", token);
    } else {
      clearAuthToken();
      localStorage.removeItem("auth_token");
      localStorage.removeItem("authToken");
    }
  }, [token]);

  // Convert backend user → frontend User type
  function mapApiUser(apiUser: any): User {
    return {
      id: apiUser.user_id?.toString?.() ?? apiUser.id?.toString?.() ?? "",
      username: apiUser.username ?? "",
      name: apiUser.full_name ?? apiUser.name ?? "",
      email: apiUser.email ?? "",
      address:
        apiUser.address ??
        apiUser.address_street ??
        "",
      phone: apiUser.phone ?? "",
      role: apiUser.role ?? "customer",
      createdAt: apiUser.created_at ?? "",
      password: "",
    };
  }

  // On load → if token exists, verify session using /auth/me
  useEffect(() => {
    // If no token, skip verification
    if (!token) {
      setInitializing(false);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      try {
        // ensure the api layer has token header BEFORE calling /me
        setAuthToken(token);

        const res = await apiMe();
        if (!cancelled && res?.user) {
          const mapped = mapApiUser(res.user);
          setUser(mapped);
          // persist current user for legacy parts of app
          try {
            localStorage.setItem("currentUser", JSON.stringify(mapped));
          } catch {}
        }
      } catch (err) {
        console.warn("Session expired or invalid token:", err);
        setToken(null);
        setUser(null);
        try {
          localStorage.removeItem("currentUser");
        } catch {}
      } finally {
        if (!cancelled) {
          setInitializing(false);
          setLoading(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // re-run if token changes

  // SIGNUP (backend requires: username, password, full_name, email, address, phone)
  const signup = async (payload: any) => {
    const res = await apiSignup(payload);
    return res; // signup does NOT auto-login by design
  };

  // LOGIN
  const login = async (id: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await apiLogin({ id, password });
      if (!res?.token) {
        setLoading(false);
        return false;
      }

      // set token (this will also call setAuthToken via effect)
      setToken(res.token);

      const mapped = mapApiUser(res.user);
      setUser(mapped);

      // persist current user for other parts of the UI / page reloads
      try {
        localStorage.setItem("currentUser", JSON.stringify(mapped));
      } catch {}

      setLoading(false);
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      setLoading(false);
      return false;
    }
  };

  // LOGOUT
  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("currentUser");
    } catch {}
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      localStorage.setItem("currentUser", JSON.stringify(updated));
    } catch {}
  };

  const hasRole = (role: UserRole) => {
    return user?.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoading,
        initializing,
        signup,
        login,
        logout,
        updateProfile,
        hasRole,
        isAuthenticated: !!user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
