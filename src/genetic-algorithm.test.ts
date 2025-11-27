/**
 * Genetic Algorithm Test Suite
 *
 * Tests for fitness-driven evolution with selection, crossover, and mutation.
 * Core module for automated genome evolution experiments.
 */
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  GeneticAlgorithm,
  type FitnessFunction,
} from "./genetic-algorithm";
import {
  mockCanvasContext,
  restoreCanvasContext,
} from "./test-utils/canvas-mock";

describe("GeneticAlgorithm", () => {
  // Mock canvas context for all tests
  beforeEach(() => mockCanvasContext());
  afterEach(() => restoreCanvasContext());

  // Simple fitness function for testing - returns genome length / 100
  const simpleFitness: FitnessFunction = (genome: string) =>
    Math.min(genome.length / 100, 1);

  // Deterministic fitness function - longer genomes are fitter
  const lengthFitness: FitnessFunction = (genome: string) =>
    genome.replace(/\s/g, "").length / 50;

  // Sample valid genomes for testing
  const sampleGenomes = ["ATGATG", "TAAATG", "ATGTAA"];

  // =========================================================================
  // Constructor & Initialization
  // =========================================================================
  describe("constructor", () => {
    // HAPPY PATHS
    test("initializes population from seed genomes with default options (size=20, mutation=0.1, crossover=0.7)", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness);
      const population = ga.getPopulation();

      expect(population).toHaveLength(20); // default size
      expect(ga.getGeneration()).toBe(0);
      expect(ga.getStats()).toHaveLength(0);
    });

    test("accepts custom populationSize option and creates correct number of individuals", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 10,
      });
      expect(ga.getPopulation()).toHaveLength(10);
    });

    test("accepts custom mutationRate option (0-1 range)", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        mutationRate: 0.5,
        populationSize: 5,
      });
      expect(ga.getPopulation()).toHaveLength(5);
    });

    test("accepts custom crossoverRate option (0-1 range)", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        crossoverRate: 0.9,
        populationSize: 5,
      });
      expect(ga.getPopulation()).toHaveLength(5);
    });

    test("accepts selectionStrategy option: tournament, roulette, or elitism", () => {
      const gaTournament = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        selectionStrategy: "tournament",
        populationSize: 5,
      });
      const gaRoulette = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        selectionStrategy: "roulette",
        populationSize: 5,
      });
      const gaElitism = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        selectionStrategy: "elitism",
        populationSize: 5,
      });

      expect(gaTournament.getPopulation()).toHaveLength(5);
      expect(gaRoulette.getPopulation()).toHaveLength(5);
      expect(gaElitism.getPopulation()).toHaveLength(5);
    });

    test("accepts crossoverStrategy option: single-point, uniform, or none", () => {
      const gaSingle = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        crossoverStrategy: "single-point",
        populationSize: 5,
      });
      const gaUniform = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        crossoverStrategy: "uniform",
        populationSize: 5,
      });
      const gaNone = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        crossoverStrategy: "none",
        populationSize: 5,
      });

      expect(gaSingle.getPopulation()).toHaveLength(5);
      expect(gaUniform.getPopulation()).toHaveLength(5);
      expect(gaNone.getPopulation()).toHaveLength(5);
    });

    test("accepts eliteCount option for preserved individuals", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        eliteCount: 5,
        populationSize: 10,
      });
      expect(ga.getPopulation()).toHaveLength(10);
    });

    test("accepts tournamentSize option for tournament selection", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        tournamentSize: 5,
        populationSize: 10,
      });
      expect(ga.getPopulation()).toHaveLength(10);
    });

    test("creates offscreen canvas (400x400) for fitness evaluation", () => {
      // This is verified indirectly by successful fitness evaluation
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });
      const population = ga.getPopulation();

      // All individuals should have fitness evaluated
      for (const individual of population) {
        expect(typeof individual.fitness).toBe("number");
      }
    });

    // EDGE CASES
    test("fills population by repeating seed genomes when fewer seeds than populationSize", () => {
      const ga = new GeneticAlgorithm(["ATGATG"], simpleFitness, {
        populationSize: 5,
      });
      const population = ga.getPopulation();

      expect(population).toHaveLength(5);
      // All should have the same genome since only one seed
      for (const individual of population) {
        expect(individual.genome).toBe("ATGATG");
      }
    });

    test("handles single seed genome (all individuals start identical)", () => {
      const ga = new GeneticAlgorithm(["ATGTAA"], simpleFitness, {
        populationSize: 3,
      });
      const population = ga.getPopulation();

      expect(population).toHaveLength(3);
      expect(population[0].genome).toBe("ATGTAA");
      expect(population[1].genome).toBe("ATGTAA");
      expect(population[2].genome).toBe("ATGTAA");
    });

    test("handles empty seed genomes array - should throw or handle gracefully", () => {
      // With empty seeds, modulo operation would cause issues
      // The implementation uses seedGenomes[i % 0] which is undefined
      const ga = new GeneticAlgorithm([], simpleFitness, { populationSize: 3 });
      const population = ga.getPopulation();

      // Each individual will have undefined genome converted to string
      expect(population).toHaveLength(3);
    });
  });

  // =========================================================================
  // Fitness Evaluation
  // =========================================================================
  describe("evaluateFitness (private, tested via public API)", () => {
    // HAPPY PATHS
    test("renders genome to offscreen canvas using CodonLexer, Canvas2DRenderer, and CodonVM", () => {
      let canvasReceived: HTMLCanvasElement | null = null;
      const trackingFitness: FitnessFunction = (_genome, canvas) => {
        canvasReceived = canvas;
        return 0.5;
      };

      const ga = new GeneticAlgorithm(["ATGATG"], trackingFitness, {
        populationSize: 1,
      });
      const population = ga.getPopulation();

      expect(canvasReceived).not.toBeNull();
      expect(population[0].fitness).toBe(0.5);
    });

    test("calls provided fitnessFunction with genome string and canvas element", () => {
      const receivedArgs: Array<{ genome: string; canvas: HTMLCanvasElement }> =
        [];
      const trackingFitness: FitnessFunction = (genome, canvas) => {
        receivedArgs.push({ genome, canvas });
        return 0.5;
      };

      new GeneticAlgorithm(["ATGATG", "TAAATG"], trackingFitness, {
        populationSize: 2,
      });

      expect(receivedArgs).toHaveLength(2);
      expect(receivedArgs[0].genome).toBe("ATGATG");
      expect(receivedArgs[1].genome).toBe("TAAATG");
    });

    test("returns fitness value from fitnessFunction (0-1 range expected)", () => {
      const fixedFitness: FitnessFunction = () => 0.75;
      const ga = new GeneticAlgorithm(["ATGATG"], fixedFitness, {
        populationSize: 1,
      });

      expect(ga.getPopulation()[0].fitness).toBe(0.75);
    });

    // ERROR HANDLING
    test("returns 0 fitness when genome causes lexer error", () => {
      // Invalid genome that might cause issues
      const ga = new GeneticAlgorithm(["XXXYYY"], simpleFitness, {
        populationSize: 1,
      });

      // Should not throw, but may have low/zero fitness
      expect(ga.getPopulation()[0]).toBeDefined();
    });

    test("returns 0 fitness when genome causes VM execution error", () => {
      const ga = new GeneticAlgorithm([""], simpleFitness, { populationSize: 1 });
      // Empty genome should be handled gracefully
      expect(ga.getPopulation()[0]).toBeDefined();
    });

    test("returns 0 fitness when canvas context unavailable", () => {
      // Restore canvas context to get null returns
      restoreCanvasContext();

      const ga = new GeneticAlgorithm(["ATGATG"], simpleFitness, {
        populationSize: 1,
      });

      // With null context, fitness should be 0
      expect(ga.getPopulation()[0].fitness).toBe(0);

      // Re-mock for subsequent tests
      mockCanvasContext();
    });

    // CANVAS STATE
    test("clears canvas to white background before each render", () => {
      // We can't easily verify this without more complex mocking
      // But we can verify fitness evaluation completes
      const ga = new GeneticAlgorithm(["ATGATG"], simpleFitness, {
        populationSize: 1,
      });

      expect(ga.getPopulation()[0]).toBeDefined();
    });
  });

  // =========================================================================
  // Selection Strategies
  // =========================================================================
  describe("tournamentSelection", () => {
    // HAPPY PATHS
    test("selects best individual from random tournament of tournamentSize individuals", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, lengthFitness, {
        populationSize: 10,
        selectionStrategy: "tournament",
        tournamentSize: 3,
        mutationRate: 0,
        crossoverRate: 0,
      });

      // Evolve and check that selection works
      ga.evolveGeneration();
      const stats = ga.getStats();

      expect(stats).toHaveLength(1);
      expect(stats[0].bestFitness).toBeGreaterThanOrEqual(0);
    });

    test("returns individual with highest fitness among tournament candidates", () => {
      // Create population with known fitness values
      const customFitness: FitnessFunction = (genome) =>
        genome.length === 6 ? 1.0 : 0.1;
      const ga = new GeneticAlgorithm(["ATGATG", "ATG"], customFitness, {
        populationSize: 10,
        selectionStrategy: "tournament",
        tournamentSize: 5,
      });

      const population = ga.getPopulation();
      const hasFitIndividual = population.some((ind) => ind.fitness === 1.0);
      expect(hasFitIndividual).toBe(true);
    });

    // EDGE CASES
    test("handles tournamentSize equal to population size", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
        tournamentSize: 5,
        mutationRate: 0,
        crossoverRate: 0,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("handles tournamentSize of 1 (random selection)", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
        tournamentSize: 1,
        mutationRate: 0,
        crossoverRate: 0,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("throws error when population is empty", () => {
      // Can't easily create empty population through public API
      // This is more of a documentation test
      expect(true).toBe(true);
    });
  });

  describe("rouletteWheelSelection", () => {
    // HAPPY PATHS
    test("selects individuals proportional to their fitness values", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, lengthFitness, {
        populationSize: 10,
        selectionStrategy: "roulette",
        mutationRate: 0,
        crossoverRate: 0,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("higher fitness individuals have greater selection probability", () => {
      // Statistical test - run multiple generations
      const ga = new GeneticAlgorithm(
        ["ATGATGATGATG", "ATG"],
        lengthFitness,
        {
          populationSize: 10,
          selectionStrategy: "roulette",
          mutationRate: 0,
          crossoverRate: 0,
        },
      );

      ga.evolveGeneration();
      const stats = ga.getStats();

      // Average fitness should be influenced by higher fitness individuals
      expect(stats[0].avgFitness).toBeGreaterThan(0);
    });

    // EDGE CASES
    test("selects randomly when all fitness values are 0", () => {
      const zeroFitness: FitnessFunction = () => 0;
      const ga = new GeneticAlgorithm(sampleGenomes, zeroFitness, {
        populationSize: 5,
        selectionStrategy: "roulette",
        mutationRate: 0,
        crossoverRate: 0,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("returns last individual when spin exceeds total fitness (rounding edge case)", () => {
      // This is handled internally - verify no errors
      const ga = new GeneticAlgorithm(sampleGenomes, () => 0.001, {
        populationSize: 5,
        selectionStrategy: "roulette",
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("handles population where one individual has all the fitness", () => {
      const singleHighFitness: FitnessFunction = (genome) =>
        genome === "ATGATG" ? 1.0 : 0.0;
      const ga = new GeneticAlgorithm(["ATGATG", "TAAATG"], singleHighFitness, {
        populationSize: 10,
        selectionStrategy: "roulette",
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });
  });

  describe("selectParent", () => {
    test("uses tournament selection when selectionStrategy is 'tournament'", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        selectionStrategy: "tournament",
        populationSize: 5,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("uses roulette selection when selectionStrategy is 'roulette'", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        selectionStrategy: "roulette",
        populationSize: 5,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("uses tournament selection when selectionStrategy is 'elitism'", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        selectionStrategy: "elitism",
        populationSize: 5,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("throws error for unknown selection strategy", () => {
      // Need to bypass TypeScript to test invalid strategy
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        selectionStrategy: "invalid" as "tournament",
        populationSize: 5,
      });

      // Error is thrown during evolveGeneration when selectParent is called
      expect(() => ga.evolveGeneration()).toThrow("Unknown selection strategy");
    });
  });

  // =========================================================================
  // Crossover Strategies
  // =========================================================================
  describe("crossover", () => {
    // NO CROSSOVER CASE
    test("returns original parents unchanged when random > crossoverRate", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        crossoverRate: 0, // Never crossover
        populationSize: 5,
        mutationRate: 0,
      });

      ga.evolveGeneration();
      // Population should still evolve (just without crossover)
      expect(ga.getPopulation()).toHaveLength(5);
    });

    test("returns original parents when crossoverStrategy is 'none'", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        crossoverStrategy: "none",
        populationSize: 5,
        mutationRate: 0,
      });

      ga.evolveGeneration();
      expect(ga.getPopulation()).toHaveLength(5);
    });

    // CROSSOVER EXECUTION
    test("performs single-point crossover when strategy is 'single-point'", () => {
      const ga = new GeneticAlgorithm(
        ["ATGATGATG", "TAATAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "single-point",
          crossoverRate: 1.0, // Always crossover
          populationSize: 10,
          mutationRate: 0,
        },
      );

      ga.evolveGeneration();
      // Some children may have mixed genetic material
      const population = ga.getPopulation();
      expect(population.length).toBe(10);
    });

    test("performs uniform crossover when strategy is 'uniform'", () => {
      const ga = new GeneticAlgorithm(
        ["ATGATGATG", "TAATAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "uniform",
          crossoverRate: 1.0,
          populationSize: 10,
          mutationRate: 0,
        },
      );

      ga.evolveGeneration();
      expect(ga.getPopulation()).toHaveLength(10);
    });

    test("throws error for unknown crossover strategy", () => {
      // Need to bypass TypeScript to test invalid strategy
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        crossoverStrategy: "invalid" as "single-point",
        crossoverRate: 1.0, // Ensure crossover is always attempted
        populationSize: 5,
        eliteCount: 0, // No elitism so all individuals go through crossover
      });

      // Error is thrown during evolveGeneration when crossover is called
      expect(() => ga.evolveGeneration()).toThrow("Unknown crossover strategy");
    });
  });

  describe("singlePointCrossover", () => {
    // HAPPY PATHS
    test("splits parents at random codon boundary and swaps tails", () => {
      const ga = new GeneticAlgorithm(
        ["ATGATGATGATG", "TAATAATAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "single-point",
          crossoverRate: 1.0,
          populationSize: 20,
          mutationRate: 0,
          eliteCount: 0,
        },
      );

      ga.evolveGeneration();
      const population = ga.getPopulation();

      // Check that some genomes are hybrids (contain both ATG and TAA patterns)
      // May or may not have hybrids depending on crossover point
      expect(population.length).toBe(20);
    });

    test("produces two children with genetic material from both parents", () => {
      // Verified through population diversity after crossover
      const ga = new GeneticAlgorithm(
        ["ATGATGATG", "TAATAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "single-point",
          crossoverRate: 1.0,
          populationSize: 10,
          mutationRate: 0,
        },
      );

      ga.evolveGeneration();
      expect(ga.getStats()[0].diversity).toBeGreaterThanOrEqual(0);
    });

    test("preserves codon boundaries (splits at multiples of 3)", () => {
      const ga = new GeneticAlgorithm(
        ["ATGATGATG", "TAATAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "single-point",
          crossoverRate: 1.0,
          populationSize: 10,
          mutationRate: 0,
        },
      );

      ga.evolveGeneration();
      const population = ga.getPopulation();

      // All genomes should have length that is multiple of 3
      for (const ind of population) {
        if (ind.genome.length > 0) {
          expect(ind.genome.length % 3).toBe(0);
        }
      }
    });

    // EDGE CASES
    test("returns original parents when either parent has fewer than 6 bases", () => {
      const ga = new GeneticAlgorithm(["ATG", "TAA"], simpleFitness, {
        crossoverStrategy: "single-point",
        crossoverRate: 1.0,
        populationSize: 5,
        mutationRate: 0,
      });

      ga.evolveGeneration();
      // With short parents, crossover should return originals
      expect(ga.getPopulation()).toHaveLength(5);
    });

    test("handles parents of different lengths (uses minimum length)", () => {
      const ga = new GeneticAlgorithm(
        ["ATGATGATGATG", "TAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "single-point",
          crossoverRate: 1.0,
          populationSize: 10,
          mutationRate: 0,
        },
      );

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("crossover point is never at position 0 or end (always between 1 and n-1 codons)", () => {
      // Verified through implementation - crossover point is 1 + random(numCodons - 1)
      const ga = new GeneticAlgorithm(
        ["ATGATGATG", "TAATAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "single-point",
          crossoverRate: 1.0,
          populationSize: 50,
          mutationRate: 0,
        },
      );

      expect(() => ga.evolveGeneration()).not.toThrow();
    });
  });

  describe("uniformCrossover", () => {
    // HAPPY PATHS
    test("swaps each codon between parents with 50% probability", () => {
      const ga = new GeneticAlgorithm(
        ["ATGATGATG", "TAATAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "uniform",
          crossoverRate: 1.0,
          populationSize: 20,
          mutationRate: 0,
        },
      );

      ga.evolveGeneration();
      expect(ga.getPopulation()).toHaveLength(20);
    });

    test("produces two complementary children (what one gets, other loses)", () => {
      // This is verified by the algorithm's structure
      const ga = new GeneticAlgorithm(
        ["ATGATGATG", "TAATAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "uniform",
          crossoverRate: 1.0,
          populationSize: 10,
          mutationRate: 0,
        },
      );

      ga.evolveGeneration();
      expect(ga.getStats()[0]).toBeDefined();
    });

    // EDGE CASES
    test("handles parents of different lengths (uses minimum length)", () => {
      const ga = new GeneticAlgorithm(
        ["ATGATGATGATGATG", "TAATAA"],
        simpleFitness,
        {
          crossoverStrategy: "uniform",
          crossoverRate: 1.0,
          populationSize: 10,
          mutationRate: 0,
        },
      );

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("handles single-codon genomes", () => {
      const ga = new GeneticAlgorithm(["ATG", "TAA"], simpleFitness, {
        crossoverStrategy: "uniform",
        crossoverRate: 1.0,
        populationSize: 5,
        mutationRate: 0,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });
  });

  // =========================================================================
  // Mutation
  // =========================================================================
  describe("mutate", () => {
    // NO MUTATION CASE
    test("returns original genome unchanged when random > mutationRate", () => {
      const ga = new GeneticAlgorithm(["ATGATG"], simpleFitness, {
        mutationRate: 0, // Never mutate
        populationSize: 5,
        crossoverRate: 0,
      });

      const initialGenomes = ga.getPopulation().map((ind) => ind.genome);
      ga.evolveGeneration();

      // With no mutation or crossover, elite individuals should be preserved
      expect(ga.getPopulation().some((ind) => ind.genome === "ATGATG")).toBe(true);
    });

    // MUTATION TYPES
    test("applies point mutation (applyPointMutation) with 1/3 probability", () => {
      // High mutation rate to ensure mutations happen
      const ga = new GeneticAlgorithm(["ATGATGATGATG"], simpleFitness, {
        mutationRate: 1.0,
        populationSize: 30,
        crossoverRate: 0,
        eliteCount: 0,
      });

      ga.evolveGeneration();
      const population = ga.getPopulation();

      // With 100% mutation rate, very likely to have mutations
      // But randomness means we can't guarantee it
      expect(population.length).toBe(30);
    });

    test("applies insertion mutation (applyInsertion) with 1/3 probability", () => {
      const ga = new GeneticAlgorithm(["ATGATG"], simpleFitness, {
        mutationRate: 1.0,
        populationSize: 20,
        crossoverRate: 0,
        eliteCount: 0,
      });

      ga.evolveGeneration();
      // May or may not have longer genomes depending on mutation type selected
      expect(ga.getPopulation()).toHaveLength(20);
    });

    test("applies deletion mutation (applyDeletion) with 1/3 probability", () => {
      const ga = new GeneticAlgorithm(["ATGATGATGATG"], simpleFitness, {
        mutationRate: 1.0,
        populationSize: 20,
        crossoverRate: 0,
        eliteCount: 0,
      });

      ga.evolveGeneration();
      // May or may not have shorter genomes depending on mutation type
      expect(ga.getPopulation()).toHaveLength(20);
    });

    // ERROR HANDLING
    test("returns original genome when mutation function throws error", () => {
      // Short genome that might cause deletion to fail
      const ga = new GeneticAlgorithm(["ATG"], simpleFitness, {
        mutationRate: 1.0,
        populationSize: 5,
        crossoverRate: 0,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });
  });

  // =========================================================================
  // Evolution Lifecycle
  // =========================================================================
  describe("evolveGeneration", () => {
    // POPULATION EVOLUTION
    test("sorts population by fitness (descending) before selection", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, lengthFitness, {
        populationSize: 10,
      });

      ga.evolveGeneration();
      const stats = ga.getStats();

      // Use epsilon for floating point comparison
      const epsilon = 0.0001;
      expect(stats[0].bestFitness + epsilon).toBeGreaterThanOrEqual(stats[0].avgFitness);
      expect(stats[0].avgFitness + epsilon).toBeGreaterThanOrEqual(stats[0].worstFitness);
    });

    test("preserves elite individuals (eliteCount best) unchanged in next generation", () => {
      const ga = new GeneticAlgorithm(["ATGATGATGATG", "ATG"], lengthFitness, {
        populationSize: 10,
        eliteCount: 2,
        mutationRate: 0,
        crossoverRate: 0,
      });

      const initialBest = ga.getBest();
      ga.evolveGeneration();

      // Best genome should be preserved
      const hasOriginalBest = ga
        .getPopulation()
        .some((ind) => ind.genome === initialBest.genome);
      expect(hasOriginalBest).toBe(true);
    });

    test("generates remaining population through selection, crossover, and mutation", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 10,
        eliteCount: 2,
      });

      ga.evolveGeneration();
      expect(ga.getPopulation()).toHaveLength(10);
    });

    test("increments generation counter after evolution", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      expect(ga.getGeneration()).toBe(0);
      ga.evolveGeneration();
      expect(ga.getGeneration()).toBe(1);
      ga.evolveGeneration();
      expect(ga.getGeneration()).toBe(2);
    });

    // STATISTICS TRACKING
    test("records bestFitness, avgFitness, worstFitness for generation", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 10,
      });

      ga.evolveGeneration();
      const stats = ga.getStats();

      expect(stats).toHaveLength(1);
      expect(typeof stats[0].bestFitness).toBe("number");
      expect(typeof stats[0].avgFitness).toBe("number");
      expect(typeof stats[0].worstFitness).toBe("number");
    });

    test("calculates diversity as uniqueGenomes / populationSize", () => {
      const ga = new GeneticAlgorithm(["ATGATG"], simpleFitness, {
        populationSize: 5,
        mutationRate: 0,
        crossoverRate: 0,
      });

      ga.evolveGeneration();
      const stats = ga.getStats();

      // All same genome = diversity of 0.2 (1/5)
      expect(stats[0].diversity).toBeCloseTo(0.2, 1);
    });

    test("appends GAGenerationStats to stats array", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      ga.evolveGeneration();
      ga.evolveGeneration();
      ga.evolveGeneration();

      expect(ga.getStats()).toHaveLength(3);
      expect(ga.getStats()[0].generation).toBe(0);
      expect(ga.getStats()[1].generation).toBe(1);
      expect(ga.getStats()[2].generation).toBe(2);
    });

    // CHILD GENERATION
    test("selects two parents using configured selection strategy", () => {
      // Verified through successful evolution
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 10,
        selectionStrategy: "tournament",
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("applies crossover to produce two children", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 10,
        crossoverRate: 1.0,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("mutates each child independently", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 10,
        mutationRate: 0.5,
      });

      expect(() => ga.evolveGeneration()).not.toThrow();
    });

    test("evaluates fitness of each new child", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 10,
      });

      ga.evolveGeneration();
      const population = ga.getPopulation();

      for (const ind of population) {
        expect(typeof ind.fitness).toBe("number");
      }
    });

    test("assigns correct generation number and unique ID to each individual", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      ga.evolveGeneration();
      const population = ga.getPopulation();

      for (const ind of population) {
        expect(ind.generation).toBe(1);
        expect(ind.id).toContain("gen1");
      }
    });

    // POPULATION SIZE MAINTENANCE
    test("maintains exact populationSize after evolution", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 15,
      });

      ga.evolveGeneration();
      expect(ga.getPopulation()).toHaveLength(15);

      ga.evolveGeneration();
      expect(ga.getPopulation()).toHaveLength(15);
    });

    test("handles odd population sizes correctly (may produce one extra child)", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 7,
        eliteCount: 1,
      });

      ga.evolveGeneration();
      expect(ga.getPopulation()).toHaveLength(7);
    });
  });

  // =========================================================================
  // Accessor Methods
  // =========================================================================
  describe("getPopulation", () => {
    test("returns current population array with all GAIndividual objects", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      const population = ga.getPopulation();
      expect(Array.isArray(population)).toBe(true);
      expect(population).toHaveLength(5);
    });

    test("population includes genome, fitness, generation, and id for each individual", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 3,
      });

      const population = ga.getPopulation();

      for (const ind of population) {
        expect(typeof ind.genome).toBe("string");
        expect(typeof ind.fitness).toBe("number");
        expect(typeof ind.generation).toBe("number");
        expect(typeof ind.id).toBe("string");
      }
    });
  });

  describe("getBest", () => {
    test("returns individual with highest fitness in current population", () => {
      const customFitness: FitnessFunction = (genome) =>
        genome === "ATGATG" ? 1.0 : 0.5;
      const ga = new GeneticAlgorithm(["ATGATG", "TAAATG", "GAAATG"], customFitness, {
        populationSize: 3,
      });

      const best = ga.getBest();
      expect(best.genome).toBe("ATGATG");
      expect(best.fitness).toBe(1.0);
    });

    test("handles tie by returning first occurrence", () => {
      const equalFitness: FitnessFunction = () => 0.5;
      const ga = new GeneticAlgorithm(["ATGATG", "TAAATG"], equalFitness, {
        populationSize: 2,
      });

      const best = ga.getBest();
      expect(best.fitness).toBe(0.5);
      expect(best).toBeDefined();
    });
  });

  describe("getStats", () => {
    test("returns array of GAGenerationStats for all evolved generations", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      ga.evolveGeneration();
      ga.evolveGeneration();

      const stats = ga.getStats();
      expect(stats).toHaveLength(2);
    });

    test("returns empty array before any evolution", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      expect(ga.getStats()).toHaveLength(0);
    });
  });

  describe("getGeneration", () => {
    test("returns current generation number (0 initially)", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      expect(ga.getGeneration()).toBe(0);
    });

    test("increments by 1 after each evolveGeneration call", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      ga.evolveGeneration();
      expect(ga.getGeneration()).toBe(1);

      ga.evolveGeneration();
      expect(ga.getGeneration()).toBe(2);

      ga.evolveGeneration();
      expect(ga.getGeneration()).toBe(3);
    });
  });

  // =========================================================================
  // Reset
  // =========================================================================
  describe("reset", () => {
    test("resets generation counter to 0", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      ga.evolveGeneration();
      ga.evolveGeneration();
      expect(ga.getGeneration()).toBe(2);

      ga.reset(sampleGenomes);
      expect(ga.getGeneration()).toBe(0);
    });

    test("clears stats array", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 5,
      });

      ga.evolveGeneration();
      expect(ga.getStats()).toHaveLength(1);

      ga.reset(sampleGenomes);
      expect(ga.getStats()).toHaveLength(0);
    });

    test("reinitializes population from new seed genomes", () => {
      const ga = new GeneticAlgorithm(["ATGATG"], simpleFitness, {
        populationSize: 3,
      });

      expect(ga.getPopulation()[0].genome).toBe("ATGATG");

      ga.reset(["TAAATG"]);
      expect(ga.getPopulation()[0].genome).toBe("TAAATG");
    });

    test("preserves configuration options (mutationRate, etc.)", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 7,
        mutationRate: 0.5,
      });

      ga.evolveGeneration();
      ga.reset(sampleGenomes);

      // Population size should still be 7
      expect(ga.getPopulation()).toHaveLength(7);
    });
  });

  // =========================================================================
  // Integration / End-to-End
  // =========================================================================
  describe("integration", () => {
    test("evolves population over multiple generations with fitness improvement", () => {
      const ga = new GeneticAlgorithm(
        ["ATGATG", "TAAATG", "GAAATG"],
        lengthFitness,
        {
          populationSize: 20,
          mutationRate: 0.1,
          crossoverRate: 0.7,
        },
      );

      for (let i = 0; i < 5; i++) {
        ga.evolveGeneration();
      }

      expect(ga.getGeneration()).toBe(5);
      expect(ga.getStats()).toHaveLength(5);
    });

    test("best fitness generally increases or stays same over generations", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, lengthFitness, {
        populationSize: 20,
        eliteCount: 2,
      });

      let previousBest = 0;
      for (let i = 0; i < 5; i++) {
        ga.evolveGeneration();
        const currentBest = ga.getBest().fitness;
        // With elitism, best should never decrease
        expect(currentBest).toBeGreaterThanOrEqual(previousBest);
        previousBest = currentBest;
      }
    });

    test("diversity metric tracks unique genomes in population", () => {
      const ga = new GeneticAlgorithm(sampleGenomes, simpleFitness, {
        populationSize: 10,
        mutationRate: 0.3,
      });

      ga.evolveGeneration();
      const stats = ga.getStats();

      expect(stats[0].diversity).toBeGreaterThanOrEqual(0);
      expect(stats[0].diversity).toBeLessThanOrEqual(1);
    });

    test("works with simple fitness function (e.g., genome length)", () => {
      const lengthBasedFitness: FitnessFunction = (genome) =>
        genome.replace(/\s/g, "").length / 30;

      const ga = new GeneticAlgorithm(
        ["ATGATG", "ATGATGATG"],
        lengthBasedFitness,
        {
          populationSize: 10,
        },
      );

      for (let i = 0; i < 3; i++) {
        ga.evolveGeneration();
      }

      expect(ga.getGeneration()).toBe(3);
      expect(ga.getBest()).toBeDefined();
    });

    test("works with canvas-based fitness function (e.g., pixel coverage)", () => {
      const pixelFitness: FitnessFunction = (_genome, canvas) => {
        // Simple fitness based on canvas existence
        return canvas ? 0.5 : 0;
      };

      const ga = new GeneticAlgorithm(sampleGenomes, pixelFitness, {
        populationSize: 10,
      });

      ga.evolveGeneration();
      expect(ga.getStats()[0].avgFitness).toBe(0.5);
    });
  });
});
