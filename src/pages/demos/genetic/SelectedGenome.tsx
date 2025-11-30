import { Card } from "@/components/Card";
import type { Individual } from "./types";

interface SelectedGenomeProps {
  individual: Individual;
}

export function SelectedGenome({ individual }: SelectedGenomeProps) {
  return (
    <Card>
      <h2 className="mb-2 text-sm font-semibold text-text">Selected Genome</h2>
      <pre className="overflow-x-auto rounded bg-surface p-2 text-xs">
        {individual.genome}
      </pre>
      <div className="mt-2 text-xs text-text-muted">
        Fitness: {(individual.fitness * 100).toFixed(1)}%
      </div>
    </Card>
  );
}
