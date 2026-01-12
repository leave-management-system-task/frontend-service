"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { authService } from "@/lib/api/auth";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  pending2FA: boolean;
  login: (
    email: string,
    password: string,
    twoFactorCode?: string
  ) => Promise<{ requiresTwoFactor: boolean; userEmail?: string }>;
  verifyTwoFactorAfterLogin: (code: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending2FA, setPending2FA] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string>("");

  const refreshUser = async () => {
    try {
      const token = Cookies.get("token");
      if (token) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
      Cookies.remove("token");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (
    email: string,
    password: string,
    twoFactorCode?: string
  ): Promise<{ requiresTwoFactor: boolean; userEmail?: string }> => {
    const response = await authService.login({
      email,
      password,
      twoFactorCode,
    });

    // If 2FA is required but no code provided, return flag to show modal
    if (response.requiresTwoFactor && !twoFactorCode) {
      setPending2FA(true);
      setPendingEmail(email);
      return { requiresTwoFactor: true, userEmail: email };
    }

    // If 2FA was provided and login succeeded
    if (response.user) {
      setUser(response.user);
      setPending2FA(false);
      setPendingEmail("");
      return { requiresTwoFactor: false };
    }

    throw new Error("Login failed: No user data received");
  };

  const verifyTwoFactorAfterLogin = async (code: string) => {
    if (!pendingEmail) {
      throw new Error("Email is required for 2FA verification");
    }
    const response = await authService.verifyTwoFactorAfterLogin(
      pendingEmail,
      code
    );
    if (response.user) {
      setUser(response.user);
      setPending2FA(false);
      setPendingEmail("");
    } else {
      throw new Error("2FA verification failed");
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string
  ) => {
    const response = await authService.register({
      email,
      password,
      fullName,
      phoneNumber,
    });
    if (response.user) {
      setUser(response.user);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        pending2FA,
        login,
        verifyTwoFactorAfterLogin,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
