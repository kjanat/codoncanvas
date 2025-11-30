/**
 * ToastItem - Individual toast notification with auto-dismiss
 */

import { useEffect, useRef, useState } from "react";
import type { Toast } from "@/contexts/ToastContext";
import {
  EXIT_ANIMATION_DURATION,
  VARIANT_ICONS,
  VARIANT_STYLES,
} from "./constants";

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss effect
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsExiting(true);
        exitTimeoutRef.current = setTimeout(() => {
          onDismiss(toast.id);
        }, EXIT_ANIMATION_DURATION);
      }, toast.duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
      }
    };
  }, [toast.duration, toast.id, onDismiss]);

  // Manual dismiss handler
  function handleDismissClick(): void {
    if (isExiting) {
      return;
    }
    // Clear auto-dismiss timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, EXIT_ANIMATION_DURATION);
  }

  const styles = VARIANT_STYLES[toast.variant];
  const iconPath = VARIANT_ICONS[toast.variant];

  return (
    <div
      aria-live="polite"
      className={`
        pointer-events-auto w-80 rounded-xl border p-4 shadow-lg
        ${styles.bg} ${styles.border}
        transition-all duration-300
        ${isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
      `}
      role="alert"
      style={{
        animation: isExiting ? undefined : "toast-slide-in 0.3s ease-out",
      }}
    >
      <div className="flex items-start gap-3">
        <svg
          aria-hidden="true"
          className={`h-5 w-5 flex-shrink-0 ${styles.icon}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d={iconPath} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="min-w-0 flex-1">
          {toast.title && (
            <div className="font-semibold text-text">{toast.title}</div>
          )}
          <div
            className={`text-sm ${toast.title ? "text-text-muted" : "text-text"}`}
          >
            {toast.message}
          </div>
        </div>
        <button
          aria-label="Dismiss notification"
          className="flex-shrink-0 rounded p-1 text-text-muted transition-colors hover:bg-border-light hover:text-text"
          onClick={handleDismissClick}
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
