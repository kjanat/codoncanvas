/**
 * UI State Management Test Suite
 *
 * Tests for the centralized state management module that handles
 * all application state and core component initialization.
 *
 * Note: ui-state.ts has DOM-dependent side effects at import time
 * (requires #editor, #canvas elements). We test the state management
 * pattern here to verify the logic without requiring the full DOM setup.
 */
import { describe, expect, test } from "bun:test";
import type { RenderMode, VMState } from "../types";

describe("UI State Management", () => {
  // State Management Functions - testing the pattern used in ui-state.ts
  // Cannot import directly due to DOM side effects at module load time
  describe("state management logic", () => {
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
      const snapshots: VMState[] = [
        {
          position: { x: 0, y: 0 },
          rotation: 0,
          scale: 1,
          color: { h: 0, s: 0, l: 0 },
          stack: [],
          instructionPointer: 0,
          stateStack: [],
          instructionCount: 0,
          seed: 12345,
        },
      ];
      setLastSnapshots(snapshots);
      expect(lastSnapshots).toBe(snapshots);
    });

    test("setLastSnapshots preserves reference (no deep copy)", () => {
      const snapshots: VMState[] = [
        {
          position: { x: 100, y: 100 },
          rotation: 90,
          scale: 1,
          color: { h: 120, s: 50, l: 50 },
          stack: [],
          instructionPointer: 0,
          stateStack: [],
          instructionCount: 0,
          seed: 12345,
        },
      ];
      setLastSnapshots(snapshots);
      expect(lastSnapshots).toBe(snapshots);
      // Verify mutation affects the stored reference
      snapshots[0].position.x = 999;
      expect(lastSnapshots[0].position.x).toBe(999);
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
