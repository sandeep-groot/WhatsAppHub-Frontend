"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import type { Webhook, WebhookStatus } from "@/modules/webhook/types";
import {
  useCreateWebhookEndpoint,
  useUpdateWebhookEndpoint,
  useWebhookEventTypes,
  useWebhookEndpointDetail,
} from "@/modules/webhook/client/hooks";

interface WebhookFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingWebhook: Webhook | null;
}

export function WebhookFormModal({
  isOpen,
  onClose,
  editingWebhook,
}: WebhookFormModalProps) {
  const createMutation = useCreateWebhookEndpoint();
  const updateMutation = useUpdateWebhookEndpoint();

  // Always fetch grouped event types (cached for 5 min)
  const {
    data: eventTypesResponse,
    isLoading: isLoadingEventTypes,
    isError: isEventTypesError,
  } = useWebhookEventTypes();

  // Only fetch webhook detail when editing
  const editingId = isOpen && editingWebhook ? editingWebhook.id : null;
  const {
    data: webhookDetail,
    isLoading: isLoadingDetail,
  } = useWebhookEndpointDetail(editingId);

  // Form state
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<WebhookStatus>("active");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditing = !!editingWebhook;
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error || updateMutation.error;

  // The API envelope is unwrapped by apiFetch — we get WebhookEventGroup[] directly
  const eventGroups = eventTypesResponse ?? [];

  // Show skeleton while event types are loading, or while edit detail is in-flight
  const isLoadingModal =
    isLoadingEventTypes || (isEditing && isLoadingDetail && !webhookDetail);

  // Populate form fields whenever the modal opens or the detail resolves
  useEffect(() => {
    if (!isOpen) return;

    if (isEditing) {
      // Use fetched detail if available, fall back to the list-level stub
      const source = webhookDetail ?? editingWebhook;
      setUrl(source.url);
      setDescription(source.description ?? "");
      setStatus(source.status);
      setSelectedEvents(source.enabledEvents ?? []);
    } else {
      // Add mode — blank slate, nothing pre-selected
      setUrl("");
      setDescription("");
      setStatus("active");
      setSelectedEvents([]);
    }

    setValidationError(null);
  }, [isOpen, isEditing, webhookDetail, editingWebhook]);

  // Toggle a single event
  const handleEventToggle = (eventType: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventType)
        ? prev.filter((e) => e !== eventType)
        : [...prev, eventType]
    );
  };

  // Toggle all events in a category
  const handleCategoryToggle = (categoryEvents: string[]) => {
    const allSelected = categoryEvents.every((t) => selectedEvents.includes(t));
    setSelectedEvents((prev) =>
      allSelected
        ? prev.filter((t) => !categoryEvents.includes(t))
        : [...prev, ...categoryEvents.filter((t) => !prev.includes(t))]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

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

        {/* Error banner */}
        {(validationError || mutationError) && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-400 text-xs font-semibold">
            {validationError ||
              (mutationError as any)?.message ||
              "Something went wrong. Please check your fields and try again."}
          </div>
        )}

        {/* URL */}
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

        {/* Description */}
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

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            Endpoint Status
          </label>
          <div className="flex gap-4">
            {(["active", "disabled"] as WebhookStatus[]).map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer capitalize"
              >
                <input
                  type="radio"
                  disabled={isPending}
                  checked={status === s}
                  onChange={() => setStatus(s)}
                  className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                />
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </label>
            ))}
          </div>
        </div>

        {/* Webhook Events — grouped by category */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Subscribed Webhook Events
            </label>
            {selectedEvents.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedEvents.length} selected
              </span>
            )}
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden max-h-64 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/20">

            {/* Loading skeleton */}
            {isLoadingModal && (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-3 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-8 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-8 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            )}

            {/* Error state */}
            {!isLoadingModal && isEventTypesError && (
              <div className="p-4 text-xs text-red-500 dark:text-red-400 text-center">
                Failed to load event types. Please close and try again.
              </div>
            )}

            {/* Empty state */}
            {!isLoadingModal && !isEventTypesError && eventGroups.length === 0 && (
              <div className="p-4 text-xs text-gray-400 text-center">
                No event types available.
              </div>
            )}

            {/* Groups */}
            {!isLoadingModal &&
              !isEventTypesError &&
              eventGroups.map((group) => {
                const categoryEventTypes = group.events.map((e) => e.type);
                const allChecked = categoryEventTypes.every((t) =>
                  selectedEvents.includes(t)
                );
                const someChecked =
                  !allChecked &&
                  categoryEventTypes.some((t) => selectedEvents.includes(t));

                return (
                  <div key={group.category}>
                    {/* Category header — click to toggle all in group */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleCategoryToggle(categoryEventTypes)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-200/60 dark:hover:bg-gray-700/40 transition-colors disabled:opacity-50"
                    >
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        {group.category}
                      </span>
                      <span
                        className={`text-xs font-semibold ${allChecked
                            ? "text-emerald-600 dark:text-emerald-400"
                            : someChecked
                              ? "text-amber-500 dark:text-amber-400"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                      >
                        {allChecked
                          ? "All selected"
                          : someChecked
                            ? "Partial"
                            : "Select all"}
                      </span>
                    </button>

                    {/* Individual events in this category */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                      {group.events.map((event) => (
                        <label
                          key={event.id}
                          className="flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            disabled={isPending}
                            checked={selectedEvents.includes(event.type)}
                            onChange={() => handleEventToggle(event.type)}
                            className="mt-0.5 w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                              {event.label}
                            </span>
                            <span className="block text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                              {event.type}
                            </span>
                            {event.description && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                {event.description}
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Action buttons */}
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
            disabled={isPending || isLoadingModal}
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
