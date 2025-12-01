import { createFileRoute } from "@tanstack/react-router";

import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import {
  CandidateGrid,
  LineageHistory,
  ParentPanel,
  useEvolutionLab,
} from "@/pages/demos/evolution";

function EvolutionDemoPage() {
  const lab = useEvolutionLab();

  return (
    <PageContainer>
      <PageHeader
        badge={
          <span className="inline-flex items-center gap-4 rounded-full bg-primary/10 px-6 py-2">
            <span className="font-semibold text-primary">
              Generation {lab.generation}
            </span>
            <span className="text-text-muted">|</span>
            <span className="text-text-muted">
              {lab.lineage.length} ancestor{lab.lineage.length !== 1 ? "s" : ""}
            </span>
            {lab.lineage.length > 0 && (
              <>
                <span className="text-text-muted">|</span>
                <button
                  className="text-sm text-danger hover:underline"
                  onClick={lab.reset}
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

      <ParentPanel
        genome={lab.parentGenome}
        onGenerateCandidates={lab.generateCandidates}
        onGenomeChange={lab.setParentGenome}
      />

      {lab.candidates.length > 0 && (
        <CandidateGrid
          candidates={lab.candidates}
          onSelect={lab.selectCandidate}
        />
      )}

      {lab.lineage.length > 0 && (
        <LineageHistory
          currentGeneration={lab.generation}
          lineage={lab.lineage}
        />
      )}
    </PageContainer>
  );
}

export const Route = createFileRoute("/demos/evolution")({
  component: EvolutionDemoPage,
});
