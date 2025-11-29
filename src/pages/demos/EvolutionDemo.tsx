import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { ErrorAlert } from "@/components/ErrorAlert";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { examples } from "@/data/examples";
import { getMutationByType } from "@/genetics/mutations";
import { useAchievements } from "@/hooks/useAchievements";
import { useRenderGenome } from "@/hooks/useRenderGenome";
import type { MutationType } from "@/types";

interface Candidate {
  genome: string;
  id: number;
  mutationType: MutationType;
  description: string;
}

interface LineageEntry {
  genome: string;
  generation: number;
  mutationType?: MutationType;
}

const MUTATION_TYPES: MutationType[] = [
  "silent",
  "missense",
  "point",
  "insertion",
];

export default function EvolutionDemo() {
  const [parentGenome, setParentGenome] = useState(
    examples.helloCircle?.genome || "ATG GAA AAT GGA TAA",
  );
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [generation, setGeneration] = useState(1);
  const [lineage, setLineage] = useState<LineageEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const parentCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const { trackEvolutionGeneration, trackMutationApplied } = useAchievements();
  const { render } = useRenderGenome();

  // Render parent genome
  useEffect(() => {
    render(parentGenome, parentCanvasRef.current);
  }, [parentGenome, render]);

  // Generate 6 mutant candidates
  const generateCandidates = useCallback(() => {
    const newCandidates: Candidate[] = [];
    setError(null);

    for (let i = 0; i < 6; i++) {
      const mutationType = MUTATION_TYPES[i % MUTATION_TYPES.length];
      if (!mutationType) continue;

      try {
        const result = getMutationByType(mutationType, parentGenome);
        newCandidates.push({
          genome: result.mutated,
          id: i,
          mutationType: result.type,
          description: result.description,
        });
        trackMutationApplied();
      } catch (err) {
        // If mutation fails, use parent with a note
        newCandidates.push({
          genome: parentGenome,
          id: i,
          mutationType: mutationType,
          description: `Mutation failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        });
      }
    }

    setCandidates(newCandidates);
  }, [parentGenome, trackMutationApplied]);

  // Render all candidates
  useEffect(() => {
    candidates.forEach((candidate, i) => {
      render(candidate.genome, canvasRefs.current[i]);
    });
  }, [candidates, render]);

  // Select a candidate as the new parent
  const selectCandidate = (candidate: Candidate) => {
    // Save current parent to lineage
    setLineage((prev) => [
      ...prev,
      {
        genome: parentGenome,
        generation,
        mutationType: candidate.mutationType,
      },
    ]);

    // Update parent and generation
    setParentGenome(candidate.genome);
    setCandidates([]);
    setGeneration((g) => g + 1);
    trackEvolutionGeneration();
  };

  // Reset to initial state
  const resetEvolution = () => {
    setParentGenome(examples.helloCircle?.genome || "ATG GAA AAT GGA TAA");
    setCandidates([]);
    setGeneration(1);
    setLineage([]);
    setError(null);
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        badge={
          <span className="inline-flex items-center gap-4 rounded-full bg-primary/10 px-6 py-2">
            <span className="font-semibold text-primary">
              Generation {generation}
            </span>
            <span className="text-text-muted">|</span>
            <span className="text-text-muted">
              {lineage.length} ancestor{lineage.length !== 1 ? "s" : ""}
            </span>
            {lineage.length > 0 && (
              <>
                <span className="text-text-muted">|</span>
                <button
                  className="text-sm text-danger hover:underline"
                  onClick={resetEvolution}
                  type="button"
                >
                  Reset
                </button>
              </>
            )}
          </span>
        }
        subtitle="Practice directed evolution - select the fittest candidates to guide evolution"
        title="Evolution Lab"
      />

      {/* Current Parent */}
      <Card className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Current Parent</h2>
          <button
            className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
            onClick={generateCandidates}
            type="button"
          >
            Generate Offspring
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Genome editor */}
          <div>
            <textarea
              className="w-full rounded-lg border border-border bg-dark-bg p-3 font-mono text-sm text-dark-text"
              onChange={(e) => setParentGenome(e.target.value)}
              rows={4}
              spellCheck={false}
              value={parentGenome}
            />
          </div>

          {/* Parent canvas */}
          <div className="flex justify-center">
            <canvas
              className="rounded-lg border border-border bg-white"
              height={200}
              ref={parentCanvasRef}
              width={200}
            />
          </div>
        </div>

        {error && <ErrorAlert className="mt-4">{error}</ErrorAlert>}
      </Card>

      {/* Candidates Grid */}
      {candidates.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-text">
            Select the Fittest Candidate
          </h2>
          <p className="mb-4 text-sm text-text-muted">
            Click on the candidate that best matches your target phenotype. It
            will become the parent for the next generation.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate, i) => (
              <button
                className="group rounded-xl border border-border bg-white p-4 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
                key={candidate.id}
                onClick={() => selectCandidate(candidate)}
                type="button"
              >
                <canvas
                  className="mx-auto rounded-lg border border-border bg-white"
                  height={180}
                  ref={(el) => {
                    canvasRefs.current[i] = el;
                  }}
                  width={180}
                />
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {candidate.mutationType}
                    </span>
                    <span className="text-sm font-medium text-text group-hover:text-primary">
                      Candidate {i + 1}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-text-muted">
                    {candidate.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lineage History */}
      {lineage.length > 0 && (
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-text">
            Evolutionary Lineage
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {lineage.map((entry) => (
              <div
                className="flex items-center"
                key={`${entry.generation}-${entry.mutationType ?? "orig"}`}
              >
                <div
                  className="rounded-md bg-bg-light px-3 py-1.5 text-xs"
                  title={entry.genome}
                >
                  <span className="font-medium text-text">
                    Gen {entry.generation}
                  </span>
                  {entry.mutationType && (
                    <span className="ml-2 text-text-muted">
                      ({entry.mutationType})
                    </span>
                  )}
                </div>
                <svg
                  aria-hidden="true"
                  className="h-4 w-4 text-text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
            ))}
            <div className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
              Gen {generation} (Current)
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm text-text-muted">
              <strong>Total mutations accumulated:</strong> {lineage.length}
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Each generation shows cumulative changes from the original
              ancestor. Through selection pressure (your choices), the genome
              has evolved toward your preferred phenotype.
            </p>
          </div>
        </Card>
      )}
    </PageContainer>
  );
}
