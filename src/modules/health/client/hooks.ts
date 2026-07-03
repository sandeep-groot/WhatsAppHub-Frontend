"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/query/keys";
import { fetchSystemHealth } from "./api";
import { POLLING_DEFAULTS } from "@/lib/constants";

/**
 * Polls /health, /health/live, and /health/ready every 30 s by default.
 * All endpoints are public — no auth token is sent.
 */
export function useSystemHealth(
  intervalMs = POLLING_DEFAULTS.healthIntervalMs
) {
  return useQuery({
    queryKey: queryKeys.health.system(),
    queryFn: fetchSystemHealth,
    refetchInterval: intervalMs,
    refetchIntervalInBackground: true,
    staleTime: POLLING_DEFAULTS.healthStaleTimeMs,
  });
}
