"use client";

import React, { useState } from "react";
import YCloudEmbeddedSignup from "./YCloudEmbeddedSignup";
import BindApiStep from "./BindApiStep";
import { AlertCircleIcon, CheckBoldIcon, OnboardingIcon, ChevronRightIcon } from "@/icons";
import type { EmbeddedSignupResult } from "@/modules/onboarding/types";
import Link from "next/link";
import { PAGE_ROUTES } from "@/lib/constants";

type OnboardingStep = 1 | 2;

function StepHeader({
  step,
  current,
  completed,
  title,
  subtitle,
}: {
  step: OnboardingStep;
  current: OnboardingStep;
  completed: boolean;
  title: string;
  subtitle: string;
}) {
  const isActive = current === step;
  const isComplete = completed;

  return (
    <div
      className={`flex items-start gap-4 p-5 sm:p-6 rounded-3xl border transition-all duration-300 ${
        isActive
          ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5 shadow-sm"
          : isComplete
            ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
            : "border-gray-200/60 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 opacity-70"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold transition-all ${
          isComplete
            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
            : isActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
        }`}
      >
        {isComplete ? <CheckBoldIcon className="w-5 h-5 text-white" /> : `0${step}`}
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <h3
            className={`text-sm sm:text-base font-extrabold ${
              isActive || isComplete
                ? "text-gray-900 dark:text-white"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {title}
          </h3>
        </div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default function OnboardingClient() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [signupResult, setSignupResult] = useState<EmbeddedSignupResult | null>(null);
  const [isBindComplete, setIsBindComplete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignupSuccess = (data: EmbeddedSignupResult) => {
    setSignupResult(data);
    setErrorMsg(null);
    setCurrentStep(2);
  };

  const handleSignupError = (error: string) => {
    setErrorMsg(error);
  };

  const handleBindSuccess = () => {
    setIsBindComplete(true);
    setErrorMsg(null);
  };

  const handleBindError = (error: string) => {
    setErrorMsg(error);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-4">
      {/* Header Banner */}
      <div className="flex items-start gap-4">
        {/* <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
          <OnboardingIcon className="w-6 h-6" />
        </div> */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
            Client Onboarding
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Connect your Meta WhatsApp Business Account via YCloud embedded signup, then bind it to WhatsAppHub.
          </p>
        </div>
      </div>

      {/* Error Callout */}
      {errorMsg && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-5 dark:border-rose-500/20 dark:bg-rose-500/10 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
              <AlertCircleIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <p className="text-sm font-bold text-rose-800 dark:text-rose-400">
                Onboarding Issue
              </p>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-400/90 leading-relaxed">
                {errorMsg}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {isBindComplete && signupResult && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 sm:p-8 dark:border-emerald-500/20 dark:bg-emerald-500/10 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20">
              <CheckBoldIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-300">
                Onboarding Complete!
              </h3>
              <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400/90 leading-relaxed">
                Your WhatsApp Business Account is successfully connected and bound to WhatsAppHub.
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
              <span>View Clients Page</span>
              <ChevronRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stepper Flow */}
      <div className="space-y-6">
        {/* Step 1 Header & Container */}
        <div className="space-y-4">
          <StepHeader
            step={1}
            current={currentStep}
            completed={currentStep > 1}
            title="Step I — YCloud Embedded Signup"
            subtitle="Link your Meta Business Manager and register your business number via YCloud's embedded signup flow."
          />

          {currentStep === 1 && (
            <div className="rounded-3xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm space-y-6">
              <YCloudEmbeddedSignup
                onSuccess={handleSignupSuccess}
                onError={handleSignupError}
              />
            </div>
          )}
        </div>

        {/* Step 2 Header & Container */}
        <div className="space-y-4">
          <StepHeader
            step={2}
            current={currentStep}
            completed={isBindComplete}
            title="Step II — Bind API Account"
            subtitle="Review the signup identifiers returned from Meta, then bind your WABA account to WhatsAppHub."
          />

          {currentStep === 2 && signupResult && !isBindComplete && (
            <div className="rounded-3xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-sm">
              <BindApiStep
                signupResult={signupResult}
                onSuccess={handleBindSuccess}
                onError={handleBindError}
              />
            </div>
          )}

          {currentStep === 2 && !signupResult && (
            <div className="rounded-3xl border border-dashed border-gray-200 dark:border-gray-700/80 p-8 text-center bg-gray-50/50 dark:bg-gray-900/20">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                Complete Step I to unlock manual and automatic API binding options.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
