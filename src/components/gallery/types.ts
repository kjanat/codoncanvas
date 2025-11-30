import type { ExampleMetadata } from "@/data/examples";

export interface ExampleWithName extends ExampleMetadata {
  name: string;
}

export type Category =
  | "all"
  | "beginner"
  | "intermediate"
  | "advanced"
  | "showcase";

export type SortOption =
  | "default"
  | "name"
  | "difficulty-asc"
  | "difficulty-desc";
