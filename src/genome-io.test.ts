import { describe, expect, test } from "bun:test";
import { exportGenome, importGenome, validateGenomeFile } from "./genome-io";

describe("Genome I/O", () => {
  const sampleGenome = "ATG GAA AAT GGA TAA";
  const sampleTitle = "Test Genome";

  describe("exportGenome", () => {
    test("creates valid .genome file content", () => {
      const content = exportGenome(sampleGenome, sampleTitle);
      const parsed = JSON.parse(content);

      expect(parsed.version).toBe("1.0.0");
      expect(parsed.title).toBe(sampleTitle);
      expect(parsed.genome).toBe(sampleGenome);
      expect(parsed.created).toBeDefined();
    });

    test("includes optional fields when provided", () => {
      const content = exportGenome(sampleGenome, sampleTitle, {
        description: "A test genome",
        author: "Test Author",
        metadata: { tags: ["test", "example"] },
      });
      const parsed = JSON.parse(content);

      expect(parsed.description).toBe("A test genome");
      expect(parsed.author).toBe("Test Author");
      expect(parsed.metadata.tags).toEqual(["test", "example"]);
    });

    test("produces valid JSON", () => {
      const content = exportGenome(sampleGenome, sampleTitle);
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });

  describe("importGenome", () => {
    test("parses valid .genome file", () => {
      const content = exportGenome(sampleGenome, sampleTitle, {
        description: "Test description",
      });
      const imported = importGenome(content);

      expect(imported.version).toBe("1.0.0");
      expect(imported.title).toBe(sampleTitle);
      expect(imported.genome).toBe(sampleGenome);
      expect(imported.description).toBe("Test description");
    });

    test("throws on invalid JSON", () => {
      expect(() => importGenome("not json")).toThrow("not valid JSON");
    });

    test("throws when missing required fields", () => {
      const invalid = JSON.stringify({ version: "1.0.0" }); // missing title and genome
      expect(() => importGenome(invalid)).toThrow("missing required fields");
    });
  });

  describe("validateGenomeFile", () => {
    test("validates correct genome file", () => {
      const content = exportGenome(sampleGenome, sampleTitle);
      const result = validateGenomeFile(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test("detects missing required fields", () => {
      const invalid = JSON.stringify({ version: "1.0.0", title: "Test" }); // missing genome
      const result = validateGenomeFile(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing required field: genome");
    });

    test("detects invalid characters in genome", () => {
      const invalid = JSON.stringify({
        version: "1.0.0",
        title: "Test",
        genome: "ATG XYZ TAA",
      });
      const result = validateGenomeFile(invalid);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid characters"))).toBe(
        true,
      );
    });

    test("accepts valid genomes with comments and whitespace", () => {
      const content = exportGenome(
        "ATG\n  GAA AAT GGA  ; comment\nTAA",
        "Test",
      );
      const result = validateGenomeFile(content);

      expect(result.valid).toBe(true);
    });

    test("detects invalid JSON format", () => {
      const result = validateGenomeFile("not json at all");

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid JSON format");
    });
  });
});
