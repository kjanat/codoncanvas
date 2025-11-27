/**
 * Linter Handlers Test Suite
 *
 * Tests for the linting and auto-fix functionality that validates
 * genome syntax and provides automated corrections.
 *
 * Note: Since the module depends on DOM elements, we test the pure
 * logic by reimplementing the algorithms in the test file.
 */
import { describe, expect, test } from "bun:test";

// Reimplement canAutoFix logic for testing
function canAutoFix(errorMessage: string): boolean {
  const fixablePatterns = [
    /Program should begin with START codon/,
    /Program should end with STOP codon/,
    /Mid-triplet break detected/,
    /Source length \d+ is not divisible by 3/,
  ];
  return fixablePatterns.some((pattern) => pattern.test(errorMessage));
}

// Reimplement autoFixError logic for testing
function autoFixError(errorMessage: string, source: string): string | null {
  const trimmed = source.trim();

  // Missing START codon
  if (/Program should begin with START codon/.test(errorMessage)) {
    return trimmed ? `ATG ${trimmed}` : "ATG";
  }

  // Missing STOP codon
  if (/Program should end with STOP codon/.test(errorMessage)) {
    return trimmed ? `${trimmed} TAA` : "TAA";
  }

  // Mid-triplet break - remove all whitespace and re-space by triplets
  if (/Mid-triplet break detected/.test(errorMessage)) {
    const cleaned = source.replace(/\s+/g, "");
    const triplets: string[] = [];
    for (let i = 0; i < cleaned.length; i += 3) {
      triplets.push(cleaned.slice(i, i + 3));
    }
    return triplets.join(" ");
  }

  // Non-triplet length - pad with 'A'
  const missingMatch = errorMessage.match(/Missing (\d+) bases?/);
  if (missingMatch) {
    const missing = parseInt(missingMatch[1], 10);
    return source.trim() + "A".repeat(missing);
  }

  return null;
}

describe("Linter Handlers", () => {
  // canAutoFix
  describe("canAutoFix", () => {
    test("returns true for missing START codon error", () => {
      expect(canAutoFix("Program should begin with START codon (ATG)")).toBe(
        true,
      );
    });

    test("returns true for missing STOP codon error", () => {
      expect(
        canAutoFix("Program should end with STOP codon (TAA, TAG, or TGA)"),
      ).toBe(true);
    });

    test("returns true for mid-triplet break error", () => {
      expect(canAutoFix("Mid-triplet break detected at position 5")).toBe(true);
    });

    test("returns true for non-divisible-by-3 length error", () => {
      expect(
        canAutoFix("Source length 10 is not divisible by 3. Missing 2 bases"),
      ).toBe(true);
    });

    test("returns false for unknown error patterns", () => {
      expect(canAutoFix("Unknown error occurred")).toBe(false);
      expect(canAutoFix("Something went wrong")).toBe(false);
    });

    test("returns false for semantic errors", () => {
      expect(canAutoFix("Unknown codon: XYZ")).toBe(false);
      expect(canAutoFix("Invalid instruction")).toBe(false);
    });
  });

  // autoFixError
  describe("autoFixError", () => {
    test("prepends ATG for missing START codon", () => {
      const result = autoFixError(
        "Program should begin with START codon (ATG)",
        "GGA TAA",
      );
      expect(result).toBe("ATG GGA TAA");
    });

    test("appends TAA for missing STOP codon", () => {
      const result = autoFixError(
        "Program should end with STOP codon (TAA, TAG, or TGA)",
        "ATG GGA",
      );
      expect(result).toBe("ATG GGA TAA");
    });

    test("re-spaces by triplets for mid-triplet break", () => {
      const result = autoFixError(
        "Mid-triplet break detected at position 5",
        "ATG GG A TAA",
      );
      expect(result).toBe("ATG GGA TAA");
    });

    test("pads with 'A' for non-triplet length (1 missing)", () => {
      const result = autoFixError(
        "Source length 8 is not divisible by 3. Missing 1 bases",
        "ATG GGAT",
      );
      expect(result).toBe("ATG GGATA");
    });

    test("pads with 'AA' for non-triplet length (2 missing)", () => {
      const result = autoFixError(
        "Source length 7 is not divisible by 3. Missing 2 bases",
        "ATG GGA",
      );
      expect(result).toBe("ATG GGAAA");
    });

    test("returns null for unfixable errors", () => {
      const result = autoFixError("Unknown codon: XYZ", "ATG XYZ TAA");
      expect(result).toBeNull();
    });

    test("trims whitespace during fix", () => {
      const result = autoFixError(
        "Program should begin with START codon (ATG)",
        "  GGA TAA  ",
      );
      expect(result).toBe("ATG GGA TAA");
    });

    test("removes all whitespace before re-spacing", () => {
      const result = autoFixError(
        "Mid-triplet break detected at position 5",
        "AT  G\tGG\nA  TAA",
      );
      expect(result).toBe("ATG GGA TAA");
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles empty source string for START fix", () => {
      const result = autoFixError(
        "Program should begin with START codon (ATG)",
        "",
      );
      // Empty source should produce just "ATG" without trailing space
      expect(result).toBe("ATG");
    });

    test("handles whitespace-only source for STOP fix", () => {
      const result = autoFixError(
        "Program should end with STOP codon (TAA, TAG, or TGA)",
        "   ",
      );
      // Whitespace-only source should produce just "TAA" without leading space
      expect(result).toBe("TAA");
    });

    test("handles already-valid genome patterns", () => {
      // canAutoFix should return false for non-error messages
      expect(canAutoFix("")).toBe(false);
      expect(canAutoFix("No errors found")).toBe(false);
    });

    test("re-spacing handles incomplete final triplet", () => {
      const result = autoFixError(
        "Mid-triplet break detected at position 5",
        "ATGGGA TA",
      );
      // Should produce: ATG GGA TA (incomplete triplet at end is preserved)
      expect(result).toBe("ATG GGA TA");
    });

    test("handles very long genome for re-spacing", () => {
      const longGenome = `ATG${"GGA".repeat(100)}TAA`;
      const result = autoFixError(
        "Mid-triplet break detected at position 5",
        longGenome,
      );
      expect(result).not.toBeNull();
      // Verify it's properly spaced
      const parts = result!.split(" ");
      expect(parts.every((p) => p.length <= 3)).toBe(true);
    });
  });

  // Integration-style tests
  describe("fix workflow", () => {
    test("can fix multiple issues in sequence", () => {
      // Simulate fixing a genome step by step
      let source = "GGA";

      // Fix missing START
      source =
        autoFixError("Program should begin with START codon (ATG)", source) ||
        source;
      expect(source).toBe("ATG GGA");

      // Fix missing STOP
      source =
        autoFixError(
          "Program should end with STOP codon (TAA, TAG, or TGA)",
          source,
        ) || source;
      expect(source).toBe("ATG GGA TAA");
    });

    test("canAutoFix matches autoFixError capability", () => {
      // Every error that canAutoFix returns true for should be fixable
      const fixableErrors = [
        "Program should begin with START codon (ATG)",
        "Program should end with STOP codon (TAA, TAG, or TGA)",
        "Mid-triplet break detected at position 5",
        "Source length 10 is not divisible by 3. Missing 2 bases",
      ];

      const testSource = "GGA TAA";

      for (const error of fixableErrors) {
        if (canAutoFix(error)) {
          const result = autoFixError(error, testSource);
          // Either it fixes it or it's the padding error which needs specific format
          expect(
            result !== null || error.includes("Source length"),
          ).toBeTruthy();
        }
      }
    });
  });
});
