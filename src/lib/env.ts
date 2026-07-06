import { z } from "zod";

const apiUrlSchema = z.union([
  z.string().url("Invalid API URL"),
  z.string().regex(/^\//, "Relative API path must start with /"),
]);

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: apiUrlSchema,
  NEXT_PUBLIC_APP_URL: z.string().url("Invalid app URL"),
  NEXT_PUBLIC_APP_NAME: z.string().default("WhatsAppHub"),
  NEXT_PUBLIC_FB_APP_ID: z.string().default(""),
  NEXT_PUBLIC_FB_CONFIG_ID: z.string().default(""),
  NEXT_PUBLIC_YCLOUD_SOLUTION_ID: z.string().default(""),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_FB_APP_ID: process.env.NEXT_PUBLIC_FB_APP_ID,
  NEXT_PUBLIC_FB_CONFIG_ID: process.env.NEXT_PUBLIC_FB_CONFIG_ID,
  NEXT_PUBLIC_YCLOUD_SOLUTION_ID: process.env.NEXT_PUBLIC_YCLOUD_SOLUTION_ID,
});

/** Normalized API base (no trailing slash). Supports same-origin paths e.g. `/v1`. */
export function getApiBaseUrl(): string {
  return env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
}
