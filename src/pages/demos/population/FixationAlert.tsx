import type { Allele } from "./types";

interface FixationAlertProps {
  fixedAllele: Allele | undefined;
  lostAlleles: Allele[];
  generation: number;
}

export function FixationAlert({
  fixedAllele,
  lostAlleles,
  generation,
}: FixationAlertProps) {
  if (fixedAllele) {
    return (
      <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-800">
        <strong>Fixation!</strong> Allele with{" "}
        <span
          className="inline-block h-3 w-3 rounded"
          style={{ backgroundColor: fixedAllele.color }}
        />{" "}
        reached 100% frequency at generation {generation}.
      </div>
    );
  }

  if (lostAlleles.length > 0) {
    return (
      <div className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-800">
        <strong>Allele Loss:</strong> {lostAlleles.length} allele(s) eliminated
        from the population.
      </div>
    );
  }

  return null;
}
