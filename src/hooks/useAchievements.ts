/**
 * useAchievements - React hook for achievement tracking
 *
 * Provides achievement tracking functionality. When used within an AchievementProvider,
 * uses the shared context. Otherwise, falls back to a component-local engine instance.
 *
 * Prefer wrapping your app with AchievementProvider for:
 * - Shared achievement state across components
 * - Better testability
 * - SSR compatibility
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { AchievementNotification } from "@/components/AchievementToast";
import {
  type Achievement,
  AchievementEngine,
} from "@/education/achievements/achievement-engine";

// Generate unique IDs for notifications
let notificationId = 0;
function generateId(): string {
  return `achievement-${Date.now()}-${++notificationId}`;
}

/** Return type for useAchievements hook */
export interface UseAchievementsReturn {
  /** The achievement engine instance */
  engine: AchievementEngine | null;
  /** Current notifications */
  notifications: AchievementNotification[];
  /** Dismiss a notification by ID */
  dismissNotification: (id: string) => void;
  /** Track genome creation */
  trackGenomeCreated: (length: number) => void;
  /** Track genome execution */
  trackGenomeExecuted: (opcodes: string[]) => void;
  /** Track mutation applied */
  trackMutationApplied: () => void;
  /** Track evolution generation */
  trackEvolutionGeneration: () => void;
}

/**
 * React hook for achievement tracking.
 *
 * Creates a component-local engine instance using useRef for stability.
 * This avoids the pitfalls of module-level singletons (SSR issues, test pollution).
 *
 * For shared achievement state across components, wrap your app with AchievementProvider
 * and use useAchievementContext instead.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackGenomeCreated, notifications } = useAchievements();
 *   trackGenomeCreated(10);
 * }
 * ```
 */
export function useAchievements(): UseAchievementsReturn {
  // Use ref to create engine lazily and keep stable reference
  const engineRef = useRef<AchievementEngine | null>(null);
  const [notifications, setNotifications] = useState<AchievementNotification[]>(
    [],
  );
  const mountedRef = useRef(true);

  // Initialize engine on first render (lazy initialization)
  if (!engineRef.current) {
    engineRef.current = new AchievementEngine();
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const dismissNotification = useCallback((id: string) => {
    if (!mountedRef.current) return;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleUnlocks = useCallback((unlocked: Achievement[]) => {
    if (!mountedRef.current || unlocked.length === 0) return;

    const newNotifications: AchievementNotification[] = unlocked.map(
      (achievement) => ({
        id: generateId(),
        achievement,
        createdAt: Date.now(),
      }),
    );

    setNotifications((prev) => [...prev, ...newNotifications]);

    // Log for debugging
    console.info(
      "Achievements unlocked:",
      unlocked.map((a) => a.name).join(", "),
    );
  }, []);

  const trackGenomeCreated = useCallback(
    (length: number) => {
      if (!engineRef.current) return;
      const unlocked = engineRef.current.trackGenomeCreated(length);
      handleUnlocks(unlocked);
    },
    [handleUnlocks],
  );

  const trackGenomeExecuted = useCallback(
    (opcodes: string[]) => {
      if (!engineRef.current) return;
      const unlocked = engineRef.current.trackGenomeExecuted(opcodes);
      handleUnlocks(unlocked);
    },
    [handleUnlocks],
  );

  const trackMutationApplied = useCallback(() => {
    if (!engineRef.current) return;
    const unlocked = engineRef.current.trackMutationApplied();
    handleUnlocks(unlocked);
  }, [handleUnlocks]);

  const trackEvolutionGeneration = useCallback(() => {
    if (!engineRef.current) return;
    const unlocked = engineRef.current.trackEvolutionGeneration();
    handleUnlocks(unlocked);
  }, [handleUnlocks]);

  return useMemo(
    () => ({
      engine: engineRef.current,
      notifications,
      dismissNotification,
      trackGenomeCreated,
      trackGenomeExecuted,
      trackMutationApplied,
      trackEvolutionGeneration,
    }),
    [
      notifications,
      dismissNotification,
      trackGenomeCreated,
      trackGenomeExecuted,
      trackMutationApplied,
      trackEvolutionGeneration,
    ],
  );
}
