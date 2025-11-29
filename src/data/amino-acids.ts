/**
 * Standard Genetic Code - Amino Acid Mappings
 *
 * This module provides the real biological genetic code for educational
 * comparison with CodonCanvas opcodes. It maps all 64 DNA codons to their
 * corresponding amino acids (or STOP signal).
 *
 * @see https://en.wikipedia.org/wiki/DNA_and_RNA_codon_tables
 * @module
 */

import type { DNACodon, RNACodon } from "@/types/genetics";
import { dnaCodonToRna } from "@/types/genetics";

// ============ AMINO ACID TYPES ============

/**
 * Three-letter amino acid abbreviations (standard biochemistry notation).
 */
export type AminoAcidCode =
  | "Ala"
  | "Arg"
  | "Asn"
  | "Asp"
  | "Cys"
  | "Gln"
  | "Glu"
  | "Gly"
  | "His"
  | "Ile"
  | "Leu"
  | "Lys"
  | "Met"
  | "Phe"
  | "Pro"
  | "Ser"
  | "Thr"
  | "Trp"
  | "Tyr"
  | "Val"
  | "STOP";

/**
 * Single-letter amino acid codes (IUPAC standard).
 */
export type AminoAcidLetter =
  | "A"
  | "R"
  | "N"
  | "D"
  | "C"
  | "Q"
  | "E"
  | "G"
  | "H"
  | "I"
  | "L"
  | "K"
  | "M"
  | "F"
  | "P"
  | "S"
  | "T"
  | "W"
  | "Y"
  | "V"
  | "*";

/**
 * Full amino acid names.
 */
export type AminoAcidName =
  | "Alanine"
  | "Arginine"
  | "Asparagine"
  | "Aspartic acid"
  | "Cysteine"
  | "Glutamine"
  | "Glutamic acid"
  | "Glycine"
  | "Histidine"
  | "Isoleucine"
  | "Leucine"
  | "Lysine"
  | "Methionine"
  | "Phenylalanine"
  | "Proline"
  | "Serine"
  | "Threonine"
  | "Tryptophan"
  | "Tyrosine"
  | "Valine"
  | "Stop codon";

/**
 * Amino acid chemical property categories.
 */
export type AminoAcidProperty =
  | "nonpolar"
  | "polar"
  | "acidic"
  | "basic"
  | "aromatic"
  | "stop";

/**
 * Complete amino acid information.
 */
export interface AminoAcidInfo {
  /** Three-letter code (e.g., "Gly") */
  code: AminoAcidCode;
  /** Single-letter code (e.g., "G") */
  letter: AminoAcidLetter;
  /** Full name (e.g., "Glycine") */
  name: AminoAcidName;
  /** Chemical property category */
  property: AminoAcidProperty;
  /** Number of codons that encode this amino acid */
  degeneracy: number;
}

// ============ AMINO ACID DATABASE ============

/**
 * Complete amino acid reference data.
 */
