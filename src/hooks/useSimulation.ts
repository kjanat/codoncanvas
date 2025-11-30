/**
 * useSimulation - React hook for simulation/animation control
 *
 * Manages running state, interval timing, and playback controls.
 * Used by GeneticDemo, PopulationDemo, and similar simulation UIs.
 */

import { useEffect, useRef, useState } from "react";

/** Simulation state */
export interface SimulationState {
  /** Whether simulation is running */
  isRunning: boolean;
  /** Current generation/step count */
  step: number;
  /** Interval delay in milliseconds */
  speed: number;
}

/** Options for useSimulation hook */
export interface UseSimulationOptions {
  /** Initial speed in ms (default: 500) */
  initialSpeed?: number;
  /** Callback executed each step */
  onStep: () => void;
  /** Optional callback when simulation completes */
  onComplete?: () => void;
  /** Optional condition to stop simulation */
  shouldStop?: () => boolean;
}

/** Return type of useSimulation hook */
export interface UseSimulationReturn {
  /** Current simulation state */
  state: SimulationState;
  /** Start/resume simulation */
  start: () => void;
  /** Pause simulation */
  pause: () => void;
  /** Toggle between running and paused */
  toggle: () => void;
  /** Execute single step */
  step: () => void;
  /** Reset to initial state */
  reset: () => void;
  /** Set simulation speed */
  setSpeed: (speed: number) => void;
  /** Increment step counter (for external tracking) */
  incrementStep: () => void;
}

const DEFAULT_SPEED = 500;

/**
 * React hook for managing simulation/animation state and timing.
 *
 * @example
 * ```tsx
 * function SimulationDemo() {
 *   const [generation, setGeneration] = useState(0);
 *
 *   const { state, start, pause, step, reset, toggle } = useSimulation({
 *     initialSpeed: 200,
 *     onStep: () => {
 *       setGeneration(g => g + 1);
 *       // Evolve population...
 *     },
 *     shouldStop: () => generation >= 100,
 *   });
 *
 *   return (
 *     <div>
 *       <p>Generation: {generation}</p>
 *       <button onClick={toggle}>
 *         {state.isRunning ? 'Pause' : 'Run'}
 *       </button>
 *       <button onClick={step} disabled={state.isRunning}>Step</button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSimulation(
  options: UseSimulationOptions,
): UseSimulationReturn {
  const {
    initialSpeed = DEFAULT_SPEED,
    onStep,
    onComplete,
    shouldStop,
  } = options;

  const [state, setState] = useState<SimulationState>({
    isRunning: false,
    step: 0,
    speed: initialSpeed,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  const onStepRef = useRef(onStep);
  const shouldStopRef = useRef(shouldStop);
  const onCompleteRef = useRef(onComplete);

  // Keep refs updated
  useEffect(() => {
    onStepRef.current = onStep;
    shouldStopRef.current = shouldStop;
    onCompleteRef.current = onComplete;
  }, [onStep, shouldStop, onComplete]);

  // Manage interval based on running state
  useEffect(() => {
    // Clear interval helper - defined inside effect to avoid dependency issues
    const clearCurrentInterval = () => {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };

    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        // Check stop condition
        if (shouldStopRef.current?.()) {
          setState((prev) => ({ ...prev, isRunning: false }));
          onCompleteRef.current?.();
          return;
        }
        onStepRef.current();
      }, state.speed);
    } else {
      clearCurrentInterval();
    }

    return clearCurrentInterval;
  }, [state.isRunning, state.speed]);

  // Start simulation
  const start = () => {
    setState((prev) => ({ ...prev, isRunning: true }));
  };

  // Pause simulation
  const pause = () => {
    setState((prev) => ({ ...prev, isRunning: false }));
  };

  // Toggle running state
  const toggle = () => {
    setState((prev) => ({ ...prev, isRunning: !prev.isRunning }));
  };

  // Execute single step
  const step = () => {
    // Only step when not running
    setState((prev) => {
      if (!prev.isRunning) {
        onStepRef.current();
      }
      return prev;
    });
  };

  // Reset to initial state
  const reset = () => {
    // Clear interval directly using ref
    if (intervalRef.current !== undefined) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setState({
      isRunning: false,
      step: 0,
      speed: initialSpeed,
    });
  };

  // Set speed
  const setSpeed = (speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  };

  // Increment step counter
  const incrementStep = () => {
    setState((prev) => ({ ...prev, step: prev.step + 1 }));
  };

  return {
    state,
    start,
    pause,
    toggle,
    step,
    reset,
    setSpeed,
    incrementStep,
  };
}

export default useSimulation;
