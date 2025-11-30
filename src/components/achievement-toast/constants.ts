/**
 * AchievementToast constants
 */

// Animation duration for exit transition (ms)
export const EXIT_ANIMATION_DURATION = 300;

// Default auto-dismiss duration (ms)
export const DEFAULT_TOAST_DURATION = 5000;

// Inject animation styles once
const STYLE_ID = "achievement-toast-styles";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
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
