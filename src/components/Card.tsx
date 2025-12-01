/**
 * Card Component
 *
 * Reusable card container with consistent styling.
 * Used throughout the application for content sections.
 */

import type {
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  ReactNode,
} from "react";

const PADDING_CLASSES = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-12",
} as const;

type PaddingSize = keyof typeof PADDING_CLASSES;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode;
  /** Additional padding variant */
  padding?: PaddingSize;
  /** Whether to apply hover effect */
  hoverable?: boolean;
  /** Whether card is interactive (button-like) */
  interactive?: boolean;
}

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
  role,
  tabIndex,
  onClick,
  onKeyDown,
  ...props
}: CardProps): ReactElement {
  // Set role="button" and tabIndex=0 when interactive or has onClick for a11y
  const needsButtonRole = interactive || !!onClick;

  const baseClasses = "rounded-xl border border-border bg-surface shadow-sm";
  const paddingClass = PADDING_CLASSES[padding];
  const hoverClass =
    hoverable && !needsButtonRole ? "transition-shadow hover:shadow-md" : "";
  const interactiveClass = needsButtonRole
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

  // Handle keyboard activation for interactive cards (WCAG 2.1 compliance)
  const handleKeyDown =
    needsButtonRole && onClick
      ? (event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClick(event as unknown as MouseEvent<HTMLDivElement>);
          }
          onKeyDown?.(event);
        }
      : onKeyDown;

  const interactiveProps = needsButtonRole
    ? {
        role: role ?? "button",
        tabIndex: tabIndex ?? 0,
        onClick,
        onKeyDown: handleKeyDown,
      }
    : { role, tabIndex, onClick, onKeyDown };

  return (
    <div className={combinedClasses} {...interactiveProps} {...props}>
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  /** Card title */
  title: ReactNode;
  /** Optional subtitle */
  subtitle?: ReactNode;
  /** Optional right-side action */
  action?: ReactNode;
}

/**
 * Card header with title, optional subtitle and action.
 */
export function CardHeader({
  title,
  subtitle,
  action,
}: CardHeaderProps): ReactElement {
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
