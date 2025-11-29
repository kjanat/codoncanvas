/**
 * @fileoverview Shared SVG Icon Components
 *
 * Memoized React components for common UI icons.
 * All icons support custom className for sizing/styling.
 *
 * @module ui/Icons
 */

import { memo } from "react";

/** Props for all icon components */
interface IconProps {
  /** CSS class for sizing/styling (default varies by icon) */
  className?: string;
}

/**
 * Sun icon for light theme indicator.
 * @param props - Icon props with optional className
 */
export const SunIcon = memo(function SunIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="5" strokeWidth={2} />
      <path
        d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        strokeLinecap="round"
        strokeWidth={2}
      />
    </svg>
  );
});

/**
 * Moon icon for dark theme indicator.
 * @param props - Icon props with optional className
 */
export const MoonIcon = memo(function MoonIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
});

/**
 * Monitor icon for system theme indicator.
 * @param props - Icon props with optional className
 */
export const SystemIcon = memo(function SystemIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <rect height="14" rx="2" strokeWidth={2} width="20" x="2" y="3" />
      <path d="M8 21h8M12 17v4" strokeLinecap="round" strokeWidth={2} />
    </svg>
  );
});

/**
 * GitHub logo icon for repository links.
 * @param props - Icon props with optional className
 */
export const GitHubIcon = memo(function GitHubIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
        fillRule="evenodd"
      />
    </svg>
  );
});

/**
 * Chevron down icon for dropdowns/accordions.
 * @param props - Icon props with optional className
 */
export const ChevronDownIcon = memo(function ChevronDownIcon({
  className = "h-4 w-4",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M19 9l-7 7-7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
});

/**
 * Checkmark icon for success/completion states.
 * @param props - Icon props with optional className
 */
export const CheckIcon = memo(function CheckIcon({
  className = "h-4 w-4",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        clipRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        fillRule="evenodd"
      />
    </svg>
  );
});

/**
 * Error/warning icon for error states.
 * @param props - Icon props with optional className
 */
export const ErrorIcon = memo(function ErrorIcon({
  className = "h-4 w-4",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        clipRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
        fillRule="evenodd"
      />
    </svg>
  );
});

/**
 * Chevron right icon for navigation/expansion.
 * @param props - Icon props with optional className
 */
export const ChevronRightIcon = memo(function ChevronRightIcon({
  className = "h-5 w-5",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M9 5l7 7-7 7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
});

/**
 * Close/X icon for dismissing modals/panels.
 * @param props - Icon props with optional className
 */
export const CloseIcon = memo(function CloseIcon({
  className = "h-4 w-4",
}: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M6 18L18 6M6 6l12 12"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  );
});
