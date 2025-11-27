/**
 * DOM Utilities Test Suite
 *
 * Tests for type-safe DOM element access utilities.
 * Provides compile-time AND runtime type safety for DOM operations.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  getElement,
  getElementOrNull,
  querySelector,
  querySelectorAll,
} from "./dom";

describe("DOMUtils", () => {
  // Helper to create and add elements to DOM
  const createElement = <T extends HTMLElement>(
    tagName: string,
    id?: string,
    className?: string,
  ): T => {
    const element = document.createElement(tagName) as T;
    if (id) element.id = id;
    if (className) element.className = className;
    document.body.appendChild(element);
    return element;
  };

  // Clean up DOM after each test
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // =========================================================================
  // getElement
  // =========================================================================
  describe("getElement", () => {
    // HAPPY PATHS
    test("returns typed element when ID exists and matches expected type", () => {
      createElement("button", "testBtn");
      const result = getElement("testBtn", HTMLButtonElement);
      expect(result).toBeInstanceOf(HTMLButtonElement);
    });

    test("returns HTMLButtonElement for button element", () => {
      createElement("button", "btn");
      const result = getElement("btn", HTMLButtonElement);
      expect(result).toBeInstanceOf(HTMLButtonElement);
    });

    test("returns HTMLInputElement for input element", () => {
      createElement("input", "inp");
      const result = getElement("inp", HTMLInputElement);
      expect(result).toBeInstanceOf(HTMLInputElement);
    });

    test("returns HTMLSelectElement for select element", () => {
      createElement("select", "sel");
      const result = getElement("sel", HTMLSelectElement);
      expect(result).toBeInstanceOf(HTMLSelectElement);
    });

    test("returns HTMLDivElement for div element", () => {
      createElement("div", "div1");
      const result = getElement("div1", HTMLDivElement);
      expect(result).toBeInstanceOf(HTMLDivElement);
    });

    test("returns HTMLCanvasElement for canvas element", () => {
      createElement("canvas", "cnv");
      const result = getElement("cnv", HTMLCanvasElement);
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    test("returns HTMLTextAreaElement for textarea element", () => {
      createElement("textarea", "txt");
      const result = getElement("txt", HTMLTextAreaElement);
      expect(result).toBeInstanceOf(HTMLTextAreaElement);
    });

    // ERROR CASES
    test("throws Error with message 'DOM element #id not found' when ID doesn't exist", () => {
      expect(() => getElement("nonexistent", HTMLDivElement)).toThrow(
        "DOM element #nonexistent not found",
      );
    });

    test("throws Error with type mismatch message when element type is wrong", () => {
      createElement("div", "wrongType");
      expect(() => getElement("wrongType", HTMLButtonElement)).toThrow(
        /is HTMLDivElement, expected HTMLButtonElement/,
      );
    });

    test("error message includes actual type (element.constructor.name) and expected type", () => {
      createElement("span", "spanEl");
      try {
        getElement("spanEl", HTMLInputElement);
        expect(true).toBe(false); // Should not reach here
      } catch (e) {
        const error = e as Error;
        expect(error.message).toContain("HTMLSpanElement");
        expect(error.message).toContain("HTMLInputElement");
      }
    });

    // EDGE CASES
    test("handles ID with special characters", () => {
      // Create element with underscore and hyphen
      createElement("div", "test-id_123");
      const result = getElement("test-id_123", HTMLDivElement);
      expect(result).toBeInstanceOf(HTMLDivElement);
    });

    test("handles numeric ID", () => {
      createElement("div", "123");
      const result = getElement("123", HTMLDivElement);
      expect(result).toBeInstanceOf(HTMLDivElement);
    });

    test("is case-sensitive for element IDs", () => {
      createElement("div", "TestId");
      expect(() => getElement("testid", HTMLDivElement)).toThrow(
        "DOM element #testid not found",
      );
    });
  });

  // =========================================================================
  // getElementOrNull
  // =========================================================================
  describe("getElementOrNull", () => {
    // HAPPY PATHS
    test("returns typed element when ID exists and matches expected type", () => {
      createElement("button", "optBtn");
      const result = getElementOrNull("optBtn", HTMLButtonElement);
      expect(result).toBeInstanceOf(HTMLButtonElement);
    });

    test("returns HTMLButtonElement for button element", () => {
      createElement("button", "btn2");
      const result = getElementOrNull("btn2", HTMLButtonElement);
      expect(result).toBeInstanceOf(HTMLButtonElement);
    });

    test("returns HTMLInputElement for input element", () => {
      createElement("input", "inp2");
      const result = getElementOrNull("inp2", HTMLInputElement);
      expect(result).toBeInstanceOf(HTMLInputElement);
    });

    // NULL CASES
    test("returns null when element ID doesn't exist", () => {
      const result = getElementOrNull("nonexistent", HTMLDivElement);
      expect(result).toBeNull();
    });

    test("returns null when element exists but type doesn't match", () => {
      createElement("div", "wrongTypeNull");
      const result = getElementOrNull("wrongTypeNull", HTMLButtonElement);
      expect(result).toBeNull();
    });

    // USAGE PATTERN
    test("allows conditional element access without try/catch", () => {
      // Element doesn't exist - should not throw
      const missing = getElementOrNull("missing", HTMLDivElement);
      expect(missing).toBeNull();

      // Element exists - should return it
      createElement("div", "exists");
      const found = getElementOrNull("exists", HTMLDivElement);
      expect(found).not.toBeNull();
    });

    test("TypeScript infers correct type after null check", () => {
      createElement("input", "typeCheck");
      const result = getElementOrNull("typeCheck", HTMLInputElement);
      if (result) {
        // TypeScript should recognize result as HTMLInputElement here
        expect(typeof result.value).toBe("string");
      }
    });
  });

  // =========================================================================
  // querySelector
  // =========================================================================
  describe("querySelector", () => {
    // HAPPY PATHS
    test("returns typed element for class selector", () => {
      createElement("div", undefined, "status-bar");
      const result = querySelector(".status-bar", HTMLDivElement);
      expect(result).toBeInstanceOf(HTMLDivElement);
    });

    test("returns typed element for attribute selector", () => {
      const input = createElement<HTMLInputElement>("input");
      input.setAttribute("type", "text");
      input.setAttribute("name", "username");
      const result = querySelector('[name="username"]', HTMLInputElement);
      expect(result).toBeInstanceOf(HTMLInputElement);
    });

    test("returns typed element for complex selector", () => {
      const container = createElement("div", undefined, "container");
      const child = document.createElement("span");
      child.className = "child";
      container.appendChild(child);
      const result = querySelector(".container .child", HTMLSpanElement);
      expect(result).toBeInstanceOf(HTMLSpanElement);
    });

    test("returns first matching element when multiple exist", () => {
      const first = createElement("div", undefined, "multi");
      first.textContent = "first";
      const second = createElement("div", undefined, "multi");
      second.textContent = "second";
      const result = querySelector(".multi", HTMLDivElement);
      expect(result.textContent).toBe("first");
    });

    // ERROR CASES
    test("throws Error with message including selector when no match found", () => {
      expect(() => querySelector(".nonexistent", HTMLDivElement)).toThrow(
        /DOM element matching "\.nonexistent" not found/,
      );
    });

    test("throws Error with type mismatch message when element type is wrong", () => {
      createElement("div", undefined, "wrongSelector");
      expect(() =>
        querySelector(".wrongSelector", HTMLButtonElement),
      ).toThrow(/is HTMLDivElement, expected HTMLButtonElement/);
    });

    test("error message includes actual and expected types", () => {
      createElement("span", undefined, "typeError");
      try {
        querySelector(".typeError", HTMLInputElement);
        expect(true).toBe(false);
      } catch (e) {
        const error = e as Error;
        expect(error.message).toContain("HTMLSpanElement");
        expect(error.message).toContain("HTMLInputElement");
      }
    });

    // SELECTOR TYPES
    test("handles ID selector (#id)", () => {
      createElement("div", "idSelector");
      const result = querySelector("#idSelector", HTMLDivElement);
      expect(result).toBeInstanceOf(HTMLDivElement);
    });

    test("handles class selector (.class)", () => {
      createElement("div", undefined, "classSelector");
      const result = querySelector(".classSelector", HTMLDivElement);
      expect(result).toBeInstanceOf(HTMLDivElement);
    });

    test("handles attribute selector ([attr=value])", () => {
      const el = createElement<HTMLInputElement>("input");
      el.setAttribute("data-testid", "test123");
      const result = querySelector('[data-testid="test123"]', HTMLInputElement);
      expect(result).toBeInstanceOf(HTMLInputElement);
    });

    test("handles descendant selector (parent child)", () => {
      const parent = createElement("div", "parent");
      const child = document.createElement("span");
      parent.appendChild(child);
      const result = querySelector("#parent span", HTMLSpanElement);
      expect(result).toBeInstanceOf(HTMLSpanElement);
    });

    test("handles pseudo-class selector (:first-child)", () => {
      const container = createElement("ul");
      const li1 = document.createElement("li");
      const li2 = document.createElement("li");
      container.appendChild(li1);
      container.appendChild(li2);
      const result = querySelector("li:first-child", HTMLLIElement);
      expect(result).toBe(li1);
    });
  });

  // =========================================================================
  // querySelectorAll
  // =========================================================================
  describe("querySelectorAll", () => {
    // HAPPY PATHS
    test("returns array of typed elements matching selector", () => {
      createElement("div", undefined, "items");
      createElement("div", undefined, "items");
      const result = querySelectorAll(".items", HTMLDivElement);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0]).toBeInstanceOf(HTMLDivElement);
    });

    test("returns empty array when no elements match", () => {
      const result = querySelectorAll(".nonexistent", HTMLDivElement);
      expect(result).toEqual([]);
    });

    test("filters out elements that don't match expected type (type-safe filtering)", () => {
      createElement("div", undefined, "mixed");
      createElement("span", undefined, "mixed");
      // Only divs should be returned when requesting HTMLDivElement
      const result = querySelectorAll(".mixed", HTMLDivElement);
      expect(result.length).toBe(1);
      expect(result[0]).toBeInstanceOf(HTMLDivElement);
    });

    // MULTIPLE ELEMENTS
    test("returns all matching elements of correct type", () => {
      for (let i = 0; i < 5; i++) {
        createElement("button", undefined, "buttons");
      }
      const result = querySelectorAll(".buttons", HTMLButtonElement);
      expect(result.length).toBe(5);
    });

    test("preserves DOM order in returned array", () => {
      const el1 = createElement("div", "first", "ordered");
      const el2 = createElement("div", "second", "ordered");
      const el3 = createElement("div", "third", "ordered");
      const result = querySelectorAll(".ordered", HTMLDivElement);
      expect(result[0].id).toBe("first");
      expect(result[1].id).toBe("second");
      expect(result[2].id).toBe("third");
    });

    // TYPE FILTERING
    test("includes only elements that are instanceof provided elementType", () => {
      createElement("input", undefined, "formEl");
      createElement("select", undefined, "formEl");
      createElement("button", undefined, "formEl");

      const inputs = querySelectorAll(".formEl", HTMLInputElement);
      expect(inputs.length).toBe(1);
      expect(inputs[0]).toBeInstanceOf(HTMLInputElement);

      const selects = querySelectorAll(".formEl", HTMLSelectElement);
      expect(selects.length).toBe(1);
      expect(selects[0]).toBeInstanceOf(HTMLSelectElement);
    });

    test("excludes elements that exist but are wrong type from results", () => {
      createElement("div", undefined, "container");
      createElement("div", undefined, "container");
      const result = querySelectorAll(".container", HTMLButtonElement);
      expect(result.length).toBe(0);
    });

    // EDGE CASES
    test("handles mixed element types (only returns matching type)", () => {
      createElement("div", undefined, "any");
      createElement("span", undefined, "any");
      createElement("p", undefined, "any");
      createElement("div", undefined, "any");

      const divs = querySelectorAll(".any", HTMLDivElement);
      expect(divs.length).toBe(2);
    });
  });

  // =========================================================================
  // Type Safety Tests
  // =========================================================================
  describe("type safety", () => {
    test("works with HTMLFormElement", () => {
      createElement("form", "testForm");
      const result = getElement("testForm", HTMLFormElement);
      expect(result).toBeInstanceOf(HTMLFormElement);
    });

    test("works with HTMLImageElement", () => {
      createElement("img", "testImg");
      const result = getElement("testImg", HTMLImageElement);
      expect(result).toBeInstanceOf(HTMLImageElement);
    });

    test("works with HTMLAnchorElement", () => {
      createElement("a", "testLink");
      const result = getElement("testLink", HTMLAnchorElement);
      expect(result).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  // =========================================================================
  // Integration Tests
  // =========================================================================
  describe("integration", () => {
    test("catches runtime type mismatches that TypeScript cannot detect", () => {
      // This simulates a case where DOM has different element than expected
      createElement("div", "expected-button");
      expect(() => getElement("expected-button", HTMLButtonElement)).toThrow();
    });

    test("provides clear error messages for debugging DOM issues", () => {
      try {
        getElement("missing-element", HTMLDivElement);
      } catch (e) {
        const error = e as Error;
        expect(error.message).toContain("missing-element");
        expect(error.message).toContain("not found");
      }
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================
  describe("edge cases", () => {
    test("handles dynamically added elements", () => {
      // Element doesn't exist initially
      expect(() => getElement("dynamic", HTMLDivElement)).toThrow();

      // Add element dynamically
      createElement("div", "dynamic");

      // Now it should work
      const result = getElement("dynamic", HTMLDivElement);
      expect(result).toBeInstanceOf(HTMLDivElement);
    });
  });
});
