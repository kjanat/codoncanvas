/**
 * useHistory - React hook for undo/redo state management
 *
 * Provides history tracking with configurable max history size.
 * Useful for implementing undo/redo in editors.
 */

import { useRef, useState } from "react";

/** History state structure */
interface HistoryState<T> {
  /** Past states (for undo) */
  past: T[];
  /** Current state */
  present: T;
  /** Future states (for redo) */
  future: T[];
}

/** Options for useHistory hook */
export interface UseHistoryOptions {
  /** Maximum number of states to keep in history (default: 50) */
  maxHistory?: number;
}

/** Return type of useHistory hook */
export interface UseHistoryReturn<T> {
  /** Current state value */
  state: T;
  /** Set new state (adds to history) */
  setState: (newState: T | ((prev: T) => T)) => void;
  /** Undo to previous state, returns new state */
  undo: () => T;
  /** Redo to next state, returns new state */
  redo: () => T;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Clear all history */
  clearHistory: () => void;
  /** Number of undo steps available */
  undoCount: number;
  /** Number of redo steps available */
  redoCount: number;
}

const DEFAULT_MAX_HISTORY = 50;

/**
 * React hook for undo/redo history management.
 *
 * @example
 * ```tsx
 * function Editor() {
 *   const {
 *     state: text,
 *     setState: setText,
 *     undo,
 *     redo,
 *     canUndo,
 *     canRedo,
 *   } = useHistory("initial text");
 *
 *   return (
 *     <div>
 *       <textarea
 *         value={text}
 *         onChange={(e) => setText(e.target.value)}
 *       />
 *       <button onClick={undo} disabled={!canUndo}>Undo</button>
 *       <button onClick={redo} disabled={!canRedo}>Redo</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useHistory<T>(
  initialState: T,
  options: UseHistoryOptions = {},
): UseHistoryReturn<T> {
  const { maxHistory = DEFAULT_MAX_HISTORY } = options;

  // Use ref for history to avoid re-renders on history changes
  const historyRef = useRef<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  // State to trigger re-renders when needed
  const [, forceUpdate] = useState({});

  // Get current state
  const state = historyRef.current.present;

  // Set new state (adds to history)
  const setState = (newState: T | ((prev: T) => T)) => {
    const history = historyRef.current;
    const valueToStore =
      newState instanceof Function ? newState(history.present) : newState;

    // Don't add to history if value hasn't changed
    if (valueToStore === history.present) return;

    // Add current state to past, limit history size
    const newPast = [...history.past, history.present].slice(-maxHistory);

    historyRef.current = {
      past: newPast,
      present: valueToStore,
      future: [], // Clear future on new change
    };

    forceUpdate({});
  };

  // Undo to previous state
  const undo = (): T => {
    const history = historyRef.current;

    if (history.past.length === 0) return history.present;

    const previous = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    historyRef.current = {
      past: newPast,
      present: previous,
      future: [history.present, ...history.future],
    };

    forceUpdate({});
    return previous;
  };

  // Redo to next state
  const redo = (): T => {
    const history = historyRef.current;

    if (history.future.length === 0) return history.present;

    const next = history.future[0];
    const newFuture = history.future.slice(1);

    historyRef.current = {
      past: [...history.past, history.present],
      present: next,
      future: newFuture,
    };

    forceUpdate({});
    return next;
  };

  // Clear all history
  const clearHistory = () => {
    historyRef.current = {
      past: [],
      present: historyRef.current.present,
      future: [],
    };

    forceUpdate({});
  };

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: historyRef.current.past.length > 0,
    canRedo: historyRef.current.future.length > 0,
    clearHistory,
    undoCount: historyRef.current.past.length,
    redoCount: historyRef.current.future.length,
  };
}

export default useHistory;
