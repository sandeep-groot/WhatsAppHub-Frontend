"use client";

import React, { useEffect, useState, useRef } from "react";
import Button from "@/components/ui/button/Button";
import { env } from "@/lib/env";
import type { EmbeddedSignupResult } from "@/modules/onboarding/types";
import { FacebookIcon } from "@/icons";

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: any;
  }
}

interface YCloudEmbeddedSignupProps {
  onSuccess: (data: EmbeddedSignupResult) => void;
  onError: (errorMsg: string) => void;
  disabled?: boolean;
}

export default function YCloudEmbeddedSignup({
  onSuccess,
  onError,
  disabled = false,
}: YCloudEmbeddedSignupProps) {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const appId = env.NEXT_PUBLIC_FB_APP_ID;
  const configId = env.NEXT_PUBLIC_FB_CONFIG_ID;
  const solutionId = env.NEXT_PUBLIC_YCLOUD_SOLUTION_ID;

  const capturedWabaId = useRef<string>("");
  const capturedPhoneId = useRef<string>("");
  const capturedBusinessId = useRef<string>("");

  useEffect(() => {
    if (!appId) {
      console.warn("Facebook App ID is not set in env variables.");
      return;
    }

    if (window.FB) {
      setIsSdkLoaded(true);
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: "v22.0",
      });
      setIsSdkLoaded(true);
    };

    const scriptId = "facebook-jssdk";
    if (!document.getElementById(scriptId)) {
      const js = document.createElement("script") as HTMLScriptElement;
      js.id = scriptId;
      js.defer = true;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      const fjs = document.getElementsByTagName("script")[0];
      fjs?.parentNode?.insertBefore(js, fjs);
    }

    const sessionInfoListener = (event: MessageEvent) => {
      if (!event.origin?.endsWith("facebook.com")) return;

      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          if (data.event === "FINISH") {
            const { phone_number_id, waba_id, businessId } = data.data || {};
            capturedWabaId.current = waba_id || "";
            capturedPhoneId.current = phone_number_id || "";
            capturedBusinessId.current = businessId || "";
          } else if (data.event === "ERROR") {
            onError(data.data?.error_message || "Meta signup error occurred.");
          }
        }
      } catch {
        /* ignore non-JSON postMessages */
      }
    };

    window.addEventListener("message", sessionInfoListener);

    return () => {
      window.removeEventListener("message", sessionInfoListener);
    };
  }, [appId, onError]);

  const handleLaunchSignup = () => {
    if (window.location.protocol !== "https:") {
      onError(
        "Facebook Login requires HTTPS. Use https://localhost:3000/onboarding instead of http://",
      );
      return;
    }

    if (!window.FB) {
      onError("Facebook SDK has not loaded yet. Please wait a moment.");
      return;
    }

    if (!appId || !configId || !solutionId) {
      onError(
        "Please configure Facebook App ID, Config ID, and Solution ID in your environment variables first.",
      );
      return;
    }

    capturedWabaId.current = "";
    capturedPhoneId.current = "";
    capturedBusinessId.current = "";

    setIsSigningUp(true);
    setLoadingText("Awaiting authorization popup...");

    window.FB.login(
      (response: any) => {
        setIsSigningUp(false);

        if (response.status !== "connected" || !response.authResponse) {
          onError("User cancelled the signup process or did not grant full permissions.");
          return;
        }

        if (!capturedWabaId.current || !capturedPhoneId.current) {
          onError(
            "Meta did not return WABA account IDs. Please ensure you completed all onboarding steps.",
          );
          return;
        }

        onSuccess({
          wabaId: capturedWabaId.current,
          phoneNumberId: capturedPhoneId.current,
          businessId: capturedBusinessId.current || undefined,
          authCode: response.authResponse.code,
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
      },
    );
  };

  const isConfigured = Boolean(appId && configId && solutionId);

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center transition-all duration-300">
      <div className="relative w-full">
        <Button
          type="button"
          onClick={handleLaunchSignup}
          disabled={disabled || !isSdkLoaded || isSigningUp || !isConfigured}
          className={`flex w-full items-center justify-center gap-3 rounded-xl py-3 text-sm font-semibold transition-all duration-300 ${
            isConfigured
              ? "bg-[#1877f2] text-white shadow-sm shadow-[#1877f2]/20 hover:bg-[#166fe5] hover:shadow-md hover:shadow-[#1877f2]/30 active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700"
          }`}
        >
          {isSigningUp ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Connecting...</span>
            </div>
          ) : (
            <>
              <FacebookIcon className="h-5 w-5 shrink-0 fill-current" />
              <span>Connect with Facebook</span>
            </>
          )}
        </Button>

        {isSigningUp && loadingText ? (
          <p className="mt-3 animate-pulse text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {loadingText}
          </p>
        ) : null}

        {!isConfigured ? (
          <div className="mt-4 rounded-xl border border-warning-100 bg-warning-50 p-3 text-center dark:border-warning-500/20 dark:bg-warning-500/10">
            <p className="text-xs font-medium text-warning-700 dark:text-warning-400">
              Credentials are not fully configured in your environment variables.
            </p>
          </div>
        ) : null}

        {isSdkLoaded && isConfigured && !isSigningUp && !disabled ? (
          <div className="mb-1 mt-1 flex items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-500" />
            <p className="text-center text-[10px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Ready to Connect
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
