/**
 * Genome Handlers Test Suite
 *
 * Tests for genome file loading operations that handle
 * user-uploaded genome files and file selection dialogs.
 *
 * Note: Since these functions depend on DOM elements,
 * we test the pure logic patterns by reimplementing them.
 */
import { describe, expect, test } from "bun:test";
import type { GenomeFile } from "../genome-io";

// Helper function implementations for testing

// Token counting logic from handleFileLoad
function countTokens(genome: string): number {
  return genome.split(/\s+/).filter((t) => t.length === 3).length;
}

// Status info formatting from handleFileLoad
function formatLoadInfo(title: string, author?: string): string {
  return title + (author ? ` by ${author}` : "");
}

// Error message extraction
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

// File validation
function hasFile(files: FileList | null | undefined): boolean {
  return !!(files && files.length > 0);
}

// Mock genome file creation using the authoritative GenomeFile interface
function createGenomeFile(
  genome: string,
  title: string,
  author?: string,
): GenomeFile {
  return { version: "1.0", genome, title, author };
}

describe("Genome Handlers", () => {
  // Token counting
  describe("token counting", () => {
    test("counts triplet tokens correctly", () => {
      expect(countTokens("ATG GGA TAA")).toBe(3);
    });

    test("counts tokens in genome with multiple spaces", () => {
      expect(countTokens("ATG  GGA   TAA")).toBe(3);
    });

    test("ignores non-triplet tokens", () => {
      expect(countTokens("ATG GG TAA")).toBe(2); // GG is only 2 chars
    });

    test("returns zero for empty genome", () => {
      expect(countTokens("")).toBe(0);
    });

    test("returns zero for whitespace-only genome", () => {
      expect(countTokens("   ")).toBe(0);
    });

    test("handles newlines in genome", () => {
      expect(countTokens("ATG\nGGA\nTAA")).toBe(3);
    });

    test("handles tabs in genome", () => {
      expect(countTokens("ATG\tGGA\tTAA")).toBe(3);
    });

    test("counts long genome correctly", () => {
      const genome = "ATG " + "GGA ".repeat(100) + "TAA";
      expect(countTokens(genome)).toBe(102);
    });
  });

  // Load info formatting
  describe("load info formatting", () => {
    test("formats title only when no author", () => {
      expect(formatLoadInfo("My Genome")).toBe("My Genome");
    });

    test("formats title with author", () => {
      expect(formatLoadInfo("My Genome", "John")).toBe("My Genome by John");
    });

    test("handles empty author string as no author", () => {
      expect(formatLoadInfo("My Genome", "")).toBe("My Genome");
    });

    test("handles undefined author", () => {
      expect(formatLoadInfo("My Genome", undefined)).toBe("My Genome");
    });

    test("handles special characters in title", () => {
      expect(formatLoadInfo("Genome (v2.0)")).toBe("Genome (v2.0)");
    });

    test("handles special characters in author", () => {
      expect(formatLoadInfo("Genome", "O'Brien")).toBe("Genome by O'Brien");
    });
  });

  // File validation
  describe("file validation", () => {
    test("returns false for null files", () => {
      expect(hasFile(null)).toBe(false);
    });

    test("returns false for undefined files", () => {
      expect(hasFile(undefined)).toBe(false);
    });

    test("returns false for empty FileList", () => {
      // Simulate empty FileList
      const emptyList = { length: 0 } as FileList;
      expect(hasFile(emptyList)).toBe(false);
    });

    test("returns true for FileList with file", () => {
      // Simulate FileList with one file
      const fileList = { length: 1, 0: {} } as unknown as FileList;
      expect(hasFile(fileList)).toBe(true);
    });
  });

  // GenomeFile structure
  describe("GenomeFile structure", () => {
    test("creates genome file with required fields", () => {
      const file = createGenomeFile("ATG GGA TAA", "Test Genome");
      expect(file.genome).toBe("ATG GGA TAA");
      expect(file.title).toBe("Test Genome");
    });

    test("creates genome file with author", () => {
      const file = createGenomeFile("ATG GGA TAA", "Test Genome", "John");
      expect(file.author).toBe("John");
    });

    test("author is undefined when not provided", () => {
      const file = createGenomeFile("ATG GGA TAA", "Test Genome");
      expect(file.author).toBeUndefined();
    });
  });

  // Error handling
  describe("error handling", () => {
    test("extracts message from Error instance", () => {
      const error = new Error("File read failed");
      expect(extractErrorMessage(error)).toBe("File read failed");
    });

    test("returns generic message for non-Error", () => {
      expect(extractErrorMessage("string error")).toBe("Unknown error");
      expect(extractErrorMessage(null)).toBe("Unknown error");
    });

    test("formats error status message", () => {
      const error = new Error("Invalid format");
      const message = `Failed to load genome: ${extractErrorMessage(error)}`;
      expect(message).toBe("Failed to load genome: Invalid format");
    });

    test("formats generic error status message", () => {
      const error = "not an Error";
      const message =
        error instanceof Error
          ? `Failed to load genome: ${error.message}`
          : "Failed to load genome";
      expect(message).toBe("Failed to load genome");
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles genome with comments", () => {
      // Comments typically start with ; and are filtered out
      const genome = "; comment\nATG GGA TAA";
      // Token count should include triplets from all lines
      expect(countTokens(genome)).toBe(3);
    });

    test("handles genome with mixed case", () => {
      expect(countTokens("atg gga taa")).toBe(3);
      expect(countTokens("ATG gga TAA")).toBe(3);
    });

    test("handles very long title", () => {
      const longTitle = "A".repeat(1000);
      expect(formatLoadInfo(longTitle)).toBe(longTitle);
    });

    test("handles unicode in genome", () => {
      // Unicode characters that happen to be 3 chars
      expect(countTokens("αβγ")).toBe(1);
    });

    test("handles empty title", () => {
      expect(formatLoadInfo("")).toBe("");
      expect(formatLoadInfo("", "Author")).toBe(" by Author");
    });
  });

  // Integration patterns
  describe("integration patterns", () => {
    test("full load workflow: validate -> parse -> display info", () => {
      // Simulate loading a genome file
      const genomeFile = createGenomeFile(
        "ATG GGA TAA",
        "Test Genome",
        "Tester",
      );

      // Count tokens
      const tokenCount = countTokens(genomeFile.genome);
      expect(tokenCount).toBe(3);

      // Format info
      const info = formatLoadInfo(genomeFile.title, genomeFile.author);
      expect(info).toBe("Test Genome by Tester");

      // Status message
      const status = `Loaded: ${info}`;
      expect(status).toBe("Loaded: Test Genome by Tester");
    });

    test("error workflow: catch -> format -> display", () => {
      const error = new Error("File corrupt");

      const message =
        error instanceof Error
          ? `Failed to load genome: ${error.message}`
          : "Failed to load genome";

      expect(message).toBe("Failed to load genome: File corrupt");
    });
  });
});
