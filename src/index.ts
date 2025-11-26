/**
 * @fileoverview CodonCanvas - Educational genetic programming platform
 *
 * A JavaScript/TypeScript library for teaching molecular biology and genetic concepts
 * through visual programming with DNA-like syntax (codon triplets that execute drawing operations).
 *
 * Main Components:
 * - **Core Engine**: CodonLexer, CodonVM, Renderer (Canvas2D, SVG, WebGL)
 * - **Genetic Algorithms**: GeneticAlgorithm with fitness-based selection
 * - **Mutations**: Point, silent, missense, nonsense, insertion, deletion, frameshift
 * - **Educational Features**: Tutorial system, achievement system, assessment engine
 * - **Advanced Tools**: Evolution engine, metrics analysis, genome I/O
 *
 * @example
 * ```typescript
 * import { CodonLexer, CodonVM, Canvas2DRenderer } from 'codoncanvas';
 *
 * const lexer = new CodonLexer();
 * const canvas = document.querySelector('canvas');
 * const renderer = new Canvas2DRenderer(canvas);
 * const vm = new CodonVM(renderer);
 *
 * const tokens = lexer.tokenize('ATG GAA CCC GGA TAA');
 * vm.run(tokens);
 * ```
 */

export type {
  CrossoverStrategy,
  FitnessFunction,
  GAGenerationStats,
  GAIndividual,
  GAOptions,
  SelectionStrategy,
} from "./genetic-algorithm";

/**
 * Genetic Algorithm implementation for CodonCanvas
 *
 * Supports population-based evolution with customizable fitness functions,
 * selection strategies (roulette wheel, tournament), and crossover methods.
 *
 * @example
 * ```typescript
 * const ga = new GeneticAlgorithm({
 *   populationSize: 50,
 *   fitness: (genome) => evaluateGenome(genome),
 *   selectionStrategy: 'tournament',
 *   crossoverRate: 0.7
 * });
 *
 * const population = ga.evolve();
 * ```
 */
export { GeneticAlgorithm } from "./genetic-algorithm";
/**
 * Lexer interface for tokenizing DNA-like genome strings
 *
 * Responsible for parsing raw genome text into codon tokens,
 * with support for comments and whitespace handling.
 */
export type { Lexer } from "./lexer";

/**
 * Codon Lexer - Parses genome strings into executable codon tokens
 *
 * Tokenizes DNA-like triplet syntax (A, C, G, T bases) into codon tokens
 * with full frame validation and error reporting for malformed genomes.
 *
 * @example
 * ```typescript
 * const lexer = new CodonLexer();
 * const tokens = lexer.tokenize("ATG GAA CCC GGA TAA");
 * // [{ text: 'ATG', position: 0, line: 0 }, ...]
 * ```
 */
export { CodonLexer } from "./lexer";

/**
 * Renderer interface for graphics abstraction
 *
 * Defines the contract for graphics backends (Canvas2D, SVG, WebGL).
 * Implementers handle drawing primitives (circle, rect, line, etc.)
 * and graphics state transformations (translate, rotate, scale, color).
 */
export type { Renderer } from "./renderer";

/**
 * Canvas2D Renderer - Draws CodonCanvas programs to HTML5 Canvas
 *
 * Renders drawing operations to an HTML5 Canvas element with full
 * support for 2D transforms (translation, rotation, scaling).
 * Deterministic output via seeded random number generation.
 *
 * @example
 * ```typescript
 * const canvas = document.querySelector('canvas');
 * const renderer = new Canvas2DRenderer(canvas);
 * renderer.setColor(120, 100, 50);
 * renderer.circle(30);
 * ```
 */
export { Canvas2DRenderer } from "./renderer";
/**
 * Research and metrics tracking types
 *
 * Tracks educational events, feature usage, and learning metrics
 * for research and telemetry purposes.
 */
export type {
  ExecutionEvent,
  FeatureEvent,
  MutationEvent,
  ResearchMetricsOptions,
  ResearchSession,
} from "./research-metrics";

/**
 * Research Metrics - Tracks learning events and engagement
 *
 * Records user interactions including code execution, feature usage,
 * mutations, and assessment performance for research analysis.
 * Enables educators to understand student learning patterns.
 *
 * @example
 * ```typescript
 * const metrics = new ResearchMetrics();
 * metrics.recordExecution(genome);
 * metrics.recordMutation(mutationType);
 * const session = metrics.getSession();
 * ```
 */
export { ResearchMetrics } from "./research-metrics";

/**
 * Core type definitions for CodonCanvas
 *
 * Includes Codon, Base, Opcode, VMState, and all supporting types
 * for the genetic programming language implementation.
 */
export * from "./types";

/**
 * VM interface for stack-based execution
 *
 * Defines the contract for virtual machine implementations that execute
 * codon programs with drawing primitives and transform state management.
 */
export type { VM } from "./vm";

/**
 * Codon Virtual Machine - Stack-based program execution engine
 *
 * Executes codon tokens with a stack-based architecture supporting:
 * - Drawing primitives (circle, rectangle, line, triangle, ellipse)
 * - Graphics transforms (translate, rotate, scale)
 * - Color management (HSL-based)
 * - State save/restore for nested transforms
 * - Deterministic execution with instruction limits
 *
 * @example
 * ```typescript
 * const vm = new CodonVM(renderer);
 * const states = vm.run(tokens);
 * console.log(states[0]); // First execution state
 * ```
 */
export { CodonVM } from "./vm";
