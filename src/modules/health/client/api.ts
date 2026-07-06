import { getApiBaseUrl } from "@/lib/env";
import type {
  HealthCheckResult,
  HealthData,
  HealthEndpoint,
  HealthReadyErrorBody,
  SystemHealthStatus,
} from "../types";

const API_BASE = getApiBaseUrl();

type ApiSuccess<T> = { success: true; data: T };

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Fetches a public health endpoint. Uses plain fetch (no auth headers).
 * `/health/ready` returns HTTP 503 when the database is down — that is treated
 * as a successful check with `ok: false`, not a thrown error.
 */
export async function fetchHealthEndpoint(
  path: HealthEndpoint
): Promise<HealthCheckResult> {
  const res = await fetch(`${API_BASE}/${path}`, {
    headers: { Accept: "application/json" },
    credentials: "include",
  });
  const json = await parseJson(res);

  if (res.ok) {
    const envelope = json as ApiSuccess<HealthData>;
    return {
      ok: true,
      data: envelope.data ?? null,
      httpStatus: res.status,
    };
  }

  const errorBody = json as HealthReadyErrorBody;
  return {
    ok: false,
    data: errorBody.details ?? null,
    httpStatus: res.status,
    errorMessage:
      errorBody.message ?? `Health check failed (HTTP ${res.status}).`,
  };
}

/** Loads all three health endpoints in parallel. */
export async function fetchSystemHealth(): Promise<SystemHealthStatus> {
  try {
    const [summary, live, ready] = await Promise.all([
      fetchHealthEndpoint("health"),
      fetchHealthEndpoint("health/live"),
      fetchHealthEndpoint("health/ready"),
    ]);

    return {
      summary,
      live,
      ready,
      unreachable: false,
      lastChecked: new Date().toISOString(),
    };
  } catch {
    return {
      summary: null,
      live: null,
      ready: null,
      unreachable: true,
      lastChecked: new Date().toISOString(),
    };
  }
}
