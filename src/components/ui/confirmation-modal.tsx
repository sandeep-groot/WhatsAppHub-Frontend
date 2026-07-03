"use client";

import React, { useState } from "react";
import { Modal } from "./modal";
import { AlertTriangleIcon, CheckIcon, InfoCircleIcon } from "@/icons";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "warning" | "info" | "success";
  showIcon?: boolean;
}

const typeConfigs = {
  danger: {
    btnClass: "bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/20 text-white shadow-sm shadow-rose-500/10",
    iconClass: "text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400",
    icon: <AlertTriangleIcon />,
  },
  warning: {
    btnClass: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500/20 text-white shadow-sm shadow-amber-500/10",
    iconClass: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
    icon: <AlertTriangleIcon />,
  },
  info: {
    btnClass: "bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/20 text-white shadow-sm shadow-blue-500/10",
    iconClass: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400",
    icon: <InfoCircleIcon />,
  },
  success: {
    btnClass: "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/20 text-white shadow-sm shadow-emerald-500/10",
    iconClass: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400",
    icon: <CheckIcon className="w-6 h-6" />,
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  type = "info",
  showIcon = true,
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleConfirm = async () => {
    setErrorText(null);
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      console.error("Action confirmation failure:", err);
      setErrorText(err?.message || "Action failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const config = typeConfigs[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={!isLoading} size="sm">
      <div className="p-6">
        <div className="flex flex-col items-center text-center">
          {showIcon && (
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 flex-shrink-0 ${config.iconClass}`}>
              {config.icon}
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
            {message}
          </p>
        </div>

        {errorText && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-800 dark:text-rose-400 text-xs font-semibold">
            {errorText}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 border-t border-gray-100 dark:border-gray-700/50 pt-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`w-full sm:w-auto px-4 py-2.5 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 cursor-pointer ${config.btnClass}`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
