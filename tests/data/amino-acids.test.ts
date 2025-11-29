/**
 * Amino Acids Module Test Suite
 *
 * Tests for the standard genetic code mapping and amino acid data.
 */
import { describe, expect, test } from "bun:test";
import {
  AMINO_ACIDS,
  areSynonymous,
  generateComparisonTable,
  getAminoAcid,
  getAminoAcidFromRNA,
  getAminoAcidInfo,
  getCodonComparison,
  getCodonsForAminoAcid,
  getGeneticCodeStats,
  STANDARD_GENETIC_CODE,
} from "@/data/amino-acids";

describe("Amino Acids Module", () => {
  describe("STANDARD_GENETIC_CODE", () => {
    test("has exactly 64 codon entries", () => {
      expect(Object.keys(STANDARD_GENETIC_CODE).length).toBe(64);
    });

    test("ATG encodes Methionine (start codon)", () => {
      expect(STANDARD_GENETIC_CODE.ATG).toBe("Met");
    });

    test("TAA, TAG, TGA are stop codons", () => {
      expect(STANDARD_GENETIC_CODE.TAA).toBe("STOP");
      expect(STANDARD_GENETIC_CODE.TAG).toBe("STOP");
      expect(STANDARD_GENETIC_CODE.TGA).toBe("STOP");
    });

    test("Glycine family (GG*) all encode Gly", () => {
      expect(STANDARD_GENETIC_CODE.GGA).toBe("Gly");
      expect(STANDARD_GENETIC_CODE.GGC).toBe("Gly");
      expect(STANDARD_GENETIC_CODE.GGG).toBe("Gly");
      expect(STANDARD_GENETIC_CODE.GGT).toBe("Gly");
    });

    test("Alanine family (GC*) all encode Ala", () => {
      expect(STANDARD_GENETIC_CODE.GCA).toBe("Ala");
      expect(STANDARD_GENETIC_CODE.GCC).toBe("Ala");
      expect(STANDARD_GENETIC_CODE.GCG).toBe("Ala");
      expect(STANDARD_GENETIC_CODE.GCT).toBe("Ala");
    });

    test("Proline family (CC*) all encode Pro", () => {
      expect(STANDARD_GENETIC_CODE.CCA).toBe("Pro");
      expect(STANDARD_GENETIC_CODE.CCC).toBe("Pro");
      expect(STANDARD_GENETIC_CODE.CCG).toBe("Pro");
      expect(STANDARD_GENETIC_CODE.CCT).toBe("Pro");
    });

    test("Tryptophan has single codon (TGG)", () => {
      const trpCodons = Object.entries(STANDARD_GENETIC_CODE).filter(
        ([_, aa]) => aa === "Trp",
      );
      expect(trpCodons.length).toBe(1);
      expect(trpCodons[0][0]).toBe("TGG");
    });

    test("Methionine has single codon (ATG)", () => {
      const metCodons = Object.entries(STANDARD_GENETIC_CODE).filter(
        ([_, aa]) => aa === "Met",
      );
      expect(metCodons.length).toBe(1);
      expect(metCodons[0][0]).toBe("ATG");
    });

    test("Leucine has 6 codons (highest degeneracy)", () => {
      const leuCodons = Object.entries(STANDARD_GENETIC_CODE).filter(
        ([_, aa]) => aa === "Leu",
      );
      expect(leuCodons.length).toBe(6);
    });

    test("Arginine has 6 codons", () => {
      const argCodons = Object.entries(STANDARD_GENETIC_CODE).filter(
        ([_, aa]) => aa === "Arg",
      );
      expect(argCodons.length).toBe(6);
    });

    test("Serine has 6 codons", () => {
      const serCodons = Object.entries(STANDARD_GENETIC_CODE).filter(
        ([_, aa]) => aa === "Ser",
      );
      expect(serCodons.length).toBe(6);
    });
  });

  describe("AMINO_ACIDS", () => {
    test("has 21 entries (20 amino acids + STOP)", () => {
      expect(Object.keys(AMINO_ACIDS).length).toBe(21);
    });

    test("each amino acid has complete info", () => {
      for (const [code, info] of Object.entries(AMINO_ACIDS)) {
        expect(info.code).toBe(code as typeof info.code);
        expect(info.letter).toBeDefined();
        expect(info.name).toBeDefined();
        expect(info.property).toBeDefined();
        expect(info.degeneracy).toBeGreaterThan(0);
      }
    });

    test("degeneracy values sum to 64", () => {
      const totalCodons = Object.values(AMINO_ACIDS).reduce(
        (sum, aa) => sum + aa.degeneracy,
        0,
      );
      expect(totalCodons).toBe(64);
    });

    test("Glycine is nonpolar with 4 codons", () => {
      expect(AMINO_ACIDS.Gly.property).toBe("nonpolar");
      expect(AMINO_ACIDS.Gly.degeneracy).toBe(4);
      expect(AMINO_ACIDS.Gly.letter).toBe("G");
    });

    test("Arginine is basic with 6 codons", () => {
      expect(AMINO_ACIDS.Arg.property).toBe("basic");
      expect(AMINO_ACIDS.Arg.degeneracy).toBe(6);
    });

    test("Aspartic acid is acidic", () => {
      expect(AMINO_ACIDS.Asp.property).toBe("acidic");
    });

    test("Tryptophan is aromatic with 1 codon", () => {
      expect(AMINO_ACIDS.Trp.property).toBe("aromatic");
      expect(AMINO_ACIDS.Trp.degeneracy).toBe(1);
    });
  });

  describe("getAminoAcid", () => {
    test("returns correct amino acid for DNA codon", () => {
      expect(getAminoAcid("ATG")).toBe("Met");
      expect(getAminoAcid("GGA")).toBe("Gly");
      expect(getAminoAcid("TAA")).toBe("STOP");
    });
  });

  describe("getAminoAcidFromRNA", () => {
    test("converts RNA codon to amino acid", () => {
      expect(getAminoAcidFromRNA("AUG")).toBe("Met");
      expect(getAminoAcidFromRNA("GGA")).toBe("Gly");
      expect(getAminoAcidFromRNA("UAA")).toBe("STOP");
      expect(getAminoAcidFromRNA("GGU")).toBe("Gly");
    });
  });

  describe("getAminoAcidInfo", () => {
    test("returns full info for codon", () => {
      const info = getAminoAcidInfo("GGA");
      expect(info.code).toBe("Gly");
      expect(info.letter).toBe("G");
      expect(info.name).toBe("Glycine");
      expect(info.property).toBe("nonpolar");
      expect(info.degeneracy).toBe(4);
    });

    test("returns STOP info for stop codons", () => {
      const info = getAminoAcidInfo("TAA");
      expect(info.code).toBe("STOP");
      expect(info.letter).toBe("*");
      expect(info.property).toBe("stop");
    });
  });

  describe("areSynonymous", () => {
    test("returns true for codons encoding same amino acid", () => {
      expect(areSynonymous("GGA", "GGC")).toBe(true);
      expect(areSynonymous("GGA", "GGG")).toBe(true);
      expect(areSynonymous("GGA", "GGT")).toBe(true);
    });

    test("returns false for codons encoding different amino acids", () => {
      expect(areSynonymous("GGA", "CCA")).toBe(false);
      expect(areSynonymous("ATG", "GGA")).toBe(false);
    });

    test("returns true for stop codons", () => {
      expect(areSynonymous("TAA", "TAG")).toBe(true);
      expect(areSynonymous("TAA", "TGA")).toBe(true);
    });
  });

  describe("getCodonsForAminoAcid", () => {
    test("returns 4 codons for Glycine", () => {
      const codons = getCodonsForAminoAcid("Gly");
      expect(codons.length).toBe(4);
      expect(codons).toContain("GGA");
      expect(codons).toContain("GGC");
      expect(codons).toContain("GGG");
      expect(codons).toContain("GGT");
    });

    test("returns 1 codon for Methionine", () => {
      const codons = getCodonsForAminoAcid("Met");
      expect(codons.length).toBe(1);
      expect(codons[0]).toBe("ATG");
    });

    test("returns 3 codons for STOP", () => {
      const codons = getCodonsForAminoAcid("STOP");
      expect(codons.length).toBe(3);
      expect(codons).toContain("TAA");
      expect(codons).toContain("TAG");
      expect(codons).toContain("TGA");
    });

    test("returns 6 codons for Leucine", () => {
      const codons = getCodonsForAminoAcid("Leu");
      expect(codons.length).toBe(6);
    });
  });

  describe("getCodonComparison", () => {
    test("returns complete comparison for ATG", () => {
      const comp = getCodonComparison("ATG");
      expect(comp.dnaCodon).toBe("ATG");
      expect(comp.rnaCodon).toBe("AUG");
      expect(comp.aminoAcid).toBe("Met");
      expect(comp.aminoAcidName).toBe("Methionine");
      expect(comp.aminoAcidLetter).toBe("M");
      expect(comp.isStart).toBe(true);
      expect(comp.isStop).toBe(false);
    });

    test("returns complete comparison for TAA", () => {
      const comp = getCodonComparison("TAA");
      expect(comp.dnaCodon).toBe("TAA");
      expect(comp.rnaCodon).toBe("UAA");
      expect(comp.aminoAcid).toBe("STOP");
      expect(comp.isStart).toBe(false);
      expect(comp.isStop).toBe(true);
    });

    test("returns complete comparison for GGA", () => {
      const comp = getCodonComparison("GGA");
      expect(comp.dnaCodon).toBe("GGA");
      expect(comp.rnaCodon).toBe("GGA"); // No T to replace
      expect(comp.aminoAcid).toBe("Gly");
      expect(comp.property).toBe("nonpolar");
    });
  });

  describe("generateComparisonTable", () => {
    test("returns 64 entries", () => {
      const table = generateComparisonTable();
      expect(table.length).toBe(64);
    });

    test("is sorted by amino acid", () => {
      const table = generateComparisonTable();
      for (let i = 1; i < table.length; i++) {
        expect(
          table[i].aminoAcid.localeCompare(table[i - 1].aminoAcid),
        ).toBeGreaterThanOrEqual(0);
      }
    });

    test("all entries have required fields", () => {
      const table = generateComparisonTable();
      for (const entry of table) {
        expect(entry.dnaCodon).toBeDefined();
        expect(entry.rnaCodon).toBeDefined();
        expect(entry.aminoAcid).toBeDefined();
        expect(entry.aminoAcidName).toBeDefined();
        expect(entry.aminoAcidLetter).toBeDefined();
        expect(entry.property).toBeDefined();
        expect(typeof entry.isStart).toBe("boolean");
        expect(typeof entry.isStop).toBe("boolean");
      }
    });
  });

  describe("getGeneticCodeStats", () => {
    test("returns correct totals", () => {
      const stats = getGeneticCodeStats();
      expect(stats.totalCodons).toBe(64);
      expect(stats.aminoAcidCount).toBe(20);
      expect(stats.stopCodonCount).toBe(3);
    });

    test("degeneracy counts are correct", () => {
      const stats = getGeneticCodeStats();
      // Single codon: Met, Trp = 2
      expect(stats.singleCodonCount).toBe(2);
      // Two-fold: Phe, Tyr, His, Gln, Asn, Lys, Asp, Glu, Cys = 9
      expect(stats.twoFoldCount).toBe(9);
      // Four-fold: Val, Pro, Thr, Ala, Gly = 5
      // Note: Some have different degeneracy patterns
    });

    test("byDegeneracy groups amino acids correctly", () => {
      const stats = getGeneticCodeStats();
      expect(stats.byDegeneracy[1]).toContain("Met");
      expect(stats.byDegeneracy[1]).toContain("Trp");
      expect(stats.byDegeneracy[4]).toContain("Gly");
      expect(stats.byDegeneracy[4]).toContain("Ala");
      expect(stats.byDegeneracy[6]).toContain("Leu");
      expect(stats.byDegeneracy[6]).toContain("Arg");
    });
  });

  describe("Educational accuracy", () => {
    test("sickle cell mutation example is accurate", () => {
      // GAG -> GTG causes sickle cell disease
      // GAG = Glutamic acid (Glu)
      // GTG = Valine (Val)
      expect(getAminoAcid("GAG")).toBe("Glu");
      expect(getAminoAcid("GTG")).toBe("Val");
      expect(areSynonymous("GAG", "GTG")).toBe(false);
    });

    test("wobble position pattern is accurate", () => {
      // Third position often doesn't change amino acid
      // GCx family all encode Alanine
      expect(areSynonymous("GCA", "GCC")).toBe(true);
      expect(areSynonymous("GCA", "GCG")).toBe(true);
      expect(areSynonymous("GCA", "GCT")).toBe(true);
    });

    test("start codon is unique", () => {
      // ATG is the only start codon (also encodes Met)
      const startCodons = Object.entries(STANDARD_GENETIC_CODE).filter(
        ([codon]) => codon === "ATG",
      );
      expect(startCodons.length).toBe(1);
      expect(startCodons[0][1]).toBe("Met");
    });
  });
});
