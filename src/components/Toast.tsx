/**
 * Toast Component
 *
 * Renders toast notifications via Portal with auto-dismiss and animations.
 * Uses ToastContext for state management.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  type Toast as ToastType,
  type ToastVariant,
  useToast,
} from "@/contexts/ToastContext";

interface ToastItemProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; border: string; icon: string }
> = {
  success: {
    bg: "bg-success/10",
    border: "border-success/30",
    icon: "text-success",
  },
  error: {
    bg: "bg-danger/10",
    border: "border-danger/30",
    icon: "text-danger",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/30",
    icon: "text-warning",
  },
  info: {
    bg: "bg-info/10",
    border: "border-info/30",
    icon: "text-info",
  },
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "M5 13l4 4L19 7", // Checkmark
  error: "M6 18L18 6M6 6l12 12", // X
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", // Triangle
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // Info circle
};

/**
 * Individual toast notification with auto-dismiss.
 */
function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startDismiss = useCallback(() => {
    if (isExiting) return;
    setIsExiting(true);
    exitTimeoutRef.current = setTimeout(() => {
      onDismiss(toast.id);
    }, 300);
  }, [isExiting, toast.id, onDismiss]);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      timeoutRef.current = setTimeout(startDismiss, toast.duration);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    };
  }, [toast.duration, startDismiss]);

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

/**
 * Container that renders all toasts via Portal.
 * Place this once in your app (typically in Layout).
 */
export function ToastContainer() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || toasts.length === 0) {
    return null;
  }

  return createPortal(
    <section
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} onDismiss={dismiss} toast={toast} />
      ))}
    </section>,
    document.body,
  );
}

// Inject animation styles
const styleId = "toast-styles";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    @keyframes toast-slide-in {
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
