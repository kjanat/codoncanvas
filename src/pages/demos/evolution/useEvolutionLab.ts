import { useState } from "react";
import { examples } from "@/data/examples";
import { getMutationByType } from "@/genetics/mutations";
import { useAchievements } from "@/hooks/useAchievements";
import { EVOLUTION_MUTATION_TYPES } from "./constants";
import type { Candidate, LineageEntry } from "./types";

const DEFAULT_GENOME = examples.helloCircle?.genome || "ATG GAA AAT GGA TAA";

export function useEvolutionLab() {
  const [parentGenome, setParentGenome] = useState(DEFAULT_GENOME);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [generation, setGeneration] = useState(1);
  const [lineage, setLineage] = useState<LineageEntry[]>([]);

  const { trackEvolutionGeneration, trackMutationApplied } = useAchievements();

  const generateCandidates = () => {
    const newCandidates: Candidate[] = [];
    let successCount = 0;

    for (let i = 0; i < 6; i++) {
      const mutationType =
        EVOLUTION_MUTATION_TYPES[i % EVOLUTION_MUTATION_TYPES.length];

      try {
        const result = getMutationByType(mutationType, parentGenome);
        newCandidates.push({
          genome: result.mutated,
          id: i,
          mutationType: result.type,
          description: result.description,
        });
        successCount++;
      } catch (err) {
        newCandidates.push({
          genome: parentGenome,
          id: i,
          mutationType: mutationType,
          description: `Mutation failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
      }
    }

    // Track mutations once after generation (batched for performance)
    for (let i = 0; i < successCount; i++) {
      trackMutationApplied();
    }

    setCandidates(newCandidates);
  };

  const selectCandidate = (candidate: Candidate) => {
    setLineage((prev) => [
      ...prev,
      {
        id: `gen-${generation}-${Date.now()}`,
        genome: parentGenome,
        generation,
        mutationType: candidate.mutationType,
      },
    ]);

    setParentGenome(candidate.genome);
    setCandidates([]);
    setGeneration((g) => g + 1);
    trackEvolutionGeneration();
  };

  const reset = () => {
    setParentGenome(DEFAULT_GENOME);
    setCandidates([]);
    setGeneration(1);
    setLineage([]);
  };

  return {
    // State
    parentGenome,
    candidates,
    generation,
    lineage,

    // Actions
    setParentGenome,
    generateCandidates,
    selectCandidate,
    reset,
  };
}
