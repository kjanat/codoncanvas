/**
 * @fileoverview Codon Usage Analysis Tool
 *
 * Provides bioinformatics-inspired analysis of CodonCanvas genomes:
 * - Codon frequency distribution
 * - GC content analysis
 * - Opcode family usage patterns
 * - Genome composition statistics
 *
 * Educational value: Connects programming to real genomics research concepts
 * (codon usage bias, GC content, compositional analysis)
 */

import { Codon, CODON_MAP, type CodonToken, Opcode } from "./types";

/**
 * Complete codon usage analysis results
 */
export interface CodonAnalysis {
  /** Total number of codons in genome */
  totalCodons: number;

  /** Codon frequency table (codon → count) */
  codonFrequency: Map<string, number>;

  /** GC content as percentage (0-100) */
  gcContent: number;

  /** AT content as percentage (0-100) */
  atContent: number;

  /** Opcode usage distribution (opcode name → count) */
  opcodeDistribution: Map<string, number>;

  /** Opcode family percentages (control, drawing, transform, stack, utility) */
  opcodeFamilies: {
    control: number;
    drawing: number;
    transform: number;
    stack: number;
    utility: number;
  };

  /** Most frequently used codons (top 5) */
  topCodons: Array<{ codon: string; count: number; percentage: number }>;

  /** Most frequently used opcodes (top 5) */
  topOpcodes: Array<{ opcode: string; count: number; percentage: number }>;

  /** Codon family usage (e.g., GG* family for CIRCLE) */
  codonFamilyUsage: Map<string, number>;

  /** Genome "signature" metrics for comparison */
  signature: {
    drawingDensity: number; // % of drawing opcodes
    transformDensity: number; // % of transform opcodes
    complexity: number; // unique opcodes / total opcodes
    redundancy: number; // avg synonymous codons per opcode
  };
}

/**
 * Opcode family classifications for analysis
 */
const OPCODE_FAMILIES = {
  control: [Opcode.START, Opcode.STOP],
  drawing: [
    Opcode.CIRCLE,
    Opcode.RECT,
    Opcode.LINE,
    Opcode.TRIANGLE,
    Opcode.ELLIPSE,
  ],
  transform: [Opcode.TRANSLATE, Opcode.ROTATE, Opcode.SCALE, Opcode.COLOR],
  stack: [Opcode.PUSH, Opcode.DUP, Opcode.POP, Opcode.SWAP],
  utility: [Opcode.NOP, Opcode.SAVE_STATE, Opcode.RESTORE_STATE],
  comparison: [Opcode.EQ, Opcode.LT],
  arithmetic: [Opcode.ADD, Opcode.SUB, Opcode.MUL, Opcode.DIV],
  iteration: [Opcode.LOOP],
};

/**
 * Analyze codon usage patterns in a genome
 * @param tokens Tokenized codon sequence
 * @returns Complete codon usage analysis
 */
