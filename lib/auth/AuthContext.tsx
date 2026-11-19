"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  accountType: "talent" | "company" | "admin";
  role?: string;
}

export interface UserProfileDetails {
  id: string;
  account_type: "talent" | "company" | "admin";
  accountType?: "talent" | "company" | "admin";
  email: string;
  full_name: string;
  fullName?: string;
  avatar_url?: string;
  avatarUrl?: string;
  is_verified: boolean;
  isVerified?: boolean;
  status?: "active" | "suspended" | "deactivated";
  role?: string;
  details?: any;
  talentProfile?: any;
  companyProfile?: any;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  profile: UserProfileDetails | null;
  accountType: "talent" | "company" | "admin" | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  accountType: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const AUTH_CHANGE_EVENT = "ricoz_auth_changed";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [profile, setProfile] = useState<UserProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
          setProfile(data.profile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.warn("Failed to fetch authenticated user session:", err);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    const handleAuthChange = () => {
      fetchCurrentUser();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
  }, [fetchCurrentUser]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setProfile(null);
      window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT));
      router.push("/");
      router.refresh();
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchCurrentUser();
  };

  const accountType = user?.accountType ?? profile?.account_type ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        accountType,
        loading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
