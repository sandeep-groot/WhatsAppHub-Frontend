"use client";

import React, { useState } from "react";
import type { Webhook } from "@/modules/webhook/types";
import { useUpdateWebhookEndpoint, useRotateWebhookSecret } from "@/modules/webhook/client/hooks";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

interface WebhookListProps {
  webhooks: Webhook[];
  onEdit: (webhook: Webhook) => void;
  onDelete: (id: string) => void;
  onShowSecret: (secret: string, url: string) => void;
}

export function WebhookList({
  webhooks,
  onEdit,
  onDelete,
  onShowSecret,
}: WebhookListProps) {
  const updateMutation = useUpdateWebhookEndpoint();
  const rotateSecretMutation = useRotateWebhookSecret();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [rotatingWebhook, setRotatingWebhook] = useState<Webhook | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusToggle = async (webhook: Webhook) => {
    const nextStatus = webhook.status === "active" ? "disabled" : "active";
    setLoadingStates((prev) => ({ ...prev, [webhook.id]: true }));

    try {
      await updateMutation.mutateAsync({
        id: webhook.id,
        data: { status: nextStatus },
      });
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [webhook.id]: false }));
    }
  };



  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Endpoint Details</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Events Subscribed</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-700/50">
            {Array.isArray(webhooks) && webhooks.map((webhook) => (
              <tr key={webhook.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-700/20 transition-colors">
                {/* URL and Description */}
                <td className="px-6 py-4 max-w-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={webhook.url}>
                      {webhook.url}
                    </span>
                    <button
                      onClick={() => handleCopy(webhook.url, webhook.id)}
                      className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all"
                      title="Copy URL"
                    >
                      {copiedId === webhook.id ? (
                        <svg className="w-4 h-4 text-emerald-500 animate-scale" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {webhook.description ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {webhook.description}
                    </p>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500 italic">No description</span>
                  )}
                </td>

                {/* Subscribed Events list */}
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1.5 max-w-md">
                    {Array.isArray(webhook.enabledEvents) && webhook.enabledEvents.map((event) => (
                      <span
                        key={event}
                        className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/10"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Status Switch */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStatusToggle(webhook)}
                      disabled={loadingStates[webhook.id]}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                        webhook.status === "active" ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          webhook.status === "active" ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      webhook.status === "active" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"
                    }`}>
                      {webhook.status === "active" ? "Active" : "Disabled"}
                    </span>
                  </div>
                </td>

                {/* Action buttons */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setRotatingWebhook(webhook)}
                      className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
                      title="Rotate signing secret"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m-5 4a5 5 0 01-5-5 5 5 0 015-5 5 5 0 015 5c0 1.22-.44 2.33-1.17 3.17L13 15h4v2h-2v2h-2v-4z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(webhook)}
                      className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                      title="Edit webhook"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(webhook.id)}
                      className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      title="Delete webhook"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!rotatingWebhook}
        onClose={() => setRotatingWebhook(null)}
        onConfirm={async () => {
          if (!rotatingWebhook) return;
          const updated = await rotateSecretMutation.mutateAsync(rotatingWebhook.id);
          if (updated.secret) {
            onShowSecret(updated.secret, rotatingWebhook.url);
          }
        }}
        title="Rotate Signing Secret"
        message="Are you sure you want to rotate this webhook signing secret? Active integrations using the old secret will fail until updated."
        confirmLabel="Rotate Secret"
        cancelLabel="Cancel"
        type="warning"
        showIcon={false}
      />
    </div>
  );
}
