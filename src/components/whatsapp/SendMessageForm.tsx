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
import {
  CheckBoldIcon,
  SendMessageIcon,
  WhatsAppIcon,
} from "@/icons";
import { MESSAGE_FORM_DEFAULTS } from "@/lib/constants";
import { CountryPhoneInput } from "@/components/common/CountryPhoneInput";

const PLACEHOLDER_REGEX = /\{\{[^}]+\}\}/g;

/** Returns the BODY component text of a template (if any). */
function getTemplateBodyText(template?: WhatsAppTemplate): string {
  const body = template?.components.find((c) => c.type === "BODY");
  return body?.text ?? "";
}

/** Returns the list of placeholder tokens (e.g. {{1}}) in the body. */
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

  const [from, setFrom] = useState(MESSAGE_FORM_DEFAULTS.from);
  const [to, setTo] = useState(MESSAGE_FORM_DEFAULTS.to);
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

    if (!cleanedFrom || cleanedFrom.length < 7) {
      setValidationError(
        "Please select a country and enter a valid sender phone number."
      );
      return;
    }
    if (!cleanedTo || cleanedTo.length < 7) {
      setValidationError(
        "Please select a country and enter a valid recipient phone number."
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
        setValidationError("Please select a pre-approved template.");
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
    "w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 dark:text-white transition-all disabled:opacity-50 font-medium";
  const labelClass =
    "block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5";

  // Interpolated preview text for template
  const previewText = useMemo(() => {
    if (!selectedTemplate) return "";
    let body = getTemplateBodyText(selectedTemplate);
    placeholders.forEach((token, i) => {
      const val = templateParams[i] ?? token;
      body = body.replace(token, val);
    });
    return body;
  }, [selectedTemplate, placeholders, templateParams]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Container Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700/80 shadow-sm overflow-hidden transition-all">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Error Banner */}
          {(validationError || sendError) && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
              {validationError ||
                sendError?.message ||
                "Something went wrong. Please check your inputs and try again."}
            </div>
          )}

          {/* Phone Numbers Grid with Country Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CountryPhoneInput
              label="Sender Number (From)"
              value={from}
              onChange={setFrom}
              disabled={isPending}
              placeholder="e.g. 7428730894"
              required
            />
            <CountryPhoneInput
              label="Recipient Number (To)"
              value={to}
              onChange={setTo}
              disabled={isPending}
              placeholder="e.g. 9728279578"
              required
            />
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Select the country to auto-fill dial code.
          </p>

          {/* Message Type Selector Pills */}
          <div className="space-y-2 pt-2">
            <label className={labelClass}>Message Type</label>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setType("template")}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-2xl border transition-all ${
                  type === "template"
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500/50"
                }`}
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>Pre-approved Template</span>
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={() => setType("text")}
                className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-2xl border transition-all ${
                  type === "text"
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-emerald-500/50"
                }`}
              >
                <SendMessageIcon className="w-4 h-4" />
                <span>Free-form Text</span>
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">
              {type === "template"
                ? "Templates can initiate new 24-hour business conversation windows."
                : "Free-form text only delivers within an active 24-hour customer window."}
            </p>
          </div>

          {/* Template Section */}
          {type === "template" && (
            <div className="space-y-5 pt-2">
              <div>
                <label className={labelClass}>Select Template</label>
                {templatesQuery.isLoading ? (
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 py-3">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    Loading Meta templates…
                  </div>
                ) : templatesQuery.isError ? (
                  <div className="text-xs font-semibold text-rose-600 dark:text-rose-400 py-2 flex items-center gap-2">
                    Failed to load templates.
                    <button
                      type="button"
                      onClick={() => templatesQuery.refetch()}
                      className="underline font-bold"
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
                    <option value="">Choose an approved template…</option>
                    {templates.map((t) => (
                      <option key={t.officialTemplateId} value={t.name}>
                        {t.name} ({t.language}) {t.status ? `· ${t.status}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Live Chat Bubble Preview */}
              {selectedTemplate && (
                <div className="rounded-2xl border border-gray-100 dark:border-gray-700/80 bg-gray-50/80 dark:bg-gray-900/40 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Live Message Preview
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {selectedTemplate.language}
                    </span>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                    {previewText || "This template has no body text."}
                  </div>
                </div>
              )}

              {/* Template Parameters Input */}
              {selectedTemplate && placeholders.length > 0 && (
                <div className="space-y-3 pt-1">
                  <label className={labelClass}>Template Variables / Parameters</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {placeholders.map((token, i) => (
                      <div key={i} className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Variable {token}
                        </span>
                        <input
                          type="text"
                          disabled={isPending}
                          value={templateParams[i] ?? ""}
                          onChange={(e) => handleParamChange(i, e.target.value)}
                          placeholder={`Enter value for ${token}`}
                          className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Message Field */}
          {type === "text" && (
            <div className="space-y-2 pt-2">
              <label className={labelClass}>Message Text</label>
              <textarea
                disabled={isPending}
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="Type your WhatsApp message text here…"
                className={`${inputClass} resize-y leading-relaxed`}
              />
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700/80">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-3 text-sm font-bold rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2.5"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <SendMessageIcon className="w-4 h-4" />
              )}
              <span>{isPending ? "Sending Message…" : "Send Message"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Success Result Box */}
      {result && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-6 shadow-sm transition-all">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
              <CheckBoldIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300">
                Message Sent Successfully
              </h3>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-400/80 mt-1">
                The WhatsApp message request was accepted and queued for delivery.
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-200/60 dark:border-emerald-500/20 text-xs">
                {recipientWaId && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Recipient WA ID
                    </span>
                    <span className="font-mono text-emerald-950 dark:text-emerald-100 font-semibold break-all">
                      {recipientWaId}
                    </span>
                  </div>
                )}
                {sentMessageId && (
                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Message ID
                    </span>
                    <span className="font-mono text-emerald-950 dark:text-emerald-100 font-semibold break-all">
                      {sentMessageId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
