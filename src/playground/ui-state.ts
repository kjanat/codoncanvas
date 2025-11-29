/**
 * UI State Management Module
 * Manages all application state and core initialization
 */

import { AchievementEngine } from "@/achievement-engine";
import { AchievementUI } from "@/achievement-ui";
import { AssessmentEngine } from "@/assessment-engine";
import type { AssessmentUI } from "@/assessment-ui";
import { AudioRenderer } from "@/audio-renderer";
import { CodonLexer } from "@/lexer";
import { MIDIExporter } from "@/midi-exporter";
import { canvas, timelineContainer } from "@/playground/dom-manager";
import { Canvas2DRenderer } from "@/renderer";
import { ResearchMetrics } from "@/research-metrics";
import { ThemeManager } from "@/theme-manager";
import { TimelineScrubber } from "@/timeline-scrubber";
import type { RenderMode, VMState } from "@/types";
import { CodonVM } from "@/vm";

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
