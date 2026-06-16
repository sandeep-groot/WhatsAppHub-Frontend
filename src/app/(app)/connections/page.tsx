"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";
import Link from "next/link";

interface OnboardingStep {
  id: string;
  stepNumber: number;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "BLOCKED";
  notes: string | null;
}

interface WhatsAppNumber {
  id: string;
  clientId: string;
  phoneNumber: string;
  voipProvider: string | null;
  connectionStatus: "PENDING" | "IN_PROGRESS" | "ACTIVE" | "INACTIVE" | "ERROR";
  lastPing: string | null;
  messageCount: number;
  webhookUrl: string | null;
  client: {
    id: string;
    name: string;
  };
  steps: OnboardingStep[];
}

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortField, setSortField] = useState<"name" | "messages" | "activity">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Query WABA connections (polled every 10 seconds for registry health)
  const { data: numbers, isLoading } = useQuery<WhatsAppNumber[]>({
    queryKey: ["whatsapp", "numbers"],
    queryFn: async () => {
      return apiFetch<WhatsAppNumber[]>("/whatsapp/numbers");
    },
    refetchInterval: 10000,
  });

  const handleSort = (field: "name" | "messages" | "activity") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter numbers
  const filteredNumbers = numbers?.filter((num) => {
    const matchesSearch =
      num.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      num.phoneNumber.includes(searchQuery);

    const matchesStatus =
      statusFilter === "ALL" || num.connectionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort numbers
  const sortedNumbers = filteredNumbers?.sort((a, b) => {
    let multiplier = sortOrder === "asc" ? 1 : -1;
    if (sortField === "name") {
      return a.client.name.localeCompare(b.client.name) * multiplier;
    }
    if (sortField === "messages") {
      return (a.messageCount - b.messageCount) * multiplier;
    }
    if (sortField === "activity") {
      const aTime = a.lastPing ? new Date(a.lastPing).getTime() : 0;
      const bTime = b.lastPing ? new Date(b.lastPing).getTime() : 0;
      return (aTime - bTime) * multiplier;
    }
    return 0;
  });

  // Registry summary stats
  const total = numbers?.length || 0;
  const active = numbers?.filter((n) => n.connectionStatus === "ACTIVE").length || 0;
  const pending = numbers?.filter((n) => n.connectionStatus === "PENDING" || n.connectionStatus === "IN_PROGRESS").length || 0;
  const error = numbers?.filter((n) => n.connectionStatus === "ERROR" || n.connectionStatus === "INACTIVE").length || 0;

  return (
    <div className="space-y-6 animate-fade-in pt-2">
      {/* Header Panel */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Connection Registry
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enterprise WABA gateways, webhook endpoints, and channel connection states.
          </p>
        </div>
        <Link
          href="/onboarding"
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          + Connect New WABA
        </Link>
      </div>

      {/* Mini-Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Gateways</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{total}</p>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-success-500" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">{active}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-warning-500 animate-pulse" />
            <p className="text-xl font-bold text-gray-900 dark:text-white">{pending}</p>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Disrupted</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`h-2 w-2 rounded-full ${error > 0 ? "bg-error-500 animate-ping" : "bg-gray-300"}`} />
            <p className="text-xl font-bold text-gray-900 dark:text-white">{error}</p>
          </div>
        </div>
      </div>

      {/* Filter and Table Panel */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by client name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-950 dark:text-white focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ERROR">Error</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-xs text-gray-400">Loading connection directory...</p>
          </div>
        ) : sortedNumbers?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">No Connections Found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
              No connections match the active search filters. Adjust filters or register a new WABA.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 dark:bg-gray-900/50 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-900/50 select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Client Name
                      {sortField === "name" && (sortOrder === "asc" ? "▲" : "▼")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4">WhatsApp Number</th>
                  <th scope="col" className="px-6 py-4">Webhook Endpoint</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-center cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-900/50 select-none"
                    onClick={() => handleSort("messages")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Messages Received
                      {sortField === "messages" && (sortOrder === "asc" ? "▲" : "▼")}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-900/50 select-none"
                    onClick={() => handleSort("activity")}
                  >
                    <div className="flex items-center gap-1">
                      Last Activity
                      {sortField === "activity" && (sortOrder === "asc" ? "▲" : "▼")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedNumbers?.map((num) => {
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
                      <td className="px-6 py-4 text-xs font-mono max-w-[200px] truncate" title={num.webhookUrl || "Platform Webhook Receiver"}>
                        {num.webhookUrl || "Platform Default"}
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
