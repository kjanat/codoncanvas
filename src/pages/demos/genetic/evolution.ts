import { applyPointMutation } from "@/genetics/mutations";
import { DEFAULT_POPULATION_SIZE, SEED_GENOMES } from "./constants";
import type { Individual } from "./types";

export function createInitialPopulation(
  size: number = DEFAULT_POPULATION_SIZE,
): Individual[] {
  return SEED_GENOMES.flatMap((g, seedIdx) =>
    Array.from({ length: Math.ceil(size / SEED_GENOMES.length) }, (_, i) => ({
      id: `gen0-${seedIdx}-${i}`,
      genome: g,
      fitness: 0,
      generation: 0,
    })),
  ).slice(0, size);
}

export function tournamentSelect(evaluated: Individual[]): Individual {
  const a = evaluated[Math.floor(Math.random() * evaluated.length)];
  const b = evaluated[Math.floor(Math.random() * evaluated.length)];
  return a.fitness > b.fitness ? a : b;
}

export function mutateGenome(genome: string, rate: number): string {
  if (Math.random() >= rate) return genome;
  try {
    return applyPointMutation(genome).mutated;
  } catch (error) {
    console.warn("Mutation failed, keeping parent genome:", error);
    return genome;
  }
}

export function buildNextGeneration(
  evaluated: Individual[],
  currentGen: number,
  targetSize: number,
  mutationRate: number,
): Individual[] {
  const nextGen: Individual[] = [];
  const newGen = currentGen + 1;

  // Elitism: keep top performers
  const eliteCount = Math.min(2, evaluated.length);
  for (let i = 0; i < eliteCount; i++) {
    nextGen.push({
      ...evaluated[i],
      generation: newGen,
      id: `gen${newGen}-elite${i}`,
    });
  }

  // Fill rest with mutated offspring
  while (nextGen.length < targetSize) {
    const parent = tournamentSelect(evaluated);
    nextGen.push({
      id: `gen${newGen}-${nextGen.length}`,
      genome: mutateGenome(parent.genome, mutationRate),
      fitness: 0,
      generation: newGen,
    });
  }

  return nextGen;
}
