import { difficultyOrder } from "./constants";
import type { Category, ExampleWithName, SortOption } from "./types";

export function matchesSearchQuery(
  example: ExampleWithName,
  query: string,
): boolean {
  if (!query) return true;
  const lowerQuery = query.toLowerCase();
  return (
    example.name.toLowerCase().includes(lowerQuery) ||
    example.title.toLowerCase().includes(lowerQuery) ||
    example.description.toLowerCase().includes(lowerQuery)
  );
}

export function matchesCategory(
  example: ExampleWithName,
  category: Category,
): boolean {
  if (category === "all") return true;
  if (category === "showcase")
    return example.difficulty === "advanced-showcase";
  return example.difficulty === category;
}

export function filterAndSortExamples(
  examples: ExampleWithName[],
  search: string,
  category: Category,
  sortBy: SortOption,
): ExampleWithName[] {
  const filtered = examples
    .filter((ex) => matchesSearchQuery(ex, search))
    .filter((ex) => matchesCategory(ex, category));

  if (sortBy === "name") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === "difficulty-asc") {
    filtered.sort(
      (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
    );
  } else if (sortBy === "difficulty-desc") {
    filtered.sort(
      (a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty],
    );
  }

  return filtered;
}
