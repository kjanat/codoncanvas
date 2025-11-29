/**
 * Nucleotide Display Module Test Suite
 *
 * Tests for DNA/RNA notation toggle functionality.
 */
import { beforeEach, describe, expect, test } from "bun:test";
import type { NucleotideDisplayMode } from "@/utils/nucleotide-display";
import {
  getModeButtonLabel,
  getModeButtonTooltip,
  getModeStatusMessage,
  getNucleotideDisplayMode,
  getNucleotideModeInfo,
  onNucleotideDisplayModeChange,
  setNucleotideDisplayMode,
  toggleNucleotideDisplayMode,
  transformCodonForDisplay,
  transformForDisplay,
  transformFromDisplay,
} from "@/utils/nucleotide-display";

describe("Nucleotide Display Module", () => {
  // Reset to DNA mode before each test
  beforeEach(() => {
    setNucleotideDisplayMode("DNA");
  });

  describe("mode state", () => {
    test("default mode is DNA", () => {
      expect(getNucleotideDisplayMode()).toBe("DNA");
    });

    test("setNucleotideDisplayMode changes mode", () => {
      setNucleotideDisplayMode("RNA");
      expect(getNucleotideDisplayMode()).toBe("RNA");
    });

    test("toggleNucleotideDisplayMode switches between DNA and RNA", () => {
      expect(getNucleotideDisplayMode()).toBe("DNA");

      const newMode = toggleNucleotideDisplayMode();
      expect(newMode).toBe("RNA");
      expect(getNucleotideDisplayMode()).toBe("RNA");

      const nextMode = toggleNucleotideDisplayMode();
      expect(nextMode).toBe("DNA");
      expect(getNucleotideDisplayMode()).toBe("DNA");
    });
  });

  describe("text transformation", () => {
    test("transformForDisplay in DNA mode returns unchanged text", () => {
      setNucleotideDisplayMode("DNA");
      expect(transformForDisplay("ATG GGA TAA")).toBe("ATG GGA TAA");
    });

    test("transformForDisplay in RNA mode converts T to U", () => {
      setNucleotideDisplayMode("RNA");
      expect(transformForDisplay("ATG GGA TAA")).toBe("AUG GGA UAA");
    });

    test("transformForDisplay handles multiple T characters", () => {
      setNucleotideDisplayMode("RNA");
      expect(transformForDisplay("TTT")).toBe("UUU");
      expect(transformForDisplay("ATT ACT AGT")).toBe("AUU ACU AGU");
    });

    test("transformFromDisplay normalizes U to T", () => {
      expect(transformFromDisplay("AUG GGA UAA")).toBe("ATG GGA TAA");
      expect(transformFromDisplay("ATG GGA TAA")).toBe("ATG GGA TAA");
    });

    test("transformFromDisplay handles mixed notation", () => {
      expect(transformFromDisplay("AUG ATG")).toBe("ATG ATG");
    });

    test("transformCodonForDisplay in DNA mode returns unchanged", () => {
      setNucleotideDisplayMode("DNA");
      expect(transformCodonForDisplay("ATG")).toBe("ATG");
      expect(transformCodonForDisplay("TAA")).toBe("TAA");
    });

    test("transformCodonForDisplay in RNA mode converts T to U", () => {
      setNucleotideDisplayMode("RNA");
      expect(transformCodonForDisplay("ATG")).toBe("AUG");
      expect(transformCodonForDisplay("TAA")).toBe("UAA");
      expect(transformCodonForDisplay("GGA")).toBe("GGA"); // No T to convert
    });
  });

  describe("listener management", () => {
    test("onNucleotideDisplayModeChange notifies on mode change", () => {
      const notifications: NucleotideDisplayMode[] = [];
      const unsubscribe = onNucleotideDisplayModeChange(
        (mode: NucleotideDisplayMode) => {
          notifications.push(mode);
        },
      );

      toggleNucleotideDisplayMode(); // DNA -> RNA
      toggleNucleotideDisplayMode(); // RNA -> DNA

      expect(notifications).toEqual(["RNA", "DNA"]);

      unsubscribe();
    });

    test("unsubscribe stops notifications", () => {
      const notifications: NucleotideDisplayMode[] = [];
      const unsubscribe = onNucleotideDisplayModeChange(
        (mode: NucleotideDisplayMode) => {
          notifications.push(mode);
        },
      );

      toggleNucleotideDisplayMode();
      unsubscribe();
      toggleNucleotideDisplayMode();

      expect(notifications).toEqual(["RNA"]);
    });

    test("multiple listeners receive notifications", () => {
      const notifications1: NucleotideDisplayMode[] = [];
      const notifications2: NucleotideDisplayMode[] = [];

      const unsub1 = onNucleotideDisplayModeChange(
        (mode: NucleotideDisplayMode) => {
          notifications1.push(mode);
        },
      );
      const unsub2 = onNucleotideDisplayModeChange(
        (mode: NucleotideDisplayMode) => {
          notifications2.push(mode);
        },
      );

      toggleNucleotideDisplayMode();

      expect(notifications1).toEqual(["RNA"]);
      expect(notifications2).toEqual(["RNA"]);

      unsub1();
      unsub2();
    });

    test("setNucleotideDisplayMode only notifies on actual change", () => {
      const notifications: NucleotideDisplayMode[] = [];
      const unsubscribe = onNucleotideDisplayModeChange(
        (mode: NucleotideDisplayMode) => {
          notifications.push(mode);
        },
      );

      setNucleotideDisplayMode("DNA"); // No change (already DNA)
      setNucleotideDisplayMode("RNA"); // Change
      setNucleotideDisplayMode("RNA"); // No change

      expect(notifications).toEqual(["RNA"]);

      unsubscribe();
    });
  });

  describe("UI helpers", () => {
    test("getModeButtonLabel returns correct labels", () => {
      expect(getModeButtonLabel("DNA")).toBe("🧬 DNA");
      expect(getModeButtonLabel("RNA")).toBe("🔬 RNA");
    });

    test("getModeButtonTooltip returns correct tooltips", () => {
      expect(getModeButtonTooltip("DNA")).toContain("RNA");
      expect(getModeButtonTooltip("RNA")).toContain("DNA");
    });

    test("getModeStatusMessage returns correct messages", () => {
      expect(getModeStatusMessage("DNA")).toContain("DNA");
      expect(getModeStatusMessage("DNA")).toContain("thymine");
      expect(getModeStatusMessage("RNA")).toContain("RNA");
      expect(getModeStatusMessage("RNA")).toContain("uracil");
    });
  });

  describe("educational helpers", () => {
    test("getNucleotideModeInfo returns DNA info when in DNA mode", () => {
      setNucleotideDisplayMode("DNA");
      const info = getNucleotideModeInfo();

      expect(info.mode).toBe("DNA");
      expect(info.baseLetter).toBe("T");
      expect(info.baseName).toBe("Thymine");
      expect(info.nucleicAcid).toBe("DNA");
      expect(info.description).toContain("Thymine");
      expect(info.biologicalContext).toContain("storage");
    });

    test("getNucleotideModeInfo returns RNA info when in RNA mode", () => {
      setNucleotideDisplayMode("RNA");
      const info = getNucleotideModeInfo();

      expect(info.mode).toBe("RNA");
      expect(info.baseLetter).toBe("U");
      expect(info.baseName).toBe("Uracil");
      expect(info.nucleicAcid).toBe("RNA");
      expect(info.description).toContain("Uracil");
      expect(info.biologicalContext).toContain("transcribed");
    });
  });

  describe("edge cases", () => {
    test("empty string transformation", () => {
      setNucleotideDisplayMode("RNA");
      expect(transformForDisplay("")).toBe("");
      expect(transformFromDisplay("")).toBe("");
    });

    test("whitespace-only transformation", () => {
      setNucleotideDisplayMode("RNA");
      expect(transformForDisplay("   ")).toBe("   ");
    });

    test("lowercase letters are not transformed", () => {
      setNucleotideDisplayMode("RNA");
      expect(transformForDisplay("atg")).toBe("atg"); // lowercase t unchanged
    });

    test("non-codon text with T is still transformed", () => {
      setNucleotideDisplayMode("RNA");
      expect(transformForDisplay("TEST")).toBe("UESU"); // All T's become U
    });
  });
});
