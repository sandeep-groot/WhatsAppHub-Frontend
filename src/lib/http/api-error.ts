import type { AxiosError } from "axios";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface ErrorPayload {
  message?: string;
  error?: string;
  code?: string;
  success?: boolean;
}

export function extractErrorMessage(
  data: Record<string, unknown> | undefined,
  fallback: string,
): string {
  if (!data) return fallback;
  if (typeof data.message === "string" && data.message) {
    return data.message;
  }
  if (typeof data.error === "string" && data.error) {
    return data.error;
  }
  return fallback;
}

export function toApiError(
  status: number,
  data: Record<string, unknown> | undefined,
  fallback: string,
): ApiError {
  return new ApiError(
    status,
    extractErrorMessage(data, fallback),
    typeof data?.code === "string" ? data.code : undefined,
  );
}

export function fromAxiosError(error: AxiosError): ApiError {
  const status = error.response?.status ?? 500;
  const data = error.response?.data as ErrorPayload | undefined;
  return toApiError(status, data as Record<string, unknown> | undefined, error.message);
}
