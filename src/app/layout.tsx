import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { QueryProvider } from "@/query/provider";
import type { Metadata } from "next";
import { APP_CONFIG } from "@/lib/constants";

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {  title: APP_CONFIG.name,
  description: APP_CONFIG.description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} bg-gray-50 dark:bg-gray-900`}>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>
              <QueryProvider>{children}</QueryProvider>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
