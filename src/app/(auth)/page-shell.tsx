/**
 * Optional shared auth page wrapper component
 * Can be used to wrap all auth pages with common layout/styling
 */

interface AuthPageShellProps {
  children: React.ReactNode;
}

export default function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="auth-shell">
      {children}
    </div>
  );
}
