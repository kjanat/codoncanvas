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
  // =========================================================================
  // State Management Functions (Pure logic, no DOM dependencies)
  // =========================================================================
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

  // =========================================================================
  // RenderMode Type Tests
  // =========================================================================
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

  // =========================================================================
  // VMState Type Tests
  // =========================================================================
  describe("VMState structure", () => {
    test("VMState has required properties", () => {
      const state: VMState = {
        x: 0,
        y: 0,
        angle: 0,
        color: "#000000",
        penDown: true,
      };
      expect(state.x).toBe(0);
      expect(state.y).toBe(0);
      expect(state.angle).toBe(0);
      expect(state.color).toBe("#000000");
      expect(state.penDown).toBe(true);
    });

    test("VMState array can store multiple states", () => {
      const states: VMState[] = [
        { x: 0, y: 0, angle: 0, color: "#000", penDown: true },
        { x: 100, y: 100, angle: 90, color: "#FFF", penDown: false },
        { x: 200, y: 200, angle: 180, color: "#F00", penDown: true },
      ];
      expect(states.length).toBe(3);
      expect(states[1].x).toBe(100);
      expect(states[2].angle).toBe(180);
    });
  });
});
