/**
 * useVM - React hook for Virtual Machine execution
 *
 * Manages VM state, execution, and snapshot history for timeline scrubbing.
 * Works with useCanvas to render output.
 */

import { useEffect, useRef, useState } from "react";
import type { Renderer } from "@/core";
import { CodonVM } from "@/core/vm";
import type { CodonToken, VMState } from "@/types";

/** Execution result from VM run */
export interface ExecutionResult {
  /** Whether execution completed successfully */
  success: boolean;
  /** State snapshots for each instruction */
  snapshots: VMState[];
  /** Error message if execution failed */
  error: string | null;
  /** Total instructions executed */
  instructionCount: number;
}

/** Playback state for timeline scrubber */
export interface PlaybackState {
  /** Current step index in snapshots array */
  currentStep: number;
  /** Whether playback is active */
  isPlaying: boolean;
  /** Playback speed in ms per step */
  speed: number;
}

/** Options for useVM hook */
export interface UseVMOptions {
  /** Maximum instructions before halt (default: 10000) */
  maxInstructions?: number;
  /** Default playback speed in ms (default: 500) */
  defaultPlaybackSpeed?: number;
}

/** Return type of useVM hook */
export interface UseVMReturn {
  /** Run tokens and capture state history */
  run: (tokens: CodonToken[], renderer: Renderer) => ExecutionResult;
  /** Current execution result */
  result: ExecutionResult | null;
  /** Playback state for timeline */
  playback: PlaybackState;
  /** Go to specific step */
  goToStep: (step: number) => void;
  /** Start playback */
  play: () => void;
  /** Pause playback */
  pause: () => void;
  /** Toggle play/pause */
  togglePlayback: () => void;
  /** Reset to first step */
  resetPlayback: () => void;
  /** Set playback speed */
  setSpeed: (speed: number) => void;
  /** Step forward one instruction */
  stepForward: () => void;
  /** Step backward one instruction */
  stepBackward: () => void;
  /** Re-render at current step (requires renderer) */
  renderAtStep: (
    step: number,
    tokens: CodonToken[],
    renderer: Renderer,
  ) => void;
  /** Clear execution state */
  clear: () => void;
}

const DEFAULT_MAX_INSTRUCTIONS = 10000;
const DEFAULT_PLAYBACK_SPEED = 500;

