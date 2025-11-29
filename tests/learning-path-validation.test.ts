import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { analyzeComplexity, type GenomeComplexity } from "@/codon-analyzer";
import { CodonLexer } from "@/lexer";

/**
 * Learning Path Validation Test Suite
 *
 * Validates that learning paths are:
 * - Properly structured (valid JSON)
 * - Reference existing genome files
 * - Show appropriate complexity progression
 * - Have complete pedagogical metadata
 *
 * Complexity data is generated at runtime from actual genome files,
 * ensuring tests always reflect the current state of the codebase.
 */

interface LearningPathStep {
  genome: string;
  title: string;
  concept: string;
  narrative: string;
  keyTakeaway: string;
  tryIt: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  learningObjectives: string[];
  steps: LearningPathStep[];
}

interface LearningPathsData {
  version: string;
  paths: LearningPath[];
}

/**
 * Generate complexity analysis for all genome files at runtime
 */
function generateComplexityAnalysis(): GenomeComplexity[] {
  const examplesDir = join(__dirname, "..", "examples");
  const lexer = new CodonLexer();

  try {
    const files = readdirSync(examplesDir).filter((f) => f.endsWith(".genome"));
    return files.map((filename) => {
      const content = readFileSync(join(examplesDir, filename), "utf-8");
      try {
        const tokens = lexer.tokenize(content);
        return analyzeComplexity(filename, tokens);
      } catch {
        // Return zero complexity for files that fail to parse
        return analyzeComplexity(filename, []);
      }
    });
  } catch {
    return [];
  }
}

