"use client";

import React, { useState } from "react";
import type { Webhook } from "@/modules/webhook/types";
import { useUpdateWebhookEndpoint, useRotateWebhookSecret } from "@/modules/webhook/client/hooks";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { CheckIcon, CopyIcon, EditIcon, RotateIcon, TrashIcon } from "@/icons";

interface WebhookListProps {
  webhooks: Webhook[];
  onEdit: (webhook: Webhook) => void;
  onDelete: (id: string) => void;
  onShowSecret: (secret: string, url: string) => void;
}


// ─── Status toggle ─────────────────────────────────────────────────────────────

interface StatusToggleProps {
  webhook: Webhook;
  loading: boolean;
  onToggle: () => void;
}

function StatusToggle({ webhook, loading, onToggle }: StatusToggleProps) {
  const isActive = webhook.status === "active";
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onToggle}
        disabled={loading}
        aria-label={isActive ? "Disable webhook" : "Enable webhook"}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:opacity-50 ${
          isActive ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isActive ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
      <span
        className={`text-xs font-semibold uppercase tracking-wider ${
          isActive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-gray-400 dark:text-gray-500"
        }`}
      >
        {isActive ? "Active" : "Disabled"}
      </span>
    </div>
  );
}

// ─── Action buttons ────────────────────────────────────────────────────────────

interface ActionButtonsProps {
  webhook: Webhook;
  copiedId: string | null;
  onCopy: () => void;
  onRotate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function ActionButtons({ webhook, copiedId, onCopy, onRotate, onEdit, onDelete }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onCopy}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all"
        title="Copy URL"
      >
        {copiedId === webhook.id ? <CheckIcon className="text-emerald-500" /> : <CopyIcon />}
      </button>
      <button
        onClick={onRotate}
        className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
        title="Rotate signing secret"
      >
        <RotateIcon />
      </button>
      <button
        onClick={onEdit}
        className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
        title="Edit webhook"
      >
        <EditIcon />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
        title="Delete webhook"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export function WebhookList({ webhooks, onEdit, onDelete, onShowSecret }: WebhookListProps) {
  const updateMutation = useUpdateWebhookEndpoint();
  const rotateSecretMutation = useRotateWebhookSecret();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [rotatingWebhook, setRotatingWebhook] = useState<Webhook | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusToggle = async (webhook: Webhook) => {
    const nextStatus = webhook.status === "active" ? "disabled" : "active";
    setLoadingStates((prev) => ({ ...prev, [webhook.id]: true }));
    try {
      await updateMutation.mutateAsync({ id: webhook.id, data: { status: nextStatus } });
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [webhook.id]: false }));
    }
  };

  if (!Array.isArray(webhooks) || webhooks.length === 0) return null;

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* ── Desktop table (md+) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Endpoint URL
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Description
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {webhooks.map((webhook) => (
                <tr
                  key={webhook.id}
                  className="hover:bg-gray-50/30 dark:hover:bg-gray-700/20 transition-colors"
                >
                  {/* URL */}
                  <td className="px-6 py-4 max-w-xs">
                    <span
                      className="block font-semibold text-sm text-gray-900 dark:text-white truncate"
                      title={webhook.url}
                    >
                      {webhook.url}
                    </span>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                      {webhook.description || <span className="italic text-gray-300 dark:text-gray-600">—</span>}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <StatusToggle
                      webhook={webhook}
                      loading={!!loadingStates[webhook.id]}
                      onToggle={() => handleStatusToggle(webhook)}
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <ActionButtons
                      webhook={webhook}
                      copiedId={copiedId}
                      onCopy={() => handleCopy(webhook.url, webhook.id)}
                      onRotate={() => setRotatingWebhook(webhook)}
                      onEdit={() => onEdit(webhook)}
                      onDelete={() => onDelete(webhook.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile card list (< md) ── */}
        <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-700/50">
          {webhooks.map((webhook) => (
            <div key={webhook.id} className="p-4 space-y-3">

              {/* URL row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                    Endpoint URL
                  </p>
                  <p
                    className="text-sm font-semibold text-gray-900 dark:text-white break-all"
                    title={webhook.url}
                  >
                    {webhook.url}
                  </p>
                </div>
                {/* Copy button inline with URL on mobile */}
                <button
                  onClick={() => handleCopy(webhook.url, webhook.id)}
                  className="p-2 mt-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl transition-all shrink-0"
                  title="Copy URL"
                >
                  {copiedId === webhook.id ? <CheckIcon className="text-emerald-500" /> : <CopyIcon />}
                </button>
              </div>

              {/* Description */}
              {webhook.description && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-0.5">
                    Description
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {webhook.description}
                  </p>
                </div>
              )}

              {/* Status + actions row */}
              <div className="flex items-center justify-between pt-1">
                <StatusToggle
                  webhook={webhook}
                  loading={!!loadingStates[webhook.id]}
                  onToggle={() => handleStatusToggle(webhook)}
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setRotatingWebhook(webhook)}
                    className="p-2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-all"
                    title="Rotate signing secret"
                  >
                    <RotateIcon />
                  </button>
                  <button
                    onClick={() => onEdit(webhook)}
                    className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                    title="Edit webhook"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => onDelete(webhook.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Delete webhook"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rotate secret confirmation */}
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
    </>
  );
}
