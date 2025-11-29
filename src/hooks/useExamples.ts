/**
 * useExamples - React hook for example management
 *
 * Provides filtering, searching, and selection of example genomes
 * from the built-in examples library.
 */

import { useCallback, useMemo, useState } from "react";
import {
  type Concept,
  type ExampleDifficulty,
  type ExampleMetadata,
  examples,
} from "@/data/examples";

/** Example with its key name */
export interface ExampleWithKey extends ExampleMetadata {
  /** Unique key/name for the example */
  key: string;
}

/** Filter options for examples */
export interface ExampleFilters {
  /** Search query (matches title, description, keywords) */
  search: string;
  /** Filter by difficulty level */
  difficulty: ExampleDifficulty | "all";
  /** Filter by concept */
  concept: Concept | "all";
  /** Filter by mutation suitability */
  goodForMutation: string | "all";
}

/** Options for useExamples hook */
export interface UseExamplesOptions {
  /** Initial filters */
  initialFilters?: Partial<ExampleFilters>;
  /** Initial selected example key */
  initialSelection?: string;
}

/** Return type of useExamples hook */
export interface UseExamplesReturn {
  /** All examples with keys */
  allExamples: ExampleWithKey[];
  /** Filtered examples based on current filters */
  filteredExamples: ExampleWithKey[];
  /** Current filter state */
  filters: ExampleFilters;
  /** Update a single filter */
  setFilter: <K extends keyof ExampleFilters>(
    key: K,
    value: ExampleFilters[K],
  ) => void;
  /** Reset all filters to defaults */
  resetFilters: () => void;
  /** Currently selected example */
  selectedExample: ExampleWithKey | null;
  /** Select an example by key */
  selectExample: (key: string | null) => void;
  /** Get example by key */
  getExample: (key: string) => ExampleWithKey | null;
  /** Available difficulty levels */
  difficulties: ExampleDifficulty[];
  /** Available concepts */
  concepts: Concept[];
  /** Count of filtered results */
  resultCount: number;
}

const DEFAULT_FILTERS: ExampleFilters = {
  search: "",
  difficulty: "all",
  concept: "all",
  goodForMutation: "all",
};

// --- Filter predicate functions (extracted to reduce complexity) ---

function matchesSearch(example: ExampleWithKey, query: string): boolean {
  if (!query) return true;
  const searchLower = query.toLowerCase();
  return (
    example.title.toLowerCase().includes(searchLower) ||
    example.description.toLowerCase().includes(searchLower) ||
    example.keywords.some((kw) => kw.toLowerCase().includes(searchLower))
  );
}

function matchesDifficulty(
  example: ExampleWithKey,
  difficulty: ExampleDifficulty | "all",
): boolean {
  return difficulty === "all" || example.difficulty === difficulty;
}

function matchesConcept(
  example: ExampleWithKey,
  concept: Concept | "all",
): boolean {
  return concept === "all" || example.concepts.includes(concept);
}

function matchesMutation(
  example: ExampleWithKey,
  mutationType: string | "all",
): boolean {
  if (mutationType === "all") return true;
  return example.goodForMutations.includes(
    mutationType as (typeof example.goodForMutations)[number],
  );
}

/**
 * React hook for managing example genomes.
 *
 * @example
 * ```tsx
 * function ExampleBrowser() {
 *   const {
 *     filteredExamples,
 *     filters,
 *     setFilter,
 *     selectExample,
 *     selectedExample,
 *   } = useExamples();
 *
 *   return (
 *     <div>
 *       <input
 *         value={filters.search}
 *         onChange={(e) => setFilter('search', e.target.value)}
 *         placeholder="Search..."
 *       />
 *       <select
 *         value={filters.difficulty}
 *         onChange={(e) => setFilter('difficulty', e.target.value as any)}
 *       >
 *         <option value="all">All Levels</option>
 *         <option value="beginner">Beginner</option>
 *         <option value="intermediate">Intermediate</option>
 *         <option value="advanced">Advanced</option>
 *       </select>
 *       <ul>
 *         {filteredExamples.map((ex) => (
 *           <li key={ex.key} onClick={() => selectExample(ex.key)}>
 *             {ex.title}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useExamples(
  options: UseExamplesOptions = {},
): UseExamplesReturn {
  const { initialFilters = {}, initialSelection } = options;

  // All examples with keys
  const allExamples = useMemo<ExampleWithKey[]>(() => {
    return Object.entries(examples).map(([key, data]) => ({
      key,
      ...data,
    }));
  }, []);

  // Available difficulties and concepts
  const difficulties = useMemo<ExampleDifficulty[]>(() => {
    const set = new Set(allExamples.map((ex) => ex.difficulty));
    return Array.from(set).sort();
  }, [allExamples]);

  const concepts = useMemo<Concept[]>(() => {
    const set = new Set(allExamples.flatMap((ex) => ex.concepts));
    return Array.from(set).sort();
  }, [allExamples]);

  // Filter state
  const [filters, setFilters] = useState<ExampleFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Selection state
  const [selectedKey, setSelectedKey] = useState<string | null>(
    initialSelection ?? null,
  );

  // Filtered examples - uses extracted filter functions
  const filteredExamples = useMemo(() => {
    return allExamples
      .filter((ex) => matchesSearch(ex, filters.search))
      .filter((ex) => matchesDifficulty(ex, filters.difficulty))
      .filter((ex) => matchesConcept(ex, filters.concept))
      .filter((ex) => matchesMutation(ex, filters.goodForMutation));
  }, [allExamples, filters]);

  // Set a single filter
  const setFilter = useCallback(
    <K extends keyof ExampleFilters>(key: K, value: ExampleFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Select example
  const selectExample = useCallback((key: string | null) => {
    setSelectedKey(key);
  }, []);

  // Get example by key
  const getExample = useCallback(
    (key: string): ExampleWithKey | null => {
      return allExamples.find((ex) => ex.key === key) ?? null;
    },
    [allExamples],
  );

  // Selected example
  const selectedExample = useMemo(() => {
    if (!selectedKey) return null;
    return getExample(selectedKey);
  }, [selectedKey, getExample]);

  return {
    allExamples,
    filteredExamples,
    filters,
    setFilter,
    resetFilters,
    selectedExample,
    selectExample,
    getExample,
    difficulties,
    concepts,
    resultCount: filteredExamples.length,
  };
}

export default useExamples;
