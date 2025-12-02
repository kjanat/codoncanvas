import { describe, expect, it } from "bun:test";
import { degrees, positive, stackValue } from "@/types/branded";
import type { Codon, CodonToken } from "@/types/genetics";
import { Opcode } from "@/types/vm";
import {
  assertNever,
  error,
  halted,
  isError,
  isHalted,
  isPaused,
  isRunning,
  type PauseReason,
  paused,
  running,
  type VMExecutionError,
  type VMExecutionResult,
  type VMStateSnapshot,
} from "@/types/vm-states";

// Mock state snapshot for tests
const mockState: VMStateSnapshot = {
  position: { x: 0, y: 0 },
  rotation: degrees(0),
  scale: positive(1),
  color: { h: 0, s: 100, l: 50 },
  stack: [stackValue(0)],
  instructionPointer: 0,
  stateStack: [],
  instructionCount: 0,
  seed: 12345,
};

const mockToken: CodonToken = {
  text: "AUG" as Codon,
  position: 0,
  line: 1,
};

describe("Type guards", () => {
  describe("isRunning", () => {
    it("returns true for running state", () => {
      const result = running(mockState, mockToken);
      expect(isRunning(result)).toBe(true);
    });

    it("returns false for other states", () => {
      expect(isRunning(halted(mockState, 10, 100))).toBe(false);
      expect(
        isRunning(
          error(mockState, {
            type: "division_by_zero",
            message: "div0",
          }),
        ),
      ).toBe(false);
      expect(isRunning(paused(mockState, { type: "user" }))).toBe(false);
    });
  });

  describe("isHalted", () => {
    it("returns true for halted state", () => {
      const result = halted(mockState, 10, 100);
      expect(isHalted(result)).toBe(true);
    });

    it("returns false for other states", () => {
      expect(isHalted(running(mockState, mockToken))).toBe(false);
      expect(
        isHalted(
          error(mockState, {
            type: "division_by_zero",
            message: "div0",
          }),
        ),
      ).toBe(false);
      expect(isHalted(paused(mockState, { type: "user" }))).toBe(false);
    });
  });

  describe("isError", () => {
    it("returns true for error state", () => {
      const result = error(mockState, {
        type: "division_by_zero",
        message: "div0",
      });
      expect(isError(result)).toBe(true);
    });

    it("returns false for other states", () => {
      expect(isError(running(mockState, mockToken))).toBe(false);
      expect(isError(halted(mockState, 10, 100))).toBe(false);
      expect(isError(paused(mockState, { type: "user" }))).toBe(false);
    });
  });

  describe("isPaused", () => {
    it("returns true for paused state", () => {
      const result = paused(mockState, { type: "user" });
      expect(isPaused(result)).toBe(true);
    });

    it("returns false for other states", () => {
      expect(isPaused(running(mockState, mockToken))).toBe(false);
      expect(isPaused(halted(mockState, 10, 100))).toBe(false);
      expect(
        isPaused(
          error(mockState, {
            type: "division_by_zero",
            message: "div0",
          }),
        ),
      ).toBe(false);
    });
  });
});

describe("Factory functions", () => {
  describe("running", () => {
    it("creates VMRunning result", () => {
      const result = running(mockState, mockToken);
      expect(result.status).toBe("running");
      expect(result.state).toBe(mockState);
      expect(result.currentToken).toBe(mockToken);
    });
  });

  describe("halted", () => {
    it("creates VMHalted result", () => {
      const result = halted(mockState, 42, 123.5);
      expect(result.status).toBe("halted");
      expect(result.state).toBe(mockState);
      expect(result.instructionsExecuted).toBe(42);
      expect(result.executionTimeMs).toBe(123.5);
    });
  });

  describe("error", () => {
    it("creates VMError result without faulting token", () => {
      const err: VMExecutionError = {
        type: "stack_underflow",
        message: "Stack underflow",
        opcode: Opcode.ADD,
        requiredValues: 2,
        availableValues: 1,
      };
      const result = error(mockState, err);
      expect(result.status).toBe("error");
      expect(result.state).toBe(mockState);
      expect(result.error).toBe(err);
      expect(result.faultingToken).toBeUndefined();
    });

    it("creates VMError result with faulting token", () => {
      const err: VMExecutionError = {
        type: "division_by_zero",
        message: "Division by zero",
      };
      const result = error(mockState, err, mockToken);
      expect(result.status).toBe("error");
      expect(result.faultingToken).toBe(mockToken);
    });
  });

  describe("paused", () => {
    it("creates VMPaused with user reason", () => {
      const reason: PauseReason = { type: "user" };
      const result = paused(mockState, reason);
      expect(result.status).toBe("paused");
      expect(result.state).toBe(mockState);
      expect(result.reason).toBe(reason);
    });

    it("creates VMPaused with breakpoint reason", () => {
      const reason: PauseReason = { type: "breakpoint", breakpointId: "bp-1" };
      const result = paused(mockState, reason);
      expect(result.reason.type).toBe("breakpoint");
      if (result.reason.type === "breakpoint") {
        expect(result.reason.breakpointId).toBe("bp-1");
      }
    });

    it("creates VMPaused with step reason", () => {
      const reason: PauseReason = { type: "step", stepType: "into" };
      const result = paused(mockState, reason);
      expect(result.reason.type).toBe("step");
      if (result.reason.type === "step") {
        expect(result.reason.stepType).toBe("into");
      }
    });
  });
});

describe("assertNever", () => {
  it("throws error with JSON stringified value", () => {
    // We need to bypass TS never check for testing
    const invalidValue = { status: "invalid" } as unknown as never;
    expect(() => assertNever(invalidValue)).toThrow(
      'Unexpected value: {"status":"invalid"}',
    );
  });
});

describe("exhaustive switch handling", () => {
  it("handles all states without default", () => {
    const handleResult = (result: VMExecutionResult): string => {
      switch (result.status) {
        case "running":
          return `running at ${result.state.instructionPointer}`;
        case "halted":
          return `halted after ${result.instructionsExecuted}`;
        case "error":
          return `error: ${result.error.message}`;
        case "paused":
          return `paused: ${result.reason.type}`;
      }
    };

    expect(handleResult(running(mockState, mockToken))).toBe("running at 0");
    expect(handleResult(halted(mockState, 42, 100))).toBe("halted after 42");
    expect(
      handleResult(
        error(mockState, { type: "division_by_zero", message: "div0" }),
      ),
    ).toBe("error: div0");
    expect(handleResult(paused(mockState, { type: "user" }))).toBe(
      "paused: user",
    );
  });
});