describe("Learning Path Validation", () => {
  let pathsData: LearningPathsData;
  let complexityAnalysis: GenomeComplexity[];

  // Load learning paths JSON
  try {
    const pathsJson = readFileSync(
      join(__dirname, "..", "examples", "learning-paths.json"),
      "utf-8",
    );
    pathsData = JSON.parse(pathsJson);
  } catch (e) {
    console.error("Failed to load learning-paths.json:", e);
    pathsData = { version: "", paths: [] };
  }

  // Generate complexity analysis at runtime
  complexityAnalysis = generateComplexityAnalysis();

  describe("Data Structure Validation", () => {
    test("learning-paths.json exists and is valid JSON", () => {
      expect(pathsData).toBeDefined();
      expect(pathsData.version).toBeDefined();
      expect(pathsData.paths).toBeInstanceOf(Array);
    });

    test("has 4 learning paths as documented", () => {
      expect(pathsData.paths.length).toBe(4);
    });

    test("each path has required metadata fields", () => {
      pathsData.paths.forEach((path) => {
        expect(path.id).toBeDefined();
        expect(path.title).toBeDefined();
        expect(path.description).toBeDefined();
        expect(path.difficulty).toBeDefined();
        expect(path.duration).toBeDefined();
        expect(path.learningObjectives).toBeInstanceOf(Array);
        expect(path.steps).toBeInstanceOf(Array);
      });
    });

    test("each step has complete pedagogical metadata", () => {
      pathsData.paths.forEach((path) => {
        path.steps.forEach((step, index) => {
          expect(
            step.genome,
            `Path ${path.id}, step ${index}: missing genome`,
          ).toBeDefined();
          expect(
            step.title,
            `Path ${path.id}, step ${index}: missing title`,
          ).toBeDefined();
          expect(
            step.concept,
            `Path ${path.id}, step ${index}: missing concept`,
          ).toBeDefined();
          expect(
            step.narrative,
            `Path ${path.id}, step ${index}: missing narrative`,
          ).toBeDefined();
          expect(
            step.keyTakeaway,
            `Path ${path.id}, step ${index}: missing keyTakeaway`,
          ).toBeDefined();
          expect(
            step.tryIt,
            `Path ${path.id}, step ${index}: missing tryIt`,
          ).toBeDefined();
        });
      });
    });
  });

  describe("File Reference Validation", () => {
    test("all referenced genome files exist", () => {
      pathsData.paths.forEach((path) => {
        path.steps.forEach((step) => {
          const genomePath = join(__dirname, "..", "examples", step.genome);
          expect(
            () => readFileSync(genomePath, "utf-8"),
            `Genome not found: ${step.genome}`,
          ).not.toThrow();
        });
      });
    });

    test("no duplicate genomes within same path", () => {
      pathsData.paths.forEach((path) => {
        const genomes = path.steps.map((s) => s.genome);
        const uniqueGenomes = new Set(genomes);
        expect(uniqueGenomes.size).toBe(genomes.length);
      });
    });
  });

  describe("Pedagogical Quality", () => {
    test("each path has 6 steps (consistent structure)", () => {
      pathsData.paths.forEach((path) => {
        expect(path.steps.length).toBe(6);
      });
    });

    test("each path has at least 3 learning objectives", () => {
      pathsData.paths.forEach((path) => {
        expect(path.learningObjectives.length).toBeGreaterThanOrEqual(3);
      });
    });

    test("narratives are substantive (>50 characters)", () => {
      pathsData.paths.forEach((path) => {
        path.steps.forEach((step) => {
          expect(step.narrative.length).toBeGreaterThan(50);
        });
      });
    });

    test("try-test activities are meaningful (>20 characters)", () => {
      pathsData.paths.forEach((path) => {
        path.steps.forEach((step) => {
          expect(step.tryIt.length).toBeGreaterThan(20);
        });
      });
    });

    test("key takeaways are concise but complete (20-200 characters)", () => {
      pathsData.paths.forEach((path) => {
        path.steps.forEach((step) => {
          expect(step.keyTakeaway.length).toBeGreaterThan(20);
          expect(step.keyTakeaway.length).toBeLessThan(200);
        });
      });
    });
  });

  describe("Complexity Progression", () => {
    function getComplexityScore(genome: string): number {
      const analysis = complexityAnalysis.find((a) => a.filename === genome);
      return analysis ? analysis.complexityScore : 0;
    }

    test("DNA Fundamentals path shows increasing complexity", () => {
      const dnaPath = pathsData.paths.find((p) => p.id === "dna-fundamentals");
      if (!dnaPath) return;

      const complexities = dnaPath.steps.map((s) =>
        getComplexityScore(s.genome),
      );

      // Should generally trend upward (allow some variation)
      const firstHalf = complexities.slice(0, 3).reduce((a, b) => a + b) / 3;
      const secondHalf = complexities.slice(3, 6).reduce((a, b) => a + b) / 3;

      expect(secondHalf).toBeGreaterThanOrEqual(firstHalf * 0.8); // Allow some variation
    });

    test("Visual Programming path shows skill progression", () => {
      const visualPath = pathsData.paths.find(
        (p) => p.id === "visual-programming",
      );
      if (!visualPath) return;

      const complexities = visualPath.steps.map((s) =>
        getComplexityScore(s.genome),
      );

      // Last step should be more complex than first
      expect(complexities[complexities.length - 1]).toBeGreaterThan(
        complexities[0],
      );
    });

    test("complexity progression is generally reasonable", () => {
      pathsData.paths.forEach((path) => {
        const complexities = path.steps.map((s) =>
          getComplexityScore(s.genome),
        );

        // Check overall trend rather than strict step-by-step (pedagogical paths may have intentional jumps)
        const avgFirstHalf =
          complexities.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
        const avgSecondHalf =
          complexities.slice(3, 6).reduce((a, b) => a + b, 0) / 3;

        // Second half should not be dramatically simpler (regressing)
        if (avgFirstHalf > 20) {
          // Only check if first half has substantial complexity
          expect(avgSecondHalf).toBeGreaterThan(avgFirstHalf * 0.5);
        }
      });
    });
  });

  describe("Difficulty Calibration", () => {
    test("beginner paths start with simpler genomes", () => {
      const beginnerPaths = pathsData.paths.filter((p) =>
        p.difficulty.toLowerCase().includes("beginner"),
      );

      beginnerPaths.forEach((path) => {
        const firstStepComplexity =
          complexityAnalysis.find((a) => a.filename === path.steps[0].genome)
            ?.complexityScore || 0;

        // Beginner first steps should be relatively simple
        expect(firstStepComplexity).toBeLessThan(150);
      });
    });

    test("intermediate/advanced paths can start more complex", () => {
      const advancedPaths = pathsData.paths.filter(
        (p) =>
          p.difficulty.toLowerCase().includes("intermediate") ||
          p.difficulty.toLowerCase().includes("advanced"),
      );

      // At least one advanced path should have non-trivial complexity
      const hasComplexStart = advancedPaths.some((path) => {
        const firstStepComplexity =
          complexityAnalysis.find((a) => a.filename === path.steps[0].genome)
            ?.complexityScore || 0;
        return firstStepComplexity > 80;
      });

      expect(hasComplexStart).toBe(true);
    });
  });

  describe("Content Completeness", () => {
    test("paths cover diverse concepts", () => {
      const allConcepts = pathsData.paths.flatMap((p) =>
        p.steps.map((s) => s.concept.toLowerCase()),
      );
      const uniqueConcepts = new Set(allConcepts);

      // Should have at least 15 unique concepts across all paths
      expect(uniqueConcepts.size).toBeGreaterThan(15);
    });

    test("paths utilize significant portion of example library", () => {
      const usedGenomes = new Set(
        pathsData.paths.flatMap((p) => p.steps.map((s) => s.genome)),
      );

      // Should use at least 20 unique genomes (out of 48)
      expect(usedGenomes.size).toBeGreaterThanOrEqual(20);
    });

    test("no path is identical to another", () => {
      for (let i = 0; i < pathsData.paths.length; i++) {
        for (let j = i + 1; j < pathsData.paths.length; j++) {
          const genomes1 = pathsData.paths[i].steps.map((s) => s.genome).sort();
          const genomes2 = pathsData.paths[j].steps.map((s) => s.genome).sort();

          expect(JSON.stringify(genomes1)).not.toBe(JSON.stringify(genomes2));
        }
      }
    });
  });

  describe("Educational Accuracy", () => {
    test("DNA Fundamentals path teaches mutation types", () => {
      const dnaPath = pathsData.paths.find((p) => p.id === "dna-fundamentals");
      if (!dnaPath) return;

      const concepts = dnaPath.steps
        .map((s) => s.concept.toLowerCase())
        .join(" ");

      // Should mention key mutation concepts
      const hasMutationConcepts =
        concepts.includes("silent") ||
        concepts.includes("mutation") ||
        concepts.includes("frameshift") ||
        concepts.includes("missense") ||
        concepts.includes("nonsense");

      expect(hasMutationConcepts).toBe(true);
    });

    test("Visual Programming path teaches drawing concepts", () => {
      const visualPath = pathsData.paths.find(
        (p) => p.id === "visual-programming",
      );
      if (!visualPath) return;

      const concepts = visualPath.steps
        .map((s) => s.concept.toLowerCase())
        .join(" ");

      // Should mention key visual programming concepts
      const hasVisualConcepts =
        concepts.includes("shape") ||
        concepts.includes("transform") ||
        concepts.includes("draw") ||
        concepts.includes("color") ||
        concepts.includes("loop");

      expect(hasVisualConcepts).toBe(true);
    });

    test("paths reference appropriate difficulty levels", () => {
      pathsData.paths.forEach((path) => {
        const validDifficulties = ["beginner", "intermediate", "advanced"];
        const hasDifficulty = validDifficulties.some((d) =>
          path.difficulty.toLowerCase().includes(d),
        );

        expect(hasDifficulty).toBe(true);
      });
    });
  });
});
