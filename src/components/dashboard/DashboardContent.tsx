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

export default function DashboardContent() {
  const { user, isLoading: isAuthLoading } = useAuth();

  // Query phone numbers with a polling interval of 10s for real-time monitoring
  const { data: numbers, isLoading: isNumbersLoading } = useQuery<WhatsAppNumber[]>({
    queryKey: ["whatsapp", "numbers"],
    queryFn: async () => {
      return apiFetch<WhatsAppNumber[]>("/whatsapp/numbers");
    },
    refetchInterval: 10000,
  });

  if (isAuthLoading || isNumbersLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.name || user.email;

  // Compute stats
  const totalNumbers = numbers?.length || 0;
  const activeConnections = numbers?.filter(n => n.connectionStatus === "ACTIVE").length || 0;
  const errorConnections = numbers?.filter(n => n.connectionStatus === "ERROR" || n.connectionStatus === "INACTIVE").length || 0;
  const pendingOnboarding = numbers?.filter(n => n.connectionStatus === "PENDING" || n.connectionStatus === "IN_PROGRESS").length || 0;
  const totalMessages = numbers?.reduce((acc, curr) => acc + curr.messageCount, 0) || 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header Panel */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Console Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, <span className="font-semibold text-emerald-600 dark:text-emerald-400">{displayName}</span>. Here is the operational state of your clients.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          + Connect New WABA
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Connections */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Registered WABAs</p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{totalNumbers}</h4>
            </div>
          </div>
        </div>

        {/* Card 2: Active Connections */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Active Connections</p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{activeConnections}</h4>
            </div>
          </div>
        </div>

        {/* Card 3: Error Connections */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Broken/Errors</p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{errorConnections}</h4>
            </div>
          </div>
        </div>

        {/* Card 4: Total Message Count */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-6 shadow-sm transition-all duration-200 hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Inbound Messages</p>
              <h4 className="text-2xl font-black text-gray-900 dark:text-white mt-0.5">{totalMessages}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Registry Directory */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Connection Registry</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Status directory of all WhatsApp WABA profiles and active gateways.</p>
        </div>

        {totalNumbers === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">No Connections Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
              No numbers have been onboarded yet. Get started by connecting your first WABA profile.
            </p>
            <Link
              href="/onboarding"
              className="mt-4 inline-flex px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
            >
              Start Onboarding Flow
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-4">Client Name</th>
                  <th scope="col" className="px-6 py-4">WhatsApp Number</th>
                  <th scope="col" className="px-6 py-4">Provider</th>
                  <th scope="col" className="px-6 py-4">Connection Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Messages Received</th>
                  <th scope="col" className="px-6 py-4">Last Activity</th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {numbers?.map((num) => {
                  let statusBadge = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
                  if (num.connectionStatus === "ACTIVE") {
                    statusBadge = "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400";
                  } else if (num.connectionStatus === "PENDING" || num.connectionStatus === "IN_PROGRESS") {
                    statusBadge = "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-400";
                  } else if (num.connectionStatus === "ERROR") {
                    statusBadge = "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400";
                  }

                  const activePing = num.lastPing ? new Date(num.lastPing).toLocaleString() : "Never";

                  return (
                    <tr key={num.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20 transition-colors duration-150">
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                        {num.client.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {num.phoneNumber}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        YCloud (BSP)
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-lg ${statusBadge}`}>
                          {num.connectionStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold">
                        {num.messageCount}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {activePing}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/clients?selected=${num.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/30 hover:bg-emerald-50/20 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          View Console
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
