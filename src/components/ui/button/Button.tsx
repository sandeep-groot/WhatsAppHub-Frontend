import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export default function Button({
  children,
  className = "",
  disabled = false,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn-primary w-full ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
