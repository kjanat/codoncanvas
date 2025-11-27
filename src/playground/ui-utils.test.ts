/**
 * UI Utilities Test Suite
 *
 * Tests for common helper functions used for UI updates,
 * status management, and security utilities.
 */
import { describe, expect, test } from "bun:test";
import { escapeHtml } from "./escape-html";

describe("UI Utilities", () => {
  // escapeHtml (pure function - no DOM needed)
  describe("escapeHtml", () => {
    test("escapes ampersand (&) to &amp;", () => {
      expect(escapeHtml("foo & bar")).toBe("foo &amp; bar");
      expect(escapeHtml("&")).toBe("&amp;");
    });

    test("escapes less than (<) to &lt;", () => {
      expect(escapeHtml("<div>")).toBe("&lt;div&gt;");
      expect(escapeHtml("a < b")).toBe("a &lt; b");
    });

    test("escapes greater than (>) to &gt;", () => {
      expect(escapeHtml("a > b")).toBe("a &gt; b");
      expect(escapeHtml(">")).toBe("&gt;");
    });

    test('escapes double quote (") to &quot;', () => {
      expect(escapeHtml('"hello"')).toBe("&quot;hello&quot;");
      expect(escapeHtml('say "hi"')).toBe("say &quot;hi&quot;");
    });

    test("escapes single quote (') to &#039;", () => {
      expect(escapeHtml("it's")).toBe("it&#039;s");
      expect(escapeHtml("'quoted'")).toBe("&#039;quoted&#039;");
    });

    test("escapes multiple special characters in one string", () => {
      expect(escapeHtml("<script>alert('xss')</script>")).toBe(
        "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;",
      );
      expect(escapeHtml("a & b < c > d")).toBe("a &amp; b &lt; c &gt; d");
    });

    test("returns empty string for empty input", () => {
      expect(escapeHtml("")).toBe("");
    });

    test("returns unchanged string when no special characters", () => {
      expect(escapeHtml("hello world")).toBe("hello world");
      expect(escapeHtml("abc123")).toBe("abc123");
      expect(escapeHtml("ATG GGA TAA")).toBe("ATG GGA TAA");
    });

    test("handles strings with only special characters", () => {
      expect(escapeHtml("<>&\"'")).toBe("&lt;&gt;&amp;&quot;&#039;");
    });

    test("prevents XSS attack vectors", () => {
      // Script injection
      expect(escapeHtml("<script>alert(1)</script>")).toBe(
        "&lt;script&gt;alert(1)&lt;/script&gt;",
      );
      // Event handler injection
      expect(escapeHtml('<img onerror="alert(1)">')).toBe(
        "&lt;img onerror=&quot;alert(1)&quot;&gt;",
      );
      // URL injection
      expect(escapeHtml('javascript:alert("xss")')).toBe(
        "javascript:alert(&quot;xss&quot;)",
      );
    });

    test("handles numeric strings", () => {
      expect(escapeHtml("12345")).toBe("12345");
      expect(escapeHtml("1 < 2")).toBe("1 &lt; 2");
    });

    test("handles unicode characters", () => {
      expect(escapeHtml("こんにちは")).toBe("こんにちは");
      expect(escapeHtml("emoji 😀")).toBe("emoji 😀");
      expect(escapeHtml("math: α < β")).toBe("math: α &lt; β");
    });
  });
});
