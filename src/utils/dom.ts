/**
 * Type-safe DOM utilities
 *
 * Provides compile-time AND runtime type safety for DOM element access,
 * replacing unsafe `as HTMLElement` assertions with validated accessors.
 */

/**
 * Type-safe element getter by ID with runtime validation
 *
 * @param id - Element ID (without #)
 * @param elementType - Constructor for expected element type
 * @returns Typed element instance
 * @throws Error if element not found or wrong type
 *
 * @example
 * ```ts
 * const btn = getElement("runBtn", HTMLButtonElement);
 * // btn is HTMLButtonElement, guaranteed
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
 * Type-safe element getter that returns null instead of throwing
 *
 * @param id - Element ID (without #)
 * @param elementType - Constructor for expected element type
 * @returns Typed element instance or null
 *
 * @example
 * ```ts
 * const btn = getElementOrNull("optionalBtn", HTMLButtonElement);
 * if (btn) btn.addEventListener("click", handler);
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
 * Type-safe querySelector with runtime validation
 *
 * @param selector - CSS selector
 * @param elementType - Constructor for expected element type
 * @returns Typed element instance
 * @throws Error if element not found or wrong type
 *
 * @example
 * ```ts
 * const bar = querySelector(".status-bar", HTMLDivElement);
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
 * Type-safe querySelectorAll with runtime validation
 *
 * @param selector - CSS selector
 * @param elementType - Constructor for expected element type
 * @returns Array of typed element instances (filters out non-matching)
 *
 * @example
 * ```ts
 * const inputs = querySelectorAll('input[name="mode"]', HTMLInputElement);
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
