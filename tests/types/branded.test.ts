import { describe, expect, it } from "bun:test";

import {
  type ArithmeticResult,
  type StackValue,
  stackAdd,
  stackDiv,
  stackMod,
  stackMul,
  stackSub,
  stackValue,
  stackValueClamped,
  stackValueWrapped,
} from "@/types/branded";

// Helper: Cast branded type to number for comparison in tests
const asNum = (v: StackValue): number => v as number;

describe("StackValue constructors", () => {
  describe("stackValue (strict)", () => {
    it("accepts valid integers", () => {
      expect(asNum(stackValue(0))).toBe(0);
      expect(asNum(stackValue(42))).toBe(42);
      expect(asNum(stackValue(63))).toBe(63);
    });

    it("rounds floats to nearest integer", () => {
      expect(asNum(stackValue(1.4))).toBe(1);
      expect(asNum(stackValue(1.5))).toBe(2);
      expect(asNum(stackValue(1.6))).toBe(2);
      expect(asNum(stackValue(62.4))).toBe(62);
      expect(asNum(stackValue(62.5))).toBe(63); // rounds up, still valid
    });

    it("throws on out-of-range values", () => {
      expect(() => stackValue(-1)).toThrow(RangeError);
      expect(() => stackValue(64)).toThrow(RangeError);
      expect(() => stackValue(100)).toThrow(RangeError);
      expect(() => stackValue(-100)).toThrow(RangeError);
    });

    it("throws when rounded value is out of range", () => {
      expect(() => stackValue(63.6)).toThrow(RangeError); // rounds to 64
      expect(() => stackValue(-0.6)).toThrow(RangeError); // rounds to -1
    });
  });

  describe("stackValueWrapped (wrapping)", () => {
    it("wraps positive overflow", () => {
      expect(asNum(stackValueWrapped(64))).toBe(0);
      expect(asNum(stackValueWrapped(65))).toBe(1);
      expect(asNum(stackValueWrapped(128))).toBe(0);
      expect(asNum(stackValueWrapped(100))).toBe(36); // 100 % 64 = 36
    });

    it("wraps negative underflow", () => {
      expect(asNum(stackValueWrapped(-1))).toBe(63);
      expect(asNum(stackValueWrapped(-2))).toBe(62);
      expect(asNum(stackValueWrapped(-64))).toBe(0);
      expect(asNum(stackValueWrapped(-65))).toBe(63);
    });

    it("rounds floats before wrapping", () => {
      expect(asNum(stackValueWrapped(63.6))).toBe(0); // rounds to 64, wraps to 0
      expect(asNum(stackValueWrapped(-0.6))).toBe(63); // rounds to -1, wraps to 63
      expect(asNum(stackValueWrapped(64.4))).toBe(0); // rounds to 64, wraps to 0
    });

    it("handles valid range without modification", () => {
      expect(asNum(stackValueWrapped(0))).toBe(0);
      expect(asNum(stackValueWrapped(42))).toBe(42);
      expect(asNum(stackValueWrapped(63))).toBe(63);
    });
  });

  describe("stackValueClamped (clamping)", () => {
    it("clamps high values to 63", () => {
      expect(asNum(stackValueClamped(64))).toBe(63);
      expect(asNum(stackValueClamped(100))).toBe(63);
      expect(asNum(stackValueClamped(1000))).toBe(63);
    });

    it("clamps low values to 0", () => {
      expect(asNum(stackValueClamped(-1))).toBe(0);
      expect(asNum(stackValueClamped(-100))).toBe(0);
      expect(asNum(stackValueClamped(-1000))).toBe(0);
    });

    it("rounds floats before clamping", () => {
      expect(asNum(stackValueClamped(63.6))).toBe(63); // rounds to 64, clamps to 63
      expect(asNum(stackValueClamped(-0.6))).toBe(0); // rounds to -1, clamps to 0
    });

    it("passes through valid values unchanged", () => {
      expect(asNum(stackValueClamped(0))).toBe(0);
      expect(asNum(stackValueClamped(42))).toBe(42);
      expect(asNum(stackValueClamped(63))).toBe(63);
    });
  });
});