export function analyzeCodonUsage(tokens: CodonToken[]): CodonAnalysis {
  const totalCodons = tokens.length;
  const codonFrequency = new Map<string, number>();
  const opcodeDistribution = new Map<string, number>();

  // Count base composition for GC content
  let gCount = 0;
  let cCount = 0;
  let aCount = 0;
  let tCount = 0;

  // Analyze each codon
  for (const token of tokens) {
    const codon = normalizeCodon(token.text);

    // Codon frequency
    codonFrequency.set(codon, (codonFrequency.get(codon) || 0) + 1);

    // Base composition (normalize U→T for GC calculation)
    const bases = codon.split("");
    for (const base of bases) {
      const normalizedBase = base === "U" ? "T" : base;
      if (normalizedBase === "G") gCount++;
      else if (normalizedBase === "C") cCount++;
      else if (normalizedBase === "A") aCount++;
      else if (normalizedBase === "T") tCount++;
    }

    // Opcode distribution
    const opcode = CODON_MAP[codon];
    if (opcode !== undefined) {
      const opcodeName = Opcode[opcode];
      opcodeDistribution.set(
        opcodeName,
        (opcodeDistribution.get(opcodeName) || 0) + 1,
      );
    }
  }

  // Calculate GC/AT content
  const totalBases = gCount + cCount + aCount + tCount;
  const gcContent = totalBases > 0 ? ((gCount + cCount) / totalBases) * 100 : 0;
  const atContent = totalBases > 0 ? ((aCount + tCount) / totalBases) * 100 : 0;

  // Calculate opcode family percentages
  const opcodeFamilies = calculateOpcodeFamilies(
    opcodeDistribution,
    totalCodons,
  );

  // Top codons
  const topCodons = Array.from(codonFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([codon, count]) => ({
      codon,
      count,
      percentage: (count / totalCodons) * 100,
    }));

  // Top opcodes
  const topOpcodes = Array.from(opcodeDistribution.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([opcode, count]) => ({
      opcode,
      count,
      percentage: (count / totalCodons) * 100,
    }));

  // Codon family usage (e.g., GG*, CC*, etc.)
  const codonFamilyUsage = calculateCodonFamilyUsage(codonFrequency);

  // Genome signature metrics
  const signature = calculateSignature(opcodeDistribution, totalCodons);

  return {
    totalCodons,
    codonFrequency,
    gcContent,
    atContent,
    opcodeDistribution,
    opcodeFamilies,
    topCodons,
    topOpcodes,
    codonFamilyUsage,
    signature,
  };
}

/**
 * Normalize codon (convert U→T for consistency)
 */
function normalizeCodon(codon: string): string {
  return codon.replace(/U/g, "T");
}

/**
 * Calculate opcode family percentages
 */
function calculateOpcodeFamilies(
  opcodeDistribution: Map<string, number>,
  totalCodons: number,
): CodonAnalysis["opcodeFamilies"] {
  const families = {
    control: 0,
    drawing: 0,
    transform: 0,
    stack: 0,
    utility: 0,
  };

  for (const [opcodeName, count] of opcodeDistribution.entries()) {
    const opcodeEnum = Opcode[opcodeName as keyof typeof Opcode];

    for (const [family, opcodes] of Object.entries(OPCODE_FAMILIES)) {
      if (opcodes.includes(opcodeEnum)) {
        families[family as keyof typeof families] += count;
        break;
      }
    }
  }

  // Convert to percentages
  return {
    control: (families.control / totalCodons) * 100,
    drawing: (families.drawing / totalCodons) * 100,
    transform: (families.transform / totalCodons) * 100,
    stack: (families.stack / totalCodons) * 100,
    utility: (families.utility / totalCodons) * 100,
  };
}

/**
 * Calculate codon family usage (first two bases)
 * e.g., GG* family (GGA, GGC, GGG, GGT)
 */
function calculateCodonFamilyUsage(
  codonFrequency: Map<string, number>,
): Map<string, number> {
  const familyUsage = new Map<string, number>();

  for (const [codon, count] of codonFrequency.entries()) {
    const family = codon.substring(0, 2); // First two bases
    familyUsage.set(family, (familyUsage.get(family) || 0) + count);
  }

  return familyUsage;
}

/**
 * Calculate genome signature metrics for comparison
 */
function calculateSignature(
  opcodeDistribution: Map<string, number>,
  totalCodons: number,
): CodonAnalysis["signature"] {
  let drawingCount = 0;
  let transformCount = 0;
  const uniqueOpcodes = opcodeDistribution.size;

  for (const [opcodeName, count] of opcodeDistribution.entries()) {
    const opcodeEnum = Opcode[opcodeName as keyof typeof Opcode];

    if (OPCODE_FAMILIES.drawing.includes(opcodeEnum)) {
      drawingCount += count;
    } else if (OPCODE_FAMILIES.transform.includes(opcodeEnum)) {
      transformCount += count;
    }
  }

  const drawingDensity = totalCodons > 0
    ? (drawingCount / totalCodons) * 100
    : 0;
  const transformDensity = totalCodons > 0
    ? (transformCount / totalCodons) * 100
    : 0;
  const complexity = totalCodons > 0 ? uniqueOpcodes / totalCodons : 0;

  // Calculate redundancy (avg synonymous codons per opcode)
  const avgCodonsPerOpcode = totalCodons / (uniqueOpcodes || 1);
  const redundancy = avgCodonsPerOpcode;

  return {
    drawingDensity,
    transformDensity,
    complexity,
    redundancy,
  };
}

