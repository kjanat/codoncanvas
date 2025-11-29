import { useEffect, useState } from "react";
import {
  type Achievement,
  AchievementEngine,
} from "@/education/achievements/achievement-engine";

// Singleton instance
let engineInstance: AchievementEngine | null = null;

export function useAchievements() {
  const [engine, setEngine] = useState<AchievementEngine | null>(null);

  useEffect(() => {
    if (!engineInstance) {
      engineInstance = new AchievementEngine();
    }
    setEngine(engineInstance);
  }, []);

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

  // Simple notification handler (could be improved with a proper UI component)
  const handleUnlocks = (unlocked: Achievement[]) => {
    if (unlocked.length > 0) {
      // In a real app, we might use a toast notification system here
      // For now, we'll just log to console as the UI component handles its own display
      // if mounted.
      console.info(
        "Achievements unlocked:",
        unlocked.map((a) => a.name).join(", "),
      );

      // If we had a global UI instance, we could trigger it here.
      // Since AchievementUI is designed to attach to a container,
      // we might need a different approach for global notifications
      // if the UI isn't always present.

      // For this demo, we'll create a temporary notification
      unlocked.forEach((achievement) => {
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-primary/20 z-50 animate-in slide-in-from-right duration-300";
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="text-2xl">${achievement.icon}</div>
            <div>
              <div class="font-bold text-primary">Achievement Unlocked!</div>
              <div class="font-medium text-text">${achievement.name}</div>
              <div class="text-xs text-text-muted">${achievement.description}</div>
            </div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.classList.add("animate-out", "fade-out", "duration-300");
          setTimeout(() => notification.remove(), 300);
        }, 5000);
      });
    }
  };

  return {
    engine,
    trackGenomeCreated,
    trackGenomeExecuted,
    trackMutationApplied,
    trackEvolutionGeneration,
  };
}
