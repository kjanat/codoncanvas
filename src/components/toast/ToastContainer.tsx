/**
 * ToastContainer - Renders all toasts via Portal
 *
 * Place this once in your app (typically in Layout).
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/contexts/ToastContext";
import { ToastItem } from "./ToastItem";

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
