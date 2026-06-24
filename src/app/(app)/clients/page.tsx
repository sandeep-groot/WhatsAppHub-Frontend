"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  client: {
    id: string;
    name: string;
  };
  steps: OnboardingStep[];
}

interface Message {
  id: string;
  numberId: string;
  direction: "INBOUND" | "OUTBOUND";
  senderNumber: string;
  messageBody: string | null;
  status: string;
  ycloudMessageId: string | null;
  createdAt: string;
}

const STEP_DETAILS = [
  { name: "Step 1: Obtain Phone Number", desc: "Purchase or port your business phone number." },
  { name: "Step 2: Create Meta Business Profile", desc: "Set up and verify your Meta Business Manager." },
  { name: "Step 3: Bind WABA via YCloud", desc: "Complete Embedded Signup authorization popup." },
  { name: "Step 4: Configure Status Webhooks", desc: "Register endpoints to receive message notifications." },
  { name: "Step 5: Verify API Connection", desc: "Successfully test inbound messaging." },
  { name: "Step 6: Activate Account", desc: "Verify live dashboard statistics." },
];

function ClientsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedParam = searchParams.get("selected");
  const [activeTab, setActiveTab] = useState<"chat" | "onboarding">("chat");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Query all client phone connections
  const { data: numbers, isLoading: isListLoading } = useQuery<WhatsAppNumber[]>({
    queryKey: ["whatsapp", "numbers"],
    queryFn: async () => {
      return apiFetch<WhatsAppNumber[]>("/whatsapp/numbers");
    },
    refetchInterval: 10000,
  });

  const activeNumber = numbers?.find((n) => n.id === selectedParam);

  // Query conversation messages for the selected connection (polled every 5s for active chats)
  const { data: messages, isLoading: isMessagesLoading } = useQuery<Message[]>({
    queryKey: ["whatsapp", "messages", selectedParam, startDate, endDate],
    queryFn: async () => {
      if (!selectedParam) return [];
      let path = `/whatsapp/numbers/${selectedParam}/messages`;
      const params: string[] = [];
      if (startDate) params.push(`startDate=${encodeURIComponent(startDate)}`);
      if (endDate) params.push(`endDate=${encodeURIComponent(endDate)}`);
      if (params.length > 0) path += `?${params.join("&")}`;
      return apiFetch<Message[]>(path);
    },
    enabled: !!selectedParam,
    refetchInterval: 5000,
  });

  const filteredNumbers = numbers?.filter(
    (n) =>
      n.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.phoneNumber.includes(searchQuery)
  );

  const selectNumber = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("selected", id);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex h-[82vh] gap-6 overflow-hidden animate-fade-in">
      {/* LEFT: Client Directory Sidebar */}
      <div className="w-full flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Clients Directory</h2>
          </div>
          <div className="flex justify-end">
            <Link
              href="/onboarding"
              className="flex items-center  gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs shadow-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Connect New WABA
            </Link>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
            />
            <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isListLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : filteredNumbers?.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">No clients found.</p>
          ) : (
            filteredNumbers?.map((n) => {
              const active = n.id === selectedParam;
              let statusColor = "bg-gray-400";
              if (n.connectionStatus === "ACTIVE") statusColor = "bg-success-500";
              else if (n.connectionStatus === "PENDING" || n.connectionStatus === "IN_PROGRESS") statusColor = "bg-warning-500";
              else if (n.connectionStatus === "ERROR") statusColor = "bg-error-500";

              return (
                <button
                  key={n.id}
                  onClick={() => selectNumber(n.id)}
                  className={`w-full flex flex-col gap-1 p-3 rounded-xl text-left transition-colors ${active
                    ? "bg-emerald-50/50 dark:bg-gray-700/50 text-emerald-800 dark:text-white"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/20 text-gray-700 dark:text-gray-300"
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-bold text-sm truncate max-w-[170px]">{n.client.name}</span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
                      {n.connectionStatus}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500">{n.phoneNumber}</span>
                </button>
              );
            })
          )}
        </div>
      </div>


    </div>
  );
}

export default function ClientsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    }>
      <ClientsContent />
    </Suspense>
  );
}
