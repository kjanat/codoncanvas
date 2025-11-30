import { ALLELE_COLORS } from "./constants";
import type { Allele, PopulationState } from "./types";

export function sampleWithReplacement(
  alleles: Allele[],
  popSize: number,
): Allele[] {
  const total = alleles.reduce((sum, a) => sum + a.frequency, 0);
  const counts = alleles.map(() => 0);

  for (let i = 0; i < popSize; i++) {
    let r = Math.random() * total;
    for (let j = 0; j < alleles.length; j++) {
      r -= alleles[j].frequency;
      if (r <= 0) {
        counts[j]++;
        break;
      }
    }
  }

  return alleles.map((a, i) => ({
    ...a,
    frequency: counts[i] / popSize,
  }));
}

export function initPopulation(count: number): PopulationState {
  const freq = 1 / count;
  return {
    generation: 0,
    alleles: Array.from({ length: count }, (_, i) => ({
      id: `allele-${i}`,
      frequency: freq,
      color: ALLELE_COLORS[i % ALLELE_COLORS.length],
    })),
    history: [{ generation: 0, frequencies: Array(count).fill(freq) }],
  };
}
