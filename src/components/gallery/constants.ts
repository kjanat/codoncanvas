import { examples } from "@/data/examples";
import type { Category, ExampleWithName, SortOption } from "./types";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "name", label: "Name A-Z" },
  { value: "difficulty-asc", label: "Difficulty (Easy first)" },
  { value: "difficulty-desc", label: "Difficulty (Hard first)" },
];

export const difficultyOrder: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  "advanced-showcase": 4,
};

export const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All Examples" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "showcase", label: "Showcase" },
];

export const examplesList: ExampleWithName[] = Object.entries(examples).map(
  ([name, data]) => ({
    name,
    ...data,
  }),
);
