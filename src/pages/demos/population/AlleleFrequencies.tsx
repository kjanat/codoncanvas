import type { Allele } from "./types";

interface AlleleFrequenciesProps {
  generation: number;
  alleles: Allele[];
}

export function AlleleFrequencies({
  generation,
  alleles,
}: AlleleFrequenciesProps) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-sm font-medium text-text">
        Generation {generation}
      </h3>
      <div className="space-y-2">
        {alleles.map((allele, i) => (
          <div className="flex items-center gap-2" key={allele.id}>
            <div
              className="h-4 w-4 rounded"
              style={{ backgroundColor: allele.color }}
            />
            <span className="text-sm text-text">
              Allele {i + 1}: {(allele.frequency * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
