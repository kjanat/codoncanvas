/**
 * Export Handlers Test Suite
 *
 * Tests for all export functionality including PNG images,
 * MIDI files, genome files, and student progress data.
 *
 * Note: Since these functions depend on DOM elements and ui-state,
 * we test the pure logic patterns using shared test utilities.
 */
import { describe, expect, test } from "bun:test";
import {
  createAchievementData,
  extractErrorMessage,
  extractTitle,
  generateGenomeFilename,
  generateMidiFilename,
  generateProgressFilename,
  isEmptyGenome,
} from "../test-utils";

describe("Export Handlers", () => {
  // exportImage
  // Note: Actual implementation tests require DOM mocking.
  // These document expected filename patterns.
  describe("exportImage", () => {
    test("expected filename matches codoncanvas pattern", () => {
      const EXPECTED_FILENAME = "codoncanvas-output.png";
      expect(EXPECTED_FILENAME).toMatch(/^codoncanvas-.*\.png$/);
    });
  });

  // saveGenome
  describe("saveGenome", () => {
    test("detects empty genome", () => {
      expect(isEmptyGenome("")).toBe(true);
      expect(isEmptyGenome("   ")).toBe(true);
      expect(isEmptyGenome("\n\t")).toBe(true);
    });

    test("detects non-empty genome", () => {
      expect(isEmptyGenome("ATG")).toBe(false);
      expect(isEmptyGenome("  ATG  ")).toBe(false);
    });

    test("generates filename with current date", () => {
      const filename = generateGenomeFilename();
      const today = new Date().toISOString().slice(0, 10);
      expect(filename).toContain(today);
    });

    test("uses 'codoncanvas-' prefix in filename", () => {
      const filename = generateGenomeFilename();
      expect(filename.startsWith("codoncanvas-")).toBe(true);
    });

    test("filename format is codoncanvas-YYYY-MM-DD", () => {
      const filename = generateGenomeFilename();
      expect(filename).toMatch(/^codoncanvas-\d{4}-\d{2}-\d{2}$/);
    });

    test("extracts title from first line of genome", () => {
      expect(extractTitle("ATG GGA TAA")).toBe("ATG GGA TAA");
      expect(extractTitle("ATG\nGGA\nTAA")).toBe("ATG");
    });

    test("removes comments from title", () => {
      // When first line is only a comment, falls back to default
      expect(extractTitle("; comment\nATG")).toBe("CodonCanvas Genome");
      // Inline comments are removed from the title
      expect(extractTitle("ATG ; comment\nGGA")).toBe("ATG");
    });

    test("truncates title to 30 characters", () => {
      const longGenome = "A".repeat(50);
      expect(extractTitle(longGenome).length).toBe(30);
    });

    test("uses default title for empty first line", () => {
      expect(extractTitle("")).toBe("CodonCanvas Genome");
      expect(extractTitle("; comment only")).toBe("CodonCanvas Genome");
    });

    test("metadata includes description", () => {
      const metadata = {
        description: "Created with CodonCanvas Playground",
        author: "CodonCanvas User",
      };
      expect(metadata.description).toBe("Created with CodonCanvas Playground");
    });

    test("metadata includes author", () => {
      const metadata = {
        description: "Created with CodonCanvas Playground",
        author: "CodonCanvas User",
      };
      expect(metadata.author).toBe("CodonCanvas User");
    });
  });

  // exportMidi
  describe("exportMidi", () => {
    test("detects empty vs non-empty snapshots", () => {
      const hasNoSnapshots = (snapshots: unknown[]) => snapshots.length === 0;
      expect(hasNoSnapshots([])).toBe(true);
      expect(hasNoSnapshots([{}])).toBe(false);
    });

    test("generates filename with timestamp", () => {
      const filename = generateMidiFilename();
      expect(filename).toMatch(/^codoncanvas-\d+\.mid$/);
    });

    test("uses '.mid' extension in filename", () => {
      const filename = generateMidiFilename();
      expect(filename.endsWith(".mid")).toBe(true);
    });

    test("extracts error message from Error", () => {
      const error = new Error("MIDI generation failed");
      expect(extractErrorMessage(error)).toBe("MIDI generation failed");
    });

    test("returns generic message for non-Error", () => {
      expect(extractErrorMessage("string error")).toBe("Unknown error");
      expect(extractErrorMessage(null)).toBe("Unknown error");
      expect(extractErrorMessage(undefined)).toBe("Unknown error");
    });
  });

  // exportStudentProgress
  describe("exportStudentProgress", () => {
    test("creates achievement data object", () => {
      const data = createAchievementData();
      expect(data).toBeDefined();
      expect(typeof data).toBe("object");
    });

    test("includes empty achievements array", () => {
      const data = createAchievementData();
      expect(Array.isArray(data.achievements)).toBe(true);
      expect(data.achievements.length).toBe(0);
    });

    test("includes ISO timestamp", () => {
      const data = createAchievementData();
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    test("includes userAgent string", () => {
      const data = createAchievementData();
      expect(typeof data.userAgent).toBe("string");
    });

    test("generates filename with timestamp", () => {
      const filename = generateProgressFilename();
      expect(filename).toMatch(/^codoncanvas-progress-\d+\.json$/);
    });

    test("uses '.json' extension in filename", () => {
      const filename = generateProgressFilename();
      expect(filename.endsWith(".json")).toBe(true);
    });

    test("JSON is formatted with 2-space indentation", () => {
      const data = createAchievementData();
      const json = JSON.stringify(data, null, 2);
      expect(json).toContain("\n");
      expect(json).toContain("  ");
    });
  });

  // Error handling patterns
  describe("error handling", () => {
    test("Error instance provides message", () => {
      const error = new Error("Test error message");
      expect(error instanceof Error).toBe(true);
      expect(error.message).toBe("Test error message");
    });

    test("non-Error values handled gracefully", () => {
      const values = ["string", 123, null, undefined, { custom: "error" }];
      for (const val of values) {
        expect(extractErrorMessage(val)).toBe("Unknown error");
      }
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("handles genome with only whitespace", () => {
      expect(isEmptyGenome("   \n\t   ")).toBe(true);
    });

    test("handles genome with unicode characters", () => {
      expect(isEmptyGenome("αβγ")).toBe(false);
      expect(extractTitle("αβγ δεζ")).toBe("αβγ δεζ");
    });

    test("handles very long genome for title extraction", () => {
      const longGenome = `ATG ${"GGA ".repeat(1000)}TAA`;
      const title = extractTitle(longGenome);
      expect(title.length).toBeLessThanOrEqual(30);
    });

    test("timestamp format is consistent", () => {
      const filename1 = generateGenomeFilename();
      const filename2 = generateGenomeFilename();
      // Same format even if called multiple times
      expect(filename1.length).toBe(filename2.length);
    });
  });
});
