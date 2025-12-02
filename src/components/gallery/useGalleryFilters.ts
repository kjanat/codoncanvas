import { useState } from "react";
import { examplesList } from "./constants";
import { filterAndSortExamples } from "./filters";
import type { Category, ExampleWithName, SortOption } from "./types";

export interface GalleryFiltersState {
  category: Category;
  search: string;
  sortBy: SortOption;
}

export interface UseGalleryFiltersReturn {
  filters: GalleryFiltersState;
  setCategory: (category: Category) => void;
  setSearch: (search: string) => void;
  setSortBy: (sortBy: SortOption) => void;
  filteredExamples: ExampleWithName[];
  totalCount: number;
}

export function useGalleryFilters(): UseGalleryFiltersReturn {
  const [category, setCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const filteredExamples = filterAndSortExamples(
    examplesList,
    search,
    category,
    sortBy,
  );

  return {
    filters: { category, search, sortBy },
    setCategory,
    setSearch,
    setSortBy,
    filteredExamples,
    totalCount: examplesList.length,
  };
}
