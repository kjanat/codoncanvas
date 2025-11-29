/**
 * UI State Management Module
 * Manages all application state and core initialization
 */

import { ResearchMetrics } from "@/analysis/research-metrics";
import { CodonLexer } from "@/core/lexer";
import { Canvas2DRenderer } from "@/core/renderer";
import { CodonVM } from "@/core/vm";
import { AchievementEngine } from "@/education/achievements/achievement-engine";
import { AchievementUI } from "@/education/achievements/achievement-ui";
import { AssessmentEngine } from "@/education/assessments/assessment-engine";
import type { AssessmentUI } from "@/education/assessments/assessment-ui";
import { AudioRenderer } from "@/exporters/audio-renderer";
import { MIDIExporter } from "@/exporters/midi-exporter";
import { canvas, timelineContainer } from "@/playground/dom-manager";
import type { RenderMode, VMState } from "@/types";
import { ThemeManager } from "@/ui/theme-manager";
import { TimelineScrubber } from "@/ui/timeline-scrubber";

// Re-export RenderMode for consumers that import from this module
export type { RenderMode };

// Lexer, renderer, and VM initialization
export const lexer = new CodonLexer();
export const renderer = new Canvas2DRenderer(canvas);
export const audioRenderer = new AudioRenderer();
export const midiExporter = new MIDIExporter();

export let renderMode: RenderMode = "visual";

export const vm = new CodonVM(renderer);
export let lastSnapshots: VMState[] = [];

// Timeline scrubber
export const timelineScrubber = new TimelineScrubber({
  containerElement: timelineContainer,
  canvasElement: canvas,
  autoPlay: false,
  playbackSpeed: 500,
});
export let timelineVisible = false;

// Theme manager
export const themeManager = new ThemeManager();

// Achievement system
export const achievementEngine = new AchievementEngine();
export const achievementUI = new AchievementUI(
  achievementEngine,
  "achievementContainer",
);

// Assessment system
export const assessmentEngine = new AssessmentEngine();
export let assessmentUI: AssessmentUI | null = null;

// Research metrics
export const researchMetrics = new ResearchMetrics({ enabled: false });

/**
 * Update render mode
 */
export function setRenderMode(mode: RenderMode) {
  renderMode = mode;
}

/**
 * Update timeline visibility state
 */
export function setTimelineVisible(visible: boolean) {
  timelineVisible = visible;
}

/**
 * Update assessment UI instance
 */
export function setAssessmentUI(ui: AssessmentUI | null) {
  assessmentUI = ui;
}

/**
 * Update last snapshots
 */
export function setLastSnapshots(snapshots: VMState[]) {
  lastSnapshots = snapshots;
}
