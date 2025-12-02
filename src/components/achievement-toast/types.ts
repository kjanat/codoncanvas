/**
 * Types for AchievementToast component
 */

import type { Achievement } from "@/education/achievements/achievement-engine";

export interface AchievementNotification {
  id: string;
  achievement: Achievement;
  createdAt: number;
}

export interface AchievementToastItemProps {
  notification: AchievementNotification;
  onDismiss: (id: string) => void;
  duration?: number;
}

export interface AchievementToastContainerProps {
  notifications: AchievementNotification[];
  onDismiss: (id: string) => void;
}
