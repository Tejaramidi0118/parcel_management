// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiSignup, apiLogin, apiMe, setAuthToken, clearAuthToken, } from "@/api";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        return (localStorage.getItem("auth_token") ||
            localStorage.getItem("authToken") || // legacy
            null);
    });
    const [loading, setLoading] = useState(Boolean(token));
    const [initializing, setInitializing] = useState(true);
    // alias for compatibility with different naming in other components
    const isLoading = loading;
    // Sync token changes → API layer + localStorage
    useEffect(() => {
        if (token) {
            setAuthToken(token);
            localStorage.setItem("auth_token", token);
            localStorage.setItem("authToken", token);
        }
        else {
            clearAuthToken();
            localStorage.removeItem("auth_token");
            localStorage.removeItem("authToken");
        }
    }, [token]);
    // Convert backend user → frontend User type
    function mapApiUser(apiUser) {
        return {
            id: apiUser.user_id?.toString?.() ?? apiUser.id?.toString?.() ?? "",
            username: apiUser.username ?? "",
            name: apiUser.full_name ?? apiUser.name ?? "",
            email: apiUser.email ?? "",
            address: apiUser.address ??
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
                    }
                    catch { }
                }
            }
            catch (err) {
                console.warn("Session expired or invalid token:", err);
                setToken(null);
                setUser(null);
                try {
                    localStorage.removeItem("currentUser");
                }
                catch { }
            }
            finally {
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
    const signup = async (payload) => {
        const res = await apiSignup(payload);
        // Backend returns { success, data: { user, accessToken, refreshToken } }
        return res; // signup does NOT auto-login by design
    };
    // LOGIN
    const login = async (id, password) => {
        setLoading(true);
        try {
            const res = await apiLogin({ id, password });

            // Backend returns { success, data: { user, accessToken, refreshToken } }
            if (!res?.data?.accessToken) {
                setLoading(false);
                return { success: false };
            }

            // set token (this will also call setAuthToken via effect)
            setToken(res.data.accessToken);
            const mapped = mapApiUser(res.data.user);
            setUser(mapped);
            // persist current user for other parts of the UI / page reloads
            try {
                localStorage.setItem("currentUser", JSON.stringify(mapped));
            }
            catch { }
            setLoading(false);
            setLoading(false);
            return { success: true, user: mapped };
        }
        catch (err) {
            console.error("Login failed:", err);
            setLoading(false);
            return { success: false, error: err };
        }
    };
    // LOGOUT
    const logout = () => {
        setToken(null);
        setUser(null);
        try {
            localStorage.removeItem("currentUser");
        }
        catch { }
    };
    const updateProfile = async (updates) => {
        if (!user)
            return;
        const updated = { ...user, ...updates };
        setUser(updated);
        try {
            localStorage.setItem("currentUser", JSON.stringify(updated));
        }
        catch { }
    };
    const hasRole = (role) => {
        return user?.role === role;
    };
    return (<AuthContext.Provider value={{
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
    }}>
        {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
}
