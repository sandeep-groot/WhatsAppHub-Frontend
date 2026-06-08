// Layout component - Header
"use client";

export function AppHeader() {
  return (
    <header className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-lg font-semibold">Page Title</h2>
        <div className="flex items-center gap-4">
          {/* User menu, notifications, etc. */}
        </div>
      </div>
    </header>
  );
}
