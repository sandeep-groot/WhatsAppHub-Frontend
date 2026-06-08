import { API_ROUTES } from "@/lib/constants";
import { env } from "@/lib/env";
import type { ApiResponseBody } from "@/lib/http/types";
import type { LoginResponse } from "@/modules/auth/types";
import axios from "axios";
import {
  clearAuthSession,
  getRefreshToken,
  getStoredUser,
  setAuthSession,
  type StoredAuthUser,
} from "./index";
import { scheduleProactiveRefresh, clearProactiveRefresh } from "./proactive-refresh";
import { toStoredUser } from "./user-mapper";

const refreshClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL.replace(/\/$/, ""),
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    clearProactiveRefresh();
    return false;
  }

  try {
    const response = await refreshClient.post<ApiResponseBody<LoginResponse>>(
      API_ROUTES.AUTH.REFRESH,
      { refreshToken },
    );

    const body = response.data;
    if (!body.success || !body.data) {
      clearAuthSession();
      clearProactiveRefresh();
      return false;
    }

    const { accessToken, refreshToken: newRefresh, user } = body.data;
    const storedUser: StoredAuthUser = user
      ? toStoredUser(user)
      : (getStoredUser() as StoredAuthUser);

    if (!storedUser) {
      clearAuthSession();
      clearProactiveRefresh();
      return false;
    }

    setAuthSession(accessToken, storedUser, newRefresh);
    scheduleProactiveRefresh(accessToken, () => refreshAccessToken());
    return true;
  } catch {
    clearAuthSession();
    clearProactiveRefresh();
    return false;
  }
}

/** Single-flight refresh — concurrent 401s share one refresh request. */
export function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export function startProactiveRefresh(accessToken: string): void {
  scheduleProactiveRefresh(accessToken, () => refreshAccessToken());
}

export function stopProactiveRefresh(): void {
  clearProactiveRefresh();
}
