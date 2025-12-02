/**
 * Tests for useExamples hook
 *
 * Tests example filtering, searching, and selection functionality.
 */

import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useExamples } from "@/hooks/useExamples";

describe("useExamples", () => {
  describe("initialization", () => {
    test("loads all examples", () => {
      const { result } = renderHook(() => useExamples());

      expect(result.current.allExamples.length).toBeGreaterThan(0);
    });

    test("examples have required fields", () => {
      const { result } = renderHook(() => useExamples());

      for (const example of result.current.allExamples) {
        expect(example.key).toBeDefined();
        expect(example.title).toBeDefined();
        expect(example.description).toBeDefined();
        expect(example.genome).toBeDefined();
        expect(example.difficulty).toBeDefined();
        expect(Array.isArray(example.concepts)).toBe(true);
        expect(Array.isArray(example.keywords)).toBe(true);
      }
    });

    test("provides available difficulties", () => {
      const { result } = renderHook(() => useExamples());

      expect(result.current.difficulties.length).toBeGreaterThan(0);
      expect(result.current.difficulties).toContain("beginner");
    });

    test("provides available concepts", () => {
      const { result } = renderHook(() => useExamples());

      expect(result.current.concepts.length).toBeGreaterThan(0);
    });

    test("initializes with no selection", () => {
      const { result } = renderHook(() => useExamples());

      expect(result.current.selectedExample).toBeNull();
    });

    test("respects initial selection", () => {
      const { result: allResult } = renderHook(() => useExamples());
      const firstKey = allResult.current.allExamples[0]?.key;

      if (firstKey) {
        const { result } = renderHook(() =>
          useExamples({ initialSelection: firstKey }),
        );

        expect(result.current.selectedExample).not.toBeNull();
        expect(result.current.selectedExample?.key).toBe(firstKey);
      }
    });
  });

  describe("filtering", () => {
    test("filters by difficulty", () => {
      const { result } = renderHook(() => useExamples());

      act(() => {
        result.current.setFilter("difficulty", "beginner");
      });

      expect(result.current.filters.difficulty).toBe("beginner");

      for (const example of result.current.filteredExamples) {
        expect(example.difficulty).toBe("beginner");
      }
    });

    test("filters by concept", () => {
      const { result } = renderHook(() => useExamples());

      const concept = result.current.concepts[0];
      if (concept) {
        act(() => {
          result.current.setFilter("concept", concept);
        });

        expect(result.current.filters.concept).toBe(concept);

        for (const example of result.current.filteredExamples) {
          expect(example.concepts).toContain(concept);
        }
      }
    });

    test("filters show all when set to 'all'", () => {
      const { result } = renderHook(() => useExamples());

      act(() => {
        result.current.setFilter("difficulty", "all");
        result.current.setFilter("concept", "all");
      });

      expect(result.current.filteredExamples.length).toBe(
        result.current.allExamples.length,
      );
    });

    test("combines multiple filters", () => {
      const { result } = renderHook(() => useExamples());

      act(() => {
        result.current.setFilter("difficulty", "beginner");
        result.current.setFilter("search", "circle");
      });

      for (const example of result.current.filteredExamples) {
        expect(example.difficulty).toBe("beginner");
        const matchesSearch =
          example.title.toLowerCase().includes("circle") ||
          example.description.toLowerCase().includes("circle") ||
          example.keywords.some((kw) => kw.toLowerCase().includes("circle"));
        expect(matchesSearch).toBe(true);
      }
    });
  });

  describe("search", () => {
    test("searches by title", () => {
      const { result } = renderHook(() => useExamples());

      const firstTitle = result.current.allExamples[0]?.title;
      if (firstTitle) {
        act(() => {
          result.current.setFilter("search", firstTitle.substring(0, 5));
        });

        expect(result.current.filteredExamples.length).toBeGreaterThan(0);
      }
    });

    test("searches by keyword", () => {
      const { result } = renderHook(() => useExamples());

      // Find an example with keywords
      const exampleWithKeywords = result.current.allExamples.find(
        (ex) => ex.keywords.length > 0,
      );

      if (exampleWithKeywords) {
        const keyword = exampleWithKeywords.keywords[0];
        act(() => {
          result.current.setFilter("search", keyword);
        });

        expect(result.current.filteredExamples.length).toBeGreaterThan(0);
      }
    });

    test("search is case-insensitive", () => {
      const { result } = renderHook(() => useExamples());

      act(() => {
        result.current.setFilter("search", "CIRCLE");
      });

      const upperResults = result.current.filteredExamples.length;

      act(() => {
        result.current.setFilter("search", "circle");
      });

      const lowerResults = result.current.filteredExamples.length;

      expect(upperResults).toBe(lowerResults);
    });

    test("empty search shows all examples", () => {
      const { result } = renderHook(() => useExamples());

      act(() => {
        result.current.setFilter("search", "");
      });

      expect(result.current.filteredExamples.length).toBe(
        result.current.allExamples.length,
      );
    });
  });

  describe("selection", () => {
    test("selectExample sets selectedExample", () => {
      const { result } = renderHook(() => useExamples());

      const firstKey = result.current.allExamples[0]?.key;
      if (firstKey) {
        act(() => {
          result.current.selectExample(firstKey);
        });

        expect(result.current.selectedExample?.key).toBe(firstKey);
      }
    });

    test("selectExample(null) clears selection", () => {
      const { result } = renderHook(() => useExamples());

      const firstKey = result.current.allExamples[0]?.key;
      if (firstKey) {
        act(() => {
          result.current.selectExample(firstKey);
        });

        expect(result.current.selectedExample).not.toBeNull();

        act(() => {
          result.current.selectExample(null);
        });

        expect(result.current.selectedExample).toBeNull();
      }
    });

    test("getExample returns example by key", () => {
      const { result } = renderHook(() => useExamples());

      const firstExample = result.current.allExamples[0];
      if (firstExample) {
        const found = result.current.getExample(firstExample.key);

        expect(found).not.toBeNull();
        expect(found?.key).toBe(firstExample.key);
        expect(found?.title).toBe(firstExample.title);
      }
    });

    test("getExample returns null for invalid key", () => {
      const { result } = renderHook(() => useExamples());

      const found = result.current.getExample("nonexistent-key-12345");

      expect(found).toBeNull();
    });
  });

  describe("resetFilters", () => {
    test("resets all filters to defaults", () => {
      const { result } = renderHook(() => useExamples());

      act(() => {
        result.current.setFilter("search", "circle");
        result.current.setFilter("difficulty", "advanced");
      });

      expect(result.current.filters.search).toBe("circle");
      expect(result.current.filters.difficulty).toBe("advanced");

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.search).toBe("");
      expect(result.current.filters.difficulty).toBe("all");
      expect(result.current.filters.concept).toBe("all");
    });
  });

  describe("resultCount", () => {
    test("returns correct count of filtered examples", () => {
      const { result } = renderHook(() => useExamples());

      expect(result.current.resultCount).toBe(
        result.current.filteredExamples.length,
      );

      act(() => {
        result.current.setFilter("difficulty", "beginner");
      });

      expect(result.current.resultCount).toBe(
        result.current.filteredExamples.length,
      );
    });
  });

  describe("initial filters", () => {
    test("respects initial filter options", () => {
      const { result } = renderHook(() =>
        useExamples({
          initialFilters: {
            difficulty: "beginner",
            search: "circle",
          },
        }),
      );

      expect(result.current.filters.difficulty).toBe("beginner");
      expect(result.current.filters.search).toBe("circle");
    });
  });
});
