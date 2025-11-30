/**
 * CodonList - Renders a list of codons with optional highlighting
 */

import type { CodonHighlight } from "./types";

interface CodonListProps {
  codons: string[];
  highlights: CodonHighlight[];
}

export function CodonList({ codons, highlights }: CodonListProps) {
  return (
    <>
      {codons.map((codon, i) => {
        const highlight = highlights.find((h) => h.pos === i);
        let className = "inline-block px-1 rounded mx-0.5";

        if (highlight?.type === "removed") {
          className += " bg-red-100 border border-red-400 text-red-900";
        } else if (highlight?.type === "added") {
          className += " bg-green-100 border border-green-400 text-green-900";
        } else {
          className += " bg-gray-100 text-gray-800";
        }

        return (
          <span className={className} key={`${i}-${codon}`}>
            {codon}
          </span>
        );
      })}
    </>
  );
}
