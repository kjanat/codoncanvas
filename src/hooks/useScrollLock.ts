/**
 * useScrollLock - Prevents body scroll when enabled
 *
 * Uses reference counting so multiple components can hold locks
 * without conflicting (only releases when all locks are released).
 */

import { useEffect } from "react";

let lockCount = 0;
let originalOverflow: string | undefined;

export function useScrollLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") {
      return;
    }

    if (lockCount === 0) {
      originalOverflow = document.body.style.overflow;
    }
    lockCount++;
    document.body.style.overflow = "hidden";

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = originalOverflow ?? "";
        originalOverflow = undefined;
      }
    };
  }, [enabled]);
}

/** @internal Reset lock count for testing purposes only */
export function _resetLockCount(): void {
  lockCount = 0;
  originalOverflow = undefined;
}
