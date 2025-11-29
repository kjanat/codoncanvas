/**
 * useClipboard - React hook for clipboard operations
 *
 * Provides copy/paste functionality with status feedback.
 */

import { useCallback, useState } from "react";

/** Return type of useClipboard hook */
export interface UseClipboardReturn {
  /** Copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Read text from clipboard */
  paste: () => Promise<string | null>;
  /** Whether copy was recently successful */
  copied: boolean;
  /** Error message if operation failed */
  error: string | null;
  /** Reset copied/error state */
  reset: () => void;
}

/** Options for useClipboard hook */
export interface UseClipboardOptions {
  /** Duration to show "copied" state in ms (default: 2000) */
  copiedDuration?: number;
}

/**
 * React hook for clipboard operations.
 *
 * @example
 * ```tsx
 * function CopyButton({ text }) {
 *   const { copy, copied, error } = useClipboard();
 *
 *   return (
 *     <button onClick={() => copy(text)}>
 *       {copied ? "Copied!" : "Copy"}
 *     </button>
 *   );
 * }
 * ```
 */
export function useClipboard(
  options: UseClipboardOptions = {},
): UseClipboardReturn {
  const { copiedDuration = 2000 } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Copy text to clipboard
  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      setError(null);

      try {
        // Modern Clipboard API
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
          setCopied(true);

          // Reset after duration
          setTimeout(() => setCopied(false), copiedDuration);
          return true;
        }

        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const success = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), copiedDuration);
          return true;
        }

        throw new Error("execCommand copy failed");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Copy failed";
        setError(message);
        setCopied(false);
        return false;
      }
    },
    [copiedDuration],
  );

  // Read text from clipboard
  const paste = useCallback(async (): Promise<string | null> => {
    setError(null);

    try {
      // Modern Clipboard API
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        return text;
      }

      // No fallback for paste (security restrictions)
      throw new Error("Clipboard read not supported");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Paste failed";
      setError(message);
      return null;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return {
    copy,
    paste,
    copied,
    error,
    reset,
  };
}

export default useClipboard;
