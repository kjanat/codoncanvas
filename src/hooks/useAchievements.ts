import { useEffect, useRef, useState } from "react";

import type { AchievementNotification } from "@/components/AchievementToast";
import {
  type Achievement,
  AchievementEngine,
} from "@/education/achievements/achievement-engine";

// Singleton instance
let engineInstance: AchievementEngine | null = null;

// Generate unique IDs for notifications
let notificationId = 0;
function generateId(): string {
  return `achievement-${Date.now()}-${++notificationId}`;
}

export function useAchievements() {
  const [engine, setEngine] = useState<AchievementEngine | null>(null);
  const [notifications, setNotifications] = useState<AchievementNotification[]>(
    [],
  );
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    if (!engineInstance) {
      engineInstance = new AchievementEngine();
    }
    setEngine(engineInstance);

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const dismissNotification = (id: string) => {
    if (!mountedRef.current) return;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleUnlocks = (unlocked: Achievement[]) => {
    if (!mountedRef.current || unlocked.length === 0) return;

    const newNotifications: AchievementNotification[] = unlocked.map(
      (achievement) => ({
        id: generateId(),
        achievement,
        createdAt: Date.now(),
      }),
    );

    setNotifications((prev) => [...prev, ...newNotifications]);

    // Also log for debugging
    console.info(
      "Achievements unlocked:",
      unlocked.map((a) => a.name).join(", "),
    );
  };

  const trackGenomeCreated = (length: number) => {
    if (!engineInstance) return;
    const unlocked = engineInstance.trackGenomeCreated(length);
    handleUnlocks(unlocked);
  };

  const trackGenomeExecuted = (opcodes: string[]) => {
    if (!engineInstance) return;
    const unlocked = engineInstance.trackGenomeExecuted(opcodes);
    handleUnlocks(unlocked);
  };

  const trackMutationApplied = () => {
    if (!engineInstance) return;
    const unlocked = engineInstance.trackMutationApplied();
    handleUnlocks(unlocked);
  };

  const trackEvolutionGeneration = () => {
    if (!engineInstance) return;
    const unlocked = engineInstance.trackEvolutionGeneration();
    handleUnlocks(unlocked);
  };

  return {
    engine,
    trackGenomeCreated,
    trackGenomeExecuted,
    trackMutationApplied,
    trackEvolutionGeneration,
    // Consumers render AchievementToastContainer directly with these props
    notifications,
    dismissNotification,
  };
}
