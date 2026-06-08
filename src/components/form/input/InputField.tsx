import type { ChangeEvent } from "react";

interface InputProps {
  type?: string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
}

export default function Input({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
  error = false,
}: InputProps) {
  return (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`input-base ${error ? "!border-error-500 focus:!border-error-500" : ""} ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    />
  );
}
