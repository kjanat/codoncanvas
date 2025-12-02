/**
 * Tests for mutation-types data module
 */

import { describe, expect, test } from "bun:test";
import {
  getMutationTypeInfo,
  getMutationTypesByDifficulty,
  MUTATION_TYPE_LABELS,
  MUTATION_TYPES,
} from "@/data/mutation-types";

describe("MUTATION_TYPES", () => {
  test("contains all expected mutation types", () => {
    const types = MUTATION_TYPES.map((m) => m.type);

    expect(types).toContain("silent");
    expect(types).toContain("missense");
    expect(types).toContain("nonsense");
    expect(types).toContain("point");
    expect(types).toContain("insertion");
    expect(types).toContain("deletion");
    expect(types).toContain("frameshift");
    expect(types).toHaveLength(7);
  });

  test("each type has label and description", () => {
    for (const mutation of MUTATION_TYPES) {
      expect(mutation.type).toBeDefined();
      expect(mutation.label).toBeDefined();
      expect(mutation.label.length).toBeGreaterThan(0);
      expect(mutation.description).toBeDefined();
      expect(mutation.description.length).toBeGreaterThan(0);
    }
  });
});

describe("getMutationTypesByDifficulty", () => {
  test("easy difficulty returns only silent and missense", () => {
    const easyTypes = getMutationTypesByDifficulty("easy");
    const types = easyTypes.map((m) => m.type);

    expect(types).toContain("silent");
    expect(types).toContain("missense");
    expect(types).toHaveLength(2);
    expect(types).not.toContain("nonsense");
    expect(types).not.toContain("frameshift");
  });

  test("medium difficulty returns silent, missense, and nonsense", () => {
    const mediumTypes = getMutationTypesByDifficulty("medium");
    const types = mediumTypes.map((m) => m.type);

    expect(types).toContain("silent");
    expect(types).toContain("missense");
    expect(types).toContain("nonsense");
    expect(types).toHaveLength(3);
    expect(types).not.toContain("frameshift");
  });

  test("hard difficulty returns all mutation types", () => {
    const hardTypes = getMutationTypesByDifficulty("hard");

    expect(hardTypes).toHaveLength(MUTATION_TYPES.length);
    expect(hardTypes).toEqual(MUTATION_TYPES);
  });
});

describe("getMutationTypeInfo", () => {
  test("returns correct info for valid type", () => {
    const info = getMutationTypeInfo("silent");

    expect(info).toBeDefined();
    expect(info?.type).toBe("silent");
    expect(info?.label).toBe("Silent");
    expect(info?.description).toContain("synonymous");
  });

  test("returns undefined for invalid type", () => {
    const info = getMutationTypeInfo(
      "invalid" as Parameters<typeof getMutationTypeInfo>[0],
    );

    expect(info).toBeUndefined();
  });
});

describe("MUTATION_TYPE_LABELS", () => {
  test("contains labels for all types", () => {
    expect(MUTATION_TYPE_LABELS.silent).toBe("Silent");
    expect(MUTATION_TYPE_LABELS.missense).toBe("Missense");
    expect(MUTATION_TYPE_LABELS.nonsense).toBe("Nonsense");
    expect(MUTATION_TYPE_LABELS.point).toBe("Point");
    expect(MUTATION_TYPE_LABELS.insertion).toBe("Insertion");
    expect(MUTATION_TYPE_LABELS.deletion).toBe("Deletion");
    expect(MUTATION_TYPE_LABELS.frameshift).toBe("Frameshift");
  });
});
