"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/query/keys";
import { apiFetch } from "@/lib/http";
import { mockPhonePage, mockWabaPage } from "../mock";
import type { BusinessNode, PagedResponse, PhoneNumber, WabaAccount } from "../types";
import { buildBusinessHierarchy, computeAccountKpis } from "../utils";

export const YCLOUD_ACCOUNTS_REFETCH_MS = 30_000;

export function useYCloudBusinessAccounts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.clients.ycloudBusinessAccounts(),
    queryFn: () =>
      apiFetch<PagedResponse<WabaAccount>>(
        "/integrations/ycloud/whatsapp/business-accounts"
      ),
    refetchInterval: YCLOUD_ACCOUNTS_REFETCH_MS,
    enabled: options?.enabled ?? true,
  });
}

export function useYCloudPhoneNumbers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.clients.ycloudPhoneNumbers(),
    queryFn: () =>
      apiFetch<PagedResponse<PhoneNumber>>(
        "/integrations/ycloud/whatsapp/phone-numbers?page=1&limit=10&includeTotal=false"
      ),
    refetchInterval: YCLOUD_ACCOUNTS_REFETCH_MS,
    enabled: options?.enabled ?? true,
  });
}

export interface UseYCloudAccountsOptions {
  enabled?: boolean;
  /** When true, returns mock data instead of calling the API. */
  testMode?: boolean;
}

/**
 * Shared hook for YCloud business accounts + phone numbers.
 * Builds the business hierarchy and KPI totals used on Dashboard and Clients.
 */
export function useYCloudAccounts(options: UseYCloudAccountsOptions = {}) {
  const { enabled = true, testMode = false } = options;
  const queriesEnabled = enabled && !testMode;

  const businessQuery = useYCloudBusinessAccounts({ enabled: queriesEnabled });
  const phoneQuery = useYCloudPhoneNumbers({ enabled: queriesEnabled });

  const wabaPage = testMode ? mockWabaPage : businessQuery.data;
  const phonePage = testMode ? mockPhonePage : phoneQuery.data;

  const businesses = useMemo<BusinessNode[]>(
    () => buildBusinessHierarchy(wabaPage?.items ?? [], phonePage?.items ?? []),
    [wabaPage, phonePage]
  );

  const kpis = useMemo(() => computeAccountKpis(businesses), [businesses]);

  const isLoading =
    !testMode && (businessQuery.isLoading || phoneQuery.isLoading);
  const isFetching =
    !testMode && (businessQuery.isFetching || phoneQuery.isFetching);
  const isError =
    !testMode && (businessQuery.isError || phoneQuery.isError);
  const error = businessQuery.error ?? phoneQuery.error;

  const refetch = () => {
    businessQuery.refetch();
    phoneQuery.refetch();
  };

  return {
    businesses,
    kpis,
    wabaPage,
    phonePage,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    businessQuery,
    phoneQuery,
  };
}
