/**
 * Auth client hooks - use these on the client side for authentication
 */

"use client";

import { useAuth } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/query/keys";
import type { LoginRequest } from "../types";

export function useLogin() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest) =>
      login(credentials.email, credentials.password),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
    },
  });

  return {
    login: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export function useLogout() {
  const { logout } = useAuth();

  return { logout };
}

export function useCurrentUser() {
  const { user, isLoading, refreshUser } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: refreshUser,
    enabled: false,
  });

  return {
    user,
    isLoading,
    refetch: query.refetch,
  };
}
