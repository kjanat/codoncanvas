/**
 * ToastContext - Global toast notification system
 *
 * Provides a context-based toast notification API with support for
 * success, error, warning, and info variants.
 *
 * NOTE: useCallback is intentionally retained here because context
 * consumers need stable function references to avoid unnecessary re-renders.
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
  createdAt: number;
}

export interface ToastOptions {
  variant?: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Default durations per variant (ms)
const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

let toastIdCounter = 0;
function generateToastId(): string {
  return `toast-${Date.now()}-${++toastIdCounter}`;
}

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Provides toast notification functionality to the app.
 *
 * @example
 * ```tsx
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Stable callback for context consumers
  const addToast = useCallback((options: ToastOptions): string => {
    const id = generateToastId();
    const variant = options.variant ?? "info";
    const toast: Toast = {
      id,
      variant,
      title: options.title,
      message: options.message,
      duration: options.duration ?? DEFAULT_DURATIONS[variant],
      createdAt: Date.now(),
    };

    setToasts((prev) => [...prev, toast]);
    return id;
  }, []);

  // Stable callback for context consumers
  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Stable callback for context consumers
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Value object - React 19 compiler handles this
  const value: ToastContextValue = {
    toasts,
    addToast,
    dismissToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

/**
 * Hook to access toast notifications.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { success, error } = useToast();
 *   success("File saved!");
 *   error("Upload failed");
 * }
 * ```
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  const { addToast, dismissToast, clearAllToasts, toasts } = context;

  // Convenience methods - stable because addToast is stable
  const success = useCallback(
    (message: string, title?: string) =>
      addToast({ variant: "success", message, title }),
    [addToast],
  );

  const error = useCallback(
    (message: string, title?: string) =>
      addToast({ variant: "error", message, title }),
    [addToast],
  );

  const warning = useCallback(
    (message: string, title?: string) =>
      addToast({ variant: "warning", message, title }),
    [addToast],
  );

  const info = useCallback(
    (message: string, title?: string) =>
      addToast({ variant: "info", message, title }),
    [addToast],
  );

  return {
    toast: addToast,
    success,
    error,
    warning,
    info,
    dismiss: dismissToast,
    clearAll: clearAllToasts,
    toasts,
  };
}
