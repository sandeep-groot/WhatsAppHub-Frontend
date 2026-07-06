"use client";

import Button from "@/components/ui/button/Button";
import { apiFetch } from "@/lib/http";
import type {
  EmbeddedSignupResult,
  WabaBindRequest,
  WabaBindResponse,
} from "@/modules/onboarding/types";
import { useMemo, useState } from "react";
import { CopyableField, copyText } from "./CopyableField";
import { CheckIcon, CopyDuplicateIcon } from "@/icons";

interface BindApiStepProps {
  signupResult: EmbeddedSignupResult;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function BindApiStep({
  signupResult,
  onSuccess,
  onError,
}: BindApiStepProps) {
  const [isBinding, setIsBinding] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);
  const [isBound, setIsBound] = useState(false);

  const responseJson = useMemo(
    () =>
      JSON.stringify(
        {
          wabaId: signupResult.wabaId,
          phoneNumberId: signupResult.phoneNumberId,
          ...(signupResult.businessId ? { businessId: signupResult.businessId } : {}),
          ...(signupResult.authCode ? { authCode: signupResult.authCode } : {}),
        },
        null,
        2,
      ),
    [signupResult],
  );

  async function handleCopyJson() {
    await copyText(responseJson);
    setJsonCopied(true);
    window.setTimeout(() => setJsonCopied(false), 1500);
  }

  async function handleBind() {
    setIsBinding(true);
    try {
      const bindData: WabaBindRequest = {
        wabaId: signupResult.wabaId,
        phoneNumberId: signupResult.phoneNumberId,
      };

      const result = await apiFetch<WabaBindResponse>("/whatsapp/waba/bind", {
        method: "POST",
        data: bindData,
      });

      if (result.success) {
        setIsBound(true);
        onSuccess();
      } else {
        onError(result.message ?? "Failed to bind WABA account on the backend.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred during binding.";
      onError(message);
    } finally {
      setIsBinding(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        Review the identifiers returned from embedded signup. Copy any value you need, then bind
        the account to WhatsAppHub when you are ready.
      </p>

      <div className="space-y-3">
        <CopyableField label="WABA ID" value={signupResult.wabaId} />
        <CopyableField label="Phone Number ID" value={signupResult.phoneNumberId} />
        {signupResult.businessId ? (
          <CopyableField label="Business ID" value={signupResult.businessId} />
        ) : null}
        {signupResult.authCode ? (
          <CopyableField label="OAuth Code" value={signupResult.authCode} />
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-4 py-2.5">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Signup response (JSON)
          </p>
          <button
            type="button"
            onClick={() => void handleCopyJson()}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              jsonCopied
                ? "border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400"
                : "border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-emerald-500/30 dark:hover:text-emerald-400"
            }`}
          >
            {jsonCopied ? (
              <CheckIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            ) : (
              <CopyDuplicateIcon className="h-3.5 w-3.5" />
            )}
            {jsonCopied ? "Copied" : "Copy JSON"}
          </button>
        </div>
        <pre className="max-h-48 overflow-auto p-4 text-xs leading-relaxed font-mono text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900">
          {responseJson}
        </pre>
      </div>

      <Button
        type="button"
        onClick={() => void handleBind()}
        disabled={isBinding || isBound}
        className="w-full"
      >
        {isBound ? "Account Bound" : isBinding ? "Binding..." : "Bind API"}
      </Button>
    </div>
  );
}
