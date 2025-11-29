/**
 * Genetic operations module
 * Mutation, evolution, and genome manipulation
 */

export type {
  EvolutionCandidate,
  EvolutionEngineOptions,
  GenerationRecord,
} from "./evolution-engine";
export { EvolutionEngine } from "./evolution-engine";
export type {
  CrossoverStrategy,
  FitnessFunction,
  GAGenerationStats,
  GAIndividual,
  GAOptions,
  SelectionStrategy,
} from "./genetic-algorithm";
export { GeneticAlgorithm } from "./genetic-algorithm";
export type { GenomeComparisonResult } from "./genome-comparison";
export { compareGenomesDetailed } from "./genome-comparison";
export type { GenomeFile } from "./genome-io";
export {
  downloadGenomeFile,
  exportGenome,
  importGenome,
  readGenomeFile,
  validateGenomeFile,
} from "./genome-io";
export type {
  ConfidenceLevel,
  ImpactLevel,
  MutationPrediction,
} from "./mutation-predictor";
export {
  predictMutationImpact,
  predictMutationImpactBatch,
} from "./mutation-predictor";
export type { MutationResult } from "./mutations";
export {
  applyDeletion,
  applyFrameshiftMutation,
  applyInsertion,
  applyMissenseMutation,
  applyNonsenseMutation,
  applyPointMutation,
  applySilentMutation,
  compareGenomes,
  getMutationByType,
} from "./mutations";
