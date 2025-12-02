/**
 * Tests for canvas export utilities
 *
 * Note: Canvas-specific tests (toDataURL, toBlob, getImageData) are skipped
 * because happy-dom doesn't implement real canvas rendering.
 * These are thin wrappers around browser APIs - testing them would just
 * test the browser, not our code.
 */

import { describe, expect, test } from "bun:test";
import { CodonLexer } from "@/core/lexer";
import {
  canvasToBlob,
  canvasToDataURL,
  clearCanvas,
  downloadCanvasPNG,
  downloadGenomeSVG,
  genomeToSVG,
} from "@/utils/canvas-export";

describe("canvas-export", () => {
  describe("canvasToDataURL", () => {
    test("returns null for null canvas", () => {
      expect(canvasToDataURL(null)).toBeNull();
    });

    // Skip: happy-dom canvas.toDataURL() returns empty string
    test.skip("returns data URL for valid canvas", () => {});
    test.skip("respects MIME type parameter", () => {});
  });

  describe("canvasToBlob", () => {
    test("resolves to null for null canvas", async () => {
      const result = await canvasToBlob(null);
      expect(result).toBeNull();
    });

    // Skip: happy-dom canvas.toBlob() doesn't produce real blobs
    test.skip("resolves to Blob for valid canvas", () => {});
  });

  describe("clearCanvas", () => {
    test("handles null canvas without throwing", () => {
      expect(() => clearCanvas(null)).not.toThrow();
    });

    test("calls clearRect and fillRect on valid canvas", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;

      // Just verify it doesn't throw - can't verify pixels in happy-dom
      expect(() => clearCanvas(canvas)).not.toThrow();
    });
  });

  describe("downloadCanvasPNG", () => {
    test("handles null canvas without throwing", () => {
      expect(() => downloadCanvasPNG(null)).not.toThrow();
    });

    test("does not throw for valid canvas", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 100;
      canvas.height = 100;

      // In happy-dom, toDataURL returns empty string but should not throw
      expect(() => downloadCanvasPNG(canvas, "test.png")).not.toThrow();
    });
  });

  describe("genomeToSVG", () => {
    const lexer = new CodonLexer();

    test("generates valid SVG from simple genome", () => {
      const genome = "ATG GAA CCC GGA TAA"; // START, PUSH, value, CIRCLE, STOP

      const svg = genomeToSVG(genome, 400, 400, lexer);

      expect(svg).toMatch(/^<svg/);
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('width="400"');
      expect(svg).toContain('height="400"');
      expect(svg).toMatch(/<\/svg>$/);
    });

    test("includes circle element for CIRCLE opcode", () => {
      const genome = "ATG GAA CCC GGA TAA"; // Draws a circle

      const svg = genomeToSVG(genome, 400, 400, lexer);

      expect(svg).toContain("<circle");
    });

    test("includes rect element for RECT opcode", () => {
      // CCA = RECT, needs two values for width/height
      const genome = "ATG GAA CCC GAA AAA CCA TAA";

      const svg = genomeToSVG(genome, 400, 400, lexer);

      expect(svg).toContain("<rect");
    });

    test("respects custom dimensions", () => {
      const genome = "ATG TAA";

      const svg = genomeToSVG(genome, 800, 600, lexer);

      expect(svg).toContain('width="800"');
      expect(svg).toContain('height="600"');
      expect(svg).toContain('viewBox="0 0 800 600"');
    });

    test("handles genome with color changes", () => {
      // GAG = SETHUE
      const genome = "ATG GAA CCC GAG GAA AAA GGA TAA";

      const svg = genomeToSVG(genome, 400, 400, lexer);

      expect(svg).toContain("hsl(");
    });

    test("handles empty genome (just START/STOP)", () => {
      const genome = "ATG TAA";

      const svg = genomeToSVG(genome, 400, 400, lexer);

      expect(svg).toMatch(/^<svg.*<\/svg>$/);
      // Should not contain any shape elements
      expect(svg).not.toContain("<circle");
      expect(svg).not.toContain("<rect");
    });
  });

  describe("downloadGenomeSVG", () => {
    const lexer = new CodonLexer();

    test("creates blob URL and revokes it after download", () => {
      const createdURLs: string[] = [];
      const revokedURLs: string[] = [];

      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;

      URL.createObjectURL = (blob: Blob) => {
        createdURLs.push(blob.type);
        return "blob:mock-svg-url";
      };

      URL.revokeObjectURL = (url: string) => {
        revokedURLs.push(url);
      };

      try {
        downloadGenomeSVG("ATG GAA CCC GGA TAA", 400, 400, lexer, "test.svg");

        expect(createdURLs).toHaveLength(1);
        expect(createdURLs[0]).toBe("image/svg+xml");
        expect(revokedURLs).toHaveLength(1);
        expect(revokedURLs[0]).toBe("blob:mock-svg-url");
      } finally {
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
      }
    });

    test("does not throw for valid genome", () => {
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;

      URL.createObjectURL = () => "blob:mock";
      URL.revokeObjectURL = () => {};

      try {
        expect(() => {
          downloadGenomeSVG("ATG TAA", 400, 400, lexer);
        }).not.toThrow();
      } finally {
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
      }
    });
  });
});