export const AMINO_ACIDS: Record<AminoAcidCode, AminoAcidInfo> = {
  Ala: {
    code: "Ala",
    letter: "A",
    name: "Alanine",
    property: "nonpolar",
    degeneracy: 4,
  },
  Arg: {
    code: "Arg",
    letter: "R",
    name: "Arginine",
    property: "basic",
    degeneracy: 6,
  },
  Asn: {
    code: "Asn",
    letter: "N",
    name: "Asparagine",
    property: "polar",
    degeneracy: 2,
  },
  Asp: {
    code: "Asp",
    letter: "D",
    name: "Aspartic acid",
    property: "acidic",
    degeneracy: 2,
  },
  Cys: {
    code: "Cys",
    letter: "C",
    name: "Cysteine",
    property: "polar",
    degeneracy: 2,
  },
  Gln: {
    code: "Gln",
    letter: "Q",
    name: "Glutamine",
    property: "polar",
    degeneracy: 2,
  },
  Glu: {
    code: "Glu",
    letter: "E",
    name: "Glutamic acid",
    property: "acidic",
    degeneracy: 2,
  },
  Gly: {
    code: "Gly",
    letter: "G",
    name: "Glycine",
    property: "nonpolar",
    degeneracy: 4,
  },
  His: {
    code: "His",
    letter: "H",
    name: "Histidine",
    property: "basic",
    degeneracy: 2,
  },
  Ile: {
    code: "Ile",
    letter: "I",
    name: "Isoleucine",
    property: "nonpolar",
    degeneracy: 3,
  },
  Leu: {
    code: "Leu",
    letter: "L",
    name: "Leucine",
    property: "nonpolar",
    degeneracy: 6,
  },
  Lys: {
    code: "Lys",
    letter: "K",
    name: "Lysine",
    property: "basic",
    degeneracy: 2,
  },
  Met: {
    code: "Met",
    letter: "M",
    name: "Methionine",
    property: "nonpolar",
    degeneracy: 1,
  },
  Phe: {
    code: "Phe",
    letter: "F",
    name: "Phenylalanine",
    property: "aromatic",
    degeneracy: 2,
  },
  Pro: {
    code: "Pro",
    letter: "P",
    name: "Proline",
    property: "nonpolar",
    degeneracy: 4,
  },
  Ser: {
    code: "Ser",
    letter: "S",
    name: "Serine",
    property: "polar",
    degeneracy: 6,
  },
  Thr: {
    code: "Thr",
    letter: "T",
    name: "Threonine",
    property: "polar",
    degeneracy: 4,
  },
  Trp: {
    code: "Trp",
    letter: "W",
    name: "Tryptophan",
    property: "aromatic",
    degeneracy: 1,
  },
  Tyr: {
    code: "Tyr",
    letter: "Y",
    name: "Tyrosine",
    property: "aromatic",
    degeneracy: 2,
  },
  Val: {
    code: "Val",
    letter: "V",
    name: "Valine",
    property: "nonpolar",
    degeneracy: 4,
  },
  STOP: {
    code: "STOP",
    letter: "*",
    name: "Stop codon",
    property: "stop",
    degeneracy: 3,
  },
};

// ============ STANDARD GENETIC CODE ============

/**
 * Standard genetic code mapping DNA codons to amino acids.
 * This is the universal genetic code used by most organisms.
 *
 * @example
 * ```typescript
 * STANDARD_GENETIC_CODE["ATG"] // => "Met" (start codon)
 * STANDARD_GENETIC_CODE["GGA"] // => "Gly" (glycine)
 * STANDARD_GENETIC_CODE["TAA"] // => "STOP"
 * ```
 */
export const STANDARD_GENETIC_CODE: Record<DNACodon, AminoAcidCode> = {
  // Phenylalanine (Phe) - UUU, UUC
  TTT: "Phe",
  TTC: "Phe",

  // Leucine (Leu) - UUA, UUG, CUU, CUC, CUA, CUG
  TTA: "Leu",
  TTG: "Leu",
  CTT: "Leu",
  CTC: "Leu",
  CTA: "Leu",
  CTG: "Leu",

  // Isoleucine (Ile) - AUU, AUC, AUA
  ATT: "Ile",
  ATC: "Ile",
  ATA: "Ile",

  // Methionine (Met) - AUG (also START)
  ATG: "Met",

  // Valine (Val) - GUU, GUC, GUA, GUG
  GTT: "Val",
  GTC: "Val",
  GTA: "Val",
  GTG: "Val",

  // Serine (Ser) - UCU, UCC, UCA, UCG, AGU, AGC
  TCT: "Ser",
  TCC: "Ser",
  TCA: "Ser",
  TCG: "Ser",
  AGT: "Ser",
  AGC: "Ser",

  // Proline (Pro) - CCU, CCC, CCA, CCG
  CCT: "Pro",
  CCC: "Pro",
  CCA: "Pro",
  CCG: "Pro",

  // Threonine (Thr) - ACU, ACC, ACA, ACG
  ACT: "Thr",
  ACC: "Thr",
  ACA: "Thr",
  ACG: "Thr",

  // Alanine (Ala) - GCU, GCC, GCA, GCG
  GCT: "Ala",
  GCC: "Ala",
  GCA: "Ala",
  GCG: "Ala",

  // Tyrosine (Tyr) - UAU, UAC
  TAT: "Tyr",
  TAC: "Tyr",

  // STOP codons - UAA, UAG, UGA
  TAA: "STOP",
  TAG: "STOP",
  TGA: "STOP",

  // Histidine (His) - CAU, CAC
  CAT: "His",
  CAC: "His",

  // Glutamine (Gln) - CAA, CAG
  CAA: "Gln",
  CAG: "Gln",

  // Asparagine (Asn) - AAU, AAC
  AAT: "Asn",
  AAC: "Asn",

  // Lysine (Lys) - AAA, AAG
  AAA: "Lys",
  AAG: "Lys",

  // Aspartic acid (Asp) - GAU, GAC
  GAT: "Asp",
  GAC: "Asp",

  // Glutamic acid (Glu) - GAA, GAG
  GAA: "Glu",
  GAG: "Glu",

  // Cysteine (Cys) - UGU, UGC
  TGT: "Cys",
  TGC: "Cys",

  // Tryptophan (Trp) - UGG
  TGG: "Trp",

  // Arginine (Arg) - CGU, CGC, CGA, CGG, AGA, AGG
  CGT: "Arg",
  CGC: "Arg",
  CGA: "Arg",
  CGG: "Arg",
  AGA: "Arg",
  AGG: "Arg",

  // Glycine (Gly) - GGU, GGC, GGA, GGG
  GGT: "Gly",
  GGC: "Gly",
  GGA: "Gly",
  GGG: "Gly",
};

