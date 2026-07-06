import { clearAuthSession } from "@/lib/auth";
import { refreshAccessToken } from "@/lib/auth/token-refresh";
import { notifySessionExpired } from "@/lib/auth/session-events";
import { API_ROUTES } from "@/lib/constants";
import { getApiBaseUrl } from "@/lib/env";
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { fromAxiosError } from "./api-error";
import { unwrapApiData } from "./unwrap";

const AUTH_SKIP_REFRESH_PATHS = [
  API_ROUTES.AUTH.LOGIN,
  API_ROUTES.AUTH.SIGNUP,
  API_ROUTES.AUTH.REFRESH,
  API_ROUTES.AUTH.LOGOUT,
] as const;

function isSkipRefreshPath(url: string | undefined): boolean {
  if (!url) return false;
  return AUTH_SKIP_REFRESH_PATHS.some((path) => url.includes(path));
}

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  skipAuth?: boolean;
  skipAuthRefresh?: boolean;
};

type QueueItem = {
  resolve: () => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: unknown | null): void {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve();
    }
  });
  failedQueue = [];
}

function handleAuthFailure(error: unknown): void {
  clearAuthSession();
  notifySessionExpired();
  processQueue(error);
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig | undefined;

    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(fromAxiosError(error));
    }

    const status = error.response?.status;
    const shouldAttemptRefresh =
      status === 401 &&
      !originalRequest.skipAuthRefresh &&
      !isSkipRefreshPath(originalRequest.url) &&
      !originalRequest.skipAuth;

    if (!shouldAttemptRefresh) {
      return Promise.reject(fromAxiosError(error));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: () => resolve(apiClient(originalRequest)),
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshed = await refreshAccessToken();
      if (!refreshed) {
        handleAuthFailure(error);
        return Promise.reject(fromAxiosError(error));
      }

      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      handleAuthFailure(refreshError);
      return Promise.reject(fromAxiosError(error));
    } finally {
      isRefreshing = false;
    }
  },
);

export function parseAxiosResponse<T>(response: { status: number; data: unknown }): T {
  return unwrapApiData<T>(response.status, response.data);
}
