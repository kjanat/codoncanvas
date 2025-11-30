/**
 * Tests for types/genetics.ts
 *
 * Tests codon lookup, validation, and type guards.
 */

import { describe, expect, test } from "bun:test";
import {
  ALL_DNA_CODONS,
  CODON_MAP,
  createBase,
  DNA_CODON_MAP,
  dnaCodonToRna,
  isDNA,
  isDNACodon,
  isRNA,
  isRNACodon,
  lookupCodon,
  Opcode,
  RNA_CODON_MAP,
  rnaCodonToDna,
} from "@/types";

describe("types/genetics", () => {
  describe("CODON_MAP", () => {
    test("contains all 64 DNA codons", () => {
      expect(Object.keys(CODON_MAP).length).toBe(64);
    });

    test("ATG maps to START", () => {
      expect(CODON_MAP.ATG).toBe(Opcode.START);
    });

    test("TAA maps to STOP", () => {
      expect(CODON_MAP.TAA).toBe(Opcode.STOP);
    });

    test("TAG maps to STOP", () => {
      expect(CODON_MAP.TAG).toBe(Opcode.STOP);
    });

    test("TGA maps to STOP", () => {
      expect(CODON_MAP.TGA).toBe(Opcode.STOP);
    });
  });

  describe("DNA_CODON_MAP", () => {
    test("contains all 64 codons", () => {
      expect(Object.keys(DNA_CODON_MAP).length).toBe(64);
    });

    test("is equivalent to CODON_MAP", () => {
      expect(DNA_CODON_MAP).toEqual(CODON_MAP);
    });
  });

  describe("RNA_CODON_MAP", () => {
    test("contains all 64 RNA codons", () => {
      expect(Object.keys(RNA_CODON_MAP).length).toBe(64);
    });

    test("AUG maps to START (RNA notation)", () => {
      expect(RNA_CODON_MAP.AUG).toBe(Opcode.START);
    });

    test("UAA maps to STOP (RNA notation)", () => {
      expect(RNA_CODON_MAP.UAA).toBe(Opcode.STOP);
    });

    test("UAG maps to STOP (RNA notation)", () => {
      expect(RNA_CODON_MAP.UAG).toBe(Opcode.STOP);
    });

    test("UGA maps to STOP (RNA notation)", () => {
      expect(RNA_CODON_MAP.UGA).toBe(Opcode.STOP);
    });
  });

  describe("ALL_DNA_CODONS", () => {
    test("contains exactly 64 codons", () => {
      expect(ALL_DNA_CODONS.length).toBe(64);
    });

    test("includes ATG", () => {
      expect(ALL_DNA_CODONS).toContain("ATG");
    });

    test("includes TAA", () => {
      expect(ALL_DNA_CODONS).toContain("TAA");
    });

    test("all codons are 3 characters", () => {
      for (const codon of ALL_DNA_CODONS) {
        expect(codon.length).toBe(3);
      }
    });

    test("all codons contain only valid bases", () => {
      const validBases = new Set(["A", "C", "G", "T"]);
      for (const codon of ALL_DNA_CODONS) {
        for (const base of codon) {
          expect(validBases.has(base)).toBe(true);
        }
      }
    });
  });

  describe("lookupCodon", () => {
    test("looks up DNA codons", () => {
      expect(lookupCodon("ATG")).toBe(Opcode.START);
      expect(lookupCodon("TAA")).toBe(Opcode.STOP);
      expect(lookupCodon("GGA")).toBe(Opcode.CIRCLE);
    });

    test("looks up RNA codons (normalizes U to T)", () => {
      expect(lookupCodon("AUG")).toBe(Opcode.START);
      expect(lookupCodon("UAA")).toBe(Opcode.STOP);
      expect(lookupCodon("GGA")).toBe(Opcode.CIRCLE);
    });

    test("returns undefined for invalid codons", () => {
      expect(lookupCodon("XYZ")).toBeUndefined();
      expect(lookupCodon("ABC")).toBeUndefined();
      expect(lookupCodon("123")).toBeUndefined();
    });

    test("returns undefined for empty string", () => {
      expect(lookupCodon("")).toBeUndefined();
    });

    test("returns undefined for partial codons", () => {
      expect(lookupCodon("AT")).toBeUndefined();
      expect(lookupCodon("A")).toBeUndefined();
    });

    test("handles mixed case by treating as-is", () => {
      // lowercase should not match
      expect(lookupCodon("atg")).toBeUndefined();
    });
  });

  describe("Opcode enum", () => {
    test("START has value 0", () => {
      expect(Opcode.START).toBe(0);
    });

    test("STOP is defined", () => {
      expect(Opcode.STOP).toBeDefined();
    });

    test("CIRCLE is defined", () => {
      expect(Opcode.CIRCLE).toBeDefined();
    });

    test("RECT is defined", () => {
      expect(Opcode.RECT).toBeDefined();
    });

    test("TRANSLATE is defined", () => {
      expect(Opcode.TRANSLATE).toBeDefined();
    });
  });

  describe("codon family coverage", () => {
    test("all GG* codons map to CIRCLE (four-fold degenerate)", () => {
      expect(CODON_MAP.GGA).toBe(Opcode.CIRCLE);
      expect(CODON_MAP.GGC).toBe(Opcode.CIRCLE);
      expect(CODON_MAP.GGG).toBe(Opcode.CIRCLE);
      expect(CODON_MAP.GGT).toBe(Opcode.CIRCLE);
    });

    test("all CC* codons map to RECT (four-fold degenerate)", () => {
      expect(CODON_MAP.CCA).toBe(Opcode.RECT);
      expect(CODON_MAP.CCC).toBe(Opcode.RECT);
      expect(CODON_MAP.CCG).toBe(Opcode.RECT);
      expect(CODON_MAP.CCT).toBe(Opcode.RECT);
    });
  });

  describe("codon validation", () => {
    test("all DNA_CODON_MAP entries map to valid opcodes", () => {
      for (const [codon, opcode] of Object.entries(DNA_CODON_MAP)) {
        expect(typeof opcode).toBe("number");
        expect(codon.length).toBe(3);
      }
    });

    test("all RNA_CODON_MAP entries map to valid opcodes", () => {
      for (const [codon, opcode] of Object.entries(RNA_CODON_MAP)) {
        expect(typeof opcode).toBe("number");
        expect(codon.length).toBe(3);
      }
    });
  });

  describe("createBase", () => {
    test("creates DNA base with correct properties", () => {
      const adenine = createBase("DNA", "A");
      expect(adenine.type).toBe("DNA");
      expect(adenine.letter).toBe("A");
      expect(adenine.name).toBe("Adenine");
    });

    test("creates RNA base with correct properties", () => {
      const uracil = createBase("RNA", "U");
      expect(uracil.type).toBe("RNA");
      expect(uracil.letter).toBe("U");
      expect(uracil.name).toBe("Uracil");
    });

    test("creates all DNA bases", () => {
      const adenine = createBase("DNA", "A");
      const cytosine = createBase("DNA", "C");
      const guanine = createBase("DNA", "G");
      const thymine = createBase("DNA", "T");

      expect(adenine.name).toBe("Adenine");
      expect(cytosine.name).toBe("Cytosine");
      expect(guanine.name).toBe("Guanine");
      expect(thymine.name).toBe("Thymine");
    });

    test("creates all RNA bases", () => {
      const adenine = createBase("RNA", "A");
      const cytosine = createBase("RNA", "C");
      const guanine = createBase("RNA", "G");
      const uracil = createBase("RNA", "U");

      expect(adenine.name).toBe("Adenine");
      expect(cytosine.name).toBe("Cytosine");
      expect(guanine.name).toBe("Guanine");
      expect(uracil.name).toBe("Uracil");
    });
  });

  describe("isDNA type guard", () => {
    test("returns true for DNA bases", () => {
      const dnaBase = createBase("DNA", "A");
      expect(isDNA(dnaBase)).toBe(true);
    });

    test("returns false for RNA bases", () => {
      const rnaBase = createBase("RNA", "U");
      expect(isDNA(rnaBase)).toBe(false);
    });

    test("narrows type correctly", () => {
      const base = createBase("DNA", "T");
      if (isDNA(base)) {
        // Type should be narrowed to DNABase
        expect(base.letter).toBe("T");
        expect(base.type).toBe("DNA");
      }
    });
  });

  describe("isRNA type guard", () => {
    test("returns true for RNA bases", () => {
      const rnaBase = createBase("RNA", "U");
      expect(isRNA(rnaBase)).toBe(true);
    });

    test("returns false for DNA bases", () => {
      const dnaBase = createBase("DNA", "T");
      expect(isRNA(dnaBase)).toBe(false);
    });

    test("narrows type correctly", () => {
      const base = createBase("RNA", "U");
      if (isRNA(base)) {
        // Type should be narrowed to RNABase
        expect(base.letter).toBe("U");
        expect(base.type).toBe("RNA");
      }
    });
  });

  describe("isDNACodon", () => {
    test("returns true for valid DNA codons", () => {
      expect(isDNACodon("ATG")).toBe(true);
      expect(isDNACodon("TAA")).toBe(true);
      expect(isDNACodon("GGG")).toBe(true);
    });

    test("returns false for RNA codons", () => {
      expect(isDNACodon("AUG")).toBe(false);
      expect(isDNACodon("UAA")).toBe(false);
    });

    test("returns false for invalid strings", () => {
      expect(isDNACodon("XYZ")).toBe(false);
      expect(isDNACodon("AT")).toBe(false);
      expect(isDNACodon("ATGC")).toBe(false);
      expect(isDNACodon("")).toBe(false);
    });
  });

  describe("isRNACodon", () => {
    test("returns true for valid RNA codons", () => {
      expect(isRNACodon("AUG")).toBe(true);
      expect(isRNACodon("UAA")).toBe(true);
      expect(isRNACodon("GGG")).toBe(true);
    });

    test("returns false for DNA codons with T", () => {
      expect(isRNACodon("ATG")).toBe(false);
      expect(isRNACodon("TAA")).toBe(false);
    });

    test("returns false for invalid strings", () => {
      expect(isRNACodon("XYZ")).toBe(false);
      expect(isRNACodon("AU")).toBe(false);
      expect(isRNACodon("AUGC")).toBe(false);
      expect(isRNACodon("")).toBe(false);
    });
  });

  describe("dnaCodonToRna", () => {
    test("converts T to U", () => {
      expect(dnaCodonToRna("ATG")).toBe("AUG");
      expect(dnaCodonToRna("TAA")).toBe("UAA");
      expect(dnaCodonToRna("TTT")).toBe("UUU");
    });

    test("preserves A, C, G", () => {
      expect(dnaCodonToRna("AAA")).toBe("AAA");
      expect(dnaCodonToRna("CCC")).toBe("CCC");
      expect(dnaCodonToRna("GGG")).toBe("GGG");
    });
  });

  describe("rnaCodonToDna", () => {
    test("converts U to T", () => {
      expect(rnaCodonToDna("AUG")).toBe("ATG");
      expect(rnaCodonToDna("UAA")).toBe("TAA");
      expect(rnaCodonToDna("UUU")).toBe("TTT");
    });

    test("preserves A, C, G", () => {
      expect(rnaCodonToDna("AAA")).toBe("AAA");
      expect(rnaCodonToDna("CCC")).toBe("CCC");
      expect(rnaCodonToDna("GGG")).toBe("GGG");
    });
  });
});
