/**
 * Tests for useVM hook
 *
 * Tests VM execution, playback controls, and timeline functionality.
 */

import { describe, expect, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { CodonLexer } from "@/core/lexer";
import { useVM } from "@/hooks/useVM";
import { createMockRenderer } from "../test-utils/canvas-mock";

// Valid genome: ATG=START, GAA=PUSH(1), AAT=PUSH(2), GGA=CIRCLE, TAA=STOP
const SIMPLE_GENOME = "ATG GAA AAT GGA TAA";
// Longer genome for more steps
const MULTI_STEP_GENOME = "ATG GAA AAT GGA GAA AAT GGA GAA AAT GGA TAA";

describe("useVM", () => {
  const lexer = new CodonLexer();

  describe("initialization", () => {
    test("initializes with null result", () => {
      const { result } = renderHook(() => useVM());

      expect(result.current.result).toBeNull();
    });

    test("initializes playback state", () => {
      const { result } = renderHook(() => useVM());

      expect(result.current.playback.currentStep).toBe(0);
      expect(result.current.playback.isPlaying).toBe(false);
      expect(result.current.playback.speed).toBe(500);
    });

    test("respects custom playback speed", () => {
      const { result } = renderHook(() =>
        useVM({ defaultPlaybackSpeed: 1000 }),
      );

      expect(result.current.playback.speed).toBe(1000);
    });
  });

  describe("run", () => {
    test("executes tokens successfully", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(SIMPLE_GENOME);

      let execResult: ReturnType<typeof result.current.run> | undefined;
      act(() => {
        execResult = result.current.run(tokens, renderer);
      });

      expect(execResult?.success).toBe(true);
      expect(execResult?.error).toBeNull();
      expect(execResult?.snapshots.length).toBeGreaterThan(0);
    });

    test("updates result state after run", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(SIMPLE_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      expect(result.current.result).not.toBeNull();
      expect(result.current.result?.success).toBe(true);
    });

    test("sets currentStep to last snapshot after run", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(SIMPLE_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      const snapshotCount = result.current.result?.snapshots.length ?? 0;
      expect(snapshotCount).toBeGreaterThan(0);
      expect(result.current.playback.currentStep).toBe(snapshotCount - 1);
    });

    test("handles empty tokens", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();

      let execResult: ReturnType<typeof result.current.run> | undefined;
      act(() => {
        execResult = result.current.run([], renderer);
      });

      // Empty tokens should still succeed (just no output)
      expect(execResult).toBeDefined();
    });
  });

  describe("playback controls", () => {
    test("goToStep changes current step", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(MULTI_STEP_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      act(() => {
        result.current.goToStep(1);
      });

      expect(result.current.playback.currentStep).toBe(1);
    });

    test("goToStep clamps to valid range (lower bound)", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(SIMPLE_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      act(() => {
        result.current.goToStep(-5);
      });

      expect(result.current.playback.currentStep).toBe(0);
    });

    test("goToStep clamps to valid range (upper bound)", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(SIMPLE_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      const maxStep = (result.current.result?.snapshots.length ?? 1) - 1;

      act(() => {
        result.current.goToStep(9999);
      });

      expect(result.current.playback.currentStep).toBe(maxStep);
    });

    test("stepForward increments step", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(MULTI_STEP_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      act(() => {
        result.current.resetPlayback(); // Reset to step 0
      });

      expect(result.current.playback.currentStep).toBe(0);

      act(() => {
        result.current.stepForward();
      });

      expect(result.current.playback.currentStep).toBe(1);
    });

    test("stepBackward decrements step", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(MULTI_STEP_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      act(() => {
        result.current.goToStep(2);
      });

      expect(result.current.playback.currentStep).toBe(2);

      act(() => {
        result.current.stepBackward();
      });

      expect(result.current.playback.currentStep).toBe(1);
    });

    test("resetPlayback sets step to 0", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(SIMPLE_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      act(() => {
        result.current.resetPlayback();
      });

      expect(result.current.playback.currentStep).toBe(0);
      expect(result.current.playback.isPlaying).toBe(false);
    });
  });

  describe("play/pause", () => {
    test("play starts playback", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(MULTI_STEP_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
        result.current.resetPlayback();
      });

      act(() => {
        result.current.play();
      });

      expect(result.current.playback.isPlaying).toBe(true);
    });

    test("pause stops playback", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(MULTI_STEP_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      act(() => {
        result.current.resetPlayback();
      });

      act(() => {
        result.current.play();
      });

      expect(result.current.playback.isPlaying).toBe(true);

      act(() => {
        result.current.pause();
      });

      expect(result.current.playback.isPlaying).toBe(false);
    });

    test("togglePlayback toggles play/pause", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(MULTI_STEP_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
        result.current.resetPlayback();
      });

      expect(result.current.playback.isPlaying).toBe(false);

      act(() => {
        result.current.togglePlayback();
      });

      expect(result.current.playback.isPlaying).toBe(true);

      act(() => {
        result.current.togglePlayback();
      });

      expect(result.current.playback.isPlaying).toBe(false);
    });

    // Skipped: Bun's fake timer API (vi.advanceTimersByTime) is not available
    test.skip("playback advances step over time", () => {
      // Would test that playback.currentStep increments over time
    });

    // Skipped: Bun's fake timer API (vi.advanceTimersByTime) is not available
    test.skip("playback stops at end", () => {
      // Would test that isPlaying becomes false when reaching last step
    });
  });

  describe("setSpeed", () => {
    test("changes playback speed", () => {
      const { result } = renderHook(() => useVM());

      act(() => {
        result.current.setSpeed(250);
      });

      expect(result.current.playback.speed).toBe(250);
    });
  });

  describe("clear", () => {
    test("clears execution result", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(SIMPLE_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.clear();
      });

      expect(result.current.result).toBeNull();
    });

    test("resets playback state on clear", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(SIMPLE_GENOME);

      act(() => {
        result.current.run(tokens, renderer);
        result.current.goToStep(2);
      });

      act(() => {
        result.current.clear();
      });

      expect(result.current.playback.currentStep).toBe(0);
      expect(result.current.playback.isPlaying).toBe(false);
    });
  });

  describe("renderAtStep", () => {
    test("renders tokens up to specified step without throwing", () => {
      const { result } = renderHook(() => useVM());
      const renderer = createMockRenderer();
      const tokens = lexer.tokenize(MULTI_STEP_GENOME);

      expect(() => {
        act(() => {
          result.current.renderAtStep(1, tokens, renderer);
        });
      }).not.toThrow();
    });
  });
});
