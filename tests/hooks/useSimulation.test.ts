/**
 * Tests for useSimulation hook
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useSimulation } from "@/hooks/useSimulation";

describe("useSimulation", () => {
  let stepCallback: ReturnType<typeof mock>;

  beforeEach(() => {
    stepCallback = mock(() => {});
  });

  test("initializes with correct default state", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.step).toBe(0);
    expect(result.current.state.speed).toBe(500);
  });

  test("initializes with custom speed", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback, initialSpeed: 200 }),
    );

    expect(result.current.state.speed).toBe(200);
  });

  test("toggle switches isRunning state", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    expect(result.current.state.isRunning).toBe(false);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.state.isRunning).toBe(true);

    act(() => {
      result.current.toggle();
    });

    expect(result.current.state.isRunning).toBe(false);
  });

  test("start sets isRunning to true", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.state.isRunning).toBe(true);
  });

  test("pause sets isRunning to false", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.state.isRunning).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.state.isRunning).toBe(false);
  });

  test("step calls onStep when not running", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    act(() => {
      result.current.step();
    });

    expect(stepCallback).toHaveBeenCalledTimes(1);
  });

  test("step does not call onStep when running", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.step();
    });

    // onStep is called by interval, not by step() when running
    // So step() should not add extra calls
    expect(stepCallback).toHaveBeenCalledTimes(0);
  });

  test("reset resets state to initial values", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback, initialSpeed: 300 }),
    );

    act(() => {
      result.current.start();
      result.current.setSpeed(100);
      result.current.incrementStep();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.step).toBe(0);
    expect(result.current.state.speed).toBe(300);
  });

  test("setSpeed updates speed", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    act(() => {
      result.current.setSpeed(100);
    });

    expect(result.current.state.speed).toBe(100);
  });

  test("incrementStep increases step counter", () => {
    const { result } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    expect(result.current.state.step).toBe(0);

    act(() => {
      result.current.incrementStep();
    });

    expect(result.current.state.step).toBe(1);

    act(() => {
      result.current.incrementStep();
      result.current.incrementStep();
    });

    expect(result.current.state.step).toBe(3);
  });

  test("functions work correctly after rerender", () => {
    const { result, rerender } = renderHook(() =>
      useSimulation({ onStep: stepCallback }),
    );

    // Functions should work before rerender
    expect(result.current.state.isRunning).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.state.isRunning).toBe(true);

    act(() => {
      result.current.pause();
    });
    expect(result.current.state.isRunning).toBe(false);

    rerender();

    // Functions should still work after rerender
    act(() => {
      result.current.start();
    });
    expect(result.current.state.isRunning).toBe(true);

    act(() => {
      result.current.reset();
    });
    expect(result.current.state.isRunning).toBe(false);
    expect(result.current.state.step).toBe(0);
  });

  describe("shouldStop and onComplete callbacks", () => {
    test("stops when shouldStop returns true", async () => {
      let stepCount = 0;
      const shouldStop = mock(() => stepCount >= 2);
      const onComplete = mock(() => {});

      const { result } = renderHook(() =>
        useSimulation({
          onStep: () => {
            stepCount++;
          },
          shouldStop,
          onComplete,
          initialSpeed: 10,
        }),
      );

      act(() => {
        result.current.start();
      });

      // Wait for interval to trigger and check condition
      await new Promise((resolve) => setTimeout(resolve, 50));

      // shouldStop should have been called
      expect(shouldStop).toHaveBeenCalled();
    });

    test("calls onComplete when simulation stops via shouldStop", async () => {
      let stepCount = 0;
      const shouldStop = () => stepCount >= 1;
      const onComplete = mock(() => {});

      const { result } = renderHook(() =>
        useSimulation({
          onStep: () => {
            stepCount++;
          },
          shouldStop,
          onComplete,
          initialSpeed: 10,
        }),
      );

      act(() => {
        result.current.start();
      });

      // Wait for condition to be met
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(onComplete).toHaveBeenCalled();
    });

    test("interval continues calling onStep while shouldStop is false", async () => {
      const shouldStop = () => false;
      let callCount = 0;

      const { result } = renderHook(() =>
        useSimulation({
          onStep: () => {
            callCount++;
          },
          shouldStop,
          initialSpeed: 10,
        }),
      );

      act(() => {
        result.current.start();
      });

      await new Promise((resolve) => setTimeout(resolve, 40));

      act(() => {
        result.current.pause();
      });

      expect(callCount).toBeGreaterThan(0);
    });
  });
});
