/**
 * Security Test Suite: XSS Prevention
 *
 * Validates that CodonCanvas properly sanitizes input and prevents:
 * - Script injection attacks
 * - HTML tag injection
 * - Malicious character sequences
 * - Frame manipulation attempts
 */

import { beforeEach, describe, expect, test } from "bun:test";
import { CodonLexer } from "@/core/lexer";

describe("Security: XSS Prevention", () => {
  let lexer: CodonLexer;

  beforeEach(() => {
    lexer = new CodonLexer();
  });

  describe("Script Injection Protection", () => {
    test("rejects script tags in genome", () => {
      const malicious = "<script>alert('XSS')</script>";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });

    test("rejects inline script handlers", () => {
      const malicious = "ATG <img src=x onerror=alert('XSS')> AAA";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });

    test("rejects javascript: protocol", () => {
      const malicious = "ATG javascript:alert('XSS') AAA";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });
  });

  describe("HTML Tag Injection Protection", () => {
    test("rejects img tags in genome", () => {
      const malicious = "ATG <img src=x> AAA";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });

    test("rejects iframe tags", () => {
      const malicious = "<iframe src=evil.com></iframe> ATG AAA";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });

    test("rejects style tags", () => {
      const malicious = "ATG <style>body{display:none}</style> AAA";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });

    test("rejects anchor tags with href", () => {
      const malicious = "ATG <a href=javascript:alert()>click</a> AAA";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });
  });

  describe("Character Whitelist Validation", () => {
    test("allows valid DNA nucleotides only", () => {
      const valid = "ATG AAA GGG TTT CCC TAA";
      const result = lexer.tokenize(valid);
      expect(result.length).toBeGreaterThan(0);
    });

    test("rejects invalid characters", () => {
      const invalid = "ATG XXX GGG";
      expect(() => lexer.tokenize(invalid)).toThrow();
    });

    test("rejects SQL injection attempts", () => {
      const malicious = "ATG'; DROP TABLE students; --";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });

    test("rejects NULL bytes", () => {
      const malicious = "ATG\x00AAA";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });

    test("rejects control characters", () => {
      const malicious = "ATG\x01\x02\x03AAA";
      expect(() => lexer.tokenize(malicious)).toThrow();
    });
  });

  describe("Frame Validation", () => {
    test("detects frameshift errors", () => {
      const frameshifted = "ATG AA GGG"; // AA is only 2 bases
      const errors = lexer.validateFrame(frameshifted);
      expect(errors.length).toBeGreaterThan(0);
    });

    test("validates proper codon triplets", () => {
      const valid = "ATG AAA GGG TAA";
      const _tokens = lexer.tokenize(valid);
      const errors = lexer.validateFrame(valid);
      expect(errors.length).toBe(0);
    });

    test("rejects malformed stop codons", () => {
      const invalid = "ATG AAA TA"; // Incomplete stop codon
      // This will throw during tokenize due to frameshift
      expect(() => lexer.tokenize(invalid)).toThrow();
    });
  });

  describe("Structure Validation", () => {
    test("requires start codon", () => {
      const noStart = "AAA GGG TAA"; // Missing ATG
      const tokens = lexer.tokenize(noStart);
      const errors = lexer.validateStructure(tokens);
      expect(errors.some((e) => e.message.includes("START"))).toBe(true);
    });

    test("requires stop codon", () => {
      const noStop = "ATG AAA GGG"; // Missing TAA/TAG/TGA
      const tokens = lexer.tokenize(noStop);
      const errors = lexer.validateStructure(tokens);
      expect(errors.some((e) => e.message.includes("STOP"))).toBe(true);
    });

    test("validates complete genome structure", () => {
      const valid = "ATG AAA GGG TAA";
      const tokens = lexer.tokenize(valid);
      const errors = lexer.validateStructure(tokens);
      expect(errors.length).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    test("handles empty string safely", () => {
      const empty = "";
      const tokens = lexer.tokenize(empty);
      // Empty input produces empty token array (no throw)
      expect(tokens.length).toBe(0);
    });

    test("handles whitespace-only input", () => {
      const whitespace = "   \t\n  ";
      const tokens = lexer.tokenize(whitespace);
      // Whitespace is ignored, produces empty token array
      expect(tokens.length).toBe(0);
    });

    test("handles extremely long input", () => {
      const veryLong = `ATG ${"AAA ".repeat(10000)}TAA`;
      const result = lexer.tokenize(veryLong);
      expect(result.length).toBeGreaterThan(0);
    });

    test("handles unicode characters safely", () => {
      const unicode = "ATG 💀👻🎃 AAA";
      expect(() => lexer.tokenize(unicode)).toThrow();
    });

    test("handles repeated special characters", () => {
      const repeated = "<<<>>><<<>>>";
      expect(() => lexer.tokenize(repeated)).toThrow();
    });
  });

  describe("Encoding Attacks", () => {
    test("rejects URL-encoded malicious input", () => {
      const encoded = "ATG%20%3Cscript%3Ealert('XSS')%3C%2Fscript%3E";
      expect(() => lexer.tokenize(encoded)).toThrow();
    });

    test("rejects hex-encoded malicious input", () => {
      const hexEncoded = "ATG\\x3cscript\\x3e";
      expect(() => lexer.tokenize(hexEncoded)).toThrow();
    });

    test("rejects HTML entity-encoded malicious input", () => {
      const entityEncoded = "ATG &lt;script&gt;alert('XSS')&lt;/script&gt;";
      expect(() => lexer.tokenize(entityEncoded)).toThrow();
    });
  });
});
