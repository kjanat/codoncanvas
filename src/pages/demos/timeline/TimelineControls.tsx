import { Card } from "@/components/Card";
import { RangeSlider } from "@/components/RangeSlider";
import { Select } from "@/components/Select";
import { ChevronLeftIcon, ChevronRightIcon, RewindIcon } from "@/ui/icons";
import { SPEED_OPTIONS } from "./constants";

interface TimelineControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  isExporting: boolean;
  exportProgress: number;
  onPlayPause: () => void;
  onReset: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onStepChange: (step: number) => void;
  onSpeedChange: (speed: number) => void;
  onExportGif: () => void;
}

export function TimelineControls({
  currentStep,
  totalSteps,
  isPlaying,
  playbackSpeed,
  isExporting,
  exportProgress,
  onPlayPause,
  onReset,
  onStepBack,
  onStepForward,
  onStepChange,
  onSpeedChange,
  onExportGif,
}: TimelineControlsProps) {
  return (
    <Card className="mt-6">
      <div className="flex items-center gap-4">
        <button
          className="rounded-md p-2 hover:bg-bg-light"
          onClick={onReset}
          title="Reset to start"
          type="button"
        >
          <RewindIcon />
        </button>

        <button
          className="rounded-md p-2 hover:bg-bg-light disabled:opacity-50"
          disabled={currentStep === 0}
          onClick={onStepBack}
          title="Previous step"
          type="button"
        >
          <ChevronLeftIcon />
        </button>

        <button
          className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-hover"
          onClick={onPlayPause}
          type="button"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        <button
          className="rounded-md p-2 hover:bg-bg-light disabled:opacity-50"
          disabled={currentStep >= totalSteps - 1}
          onClick={onStepForward}
          title="Next step"
          type="button"
        >
          <ChevronRightIcon />
        </button>

        <RangeSlider
          className="flex-1"
          max={totalSteps - 1}
          min={0}
          onChange={onStepChange}
          value={currentStep}
        />

        <Select
          onChange={onSpeedChange}
          options={SPEED_OPTIONS}
          value={playbackSpeed}
        />

        <button
          className="ml-auto rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-bg-light disabled:opacity-50"
          disabled={isExporting || totalSteps === 0}
          onClick={onExportGif}
          title="Export animation as GIF"
          type="button"
        >
          {isExporting ? `Exporting ${exportProgress}%` : "Export GIF"}
        </button>
      </div>
    </Card>
  );
}
