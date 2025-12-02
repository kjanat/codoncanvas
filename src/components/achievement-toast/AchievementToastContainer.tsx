/**
 * AchievementToastContainer - Container for achievement toasts via Portal
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AchievementToastItem } from "./AchievementToastItem";
import type { AchievementToastContainerProps } from "./types";

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
        <AchievementToastItem
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </section>,
    document.body,
  );
}
