import type { FitnessType } from "./types";

export const FITNESS_OPTIONS: { value: FitnessType; label: string }[] = [
  { value: "coverage", label: "Canvas Coverage" },
  { value: "symmetry", label: "Symmetry" },
  { value: "colorVariety", label: "Color Variety" },
  { value: "complexity", label: "Genome Complexity" },
];

export const SEED_GENOMES = [
  "ATG GCA CCA GGA TAA",
  "ATG GCA AAA GGA CCC TAA",
  "ATG AAA GCA CCC GGA TAA",
];

export const DEFAULT_POPULATION_SIZE = 12;
