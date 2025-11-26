/**
 * Genetic Algorithm Engine for CodonCanvas
 * Implements automated fitness-driven evolution with selection, crossover, mutation
 */

import { CodonLexer } from "./lexer.js";
import {
  applyDeletion,
  applyInsertion,
  applyPointMutation,
  type MutationResult,
} from "./mutations.js";
import { Canvas2DRenderer } from "./renderer.js";
import { CodonVM } from "./vm.js";

export interface GAIndividual {
  /** Genome string */
  genome: string;
  /** Fitness score (0-1, higher = better) */
  fitness: number;
  /** Generation number */
  generation: number;
  /** Unique identifier */
  id: string;
}

export interface GAGenerationStats {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  worstFitness: number;
  diversity: number; // unique genomes / population size
}

export type SelectionStrategy = "tournament" | "roulette" | "elitism";
export type CrossoverStrategy = "single-point" | "uniform" | "none";

export interface GAOptions {
  /** Population size (default: 20) */
  populationSize?: number;
  /** Mutation rate 0-1 (default: 0.1) */
  mutationRate?: number;
  /** Crossover rate 0-1 (default: 0.7) */
  crossoverRate?: number;
  /** Selection strategy */
  selectionStrategy?: SelectionStrategy;
  /** Crossover strategy */
  crossoverStrategy?: CrossoverStrategy;
  /** Elite individuals to preserve (default: 2) */
  eliteCount?: number;
  /** Tournament size for tournament selection (default: 3) */
  tournamentSize?: number;
}

export type FitnessFunction = (
  genome: string,
  canvas: HTMLCanvasElement,
) => number;

/**
 * Genetic Algorithm Engine
 * Automates evolution using fitness functions, selection, crossover, mutation
 */
export class GeneticAlgorithm {
  private populationSize: number;
  private mutationRate: number;
  private crossoverRate: number;
  private selectionStrategy: SelectionStrategy;
  private crossoverStrategy: CrossoverStrategy;
  private eliteCount: number;
  private tournamentSize: number;

  private population: GAIndividual[];
  private generation: number;
  private stats: GAGenerationStats[];
  private fitnessFunction: FitnessFunction;

  private lexer: CodonLexer;
  private offscreenCanvas: HTMLCanvasElement;

  constructor(
    initialGenomes: string[],
    fitnessFunction: FitnessFunction,
    options: GAOptions = {},
  ) {
    this.populationSize = options.populationSize ?? 20;
    this.mutationRate = options.mutationRate ?? 0.1;
    this.crossoverRate = options.crossoverRate ?? 0.7;
    this.selectionStrategy = options.selectionStrategy ?? "tournament";
    this.crossoverStrategy = options.crossoverStrategy ?? "single-point";
    this.eliteCount = options.eliteCount ?? 2;
    this.tournamentSize = options.tournamentSize ?? 3;

    this.generation = 0;
    this.stats = [];
    this.fitnessFunction = fitnessFunction;
    this.lexer = new CodonLexer();

    // Create offscreen canvas for fitness evaluation
    this.offscreenCanvas = document.createElement("canvas");
    this.offscreenCanvas.width = 400;
    this.offscreenCanvas.height = 400;

    // Initialize population
    this.population = this.initializePopulation(initialGenomes);
  }

  /**
   * Initialize population from seed genomes
   */
  private initializePopulation(seedGenomes: string[]): GAIndividual[] {
    const pop: GAIndividual[] = [];

    // Fill population with seed genomes (repeat if needed)
    for (let i = 0; i < this.populationSize; i++) {
      const genome = seedGenomes[i % seedGenomes.length];
      pop.push({
        genome,
        fitness: this.evaluateFitness(genome),
        generation: 0,
        id: `gen0-${i}`,
      });
    }

    return pop;
  }

