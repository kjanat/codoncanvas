import { useCallback, useEffect, useRef, useState } from "react";
import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
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

  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const mutatedCanvasRef = useRef<HTMLCanvasElement>(null);

  const renderGenome = useCallback(
    (genome: string, canvas: HTMLCanvasElement | null): boolean => {
      if (!canvas) return false;
      try {
        const lexer = new CodonLexer();
        const tokens = lexer.tokenize(genome);
        const renderer = new Canvas2DRenderer(canvas);
        const vm = new CodonVM(renderer);
        vm.run(tokens);
        return true;
      } catch (err) {
        console.warn("Render error:", err);
        return false;
      }
    },
    [],
  );

  const applySelectedMutation = useCallback(() => {
    try {
      setError(null);
      const result = getMutationByType(selectedMutation, originalGenome);
      setMutationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mutation failed");
      setMutationResult(null);
    }
  }, [originalGenome, selectedMutation]);

  // Render original genome
  useEffect(() => {
    renderGenome(originalGenome, originalCanvasRef.current);
  }, [originalGenome, renderGenome]);

  // Render mutated genome when result changes
  useEffect(() => {
    if (mutationResult) {
      renderGenome(mutationResult.mutated, mutatedCanvasRef.current);
    }
  }, [mutationResult, renderGenome]);

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

      {/* Side-by-side comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Original */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">
            Original Genome
          </h2>
          <textarea
            className="mb-4 w-full rounded-lg border border-border bg-dark-bg p-3 font-mono text-sm text-dark-text"
            onChange={(e) => setOriginalGenome(e.target.value)}
            rows={3}
            value={originalGenome}
          />
          <div className="flex justify-center">
            <canvas
              className="rounded-lg border border-border bg-white"
              height={300}
              ref={originalCanvasRef}
              width={300}
            />
          </div>
        </div>

        {/* Mutated */}
        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-text">
            Mutated Genome
          </h2>

          {/* Mutation result info */}
          {mutationResult && (
            <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                  {mutationResult.type}
                </span>
                <span className="text-sm text-text-muted">
                  Position: {mutationResult.position}
                </span>
              </div>
              <p className="text-sm text-text">{mutationResult.description}</p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-sm text-danger">
              {error}
            </div>
          )}

          {/* Mutated genome code */}
          <div className="mb-4 min-h-[76px] rounded-lg border border-border bg-dark-bg p-3 font-mono text-sm text-dark-text">
            {mutationResult?.mutated || (
              <span className="opacity-50">
                Apply a mutation to see result...
              </span>
            )}
          </div>

          <div className="flex justify-center">
            <canvas
              className="rounded-lg border border-border bg-white"
              height={300}
              ref={mutatedCanvasRef}
              width={300}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
