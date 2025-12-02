/**
 * Duration formatting utilities
 */

import { MS_PER_SECOND } from "@/analysis/constants";

/**
 * Format milliseconds to human-readable duration string
 *
 * @param ms - Milliseconds to format
 * @returns Formatted string like "2h 30m", "5m 30s", or "45s"
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / MS_PER_SECOND);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
