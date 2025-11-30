/**
 * Types for CodonReference component
 */

import type { OpcodeCategory, OpcodeInfo } from "@/data";

export interface CodonReferenceProps {
  /** Callback when a codon is clicked */
  onInsert?: (codon: string) => void;
  /** Whether panel is collapsed */
  collapsed?: boolean;
  /** Toggle collapse callback */
  onToggleCollapse?: () => void;
}

export interface FilteredOpcodeInfo extends OpcodeInfo {
  codons: string[];
}

export interface UseCodonReferenceResult {
  search: string;
  setSearch: (value: string) => void;
  category: OpcodeCategory;
  setCategory: (value: OpcodeCategory) => void;
  filteredOpcodes: FilteredOpcodeInfo[];
  handleCodonClick: (codon: string) => void;
}
