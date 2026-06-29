"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/query/keys";
import { apiFetch } from "@/lib/http";
import type {
  ListTemplatesParams,
  ListTemplatesResponse,
  SendMessageInput,
  SendMessageResult,
} from "../types";

/**
 * Lists approved WhatsApp templates from the backend
 * (GET v1/integrations/ycloud/whatsapp/templates).
 */
export function useWhatsAppTemplates(params: ListTemplatesParams = {}) {
  const { page = 1, limit = 10, includeTotal = false } = params;

  return useQuery({
    queryKey: queryKeys.whatsapp.templates({ page, limit, includeTotal }),
    queryFn: async () => {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        includeTotal: String(includeTotal),
      });
      return apiFetch<ListTemplatesResponse>(
        `/integrations/ycloud/whatsapp/templates?${query.toString()}`
      );
    },
    staleTime: 60 * 1000,
  });
}

/**
 * Sends a WhatsApp message (text or template) through the backend
 * (POST v1/whatsapp/messages/send).
 */
export function useSendWhatsAppMessage() {
  return useMutation<SendMessageResult, Error, SendMessageInput>({
    mutationFn: async (input: SendMessageInput) => {
      return apiFetch<SendMessageResult>("/whatsapp/messages/send", {
        method: "POST",
        data: input,
      });
    },
  });
}
