/**
 * UI State Management Test Suite
 *
 * Tests for the centralized state management module that handles
 * all application state and core component initialization.
 *
 * Note: ui-state.ts has DOM-dependent side effects at import time
 * (requires #editor, #canvas elements). We test the state management
 * pattern here using shared test utilities.
 */
import { describe, expect, test } from "bun:test";
import {
  createVMState,
  createVMStateWithPosition,
  isValidRenderMode,
  TestState,
  VALID_RENDER_MODES,
} from "@/tests/test-utils";
import type { RenderMode, VMState } from "@/types";

describe("UI State Management", () => {
  // State Management Functions - testing the pattern used in ui-state.ts
  // Cannot import directly due to DOM side effects at module load time
  describe("state management logic", () => {
    const renderModeState = new TestState<RenderMode>("visual");
    const timelineState = new TestState<boolean>(false);
    const snapshotsState = new TestState<VMState[]>([]);
    const assessmentState = new TestState<unknown>(null);

    test("renderMode defaults to 'visual'", () => {
      expect(renderModeState.get()).toBe("visual");
    });

    test("setRenderMode updates to 'audio'", () => {
      renderModeState.set("audio");
      expect(renderModeState.get()).toBe("audio");
    });

    test("setRenderMode updates to 'both'", () => {
      renderModeState.set("both");
      expect(renderModeState.get()).toBe("both");
    });

    test("setRenderMode updates to 'visual'", () => {
      renderModeState.set("visual");
      expect(renderModeState.get()).toBe("visual");
    });

    test("timelineVisible defaults to false", () => {
      expect(timelineState.get()).toBe(false);
    });

    test("setTimelineVisible updates to true", () => {
      timelineState.set(true);
      expect(timelineState.get()).toBe(true);
    });

    test("setTimelineVisible updates to false", () => {
      timelineState.set(false);
      expect(timelineState.get()).toBe(false);
    });

    test("lastSnapshots defaults to empty array", () => {
      expect(snapshotsState.get()).toEqual([]);
    });

    test("setLastSnapshots updates with VMState array", () => {
      const snapshots: VMState[] = [createVMState()];
      snapshotsState.set(snapshots);
      expect(snapshotsState.get()).toBe(snapshots);
    });

    test("setLastSnapshots preserves reference (no deep copy)", () => {
      const snapshots: VMState[] = [
        createVMStateWithPosition(100, 100, 90, { h: 120, s: 50, l: 50 }),
      ];
      snapshotsState.set(snapshots);
      expect(snapshotsState.get()).toBe(snapshots);
      // Verify mutation affects the stored reference
      snapshots[0].position.x = 999;
      expect(snapshotsState.get()[0].position.x).toBe(999);
    });

    test("assessmentUI defaults to null", () => {
      expect(assessmentState.get()).toBe(null);
    });

    test("setAssessmentUI updates to mock instance", () => {
      const mockUI = { show: () => {} };
      assessmentState.set(mockUI);
      expect(assessmentState.get()).toBe(mockUI);
    });

    test("setAssessmentUI updates to null", () => {
      assessmentState.set(null);
      expect(assessmentState.get()).toBe(null);
    });
  });

  // RenderMode Type Tests
  describe("RenderMode type", () => {
    test("accepts 'visual' as valid mode", () => {
      const mode: RenderMode = "visual";
      expect(mode).toBe("visual");
      expect(isValidRenderMode(mode)).toBe(true);
    });

    test("accepts 'audio' as valid mode", () => {
      const mode: RenderMode = "audio";
      expect(mode).toBe("audio");
      expect(isValidRenderMode(mode)).toBe(true);
    });

    test("accepts 'both' as valid mode", () => {
      const mode: RenderMode = "both";
      expect(mode).toBe("both");
      expect(isValidRenderMode(mode)).toBe(true);
    });

    test("all valid render modes are recognized", () => {
      for (const mode of VALID_RENDER_MODES) {
        expect(isValidRenderMode(mode)).toBe(true);
      }
    });
  });

  // VMState Type Tests
  describe("VMState structure", () => {
    test("VMState has required properties", () => {
      const state = createVMState();
      expect(state.position.x).toBe(0);
      expect(state.position.y).toBe(0);
      expect(state.rotation).toBe(0);
      expect(state.color.h).toBe(0);
      expect(state.scale).toBe(1);
    });

    test("VMState can be created with custom values", () => {
      const state = createVMState({
        position: { x: 50, y: 75 },
        rotation: 45,
        scale: 2,
      });
      expect(state.position.x).toBe(50);
      expect(state.position.y).toBe(75);
      expect(state.rotation).toBe(45);
      expect(state.scale).toBe(2);
    });

    test("VMState array can store multiple states", () => {
      const states: VMState[] = [
        createVMStateWithPosition(0, 0, 0, { h: 0, s: 0, l: 0 }),
        createVMStateWithPosition(100, 100, 90, { h: 120, s: 50, l: 50 }),
        createVMStateWithPosition(200, 200, 180, { h: 240, s: 100, l: 50 }),
      ];
      expect(states.length).toBe(3);
      expect(states[1].position.x).toBe(100);
      expect(states[2].rotation).toBe(180);
    });
  });
});
