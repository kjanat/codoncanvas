/**
 * DOM Utilities
 * Safe element retrieval helpers to avoid non-null assertions
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Get an element by ID, throwing a clear error if not found
 */
export function getElement<T extends HTMLElement = HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element as T;
}

/**
 * Get an element by ID, returning null if not found
 */
export function getElementOrNull<T extends HTMLElement = HTMLElement>(
  id: string,
): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Query selector with type safety, throwing if not found
 */
export function querySelector<T extends Element = Element>(
  selector: string,
  parent: ParentNode = document,
): T {
  const element = parent.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Element matching "${selector}" not found`);
  }
  return element;
}

/**
 * Show a temporary status message in a container element
 * @param container - The container element to show the status in
 * @param message - The message to display
 * @param type - The status type (info, success, error, warning)
 * @param duration - How long to show the message in milliseconds (default 5000)
 */
export function showStatus(
  container: HTMLElement,
  message: string,
  type: string = "info",
  duration: number = 5000,
): void {
  container.innerHTML = `<div class="status ${escapeHtml(type)}">${escapeHtml(message)}</div>`;
  setTimeout(() => {
    container.innerHTML = "";
  }, duration);
}