// ============ LOOKUP FUNCTIONS ============

/**
 * Get the amino acid for a DNA codon.
 *
 * @param codon - DNA codon (e.g., "ATG")
 * @returns Amino acid code (e.g., "Met")
 *
 * @example
 * ```typescript
 * getAminoAcid("ATG") // => "Met"
 * getAminoAcid("GGA") // => "Gly"
 * getAminoAcid("TAA") // => "STOP"
 * ```
 */
export function getAminoAcid(codon: DNACodon): AminoAcidCode {
  return STANDARD_GENETIC_CODE[codon];
}

/**
 * Get the amino acid for an RNA codon.
 *
 * @param codon - RNA codon (e.g., "AUG")
 * @returns Amino acid code (e.g., "Met")
 *
 * @example
 * ```typescript
 * getAminoAcidFromRNA("AUG") // => "Met"
 * getAminoAcidFromRNA("GGA") // => "Gly"
 * getAminoAcidFromRNA("UAA") // => "STOP"
 * ```
 */
export function getAminoAcidFromRNA(codon: RNACodon): AminoAcidCode {
  const dnaCodon = codon.replace(/U/g, "T") as DNACodon;
  return STANDARD_GENETIC_CODE[dnaCodon];
}

/**
 * Get full amino acid information for a codon.
 *
 * @param codon - DNA codon
 * @returns Complete amino acid info including name, properties, degeneracy
 *
 * @example
 * ```typescript
 * const info = getAminoAcidInfo("GGA");
 * // => { code: "Gly", letter: "G", name: "Glycine", property: "nonpolar", degeneracy: 4 }
 * ```
 */
export function getAminoAcidInfo(codon: DNACodon): AminoAcidInfo {
  const aa = STANDARD_GENETIC_CODE[codon];
  return AMINO_ACIDS[aa];
}

/**
 * Check if two codons encode the same amino acid (synonymous).
 *
 * @param codon1 - First DNA codon
 * @param codon2 - Second DNA codon
 * @returns True if both codons encode the same amino acid
 *
 * @example
 * ```typescript
 * areSynonymous("GGA", "GGC") // => true (both Glycine)
 * areSynonymous("GGA", "CCA") // => false (Glycine vs Proline)
 * ```
 */
export function areSynonymous(codon1: DNACodon, codon2: DNACodon): boolean {
  return STANDARD_GENETIC_CODE[codon1] === STANDARD_GENETIC_CODE[codon2];
}

/**
 * Get all codons that encode a specific amino acid.
 *
 * @param aminoAcid - Amino acid code (e.g., "Gly")
 * @returns Array of DNA codons encoding that amino acid
 *
 * @example
 * ```typescript
 * getCodonsForAminoAcid("Gly") // => ["GGA", "GGC", "GGG", "GGT"]
 * getCodonsForAminoAcid("Met") // => ["ATG"]
 * getCodonsForAminoAcid("STOP") // => ["TAA", "TAG", "TGA"]
 * ```
 */
export function getCodonsForAminoAcid(aminoAcid: AminoAcidCode): DNACodon[] {
  return (Object.entries(STANDARD_GENETIC_CODE) as [DNACodon, AminoAcidCode][])
    .filter(([_, aa]) => aa === aminoAcid)
    .map(([codon]) => codon);
}

