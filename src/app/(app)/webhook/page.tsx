"use client";

import React, { useState } from "react";
import { WebhookList } from "@/components/webhook/WebhookList";
import { WebhookFormModal } from "@/components/webhook/WebhookFormModal";
import { WebhookSecretModal } from "@/components/webhook/WebhookSecretModal";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useWebhookEndpoints, useDeleteWebhookEndpoint } from "@/modules/webhook/client/hooks";
import type { Webhook } from "@/modules/webhook/types";

export default function WebhookPage() {
  const { data: webhooksData, isLoading, error, refetch } = useWebhookEndpoints();
  const deleteMutation = useDeleteWebhookEndpoint();

  const webhooks = (() => {
    if (!webhooksData) return [];
    if (Array.isArray(webhooksData)) return webhooksData;

    // Check nested array formats (e.g. paginated items/data)
    if (Array.isArray((webhooksData as any).data)) {
      return (webhooksData as any).data;
    }
    if (Array.isArray((webhooksData as any).items)) {
      return (webhooksData as any).items;
    }

    // Check if double-nested (e.g., data: { items: [...] })
    if ((webhooksData as any).data && Array.isArray((webhooksData as any).data.items)) {
      return (webhooksData as any).data.items;
    }
    if ((webhooksData as any).data && Array.isArray((webhooksData as any).data.data)) {
      return (webhooksData as any).data.data;
    }

    // If it is a single webhook object (having id and url)
    if ((webhooksData as any).id && (webhooksData as any).url) {
      return [webhooksData as Webhook];
    }

    // If it is a wrapped single webhook object: { data: { id: "...", url: "..." } }
    if ((webhooksData as any).data && (webhooksData as any).data.id && (webhooksData as any).data.url) {
      return [(webhooksData as any).data as Webhook];
    }

    return [];
  })();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
  const [deletingWebhookId, setDeletingWebhookId] = useState<string | null>(null);

  const [isSecretOpen, setIsSecretOpen] = useState(false);
  const [rotatedSecret, setRotatedSecret] = useState("");
  const [rotatedUrl, setRotatedUrl] = useState("");

  const handleAddClick = () => {
    setEditingWebhook(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (webhook: Webhook) => {
    setEditingWebhook(webhook);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingWebhookId(id);
  };

  const handleShowSecret = (secret: string, url: string) => {
    setRotatedSecret(secret);
    setRotatedUrl(url);
    setIsSecretOpen(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Webhook Integrations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage YCloud webhook endpoints to receive real-time updates for WhatsApp events.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-sm shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 self-start sm:self-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Webhook</span>
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-8 space-y-4 animate-pulse">
          <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded-lg w-1/4" />
          <div className="h-10 bg-gray-150 dark:bg-gray-750 rounded-lg w-full" />
          <div className="h-10 bg-gray-150 dark:bg-gray-750 rounded-lg w-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-150 dark:border-red-500/20 rounded-2xl p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-3 text-red-600 dark:text-red-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-950 dark:text-white mb-1">Failed to load webhooks</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">
            {(error as any).message || "The server responded with an error. Check your connection or credentials."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : !webhooks || webhooks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center mb-4 text-gray-400 dark:text-gray-500">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
            No Webhook Endpoints
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
            You haven't configured any YCloud webhook endpoints yet. Register one to start routing live events.
          </p>
          <button
            onClick={handleAddClick}
            className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-sm shadow-emerald-500/20 transition-all"
          >
            Configure Webhook
          </button>
        </div>
      ) : (
        <WebhookList
          webhooks={webhooks}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onShowSecret={handleShowSecret}
        />
      )}

      {/* Overlay Form Modal */}
      <WebhookFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingWebhook={editingWebhook}
      />

      {/* Secret Display Modal */}
      <WebhookSecretModal
        isOpen={isSecretOpen}
        onClose={() => setIsSecretOpen(false)}
        secret={rotatedSecret}
        endpointUrl={rotatedUrl}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingWebhookId}
        onClose={() => setDeletingWebhookId(null)}
        onConfirm={async () => {
          if (!deletingWebhookId) return;
          await deleteMutation.mutateAsync(deletingWebhookId);
        }}
        title="Delete Webhook Endpoint"
        message="Are you sure you want to delete this webhook endpoint? This action is permanent and cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        type="danger"
        showIcon={false}
      />
    </div>
  );
}
