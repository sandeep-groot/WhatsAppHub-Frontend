"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/http";

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
      <div className="w-80 flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shrink-0 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Clients Directory</h2>
          <div className="mt-3 relative">
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
                  className={`w-full flex flex-col gap-1 p-3 rounded-xl text-left transition-colors ${
                    active
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

      {/* RIGHT: Workspace details & Chat timeline */}
      <div className="flex-1 flex flex-col rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        {!activeNumber ? (
          <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 shadow-inner">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white mt-4">No Connection Selected</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mt-1 leading-relaxed">
              Select a client account from the sidebar directory to view active conversation threads and onboarding checklists.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Connection workspace Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{activeNumber.client.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs text-gray-400 dark:text-gray-500">{activeNumber.phoneNumber}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">BSP: YCloud</span>
                </div>
              </div>

              {/* Tabs selector */}
              <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl p-1 shrink-0 border border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeTab === "chat"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Messages
                </button>
                <button
                  onClick={() => setActiveTab("onboarding")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    activeTab === "onboarding"
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  Onboarding Checklist
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Conversation thread */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Date filter bar */}
                <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-gray-50/50 dark:bg-gray-900/10 border-b border-gray-100 dark:border-gray-800 shrink-0">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Date Filters:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-800 dark:text-white focus:outline-none"
                  />
                  {(startDate || endDate) && (
                    <button
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                      }}
                      className="text-xs font-bold text-error-600 dark:text-error-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Conversation Timeline */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/30 dark:bg-gray-900/5 flex flex-col-reverse">
                  {isMessagesLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    </div>
                  ) : messages?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
                      <p className="text-xs text-gray-400 dark:text-gray-500">No message history logged for this connection.</p>
                    </div>
                  ) : (
                    messages?.map((msg) => {
                      const isIncoming = msg.direction === "INBOUND";
                      const msgDate = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col max-w-[70%] gap-1 ${
                            isIncoming ? "self-start items-start" : "self-end items-end"
                          }`}
                        >
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
                            {isIncoming ? msg.senderNumber : "Platform Admin"}
                          </span>
                          
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                              isIncoming
                                ? "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-800/80 rounded-tl-none"
                                : "bg-emerald-500 text-white rounded-tr-none"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.messageBody}</p>
                          </div>

                          <div className="flex items-center gap-1.5 px-1">
                            <span className="text-[9px] text-gray-400 dark:text-gray-500">{msgDate}</span>
                            {!isIncoming && (
                              <span className="text-[9px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                {msg.status}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Onboarding stepper */}
            {activeTab === "onboarding" && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Onboarding Step-by-Step Tracker
                </h3>

                <div className="relative border-l border-gray-200 dark:border-gray-700 ml-4 pl-6 space-y-8 py-2">
                  {STEP_DETAILS.map((step, idx) => {
                    const stepNum = idx + 1;
                    const stepState = activeNumber.steps.find((s) => s.stepNumber === stepNum);
                    const status = stepState?.status || "PENDING";

                    // Visual indicators based on status
                    let markerBg = "bg-gray-100 dark:bg-gray-800 text-gray-400";
                    let stepTitleColor = "text-gray-400 dark:text-gray-500";
                    let icon = stepNum.toString();

                    if (status === "DONE") {
                      markerBg = "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20";
                      stepTitleColor = "text-gray-950 dark:text-white";
                      icon = "✓";
                    } else if (status === "IN_PROGRESS") {
                      markerBg = "bg-warning-500 text-white animate-pulse shadow-sm shadow-warning-500/20";
                      stepTitleColor = "text-warning-800 dark:text-warning-400 font-bold";
                    } else if (status === "BLOCKED") {
                      markerBg = "bg-error-500 text-white animate-bounce";
                      stepTitleColor = "text-error-800 dark:text-error-400 font-bold";
                      icon = "⚠️";
                    }

                    return (
                      <div key={stepNum} className="relative flex gap-4">
                        {/* Dot marker */}
                        <div className={`absolute -left-[37px] flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${markerBg}`}>
                          {icon}
                        </div>

                        <div className="space-y-1">
                          <h4 className={`text-sm font-bold ${stepTitleColor}`}>{step.name}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                          {status === "BLOCKED" && stepState?.notes && (
                            <div className="mt-2 p-3 rounded-lg bg-error-50 border border-error-100 dark:bg-error-500/10 dark:border-error-500/20">
                              <p className="text-xs text-error-700 dark:text-error-400 font-medium">
                                Blocked reason: {stepState.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
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
