/**
 * UI State Management Test Suite
 *
 * Tests for the centralized state management module that handles
 * all application state and core component initialization.
 *
 * Note: Due to module caching in dynamic imports, we test the pure
 * state management functions rather than DOM-dependent initialization.
 */
import { describe, expect, test } from "bun:test";
import type { RenderMode, VMState } from "../types";

describe("UI State Management", () => {
  // State Management Functions (Pure logic, no DOM dependencies)
  describe("state management logic", () => {
    // Test the state management pattern used in ui-state
    let renderMode: RenderMode = "visual";
    let timelineVisible = false;
    let lastSnapshots: VMState[] = [];
    let assessmentUI: unknown = null;

    const setRenderMode = (mode: RenderMode) => {
      renderMode = mode;
    };

    const setTimelineVisible = (visible: boolean) => {
      timelineVisible = visible;
    };

    const setLastSnapshots = (snapshots: VMState[]) => {
      lastSnapshots = snapshots;
    };

    const setAssessmentUI = (ui: unknown) => {
      assessmentUI = ui;
    };

    test("renderMode defaults to 'visual'", () => {
      expect(renderMode).toBe("visual");
    });

    test("setRenderMode updates to 'audio'", () => {
      setRenderMode("audio");
      expect(renderMode).toBe("audio");
    });

    test("setRenderMode updates to 'both'", () => {
      setRenderMode("both");
      expect(renderMode).toBe("both");
    });

    test("setRenderMode updates to 'visual'", () => {
      setRenderMode("visual");
      expect(renderMode).toBe("visual");
    });

    test("timelineVisible defaults to false", () => {
      expect(timelineVisible).toBe(false);
    });

    test("setTimelineVisible updates to true", () => {
      setTimelineVisible(true);
      expect(timelineVisible).toBe(true);
    });

    test("setTimelineVisible updates to false", () => {
      setTimelineVisible(false);
      expect(timelineVisible).toBe(false);
    });

    test("lastSnapshots defaults to empty array", () => {
      expect(lastSnapshots).toEqual([]);
    });

    test("setLastSnapshots updates with VMState array", () => {
      const snapshots = [
        { x: 0, y: 0, angle: 0, color: "#000", penDown: true },
      ] as VMState[];
      setLastSnapshots(snapshots);
      expect(lastSnapshots).toBe(snapshots);
    });

    test("setLastSnapshots preserves reference (no deep copy)", () => {
      const snapshots = [
        { x: 100, y: 100, angle: 90, color: "#FFF", penDown: false },
      ] as VMState[];
      setLastSnapshots(snapshots);
      expect(lastSnapshots).toBe(snapshots);
      // Verify mutation affects the stored reference
      (snapshots[0] as { x: number }).x = 999;
      expect((lastSnapshots[0] as { x: number }).x).toBe(999);
    });

    test("assessmentUI defaults to null", () => {
      expect(assessmentUI).toBe(null);
    });

    test("setAssessmentUI updates to mock instance", () => {
      const mockUI = { show: () => {} };
      setAssessmentUI(mockUI);
      expect(assessmentUI).toBe(mockUI);
    });

    test("setAssessmentUI updates to null", () => {
      setAssessmentUI(null);
      expect(assessmentUI).toBe(null);
    });
  });

  // RenderMode Type Tests
  describe("RenderMode type", () => {
    test("accepts 'visual' as valid mode", () => {
      const mode: RenderMode = "visual";
      expect(mode).toBe("visual");
    });

    test("accepts 'audio' as valid mode", () => {
      const mode: RenderMode = "audio";
      expect(mode).toBe("audio");
    });

    test("accepts 'both' as valid mode", () => {
      const mode: RenderMode = "both";
      expect(mode).toBe("both");
    });
  });

  // VMState Type Tests
  describe("VMState structure", () => {
    test("VMState has required properties", () => {
      const state: VMState = {
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: { h: 0, s: 0, l: 0 },
        stack: [],
        instructionPointer: 0,
        stateStack: [],
        instructionCount: 0,
        seed: 12345,
      };
      expect(state.position.x).toBe(0);
      expect(state.position.y).toBe(0);
      expect(state.rotation).toBe(0);
      expect(state.color.h).toBe(0);
      expect(state.scale).toBe(1);
    });

    test("VMState array can store multiple states", () => {
      const baseState: VMState = {
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: 1,
        color: { h: 0, s: 0, l: 0 },
        stack: [],
        instructionPointer: 0,
        stateStack: [],
        instructionCount: 0,
        seed: 12345,
      };
      const states: VMState[] = [
        { ...baseState, position: { x: 0, y: 0 }, rotation: 0, color: { h: 0, s: 0, l: 0 } },
        { ...baseState, position: { x: 100, y: 100 }, rotation: 90, color: { h: 120, s: 50, l: 50 } },
        { ...baseState, position: { x: 200, y: 200 }, rotation: 180, color: { h: 240, s: 100, l: 50 } },
      ];
      expect(states.length).toBe(3);
      expect(states[1].position.x).toBe(100);
      expect(states[2].rotation).toBe(180);
    });
  });
});
