/**
 * Query client configuration for TanStack Query (React Query)
 */

import { QueryClient } from "@tanstack/react-query";
import { QUERY_DEFAULTS } from "@/lib/constants";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: QUERY_DEFAULTS.staleTimeMs,
      gcTime: QUERY_DEFAULTS.gcTimeMs,
      retry: QUERY_DEFAULTS.retry,
      refetchOnWindowFocus: QUERY_DEFAULTS.refetchOnWindowFocus,
    },
    mutations: {
      retry: QUERY_DEFAULTS.retry,
    },
  },
});
