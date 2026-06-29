"use client";

import React from "react";
import { SendMessageForm } from "@/components/whatsapp/SendMessageForm";

export default function MessagesPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Send WhatsApp Message
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Send a test message from WhatsAppHub. Choose a pre-approved template to start a
          conversation, or send free-form text inside an open 24-hour customer window.
        </p>
      </div>

      <SendMessageForm />
    </div>
  );
}
