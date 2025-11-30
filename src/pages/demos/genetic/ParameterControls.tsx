import { Card } from "@/components/Card";
import { Label } from "@/components/Label";
import { RangeSlider } from "@/components/RangeSlider";
import { Select } from "@/components/Select";
import { SimulationControls } from "@/components/SimulationControls";
import { FITNESS_OPTIONS } from "./constants";
import type { FitnessType, GAState } from "./types";

interface ParameterControlsProps {
  fitnessType: FitnessType;
  populationSize: number;
  mutationRate: number;
  isRunning: boolean;
  state: GAState;
  onFitnessTypeChange: (type: FitnessType) => void;
  onPopulationSizeChange: (size: number) => void;
  onMutationRateChange: (rate: number) => void;
  onStep: () => void;
  onToggle: () => void;
  onReset: () => void;
}

export function ParameterControls({
  fitnessType,
  populationSize,
  mutationRate,
  isRunning,
  state,
  onFitnessTypeChange,
  onPopulationSizeChange,
  onMutationRateChange,
  onStep,
  onToggle,
  onReset,
}: ParameterControlsProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold text-text">Parameters</h2>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fitness-function">Fitness Function</Label>
          <Select
            className="w-full"
            disabled={isRunning}
            id="fitness-function"
            onChange={onFitnessTypeChange}
            options={FITNESS_OPTIONS}
            value={fitnessType}
          />
        </div>

        <div>
          <Label htmlFor="ga-population">Population: {populationSize}</Label>
          <RangeSlider
            disabled={isRunning}
            id="ga-population"
            max={24}
            min={6}
            onChange={onPopulationSizeChange}
            step={2}
            value={populationSize}
          />
        </div>

        <div>
          <Label htmlFor="mutation-rate">
            Mutation Rate: {(mutationRate * 100).toFixed(0)}%
          </Label>
          <RangeSlider
            id="mutation-rate"
            max={0.8}
            min={0.05}
            onChange={onMutationRateChange}
            step={0.05}
            value={mutationRate}
          />
        </div>

        <SimulationControls
          isRunning={isRunning}
          onReset={onReset}
          onStep={onStep}
          onToggle={onToggle}
          runLabel="Evolve"
        />
      </div>

      {/* Stats */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-text-muted">Generation:</span>
          <span className="font-medium text-text">{state.generation}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Best Fitness:</span>
          <span className="font-medium text-green-600">
            {(state.bestFitness * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Avg Fitness:</span>
          <span className="font-medium text-text">
            {(state.avgFitness * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
}
