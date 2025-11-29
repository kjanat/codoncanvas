/**
 * Biology Comparison Panel
 *
 * Provides educational comparison between CodonCanvas opcodes
 * and the real genetic code (amino acids).
 *
 * @module
 */

import {
  AMINO_ACIDS,
  type AminoAcidCode,
  type CodonComparison,
  getAminoAcidInfo,
  getCodonComparison,
  STANDARD_GENETIC_CODE,
} from "@/data/amino-acids";
import { CODON_MAP, type DNACodon, Opcode } from "@/types";

// ============ TYPES ============

/**
 * Extended comparison including CodonCanvas opcode.
 */
export interface FullCodonComparison extends CodonComparison {
  /** CodonCanvas opcode */
  opcode: Opcode;
  /** Opcode name */
  opcodeName: string;
  /** Whether this is a matching pattern (same degeneracy) */
  patternMatch: boolean;
}

/**
 * Family comparison data.
 */
export interface FamilyComparison {
  /** Codon prefix (e.g., "GG") */
  prefix: string;
  /** CodonCanvas opcode for this family */
  opcode: Opcode;
  /** Opcode name */
  opcodeName: string;
  /** Real amino acid for this family */
  aminoAcid: AminoAcidCode;
  /** Amino acid full name */
  aminoAcidName: string;
  /** Codons in this family */
  codons: DNACodon[];
  /** Whether degeneracy matches */
  degeneracyMatch: boolean;
  /** Educational note */
  note: string;
}

// ============ COMPARISON GENERATION ============

/**
 * Get full comparison for a single codon.
 */
export function getFullCodonComparison(codon: DNACodon): FullCodonComparison {
  const bioComparison = getCodonComparison(codon);
  const opcode = CODON_MAP[codon];
  const opcodeName = Opcode[opcode];

  // Check if degeneracy pattern matches
  const aaInfo = getAminoAcidInfo(codon);
  const opcodeFamily = Object.entries(CODON_MAP).filter(
    ([_, op]) => op === opcode,
  );

  return {
    ...bioComparison,
    opcode,
    opcodeName,
    patternMatch: aaInfo.degeneracy === opcodeFamily.length,
  };
}

/**
 * Get comparison for a codon family (by prefix).
 */
