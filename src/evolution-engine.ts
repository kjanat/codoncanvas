/**
 * Evolution Engine for CodonCanvas
 * Implements directed evolution through user-selected fitness
 */

import {
  applyDeletion,
  applyInsertion,
  applyMissenseMutation,
  applyPointMutation,
  applySilentMutation,
  type MutationResult,
} from "./mutations.js";

export interface EvolutionCandidate {
  /** Genome string */
  genome: string;
  /** Unique identifier for this candidate */
  id: string;
  /** Generation number */
  generation: number;
  /** Parent genome (if not seed) */
  parent?: string;
  /** Mutation applied to create this candidate */
  mutation?: MutationResult;
}

export interface GenerationRecord {
  /** Generation number */
  number: number;
  /** Parent genome that was selected */
  parent: string;
  /** Candidates generated this generation */
  candidates: EvolutionCandidate[];
  /** Selected candidate (null if not yet selected) */
  selected: EvolutionCandidate | null;
  /** Timestamp when generation was created */
  timestamp: number;
}

export interface EvolutionEngineOptions {
  /** Number of candidates per generation (default: 6) */
  candidatesPerGeneration?: number;
  /** Mutation types to use (default: all) */
  mutationTypes?: Array<
    "point" | "silent" | "missense" | "insertion" | "deletion"
  >;
  /** Random seed for reproducibility */
  seed?: number;
}

/**
 * Evolution Engine
 * Manages directed evolution workflow:
 * 1. Generate N mutated candidates from parent
 * 2. User selects fittest candidate
 * 3. Selected candidate becomes parent for next generation
 */
export class EvolutionEngine {
  private candidatesPerGeneration: number;
  private mutationTypes: Array<
    "point" | "silent" | "missense" | "insertion" | "deletion"
  >;
  private currentGeneration: number;
  private history: GenerationRecord[];
  private currentParent: string;

  constructor(initialGenome: string, options: EvolutionEngineOptions = {}) {
    this.candidatesPerGeneration = options.candidatesPerGeneration ?? 6;
    this.mutationTypes = options.mutationTypes ?? [
      "point",
      "silent",
      "missense",
      "insertion",
      "deletion",
    ];
    this.currentGeneration = 0;
    this.currentParent = initialGenome;
    this.history = [];
  }

  /**
   * Generate next generation of candidates
   * Returns array of mutated candidates
   */
  generateGeneration(): EvolutionCandidate[] {
    const candidates: EvolutionCandidate[] = [];
    const parent = this.currentParent;

    for (let i = 0; i < this.candidatesPerGeneration; i++) {
      // Select random mutation type
      const mutationType = this.mutationTypes[
        Math.floor(Math.random() * this.mutationTypes.length)
      ];

      // Apply mutation
      let mutation: MutationResult;
      try {
        switch (mutationType) {
          case "point":
            mutation = applyPointMutation(parent);
            break;
          case "silent":
            mutation = applySilentMutation(parent);
            break;
          case "missense":
            mutation = applyMissenseMutation(parent);
            break;
          case "insertion":
            mutation = applyInsertion(parent);
            break;
          case "deletion":
            mutation = applyDeletion(parent);
            break;
          default:
            throw new Error(`Unknown mutation type: ${mutationType}`);
        }

        candidates.push({
          genome: mutation.mutated,
          id: `gen${this.currentGeneration + 1}-${i}`,
          generation: this.currentGeneration + 1,
          parent: parent,
          mutation: mutation,
        });
      } catch (error) {
        // If mutation fails, try again with different type
        mutation = applyPointMutation(parent);
        candidates.push({
          genome: mutation.mutated,
          id: `gen${this.currentGeneration + 1}-${i}`,
          generation: this.currentGeneration + 1,
          parent: parent,
          mutation: mutation,
        });
      }
    }

    // Record generation
    const record: GenerationRecord = {
      number: this.currentGeneration + 1,
      parent: parent,
      candidates: candidates,
      selected: null,
      timestamp: Date.now(),
    };
    this.history.push(record);

    return candidates;
  }

  /**
   * Select a candidate as the fittest
   * This candidate becomes the parent for the next generation
   */
  selectCandidate(candidateId: string): void {
    const currentGenRecord = this.history[this.history.length - 1];
    if (!currentGenRecord) {
      throw new Error("No generation to select from");
    }

    const selected = currentGenRecord.candidates.find(
      (c) => c.id === candidateId,
    );
    if (!selected) {
      throw new Error(
        `Candidate ${candidateId} not found in current generation`,
      );
    }

    currentGenRecord.selected = selected;
    this.currentParent = selected.genome;
    this.currentGeneration++;
  }

  /**
   * Get current generation number
   */
  getCurrentGeneration(): number {
    return this.currentGeneration;
  }

  /**
   * Get current parent genome
   */
  getCurrentParent(): string {
    return this.currentParent;
  }

  /**
   * Get evolution history
   */
  getHistory(): GenerationRecord[] {
    return this.history;
  }

  /**
   * Get lineage from current parent back to original
   * Returns array of genomes showing evolutionary path
   */
  getLineage(): string[] {
    const lineage: string[] = [this.currentParent];

    // Walk backwards through history
    for (let i = this.history.length - 1; i >= 0; i--) {
      const record = this.history[i];
      if (record.selected) {
        // Add parent of this generation
        if (record.parent !== lineage[lineage.length - 1]) {
          lineage.push(record.parent);
        }
      }
    }

    return lineage.reverse();
  }

  /**
   * Reset evolution to initial state with new genome
   */
  reset(initialGenome: string): void {
    this.currentGeneration = 0;
    this.currentParent = initialGenome;
    this.history = [];
  }

  /**
   * Export evolution session data for sharing/analysis
   */
  exportSession(): {
    initialGenome: string;
    currentGeneration: number;
    history: GenerationRecord[];
    lineage: string[];
  } {
    return {
      initialGenome: this.history[0]?.parent ?? this.currentParent,
      currentGeneration: this.currentGeneration,
      history: this.history,
      lineage: this.getLineage(),
    };
  }
}
