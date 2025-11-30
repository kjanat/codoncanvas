/**
 * AchievementToast Component
 *
 * Renders achievement unlock notifications using React Portal.
 * Handles animation timing and auto-dismissal without memory leaks.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Achievement } from "@/education/achievements/achievement-engine";

export interface AchievementNotification {
  id: string;
  achievement: Achievement;
  createdAt: number;
}

interface ToastItemProps {
  notification: AchievementNotification;
  onDismiss: (id: string) => void;
  duration?: number;
}

/**
 * Individual toast notification with auto-dismiss.
 * Manages its own exit animation timing.
 */
function ToastItem({
  notification,
  onDismiss,
  duration = 5000,
}: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startDismiss = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Match animation duration
  }, [isExiting, notification.id, onDismiss]);

  useEffect(() => {
    timeoutRef.current = setTimeout(startDismiss, duration);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, [duration, startDismiss]);

  const { achievement } = notification;

  return (
    <div
      aria-live="polite"
      className={`
        pointer-events-auto w-80 rounded-xl border border-primary/20 bg-white p-4 shadow-lg
        transition-all duration-300
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
      `}
      role="alert"
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
          onClick={startDismiss}
          type="button"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M6 18L18 6M6 6l12 12"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

interface AchievementToastContainerProps {
  notifications: AchievementNotification[];
  onDismiss: (id: string) => void;
}

/**
 * Container for achievement toasts rendered via Portal.
 * Positions toasts in top-right corner with stacking.
 */
export function AchievementToastContainer({
  notifications,
  onDismiss,
}: AchievementToastContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || notifications.length === 0) {
    return null;
  }

  return createPortal(
    <section
      aria-label="Achievement notifications"
      className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2"
    >
      {notifications.map((notification) => (
        <ToastItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </section>,
    document.body,
  );
}

// Add the slide-in animation to the global scope
const styleId = "achievement-toast-styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes slide-in-right {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `;
  document.head.appendChild(style);
}
