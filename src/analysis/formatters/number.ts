/**
 * Number formatting utilities
 */

/**
 * Format percentage value to string
 *
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string like "85.5%"
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format numeric value with specified decimal places
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with specified precision
 */
export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}
