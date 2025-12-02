/**
 * Button Component
 *
 * Reusable button with consistent styling and variants.
 * Replaces 13+ duplicated button className patterns.
 */

import type { ButtonHTMLAttributes, ReactElement, ReactNode } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button content */
  children: ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Full width button */
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover disabled:bg-primary/50",
  secondary:
    "border border-border bg-surface text-text hover:bg-bg-light disabled:opacity-50",
  success:
    "bg-success text-white hover:bg-success-hover disabled:bg-success/50",
  danger: "bg-danger text-white hover:bg-danger-hover disabled:bg-danger/50",
  ghost: "text-text hover:bg-bg-light disabled:opacity-50",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

/**
 * Button component with consistent styling.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Submit
 * </Button>
 *
 * <Button variant="secondary" size="sm" disabled>
 *   Cancel
 * </Button>
 *
 * <Button variant="success" fullWidth>
 *   Save Changes
 * </Button>
 * ```
 */
export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps): ReactElement {
  const baseClasses =
    "rounded-lg font-medium transition-colors disabled:cursor-not-allowed";
  const variantClass = VARIANT_CLASSES[variant];
  const sizeClass = SIZE_CLASSES[size];
  const widthClass = fullWidth ? "w-full" : "";

  const combinedClasses = [
    baseClasses,
    variantClass,
    sizeClass,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={combinedClasses}
      disabled={disabled}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
