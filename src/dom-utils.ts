/**
 * DOM Utilities
 * Safe element retrieval helpers to avoid non-null assertions
 */

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
