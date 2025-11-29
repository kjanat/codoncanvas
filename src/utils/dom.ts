/**
 * @fileoverview Type-safe DOM utilities with XSS protection
 *
 * Provides compile-time AND runtime type safety for DOM element access,
 * replacing unsafe `as HTMLElement` casts with validated accessors.
 *
 * **Security:** All user-facing strings MUST use {@link escapeHtml} to prevent XSS.
 *
 * **Type-Safe Accessors (recommended):**
 * - {@link getElement} - Throws if element missing or wrong type
 * - {@link getElementOrNull} - Returns null if missing/wrong type
 * - {@link querySelector} - Type-safe querySelector with validation
 * - {@link querySelectorAll} - Type-safe querySelectorAll with filtering
 *
 * **Legacy API (deprecated):**
 * - `*Unsafe()` variants for backward compatibility (no runtime type validation)
 *
 * @module utils/dom
 */

// =============================================================================
// Security Utilities
// =============================================================================

/**
 * Escape HTML special characters to prevent XSS attacks.
 *
 * Use this when building HTML strings from any user-provided or external input.
 * Escapes: & < > " ' /
 *
 * @param str - Untrusted string to escape
 * @returns Safe string with HTML entities escaped
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script>';
 * element.innerHTML = escapeHtml(userInput);
 * // Renders as text, not executed
 * ```
 *
 * @security Always use this for user input in innerHTML contexts
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

// =============================================================================
// UI Helpers
// =============================================================================

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

// =============================================================================
// Type-safe Element Accessors (with runtime validation)
// =============================================================================

/**
 * Type-safe element getter by ID with runtime validation.
 *
 * @param id - Element ID (without # prefix)
 * @param elementType - Constructor for expected element type (e.g., HTMLButtonElement)
 * @returns Typed element instance, guaranteed to match elementType
 * @throws {Error} If element with given ID not found in document
 * @throws {Error} If element exists but is not an instance of elementType
 *
 * @example
 * ```typescript
 * const btn = getElement("runBtn", HTMLButtonElement);
 * btn.disabled = true; // TypeScript knows btn is HTMLButtonElement
 *
 * const canvas = getElement("mainCanvas", HTMLCanvasElement);
 * const ctx = canvas.getContext("2d"); // Works, canvas is HTMLCanvasElement
 * ```
 */
export function getElement<T extends HTMLElement>(
  id: string,
  elementType: new () => T,
): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`DOM element #${id} not found`);
  }
  if (!(element instanceof elementType)) {
    throw new Error(
      `DOM element #${id} is ${element.constructor.name}, expected ${elementType.name}`,
    );
  }
  return element;
}

/**
 * Type-safe element getter that returns null instead of throwing.
 *
 * Use this for optional elements that may not exist in all page states.
 *
 * @param id - Element ID (without # prefix)
 * @param elementType - Constructor for expected element type
 * @returns Typed element instance, or null if not found or wrong type
 *
 * @example
 * ```typescript
 * const btn = getElementOrNull("optionalBtn", HTMLButtonElement);
 * if (btn) {
 *   btn.addEventListener("click", handler);
 * }
 *
 * // Or with optional chaining
 * getElementOrNull("tooltip", HTMLDivElement)?.classList.add("visible");
 * ```
 */
export function getElementOrNull<T extends HTMLElement>(
  id: string,
  elementType: new () => T,
): T | null {
  const element = document.getElementById(id);
  if (!element || !(element instanceof elementType)) {
    return null;
  }
  return element;
}

/**
 * Type-safe querySelector with runtime validation.
 *
 * @param selector - CSS selector (any valid CSS selector string)
 * @param elementType - Constructor for expected element type
 * @returns Typed element instance, guaranteed to match elementType
 * @throws {Error} If no element matches the selector
 * @throws {Error} If matched element is not an instance of elementType
 *
 * @example
 * ```typescript
 * const bar = querySelector(".status-bar", HTMLDivElement);
 * bar.textContent = "Ready";
 *
 * const input = querySelector('input[name="genome"]', HTMLTextAreaElement);
 * const code = input.value;
 * ```
 */
export function querySelector<T extends HTMLElement>(
  selector: string,
  elementType: new () => T,
): T {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`DOM element matching "${selector}" not found`);
  }
  if (!(element instanceof elementType)) {
    throw new Error(
      `DOM element "${selector}" is ${element.constructor.name}, expected ${elementType.name}`,
    );
  }
  return element;
}

/**
 * Type-safe querySelectorAll with runtime validation.
 *
 * Returns only elements matching both the selector AND the expected type.
 * Non-matching element types are silently filtered out.
 *
 * @param selector - CSS selector (any valid CSS selector string)
 * @param elementType - Constructor for expected element type
 * @returns Array of typed element instances (may be empty if none match)
 *
 * @example
 * ```typescript
 * const inputs = querySelectorAll('input[name="mode"]', HTMLInputElement);
 * inputs.forEach(input => input.disabled = false);
 *
 * const buttons = querySelectorAll(".toolbar button", HTMLButtonElement);
 * buttons.forEach(btn => btn.addEventListener("click", handler));
 * ```
 */
export function querySelectorAll<T extends HTMLElement>(
  selector: string,
  elementType: new () => T,
): T[] {
  const elements = document.querySelectorAll(selector);
  const result: T[] = [];
  elements.forEach((el) => {
    if (el instanceof elementType) {
      result.push(el);
    }
  });
  return result;
}

// =============================================================================
// Legacy API (simple type casts, no runtime validation)
// Use these for backward compatibility with existing code
// =============================================================================

/**
 * Get element by ID with simple type cast (no runtime validation)
 * @deprecated Prefer getElement() with elementType for runtime safety
 */
export function getElementUnsafe<T extends HTMLElement = HTMLElement>(
  id: string,
): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element as T;
}

/**
 * Get element by ID, returning null if not found (no runtime validation)
 * @deprecated Prefer getElementOrNull() with elementType for runtime safety
 */
export function getElementOrNullUnsafe<T extends HTMLElement = HTMLElement>(
  id: string,
): T | null {
  return document.getElementById(id) as T | null;
}

/**
 * Query selector with simple type cast (no runtime validation)
 * @deprecated Prefer querySelector() with elementType for runtime safety
 */
export function querySelectorUnsafe<T extends Element = Element>(
  selector: string,
  parent: ParentNode = document,
): T {
  const element = parent.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Element matching "${selector}" not found`);
  }
  return element;
}
