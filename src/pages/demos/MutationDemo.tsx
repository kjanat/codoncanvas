import { useState } from "react";
import { DiffViewer } from "@/components/DiffViewer";
import { examples } from "@/data/examples";
import { getMutationByType, type MutationResult } from "@/genetics/mutations";
import type { MutationType } from "@/types";

const mutationTypes: {
  type: MutationType;
  label: string;
  description: string;
}[] = [
  {
    type: "silent",
    label: "Silent",
    description: "Change codon but not function (synonymous substitution)",
  },
  {
    type: "missense",
    label: "Missense",
    description: "Change codon to different function (shape change)",
  },
  {
    type: "nonsense",
    label: "Nonsense",
    description: "Create early STOP codon (truncates output)",
  },
  {
    type: "point",
    label: "Point",
    description: "Change single base (may be silent/missense/nonsense)",
  },
  {
    type: "insertion",
    label: "Insertion",
    description: "Add extra bases (may cause frameshift)",
  },
  {
    type: "deletion",
    label: "Deletion",
    description: "Remove bases (may cause frameshift)",
  },
  {
    type: "frameshift",
    label: "Frameshift",
    description: "Shift reading frame (scrambles downstream)",
  },
];

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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-text">
          Mutation Laboratory
        </h1>
        <p className="text-text-muted">
          Compare original and mutated genomes side-by-side
        </p>
      </div>

      {/* Mutation Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        {mutationTypes.map((m) => (
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedMutation === m.type
                ? "bg-primary text-white"
                : "bg-white text-text hover:bg-bg-light"
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
        <div className="mb-6 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger text-center max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Input for Original Genome */}
      <div className="mb-6 max-w-2xl mx-auto">
        <label
          className="block text-sm font-medium text-text mb-2"
          htmlFor="original-genome"
        >
          Original Genome
        </label>
        <textarea
          className="w-full rounded-lg border border-border bg-white p-3 font-mono text-sm text-text"
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
    </div>
  );
}
