// Layout component - AppShell
"use client";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return <>{children}</>;
}
