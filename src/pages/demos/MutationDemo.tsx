import { useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { ErrorAlert } from "@/components/ErrorAlert";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { examples } from "@/data/examples";
import { MUTATION_TYPES } from "@/data/mutation-types";
import { getMutationByType, type MutationResult } from "@/genetics/mutations";
import type { MutationType } from "@/types";

export default function MutationDemo() {
  const [originalGenome, setOriginalGenome] = useState(
    examples.silentMutation?.genome || "ATG GAA AAT GGA TAA",
  );
  const [mutationResult, setMutationResult] = useState<MutationResult | null>(
    null,
  );
  const [selectedMutation, setSelectedMutation] =
    useState<MutationType>("silent");
  const [error, setError] = useState<string | null>(null);

  const applySelectedMutation = () => {
    try {
      setError(null);
      const result = getMutationByType(selectedMutation, originalGenome);
      setMutationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mutation failed");
      setMutationResult(null);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        subtitle="Compare original and mutated genomes side-by-side"
        title="Mutation Laboratory"
      />

      {/* Mutation Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {MUTATION_TYPES.map((m) => (
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedMutation === m.type
                ? "bg-primary text-white"
                : "bg-surface text-text hover:bg-bg-light"
            }`}
            key={m.type}
            onClick={() => setSelectedMutation(m.type)}
            title={m.description}
            type="button"
          >
            {m.label}
          </button>
        ))}
        <button
          className="ml-4 rounded-lg bg-success px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-success-hover"
          onClick={applySelectedMutation}
          type="button"
        >
          Apply Mutation
        </button>
      </div>

      {/* Error display */}
      {error && (
        <ErrorAlert className="mx-auto mb-6 max-w-2xl text-center">
          {error}
        </ErrorAlert>
      )}

      {/* Input for Original Genome */}
      <div className="mx-auto mb-6 max-w-2xl">
        <label
          className="mb-2 block text-sm font-medium text-text"
          htmlFor="original-genome"
        >
          Original Genome
        </label>
        <textarea
          className="w-full rounded-lg border border-border bg-surface p-3 font-mono text-sm text-text"
          id="original-genome"
          onChange={(e) => setOriginalGenome(e.target.value)}
          rows={2}
          value={originalGenome}
        />
      </div>

      {/* Diff Viewer */}
      <DiffViewer
        mutated={mutationResult?.mutated || originalGenome}
        original={originalGenome}
        title={
          mutationResult
            ? `Mutation Result: ${mutationResult.type}`
            : "Ready to Mutate"
        }
      />
    </PageContainer>
  );
}
