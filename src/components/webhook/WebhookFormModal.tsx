"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import type { Webhook, WebhookStatus } from "@/modules/webhook/types";
import { useCreateWebhookEndpoint, useUpdateWebhookEndpoint } from "@/modules/webhook/client/hooks";

interface WebhookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWebhook: Webhook | null;
}

const AVAILABLE_EVENTS = [
  { id: "whatsapp.inbound_message.received", label: "whatsapp.inbound_message.received", desc: "Triggers when a new WhatsApp message is received from a customer." },
  { id: "whatsapp.message.updated", label: "whatsapp.message.updated", desc: "Triggers when a message delivery state changes (sent, delivered, read, failed)." },
  { id: "whatsapp.phone_number.updated", label: "whatsapp.phone_number.updated", desc: "Triggers when name, status, or verification of a phone number changes." },
  { id: "whatsapp.template.updated", label: "whatsapp.template.updated", desc: "Triggers when a WhatsApp message template status changes (approved, rejected)." },
  { id: "whatsapp.business_account.updated", label: "whatsapp.business_account.updated", desc: "Triggers when a WABA review status or configuration changes." },
];

export function WebhookFormModal({
  isOpen,
  onClose,
  editingWebhook,
}: WebhookFormModalProps) {
  const createMutation = useCreateWebhookEndpoint();
  const updateMutation = useUpdateWebhookEndpoint();

  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<WebhookStatus>("active");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditing = !!editingWebhook;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  useEffect(() => {
    if (isOpen) {
      if (editingWebhook) {
        setUrl(editingWebhook.url);
        setDescription(editingWebhook.description || "");
        setStatus(editingWebhook.status);
        setSelectedEvents(editingWebhook.enabledEvents);
      } else {
        setUrl("");
        setDescription("");
        setStatus("active");
        setSelectedEvents(["whatsapp.inbound_message.received", "whatsapp.message.updated"]);
      }
      setValidationError(null);
    }
  }, [isOpen, editingWebhook]);

  const handleCheckboxChange = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId) ? prev.filter((id) => id !== eventId) : [...prev, eventId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Basic URL validation
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setValidationError("Endpoint URL must start with http:// or https://");
      return;
    }

    if (selectedEvents.length === 0) {
      setValidationError("Please subscribe to at least one webhook event.");
      return;
    }

    try {
      if (isEditing && editingWebhook) {
        await updateMutation.mutateAsync({
          id: editingWebhook.id,
          data: { url, description, status, enabledEvents: selectedEvents },
        });
      } else {
        await createMutation.mutateAsync({
          url,
          description,
          status,
          enabledEvents: selectedEvents,
        });
      }
      onClose();
    } catch (err) {
      console.error("Failed to save webhook", err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Webhook Endpoint" : "Add Webhook Endpoint"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Error notification */}
        {(validationError || error) && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-400 text-xs font-semibold">
            {validationError || (error as any).message || "Something went wrong. Please check your fields and try again."}
          </div>
        )}

        {/* URL Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Endpoint URL
          </label>
          <input
            type="url"
            required
            disabled={isPending}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. https://your-server.com/webhooks/whatsapp"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white transition-all disabled:opacity-50"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <input
            type="text"
            disabled={isPending}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Receive message updates and outbound tracking"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white transition-all disabled:opacity-50"
          />
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Endpoint Status
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="radio"
                disabled={isPending}
                checked={status === "active"}
                onChange={() => setStatus("active")}
                className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="radio"
                disabled={isPending}
                checked={status === "disabled"}
                onChange={() => setStatus("disabled")}
                className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
              />
              Disabled
            </label>
          </div>
        </div>

        {/* Event Checkbox List */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Subscribed Webhook Events
          </label>
          <div className="divide-y divide-gray-150 dark:divide-gray-750 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-56 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/20">
            {AVAILABLE_EVENTS.map((event) => (
              <label
                key={event.id}
                className="flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  disabled={isPending}
                  checked={selectedEvents.includes(event.id)}
                  onChange={() => handleCheckboxChange(event.id)}
                  className="mt-1 w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                />
                <div>
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {event.label}
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {event.desc}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {isPending && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{isEditing ? "Save Changes" : "Create Endpoint"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
