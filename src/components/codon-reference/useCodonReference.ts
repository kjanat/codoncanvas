/**
 * useCodonReference - Hook for CodonReference state
 */

import { useState } from "react";
import { OPCODE_INFO, type OpcodeCategory } from "@/data";
import { CODON_MAP, type Opcode } from "@/types";
import type { FilteredOpcodeInfo, UseCodonReferenceResult } from "./types";

// Build opcode data once (pure function, no need for useMemo)
function buildOpcodeData(): FilteredOpcodeInfo[] {
  const data: FilteredOpcodeInfo[] = [];

  // Group codons by opcode
  const codonsByOpcode = new Map<Opcode, string[]>();
  for (const [codon, opcode] of Object.entries(CODON_MAP)) {
    const existing = codonsByOpcode.get(opcode);
    if (existing) {
      existing.push(codon);
    } else {
      codonsByOpcode.set(opcode, [codon]);
    }
  }

  // Build info array
  for (const [opcode, info] of Object.entries(OPCODE_INFO)) {
    const opcodeNum = Number(opcode) as Opcode;
    data.push({
      ...info,
      codons: codonsByOpcode.get(opcodeNum) ?? [],
    });
  }

  return data;
}

// Static data - computed once at module load
const OPCODE_DATA = buildOpcodeData();

function filterOpcodes(
  search: string,
  category: OpcodeCategory,
): FilteredOpcodeInfo[] {
  return OPCODE_DATA.filter((info) => {
    // Category filter
    if (category !== "all" && info.category !== category) {
      return false;
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesName = info.name.toLowerCase().includes(searchLower);
      const matchesDesc = info.description.toLowerCase().includes(searchLower);
      const matchesCodon = info.codons.some((c) =>
        c.toLowerCase().includes(searchLower),
      );
      if (!matchesName && !matchesDesc && !matchesCodon) {
        return false;
      }
    }

    return true;
  });
}

export function useCodonReference(
  onInsert?: (codon: string) => void,
): UseCodonReferenceResult {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<OpcodeCategory>("all");

  // Filter is cheap enough to run on every render
  const filteredOpcodes = filterOpcodes(search, category);

  function handleCodonClick(codon: string): void {
    onInsert?.(codon);
  }

  return {
    search,
    setSearch,
    category,
    setCategory,
    filteredOpcodes,
    handleCodonClick,
  };
}
