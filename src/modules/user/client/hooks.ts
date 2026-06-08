/**
 * Custom hooks for data fetching and mutations
 * These hooks should be placed in modules/ or lib/ depending on their scope
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { API_ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/http";
import { queryKeys } from "@/query/keys";

// Example: Users query hook
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: async () => {
      return apiFetch(API_ROUTES.USERS);
    },
  });
}

// Example: Create user mutation hook
export function useCreateUser() {
  return useMutation({
    mutationFn: async (data: unknown) => {
      return apiFetch(API_ROUTES.USERS, {
        method: "POST",
        data,
      });
    },
  });
}

// Example: Get single user
export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      return apiFetch(`${API_ROUTES.USERS}/${id}`);
    },
    enabled: !!id,
  });
}
