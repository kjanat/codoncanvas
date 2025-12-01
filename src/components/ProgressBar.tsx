/**
 * ProgressBar Component - Displays progress as a horizontal bar
 */

import type { ReactElement } from "react";

export interface ProgressBarProps {
  /** Progress percentage (0-100) */
  value: number;
  /** Height variant */
  size?: "sm" | "md";
  /** Color style */
  variant?: "primary" | "success" | "gradient";
  /** Custom gradient class (e.g., "from-blue-500 to-cyan-500") */
  gradientClass?: string;
  /** Additional classes for the container */
  className?: string;
  /** Background color class */
  bgClass?: string;
  /** Accessible label for screen readers */
  ariaLabel?: string;
}

export function ProgressBar({
  value,
  size = "md",
  variant = "primary",
  gradientClass,
  className = "",
  bgClass = "bg-border",
  ariaLabel,
}: ProgressBarProps): ReactElement {
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
  };

  const variantClasses = {
    primary: "bg-primary",
    success: "bg-success",
    gradient: `bg-linear-to-r ${gradientClass ?? "from-primary to-success"}`,
  };

  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      aria-label={ariaLabel}
      aria-valuemax={100}
      aria-valuemin={0}
      aria-valuenow={clampedValue}
      className={`overflow-hidden rounded-full ${bgClass} ${sizeClasses[size]} ${className}`}
      role="progressbar"
    >
      <div
        className={`h-full rounded-full transition-all ${variantClasses[variant]}`}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
