"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/query/keys";
import { fetchSystemHealth } from "./api";

const DEFAULT_INTERVAL_MS = 30_000;

/**
 * Polls /health, /health/live, and /health/ready every 30 s by default.
 * All endpoints are public — no auth token is sent.
 */
export function useSystemHealth(intervalMs = DEFAULT_INTERVAL_MS) {
  return useQuery({
    queryKey: queryKeys.health.system(),
    queryFn: fetchSystemHealth,
    refetchInterval: intervalMs,
    refetchIntervalInBackground: true,
    staleTime: 10_000,
  });
}
