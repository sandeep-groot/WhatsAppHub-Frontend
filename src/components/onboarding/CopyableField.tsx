"use client";

import { CheckIcon, CopyDuplicateIcon } from "@/icons";
import { useState } from "react";

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const ta = document.createElement("textarea");
  ta.value = value;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

interface CopyableFieldProps {
  label: string;
  value: string;
  mono?: boolean;
}

export function CopyableField({ label, value, mono = true }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {label}
          </p>
          <p
            className={`mt-1 break-all text-sm text-gray-900 dark:text-gray-100 ${
              mono ? "font-mono" : ""
            }`}
          >
            {value}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleCopy()}
          title={copied ? "Copied!" : `Copy ${label}`}
          aria-label={copied ? "Copied" : `Copy ${label}`}
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            copied
              ? "border-success-200 bg-success-50 text-success-600 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-400"
              : "border-gray-200 bg-white text-gray-400 hover:border-emerald-300 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500 dark:hover:border-emerald-500/30 dark:hover:text-emerald-400"
          }`}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4" strokeWidth={2.5} />
          ) : (
            <CopyDuplicateIcon className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export { copyText };
