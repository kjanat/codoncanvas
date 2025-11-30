/**
 * Tests for types/genetics.ts
 *
 * Tests codon lookup, validation, and type guards.
 */

import { describe, expect, test } from "bun:test";
import {
  ALL_DNA_CODONS,
  CODON_MAP,
  DNA_CODON_MAP,
  lookupCodon,
  Opcode,
  RNA_CODON_MAP,
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
});
