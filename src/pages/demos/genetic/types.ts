export type FitnessType =
  | "coverage"
  | "symmetry"
  | "colorVariety"
  | "complexity";

export interface Individual {
  id: string;
  genome: string;
  fitness: number;
  generation: number;
}

export interface GAState {
  generation: number;
  population: Individual[];
  bestFitness: number;
  avgFitness: number;
  history: { gen: number; best: number; avg: number }[];
}
