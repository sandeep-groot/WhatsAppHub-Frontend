"use client";

import React, { useState } from "react";
import YCloudEmbeddedSignup from "./YCloudEmbeddedSignup";
import { AlertCircleIcon, CheckBoldIcon } from "@/icons";

interface WabaDetails {
  wabaId: string;
  phoneNumberId: string;
}

export default function OnboardingClient() {
  const [wabaInfo, setWabaInfo] = useState<WabaDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignupSuccess = (data: WabaDetails) => {
    setWabaInfo(data);
    setErrorMsg(null);
  };

  const handleSignupError = (error: string) => {
    setErrorMsg(error);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-gray-100 dark:border-gray-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Client Onboarding
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400">
          Set up and connect your WhatsApp Business Account to start your messaging workflows.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle: Steps Progress & Action */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status alerts */}
          {errorMsg && (
            <div className="rounded-2xl border border-error-200 bg-error-50 dark:border-error-500/20 dark:bg-error-500/10 p-4 transition-all duration-300">
              <div className="flex gap-3">
                <AlertCircleIcon className="text-error-600 dark:text-error-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-error-800 dark:text-error-400">
                    Onboarding Failure
                  </p>
                  <p className="text-xs text-error-700 dark:text-error-500 leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              </div>
            </div>
          )}

          {wabaInfo && (
            <div className="rounded-2xl border border-success-200 bg-success-50 dark:border-success-500/20 dark:bg-success-500/10 p-5 transition-all duration-300">
              <div className="flex gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success-500 text-white shrink-0 shadow-sm shadow-success-500/20">
                  <CheckBoldIcon />
                </div>
                <div className="space-y-2 flex-1">
                  <h3 className="text-sm font-bold text-success-800 dark:text-success-400">
                    WhatsApp Hub Connected Successfully!
                  </h3>
                  <p className="text-xs text-success-700 dark:text-success-500 leading-relaxed">
                    Your WhatsApp Business Account has been linked via YCloud and is ready for automation.
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-success-200/40 dark:border-success-500/20 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-success-600 dark:text-success-500 tracking-wider">
                        WABA ID
                      </p>
                      <p className="text-xs font-mono text-success-800 dark:text-success-400 mt-1 select-all break-all bg-white/50 dark:bg-black/20 px-2 py-1 rounded border border-success-200/20">
                        {wabaInfo.wabaId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-success-600 dark:text-success-500 tracking-wider">
                        Phone Number ID
                      </p>
                      <p className="text-xs font-mono text-success-800 dark:text-success-400 mt-1 select-all break-all bg-white/50 dark:bg-black/20 px-2 py-1 rounded border border-success-200/20">
                        {wabaInfo.phoneNumberId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding steps visual list */}
          {/* <div className="card space-y-6"> */}
            {/* <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Onboarding Checklist
            </h2> */}
            
            {/* <div className="space-y-4"> */}
              {/* Step 1 */}
              {/* <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-200">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shrink-0 font-bold text-sm shadow-sm shadow-emerald-500/20">
                  ✓
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Step 1: Create WhatsAppHub Account
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Your operator user profile has been successfully set up and validated.
                  </p>
                </div>
              </div> */}

              {/* Step 2 */}
              <div className={`flex gap-4 p-4 rounded-xl transition-all duration-200 ${
                !wabaInfo 
                  ? "bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/50 dark:border-emerald-500/10" 
                  : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
              }`}>
                {wabaInfo ? (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shrink-0 font-bold text-sm shadow-sm shadow-emerald-500/20">
                    ✓
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-sm">
                    
                  </div>
                )}
                <div className="space-y-1 flex-1">
                  <h3 className={`text-sm font-bold ${!wabaInfo ? "text-emerald-800 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
                    Connect WhatsApp Business Account
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    Link your Meta Business Manager and register your business number via YCloud's embedded signup.
                  </p>
                  
                  {!wabaInfo && (
                    <div className="mt-4">
                      <YCloudEmbeddedSignup
                        onSuccess={handleSignupSuccess}
                        onError={handleSignupError}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3 */}
              {/* <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-200">
                {wabaInfo ? (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 font-bold text-sm animate-pulse">
                    3
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 shrink-0 font-bold text-sm">
                    3
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500">
                    Step 3: Verify Webhook Channels
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                    Set up status delivery webhooks for messaging updates (automatically bound upon WABA creation).
                  </p>
                </div>
              </div> */}
            {/* </div> */}
          {/* </div> */}
        </div>

        {/* Right side: Helpful Info sidebar */}
        {/* <div className="space-y-6">
          <div className="card space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Onboarding Help
            </h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  What is Embedded Signup?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Embedded Signup allows you to connect your company's Facebook Business Manager, create a WhatsApp Business profile, and verify your phone number without leaving WhatsAppHub.
                </p>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  What do I need?
                </h4>
                <ul className="list-disc pl-4 text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                  <li>A valid personal Facebook account with admin access to your Meta Business Manager.</li>
                  <li>A phone number that can receive SMS or voice calls (must not have a personal WhatsApp account active).</li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  Support & Resources
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  If your number has been registered on WhatsApp Messenger previously, you must delete the account from your mobile app first.
                </p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
