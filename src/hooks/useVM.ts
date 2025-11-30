/**
 * useVM - React hook for Virtual Machine execution
 *
 * Manages VM state, execution, and snapshot history for timeline scrubbing.
 * Works with useCanvas to render output.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Renderer } from "@/core/renderer";
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
    maxInstructions: _maxInstructions = DEFAULT_MAX_INSTRUCTIONS,
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

  // Playback interval ref
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clear any active playback interval
  const clearPlaybackInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup interval on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      clearPlaybackInterval();
    };
  }, [clearPlaybackInterval]);

  const resultRef = useRef<ExecutionResult | null>(null);

  // Run tokens and capture snapshots
  const run = useCallback(
    (tokens: CodonToken[], renderer: Renderer): ExecutionResult => {
      clearPlaybackInterval();

      try {
        const vm = new CodonVM(renderer, _maxInstructions);
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
        setPlayback((prev) => ({
          ...prev,
          currentStep: 0,
          isPlaying: false,
        }));

        return executionResult;
      }
    },
    [clearPlaybackInterval, _maxInstructions],
  );

  // Render at specific step (re-executes up to that point)
  const renderAtStep = useCallback(
    (step: number, tokens: CodonToken[], renderer: Renderer) => {
      try {
        const tokensToRun = tokens.slice(0, step + 1);
        const vm = new CodonVM(renderer, _maxInstructions);
        vm.run(tokensToRun);
      } catch {
        // Ignore render errors during stepping for UX
        console.warn(`Failed to render at step ${step}`);
      }
    },
    [_maxInstructions],
  );

  // Go to specific step
  const goToStep = useCallback(
    (step: number) => {
      if (!result) return;

      const clampedStep = Math.max(
        0,
        Math.min(step, result.snapshots.length - 1),
      );

      setPlayback((prev) => ({
        ...prev,
        currentStep: clampedStep,
      }));
    },
    [result],
  );

  // Step forward
  const stepForward = useCallback(() => {
    if (!result) return;
    goToStep(playback.currentStep + 1);
  }, [result, playback.currentStep, goToStep]);

  // Step backward
  const stepBackward = useCallback(() => {
    goToStep(playback.currentStep - 1);
  }, [playback.currentStep, goToStep]);

  // Start playback
  const play = useCallback(() => {
    if (!result || result.snapshots.length === 0) return;

    clearPlaybackInterval();

    // If at end, restart from beginning
    let startStep = playback.currentStep;
    if (startStep >= result.snapshots.length - 1) {
      startStep = 0;
      setPlayback((prev) => ({ ...prev, currentStep: 0 }));
    }

    setPlayback((prev) => ({ ...prev, isPlaying: true }));

    intervalRef.current = setInterval(() => {
      setPlayback((prev) => {
        const nextStep = prev.currentStep + 1;

        if (nextStep >= (resultRef.current?.snapshots.length ?? 0)) {
          clearPlaybackInterval();
          return { ...prev, isPlaying: false };
        }

        return { ...prev, currentStep: nextStep };
      });
    }, playback.speed);
  }, [result, playback.currentStep, playback.speed, clearPlaybackInterval]);

  // Pause playback
  const pause = useCallback(() => {
    clearPlaybackInterval();
    setPlayback((prev) => ({ ...prev, isPlaying: false }));
  }, [clearPlaybackInterval]);

  // Toggle play/pause
  const togglePlayback = useCallback(() => {
    if (playback.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [playback.isPlaying, play, pause]);

  // Reset to first step
  const resetPlayback = useCallback(() => {
    clearPlaybackInterval();
    setPlayback((prev) => ({
      ...prev,
      currentStep: 0,
      isPlaying: false,
    }));
  }, [clearPlaybackInterval]);

  // Set playback speed
  const setSpeed = useCallback(
    (speed: number) => {
      setPlayback((prev) => ({ ...prev, speed }));

      // If playing, restart with new speed
      if (playback.isPlaying) {
        clearPlaybackInterval();
        play();
      }
    },
    [playback.isPlaying, clearPlaybackInterval, play],
  );

  // Clear execution state
  const clear = useCallback(() => {
    clearPlaybackInterval();
    setResult(null);
    setPlayback({
      currentStep: 0,
      isPlaying: false,
      speed: defaultPlaybackSpeed,
    });
  }, [clearPlaybackInterval, defaultPlaybackSpeed]);

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
