import type { MutationType } from "@/types";

export interface Candidate {
  genome: string;
  id: number;
  mutationType: MutationType;
  description: string;
}

export interface LineageEntry {
  id: string;
  genome: string;
  generation: number;
  mutationType?: MutationType;
}
