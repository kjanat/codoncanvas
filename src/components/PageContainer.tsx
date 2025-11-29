/**
 * PageContainer Component
 *
 * Consistent page wrapper with max-width and padding.
 * Used as the root container for all page components.
 */

import type { HTMLAttributes, ReactNode } from "react";

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Page content */
  children: ReactNode;
  /** Max width variant */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "7xl" | "full";
}

const MAX_WIDTH_CLASSES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
} as const;

/**
 * Page container with consistent max-width and padding.
 *
 * @example
 * ```tsx
 * export default function MyPage() {
 *   return (
 *     <PageContainer>
 *       <PageHeader title="My Page" />
 *       <Card>Content</Card>
 *     </PageContainer>
 *   );
 * }
 * ```
 */
export function PageContainer({
  children,
  className = "",
  maxWidth = "7xl",
  ...props
}: PageContainerProps) {
  const maxWidthClass = MAX_WIDTH_CLASSES[maxWidth];
  const combinedClasses =
    `mx-auto ${maxWidthClass} px-4 py-8 ${className}`.trim();

  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
}

export default PageContainer;
