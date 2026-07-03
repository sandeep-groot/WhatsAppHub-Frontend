"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { CheckIcon, CopySimpleIcon, ShieldCheckIcon } from "@/icons";

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
          <ShieldCheckIcon />
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
              <CheckIcon className="w-4 h-4 text-emerald-500 animate-scale" />
            ) : (
              <CopySimpleIcon />
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
