"use client";

import React, { useState } from "react";
import YCloudEmbeddedSignup from "./YCloudEmbeddedSignup";
import BindApiStep from "./BindApiStep";
import { AlertCircleIcon, CheckBoldIcon } from "@/icons";
import type { EmbeddedSignupResult } from "@/modules/onboarding/types";

type OnboardingStep = 1 | 2;

function StepIndicator({
  step,
  current,
  completed,
  title,
  description,
}: {
  step: OnboardingStep;
  current: OnboardingStep;
  completed: boolean;
  title: string;
  description: string;
}) {
  const isActive = current === step;
  const isComplete = completed;

  return (
    <div
      className={`flex gap-4 rounded-2xl border p-5 transition-all duration-200 ${
        isActive
          ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/5"
          : isComplete
            ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40"
            : "border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/20"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isComplete
            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
            : isActive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
              : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
        }`}
      >
        {isComplete ? "✓" : step}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <h3
          className={`text-sm font-bold ${
            isActive
              ? "text-emerald-800 dark:text-emerald-400"
              : isComplete
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">{description}</p>
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
    <div className="mx-auto max-w-3xl animate-fade-in space-y-8 py-8">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-6 dark:border-gray-800">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Client Onboarding
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Connect your WhatsApp Business Account through YCloud, then bind it to WhatsAppHub.
        </p>
      </div>

      {errorMsg ? (
        <div className="rounded-2xl border border-error-200 bg-error-50 p-4 dark:border-error-500/20 dark:bg-error-500/10">
          <div className="flex gap-3">
            <AlertCircleIcon className="mt-0.5 shrink-0 text-error-600 dark:text-error-400" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-error-800 dark:text-error-400">
                Onboarding issue
              </p>
              <p className="text-xs leading-relaxed text-error-700 dark:text-error-500">
                {errorMsg}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {isBindComplete && signupResult ? (
        <div className="rounded-2xl border border-success-200 bg-success-50 p-5 dark:border-success-500/20 dark:bg-success-500/10">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-500 text-white shadow-sm shadow-success-500/20">
              <CheckBoldIcon />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-success-800 dark:text-success-400">
                Onboarding complete
              </h3>
              <p className="text-xs leading-relaxed text-success-700 dark:text-success-500">
                Your WhatsApp Business Account is connected and bound to WhatsAppHub.
              </p>
              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-success-600 dark:text-success-500">
                    WABA ID
                  </p>
                  <p className="mt-1 break-all rounded border border-success-200/20 bg-white/50 px-2 py-1 font-mono text-xs text-success-800 dark:bg-black/20 dark:text-success-400">
                    {signupResult.wabaId}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-success-600 dark:text-success-500">
                    Phone Number ID
                  </p>
                  <p className="mt-1 break-all rounded border border-success-200/20 bg-white/50 px-2 py-1 font-mono text-xs text-success-800 dark:bg-black/20 dark:text-success-400">
                    {signupResult.phoneNumberId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <StepIndicator
          step={1}
          current={currentStep}
          completed={currentStep > 1}
          title="Step I — YCloud embedded signup"
          description="Link your Meta Business Manager and register your business number via YCloud's embedded signup."
        />

        {currentStep === 1 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/40">
            <YCloudEmbeddedSignup
              onSuccess={handleSignupSuccess}
              onError={handleSignupError}
            />
          </div>
        ) : null}

        <StepIndicator
          step={2}
          current={currentStep}
          completed={isBindComplete}
          title="Step II — Bind API"
          description="Review the signup response, copy the identifiers you need, and manually bind the account when ready."
        />

        {currentStep === 2 && signupResult && !isBindComplete ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900/40">
            <BindApiStep
              signupResult={signupResult}
              onSuccess={handleBindSuccess}
              onError={handleBindError}
            />
          </div>
        ) : null}

        {currentStep === 2 && !signupResult ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-5 text-center dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Complete Step I to view the signup response here.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
