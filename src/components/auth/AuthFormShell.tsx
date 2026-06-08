"use client";

import type { ReactNode } from "react";

interface AuthFormShellProps {
  children: ReactNode;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
  footer?: ReactNode;
}

export default function AuthFormShell({
  children,
  title,
  description,
  footer,
}: AuthFormShellProps) {
  return (
    <div className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-900 lg:w-full gap-10">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        </div>

        {children}

        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}