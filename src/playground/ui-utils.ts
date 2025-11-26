/**
 * UI Utilities Module
 * Common helper functions for UI updates and status management
 */

import {
  statusMessage,
  statusBar,
  codonCount,
  instructionCount,
  themeToggleBtn,
} from "./dom-manager";
import { themeManager } from "./ui-state";

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

/**
 * Set status message and bar styling
 */
export function setStatus(
  message: string,
  type: "info" | "error" | "success",
) {
  statusMessage.textContent = message;
  statusBar.className = `status-bar ${type}`;
}

/**
 * Update codon and instruction count displays
 */
export function updateStats(codons: number, instructions: number) {
  codonCount.textContent = `Codons: ${codons}`;
  instructionCount.textContent = `Instructions: ${instructions}`;
}

/**
 * Update theme button text and aria label
 */
export function updateThemeButton() {
  const icon = themeManager.getThemeIcon();
  const name = themeManager.getThemeDisplayName();
  themeToggleBtn.textContent = `${icon} ${name}`;
  themeToggleBtn.setAttribute(
    "aria-label",
    `Current theme: ${name}. Click to cycle to next theme.`,
  );
}
