"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const autoLogin = async () => {
            try {
                const email = process.env.NEXT_PUBLIC_EMAIL;
                const password = process.env.NEXT_PUBLIC_PASSWORD;

                if (!email || !password) {
                    console.warn("Auto-login credentials not found in .env");
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (data.success) {
                    sessionStorage.setItem("authToken", data.data.token);
                    setUser(data.data.user);
                } else {
                    setError(data.message);
                    console.error("Auto-login failed:", data.message);
                }
            } catch (err) {
                setError("Failed to connect to server");
                console.error("Auto-login error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        autoLogin();
    }, []);

    const logout = () => {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("user");
        setUser(null);
    };

    const getToken = () => {
        return sessionStorage.getItem("authToken");
    };

    return (
        <AuthContext.Provider value={{ isLoading, user, setUser, error, logout, getToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