export function getFamilyComparison(prefix: string): FamilyComparison | null {
  // Get all codons with this prefix
  const codons = (["A", "C", "G", "T"] as const).map(
    (suffix) => `${prefix}${suffix}` as DNACodon,
  );

  // Check if all codons map to same opcode
  const opcodes = codons.map((c) => CODON_MAP[c]);
  const uniqueOpcodes = new Set(opcodes);

  if (uniqueOpcodes.size !== 1) {
    return null; // Not a four-fold family in CodonCanvas
  }

  const opcode = opcodes[0];
  const opcodeName = Opcode[opcode];

  // Check amino acids
  const aminoAcids = codons.map((c) => STANDARD_GENETIC_CODE[c]);
  const uniqueAAs = new Set(aminoAcids);

  // Get the most common amino acid
  const aaCounts = new Map<AminoAcidCode, number>();
  for (const aa of aminoAcids) {
    aaCounts.set(aa, (aaCounts.get(aa) || 0) + 1);
  }
  const [mainAA] = [...aaCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const aaInfo = AMINO_ACIDS[mainAA];

  // Generate note
  let note: string;
  if (uniqueAAs.size === 1) {
    note = `Perfect match! All 4 codons encode ${aaInfo.name} in real biology.`;
  } else {
    const aaNames = [...uniqueAAs].map((aa) => AMINO_ACIDS[aa].name).join(", ");
    note = `Partial match. Real biology encodes: ${aaNames}`;
  }

  return {
    prefix,
    opcode,
    opcodeName,
    aminoAcid: mainAA,
    aminoAcidName: aaInfo.name,
    codons,
    degeneracyMatch: uniqueAAs.size === 1,
    note,
  };
}

/**
 * Get all family comparisons for educational display.
 */
export function getAllFamilyComparisons(): FamilyComparison[] {
  const prefixes = [
    "AA",
    "AC",
    "AG",
    "AT",
    "CA",
    "CC",
    "CG",
    "CT",
    "GA",
    "GC",
    "GG",
    "GT",
    "TA",
    "TC",
    "TG",
    "TT",
  ];

  return prefixes
    .map(getFamilyComparison)
    .filter((fc): fc is FamilyComparison => fc !== null);
}

// ============ UI RENDERING ============

/**
 * Render the biology comparison panel content.
 */
export function renderBiologyComparison(
  container: HTMLElement,
  genome?: string,
): void {
  container.innerHTML = "";

  // Header section
  const header = document.createElement("div");
  header.style.cssText =
    "margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #3c3c3c;";
  header.innerHTML = `
    <p style="color: #a0a0a0; margin: 0 0 8px 0;">
      Compare CodonCanvas opcodes with the real genetic code. 
      The <strong style="color: #4ec9b0;">pattern</strong> (redundancy) is authentic, 
      while the <strong style="color: #569cd6;">output</strong> differs (opcodes vs. amino acids).
    </p>
  `;
  container.appendChild(header);

  // If genome provided, show specific codons
  if (genome) {
    const codons = genome.replace(/\s+/g, "").match(/.{1,3}/g) || [];
    const validCodons = codons.filter((c) => c.length === 3) as DNACodon[];

    if (validCodons.length > 0) {
      renderGenomeComparison(container, validCodons);
      return;
    }
  }

  // Show family overview
  renderFamilyOverview(container);
}

/**
 * Render comparison for specific genome codons.
 */
function renderGenomeComparison(
  container: HTMLElement,
  codons: DNACodon[],
): void {
  const table = document.createElement("table");
  table.style.cssText =
    "width: 100%; border-collapse: collapse; font-size: 12px;";

  table.innerHTML = `
    <thead>
      <tr style="background: #252526; color: #d4d4d4;">
        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #3c3c3c;">Codon</th>
        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #3c3c3c;">CodonCanvas</th>
        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #3c3c3c;">Real Biology</th>
        <th style="padding: 8px; text-align: left; border-bottom: 1px solid #3c3c3c;">Property</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");
  if (!tbody) return;
  const seen = new Set<string>();

  for (const codon of codons) {
    if (seen.has(codon)) continue;
    seen.add(codon);

    try {
      const comparison = getFullCodonComparison(codon);
      const row = document.createElement("tr");
      row.style.cssText = "border-bottom: 1px solid #2d2d30;";

      const propertyColors: Record<string, string> = {
        nonpolar: "#9cdcfe",
        polar: "#4ec9b0",
        acidic: "#f48771",
        basic: "#569cd6",
        aromatic: "#dcdcaa",
        stop: "#f44747",
      };

      row.innerHTML = `
        <td style="padding: 8px; font-family: monospace; color: #ce9178;">${comparison.dnaCodon}</td>
        <td style="padding: 8px; color: #569cd6;">${comparison.opcodeName}</td>
        <td style="padding: 8px; color: #4ec9b0;">${comparison.aminoAcidName} (${comparison.aminoAcid})</td>
        <td style="padding: 8px; color: ${propertyColors[comparison.property] || "#d4d4d4"};">${comparison.property}</td>
      `;

      tbody.appendChild(row);
    } catch {
      // Invalid codon, skip
    }
  }

  container.appendChild(table);

  // Add legend
  const legend = document.createElement("div");
  legend.style.cssText =
    "margin-top: 12px; padding-top: 12px; border-top: 1px solid #3c3c3c; font-size: 11px; color: #808080;";
  legend.innerHTML = `
    <strong>Property Legend:</strong> 
    <span style="color: #9cdcfe;">nonpolar</span> | 
    <span style="color: #4ec9b0;">polar</span> | 
    <span style="color: #f48771;">acidic</span> | 
    <span style="color: #569cd6;">basic</span> | 
    <span style="color: #dcdcaa;">aromatic</span> | 
    <span style="color: #f44747;">stop</span>
  `;
  container.appendChild(legend);
}

/**
 * Render family overview comparison.
 */
function renderFamilyOverview(container: HTMLElement): void {
  const families = getAllFamilyComparisons();

  const grid = document.createElement("div");
  grid.style.cssText =
    "display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;";

  for (const family of families) {
    const card = document.createElement("div");
    card.style.cssText = `
      background: #252526; 
      border: 1px solid ${family.degeneracyMatch ? "#4ec9b0" : "#3c3c3c"}; 
      border-radius: 4px; 
      padding: 12px;
    `;

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-family: monospace; font-size: 14px; color: #ce9178;">${family.prefix}*</span>
        ${family.degeneracyMatch ? '<span style="color: #4ec9b0; font-size: 10px;">MATCH</span>' : ""}
      </div>
      <div style="font-size: 12px; margin-bottom: 4px;">
        <span style="color: #808080;">CodonCanvas:</span> 
        <span style="color: #569cd6;">${family.opcodeName}</span>
      </div>
      <div style="font-size: 12px; margin-bottom: 8px;">
        <span style="color: #808080;">Real Biology:</span> 
        <span style="color: #4ec9b0;">${family.aminoAcidName}</span>
      </div>
      <div style="font-size: 10px; color: #808080; font-style: italic;">
        ${family.note}
      </div>
    `;

    grid.appendChild(card);
  }

  container.appendChild(grid);

  // Add educational footer
  const footer = document.createElement("div");
  footer.style.cssText =
    "margin-top: 16px; padding: 12px; background: #1e1e1e; border-radius: 4px; font-size: 11px; color: #a0a0a0;";
  footer.innerHTML = `
    <strong style="color: #d4d4d4;">Key Insight:</strong> 
    Notice how both systems group codons by their first two letters (the "wobble position" pattern). 
    This redundancy provides error tolerance against point mutations.
  `;
  container.appendChild(footer);
}

// ============ PANEL MANAGEMENT ============

let panelVisible = false;

/**
 * Toggle the biology comparison panel.
 */
export function toggleBiologyComparisonPanel(
  panel: HTMLElement,
  container: HTMLElement,
  toggleBtn: HTMLButtonElement,
  genome?: string,
): void {
  panelVisible = !panelVisible;

  if (panelVisible) {
    panel.style.display = "block";
    toggleBtn.textContent = "Hide";
    toggleBtn.setAttribute("aria-expanded", "true");
    renderBiologyComparison(container, genome);
  } else {
    panel.style.display = "none";
    toggleBtn.textContent = "Biology";
    toggleBtn.setAttribute("aria-expanded", "false");
  }
}

/**
 * Check if panel is currently visible.
 */
export function isBiologyComparisonPanelVisible(): boolean {
  return panelVisible;
}

/**
 * Refresh the comparison panel with new genome.
 */
export function refreshBiologyComparison(
  container: HTMLElement,
  genome: string,
): void {
  if (panelVisible) {
    renderBiologyComparison(container, genome);
  }
}