  /**
   * Evaluate fitness of a genome
   */
  private evaluateFitness(genome: string): number {
    try {
      // Clear canvas
      const ctx = this.offscreenCanvas.getContext("2d");
      if (!ctx) return 0; // Can't evaluate fitness without rendering context
      ctx.clearRect(0, 0, 400, 400);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 400, 400);

      // Render genome
      const tokens = this.lexer.tokenize(genome);
      const renderer = new Canvas2DRenderer(this.offscreenCanvas);
      const vm = new CodonVM(renderer);
      vm.run(tokens);

      // Calculate fitness
      return this.fitnessFunction(genome, this.offscreenCanvas);
    } catch (_error) {
      // Invalid genomes get 0 fitness
      return 0;
    }
  }

  /**
   * Select parent using configured strategy
   */
  private selectParent(): GAIndividual {
    switch (this.selectionStrategy) {
      case "tournament":
        return this.tournamentSelection();
      case "roulette":
        return this.rouletteWheelSelection();
      case "elitism":
        return this.tournamentSelection(); // Elitism handled separately
      default:
        throw new Error(
          `Unknown selection strategy: ${this.selectionStrategy}`,
        );
    }
  }

  /**
   * Tournament selection
   */
  private tournamentSelection(): GAIndividual {
    // Population guaranteed non-empty from initialize(), but guard against edge case
    if (this.population.length === 0) {
      throw new Error("Cannot select from empty population");
    }

    let best = this.population[0];

    for (let i = 0; i < this.tournamentSize; i++) {
      const candidate =
        this.population[Math.floor(Math.random() * this.population.length)];
      if (candidate.fitness > best.fitness) {
        best = candidate;
      }
    }

    return best;
  }

  /**
   * Roulette wheel selection (fitness-proportionate)
   */
  private rouletteWheelSelection(): GAIndividual {
    const totalFitness = this.population.reduce(
      (sum, ind) => sum + ind.fitness,
      0,
    );

    if (totalFitness === 0) {
      // If all fitness is 0, select randomly
      return this.population[
        Math.floor(Math.random() * this.population.length)
      ];
    }

    let spin = Math.random() * totalFitness;

    for (const individual of this.population) {
      spin -= individual.fitness;
      if (spin <= 0) {
        return individual;
      }
    }

    return this.population[this.population.length - 1];
  }

  /**
   * Perform crossover between two parent genomes
   */
  private crossover(parent1: string, parent2: string): [string, string] {
    if (Math.random() > this.crossoverRate) {
      return [parent1, parent2]; // No crossover
    }

    switch (this.crossoverStrategy) {
      case "single-point":
        return this.singlePointCrossover(parent1, parent2);
      case "uniform":
        return this.uniformCrossover(parent1, parent2);
      case "none":
        return [parent1, parent2];
      default:
        throw new Error(
          `Unknown crossover strategy: ${this.crossoverStrategy}`,
        );
    }
  }

  /**
   * Single-point crossover (split at codon boundary)
   */
  private singlePointCrossover(
    parent1: string,
    parent2: string,
  ): [string, string] {
    // Ensure both parents are valid length (multiple of 3)
    const len1 = parent1.length - (parent1.length % 3);
    const len2 = parent2.length - (parent2.length % 3);
    const minLen = Math.min(len1, len2);

    if (minLen < 6) {
      return [parent1, parent2]; // Too short to crossover
    }

    // Select crossover point at codon boundary
    const numCodons = Math.floor(minLen / 3);
    const crossoverCodon = 1 + Math.floor(Math.random() * (numCodons - 1));
    const crossoverPoint = crossoverCodon * 3;

    const child1 =
      parent1.slice(0, crossoverPoint) + parent2.slice(crossoverPoint);
    const child2 =
      parent2.slice(0, crossoverPoint) + parent1.slice(crossoverPoint);

    return [child1, child2];
  }

  /**
   * Uniform crossover (each codon from random parent)
   */
  private uniformCrossover(parent1: string, parent2: string): [string, string] {
    const len1 = parent1.length - (parent1.length % 3);
    const len2 = parent2.length - (parent2.length % 3);
    const minLen = Math.min(len1, len2);

    let child1 = "";
    let child2 = "";

    for (let i = 0; i < minLen; i += 3) {
      if (Math.random() < 0.5) {
        child1 += parent1.slice(i, i + 3);
        child2 += parent2.slice(i, i + 3);
      } else {
        child1 += parent2.slice(i, i + 3);
        child2 += parent1.slice(i, i + 3);
      }
    }

    return [child1, child2];
  }

  /**
   * Apply mutation to genome
   */
  private mutate(genome: string): string {
    if (Math.random() > this.mutationRate) {
      return genome; // No mutation
    }

    try {
      // Select mutation type randomly
      const mutationType = Math.floor(Math.random() * 3);

      let result: MutationResult;
      switch (mutationType) {
        case 0:
          result = applyPointMutation(genome);
          break;
        case 1:
          result = applyInsertion(genome);
          break;
        case 2:
          result = applyDeletion(genome);
          break;
        default:
          return genome;
      }

      return result.mutated;
    } catch (_error) {
      return genome; // Return original if mutation fails
    }
  }

  /**
   * Evolve population for one generation
   */
  evolveGeneration(): void {
    // Sort population by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);

    // Calculate stats
    const bestFitness = this.population[0].fitness;
    const worstFitness = this.population[this.population.length - 1].fitness;
    const avgFitness =
      this.population.reduce((sum, ind) => sum + ind.fitness, 0) /
      this.population.length;
    const uniqueGenomes = new Set(this.population.map((ind) => ind.genome))
      .size;
    const diversity = uniqueGenomes / this.population.length;

    this.stats.push({
      generation: this.generation,
      bestFitness,
      avgFitness,
      worstFitness,
      diversity,
    });

    // Create next generation
    const nextGen: GAIndividual[] = [];

    // Elitism: preserve best individuals
    for (let i = 0; i < this.eliteCount && i < this.population.length; i++) {
      nextGen.push({
        ...this.population[i],
        generation: this.generation + 1,
        id: `gen${this.generation + 1}-elite${i}`,
      });
    }

    // Generate rest of population through selection, crossover, mutation
    while (nextGen.length < this.populationSize) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();

      let [child1Genome, child2Genome] = this.crossover(
        parent1.genome,
        parent2.genome,
      );

      child1Genome = this.mutate(child1Genome);
      child2Genome = this.mutate(child2Genome);

      if (nextGen.length < this.populationSize) {
        nextGen.push({
          genome: child1Genome,
          fitness: this.evaluateFitness(child1Genome),
          generation: this.generation + 1,
          id: `gen${this.generation + 1}-${nextGen.length}`,
        });
      }

      if (nextGen.length < this.populationSize) {
        nextGen.push({
          genome: child2Genome,
          fitness: this.evaluateFitness(child2Genome),
          generation: this.generation + 1,
          id: `gen${this.generation + 1}-${nextGen.length}`,
        });
      }
    }

    this.population = nextGen;
    this.generation++;
  }

  /**
   * Get current population
   */
  getPopulation(): GAIndividual[] {
    return this.population;
  }

  /**
   * Get best individual
   */
  getBest(): GAIndividual {
    return this.population.reduce((best, ind) =>
      ind.fitness > best.fitness ? ind : best,
    );
  }

  /**
   * Get generation stats
   */
  getStats(): GAGenerationStats[] {
    return this.stats;
  }

  /**
   * Get current generation number
   */
  getGeneration(): number {
    return this.generation;
  }

  /**
   * Reset algorithm with new initial genomes
   */
  reset(initialGenomes: string[]): void {
    this.generation = 0;
    this.stats = [];
    this.population = this.initializePopulation(initialGenomes);
  }
}
