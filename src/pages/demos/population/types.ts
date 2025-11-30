export interface Allele {
  id: string;
  frequency: number;
  color: string;
}

export interface PopulationState {
  generation: number;
  alleles: Allele[];
  history: { generation: number; frequencies: number[] }[];
}
