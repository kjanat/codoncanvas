/**
 * SimulationControls Component
 *
 * Reusable control bar for simulations with Run/Pause/Step/Reset buttons.
 * Used by GeneticDemo, PopulationDemo, and similar simulation UIs.
 */

import type { ReactNode } from "react";
import { Button } from "./Button";

export interface SimulationControlsProps {
  /** Whether simulation is running */
  isRunning: boolean;
  /** Toggle between running and paused */
  onToggle: () => void;
  /** Execute single step */
  onStep: () => void;
  /** Reset simulation */
  onReset: () => void;
  /** Label for run button (default: "Run") */
  runLabel?: string;
  /** Label for pause button (default: "Pause") */
  pauseLabel?: string;
  /** Whether step button is disabled */
  stepDisabled?: boolean;
  /** Additional controls to render */
  children?: ReactNode;
}

/**
 * Control bar for simulations.
 *
 * @example
 * ```tsx
 * <SimulationControls
 *   isRunning={state.isRunning}
 *   onToggle={toggle}
 *   onStep={step}
 *   onReset={reset}
 *   runLabel="Evolve"
 * />
 * ```
 */
export function SimulationControls({
  isRunning,
  onToggle,
  onStep,
  onReset,
  runLabel = "Run",
  pauseLabel = "Pause",
  stepDisabled,
  children,
}: SimulationControlsProps) {
  return (
    <div className="flex gap-2">
      <Button className="flex-1" onClick={onToggle} variant="primary">
        {isRunning ? pauseLabel : runLabel}
      </Button>
      <Button
        disabled={stepDisabled ?? isRunning}
        onClick={onStep}
        variant="secondary"
      >
        Step
      </Button>
      <Button onClick={onReset} variant="secondary">
        Reset
      </Button>
      {children}
    </div>
  );
}

export default SimulationControls;
