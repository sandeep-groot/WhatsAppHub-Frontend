import { toApiError } from "./api-error";
import type { ApiResponseBody } from "./types";

export function unwrapApiData<T>(status: number, payload: unknown): T {
  const data = payload as ApiResponseBody<T> & Record<string, unknown>;

  if (data && typeof data === "object" && data.success === false) {
    throw toApiError(status, data, "Request failed");
  }

  if (data && typeof data === "object" && data.success === true && data.data !== undefined) {
    return data.data;
  }

  return payload as T;
}
