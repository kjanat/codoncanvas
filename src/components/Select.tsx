/**
 * Select Component - Reusable styled dropdown
 */

import type { SelectHTMLAttributes } from "react";

export interface SelectOption<T extends string | number = string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string | number = string>
  extends Omit<
    SelectHTMLAttributes<HTMLSelectElement>,
    "onChange" | "value" | "size"
  > {
  /** Options to display */
  options: SelectOption<T>[];
  /** Current value */
  value: T;
  /** Change handler */
  onChange: (value: T) => void;
  /** Size variant */
  size?: "sm" | "md";
}

export function Select<T extends string | number = string>({
  options,
  value,
  onChange,
  size = "md",
  className = "",
  disabled,
  ...props
}: SelectProps<T>) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-2 text-sm",
  };

  return (
    <select
      className={`rounded-lg border border-border bg-surface ${sizeClasses[size]} focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      disabled={disabled}
      onChange={(e) => {
        const rawValue = e.target.value;
        // Convert back to number if original value was number
        const typedValue = (
          typeof value === "number" ? Number(rawValue) : rawValue
        ) as T;
        onChange(typedValue);
      }}
      value={value}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
