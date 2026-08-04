"use client";

import {
  getCurrentUser,
  loginWithCredentials,
  logoutSession,
} from "@/lib/auth/auth.service";
import { clearAuthSession, getStoredUser, type StoredAuthUser } from "@/lib/auth";
import { onSessionExpired } from "@/lib/auth/session-events";
import { PAGE_ROUTES } from "@/lib/constants";
import { ApiError } from "@/lib/http";
import { useRouter } from "next/navigation";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StoredAuthUser | null;
  sessionExpiredMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<boolean>;
  clearSessionExpiredMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<StoredAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState<string | null>(
    null,
  );
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  const clearSessionExpiredMessage = useCallback(() => {
    setSessionExpiredMessage(null);
  }, []);

  const handleSessionExpired = useCallback((message: string) => {
    setIsAuthenticated(false);
    setUser(null);
    setSessionExpiredMessage(message);
    const loginUrl = new URL(PAGE_ROUTES.LOGIN, window.location.origin);
    loginUrl.searchParams.set("sessionExpired", "1");
    setPendingRedirect(loginUrl.pathname + loginUrl.search);
  }, []);

  useEffect(() => {
    return onSessionExpired(handleSessionExpired);
  }, [handleSessionExpired]);

  useEffect(() => {
    if (!pendingRedirect) return;
    router.replace(pendingRedirect);
    setPendingRedirect(null);
  }, [pendingRedirect, router]);

  const refreshUser = useCallback(async (): Promise<boolean> => {
    try {
      const profile = await getCurrentUser();
      setIsAuthenticated(true);
      setUser(profile);
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        clearAuthSession();
      }
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const cachedUser = getStoredUser();
      if (cachedUser && !cancelled) {
        setUser(cachedUser);
      }

      const ok = await refreshUser();
      if (!cancelled) {
        if (!ok) {
          setIsAuthenticated(false);
          setUser(null);
        }
        setIsLoading(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      clearSessionExpiredMessage();
      try {
        await loginWithCredentials(email, password);
        const ok = await refreshUser();
        if (!ok) {
          throw new ApiError(401, "Unable to verify your session. Please try again.");
        }
      } catch (err) {
        clearAuthSession();
        setIsAuthenticated(false);
        setUser(null);
        if (err instanceof ApiError) {
          throw err;
        }
        throw new ApiError(500, "Unable to sign in. Please try again.");
      }
    },
    [refreshUser, clearSessionExpiredMessage],
  );

  const logout = useCallback(() => {
    setIsLoading(true);
    void logoutSession().finally(() => {
      clearAuthSession();
      setIsAuthenticated(false);
      setUser(null);
      clearSessionExpiredMessage();
      if (typeof window !== "undefined") {
        window.location.href = PAGE_ROUTES.LOGIN;
      }
    });
  }, [clearSessionExpiredMessage]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        sessionExpiredMessage,
        login,
        logout,
        refreshUser,
        clearSessionExpiredMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
