"use client";

import React from "react";
import { Modal } from "@/components/ui/modal";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: LogoutConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={true}>
      <div className="flex flex-col items-center text-center p-6">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Are you sure you want to log out?
        </h3>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 px-2">
          You will be signed out of your current session and redirected back to the login screen.
        </p>

        {/* Actions Footer */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white shadow-sm shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </Modal>
  );
}
