import { describe, expect, test } from "bun:test";
import {
  applyDeletion,
  applyFrameshiftMutation,
  applyInsertion,
  applyMissenseMutation,
  applyNonsenseMutation,
  applyPointMutation,
  applySilentMutation,
  compareGenomes,
} from "@/genetics/mutations";
import { CODON_MAP, lookupCodon } from "@/types";

describe("Mutation Tools", () => {
  describe("applySilentMutation", () => {
    test("produces different codon with same opcode", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applySilentMutation(genome);

      expect(result.type).toBe("silent");
      expect(result.mutated).not.toBe(genome);

      // Parse codons
      const originalCodons = genome.split(" ");
      const mutatedCodons = result.mutated.split(" ");

      // Find the changed codon
      const changedPos = originalCodons.findIndex(
        (c, i) => c !== mutatedCodons[i],
      );
      expect(changedPos).toBeGreaterThanOrEqual(0);

      const originalCodon = originalCodons[changedPos];
      const mutatedCodon = mutatedCodons[changedPos];

      // Should map to same opcode
      expect(lookupCodon(originalCodon)).toBe(lookupCodon(mutatedCodon));
    });

    test("respects position parameter", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applySilentMutation(genome, 1); // Mutate GGA

      const codons = result.mutated.split(" ");
      expect(codons[1]).not.toBe("GGA");
      expect(["GGC", "GGG", "GGT"]).toContain(codons[1]);
    });

    test("throws when no synonymous codons available", () => {
      const genome = "ATG"; // Only START (no synonyms)
      expect(() => applySilentMutation(genome)).toThrow(
        "No synonymous mutations available",
      );
    });

    test("throws when specified position has no synonymous codons", () => {
      const genome = "ATG GGA TAA";
      // ATG (START) at position 0 has no synonymous codons
      expect(() => applySilentMutation(genome, 0)).toThrow(
        /No synonymous codons for ATG at position 0/,
      );
    });

    test("handles position at exact boundary", () => {
      const genome = "ATG GGA TAA";
      // Position 2 is TAA which has synonyms (TAG, TGA)
      const result = applySilentMutation(genome, 2);
      const codons = result.mutated.split(" ");
      expect(["TAG", "TGA"]).toContain(codons[2]);
    });
  });

  describe("applyMissenseMutation", () => {
    test("produces different codon with different opcode", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyMissenseMutation(genome);

      expect(result.type).toBe("missense");

      const originalCodons = genome.split(" ");
      const mutatedCodons = result.mutated.split(" ");

      const changedPos = originalCodons.findIndex(
        (c, i) => c !== mutatedCodons[i],
      );
      expect(changedPos).toBeGreaterThanOrEqual(0);

      const originalCodon = originalCodons[changedPos];
      const mutatedCodon = mutatedCodons[changedPos];

      // Should map to different opcode
      expect(lookupCodon(originalCodon)).not.toBe(lookupCodon(mutatedCodon));
    });

    test("does not introduce STOP codon", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyMissenseMutation(genome);

      const codons = result.mutated.split(" ");
      // Exclude the last STOP codon
      const nonStopCodons = codons.slice(0, -1);

      for (const codon of nonStopCodons) {
        expect(["TAA", "TAG", "TGA"]).not.toContain(codon);
      }
    });

    test("respects position parameter", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyMissenseMutation(genome, 1); // Mutate GGA

      const codons = result.mutated.split(" ");
      expect(codons[1]).not.toBe("GGA");
      // Should be a different opcode (not CIRCLE)
      expect(lookupCodon(codons[1])).not.toBe(CODON_MAP.GGA);
    });
  });

  describe("applyNonsenseMutation", () => {
    test("introduces STOP codon", () => {
      const genome = "ATG GGA CCA GCA TAA";
      const result = applyNonsenseMutation(genome);

      expect(result.type).toBe("nonsense");

      const codons = result.mutated.split(" ");
      const stopCount = codons.filter((c) =>
        ["TAA", "TAG", "TGA"].includes(c),
      ).length;

      // Should have more STOP codons than original
      expect(stopCount).toBeGreaterThan(1);
    });

    test("does not mutate START codon", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyNonsenseMutation(genome);

      const codons = result.mutated.split(" ");
      expect(codons[0]).toBe("ATG");
    });

    test("throws when no nonsense mutation positions available", () => {
      // Only ATG and TAA - no codons to mutate to STOP
      const genome = "ATG TAA";
      expect(() => applyNonsenseMutation(genome)).toThrow(
        "No nonsense mutation positions available",
      );
    });

    test("respects position parameter", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyNonsenseMutation(genome, 1); // Mutate GGA to STOP

      const codons = result.mutated.split(" ");
      expect(codons[1]).toBe("TAA");
    });
  });

  describe("applyPointMutation", () => {
    test("changes single base", () => {
      const genome = "ATG GGA TAA";
      const result = applyPointMutation(genome);

      expect(result.type).toBe("point");

      // Count base differences
      const original = genome.replace(/\s+/g, "");
      const mutated = result.mutated.replace(/\s+/g, "");

      let differences = 0;
      for (let i = 0; i < original.length; i++) {
        if (original[i] !== mutated[i]) {
          differences++;
        }
      }

      expect(differences).toBe(1);
    });

    test("respects position parameter", () => {
      const genome = "ATGGGGTAA";
      const position = 3; // First G in GGA
      const result = applyPointMutation(genome, position);

      const original = genome[position];
      const mutated = result.mutated.replace(/\s+/g, "")[position];

      expect(mutated).not.toBe(original);
    });

    test("throws when position out of range", () => {
      const genome = "ATGGGGTAA"; // 9 bases
      expect(() => applyPointMutation(genome, 100)).toThrow(
        "Position 100 out of range",
      );
    });

    test("handles mutation at each position in codon", () => {
      const genome = "ATG GGA TAA";
      // Test that we can mutate at various positions
      const result0 = applyPointMutation(genome, 0);
      const result4 = applyPointMutation(genome, 4);

      expect(result0.type).toBe("point");
      expect(result4.type).toBe("point");
    });
  });

  describe("applyInsertion", () => {
    test("inserts bases into genome", () => {
      const genome = "ATG GGA TAA";
      const result = applyInsertion(genome, 3, 2); // Insert 2 bases at position 3

      expect(result.type).toBe("insertion");

      const original = genome.replace(/\s+/g, "");
      const mutated = result.mutated.replace(/\s+/g, "");

      expect(mutated.length).toBe(original.length + 2);
    });

    test("produces frameshift with non-triplet insertion", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyInsertion(genome, 3, 1); // Insert 1 base

      const original = genome.replace(/\s+/g, "");
      const mutated = result.mutated.replace(/\s+/g, "");

      // Length should differ by 1
      expect(mutated.length).toBe(original.length + 1);
      // Should not be divisible by 3 cleanly after insertion point
      expect((mutated.length - 3) % 3).toBe(1);
    });

    test("throws when position out of range", () => {
      const genome = "ATG GGA TAA"; // 9 bases
      expect(() => applyInsertion(genome, 100, 1)).toThrow(
        "Position 100 out of range",
      );
    });

    test("handles insertion at end of genome", () => {
      const genome = "ATG GGA TAA";
      const original = genome.replace(/\s+/g, "");
      const result = applyInsertion(genome, original.length, 3);

      expect(result.type).toBe("insertion");
      const mutated = result.mutated.replace(/\s+/g, "");
      expect(mutated.length).toBe(original.length + 3);
    });
  });

  describe("applyDeletion", () => {
    test("removes bases from genome", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyDeletion(genome, 3, 2); // Delete 2 bases

      expect(result.type).toBe("deletion");

      const original = genome.replace(/\s+/g, "");
      const mutated = result.mutated.replace(/\s+/g, "");

      expect(mutated.length).toBe(original.length - 2);
    });

    test("throws when deletion exceeds genome length", () => {
      const genome = "ATG GGA TAA";
      expect(() => applyDeletion(genome, 8, 5)).toThrow(
        "exceeds genome length",
      );
    });

    test("respects position parameter", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyDeletion(genome, 3, 3); // Delete at position 3

      expect(result.type).toBe("deletion");
      expect(result.position).toBe(3);
    });

    test("produces frameshift with non-triplet deletion", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyDeletion(genome, 3, 1); // Delete 1 base

      const original = genome.replace(/\s+/g, "");
      const mutated = result.mutated.replace(/\s+/g, "");

      expect(mutated.length).toBe(original.length - 1);
    });
  });

  describe("applyFrameshiftMutation", () => {
    test("produces frameshift via insertion or deletion", () => {
      const genome = "ATG GGA CCA TAA";
      const result = applyFrameshiftMutation(genome);

      expect(result.type).toBe("frameshift");
      expect(result.description).toContain("Frameshift");

      const original = genome.replace(/\s+/g, "");
      const mutated = result.mutated.replace(/\s+/g, "");

      // Length should differ by 1 or 2
      const diff = Math.abs(mutated.length - original.length);
      expect([1, 2]).toContain(diff);
    });
  });

  describe("compareGenomes", () => {
    test("identifies differences between genomes", () => {
      const original = "ATG GGA CCA TAA";
      const mutated = "ATG GGC CCA TAA"; // Silent mutation in GGA → GGC

      const comparison = compareGenomes(original, mutated);

      expect(comparison.differences).toHaveLength(1);
      expect(comparison.differences[0].position).toBe(1);
      expect(comparison.differences[0].original).toBe("GGA");
      expect(comparison.differences[0].mutated).toBe("GGC");
    });

    test("handles length differences", () => {
      const original = "ATG GGA CCA TAA";
      const mutated = "ATG GGA TAA"; // Deletion

      const comparison = compareGenomes(original, mutated);

      expect(comparison.originalCodons).toHaveLength(4);
      expect(comparison.mutatedCodons).toHaveLength(3);
      expect(comparison.differences.length).toBeGreaterThan(0);
    });

    test("returns empty differences for identical genomes", () => {
      const genome = "ATG GGA CCA TAA";
      const comparison = compareGenomes(genome, genome);

      expect(comparison.differences).toHaveLength(0);
    });
  });
});
