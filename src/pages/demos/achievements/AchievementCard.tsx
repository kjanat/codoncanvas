import type {
  Achievement,
  UnlockedAchievement,
} from "@/education/achievements/achievement-engine";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "./constants";

interface AchievementCardProps {
  achievement: Achievement;
  isLocked: boolean;
  unlockedData?: UnlockedAchievement;
}

export function AchievementCard({
  achievement,
  isLocked,
  unlockedData,
}: AchievementCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isLocked
          ? "border-border bg-surface/50 opacity-60"
          : "border-yellow-300 bg-yellow-50 shadow-sm"
      }`}
    >
      <div className="mb-2 flex items-start justify-between">
        <span className={`text-3xl ${isLocked ? "grayscale" : ""}`}>
          {achievement.hidden && isLocked ? "?" : achievement.icon}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
            CATEGORY_COLORS[achievement.category]
          }`}
        >
          {CATEGORY_LABELS[achievement.category]}
        </span>
      </div>

      <h3 className="font-semibold text-text">
        {achievement.hidden && isLocked ? "???" : achievement.name}
      </h3>

      <p className="mt-1 text-sm text-text-muted">
        {achievement.hidden && isLocked
          ? "Keep exploring to discover this achievement!"
          : achievement.description}
      </p>

      {unlockedData && (
        <div className="mt-2 text-xs text-green-600">
          Unlocked {unlockedData.unlockedAt.toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
