/**
 * DemoCard Component
 *
 * Reusable card component for demo pages with gradient accent,
 * icon, title, description and link.
 */

import { Link } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { ChevronRightIcon } from "@/ui/icons";

/** Allowed gradient color combinations for demo cards */
export type DemoGradient =
  | "from-purple-500 to-pink-500"
  | "from-blue-500 to-cyan-500"
  | "from-green-500 to-emerald-500"
  | "from-orange-500 to-amber-500"
  | "from-indigo-500 to-violet-500"
  | "from-yellow-500 to-orange-500"
  | "from-teal-500 to-cyan-500";

export interface DemoCardProps {
  /** Route path for the demo */
  path: string;
  /** Demo title */
  title: string;
  /** Demo description */
  description: string;
  /** SVG path data for the icon */
  icon: string;
  /** Tailwind gradient class */
  color: DemoGradient;
}

/**
 * Card component for displaying demo links with gradient styling.
 */
export function DemoCard({
  path,
  title,
  description,
  icon,
  color,
}: DemoCardProps): ReactElement {
  return (
    <Link
      className="group relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-lg"
      to={path}
    >
      {/* Gradient accent bar */}
      <div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${color}`} />

      {/* Icon with gradient background */}
      <div
        className={`mb-4 inline-flex rounded-lg bg-linear-to-r p-3 ${color}`}
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
        >
          <path d={icon} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Content */}
      <h2 className="mb-2 text-xl font-semibold text-text group-hover:text-primary">
        {title}
      </h2>
      <p className="text-sm text-text-muted">{description}</p>

      {/* Open Demo link with arrow */}
      <div className="mt-4 flex items-center text-sm font-medium text-primary">
        <span>Open Demo</span>
        <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default DemoCard;
