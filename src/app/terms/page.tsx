import { env } from "@/lib/env";
import { PAGE_ROUTES } from "@/lib/constants";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Terms of Service | ${env.NEXT_PUBLIC_APP_NAME}`,
  description: `Terms of Service for ${env.NEXT_PUBLIC_APP_NAME}`,
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={PAGE_ROUTES.LOGIN} className="flex items-center gap-2">
            <Image
              src="/images/logo/logo-icon.svg"
              alt={env.NEXT_PUBLIC_APP_NAME}
              width={32}
              height={32}
            />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {env.NEXT_PUBLIC_APP_NAME}
            </span>
          </Link>
          <Link
            href={PAGE_ROUTES.LOGIN}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>

        <div className="mt-8 space-y-6 text-gray-700 dark:text-gray-300">
          <p>
            By using {env.NEXT_PUBLIC_APP_NAME}, you agree to comply with all
            applicable laws and Meta WhatsApp Business policies.
          </p>

          <p>
            Users are responsible for the content and messaging activity
            conducted through connected WhatsApp Business accounts.
          </p>

          <p>
            We may suspend access for abuse, spam, or policy violations.
          </p>

          <p>
            The service is provided &quot;as is&quot; without warranties.
          </p>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contact
            </h2>
            <p className="mt-2">
              If you have questions about these terms, contact us at{" "}
              <a
                href="mailto:info@grootsoftwares.com"
                className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                info@grootsoftwares.com
              </a>
              .
            </p>
          </section>
        </div>

        <p className="mt-10 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href={PAGE_ROUTES.DATA_DELETION}
            className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Data Deletion Instructions
          </Link>
          <Link
            href={PAGE_ROUTES.PRIVACY}
            className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            Privacy Policy
          </Link>
          <Link
            href={PAGE_ROUTES.LOGIN}
            className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
          >
            ← Back to sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
