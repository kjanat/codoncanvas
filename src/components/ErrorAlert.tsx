/**
 * ErrorAlert Component
 *
 * Consistent error message display.
 */

import type { ReactNode } from "react";

export interface ErrorAlertProps {
  /** Error message or content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Error alert with consistent styling.
 *
 * @example
 * ```tsx
 * {error && <ErrorAlert>{error}</ErrorAlert>}
 * ```
 */
export function ErrorAlert({ children, className = "" }: ErrorAlertProps) {
  return (
    <div
      className={`rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger ${className}`}
    >
      {children}
    </div>
  );
}

export default ErrorAlert;
