"use client";

import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/button/Button";
import { apiFetch } from "@/lib/http";
import { env } from "@/lib/env";
import { WabaBindRequest } from "@/modules/onboarding/types";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

interface YCloudEmbeddedSignupProps {
  onSuccess: (data: { wabaId: string; phoneNumberId: string }) => void;
  onError: (errorMsg: string) => void;
}

export default function YCloudEmbeddedSignup({
  onSuccess,
  onError,
}: YCloudEmbeddedSignupProps) {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const appId = env.NEXT_PUBLIC_FB_APP_ID;
  const configId = env.NEXT_PUBLIC_FB_CONFIG_ID;
  const solutionId = env.NEXT_PUBLIC_YCLOUD_SOLUTION_ID;

  // Store captured IDs in refs to avoid race conditions and re-renders during signup execution
  const capturedWabaId = useRef<string>("");
  const capturedPhoneId = useRef<string>("");
  const capturedBusinessId = useRef<string>("");

  useEffect(() => {
    if (!appId) {
      console.warn("Facebook App ID is not set in env variables.");
      return;
    }

    // If FB is already loaded on the window object (from a previous session/mount), enable the button immediately
    if (window.FB) {
      setIsSdkLoaded(true);
    }

    // 1. Initialize Facebook SDK once loaded
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: "v22.0", // Latest Graph API version supporting Login for Business
      });
      setIsSdkLoaded(true);
    };

    // 2. Load SDK script dynamically (if not already injected)
    const scriptId = "facebook-jssdk";
    if (!document.getElementById(scriptId)) {
      const js = document.createElement("script") as HTMLScriptElement;
      js.id = scriptId;
      js.defer = true;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      const fjs = document.getElementsByTagName("script")[0];
      fjs?.parentNode?.insertBefore(js, fjs);
    }

    // 3. Register window postMessage listener for Meta's Embedded Signup events
    const sessionInfoListener = (event: MessageEvent) => {
      if (!event.origin?.endsWith("facebook.com")) return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          console.log("Embedded Signup Event Received:", data.event, data.data);
          
          if (data.event === "FINISH") {
            // Retrieve IDs returned by Meta
            const { phone_number_id, waba_id, businessId } = data.data || {};
            capturedWabaId.current = waba_id || "";
            capturedPhoneId.current = phone_number_id || "";
            capturedBusinessId.current = businessId || "";
            console.log("Captured IDs:", {
              phone_number_id,
              waba_id,
              businessId,
            });
          } else if (data.event === "ERROR") {
            console.error("Embedded Signup Error:", data.data?.error_message);
            onError(data.data?.error_message || "Meta signup error occurred.");
          } else {
            console.warn("Embedded Signup Event Cancelled/Skipped:", data.data?.current_step);
          }
        }
      } catch {
        // Safe catch for messages from other sources (e.g. Chrome extensions)
      }
    };

    window.addEventListener("message", sessionInfoListener);

    return () => {
      window.removeEventListener("message", sessionInfoListener);
    };
  }, [appId, onError]);

  const handleLaunchSignup = () => {
    if (window.location.protocol !== "https:") {
      onError("Facebook Login requires an HTTPS connection. Please ensure you are accessing the page via HTTPS (e.g. https://localhost:3000/onboarding) instead of http://");
      return;
    }

    if (!window.FB) {
      onError("Facebook SDK has not loaded yet. Please wait a moment.");
      return;
    }

    if (!appId || !configId || !solutionId) {
      onError("Please configure Facebook App ID, Config ID, and Solution ID in your environment variables first.");
      return;
    }

    // Reset refs before starting
    capturedWabaId.current = "";
    capturedPhoneId.current = "";
    capturedBusinessId.current = "";

    setIsSigningUp(true);
    setLoadingText("Awaiting authorization popup...");

    window.FB.login(
      (response: any) => {
        (async () => {
          if (response.status === "connected" && response.authResponse) {
            const code = response.authResponse.code;
            console.log("OAuth Code received:", code);

            if (!capturedWabaId.current || !capturedPhoneId.current) {
              setIsSigningUp(false);
              onError(
                "Meta did not return WABA Account IDs. Please ensure you completed all onboarding steps."
              );
              return;
            }

            setLoadingText("Registering and binding WABA account...");

            try {
              const bindData: WabaBindRequest = {
                code,
                wabaId: capturedWabaId.current,
                phoneNumberId: capturedPhoneId.current,
                solutionId: solutionId,
              };

              // Send OAuth code and account IDs to your NestJS backend
              const result = await apiFetch<{ success: boolean; message?: string }>(
                "/whatsapp/waba/bind",
                {
                  method: "POST",
                  data: bindData,
                }
              );

              setIsSigningUp(false);
              
              if (result.success || (result as any).data?.success) {
                onSuccess({
                  wabaId: capturedWabaId.current,
                  phoneNumberId: capturedPhoneId.current,
                });
              } else {
                onError(result.message || "Failed to complete account registration on the backend.");
              }
            } catch (err: any) {
              setIsSigningUp(false);
              onError(err.message || "An unexpected error occurred during WABA binding.");
            }
          } else {
            setIsSigningUp(false);
            onError("User cancelled the signup process or did not grant full permissions.");
          }
        })().catch((err) => {
          setIsSigningUp(false);
          onError(err.message || "Unexpected failure inside login callback.");
        });
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          features: [{ name: "marketing_messages_lite" }],
          setup: { solutionID: solutionId },
          sessionInfoVersion: "3",
        },
      }
    );
  };

  const isConfigured = Boolean(appId && configId && solutionId);

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-800 shadow-sm w-full max-w-md mx-auto transition-all duration-300">
      {/* Icon cluster */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </div>
        <div className="h-0.5 w-6 bg-gray-200 dark:bg-gray-700" />
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1877f2]/10 dark:bg-[#1877f2]/20 text-[#1877f2] shadow-inner">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white text-center">
        Connect WhatsApp Business API
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 mb-6 max-w-xs leading-relaxed">
        Connect your Meta Business Manager and register your business number via YCloud.
      </p>

      {/* Trigger Button */}
      <div className="w-full relative">
        <Button
          type="button"
          onClick={handleLaunchSignup}
          disabled={!isSdkLoaded || isSigningUp || !isConfigured}
          className={`flex items-center justify-center gap-3 w-full font-semibold rounded-xl text-sm transition-all duration-300 py-3 ${
            isConfigured
              ? "bg-[#1877f2] hover:bg-[#166fe5] active:scale-[0.98] text-white shadow-sm shadow-[#1877f2]/20 hover:shadow-md hover:shadow-[#1877f2]/30"
              : "bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isSigningUp ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Linking Account...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Connect with Facebook</span>
            </>
          )}
        </Button>

        {/* Status display under button */}
        {isSigningUp && loadingText && (
          <p className="text-center text-xs text-emerald-600 dark:text-emerald-400 mt-3 animate-pulse font-medium">
            {loadingText}
          </p>
        )}

        {!isConfigured && (
          <div className="mt-4 p-3 rounded-xl bg-warning-50 border border-warning-100 dark:bg-warning-500/10 dark:border-warning-500/20 text-center">
            <p className="text-xs text-warning-700 dark:text-warning-400 font-medium">
              Credentials are not fully configured in your environment variables.
            </p>
          </div>
        )}

        {isSdkLoaded && isConfigured && !isSigningUp && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">
              Ready to Connect
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
