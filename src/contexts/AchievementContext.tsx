/**
 * AchievementContext - Global achievement tracking
 *
 * Provides centralized achievement tracking through React Context.
 * Replaces module-level singleton pattern for better testability and SSR support.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

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

interface AchievementContextValue {
  /** The achievement engine instance */
  engine: AchievementEngine;
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

const AchievementContext = createContext<AchievementContextValue | null>(null);

export interface AchievementProviderProps {
  children: ReactNode;
  /** Optional custom engine for testing */
  engine?: AchievementEngine;
}

/**
 * Provides achievement tracking to the app.
 *
 * @example
 * ```tsx
 * <AchievementProvider>
 *   <App />
 * </AchievementProvider>
 * ```
 */
export function AchievementProvider({
  children,
  engine: customEngine,
}: AchievementProviderProps) {
  // Use ref to ensure stable engine instance across renders
  const engineRef = useRef<AchievementEngine>(
    customEngine ?? new AchievementEngine(),
  );
  const [notifications, setNotifications] = useState<AchievementNotification[]>(
    [],
  );
  const mountedRef = useRef(true);

  // Update mounted ref on unmount
  useMemo(() => {
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
      const unlocked = engineRef.current.trackGenomeCreated(length);
      handleUnlocks(unlocked);
    },
    [handleUnlocks],
  );

  const trackGenomeExecuted = useCallback(
    (opcodes: string[]) => {
      const unlocked = engineRef.current.trackGenomeExecuted(opcodes);
      handleUnlocks(unlocked);
    },
    [handleUnlocks],
  );

  const trackMutationApplied = useCallback(() => {
    const unlocked = engineRef.current.trackMutationApplied();
    handleUnlocks(unlocked);
  }, [handleUnlocks]);

  const trackEvolutionGeneration = useCallback(() => {
    const unlocked = engineRef.current.trackEvolutionGeneration();
    handleUnlocks(unlocked);
  }, [handleUnlocks]);

  const value = useMemo<AchievementContextValue>(
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

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
}

/**
 * Hook to access achievement tracking.
 *
 * @throws Error if used outside AchievementProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { trackGenomeCreated } = useAchievementContext();
 *   trackGenomeCreated(10);
 * }
 * ```
 */
export function useAchievementContext(): AchievementContextValue {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error(
      "useAchievementContext must be used within an AchievementProvider. " +
        "Wrap your app with <AchievementProvider> or use the standalone useAchievements hook.",
    );
  }
  return context;
}

/**
 * Check if we're inside an AchievementProvider
 */
export function useHasAchievementProvider(): boolean {
  return useContext(AchievementContext) !== null;
}
