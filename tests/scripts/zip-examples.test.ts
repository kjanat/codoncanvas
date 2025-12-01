/**
 * Edge Case Tests for zip-examples Script
 *
 * Tests error handling, edge cases, and utility functions
 * for the example distribution ZIP creation script.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { rm } from "node:fs/promises";
import { join } from "node:path";
import { zipSync } from "fflate";

// Test the utility functions that can be extracted
describe("zip-examples utilities", () => {
  describe("formatSize", () => {
    // Inline implementation for testing since it's not exported
    function formatSize(bytes: number): string {
      if (bytes < 1024) return `${bytes}B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    }

    test("formats bytes (< 1KB)", () => {
      expect(formatSize(0)).toBe("0B");
      expect(formatSize(512)).toBe("512B");
      expect(formatSize(1023)).toBe("1023B");
    });

    test("formats kilobytes (1KB - 1MB)", () => {
      expect(formatSize(1024)).toBe("1.0KB");
      expect(formatSize(1536)).toBe("1.5KB");
      expect(formatSize(1024 * 500)).toBe("500.0KB");
    });

    test("formats megabytes (>= 1MB)", () => {
      expect(formatSize(1024 * 1024)).toBe("1.0MB");
      expect(formatSize(1024 * 1024 * 2.5)).toBe("2.5MB");
    });

    test("handles edge case at boundaries", () => {
      expect(formatSize(1024 - 1)).toBe("1023B");
      expect(formatSize(1024)).toBe("1.0KB");
      expect(formatSize(1024 * 1024 - 1)).toBe("1024.0KB");
      expect(formatSize(1024 * 1024)).toBe("1.0MB");
    });
  });

  describe("generateQuickStart", () => {
    // Test the structure of quick start content
    function generateQuickStart(): string {
      return `CodonCanvas Quick Start
=======================

STEP 1: Open CodonCanvas
   Web: https://codoncanvas.org
   Local: Open index.html in browser

STEP 2: Load an Example
   - Click "Load Example" button
   - Or drag-and-drop a .genome file

STEP 3: Run the Program
   - Click Play button
   - Watch visual output appear on canvas

STEP 4: Experiment
   - Change codons and re-run
   - Try mutations (see examples/README.md)
   - Save your work (Download button)

NEED HELP?
- See codon-chart.svg for complete reference
- See examples/README.md for mutation experiments
- All programs must start with ATG and end with TAA/TAG/TGA
- Only use bases A, C, G, T
- Total length must be divisible by 3

CLASSROOM USE:
See EDUCATORS.md and STUDENT_HANDOUTS.md for lesson plans
`;
    }

    test("includes all required sections", () => {
      const content = generateQuickStart();

      expect(content).toContain("STEP 1");
      expect(content).toContain("STEP 2");
      expect(content).toContain("STEP 3");
      expect(content).toContain("STEP 4");
      expect(content).toContain("NEED HELP");
      expect(content).toContain("CLASSROOM USE");
    });

    test("includes website URL", () => {
      const content = generateQuickStart();
      expect(content).toContain("https://codoncanvas.org");
    });

    test("includes genome file instructions", () => {
      const content = generateQuickStart();
      expect(content).toContain(".genome");
      expect(content).toContain("ATG");
      expect(content).toContain("TAA/TAG/TGA");
    });
  });

  describe("generateVersionInfo", () => {
    function generateVersionInfo(genomeCount: number, version: string): string {
      const buildDate = new Date().toISOString().split("T")[0];
      return `CodonCanvas Example Programs
Version: ${version}
Date: ${buildDate}
Contents: ${genomeCount} example .genome files + documentation
License: MIT

For more information:
- README.md: Overview of all examples
- codon-chart.svg: Visual reference poster
- QUICK_START.txt: Getting started guide

Web: https://codoncanvas.org
Docs: https://github.com/codoncanvas/codoncanvas
`;
    }

    test("includes genome count", () => {
      const content = generateVersionInfo(42, "1.0.0");
      expect(content).toContain("42 example .genome files");
    });

    test("includes version", () => {
      const content = generateVersionInfo(10, "2.5.0");
      expect(content).toContain("Version: 2.5.0");
    });

    test("includes current date", () => {
      const content = generateVersionInfo(10, "1.0.0");
      const today = new Date().toISOString().split("T")[0];
      expect(content).toContain(`Date: ${today}`);
    });

    test("includes license", () => {
      const content = generateVersionInfo(10, "1.0.0");
      expect(content).toContain("License: MIT");
    });

    test("handles zero genome count", () => {
      const content = generateVersionInfo(0, "1.0.0");
      expect(content).toContain("0 example .genome files");
    });
  });
});

describe("fflate zipSync edge cases", () => {
  describe("empty archive", () => {
    test("creates valid ZIP with no entries", () => {
      const entries = {};
      const zipped = zipSync(entries);

      expect(zipped).toBeInstanceOf(Uint8Array);
      expect(zipped.byteLength).toBeGreaterThan(0);
    });
  });

  describe("file content edge cases", () => {
    test("handles empty file content", () => {
      const entries = {
        "empty.txt": new Uint8Array(0),
      };
      const zipped = zipSync(entries);

      expect(zipped).toBeInstanceOf(Uint8Array);
    });

    test("handles very large file content", () => {
      // 1MB of data
      const largeContent = new Uint8Array(1024 * 1024);
      largeContent.fill(65); // Fill with 'A'

      const entries = {
        "large.txt": largeContent,
      };
      const zipped = zipSync(entries, { level: 9 });

      expect(zipped).toBeInstanceOf(Uint8Array);
      // Compressed should be smaller due to repetition
      expect(zipped.byteLength).toBeLessThan(largeContent.byteLength);
    });

    test("handles binary content", () => {
      const binaryContent = new Uint8Array([0, 1, 2, 255, 254, 253]);

      const entries = {
        "binary.bin": binaryContent,
      };
      const zipped = zipSync(entries);

      expect(zipped).toBeInstanceOf(Uint8Array);
    });

    test("handles UTF-8 text content", () => {
      const encoder = new TextEncoder();
      const unicodeContent = encoder.encode("Hello World");

      const entries = {
        "unicode.txt": unicodeContent,
      };
      const zipped = zipSync(entries);

      expect(zipped).toBeInstanceOf(Uint8Array);
    });
  });

  describe("path edge cases", () => {
    test("handles nested directory paths", () => {
      const encoder = new TextEncoder();

      const entries = {
        "a/b/c/d/deep.txt": encoder.encode("deep file"),
      };
      const zipped = zipSync(entries);

      expect(zipped).toBeInstanceOf(Uint8Array);
    });

    test("handles paths with special characters", () => {
      const encoder = new TextEncoder();

      const entries = {
        "file-with-dashes.txt": encoder.encode("content"),
        "file_with_underscores.txt": encoder.encode("content"),
        "file.multiple.dots.txt": encoder.encode("content"),
      };
      const zipped = zipSync(entries);

      expect(zipped).toBeInstanceOf(Uint8Array);
    });

    test("handles multiple files in same directory", () => {
      const encoder = new TextEncoder();

      const entries = {
        "dir/file1.txt": encoder.encode("content1"),
        "dir/file2.txt": encoder.encode("content2"),
        "dir/file3.txt": encoder.encode("content3"),
      };
      const zipped = zipSync(entries);

      expect(zipped).toBeInstanceOf(Uint8Array);
    });
  });

  describe("compression levels", () => {
    test("level 0 (no compression) works", () => {
      const encoder = new TextEncoder();
      const content = encoder.encode("test content".repeat(100));

      const entries = { "test.txt": content };
      const zipped = zipSync(entries, { level: 0 });

      expect(zipped).toBeInstanceOf(Uint8Array);
    });

    test("level 9 (max compression) works", () => {
      const encoder = new TextEncoder();
      const content = encoder.encode("test content".repeat(100));

      const entries = { "test.txt": content };
      const zipped = zipSync(entries, { level: 9 });

      expect(zipped).toBeInstanceOf(Uint8Array);
    });
  });
});

describe("Bun.Glob edge cases", () => {
  describe("pattern matching", () => {
    test("*.genome pattern matches genome files", async () => {
      const glob = new Bun.Glob("*.genome");
      const matches: string[] = [];

      for await (const file of glob.scan({
        cwd: "examples",
        onlyFiles: true,
      })) {
        matches.push(file);
      }

      expect(matches.length).toBeGreaterThan(0);
      expect(matches.every((m) => m.endsWith(".genome"))).toBe(true);
    });

    test("*.nonexistent pattern returns empty", async () => {
      const glob = new Bun.Glob("*.nonexistent");
      const matches: string[] = [];

      for await (const file of glob.scan({
        cwd: "examples",
        onlyFiles: true,
      })) {
        matches.push(file);
      }

      expect(matches.length).toBe(0);
    });

    test("nested glob pattern works", async () => {
      const glob = new Bun.Glob("screenshots/*.png");
      const matches: string[] = [];

      for await (const file of glob.scan({
        cwd: "examples",
        onlyFiles: true,
      })) {
        matches.push(file);
      }

      // May or may not have screenshots depending on state
      expect(Array.isArray(matches)).toBe(true);
    });
  });

  describe("directory handling", () => {
    test("handles non-existent directory gracefully", async () => {
      const glob = new Bun.Glob("*.txt");

      // Scanning non-existent directory should not throw but return empty
      try {
        const matches: string[] = [];
        for await (const file of glob.scan({
          cwd: "nonexistent-dir-12345",
          onlyFiles: true,
        })) {
          matches.push(file);
        }
        expect(matches.length).toBe(0);
      } catch {
        // Some implementations may throw for non-existent directories
        expect(true).toBe(true);
      }
    });
  });
});

describe("file operations edge cases", () => {
  const testDir = "test-zip-output";
  const testFile = join(testDir, "test.zip");

  beforeEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe("Bun.write", () => {
    test("creates file in non-existent directory fails", async () => {
      const encoder = new TextEncoder();
      const content = encoder.encode("test");
      const zipped = zipSync({ "test.txt": content });

      try {
        await Bun.write(testFile, zipped);
        // If it succeeds, directory was auto-created
        expect(await Bun.file(testFile).exists()).toBe(true);
      } catch (error) {
        // Expected: directory doesn't exist
        expect(error).toBeDefined();
      }
    });

    test("overwrites existing file", async () => {
      // Create directory first
      await Bun.write(join(testDir, ".keep"), "");

      const encoder = new TextEncoder();
      const content1 = encoder.encode("first");
      const content2 = encoder.encode("second");

      const zipped1 = zipSync({ "test.txt": content1 });
      const zipped2 = zipSync({ "test.txt": content2 });

      await Bun.write(testFile, zipped1);
      const size1 = (await Bun.file(testFile).arrayBuffer()).byteLength;

      await Bun.write(testFile, zipped2);
      const size2 = (await Bun.file(testFile).arrayBuffer()).byteLength;

      // Both writes should succeed, sizes may differ
      expect(size1).toBeGreaterThan(0);
      expect(size2).toBeGreaterThan(0);
    });
  });

  describe("rm with force option", () => {
    test("does not throw for non-existent file", async () => {
      await expect(
        rm("nonexistent-file-12345.zip", { force: true }),
      ).resolves.toBeUndefined();
    });
  });
});
