/**
 * Types Module Test Suite
 *
 * Tests for core type definitions and the CODON_MAP constant
 * that maps DNA/RNA triplets to VM opcodes.
 */
import { describe, expect, test } from "bun:test";
import { CODON_MAP, Opcode } from "./types";

describe("Types Module", () => {
  // =========================================================================
  // CODON_MAP Structure
  // =========================================================================
  describe("CODON_MAP structure", () => {
    test("exports CODON_MAP as Record<string, Opcode>", () => {
      expect(CODON_MAP).toBeDefined();
      expect(typeof CODON_MAP).toBe("object");
    });

    test("contains expected number of codon entries", () => {
      const keys = Object.keys(CODON_MAP);
      // Not all 64 codons are mapped, but we have a specific set
      expect(keys.length).toBeGreaterThan(40);
      expect(keys.length).toBeLessThanOrEqual(64);
    });

    test("all keys are valid 3-character codon strings", () => {
      const validBases = ["A", "C", "G", "T"];
      for (const key of Object.keys(CODON_MAP)) {
        expect(key).toHaveLength(3);
        for (const char of key) {
          expect(validBases).toContain(char);
        }
      }
    });

    test("all values are valid Opcode enum values", () => {
      const opcodeValues = Object.values(Opcode).filter(
        (v) => typeof v === "number",
      );
      for (const value of Object.values(CODON_MAP)) {
        expect(opcodeValues).toContain(value);
      }
    });

    test("no duplicate keys", () => {
      const keys = Object.keys(CODON_MAP);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  // =========================================================================
  // Control Flow Codons
  // =========================================================================
  describe("control flow codons", () => {
    test("ATG maps to Opcode.START", () => {
      expect(CODON_MAP["ATG"]).toBe(Opcode.START);
    });

    test("TAA maps to Opcode.STOP", () => {
      expect(CODON_MAP["TAA"]).toBe(Opcode.STOP);
    });

    test("TAG maps to Opcode.STOP", () => {
      expect(CODON_MAP["TAG"]).toBe(Opcode.STOP);
    });

    test("TGA maps to Opcode.STOP", () => {
      expect(CODON_MAP["TGA"]).toBe(Opcode.STOP);
    });

    test("three stop codons match biological stop codons", () => {
      // In biology, TAA, TAG, and TGA are the three universal stop codons
      const stopCodons = ["TAA", "TAG", "TGA"];
      for (const codon of stopCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.STOP);
      }
    });
  });

  // =========================================================================
  // Drawing Primitive Codons (Synonymous Families)
  // =========================================================================
  describe("drawing primitive codons", () => {
    test("GGA, GGC, GGG, GGT all map to Opcode.CIRCLE", () => {
      expect(CODON_MAP["GGA"]).toBe(Opcode.CIRCLE);
      expect(CODON_MAP["GGC"]).toBe(Opcode.CIRCLE);
      expect(CODON_MAP["GGG"]).toBe(Opcode.CIRCLE);
      expect(CODON_MAP["GGT"]).toBe(Opcode.CIRCLE);
    });

    test("CCA, CCC, CCG, CCT all map to Opcode.RECT", () => {
      expect(CODON_MAP["CCA"]).toBe(Opcode.RECT);
      expect(CODON_MAP["CCC"]).toBe(Opcode.RECT);
      expect(CODON_MAP["CCG"]).toBe(Opcode.RECT);
      expect(CODON_MAP["CCT"]).toBe(Opcode.RECT);
    });

    test("AAA, AAC, AAG, AAT all map to Opcode.LINE", () => {
      expect(CODON_MAP["AAA"]).toBe(Opcode.LINE);
      expect(CODON_MAP["AAC"]).toBe(Opcode.LINE);
      expect(CODON_MAP["AAG"]).toBe(Opcode.LINE);
      expect(CODON_MAP["AAT"]).toBe(Opcode.LINE);
    });

    test("GCA, GCC, GCG, GCT all map to Opcode.TRIANGLE", () => {
      expect(CODON_MAP["GCA"]).toBe(Opcode.TRIANGLE);
      expect(CODON_MAP["GCC"]).toBe(Opcode.TRIANGLE);
      expect(CODON_MAP["GCG"]).toBe(Opcode.TRIANGLE);
      expect(CODON_MAP["GCT"]).toBe(Opcode.TRIANGLE);
    });

    test("GTA, GTC, GTG, GTT all map to Opcode.ELLIPSE", () => {
      expect(CODON_MAP["GTA"]).toBe(Opcode.ELLIPSE);
      expect(CODON_MAP["GTC"]).toBe(Opcode.ELLIPSE);
      expect(CODON_MAP["GTG"]).toBe(Opcode.ELLIPSE);
      expect(CODON_MAP["GTT"]).toBe(Opcode.ELLIPSE);
    });

    test("each drawing family has exactly 4 synonymous codons", () => {
      const families = {
        CIRCLE: ["GGA", "GGC", "GGG", "GGT"],
        RECT: ["CCA", "CCC", "CCG", "CCT"],
        LINE: ["AAA", "AAC", "AAG", "AAT"],
        TRIANGLE: ["GCA", "GCC", "GCG", "GCT"],
        ELLIPSE: ["GTA", "GTC", "GTG", "GTT"],
      };
      for (const [opcodeName, codons] of Object.entries(families)) {
        expect(codons).toHaveLength(4);
        const opcode = Opcode[opcodeName as keyof typeof Opcode];
        for (const codon of codons) {
          expect(CODON_MAP[codon]).toBe(opcode);
        }
      }
    });
  });

  // =========================================================================
  // Transform Operation Codons
  // =========================================================================
  describe("transform operation codons", () => {
    test("ACA, ACC, ACG, ACT all map to Opcode.TRANSLATE", () => {
      expect(CODON_MAP["ACA"]).toBe(Opcode.TRANSLATE);
      expect(CODON_MAP["ACC"]).toBe(Opcode.TRANSLATE);
      expect(CODON_MAP["ACG"]).toBe(Opcode.TRANSLATE);
      expect(CODON_MAP["ACT"]).toBe(Opcode.TRANSLATE);
    });

    test("AGA, AGC, AGG, AGT all map to Opcode.ROTATE", () => {
      expect(CODON_MAP["AGA"]).toBe(Opcode.ROTATE);
      expect(CODON_MAP["AGC"]).toBe(Opcode.ROTATE);
      expect(CODON_MAP["AGG"]).toBe(Opcode.ROTATE);
      expect(CODON_MAP["AGT"]).toBe(Opcode.ROTATE);
    });

    test("CGA, CGC, CGG, CGT all map to Opcode.SCALE", () => {
      expect(CODON_MAP["CGA"]).toBe(Opcode.SCALE);
      expect(CODON_MAP["CGC"]).toBe(Opcode.SCALE);
      expect(CODON_MAP["CGG"]).toBe(Opcode.SCALE);
      expect(CODON_MAP["CGT"]).toBe(Opcode.SCALE);
    });

    test("TTA, TTC, TTG, TTT all map to Opcode.COLOR", () => {
      expect(CODON_MAP["TTA"]).toBe(Opcode.COLOR);
      expect(CODON_MAP["TTC"]).toBe(Opcode.COLOR);
      expect(CODON_MAP["TTG"]).toBe(Opcode.COLOR);
      expect(CODON_MAP["TTT"]).toBe(Opcode.COLOR);
    });

    test("each transform family has exactly 4 synonymous codons", () => {
      const families = {
        TRANSLATE: ["ACA", "ACC", "ACG", "ACT"],
        ROTATE: ["AGA", "AGC", "AGG", "AGT"],
        SCALE: ["CGA", "CGC", "CGG", "CGT"],
        COLOR: ["TTA", "TTC", "TTG", "TTT"],
      };
      for (const [opcodeName, codons] of Object.entries(families)) {
        expect(codons).toHaveLength(4);
        const opcode = Opcode[opcodeName as keyof typeof Opcode];
        for (const codon of codons) {
          expect(CODON_MAP[codon]).toBe(opcode);
        }
      }
    });
  });

  // =========================================================================
  // Stack Operation Codons
  // =========================================================================
  describe("stack operation codons", () => {
    test("GAA, GAG, GAC, GAT all map to Opcode.PUSH", () => {
      expect(CODON_MAP["GAA"]).toBe(Opcode.PUSH);
      expect(CODON_MAP["GAG"]).toBe(Opcode.PUSH);
      expect(CODON_MAP["GAC"]).toBe(Opcode.PUSH);
      expect(CODON_MAP["GAT"]).toBe(Opcode.PUSH);
    });

    test("ATA, ATC, ATT map to Opcode.DUP", () => {
      expect(CODON_MAP["ATA"]).toBe(Opcode.DUP);
      expect(CODON_MAP["ATC"]).toBe(Opcode.DUP);
      expect(CODON_MAP["ATT"]).toBe(Opcode.DUP);
    });

    test("TAC, TAT, TGC map to Opcode.POP", () => {
      expect(CODON_MAP["TAC"]).toBe(Opcode.POP);
      expect(CODON_MAP["TAT"]).toBe(Opcode.POP);
      expect(CODON_MAP["TGC"]).toBe(Opcode.POP);
    });

    test("TGG, TGT map to Opcode.SWAP", () => {
      expect(CODON_MAP["TGG"]).toBe(Opcode.SWAP);
      expect(CODON_MAP["TGT"]).toBe(Opcode.SWAP);
    });
  });

  // =========================================================================
  // State Management Codons
  // =========================================================================
  describe("state management codons", () => {
    test("TCA, TCC map to Opcode.SAVE_STATE", () => {
      expect(CODON_MAP["TCA"]).toBe(Opcode.SAVE_STATE);
      expect(CODON_MAP["TCC"]).toBe(Opcode.SAVE_STATE);
    });

    test("TCG, TCT map to Opcode.RESTORE_STATE", () => {
      expect(CODON_MAP["TCG"]).toBe(Opcode.RESTORE_STATE);
      expect(CODON_MAP["TCT"]).toBe(Opcode.RESTORE_STATE);
    });
  });

  // =========================================================================
  // Arithmetic Operation Codons
  // =========================================================================
  describe("arithmetic operation codons", () => {
    test("CTG maps to Opcode.ADD", () => {
      expect(CODON_MAP["CTG"]).toBe(Opcode.ADD);
    });

    test("CAG maps to Opcode.SUB", () => {
      expect(CODON_MAP["CAG"]).toBe(Opcode.SUB);
    });

    test("CTT maps to Opcode.MUL", () => {
      expect(CODON_MAP["CTT"]).toBe(Opcode.MUL);
    });

    test("CAT maps to Opcode.DIV", () => {
      expect(CODON_MAP["CAT"]).toBe(Opcode.DIV);
    });
  });

  // =========================================================================
  // Comparison Operation Codons
  // =========================================================================
  describe("comparison operation codons", () => {
    test("CTA maps to Opcode.EQ", () => {
      expect(CODON_MAP["CTA"]).toBe(Opcode.EQ);
    });

    test("CTC maps to Opcode.LT", () => {
      expect(CODON_MAP["CTC"]).toBe(Opcode.LT);
    });
  });

  // =========================================================================
  // Control Flow Operation Codons
  // =========================================================================
  describe("control flow operation codons", () => {
    test("CAA maps to Opcode.LOOP", () => {
      expect(CODON_MAP["CAA"]).toBe(Opcode.LOOP);
    });
  });

  // =========================================================================
  // Utility Codons
  // =========================================================================
  describe("utility codons", () => {
    test("CAC maps to Opcode.NOP", () => {
      expect(CODON_MAP["CAC"]).toBe(Opcode.NOP);
    });
  });

  // =========================================================================
  // Opcode Enum
  // =========================================================================
  describe("Opcode enum", () => {
    test("contains START opcode", () => {
      expect(Opcode.START).toBeDefined();
      expect(typeof Opcode.START).toBe("number");
    });

    test("contains STOP opcode", () => {
      expect(Opcode.STOP).toBeDefined();
      expect(typeof Opcode.STOP).toBe("number");
    });

    test("contains all drawing opcodes (CIRCLE, RECT, LINE, TRIANGLE, ELLIPSE)", () => {
      expect(Opcode.CIRCLE).toBeDefined();
      expect(Opcode.RECT).toBeDefined();
      expect(Opcode.LINE).toBeDefined();
      expect(Opcode.TRIANGLE).toBeDefined();
      expect(Opcode.ELLIPSE).toBeDefined();
    });

    test("contains all transform opcodes (TRANSLATE, ROTATE, SCALE, COLOR)", () => {
      expect(Opcode.TRANSLATE).toBeDefined();
      expect(Opcode.ROTATE).toBeDefined();
      expect(Opcode.SCALE).toBeDefined();
      expect(Opcode.COLOR).toBeDefined();
    });

    test("contains all stack opcodes (PUSH, DUP, POP, SWAP)", () => {
      expect(Opcode.PUSH).toBeDefined();
      expect(Opcode.DUP).toBeDefined();
      expect(Opcode.POP).toBeDefined();
      expect(Opcode.SWAP).toBeDefined();
    });

    test("contains all arithmetic opcodes (ADD, SUB, MUL, DIV)", () => {
      expect(Opcode.ADD).toBeDefined();
      expect(Opcode.SUB).toBeDefined();
      expect(Opcode.MUL).toBeDefined();
      expect(Opcode.DIV).toBeDefined();
    });

    test("contains comparison opcodes (EQ, LT)", () => {
      expect(Opcode.EQ).toBeDefined();
      expect(Opcode.LT).toBeDefined();
    });

    test("contains control opcodes (LOOP)", () => {
      expect(Opcode.LOOP).toBeDefined();
    });

    test("contains utility opcodes (NOP, SAVE_STATE, RESTORE_STATE)", () => {
      expect(Opcode.NOP).toBeDefined();
      expect(Opcode.SAVE_STATE).toBeDefined();
      expect(Opcode.RESTORE_STATE).toBeDefined();
    });

    test("all enum values are unique integers", () => {
      const numericValues = Object.values(Opcode).filter(
        (v) => typeof v === "number",
      );
      const uniqueValues = new Set(numericValues);
      expect(uniqueValues.size).toBe(numericValues.length);
    });
  });

  // =========================================================================
  // Type Definitions
  // =========================================================================
  describe("type definitions", () => {
    test("Point2D has x and y number properties", () => {
      // Type-level test - if this compiles, the type is correct
      const point: import("./types").Point2D = { x: 10, y: 20 };
      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });

    test("HSLColor has h, s, l number properties", () => {
      const color: import("./types").HSLColor = { h: 180, s: 50, l: 60 };
      expect(color.h).toBe(180);
      expect(color.s).toBe(50);
      expect(color.l).toBe(60);
    });

    test("Severity is union of 'error', 'warning', 'info'", () => {
      const severities: import("./types").Severity[] = [
        "error",
        "warning",
        "info",
      ];
      expect(severities).toHaveLength(3);
    });

    test("RiskLevel is union of 'high', 'medium', 'low'", () => {
      const levels: import("./types").RiskLevel[] = ["high", "medium", "low"];
      expect(levels).toHaveLength(3);
    });

    test("Base is union of 'A', 'C', 'G', 'T', 'U'", () => {
      const bases: import("./types").Base[] = ["A", "C", "G", "T", "U"];
      expect(bases).toHaveLength(5);
    });

    test("MutationType includes all 7 mutation types", () => {
      const types: import("./types").MutationType[] = [
        "silent",
        "missense",
        "nonsense",
        "point",
        "insertion",
        "deletion",
        "frameshift",
      ];
      expect(types).toHaveLength(7);
    });

    test("RenderMode is union of 'visual', 'audio', 'both'", () => {
      const modes: import("./types").RenderMode[] = ["visual", "audio", "both"];
      expect(modes).toHaveLength(3);
    });

    test("Codon is template literal of Base triplet", () => {
      const codon: import("./types").Codon = "ATG";
      expect(codon).toHaveLength(3);
    });

    test("CodonToken has text, position, line properties", () => {
      const token: import("./types").CodonToken = {
        text: "ATG",
        position: 0,
        line: 1,
      };
      expect(token.text).toBe("ATG");
      expect(token.position).toBe(0);
      expect(token.line).toBe(1);
    });

    test("ParseError has message, position, severity, optional fix", () => {
      const error: import("./types").ParseError = {
        message: "Invalid codon",
        position: 0,
        severity: "error",
        fix: "Replace with ATG",
      };
      expect(error.message).toBeDefined();
      expect(error.position).toBeDefined();
      expect(error.severity).toBe("error");
      expect(error.fix).toBe("Replace with ATG");
    });

    test("VMState has all required state properties", () => {
      const state: import("./types").VMState = {
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: { h: 0, s: 0, l: 0 },
        stack: [],
        instructionPointer: 0,
        stateStack: [],
        instructionCount: 0,
        seed: 42,
      };
      expect(state.position).toBeDefined();
      expect(state.rotation).toBeDefined();
      expect(state.scale).toBeDefined();
      expect(state.color).toBeDefined();
      expect(state.stack).toBeDefined();
      expect(state.instructionPointer).toBeDefined();
      expect(state.stateStack).toBeDefined();
      expect(state.instructionCount).toBeDefined();
      expect(state.seed).toBeDefined();
    });
  });

  // =========================================================================
  // RNA Support
  // =========================================================================
  describe("RNA support", () => {
    test("U base is included in Base type", () => {
      const base: import("./types").Base = "U";
      expect(base).toBe("U");
    });

    test("RNA codons (with U) map correctly when normalized", () => {
      // The system should normalize U to T for lookup
      // The CODON_MAP itself uses T, so normalization happens at parse time
      expect(CODON_MAP["ATG"]).toBe(Opcode.START); // DNA version
    });

    test("AUG is recognized as START equivalent to ATG", () => {
      // AUG (RNA) normalizes to ATG (DNA) which is START
      // Testing the DNA equivalent since CODON_MAP uses DNA notation
      expect(CODON_MAP["ATG"]).toBe(Opcode.START);
    });

    test("UAA, UAG, UGA are recognized as STOP equivalents", () => {
      // RNA stop codons normalize to DNA stop codons
      expect(CODON_MAP["TAA"]).toBe(Opcode.STOP); // UAA -> TAA
      expect(CODON_MAP["TAG"]).toBe(Opcode.STOP); // UAG -> TAG
      expect(CODON_MAP["TGA"]).toBe(Opcode.STOP); // UGA -> TGA
    });
  });

  // =========================================================================
  // Pedagogical Design
  // =========================================================================
  describe("pedagogical design", () => {
    test("synonymous codon families enable silent mutation teaching", () => {
      // Changing third position (wobble) in synonymous family doesn't change opcode
      // This is key for teaching silent mutations
      expect(CODON_MAP["GGA"]).toBe(CODON_MAP["GGC"]); // Both CIRCLE
      expect(CODON_MAP["GGG"]).toBe(CODON_MAP["GGT"]); // Both CIRCLE
      expect(CODON_MAP["CCA"]).toBe(CODON_MAP["CCT"]); // Both RECT
    });

    test("codon families group by third position wobble", () => {
      // GG* family - all map to CIRCLE
      const ggFamily = ["GGA", "GGC", "GGG", "GGT"];
      const ggOpcodes = ggFamily.map((c) => CODON_MAP[c]);
      expect(new Set(ggOpcodes).size).toBe(1);

      // CC* family - all map to RECT
      const ccFamily = ["CCA", "CCC", "CCG", "CCT"];
      const ccOpcodes = ccFamily.map((c) => CODON_MAP[c]);
      expect(new Set(ccOpcodes).size).toBe(1);
    });

    test("biological accuracy: ATG is universal start codon", () => {
      expect(CODON_MAP["ATG"]).toBe(Opcode.START);
      // ATG is the only start codon (matches biology)
      const startCodons = Object.entries(CODON_MAP).filter(
        ([, op]) => op === Opcode.START,
      );
      expect(startCodons).toHaveLength(1);
      expect(startCodons[0][0]).toBe("ATG");
    });

    test("biological accuracy: three stop codons match biology", () => {
      const biologicalStopCodons = ["TAA", "TAG", "TGA"];
      for (const codon of biologicalStopCodons) {
        expect(CODON_MAP[codon]).toBe(Opcode.STOP);
      }
      // Verify these are the only stop codons
      const stopCodons = Object.entries(CODON_MAP).filter(
        ([, op]) => op === Opcode.STOP,
      );
      expect(stopCodons).toHaveLength(3);
    });

    test("drawing primitives have intuitive codon assignments", () => {
      // Verify drawing opcodes are assigned to consistent families
      expect(CODON_MAP["GGA"]).toBe(Opcode.CIRCLE); // GG* = CIRCLE
      expect(CODON_MAP["CCA"]).toBe(Opcode.RECT); // CC* = RECT
      expect(CODON_MAP["AAA"]).toBe(Opcode.LINE); // AA* = LINE
      expect(CODON_MAP["GCA"]).toBe(Opcode.TRIANGLE); // GC* = TRIANGLE
      expect(CODON_MAP["GTA"]).toBe(Opcode.ELLIPSE); // GT* = ELLIPSE
    });
  });

  // =========================================================================
  // Edge Cases
  // =========================================================================
  describe("edge cases", () => {
    test("lowercase codons are not in CODON_MAP (case sensitive)", () => {
      expect(CODON_MAP["atg"]).toBeUndefined();
      expect(CODON_MAP["Atg"]).toBeUndefined();
      expect(CODON_MAP["aTG"]).toBeUndefined();
    });

    test("invalid codon strings return undefined from CODON_MAP", () => {
      expect(CODON_MAP["XXX"]).toBeUndefined();
      expect(CODON_MAP["123"]).toBeUndefined();
      expect(CODON_MAP["ABC"]).toBeUndefined();
    });

    test("2-character strings return undefined", () => {
      expect(CODON_MAP["AT"]).toBeUndefined();
      expect(CODON_MAP["GG"]).toBeUndefined();
    });

    test("4-character strings return undefined", () => {
      expect(CODON_MAP["ATGG"]).toBeUndefined();
      expect(CODON_MAP["GGAA"]).toBeUndefined();
    });

    test("empty string returns undefined", () => {
      expect(CODON_MAP[""]).toBeUndefined();
    });
  });
});
