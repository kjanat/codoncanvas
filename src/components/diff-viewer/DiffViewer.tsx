/**
 * DiffViewer - Shows comparison between original and mutated genomes
 */

import { compareGenomes } from "@/genetics/mutations";
import { CanvasPanel } from "./CanvasPanel";
import { CodonList } from "./CodonList";
import type { DiffViewerProps } from "./types";

export function DiffViewer({
  original,
  mutated,
  title = "Genome Comparison",
  showCanvas = true,
  canvasWidth = 300,
  canvasHeight = 300,
}: DiffViewerProps) {
  const comparison = compareGenomes(original, mutated);
  const { differences } = comparison;

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-2">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="font-medium text-text">{differences.length}</span>
          <span>codon{differences.length !== 1 ? "s" : ""} changed</span>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        {/* Original Panel */}
        <div className="rounded-lg border border-border bg-gray-50 overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 border-b border-border text-center">
            Original
          </div>
          <div className="p-4 font-mono text-sm leading-loose min-h-[100px]">
            <CodonList
              codons={comparison.originalCodons}
              highlights={differences.map((d) => ({
                pos: d.position,
                type: "removed",
              }))}
            />
          </div>
        </div>

        {/* Mutated Panel */}
        <div className="rounded-lg border border-border bg-gray-50 overflow-hidden">
          <div className="bg-gray-100 px-3 py-2 text-sm font-bold text-gray-700 border-b border-border text-center">
            Mutated
          </div>
          <div className="p-4 font-mono text-sm leading-loose min-h-[100px]">
            <CodonList
              codons={comparison.mutatedCodons}
              highlights={differences.map((d) => ({
                pos: d.position,
                type: "added",
              }))}
            />
          </div>
        </div>
      </div>

      {showCanvas && (
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          <CanvasPanel
            genome={original}
            height={canvasHeight}
            label="Original Output"
            width={canvasWidth}
          />
          <CanvasPanel
            genome={mutated}
            height={canvasHeight}
            label="Mutated Output"
            width={canvasWidth}
          />
        </div>
      )}

      {differences.length > 0 ? (
        <div className="rounded-lg border border-border bg-gray-50 p-4">
          <h4 className="mb-2 text-sm font-bold text-text">
            Changes at codon level:
          </h4>
          <ul className="space-y-1">
            {differences.map((diff) => (
              <li
                className="text-sm text-text bg-white p-2 rounded border border-border"
                key={diff.position}
              >
                <span className="font-mono text-gray-500">
                  Pos {diff.position}:
                </span>{" "}
                <code className="bg-red-100 text-red-900 px-1 rounded border border-red-200">
                  {diff.original || "(deleted)"}
                </code>{" "}
                -{">"}
                {""}
                <code className="bg-green-100 text-green-900 px-1 rounded border border-green-200">
                  {diff.mutated || "(inserted)"}
                </code>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center text-text-muted py-4">
          No differences found
        </div>
      )}
    </div>
  );
}
