/**
 * useGenomeExecution - VM execution hook for CodonCanvas
 *
 * Handles genome execution via CodonVM, tracking execution stats,
 * and auto-running when dependencies change.
 */

import { useCallback, useEffect, useState } from "react";
import { CodonVM, type Renderer } from "@/core";
import type { GenomeValidation } from "./useGenome";

export interface ExecutionStats {
  codons: number;
  instructions: number;
}

export interface UseGenomeExecutionOptions {
  /** Canvas renderer instance */
  renderer: Renderer | null;
  /** Whether the canvas is ready */
  isReady: boolean;
  /** Genome validation result with tokens */
  validation: GenomeValidation;
  /** Clear the canvas */
  clear: () => void;
  /** Current theme for default color */
  theme: "dark" | "light";
}

export interface UseGenomeExecutionReturn {
  /** Execution statistics */
  stats: ExecutionStats;
  /** Manually trigger execution */
  execute: () => void;
}

/**
 * Hook for executing genomes via CodonVM with automatic re-execution.
 *
 * @example
 * ```tsx
 * const { stats, execute } = useGenomeExecution({
 *   renderer,
 *   isReady,
 *   validation,
 *   clear,
 *   theme: resolvedTheme,
 * });
 *
 * // Stats update automatically when validation changes
 * console.log(`${stats.codons} codons, ${stats.instructions} instructions`);
 *
 * // Manual re-execution
 * <button onClick={execute}>Run</button>
 * ```
 */
export function useGenomeExecution({
  renderer,
  isReady,
  validation,
  clear,
  theme,
}: UseGenomeExecutionOptions): UseGenomeExecutionReturn {
  const [stats, setStats] = useState<ExecutionStats>({
    codons: 0,
    instructions: 0,
  });

  // Execute genome - single source of truth for VM execution
  const execute = useCallback(() => {
    if (!isReady || !renderer) {
      return;
    }

    clear();

    const { isValid, tokens } = validation;
    if (!isValid || tokens.length === 0) {
      return;
    }

    try {
      const vm = new CodonVM(renderer);
      // Set default color based on theme (dark = light lines, light = dark lines)
      renderer.setColor(0, 0, theme === "dark" ? 100 : 0);
      const snapshots = vm.run(tokens);
      setStats({
        codons: tokens.length,
        instructions: snapshots.length,
      });
    } catch (err) {
      console.warn("Execution error:", err);
    }
  }, [isReady, renderer, validation, clear, theme]);

  // Auto-run when dependencies change
  useEffect(() => {
    execute();
  }, [execute]);

  return {
    stats,
    execute,
  };
}

export default useGenomeExecution;
