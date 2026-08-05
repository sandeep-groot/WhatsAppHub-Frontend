import { API_ROUTES } from "@/lib/constants";
import { getApiBaseUrl } from "@/lib/env";
import type { ApiResponseBody } from "@/lib/http/types";
import type { LoginResponse } from "@/modules/auth/types";
import axios from "axios";
import { clearAuthSession, getStoredUser, setStoredUser } from "./index";
import { toStoredUser } from "./user-mapper";

const refreshClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let refreshPromise: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  try {
    const response = await refreshClient.post<ApiResponseBody<LoginResponse>>(
      API_ROUTES.AUTH.REFRESH,
      {},
    );

    const body = response.data;
    if (!body.success) {
      return false;
    }

    if (body.data?.user) {
      setStoredUser(toStoredUser(body.data.user));
    } else {
      const cached = getStoredUser();
      if (!cached) {
        return false;
      }
    }

    return true;
  } catch {
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
