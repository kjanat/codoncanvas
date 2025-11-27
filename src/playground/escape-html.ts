/**
 * HTML Escaping Utility
 * DOM-free module for escaping HTML special characters
 */

/**
 * SECURITY: Escape HTML to prevent XSS attacks
 * Use this when building HTML strings from user input
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
