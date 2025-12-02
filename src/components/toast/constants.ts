/**
 * Toast constants and style configurations
 */

import type { ToastVariant } from "@/contexts/ToastContext";

export const VARIANT_STYLES: Record<
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

export const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "M5 13l4 4L19 7", // Checkmark
  error: "M6 18L18 6M6 6l12 12", // X
  warning:
    "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", // Triangle
  info: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // Info circle
};

// Animation duration for exit transition (ms)
export const EXIT_ANIMATION_DURATION = 300;

// Inject animation styles once
const STYLE_ID = "toast-styles";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
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
