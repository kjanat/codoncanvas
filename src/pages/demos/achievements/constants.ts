import type { AchievementCategory } from "@/education/achievements/achievement-engine";
import type { CategoryFilter } from "./types";

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  basics: "Basics",
  mastery: "Mastery",
  exploration: "Exploration",
  perfection: "Perfection",
};

export const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  basics: "bg-blue-100 text-blue-800 border-blue-200",
  mastery: "bg-purple-100 text-purple-800 border-purple-200",
  exploration: "bg-green-100 text-green-800 border-green-200",
  perfection: "bg-amber-100 text-amber-800 border-amber-200",
};

export const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as CategoryFilter,
    label,
  })),
];
