import Image from "next/image";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";

export const metadata = {
  title: "Authentication | WhatsAppHub",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900 lg:bg-gradient-to-r lg:from-gray-50 lg:to-gray-50 dark:lg:bg-gradient-to-r dark:lg:from-gray-900 dark:lg:to-gray-900">
      {/* Theme Toggle - Fixed bottom right corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <ThemeTogglerTwo />
      </div>

      {/* Mobile Layout - Full gradient background */}
      <div className="flex lg:hidden flex-col w-full min-h-screen bg-gradient-to-br from-[#128C7E] to-[#25D366] dark:from-[#0d2d2a] dark:to-[#0f3d30]">
        {/* Grid Background - Covering entire screen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: "url('/images/shape/grid-01.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Decorative pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col justify-between min-h-screen px-6 py-8">
          {/* Top Brand Section */}
          <div className="flex flex-col items-center justify-center pt-4 sm:pt-8">
            {/* Brand Content */}
            <div>
              <div className="mb-6 block">
                <Image
                  src="/images/logo/logo-dark.svg"
                  alt="WhatsApp Hub"
                  width={200}
                  height={44}
                  priority
                />
              </div>
              <p className="text-center text-sm leading-relaxed text-white/95 max-w-sm font-light">
                Internal operations dashboard for client onboarding, asset management, and live monitoring.
              </p>
            </div>
          </div>

          {/* Form Container - Centered vertically */}
          <div className="flex items-center justify-center w-full px-4 sm:px-6">
            <div className="w-full max-w-sm bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-5 sm:p-6 md:p-8">
              {children}
            </div>
          </div>

          {/* Bottom spacer */}
          <div className="h-4" />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        {/* Form side */}
        <div className="flex w-1/2 items-center justify-center px-8 py-12 bg-gray-50 dark:bg-gray-900">
          <div className="w-full max-w-sm">
            {children}
          </div>
        </div>

        {/* Brand side */}
        <div className="relative w-1/2 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#128C7E] to-[#25D366] dark:from-[#0d2d2a] dark:to-[#0f3d30]">
          {/* Grid Background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/images/shape/grid-01.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Original decorative pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* Brand Content */}
          <div className="relative z-10 flex max-w-sm flex-col items-center px-8 text-center">
            <div className="mb-8 block">
              <Image
                src="/images/logo/logo-dark.svg"
                alt="WhatsApp Hub"
                width={200}
                height={44}
                priority
              />
            </div>
            <p className="text-base leading-relaxed text-white/95 font-light">
              Internal operations dashboard for client onboarding, asset
              management, and live monitoring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}