/**
 * Set of STOP codons for efficient lookup.
 * Derived from STANDARD_GENETIC_CODE - single source of truth.
 */
export const STOP_CODONS: ReadonlySet<DNACodon> = new Set(
  getCodonsForAminoAcid("STOP"),
);

/**
 * Check if a codon is a STOP codon.
 * @param codon - DNA codon to check
 * @returns True if codon is TAA, TAG, or TGA
 */
export function isStopCodon(codon: string): boolean {
  return STOP_CODONS.has(codon as DNACodon);
}

// ============ COMPARISON UTILITIES ============

/**
 * Codon comparison data for educational display.
 */
export interface CodonComparison {
  /** DNA codon */
  dnaCodon: DNACodon;
  /** RNA equivalent */
  rnaCodon: RNACodon;
  /** Real biology amino acid */
  aminoAcid: AminoAcidCode;
  /** Full amino acid name */
  aminoAcidName: AminoAcidName;
  /** Amino acid single letter */
  aminoAcidLetter: AminoAcidLetter;
  /** Chemical property */
  property: AminoAcidProperty;
  /** Is this a start codon? */
  isStart: boolean;
  /** Is this a stop codon? */
  isStop: boolean;
}

/**
 * Get comprehensive comparison data for a codon.
 *
 * @param codon - DNA codon
 * @returns Full comparison data for educational display
 *
 * @example
 * ```typescript
 * const data = getCodonComparison("ATG");
 * // => {
 * //   dnaCodon: "ATG",
 * //   rnaCodon: "AUG",
 * //   aminoAcid: "Met",
 * //   aminoAcidName: "Methionine",
 * //   aminoAcidLetter: "M",
 * //   property: "nonpolar",
 * //   isStart: true,
 * //   isStop: false
 * // }
 * ```
 */
export function getCodonComparison(codon: DNACodon): CodonComparison {
  const aa = STANDARD_GENETIC_CODE[codon];
  const info = AMINO_ACIDS[aa];

  return {
    dnaCodon: codon,
    rnaCodon: dnaCodonToRna(codon),
    aminoAcid: aa,
    aminoAcidName: info.name,
    aminoAcidLetter: info.letter,
    property: info.property,
    isStart: codon === "ATG",
    isStop: aa === "STOP",
  };
}

/**
 * Generate comparison table data for all 64 codons.
 *
 * @returns Array of comparison data for all codons, sorted by amino acid
 */
export function generateComparisonTable(): CodonComparison[] {
  const codons = Object.keys(STANDARD_GENETIC_CODE) as DNACodon[];
  return codons
    .map(getCodonComparison)
    .sort((a, b) => a.aminoAcid.localeCompare(b.aminoAcid));
}

// ============ EDUCATIONAL STATISTICS ============

/**
 * Statistics about the genetic code for educational display.
 */
export interface GeneticCodeStats {
  /** Total number of codons */
  totalCodons: number;
  /** Number of amino acids (excluding STOP) */
  aminoAcidCount: number;
  /** Number of stop codons */
  stopCodonCount: number;
  /** Number of 4-fold degenerate amino acids */
  fourFoldCount: number;
  /** Number of 2-fold degenerate amino acids */
  twoFoldCount: number;
  /** Number of single-codon amino acids */
  singleCodonCount: number;
  /** Amino acids by degeneracy */
  byDegeneracy: Record<number, AminoAcidCode[]>;
}

/**
 * Get statistics about the genetic code.
 *
 * @returns Educational statistics about genetic code structure
 */
export function getGeneticCodeStats(): GeneticCodeStats {
  const byDegeneracy: Record<number, AminoAcidCode[]> = {};

  for (const [code, info] of Object.entries(AMINO_ACIDS)) {
    if (code === "STOP") continue;
    const deg = info.degeneracy;
    if (!byDegeneracy[deg]) byDegeneracy[deg] = [];
    byDegeneracy[deg].push(code as AminoAcidCode);
  }

  return {
    totalCodons: 64,
    aminoAcidCount: 20,
    stopCodonCount: 3,
    fourFoldCount: byDegeneracy[4]?.length ?? 0,
    twoFoldCount: byDegeneracy[2]?.length ?? 0,
    singleCodonCount: byDegeneracy[1]?.length ?? 0,
    byDegeneracy,
  };
}
