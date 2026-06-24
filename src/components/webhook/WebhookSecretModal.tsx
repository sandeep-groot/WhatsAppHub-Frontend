"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";

interface WebhookSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  secret: string;
  endpointUrl: string;
}

export function WebhookSecretModal({
  isOpen,
  onClose,
  secret,
  endpointUrl,
}: WebhookSecretModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Signing Secret Rotated"
      size="sm"
    >
      <div className="p-6 text-center">
        {/* Success / Warning Alert info */}
        <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-4 text-emerald-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-left">
          The signing secret for <span className="font-semibold text-gray-900 dark:text-white truncate block">{endpointUrl}</span> has been rotated successfully. 
        </p>

        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 text-xs text-left mb-6 font-medium">
          ⚠️ Update your webhook verification configuration on your receiving server immediately. Messages verified against the old secret will now fail.
        </div>

        {/* Copyable monospaced secret box */}
        <div className="relative flex items-center bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 mb-6 select-all">
          <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate pr-10 w-full text-left">
            {secret}
          </span>
          <button
            onClick={handleCopy}
            className="absolute right-2.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-150 dark:hover:bg-gray-800 transition-all"
            title="Copy Secret"
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-500 animate-scale" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2m0 0h2a2 2 0 012 2v3" />
              </svg>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 px-4 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}
