/**
 * AchievementToastItem - Individual achievement notification
 */

import type { ReactElement } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/ui/icons";
import { DEFAULT_TOAST_DURATION, EXIT_ANIMATION_DURATION } from "./constants";
import type { AchievementToastItemProps } from "./types";

export function AchievementToastItem({
  notification,
  onDismiss,
  duration = DEFAULT_TOAST_DURATION,
}: AchievementToastItemProps): ReactElement {
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Centralized exit logic: start animation and schedule final dismiss
  const startExitAndScheduleDismiss = useCallback(() => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
    }
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, EXIT_ANIMATION_DURATION);
  }, [notification.id, onDismiss]);

  // Auto-dismiss effect
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      startExitAndScheduleDismiss();
    }, duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [duration, startExitAndScheduleDismiss]);

  // Manual dismiss handler
  function handleDismissClick(): void {
    if (isExiting) {
      return;
    }
    // Clear auto-dismiss timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    startExitAndScheduleDismiss();
  }

  const { achievement } = notification;

  return (
    <output
      aria-live="polite"
      className={`
        pointer-events-auto w-80 rounded-xl border border-primary/20 bg-surface p-4 shadow-lg
        transition-all duration-300
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
      `}
      style={{
        animation: isExiting ? undefined : "slide-in-right 0.3s ease-out",
      }}
    >
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="text-2xl">
          {achievement.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-primary">Achievement Unlocked!</div>
          <div className="truncate font-medium text-text">
            {achievement.name}
          </div>
          <div className="truncate text-xs text-text-muted">
            {achievement.description}
          </div>
        </div>
        <button
          aria-label="Dismiss notification"
          className="rounded p-1 text-text-muted transition-colors hover:bg-border-light hover:text-text"
          onClick={handleDismissClick}
          type="button"
        >
          <CloseIcon />
        </button>
      </div>
    </output>
  );
}