/**
 * Compare two genome analyses
 * @returns Similarity score (0-100, where 100 = identical)
 */
export function compareAnalyses(a: CodonAnalysis, b: CodonAnalysis): number {
  // Compare opcode family distributions (weighted average)
  const familySimilarity =
    (100 - Math.abs(a.opcodeFamilies.drawing - b.opcodeFamilies.drawing)) *
      0.3 +
    (100 - Math.abs(a.opcodeFamilies.transform - b.opcodeFamilies.transform)) *
      0.2 +
    (100 - Math.abs(a.opcodeFamilies.stack - b.opcodeFamilies.stack)) * 0.2 +
    (100 - Math.abs(a.opcodeFamilies.control - b.opcodeFamilies.control)) *
      0.15 +
    (100 - Math.abs(a.opcodeFamilies.utility - b.opcodeFamilies.utility)) *
      0.15;

  // Compare GC content
  const gcSimilarity = 100 - Math.abs(a.gcContent - b.gcContent);

  // Compare signature metrics
  const signatureSimilarity =
    (100 - Math.abs(a.signature.drawingDensity - b.signature.drawingDensity)) *
      0.4 +
    (100 -
        Math.abs(a.signature.transformDensity - b.signature.transformDensity)) *
      0.3 +
    (100 - Math.abs(a.signature.complexity - b.signature.complexity) * 100) *
      0.3;

  // Weighted average
  return (
    familySimilarity * 0.5 + gcSimilarity * 0.2 + signatureSimilarity * 0.3
  );
}

/**
 * Format analysis results as human-readable text
 */
export function formatAnalysis(analysis: CodonAnalysis): string {
  const lines: string[] = [];

  lines.push("=== Codon Usage Analysis ===\n");
  lines.push(`Total Codons: ${analysis.totalCodons}`);
  lines.push(`GC Content: ${analysis.gcContent.toFixed(1)}%`);
  lines.push(`AT Content: ${analysis.atContent.toFixed(1)}%\n`);

  lines.push("Top 5 Codons:");
  for (const { codon, count, percentage } of analysis.topCodons) {
    lines.push(`  ${codon}: ${count} (${percentage.toFixed(1)}%)`);
  }

  lines.push("\nTop 5 Operations:");
  for (const { opcode, count, percentage } of analysis.topOpcodes) {
    lines.push(`  ${opcode}: ${count} (${percentage.toFixed(1)}%)`);
  }

  lines.push("\nOpcode Family Distribution:");
  lines.push(`  Control: ${analysis.opcodeFamilies.control.toFixed(1)}%`);
  lines.push(`  Drawing: ${analysis.opcodeFamilies.drawing.toFixed(1)}%`);
  lines.push(`  Transform: ${analysis.opcodeFamilies.transform.toFixed(1)}%`);
  lines.push(`  Stack: ${analysis.opcodeFamilies.stack.toFixed(1)}%`);
  lines.push(`  Utility: ${analysis.opcodeFamilies.utility.toFixed(1)}%`);

  lines.push("\nGenome Signature:");
  lines.push(
    `  Drawing Density: ${analysis.signature.drawingDensity.toFixed(1)}%`,
  );
  lines.push(
    `  Transform Density: ${analysis.signature.transformDensity.toFixed(1)}%`,
  );
  lines.push(
    `  Complexity: ${(analysis.signature.complexity * 100).toFixed(1)}%`,
  );
  lines.push(
    `  Redundancy: ${analysis.signature.redundancy.toFixed(2)} codons/opcode`,
  );

  return lines.join("\n");
}
