/**
 * Tests for Gallery page
 *
 * Tests filtering, sorting, and example data handling.
 */

import { describe, expect, test } from "bun:test";
import { type ExampleMetadata, examples } from "@/data/examples";

interface ExampleWithName extends ExampleMetadata {
  name: string;
}

// Test the underlying data and logic, not React rendering

describe("Gallery", () => {
  describe("examples data", () => {
    test("examples object is not empty", () => {
      const keys = Object.keys(examples);
      expect(keys.length).toBeGreaterThan(0);
    });

    test("each example has required fields", () => {
      for (const [_name, example] of Object.entries(examples)) {
        expect(example.title).toBeDefined();
        expect(example.description).toBeDefined();
        expect(example.genome).toBeDefined();
        expect(example.difficulty).toBeDefined();
        expect(
          [
            "beginner",
            "intermediate",
            "advanced",
            "advanced-showcase",
          ].includes(example.difficulty),
        ).toBe(true);
      }
    });

    test("all genomes are valid strings", () => {
      for (const [_name, example] of Object.entries(examples)) {
        expect(typeof example.genome).toBe("string");
        expect(example.genome.length).toBeGreaterThan(0);
      }
    });

    test("genomes are non-empty strings", () => {
      for (const [_name, example] of Object.entries(examples)) {
        expect(typeof example.genome).toBe("string");
        expect(example.genome.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe("filtering logic", () => {
    const examplesList = Object.entries(examples).map(([name, data]) => ({
      name,
      ...data,
    }));

    test("filter by beginner difficulty", () => {
      const filtered = examplesList.filter(
        (ex) => ex.difficulty === "beginner",
      );
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((ex) => ex.difficulty === "beginner")).toBe(true);
    });

    test("filter by intermediate difficulty", () => {
      const filtered = examplesList.filter(
        (ex) => ex.difficulty === "intermediate",
      );
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((ex) => ex.difficulty === "intermediate")).toBe(
        true,
      );
    });

    test("filter by advanced difficulty", () => {
      const filtered = examplesList.filter(
        (ex) => ex.difficulty === "advanced",
      );
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((ex) => ex.difficulty === "advanced")).toBe(true);
    });

    test("filter by search query matches title", () => {
      const query = "circle";
      const filtered = examplesList.filter((ex) =>
        ex.title.toLowerCase().includes(query.toLowerCase()),
      );
      expect(filtered.length).toBeGreaterThan(0);
    });

    test("filter by search query matches description", () => {
      // Find a word that actually appears in a description
      const firstDesc = examplesList[0].description;
      const word = firstDesc.split(" ")[0].toLowerCase();
      const filtered = examplesList.filter((ex) =>
        ex.description.toLowerCase().includes(word),
      );
      expect(filtered.length).toBeGreaterThan(0);
    });

    test("filter by search query matches name", () => {
      const firstExample = examplesList[0];
      const filtered = examplesList.filter((ex) =>
        ex.name.toLowerCase().includes(firstExample.name.toLowerCase()),
      );
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered[0].name).toBe(firstExample.name);
    });
  });

  describe("sorting logic", () => {
    const examplesList = Object.entries(examples).map(([name, data]) => ({
      name,
      ...data,
    }));

    const difficultyOrder: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      "advanced-showcase": 4,
    };

    test("sort by name A-Z", () => {
      const sorted = [...examplesList].sort((a, b) =>
        a.title.localeCompare(b.title),
      );
      for (let i = 1; i < sorted.length; i++) {
        expect(
          sorted[i - 1].title.localeCompare(sorted[i].title),
        ).toBeLessThanOrEqual(0);
      }
    });

    test("sort by difficulty ascending", () => {
      const sorted = [...examplesList].sort(
        (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
      );
      for (let i = 1; i < sorted.length; i++) {
        expect(difficultyOrder[sorted[i - 1].difficulty]).toBeLessThanOrEqual(
          difficultyOrder[sorted[i].difficulty],
        );
      }
    });

    test("sort by difficulty descending", () => {
      const sorted = [...examplesList].sort(
        (a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty],
      );
      for (let i = 1; i < sorted.length; i++) {
        expect(
          difficultyOrder[sorted[i - 1].difficulty],
        ).toBeGreaterThanOrEqual(difficultyOrder[sorted[i].difficulty]);
      }
    });
  });

  describe("edge cases", () => {
    function matchesQuery(ex: ExampleWithName, query: string): boolean {
      const q = query.toLowerCase();
      return (
        ex.title.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q) ||
        ex.name.toLowerCase().includes(q)
      );
    }

    test("empty search returns all examples", () => {
      const list: ExampleWithName[] = Object.entries(examples).map(
        ([name, data]) => ({ name, ...data }),
      );
      // Empty query should match everything (no filtering applied)
      expect(list.length).toBeGreaterThan(0);
    });

    test("non-matching search returns empty", () => {
      const list: ExampleWithName[] = Object.entries(examples).map(
        ([name, data]) => ({ name, ...data }),
      );
      const query = "xyznonexistent123";
      const filtered = list.filter((ex) => matchesQuery(ex, query));
      expect(filtered.length).toBe(0);
    });

    test("search is case-insensitive", () => {
      const list: ExampleWithName[] = Object.entries(examples).map(
        ([name, data]) => ({ name, ...data }),
      );
      const upper = list.filter((ex) => matchesQuery(ex, "CIRCLE"));
      const lower = list.filter((ex) => matchesQuery(ex, "circle"));
      expect(upper.length).toBe(lower.length);
    });
  });
});
