import type { Achievement } from "@/education/achievements/achievement-engine";

interface UnlockNotificationProps {
  achievement: Achievement;
}

export function UnlockNotification({ achievement }: UnlockNotificationProps) {
  return (
    <div className="fixed right-4 top-4 z-50 animate-pulse rounded-lg border border-yellow-400 bg-yellow-50 p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{achievement.icon}</span>
        <div>
          <div className="font-bold text-yellow-800">Achievement Unlocked!</div>
          <div className="text-sm text-yellow-700">{achievement.name}</div>
        </div>
      </div>
    </div>
  );
}