describe("Stack arithmetic helpers", () => {
  // Helper to create stack values for tests
  const sv = (n: number): StackValue => stackValue(n);

  describe("stackAdd", () => {
    it("adds within range", () => {
      expect(asNum(stackAdd(sv(10), sv(20)))).toBe(30);
      expect(asNum(stackAdd(sv(0), sv(0)))).toBe(0);
    });

    it("wraps on overflow", () => {
      expect(asNum(stackAdd(sv(60), sv(10)))).toBe(6); // 70 % 64 = 6
      expect(asNum(stackAdd(sv(63), sv(63)))).toBe(62); // 126 % 64 = 62
    });
  });

  describe("stackSub", () => {
    it("subtracts within range", () => {
      expect(asNum(stackSub(sv(30), sv(10)))).toBe(20);
      expect(asNum(stackSub(sv(10), sv(10)))).toBe(0);
    });

    it("wraps on underflow", () => {
      expect(asNum(stackSub(sv(5), sv(10)))).toBe(59); // -5 + 64 = 59
      expect(asNum(stackSub(sv(0), sv(1)))).toBe(63);
    });
  });

  describe("stackMul", () => {
    it("multiplies within range", () => {
      expect(asNum(stackMul(sv(3), sv(4)))).toBe(12);
      expect(asNum(stackMul(sv(8), sv(7)))).toBe(56);
    });

    it("wraps on overflow", () => {
      expect(asNum(stackMul(sv(10), sv(10)))).toBe(36); // 100 % 64 = 36
      expect(asNum(stackMul(sv(8), sv(8)))).toBe(0); // 64 % 64 = 0
    });
  });

  describe("stackDiv", () => {
    it("divides and floors result", () => {
      const result1 = stackDiv(sv(10), sv(3));
      expect(result1.ok).toBe(true);
      if (result1.ok) expect(asNum(result1.value)).toBe(3);

      const result2 = stackDiv(sv(63), sv(7));
      expect(result2.ok).toBe(true);
      if (result2.ok) expect(asNum(result2.value)).toBe(9);
    });

    it("returns error on division by zero", () => {
      const result = stackDiv(sv(10), sv(0));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe("DIVISION_BY_ZERO");
    });

    it("handles zero dividend", () => {
      const result = stackDiv(sv(0), sv(5));
      expect(result.ok).toBe(true);
      if (result.ok) expect(asNum(result.value)).toBe(0);
    });
  });

  describe("stackMod", () => {
    it("computes modulo correctly", () => {
      const result1 = stackMod(sv(10), sv(3));
      expect(result1.ok).toBe(true);
      if (result1.ok) expect(asNum(result1.value)).toBe(1);

      const result2 = stackMod(sv(15), sv(4));
      expect(result2.ok).toBe(true);
      if (result2.ok) expect(asNum(result2.value)).toBe(3);
    });

    it("returns error on modulo by zero", () => {
      const result = stackMod(sv(10), sv(0));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toBe("MODULO_BY_ZERO");
    });

    it("handles zero dividend", () => {
      const result = stackMod(sv(0), sv(5));
      expect(result.ok).toBe(true);
      if (result.ok) expect(asNum(result.value)).toBe(0);
    });
  });
});

describe("ArithmeticResult type safety", () => {
  it("enforces ok check before accessing value", () => {
    const result: ArithmeticResult = stackDiv(stackValue(10), stackValue(2));

    // TypeScript enforces this pattern - can't access value without checking ok
    if (result.ok) {
      // Type narrowed to { ok: true; value: StackValue }
      const value: StackValue = result.value;
      expect(asNum(value)).toBe(5);
    } else {
      // Type narrowed to { ok: false; error: ArithmeticError }
      expect(result.error).toBeDefined();
    }
  });
});
