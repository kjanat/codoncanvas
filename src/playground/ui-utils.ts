/**
 * UI Utilities Module
 * Common helper functions for UI updates and status management
 */

import {
  codonCount,
  instructionCount,
  statusBar,
  statusMessage,
  themeToggleBtn,
} from "@/playground/dom-manager";
import { themeManager } from "@/playground/ui-state";

// Re-export escapeHtml from DOM-free module for backwards compatibility
export { escapeHtml } from "@/playground/escape-html";

/**
 * Set status message and bar styling
 */
export function setStatus(message: string, type: "info" | "error" | "success") {
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
