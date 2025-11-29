/**
 * @fileoverview UI Utilities Module (LEGACY)
 *
 * @deprecated This module is legacy code for vanilla JS HTML pages.
 * For React components, use:
 * - Status: Local component state in Playground.tsx
 * - Stats: Props to PlaygroundEditor component
 * - Theme: usePreferences hook + Layout.tsx
 *
 * This file will be removed once all legacy HTML demo pages
 * are migrated to React components.
 *
 * @see src/components/Playground.tsx - React replacement
 * @see src/components/PlaygroundEditor.tsx - Stats display
 * @see src/hooks/usePreferences.ts - Theme management
 */

import {
  codonCount,
  instructionCount,
  statusBar,
  statusMessage,
  themeToggleBtn,
} from "@/playground/dom-manager";
import { themeManager } from "@/playground/ui-state";

/**
 * Set status message and bar styling
 * @deprecated Use React component state instead
 */
export function setStatus(message: string, type: "info" | "error" | "success") {
  statusMessage.textContent = message;
  statusBar.className = `status-bar ${type}`;
}

/**
 * Update codon and instruction count displays
 * @deprecated Use React props to PlaygroundEditor instead
 */
export function updateStats(codons: number, instructions: number) {
  codonCount.textContent = `Codons: ${codons}`;
  instructionCount.textContent = `Instructions: ${instructions}`;
}

/**
 * Update theme button text and aria label
 * @deprecated Use usePreferences hook + Layout.tsx instead
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
