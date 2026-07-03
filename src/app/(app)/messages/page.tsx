"use client";

import React from "react";
import { SendMessageForm } from "@/components/whatsapp/SendMessageForm";
import { EMPTY_STATE_COPY, PAGE_METADATA } from "@/lib/constants";

export default function MessagesPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {PAGE_METADATA.messages.heading}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {EMPTY_STATE_COPY.messages.pageDescription}
        </p>
      </div>

      <SendMessageForm />
    </div>
  );
}
