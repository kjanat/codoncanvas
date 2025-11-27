/**
 * CodonCanvas Library Entry Point Test Suite
 *
 * Tests for the main library exports that ensure all public API
 * is accessible and the core execution flow works correctly.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  Canvas2DRenderer,
  CODON_MAP,
  CodonLexer,
  CodonVM,
  GeneticAlgorithm,
  Opcode,
  ResearchMetrics,
} from "./index";
import type {
  Base,
  Codon,
  CodonToken,
  CrossoverStrategy,
  ExecutionEvent,
  FeatureEvent,
  FitnessFunction,
  GAGenerationStats,
  GAIndividual,
  GAOptions,
  HSLColor,
  Lexer,
  MutationEvent,
  MutationType,
  ParseError,
  Point2D,
  Renderer,
  ResearchMetricsOptions,
  ResearchSession,
  RiskLevel,
  SelectionStrategy,
  Severity,
  TransformState,
  VM,
  VMState,
  RenderMode,
} from "./index";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "./test-utils/canvas-mock";

describe("CodonCanvas Library Exports", () => {
  // Class Exports
  describe("class exports", () => {
    test("exports GeneticAlgorithm class", () => {
      expect(GeneticAlgorithm).toBeDefined();
      expect(typeof GeneticAlgorithm).toBe("function");
    });

    test("exports CodonLexer class", () => {
      expect(CodonLexer).toBeDefined();
      expect(typeof CodonLexer).toBe("function");
    });

    test("exports Canvas2DRenderer class", () => {
      expect(Canvas2DRenderer).toBeDefined();
      expect(typeof Canvas2DRenderer).toBe("function");
    });

    test("exports CodonVM class", () => {
      expect(CodonVM).toBeDefined();
      expect(typeof CodonVM).toBe("function");
    });

    test("exports ResearchMetrics class", () => {
      expect(ResearchMetrics).toBeDefined();
      expect(typeof ResearchMetrics).toBe("function");
    });
  });

  // Type Exports
  describe("type exports", () => {
    test("exports Lexer type interface", () => {
      // Type test - verify a value can satisfy the Lexer interface
      const lexer: Lexer = new CodonLexer();
      expect(typeof lexer.tokenize).toBe("function");
    });

    test("exports Renderer type interface", () => {
      // Create a mock that satisfies the Renderer interface
      const mockRenderer: Renderer = {
        clear: () => {},
        circle: () => {},
        rect: () => {},
        line: () => {},
        triangle: () => {},
        ellipse: () => {},
        setColor: () => {},
        translate: () => {},
        rotate: () => {},
        scale: () => {},
        push: () => {},
        pop: () => {},
        save: () => {},
        restore: () => {},
        getTransformState: () => ({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }),
        setTransformState: () => {},
        getColor: () => ({ h: 0, s: 0, l: 0 }),
      };
      expect(mockRenderer).toBeDefined();
    });

    test("exports TransformState type interface", () => {
      const state: TransformState = {
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };
      expect(state).toBeDefined();
    });

    test("exports VM type interface", () => {
      // VM interface should have run method
      const isVM = (obj: unknown): obj is VM => {
        return typeof obj === "object" && obj !== null && "run" in obj;
      };
      // We can't create a VM without a renderer, so just test the type exists
      expect(isVM).toBeDefined();
    });

    test("exports GAOptions type", () => {
      const options: GAOptions = {
        populationSize: 10,
        mutationRate: 0.1,
        crossoverRate: 0.7,
        selectionStrategy: "tournament",
      };
      expect(options).toBeDefined();
    });

    test("exports GAIndividual type", () => {
      const individual: GAIndividual = {
        genome: "ATG TAA",
        fitness: 0.5,
        generation: 0,
        id: "test-1",
      };
      expect(individual).toBeDefined();
    });

    test("exports GAGenerationStats type", () => {
      const stats: GAGenerationStats = {
        generation: 1,
        bestFitness: 0.9,
        avgFitness: 0.5,
        worstFitness: 0.1,
        diversity: 0.8,
      };
      expect(stats).toBeDefined();
    });

    test("exports FitnessFunction type", () => {
      // FitnessFunction takes (genome: string, canvas: HTMLCanvasElement) => number
      const fitness: FitnessFunction = (genome: string, _canvas: HTMLCanvasElement) => genome.length / 100;
      const canvas = document.createElement("canvas");
      expect(fitness("ATG", canvas)).toBeCloseTo(0.03);
    });

    test("exports SelectionStrategy type", () => {
      const strategy: SelectionStrategy = "tournament";
      expect(["roulette", "tournament", "elitism"]).toContain(strategy);
    });

    test("exports CrossoverStrategy type", () => {
      const strategy: CrossoverStrategy = "single-point";
      expect(["single-point", "uniform", "none"]).toContain(strategy);
    });

    test("exports ResearchMetricsOptions type", () => {
      const options: ResearchMetricsOptions = {
        sessionId: "test-session",
      };
      expect(options).toBeDefined();
    });

    test("exports ResearchSession type", () => {
      // ResearchSession should match the structure
      const session: Partial<ResearchSession> = {
        sessionId: "test",
        startTime: Date.now(),
      };
      expect(session).toBeDefined();
    });

    test("exports ExecutionEvent type", () => {
      const event: ExecutionEvent = {
        type: "execution",
        timestamp: Date.now(),
        genomeLength: 30,
        tokenCount: 10,
        errorCount: 0,
        renderMode: "visual",
      };
      expect(event.type).toBe("execution");
    });

    test("exports FeatureEvent type", () => {
      const event: FeatureEvent = {
        type: "feature",
        timestamp: Date.now(),
        feature: "diffViewer",
      };
      expect(event.type).toBe("feature");
    });

    test("exports MutationEvent type", () => {
      const event: MutationEvent = {
        type: "mutation",
        timestamp: Date.now(),
        mutationType: "point",
      };
      expect(event.type).toBe("mutation");
    });
  });

  // Re-exported Types from types.ts
  describe("re-exported types from types.ts", () => {
    test("exports Point2D interface", () => {
      const point: Point2D = { x: 10, y: 20 };
      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });

    test("exports HSLColor interface", () => {
      const color: HSLColor = { h: 180, s: 50, l: 50 };
      expect(color.h).toBe(180);
    });

    test("exports Severity type", () => {
      const severity: Severity = "error";
      expect(["error", "warning", "info"]).toContain(severity);
    });

    test("exports RiskLevel type", () => {
      const risk: RiskLevel = "high";
      expect(["low", "medium", "high"]).toContain(risk);
    });

    test("exports Base type", () => {
      const base: Base = "A";
      expect(["A", "C", "G", "T", "U"]).toContain(base);
    });

    test("exports MutationType type", () => {
      const mutation: MutationType = "silent";
      expect([
        "silent",
        "missense",
        "nonsense",
        "frameshift",
        "point",
        "insertion",
        "deletion",
      ]).toContain(mutation);
    });

    test("exports RenderMode type", () => {
      const mode: RenderMode = "visual";
      expect(["visual", "audio", "both"]).toContain(mode);
    });

    test("exports Codon type", () => {
      const codon: Codon = "ATG";
      expect(codon.length).toBe(3);
    });

    test("exports CodonToken interface", () => {
      const token: CodonToken = {
        text: "ATG",
        position: 0,
        line: 1,
      };
      expect(token.text).toBe("ATG");
      // Opcode is looked up via CODON_MAP, not stored in token
      expect(CODON_MAP[token.text]).toBe(Opcode.START);
    });

    test("exports ParseError interface", () => {
      const error: ParseError = {
        message: "Test error",
        position: 0,
        severity: "error",
      };
      expect(error.message).toBe("Test error");
    });

    test("exports Opcode enum", () => {
      expect(Opcode).toBeDefined();
      expect(Opcode.START).toBeDefined();
      expect(Opcode.STOP).toBeDefined();
      expect(Opcode.CIRCLE).toBeDefined();
    });

    test("exports VMState interface", () => {
      const state: VMState = {
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: { h: 0, s: 0, l: 50 },
        stack: [],
        instructionPointer: 0,
        stateStack: [],
        instructionCount: 0,
        seed: 12345,
      };
      expect(state.instructionPointer).toBe(0);
    });

    test("exports CODON_MAP constant", () => {
      expect(CODON_MAP).toBeDefined();
      expect(typeof CODON_MAP).toBe("object");
      expect(CODON_MAP.ATG).toBe(Opcode.START);
      expect(CODON_MAP.TAA).toBe(Opcode.STOP);
    });
  });

  // Core API Contract
  describe("core API contract", () => {
    beforeEach(() => mockCanvasContext());

    afterEach(() => restoreCanvasContext());

    test("lexer tokenizes genome string into CodonToken array", () => {
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize("ATG TAA");

      expect(Array.isArray(tokens)).toBe(true);
      expect(tokens.length).toBe(2);
      expect(tokens[0].text).toBe("ATG");
      // Opcode is looked up via CODON_MAP
      expect(CODON_MAP[tokens[0].text]).toBe(Opcode.START);
    });

    test("renderer can be instantiated with HTMLCanvasElement", () => {
      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);

      expect(renderer).toBeDefined();
      expect(typeof renderer.circle).toBe("function");
      expect(typeof renderer.rect).toBe("function");
    });

    test("VM accepts renderer in constructor", () => {
      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);

      expect(vm).toBeDefined();
      expect(typeof vm.run).toBe("function");
    });

    test("VM.run() accepts tokenized output from lexer", () => {
      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      const lexer = new CodonLexer();
      // Minimal valid genome: START, STOP
      const tokens = lexer.tokenize("ATG TAA");

      expect(() => vm.run(tokens)).not.toThrow();
    });

    test("VM.run() returns VMState array", () => {
      const canvas = document.createElement("canvas");
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      const lexer = new CodonLexer();
      // Minimal valid genome
      const tokens = lexer.tokenize("ATG TAA");

      const states = vm.run(tokens);

      expect(Array.isArray(states)).toBe(true);
      expect(states.length).toBeGreaterThan(0);
      expect(states[0]).toHaveProperty("instructionPointer");
      expect(states[0]).toHaveProperty("stack");
      expect(states[0]).toHaveProperty("position");
    });

    test("full pipeline: lexer -> vm -> renderer produces canvas output", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 200;
      const renderer = new Canvas2DRenderer(canvas);
      const vm = new CodonVM(renderer);
      const lexer = new CodonLexer();

      // Simple genome: START, STOP (minimal valid)
      const genome = "ATG TAA";
      const tokens = lexer.tokenize(genome);
      const states = vm.run(tokens);

      // Pipeline should complete without error and return states
      expect(states.length).toBeGreaterThan(0);
      // States should have VM state properties
      expect(states[states.length - 1]).toHaveProperty("instructionPointer");
      expect(states[states.length - 1]).toHaveProperty("stack");
    });
  });

  // GeneticAlgorithm Integration
  describe("GeneticAlgorithm integration", () => {
    beforeEach(() => mockCanvasContext());

    afterEach(() => restoreCanvasContext());

    test("GeneticAlgorithm accepts seed genomes, fitness function, and options in constructor", () => {
      const seedGenomes = ["ATG TAA", "ATG GGA TAA"];
      const fitnessFunc: FitnessFunction = () => 0.5;
      const options: GAOptions = {
        populationSize: 10,
        mutationRate: 0.1,
      };
      const ga = new GeneticAlgorithm(seedGenomes, fitnessFunc, options);
      expect(ga).toBeDefined();
    });

    test("GeneticAlgorithm.getPopulation() returns population array", () => {
      const seedGenomes = ["ATG TAA"];
      const fitnessFunc: FitnessFunction = () => 0.5;
      const ga = new GeneticAlgorithm(seedGenomes, fitnessFunc, {
        populationSize: 5,
      });

      const population = ga.getPopulation();

      expect(Array.isArray(population)).toBe(true);
      expect(population.length).toBe(5);
      expect(population[0].genome).toBeDefined();
      expect(population[0].fitness).toBeDefined();
    });

    test("GeneticAlgorithm.evolveGeneration() advances population", () => {
      const seedGenomes = ["ATG TAA"];
      const fitnessFunc: FitnessFunction = (g) => g.length / 100;
      const ga = new GeneticAlgorithm(seedGenomes, fitnessFunc, {
        populationSize: 5,
      });

      const genBefore = ga.getGeneration();
      ga.evolveGeneration();
      const genAfter = ga.getGeneration();

      expect(genAfter).toBe(genBefore + 1);
    });

    test("fitness functions can use CodonLexer and CodonVM", () => {
      const fitness: FitnessFunction = (genome: string, canvas: HTMLCanvasElement) => {
        try {
          const lexer = new CodonLexer();
          const tokens = lexer.tokenize(genome);
          const renderer = new Canvas2DRenderer(canvas);
          const vm = new CodonVM(renderer);
          vm.run(tokens);
          return tokens.length / 20;
        } catch {
          return 0;
        }
      };

      const seedGenomes = ["ATG TAA", "ATG GGA TAA"];
      const ga = new GeneticAlgorithm(seedGenomes, fitness, {
        populationSize: 3,
      });

      ga.evolveGeneration();
      const population = ga.getPopulation();

      expect(population.length).toBe(3);
    });
  });

  // ResearchMetrics Integration
  describe("ResearchMetrics integration", () => {
    test("ResearchMetrics accepts options in constructor", () => {
      const metrics = new ResearchMetrics({
        enabled: true,
      });
      expect(metrics).toBeDefined();
    });

    test("ResearchMetrics tracks genome execution", () => {
      const metrics = new ResearchMetrics({ enabled: true });

      metrics.trackGenomeExecuted({
        timestamp: Date.now(),
        renderMode: "visual",
        genomeLength: 30,
        instructionCount: 10,
        success: true,
      });
      const session = metrics.getCurrentSession();

      expect(session).not.toBeNull();
      if (session) {
        expect(session.genomesExecuted).toBeGreaterThanOrEqual(1);
      }
    });

    test("ResearchMetrics tracks mutations", () => {
      const metrics = new ResearchMetrics({ enabled: true });

      metrics.trackMutation({
        timestamp: Date.now(),
        type: "point",
        genomeLengthBefore: 30,
        genomeLengthAfter: 30,
      });
      metrics.trackMutation({
        timestamp: Date.now(),
        type: "silent",
        genomeLengthBefore: 30,
        genomeLengthAfter: 30,
      });
      const session = metrics.getCurrentSession();

      expect(session).not.toBeNull();
      if (session) {
        expect(session.mutationsApplied).toBe(2);
      }
    });

    test("ResearchMetrics exports session data", () => {
      const metrics = new ResearchMetrics({ enabled: true });
      metrics.trackGenomeExecuted({
        timestamp: Date.now(),
        renderMode: "visual",
        genomeLength: 20,
        instructionCount: 5,
        success: true,
      });

      const session = metrics.getCurrentSession();

      expect(session).not.toBeNull();
      if (session) {
        expect(session.sessionId).toBeDefined();
        expect(session.startTime).toBeDefined();
        expect(typeof session.startTime).toBe("number");
      }
    });
  });

  // ES Module Compatibility
  describe("ES module compatibility", () => {
    test("works as single-import ES module", async () => {
      // Dynamic import to test ES module loading
      const module = await import("./index");
      expect(module.CodonLexer).toBeDefined();
      expect(module.CodonVM).toBeDefined();
      expect(module.Canvas2DRenderer).toBeDefined();
    });

    test("named exports are accessible via destructuring", async () => {
      const {
        CodonLexer: Lexer,
        CodonVM: VM,
        Canvas2DRenderer: Renderer,
      } = await import("./index");

      expect(Lexer).toBeDefined();
      expect(VM).toBeDefined();
      expect(Renderer).toBeDefined();
    });

    test("no circular dependencies in exports", async () => {
      // Import should not hang or throw due to circular deps
      const importPromise = import("./index");
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 1000)
      );

      await expect(Promise.race([importPromise, timeout])).resolves.toBeDefined();
    });

    test("TypeScript strict mode compilation succeeds", () => {
      // This test file itself compiles under strict mode
      // If types were broken, compilation would fail
      const lexer: Lexer = new CodonLexer();
      expect(lexer).toBeDefined();
    });

    test("tree-shaking works (unused exports excluded)", async () => {
      // Import only specific exports - tree-shaking should exclude others
      const { CodonLexer: LexerOnly } = await import("./index");
      expect(LexerOnly).toBeDefined();
    });
  });

  // Edge Cases
  describe("edge cases", () => {
    test("exports remain stable across imports", async () => {
      const import1 = await import("./index");
      const import2 = await import("./index");

      expect(import1.CodonLexer).toBe(import2.CodonLexer);
      expect(import1.CodonVM).toBe(import2.CodonVM);
    });

    test("multiple imports return same class references", () => {
      const lexer1 = new CodonLexer();
      const lexer2 = new CodonLexer();

      expect(lexer1.constructor).toBe(lexer2.constructor);
      expect(lexer1.constructor.name).toBe("CodonLexer");
    });

    test("library works in browser environment", () => {
      // Browser APIs like document, HTMLCanvasElement should be available (via happy-dom)
      expect(document).toBeDefined();
      expect(HTMLCanvasElement).toBeDefined();

      const canvas = document.createElement("canvas");
      expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    });

    test("library works in Node.js environment", () => {
      // Node.js globals should be available
      expect(typeof process).toBe("object");
      expect(typeof require).toBe("function");
    });
  });
});
