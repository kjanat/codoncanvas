/**
 * PageHeader Component
 *
 * Consistent page header with title and optional subtitle.
 * Used at the top of page components.
 */

import type { ReactNode } from "react";

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Text alignment */
  align?: "left" | "center";
  /** Optional badge/tag next to title */
  badge?: ReactNode;
  /** Optional action buttons */
  actions?: ReactNode;
}

/**
 * Page header with title and optional subtitle.
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="Mutation Laboratory"
 *   subtitle="Compare original and mutated genomes"
 * />
 *
 * <PageHeader
 *   title="Dashboard"
 *   align="left"
 *   actions={<Button>Export</Button>}
 * />
 * ```
 */
export function PageHeader({
  title,
  subtitle,
  align = "center",
  badge,
  actions,
}: PageHeaderProps) {
  const alignClass = align === "center" ? "text-center" : "text-left";
  const containerClass =
    align === "left" && actions
      ? "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      : "";

  return (
    <div className={`mb-8 ${containerClass}`}>
      <div className={alignClass}>
        <h1 className="mb-2 text-3xl font-bold text-text">
          {title}
          {badge && <span className="ml-3">{badge}</span>}
        </h1>
        {subtitle && <p className="text-text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export default PageHeader;
