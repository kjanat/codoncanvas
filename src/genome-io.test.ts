import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  downloadGenomeFile,
  exportGenome,
  importGenome,
  readGenomeFile,
  validateGenomeFile,
} from "./genome-io";

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
  // Tests for downloadGenomeFile (DOM-based file download)
  // =========================================================================
  describe("downloadGenomeFile", () => {
    let originalCreateObjectURL: typeof URL.createObjectURL;
    let originalRevokeObjectURL: typeof URL.revokeObjectURL;

    beforeEach(() => {
      originalCreateObjectURL = URL.createObjectURL;
      originalRevokeObjectURL = URL.revokeObjectURL;
    });

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
    });

    // HAPPY PATHS
    test("creates blob with correct content and triggers download via anchor element click", () => {
      const createdBlobs: Blob[] = [];
      const clickedElements: HTMLAnchorElement[] = [];
      const originalAppendChild = document.body.appendChild.bind(document.body);

      URL.createObjectURL = (blob: Blob) => {
        createdBlobs.push(blob);
        return "blob:mock-url";
      };
      URL.revokeObjectURL = () => {};

      document.body.appendChild = <T extends Node>(node: T): T => {
        if (node instanceof HTMLAnchorElement) {
          const originalClick = node.click;
          node.click = () => {
            clickedElements.push(node);
            if (originalClick) originalClick.call(node);
          };
        }
        return originalAppendChild(node);
      };

      downloadGenomeFile("ATG TAA", "test");

      expect(createdBlobs).toHaveLength(1);
      expect(createdBlobs[0].type).toContain("application/json");
      expect(clickedElements).toHaveLength(1);
    });

    test("strips .genome extension from title when already present in filename", async () => {
      const createdBlobs: Blob[] = [];

      URL.createObjectURL = (blob: Blob) => {
        createdBlobs.push(blob);
        return "blob:mock-url";
      };
      URL.revokeObjectURL = () => {};

      downloadGenomeFile("ATG TAA", "myfile.genome");

      expect(createdBlobs).toHaveLength(1);

      // Read the blob content using Blob.text() API
      const text = await createdBlobs[0].text();
      const content = JSON.parse(text);
      expect(content.title).toBe("myfile"); // Not "myfile.genome"
    });

    test("appends .genome extension when missing from filename", () => {
      const appendedElements: HTMLAnchorElement[] = [];
      const originalAppendChild = document.body.appendChild.bind(document.body);

      URL.createObjectURL = () => "blob:mock-url";
      URL.revokeObjectURL = () => {};

      document.body.appendChild = <T extends Node>(node: T): T => {
        if (node instanceof HTMLAnchorElement) {
          appendedElements.push(node);
        }
        return originalAppendChild(node);
      };

      downloadGenomeFile("ATG TAA", "myfile");

      expect(appendedElements).toHaveLength(1);
      expect(appendedElements[0].download).toBe("myfile.genome");
    });

    test("includes optional description, author, and metadata in content", async () => {
      const createdBlobs: Blob[] = [];

      URL.createObjectURL = (blob: Blob) => {
        createdBlobs.push(blob);
        return "blob:mock-url";
      };
      URL.revokeObjectURL = () => {};

      downloadGenomeFile("ATG TAA", "test", {
        description: "My description",
        author: "Test Author",
        metadata: { tags: ["bio", "test"] },
      });

      expect(createdBlobs).toHaveLength(1);

      const text = await createdBlobs[0].text();
      const content = JSON.parse(text);
      expect(content.description).toBe("My description");
      expect(content.author).toBe("Test Author");
      expect(content.metadata.tags).toEqual(["bio", "test"]);
    });

    // EDGE CASES
    test("handles empty genome string gracefully", async () => {
      const createdBlobs: Blob[] = [];

      URL.createObjectURL = (blob: Blob) => {
        createdBlobs.push(blob);
        return "blob:mock-url";
      };
      URL.revokeObjectURL = () => {};

      expect(() => downloadGenomeFile("", "empty-genome")).not.toThrow();
      expect(createdBlobs).toHaveLength(1);

      const text = await createdBlobs[0].text();
      const content = JSON.parse(text);
      expect(content.genome).toBe("");
    });

    test("handles very long genome strings (>100KB)", () => {
      const longGenome = "ATG ".repeat(30000); // ~120KB
      const createdBlobs: Blob[] = [];

      URL.createObjectURL = (blob: Blob) => {
        createdBlobs.push(blob);
        return "blob:mock-url";
      };
      URL.revokeObjectURL = () => {};

      expect(() => downloadGenomeFile(longGenome, "large-genome")).not.toThrow();
      expect(createdBlobs).toHaveLength(1);
      expect(createdBlobs[0].size).toBeGreaterThan(100000);
    });

    test("handles special characters in filename", () => {
      const appendedElements: HTMLAnchorElement[] = [];
      const originalAppendChild = document.body.appendChild.bind(document.body);

      URL.createObjectURL = () => "blob:mock-url";
      URL.revokeObjectURL = () => {};

      document.body.appendChild = <T extends Node>(node: T): T => {
        if (node instanceof HTMLAnchorElement) {
          appendedElements.push(node);
        }
        return originalAppendChild(node);
      };

      expect(() =>
        downloadGenomeFile("ATG TAA", "my file (v2) [final]"),
      ).not.toThrow();

      expect(appendedElements).toHaveLength(1);
      expect(appendedElements[0].download).toBe("my file (v2) [final].genome");
    });

    test("handles unicode characters in metadata", async () => {
      const createdBlobs: Blob[] = [];

      URL.createObjectURL = (blob: Blob) => {
        createdBlobs.push(blob);
        return "blob:mock-url";
      };
      URL.revokeObjectURL = () => {};

      expect(() =>
        downloadGenomeFile("ATG TAA", "test", {
          description: "Test with émojis 🧬 and ünïcödé",
          author: "作者名",
          metadata: { note: "日本語テスト" },
        }),
      ).not.toThrow();

      expect(createdBlobs).toHaveLength(1);

      const text = await createdBlobs[0].text();
      const content = JSON.parse(text);
      expect(content.description).toBe("Test with émojis 🧬 and ünïcödé");
      expect(content.author).toBe("作者名");
      expect(content.metadata.note).toBe("日本語テスト");
    });

    // DOM INTERACTION
    test("creates temporary anchor element, appends to body, clicks, then removes", () => {
      const appendedElements: Node[] = [];
      const clickedElements: HTMLElement[] = [];
      const removedElements: Node[] = [];
      const originalAppendChild = document.body.appendChild.bind(document.body);
      const originalRemoveChild = document.body.removeChild.bind(document.body);

      URL.createObjectURL = () => "blob:mock-url";
      URL.revokeObjectURL = () => {};

      document.body.appendChild = <T extends Node>(node: T): T => {
        appendedElements.push(node);
        if (node instanceof HTMLElement) {
          const originalClick = node.click;
          node.click = () => {
            clickedElements.push(node);
            if (originalClick) originalClick.call(node);
          };
        }
        return originalAppendChild(node);
      };

      document.body.removeChild = <T extends Node>(node: T): T => {
        removedElements.push(node);
        return originalRemoveChild(node);
      };

      downloadGenomeFile("ATG TAA", "test");

      // Verify anchor was created
      expect(appendedElements).toHaveLength(1);
      expect(appendedElements[0]).toBeInstanceOf(HTMLAnchorElement);

      // Verify click was triggered
      expect(clickedElements).toHaveLength(1);

      // Verify element was removed
      expect(removedElements).toHaveLength(1);
      expect(removedElements[0]).toBe(appendedElements[0]);
    });

    test("calls URL.createObjectURL and URL.revokeObjectURL correctly", () => {
      const createCalls: Blob[] = [];
      const revokeCalls: string[] = [];

      URL.createObjectURL = (blob: Blob) => {
        createCalls.push(blob);
        return "blob:test-url-123";
      };
      URL.revokeObjectURL = (url: string) => {
        revokeCalls.push(url);
      };

      downloadGenomeFile("ATG TAA", "test");

      expect(createCalls).toHaveLength(1);
      expect(createCalls[0]).toBeInstanceOf(Blob);

      expect(revokeCalls).toHaveLength(1);
      expect(revokeCalls[0]).toBe("blob:test-url-123");
    });
  });

  // =========================================================================
  // Tests for readGenomeFile (FileReader async file reading)
  // =========================================================================
  describe("readGenomeFile", () => {
    /**
     * Helper to create a File object from content
     */
    function createGenomeFile(content: string, filename = "test.genome"): File {
      return new File([content], filename, { type: "application/json" });
    }

    // HAPPY PATHS
    test("reads valid .genome file and returns parsed GenomeFile object via Promise", async () => {
      const genomeContent = exportGenome("ATG GAA TAA", "Test Genome");
      const file = createGenomeFile(genomeContent);

      const result = await readGenomeFile(file);

      expect(result).toBeDefined();
      expect(result.version).toBe("1.0.0");
      expect(result.title).toBe("Test Genome");
      expect(result.genome).toBe("ATG GAA TAA");
    });

    test("correctly parses all fields: version, title, genome, description, author, metadata", async () => {
      const genomeContent = exportGenome("ATG TAA", "Complete Test", {
        description: "A full test genome",
        author: "Test Author",
        metadata: { tags: ["test", "complete"], version: 2 },
      });
      const file = createGenomeFile(genomeContent);

      const result = await readGenomeFile(file);

      expect(result.version).toBe("1.0.0");
      expect(result.title).toBe("Complete Test");
      expect(result.genome).toBe("ATG TAA");
      expect(result.description).toBe("A full test genome");
      expect(result.author).toBe("Test Author");
      expect(result.metadata).toEqual({ tags: ["test", "complete"], version: 2 });
      expect(result.created).toBeDefined();
    });

    // EDGE CASES
    test("handles File object with empty content", async () => {
      const file = createGenomeFile("");

      await expect(readGenomeFile(file)).rejects.toThrow();
    });

    test("handles very large files (>1MB)", async () => {
      const largeGenome = "ATG ".repeat(300000); // ~1.2MB
      const genomeContent = exportGenome(largeGenome, "Large Genome");
      const file = createGenomeFile(genomeContent);

      const result = await readGenomeFile(file);

      expect(result.genome).toBe(largeGenome);
      expect(result.genome.length).toBeGreaterThan(1000000);
    });

    // ERROR CASES
    test("rejects with error when file content is not valid JSON", async () => {
      const file = createGenomeFile("not valid json at all {{{");

      await expect(readGenomeFile(file)).rejects.toThrow("not valid JSON");
    });

    test("rejects with error when JSON is missing required fields (version, title, genome)", async () => {
      const invalidContent = JSON.stringify({ version: "1.0.0", title: "Only Title" });
      const file = createGenomeFile(invalidContent);

      await expect(readGenomeFile(file)).rejects.toThrow("missing required fields");
    });

    test("rejects with error when FileReader.onerror fires", async () => {
      // Create a file that will cause FileReader to fail
      // We need to mock FileReader to simulate an error
      const originalFileReader = globalThis.FileReader;

      class MockErrorFileReader {
        onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
        onerror: (() => void) | null = null;

        readAsText() {
          // Simulate async error
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 0);
        }
      }

      globalThis.FileReader = MockErrorFileReader as unknown as typeof FileReader;

      try {
        const file = createGenomeFile("valid content");
        await expect(readGenomeFile(file)).rejects.toThrow("Failed to read file");
      } finally {
        globalThis.FileReader = originalFileReader;
      }
    });

    // ASYNC BEHAVIOR
    test("returns Promise that resolves after FileReader completes", async () => {
      const genomeContent = exportGenome("ATG TAA", "Async Test");
      const file = createGenomeFile(genomeContent);

      const promise = readGenomeFile(file);

      expect(promise).toBeInstanceOf(Promise);

      const result = await promise;
      expect(result.title).toBe("Async Test");
    });

    test("handles multiple concurrent file reads", async () => {
      const file1 = createGenomeFile(exportGenome("ATG", "First"));
      const file2 = createGenomeFile(exportGenome("TAA", "Second"));
      const file3 = createGenomeFile(exportGenome("GAA", "Third"));

      const [result1, result2, result3] = await Promise.all([
        readGenomeFile(file1),
        readGenomeFile(file2),
        readGenomeFile(file3),
      ]);

      expect(result1.title).toBe("First");
      expect(result1.genome).toBe("ATG");
      expect(result2.title).toBe("Second");
      expect(result2.genome).toBe("TAA");
      expect(result3.title).toBe("Third");
      expect(result3.genome).toBe("GAA");
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