/**
 * React hook for VM execution and timeline control.
 *
 * @example
 * ```tsx
 * function TimelinePlayer({ tokens, renderer }) {
 *   const { run, playback, play, pause, goToStep } = useVM();
 *
 *   useEffect(() => {
 *     run(tokens, renderer);
 *   }, [tokens]);
 *
 *   return (
 *     <div>
 *       <button onClick={playback.isPlaying ? pause : play}>
 *         {playback.isPlaying ? 'Pause' : 'Play'}
 *       </button>
 *       <input
 *         type="range"
 *         value={playback.currentStep}
 *         max={result?.snapshots.length ?? 0}
 *         onChange={(e) => goToStep(Number(e.target.value))}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useVM(options: UseVMOptions = {}): UseVMReturn {
  const {
    maxInstructions = DEFAULT_MAX_INSTRUCTIONS,
    defaultPlaybackSpeed = DEFAULT_PLAYBACK_SPEED,
  } = options;

  // Execution state
  const [result, setResult] = useState<ExecutionResult | null>(null);

  // Playback state
  const [playback, setPlayback] = useState<PlaybackState>({
    currentStep: 0,
    isPlaying: false,
    speed: defaultPlaybackSpeed,
  });

  // Refs for interval and result access in callbacks
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resultRef = useRef<ExecutionResult | null>(null);

  // Clear interval helper - stored in ref for stable reference
  const clearPlaybackIntervalRef = useRef(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  });

  // Cleanup interval on unmount
  useEffect(() => {
    const clearFn = clearPlaybackIntervalRef.current;
    return () => clearFn();
  }, []);

  // Helper to access the clear function
  const clearPlaybackInterval = () => clearPlaybackIntervalRef.current();

  // Run tokens and capture snapshots
  const run = (tokens: CodonToken[], renderer: Renderer): ExecutionResult => {
    clearPlaybackInterval();

    try {
      const vm = new CodonVM(renderer, maxInstructions);
      const snapshots = vm.run(tokens);

      const executionResult: ExecutionResult = {
        success: true,
        snapshots,
        error: null,
        instructionCount: snapshots.length,
      };

      setResult(executionResult);
      resultRef.current = executionResult;
      setPlayback((prev) => ({
        ...prev,
        currentStep: snapshots.length - 1,
        isPlaying: false,
      }));

      return executionResult;
    } catch (err) {
      const executionResult: ExecutionResult = {
        success: false,
        snapshots: [],
        error: err instanceof Error ? err.message : "Execution failed",
        instructionCount: 0,
      };

      setResult(executionResult);
      resultRef.current = executionResult;
      setPlayback((prev) => ({
        ...prev,
        currentStep: 0,
        isPlaying: false,
      }));

      return executionResult;
    }
  };

  // Render at specific step (re-executes up to that point)
  const renderAtStep = (
    step: number,
    tokens: CodonToken[],
    renderer: Renderer,
  ) => {
    try {
      const tokensToRun = tokens.slice(0, step + 1);
      const vm = new CodonVM(renderer, maxInstructions);
      vm.run(tokensToRun);
    } catch {
      console.warn(`Failed to render at step ${step}`);
    }
  };

  // Go to specific step
  const goToStep = (step: number) => {
    const currentResult = resultRef.current;
    if (!currentResult) return;

    const clampedStep = Math.max(
      0,
      Math.min(step, currentResult.snapshots.length - 1),
    );

    setPlayback((prev) => ({
      ...prev,
      currentStep: clampedStep,
    }));
  };

  // Step forward
  const stepForward = () => {
    setPlayback((prev) => {
      const currentResult = resultRef.current;
      if (!currentResult) return prev;
      const nextStep = Math.min(
        prev.currentStep + 1,
        currentResult.snapshots.length - 1,
      );
      return { ...prev, currentStep: nextStep };
    });
  };

  // Step backward
  const stepBackward = () => {
    setPlayback((prev) => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1),
    }));
  };

  // Start playback
  const play = () => {
    const currentResult = resultRef.current;
    if (!currentResult || currentResult.snapshots.length === 0) return;

    clearPlaybackInterval();

    setPlayback((prev) => {
      const startStep =
        prev.currentStep >= currentResult.snapshots.length - 1
          ? 0
          : prev.currentStep;

      intervalRef.current = setInterval(() => {
        setPlayback((p) => {
          const nextStep = p.currentStep + 1;
          if (nextStep >= (resultRef.current?.snapshots.length ?? 0)) {
            clearPlaybackInterval();
            return { ...p, isPlaying: false };
          }
          return { ...p, currentStep: nextStep };
        });
      }, prev.speed);

      return { ...prev, currentStep: startStep, isPlaying: true };
    });
  };

  // Pause playback
  const pause = () => {
    clearPlaybackInterval();
    setPlayback((prev) => ({ ...prev, isPlaying: false }));
  };

  // Toggle play/pause
  const togglePlayback = () => {
    setPlayback((prev) => {
      if (prev.isPlaying) {
        clearPlaybackInterval();
        return { ...prev, isPlaying: false };
      }

      const currentResult = resultRef.current;
      if (!currentResult || currentResult.snapshots.length === 0) return prev;

      const startStep =
        prev.currentStep >= currentResult.snapshots.length - 1
          ? 0
          : prev.currentStep;

      intervalRef.current = setInterval(() => {
        setPlayback((p) => {
          const nextStep = p.currentStep + 1;
          if (nextStep >= (resultRef.current?.snapshots.length ?? 0)) {
            clearPlaybackInterval();
            return { ...p, isPlaying: false };
          }
          return { ...p, currentStep: nextStep };
        });
      }, prev.speed);

      return { ...prev, currentStep: startStep, isPlaying: true };
    });
  };

  // Reset to first step
  const resetPlayback = () => {
    clearPlaybackInterval();
    setPlayback((prev) => ({
      ...prev,
      currentStep: 0,
      isPlaying: false,
    }));
  };

  // Set playback speed
  const setSpeed = (speed: number) => {
    setPlayback((prev) => {
      if (prev.isPlaying) {
        clearPlaybackInterval();
        intervalRef.current = setInterval(() => {
          setPlayback((p) => {
            const nextStep = p.currentStep + 1;
            if (nextStep >= (resultRef.current?.snapshots.length ?? 0)) {
              clearPlaybackInterval();
              return { ...p, isPlaying: false };
            }
            return { ...p, currentStep: nextStep };
          });
        }, speed);
      }
      return { ...prev, speed };
    });
  };

  // Clear execution state
  const clear = () => {
    clearPlaybackInterval();
    setResult(null);
    resultRef.current = null;
    setPlayback({
      currentStep: 0,
      isPlaying: false,
      speed: defaultPlaybackSpeed,
    });
  };

  return {
    run,
    result,
    playback,
    goToStep,
    play,
    pause,
    togglePlayback,
    resetPlayback,
    setSpeed,
    stepForward,
    stepBackward,
    renderAtStep,
    clear,
  };
}

export default useVM;
