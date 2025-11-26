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

  // =========================================================================
  // TODO: Tests for downloadGenomeFile (DOM-based file download)
  // =========================================================================
  describe("downloadGenomeFile", () => {
    // HAPPY PATHS
    test.todo(
      "creates blob with correct content and triggers download via anchor element click",
    );
    test.todo(
      "strips .genome extension from title when already present in filename",
    );
    test.todo("appends .genome extension when missing from filename");
    test.todo("includes optional description, author, and metadata in content");

    // EDGE CASES
    test.todo("handles empty genome string gracefully");
    test.todo("handles very long genome strings (>100KB)");
    test.todo("handles special characters in filename");
    test.todo("handles unicode characters in metadata");

    // DOM INTERACTION
    test.todo(
      "creates temporary anchor element, appends to body, clicks, then removes",
    );
    test.todo("calls URL.createObjectURL and URL.revokeObjectURL correctly");
  });

  // =========================================================================
  // TODO: Tests for readGenomeFile (FileReader async file reading)
  // =========================================================================
  describe("readGenomeFile", () => {
    // HAPPY PATHS
    test.todo(
      "reads valid .genome file and returns parsed GenomeFile object via Promise",
    );
    test.todo(
      "correctly parses all fields: version, title, genome, description, author, metadata",
    );

    // EDGE CASES
    test.todo("handles File object with empty content");
    test.todo("handles very large files (>1MB)");

    // ERROR CASES
    test.todo("rejects with error when file content is not valid JSON");
    test.todo(
      "rejects with error when JSON is missing required fields (version, title, genome)",
    );
    test.todo("rejects with error when FileReader.onerror fires");

    // ASYNC BEHAVIOR
    test.todo("returns Promise that resolves after FileReader completes");
    test.todo("handles multiple concurrent file reads");
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
