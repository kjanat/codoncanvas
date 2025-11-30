import { Card } from "@/components/Card";
import { ChevronRightIcon } from "@/ui/Icons";
import type { LineageEntry } from "./types";

interface LineageHistoryProps {
  lineage: LineageEntry[];
  currentGeneration: number;
}

export function LineageHistory({
  lineage,
  currentGeneration,
}: LineageHistoryProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-text">
        Evolutionary Lineage
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {lineage.map((entry) => (
          <div className="flex items-center" key={entry.id}>
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
            <ChevronRightIcon className="h-4 w-4 text-text-muted" />
          </div>
        ))}
        <div className="rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
          Gen {currentGeneration} (Current)
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-sm text-text-muted">
          <strong>Total mutations accumulated:</strong> {lineage.length}
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Each generation shows cumulative changes from the original ancestor.
          Through selection pressure (your choices), the genome has evolved
          toward your preferred phenotype.
        </p>
      </div>
    </Card>
  );
}
