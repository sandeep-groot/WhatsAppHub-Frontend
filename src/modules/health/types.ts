/**
 * Backend health check types (GET /v1/health, /health/live, /health/ready).
 */

export interface HealthChecks {
  database: string;
}

export interface HealthData {
  status: string;
  checks?: HealthChecks;
  timestamp: string;
}

export interface HealthReadyErrorBody {
  statusCode?: number;
  error?: string;
  message?: string;
  correlationId?: string;
  details?: HealthData;
}

export type HealthEndpoint = "health" | "health/live" | "health/ready";

export interface HealthCheckResult {
  ok: boolean;
  data: HealthData | null;
  httpStatus: number;
  errorMessage?: string;
}

export interface SystemHealthStatus {
  summary: HealthCheckResult | null;
  live: HealthCheckResult | null;
  ready: HealthCheckResult | null;
  unreachable: boolean;
  lastChecked: string;
}
