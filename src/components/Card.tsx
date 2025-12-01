/**
 * Card Component
 *
 * Reusable card container with consistent styling.
 * Used throughout the application for content sections.
 */

import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode;
  /** Additional padding variant */
  padding?: "sm" | "md" | "lg" | "xl";
  /** Whether to apply hover effect */
  hoverable?: boolean;
  /** Whether card is interactive (button-like) */
  interactive?: boolean;
}

const PADDING_CLASSES = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
} as const;

/**
 * Card container with consistent styling.
 *
 * @example
 * ```tsx
 * <Card>
 *   <h2>Title</h2>
 *   <p>Content goes here</p>
 * </Card>
 *
 * <Card hoverable padding="lg">
 *   <p>Hoverable large card</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  className = "",
  padding = "md",
  hoverable = false,
  interactive = false,
  ...props
}: CardProps) {
  const baseClasses = "rounded-xl border border-border bg-surface shadow-sm";
  const paddingClass = PADDING_CLASSES[padding];
  const hoverClass = hoverable ? "transition-shadow hover:shadow-md" : "";
  const interactiveClass = interactive
    ? "cursor-pointer transition-all hover:border-primary hover:shadow-md"
    : "";

  const combinedClasses = [
    baseClasses,
    paddingClass,
    hoverClass,
    interactiveClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  /** Card title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Optional right-side action */
  action?: ReactNode;
}

/**
 * Card header with title, optional subtitle and action.
 */
export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default Card;
