import { FilterToggle } from "@/components/FilterToggle";
import { Select } from "@/components/Select";
import { categories, sortOptions } from "./constants";
import type { Category, SortOption } from "./types";

interface GalleryFiltersProps {
  category: Category;
  search: string;
  sortBy: SortOption;
  onCategoryChange: (category: Category) => void;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: SortOption) => void;
}

export function GalleryFilters({
  category,
  search,
  sortBy,
  onCategoryChange,
  onSearchChange,
  onSortChange,
}: GalleryFiltersProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <FilterToggle
        onSelect={onCategoryChange}
        options={categories}
        selected={category}
        variant="pill"
      />
      <div className="flex gap-2">
        <input
          className="rounded-lg border border-border px-4 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search examples..."
          type="search"
          value={search}
        />
        <Select onChange={onSortChange} options={sortOptions} value={sortBy} />
      </div>
    </div>
  );
}
