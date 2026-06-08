import { apiClient, parseAxiosResponse } from "./axios-client";
import { fromAxiosError, ApiError } from "./api-error";
import type { ApiRequestConfig } from "./types";
import axios from "axios";

export { ApiError } from "./api-error";
export { apiClient } from "./axios-client";
export type { ApiRequestConfig } from "./types";

function parseBody(body?: string): unknown {
  if (!body) return undefined;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
}

/**
 * Typed API helper backed by axios (interceptors: auth header, 401 refresh + retry).
 */
export async function apiFetch<T>(url: string, options: ApiRequestConfig = {}): Promise<T> {
  const { method = "GET", data, body, headers, skipAuth, skipAuthRefresh } = options;
  const payload = data ?? parseBody(body);

  try {
    const response = await apiClient.request({
      url,
      method: method.toLowerCase() as "get" | "post" | "put" | "patch" | "delete",
      data: payload,
      headers,
      skipAuth,
      skipAuthRefresh,
    } as Parameters<typeof apiClient.request>[0]);

    if (response.status === 204) {
      return undefined as T;
    }

    return parseAxiosResponse<T>(response);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw fromAxiosError(error);
    }
    throw error;
  }
}
