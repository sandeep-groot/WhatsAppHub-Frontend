"use client";

import React from "react";
import { SendMessageForm } from "@/components/whatsapp/SendMessageForm";
import { EMPTY_STATE_COPY, PAGE_METADATA } from "@/lib/constants";
import { SendMessageIcon } from "@/icons";

export default function MessagesPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-sm">
          <SendMessageIcon className="w-6 h-6" />
        </div> */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {PAGE_METADATA.messages.heading}
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {EMPTY_STATE_COPY.messages.pageDescription}
          </p>
        </div>
      </div>

      <SendMessageForm />
    </div>
  );
}
