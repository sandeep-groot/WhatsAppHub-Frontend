"use client";

import React, { useMemo, useState } from "react";
import {
  useSendWhatsAppMessage,
  useWhatsAppTemplates,
} from "@/modules/whatsapp/client/hooks";
import type {
  SendMessageInput,
  SendMessageResult,
  WhatsAppMessageType,
  WhatsAppTemplate,
} from "@/modules/whatsapp/types";

const DEFAULT_FROM = "";
const DEFAULT_TO = "";

const PLACEHOLDER_REGEX = /\{\{[^}]+\}\}/g;

/** Returns the BODY component text of a template (if any). */
function getTemplateBodyText(template?: WhatsAppTemplate): string {
  const body = template?.components.find((c) => c.type === "BODY");
  return body?.text ?? "";
}

/** Returns the list of placeholder tokens (e.g. {{name}}) in the body. */
function getTemplatePlaceholders(template?: WhatsAppTemplate): string[] {
  const text = getTemplateBodyText(template);
  return text.match(PLACEHOLDER_REGEX) ?? [];
}

export function SendMessageForm() {
  const sendMutation = useSendWhatsAppMessage();
  const templatesQuery = useWhatsAppTemplates({ page: 1, limit: 50 });

  const templates = useMemo(
    () => templatesQuery.data?.items ?? [],
    [templatesQuery.data]
  );

  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const [type, setType] = useState<WhatsAppMessageType>("template");
  const [text, setText] = useState("");
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [templateParams, setTemplateParams] = useState<Record<number, string>>(
    {}
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<SendMessageResult | null>(null);

  const isPending = sendMutation.isPending;
  const sendError = sendMutation.error as Error | null;

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.name === selectedTemplateName),
    [templates, selectedTemplateName]
  );

  const placeholders = useMemo(
    () => getTemplatePlaceholders(selectedTemplate),
    [selectedTemplate]
  );

  const handleSelectTemplate = (name: string) => {
    setSelectedTemplateName(name);
    setTemplateParams({});
  };

  const handleParamChange = (index: number, value: string) => {
    setTemplateParams((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setResult(null);

    const cleanedFrom = from.replace(/[^\d]/g, "");
    const cleanedTo = to.replace(/[^\d]/g, "");

    if (!cleanedFrom) {
      setValidationError(
        "Please enter the sender number (digits only, with country code)."
      );
      return;
    }
    if (!cleanedTo) {
      setValidationError(
        "Please enter the recipient number (digits only, with country code)."
      );
      return;
    }

    let payload: SendMessageInput;

    if (type === "text") {
      if (!text.trim()) {
        setValidationError("Please enter the message text to send.");
        return;
      }
      payload = {
        type: "text",
        from: cleanedFrom,
        to: cleanedTo,
        text: { body: text.trim() },
      };
    } else {
      if (!selectedTemplate) {
        setValidationError("Please select a template.");
        return;
      }
      const missing = placeholders.some(
        (_, i) => !(templateParams[i] ?? "").trim()
      );
      if (missing) {
        setValidationError("Please fill in all template parameters.");
        return;
      }

      payload = {
        type: "template",
        from: cleanedFrom,
        to: cleanedTo,
        template: {
          name: selectedTemplate.name,
          language: { code: selectedTemplate.language },
          ...(placeholders.length > 0
            ? {
                components: [
                  {
                    type: "body",
                    parameters: placeholders.map((_, i) => ({
                      type: "text" as const,
                      text: (templateParams[i] ?? "").trim(),
                    })),
                  },
                ],
              }
            : {}),
        },
      };
    }

    try {
      const res = await sendMutation.mutateAsync(payload);
      setResult(res);
    } catch (err) {
      console.error("Failed to send WhatsApp message", err);
    }
  };

  const sentMessageId =
    result?.id ?? result?.messages?.[0]?.id ?? undefined;
  const recipientWaId = result?.contacts?.[0]?.wa_id;

  const inputClass =
    "w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white transition-all disabled:opacity-50";
  const labelClass =
    "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error banner */}
          {(validationError || sendError) && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-800 dark:text-red-400 text-xs font-semibold">
              {validationError ||
                sendError?.message ||
                "Something went wrong. Please try again."}
            </div>
          )}

          {/* Sender / Recipient numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sender Number (From)</label>
              <input
                type="tel"
                required
                disabled={isPending}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="e.g. +917428730894"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Recipient Number (To)</label>
              <input
                type="tel"
                required
                disabled={isPending}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="e.g. 917428730894"
                className={inputClass}
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
            Full numbers including country code, digits only (no + or spaces).
          </p>

          {/* Message type */}
          <div>
            <label className={labelClass}>Message Type</label>
            <div className="flex gap-4">
              {(["template", "text"] as WhatsAppMessageType[]).map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer capitalize"
                >
                  <input
                    type="radio"
                    disabled={isPending}
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                  />
                  {t}
                </label>
              ))}
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Use a pre-approved template to start a new conversation. Free-form
              text only works inside an open 24-hour customer window.
            </p>
          </div>

          {/* Template fields */}
          {type === "template" && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Template</label>
                {templatesQuery.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-2">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
                    Loading templates…
                  </div>
                ) : templatesQuery.isError ? (
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400 py-2">
                    Failed to load templates.{" "}
                    <button
                      type="button"
                      onClick={() => templatesQuery.refetch()}
                      className="underline"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <select
                    disabled={isPending}
                    value={selectedTemplateName}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select a template…</option>
                    {templates.map((t) => (
                      <option key={t.officialTemplateId} value={t.name}>
                        {t.name} ({t.language})
                        {t.status ? ` · ${t.status}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Template body preview */}
              {selectedTemplate && (
                <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                    Preview
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                    {getTemplateBodyText(selectedTemplate) ||
                      "This template has no body text."}
                  </p>
                </div>
              )}

              {/* Template parameters */}
              {selectedTemplate && placeholders.length > 0 && (
                <div className="space-y-3">
                  <label className={labelClass}>Template Parameters</label>
                  {placeholders.map((token, i) => (
                    <div key={i}>
                      <input
                        type="text"
                        disabled={isPending}
                        value={templateParams[i] ?? ""}
                        onChange={(e) => handleParamChange(i, e.target.value)}
                        placeholder={`Value for ${token}`}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Text field */}
          {type === "text" && (
            <div>
              <label className={labelClass}>Message Text</label>
              <textarea
                disabled={isPending}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="Type your message…"
                className={`${inputClass} resize-y`}
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-sm shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
              <span>{isPending ? "Sending…" : "Send Message"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Success result */}
      {result && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-300">
                Message sent successfully
              </h3>
              <p className="text-sm text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
                The request was accepted and the message was queued for delivery.
              </p>
              <dl className="mt-3 space-y-1 text-xs">
                {recipientWaId && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Recipient WA ID:
                    </dt>
                    <dd className="font-mono text-emerald-900 dark:text-emerald-200 break-all">
                      {recipientWaId}
                    </dd>
                  </div>
                )}
                {sentMessageId && (
                  <div className="flex gap-2">
                    <dt className="font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Message ID:
                    </dt>
                    <dd className="font-mono text-emerald-900 dark:text-emerald-200 break-all">
                      {sentMessageId}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
