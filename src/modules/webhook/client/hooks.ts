"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/query/keys";
import { apiFetch } from "@/lib/http";
import type {
  CreateWebhookEndpointInput,
  UpdateWebhookEndpointInput,
  Webhook,
} from "../types";

export function useWebhookEndpoints() {
  return useQuery({
    queryKey: queryKeys.webhooks.list(),
    queryFn: async () => {
      return apiFetch<Webhook[]>("/integrations/ycloud/webhook-endpoints");
    },
  });
}

export function useCreateWebhookEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWebhookEndpointInput) => {
      return apiFetch<Webhook>("/integrations/ycloud/webhook-endpoints", {
        method: "POST",
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.list() });
    },
  });
}

export function useUpdateWebhookEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWebhookEndpointInput;
    }) => {
      return apiFetch<Webhook>(`/integrations/ycloud/webhook-endpoints/${id}`, {
        method: "PATCH",
        data,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.webhooks.detail(variables.id),
      });
    },
  });
}

export function useDeleteWebhookEndpoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<unknown>(`/integrations/ycloud/webhook-endpoints/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.list() });
    },
  });
}

export function useRotateWebhookSecret() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch<Webhook>(
        `/integrations/ycloud/webhook-endpoints/${id}/rotate-secret`,
        {
          method: "POST",
        }
      );
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.webhooks.list() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.webhooks.detail(id),
      });
    },
  });
}
