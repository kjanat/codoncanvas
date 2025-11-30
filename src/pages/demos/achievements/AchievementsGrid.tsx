import { Card } from "@/components/Card";
import { FilterToggle } from "@/components/FilterToggle";
import type {
  Achievement,
  UnlockedAchievement,
} from "@/education/achievements/achievement-engine";
import { AchievementCard } from "./AchievementCard";
import { CATEGORY_OPTIONS } from "./constants";
import type { CategoryFilter } from "./types";

interface AchievementsGridProps {
  achievements: Achievement[];
  unlocked: UnlockedAchievement[];
  selectedCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
  isUnlockedById: (id: string) => boolean;
}

export function AchievementsGrid({
  achievements,
  unlocked,
  selectedCategory,
  onCategoryChange,
  isUnlockedById,
}: AchievementsGridProps) {
  return (
    <Card className="lg:col-span-3">
      <FilterToggle
        className="mb-6"
        onSelect={onCategoryChange}
        options={CATEGORY_OPTIONS}
        selected={selectedCategory}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((achievement) => {
          const isLocked = !isUnlockedById(achievement.id);
          const unlockedData = unlocked.find(
            (u) => u.achievement.id === achievement.id,
          );

          return (
            <AchievementCard
              achievement={achievement}
              isLocked={isLocked}
              key={achievement.id}
              unlockedData={unlockedData}
            />
          );
        })}
      </div>
    </Card>
  );
}
