/**
 * useLocalStorage - React hook for persistent state in localStorage
 *
 * Provides useState-like API with automatic persistence to localStorage.
 * Handles SSR, JSON serialization, and storage events.
 */

import { useCallback, useEffect, useState } from "react";

/**
 * React hook for localStorage-backed state.
 *
 * @example
 * ```tsx
 * function Settings() {
 *   const [theme, setTheme] = useLocalStorage('theme', 'light');
 *   const [fontSize, setFontSize] = useLocalStorage('fontSize', 14);
 *
 *   return (
 *     <div>
 *       <select value={theme} onChange={(e) => setTheme(e.target.value)}>
 *         <option value="light">Light</option>
 *         <option value="dark">Dark</option>
 *       </select>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get initial value from localStorage or use default
  const getStoredValue = (): T => {
    // SSR check
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store value - initialize with stored value
  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Set value and persist to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function (like useState)
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;

          // Save to localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(key, JSON.stringify(valueToStore));

            // Dispatch storage event for other tabs/components
            window.dispatchEvent(
              new StorageEvent("storage", {
                key,
                newValue: JSON.stringify(valueToStore),
              }),
            );
          }

          return valueToStore;
        });
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key],
  );

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
