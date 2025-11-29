/**
 * @fileoverview UI State Management Module (LEGACY)
 *
 * @deprecated This module is legacy code for vanilla JS HTML pages.
 * For React components, state is managed via hooks:
 * - useCanvas - Canvas/renderer management
 * - useVM - VM execution
 * - useGenome - Genome state and validation
 * - usePreferences - Theme and user settings
 *
 * This file will be removed once all legacy HTML demo pages
 * are migrated to React components.
 *
 * @see src/hooks/ - React hooks directory
 * @see src/components/Playground.tsx - React state management
 *
 * @module playground/ui-state
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

/** Re-export RenderMode for consumers that import from this module */
export type { RenderMode };

// =============================================================================
// Core Engine Singletons
// =============================================================================

/** Shared lexer instance for tokenizing genome code */
export const lexer = new CodonLexer();

/** Canvas2D renderer for visual output */
export const renderer = new Canvas2DRenderer(canvas);

/** Audio renderer for sonification */
export const audioRenderer = new AudioRenderer();

/** MIDI exporter for music export */
export const midiExporter = new MIDIExporter();

/** Current render mode: "visual", "audio", or "both" */
export let renderMode: RenderMode = "visual";

/** Virtual machine for executing genome programs */
export const vm = new CodonVM(renderer);

/** Last execution snapshots for timeline scrubbing */
export let lastSnapshots: VMState[] = [];

// =============================================================================
// Timeline System
// =============================================================================

/** Timeline scrubber for stepping through execution */
export const timelineScrubber = new TimelineScrubber({
  containerElement: timelineContainer,
  canvasElement: canvas,
  autoPlay: false,
  playbackSpeed: 500,
});

/** Whether timeline panel is currently visible */
export let timelineVisible = false;

// =============================================================================
// Theme System
// =============================================================================

/** Theme manager for light/dark/system mode */
export const themeManager = new ThemeManager();

// =============================================================================
// Achievement System
// =============================================================================

/** Achievement tracking engine */
export const achievementEngine = new AchievementEngine();

/** Achievement notification UI */
export const achievementUI = new AchievementUI(
  achievementEngine,
  "achievementContainer",
);

// =============================================================================
// Assessment System
// =============================================================================

/** Assessment challenge engine */
export const assessmentEngine = new AssessmentEngine();

/** Assessment UI instance (lazily initialized) */
export let assessmentUI: AssessmentUI | null = null;

// =============================================================================
// Research Metrics
// =============================================================================

/** Research metrics tracker (disabled by default) */
export const researchMetrics = new ResearchMetrics({ enabled: false });

// =============================================================================
// State Setters
// =============================================================================

/**
 * Set the current render mode.
 * @param mode - "visual", "audio", or "both"
 */
export function setRenderMode(mode: RenderMode): void {
  renderMode = mode;
}

/**
 * Set timeline panel visibility.
 * @param visible - Whether to show the timeline panel
 */
export function setTimelineVisible(visible: boolean): void {
  timelineVisible = visible;
}

/**
 * Set the assessment UI instance.
 * @param ui - AssessmentUI instance or null to clear
 */
export function setAssessmentUI(ui: AssessmentUI | null): void {
  assessmentUI = ui;
}

/**
 * Set the last execution snapshots for timeline scrubbing.
 * @param snapshots - Array of VM state snapshots
 */
export function setLastSnapshots(snapshots: VMState[]): void {
  lastSnapshots = snapshots;
}
