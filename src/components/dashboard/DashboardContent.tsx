"use client";

import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/http";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

interface WhatsAppNumber {
  id: string;
  clientId: string;
  phoneNumber: string;
  voipProvider: string | null;
  connectionStatus: "PENDING" | "IN_PROGRESS" | "ACTIVE" | "INACTIVE" | "ERROR";
  lastPing: string | null;
  messageCount: number;
  client: {
    id: string;
    name: string;
  };
}

interface ClientRecord {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  numbers: WhatsAppNumber[];
}

export default function DashboardContent() {
  const { user, isLoading: isAuthLoading } = useAuth();

  // Query WABA numbers
  const { data: numbers, isLoading: isNumbersLoading } = useQuery<WhatsAppNumber[]>({
    queryKey: ["whatsapp", "numbers"],
    queryFn: async () => {
      return apiFetch<WhatsAppNumber[]>("/whatsapp/numbers");
    },
    refetchInterval: 10000,
  });

  // Query clients
  const { data: clients, isLoading: isClientsLoading } = useQuery<ClientRecord[]>({
    queryKey: ["whatsapp", "clients"],
    queryFn: async () => {
      return apiFetch<ClientRecord[]>("/whatsapp/clients");
    },
    refetchInterval: 10000,
  });

  if (isAuthLoading || isNumbersLoading || isClientsLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading operational overview...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Compute Client Stats
  const totalClients = clients?.length || 0;
  const activeClients = clients?.filter((c) => c.status === "ACTIVE").length || 0;
  const inactiveClients = totalClients - activeClients;

  // Compute Webhook / Connection Stats
  const totalWebhooks = numbers?.length || 0;
  const activeWebhooks = numbers?.filter((n) => n.connectionStatus === "ACTIVE").length || 0;
  const inactiveWebhooks = totalWebhooks - activeWebhooks;

  // Key business KPIs
  const totalMessages = numbers?.reduce((acc, curr) => acc + curr.messageCount, 0) || 0;

  return (
    <div className="space-y-8 animate-fade-in pt-2">
      {/* Top Banner / Welcome Info */}
      <div className="flex flex-col gap-1 border-b border-gray-100 dark:border-gray-800 pb-4">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Executive Control Panel
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          High-level operational stats, client directory distribution, and channel webhook delivery metrics.
        </p>
      </div>
      {/* SECTION 1: Client Metrics */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Client Profiles Overview
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Card: Total Clients */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Clients</p>
                <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{totalClients}</h4>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Registered Client Accounts</p>
            </div>
          </div>

          {/* Card: Active Clients */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Clients</p>
                <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{activeClients}</h4>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Functional Status ACTIVE</p>
            </div>
          </div>

          {/* Card: Inactive Clients */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Inactive Clients</p>
                <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{inactiveClients}</h4>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-500/10 text-gray-500 dark:text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Disabled or offline accounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Webhook / Channel Metrics */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Webhook Integrations & Channels
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Card: Total Webhooks */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Webhooks</p>
                <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{totalWebhooks}</h4>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Registered WABA connections</p>
            </div>
          </div>

          {/* Card: Active Webhooks */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Active Webhooks</p>
                <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{activeWebhooks}</h4>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Receiving active payloads</p>
            </div>
          </div>

          {/* Card: Inactive Webhooks */}
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Inactive Webhooks</p>
                <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{inactiveWebhooks}</h4>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${inactiveWebhooks > 0 ? "bg-error-500 animate-pulse" : "bg-gray-300"}`} />
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Offline or pending steps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Registry Link Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">Looking for WABA connection details?</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage numbers, webhook endpoints, last active timestamps, and connection status filters in the separate Registry console.</p>
        </div>
        <Link
          href="/connections"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs transition-all shadow-sm hover:scale-[1.01]"
        >
          Open Connection Registry →
        </Link>
      </div>
    </div>
  );
}
