"use client";

import React, { useState, useEffect } from "react";
import YCloudEmbeddedSignup from "./YCloudEmbeddedSignup";
import BindApiStep from "./BindApiStep";
import {
  AlertCircleIcon,
  CheckBoldIcon,
  OnboardingIcon,
  ChevronRightIcon,
  UserIcon as User,
  BuildingIcon as Building,
  FacebookIcon,
  WhatsAppIcon,
} from "@/icons";
import type { EmbeddedSignupResult } from "@/modules/onboarding/types";
import Link from "next/link";
import { PAGE_ROUTES } from "@/lib/constants";
import { apiFetch } from "@/lib/http";
import { CountryPhoneInput } from "@/components/common/CountryPhoneInput";

type OnboardingStepNumber = 1 | 2 | 3;

interface ClientDetailNode {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  companyName?: string | null;
}

interface ConfirmedClientInfo {
  id?: string | null;
  name: string;
  email: string;
  phoneNumber: string;
  companyName?: string | null;
}

export default function OnboardingClient() {
  const [currentStep, setCurrentStep] = useState<OnboardingStepNumber>(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  // Client Selection / Creation state
  const [clientType, setClientType] = useState<"new" | "existing">("new");
  const [existingClients, setExistingClients] = useState<ClientDetailNode[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientDetailId, setSelectedClientDetailId] = useState<string>("");

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientCompany, setClientCompany] = useState("");

  const [confirmedClient, setConfirmedClient] = useState<ConfirmedClientInfo | null>(null);

  // Meta & Binding states
  const [signupResult, setSignupResult] = useState<EmbeddedSignupResult | null>(null);
  const [isBindComplete, setIsBindComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch registered client list when choosing 'existing'
  useEffect(() => {
    if (clientType === "existing") {
      setLoadingClients(true);
      apiFetch<ClientDetailNode[]>("/client-details")
        .then((res) => {
          if (res) {
            setExistingClients(res);
          }
        })
        .catch((err) => {
          console.error("Failed to load client details:", err);
        })
        .finally(() => {
          setLoadingClients(false);
        });
    }
  }, [clientType]);

  const isStep1Valid = () => {
    if (clientType === "existing") {
      return selectedClientDetailId.trim().length > 0;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      clientName.trim().length > 0 &&
      emailRegex.test(clientEmail.trim()) &&
      clientPhone.trim().length > 0
    );
  };

  const handleConfirmStep1 = () => {
    if (!isStep1Valid()) return;

    if (clientType === "existing") {
      const selected = existingClients.find((c) => c.id === selectedClientDetailId);
      if (selected) {
        setConfirmedClient({
          id: selected.id,
          name: selected.name,
          email: selected.email,
          phoneNumber: selected.phoneNumber,
          companyName: selected.companyName,
        });
      }
    } else {
      setConfirmedClient({
        id: null,
        name: clientName.trim(),
        email: clientEmail.trim(),
        phoneNumber: clientPhone.trim(),
        companyName: clientCompany.trim() || null,
      });
    }

    setCompletedSteps((prev) => ({ ...prev, 1: true }));
    setCurrentStep(2);
    setErrorMsg(null);
  };

  const handleSignupSuccess = (data: EmbeddedSignupResult) => {
    setSignupResult(data);
    setCompletedSteps((prev) => ({ ...prev, 2: true }));
    setCurrentStep(3);
    setErrorMsg(null);
  };

  const handleSignupError = (error: string) => {
    setErrorMsg(error);
  };

  const handleBindSuccess = () => {
    setIsBindComplete(true);
    setCompletedSteps((prev) => ({ ...prev, 3: true }));
    setErrorMsg(null);
  };

  const handleBindError = (error: string) => {
    setErrorMsg(error);
  };

  const stepsList = [
    {
      num: 1,
      title: "Step 1: Client Details",
      desc: "Create or select client owner profile",
      icon: User,
    },
    {
      num: 2,
      title: "Step 2: Connect Facebook",
      desc: "Authenticate & authorize Meta WABA",
      icon: FacebookIcon,
    },
    {
      num: 3,
      title: "Step 3: Binding Process",
      desc: "Link WABA account to WhatsAppHub",
      icon: WhatsAppIcon,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* Header Banner */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
          <OnboardingIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Client Onboarding Wizard
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Follow the 3 simple steps below to connect your Meta WhatsApp Business Account to WhatsAppHub.
          </p>
        </div>
      </div>

      {/* Stepper Progress Navigation Header */}
      <div className="rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {stepsList.map((st) => {
            const isCurrent = currentStep === st.num;
            const isDone = completedSteps[st.num] === true;

            return (
              <div
                key={st.num}
                onClick={() => {
                  if (isDone || st.num < currentStep) {
                    setCurrentStep(st.num as OnboardingStepNumber);
                  }
                }}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all duration-200 ${
                  isCurrent
                    ? "border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-sm"
                    : isDone
                    ? "border-emerald-200/60 dark:border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-500/5 cursor-pointer"
                    : "border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/40 opacity-60"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-all ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isCurrent
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                  }`}
                >
                  {isDone ? <CheckBoldIcon className="w-5 h-5" /> : `0${st.num}`}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-extrabold ${
                      isCurrent || isDone
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {st.title}
                  </p>
                  <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 dark:border-rose-500/20 dark:bg-rose-500/10 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <AlertCircleIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold text-rose-800 dark:text-rose-400">Onboarding Warning</p>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-400/90 leading-relaxed">
                {errorMsg}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {isBindComplete && signupResult && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 sm:p-8 dark:border-emerald-500/20 dark:bg-emerald-500/10 shadow-sm space-y-6 animate-scale-up">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <CheckBoldIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-300">
                🎉 Onboarding Completed Successfully!
              </h3>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400/90 leading-relaxed">
                Your Meta WhatsApp Business Account has been registered and bound to WhatsAppHub.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-emerald-200/60 dark:border-emerald-500/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                WABA ID
              </p>
              <p className="mt-1 font-mono text-xs font-semibold text-gray-900 dark:text-white break-all">
                {signupResult.wabaId}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-gray-800/80 border border-emerald-200/60 dark:border-emerald-500/20">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Phone Number ID
              </p>
              <p className="mt-1 font-mono text-xs font-semibold text-gray-900 dark:text-white break-all">
                {signupResult.phoneNumberId}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href={PAGE_ROUTES.CLIENTS}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <span>View Client Dashboard</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* STEP 1 PANEL: CLIENT CREATION / SELECTION */}
      <div
        className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
          currentStep === 1
            ? "border-emerald-500/30 bg-white dark:bg-gray-900 shadow-md"
            : completedSteps[1]
            ? "border-emerald-200 dark:border-emerald-500/20 bg-gray-50/40 dark:bg-gray-900/40"
            : "border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-60"
        }`}
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                  completedSteps[1]
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {completedSteps[1] ? <CheckBoldIcon className="w-4 h-4" /> : "01"}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Step 1: Client Creation & Selection
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Create a new client profile or select an existing client to associate with your WhatsApp Business Account.
                </p>
              </div>
            </div>
            {completedSteps[1] && currentStep !== 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Change Client
              </button>
            )}
          </div>

          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Segmented Control */}
              <div className="flex flex-col items-center justify-center space-y-2">
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                  Client Type
                </label>
                <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => setClientType("new")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      clientType === "new"
                        ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    }`}
                  >
                    New Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientType("existing")}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      clientType === "existing"
                        ? "bg-white dark:bg-gray-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                    }`}
                  >
                    Existing Client
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              {clientType === "new" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter contact name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-gray-400"
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <CountryPhoneInput
                      label="Phone Number"
                      required
                      value={clientPhone}
                      onChange={setClientPhone}
                      placeholder="Enter phone number"
                    />

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter company name"
                        value={clientCompany}
                        onChange={(e) => setClientCompany(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-2 w-full max-w-md mx-auto">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">
                    Select Existing Client <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedClientDetailId}
                      onChange={(e) => setSelectedClientDetailId(e.target.value)}
                      className="w-full appearance-none pl-4 pr-10 py-3 text-sm font-bold rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer text-center"
                    >
                      <option value="">Select Client</option>
                      {existingClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.email}) {c.companyName ? `- ${c.companyName}` : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronRightIcon className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
                  </div>
                  {loadingClients && (
                    <p className="text-[10px] text-gray-400 animate-pulse text-center">
                      Loading registered client profiles...
                    </p>
                  )}
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleConfirmStep1}
                  disabled={!isStep1Valid()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  <span>Proceed to Step 2: Connect Facebook</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Confirmed Summary view if step 1 is done */}
          {completedSteps[1] && currentStep !== 1 && confirmedClient && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {confirmedClient.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 dark:text-white">
                      {confirmedClient.name}
                    </span>
                    {confirmedClient.companyName && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                        {confirmedClient.companyName}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-0.5">
                    {confirmedClient.email} • {confirmedClient.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STEP 2 PANEL: CONNECT WITH FACEBOOK */}
      <div
        className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
          currentStep === 2
            ? "border-emerald-500/30 bg-white dark:bg-gray-900 shadow-md"
            : completedSteps[2]
            ? "border-emerald-200 dark:border-emerald-500/20 bg-gray-50/40 dark:bg-gray-900/40"
            : "border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-60"
        }`}
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                  completedSteps[2]
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {completedSteps[2] ? <CheckBoldIcon className="w-4 h-4" /> : "02"}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Step 2: Connect with Facebook
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Launch Embedded Signup to authorize Meta WhatsApp Business credentials.
                </p>
              </div>
            </div>
          </div>

          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2 text-xs">
                <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>💡 Meta Embedded Signup Instructions</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400 leading-relaxed">
                  <li>Click the <strong>Connect with Facebook</strong> button below to open Meta's secure popup.</li>
                  <li>Log in with your Meta Facebook Business Manager account.</li>
                  <li>Select or create your WhatsApp Business Account (WABA) & phone number.</li>
                </ol>
              </div>

              <div className="py-4 flex flex-col items-center justify-center">
                <YCloudEmbeddedSignup
                  onSuccess={handleSignupSuccess}
                  onError={handleSignupError}
                  disabled={!completedSteps[1]}
                />
              </div>
            </div>
          )}

          {completedSteps[2] && currentStep !== 2 && signupResult && (
            <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-xs flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-emerald-800 dark:text-emerald-300">
                  ✓ Facebook Authentication Completed
                </p>
                <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                  WABA ID: {signupResult.wabaId}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* STEP 3 PANEL: BINDING PROCESS */}
      <div
        className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
          currentStep === 3
            ? "border-emerald-500/30 bg-white dark:bg-gray-900 shadow-md"
            : isBindComplete
            ? "border-emerald-200 dark:border-emerald-500/20 bg-gray-50/40 dark:bg-gray-900/40"
            : "border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-60"
        }`}
      >
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs ${
                  isBindComplete
                    ? "bg-emerald-500 text-white"
                    : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {isBindComplete ? <CheckBoldIcon className="w-4 h-4" /> : "03"}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                  Step 3: Binding Process
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Confirm credentials and bind your WABA account to WhatsAppHub.
                </p>
              </div>
            </div>
          </div>

          {currentStep === 3 && signupResult && !isBindComplete && (
            <div className="animate-fade-in">
              <BindApiStep
                signupResult={signupResult}
                onSuccess={handleBindSuccess}
                onError={handleBindError}
                clientDetailId={confirmedClient?.id || null}
                newClientDetails={
                  !confirmedClient?.id
                    ? {
                        name: confirmedClient?.name || "",
                        email: confirmedClient?.email || "",
                        phoneNumber: confirmedClient?.phoneNumber || "",
                        companyName: confirmedClient?.companyName || null,
                      }
                    : null
                }
              />
            </div>
          )}

          {currentStep !== 3 && !isBindComplete && (
            <div className="p-6 text-center text-xs text-gray-400">
              Complete Step 1 and Step 2 to unlock the binding process.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
