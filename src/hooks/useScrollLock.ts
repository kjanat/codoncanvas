/**
 * useScrollLock - Prevents body scroll when enabled
 *
 * Uses reference counting so multiple components can hold locks
 * without conflicting (only releases when all locks are released).
 */

import { useEffect } from "react";

let lockCount = 0;

export function useScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    lockCount++;
    document.body.style.overflow = "hidden";

    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [enabled]);
}

/** @internal Reset lock count for testing purposes only */
export function _resetLockCount(): void {
  lockCount = 0;
}
