import { describe, expect, it } from "bun:test";

import {
  isArithmeticOpcode,
  isControlOpcode,
  isDrawingOpcode,
  isStackOpcode,
  isTransformOpcode,
  Opcode,
} from "@/types/vm";

describe("Opcode type guards", () => {
  describe("isControlOpcode", () => {
    it("returns true for START", () => {
      expect(isControlOpcode(Opcode.START)).toBe(true);
    });

    it("returns true for STOP", () => {
      expect(isControlOpcode(Opcode.STOP)).toBe(true);
    });

    it("returns false for non-control opcodes", () => {
      expect(isControlOpcode(Opcode.CIRCLE)).toBe(false);
      expect(isControlOpcode(Opcode.ADD)).toBe(false);
      expect(isControlOpcode(Opcode.PUSH)).toBe(false);
    });
  });

  describe("isDrawingOpcode", () => {
    it("returns true for drawing opcodes", () => {
      expect(isDrawingOpcode(Opcode.CIRCLE)).toBe(true);
      expect(isDrawingOpcode(Opcode.RECT)).toBe(true);
      expect(isDrawingOpcode(Opcode.LINE)).toBe(true);
      expect(isDrawingOpcode(Opcode.TRIANGLE)).toBe(true);
      expect(isDrawingOpcode(Opcode.ELLIPSE)).toBe(true);
    });

    it("returns false for non-drawing opcodes", () => {
      expect(isDrawingOpcode(Opcode.START)).toBe(false);
      expect(isDrawingOpcode(Opcode.ROTATE)).toBe(false);
      expect(isDrawingOpcode(Opcode.ADD)).toBe(false);
    });
  });

  describe("isTransformOpcode", () => {
    it("returns true for transform opcodes", () => {
      expect(isTransformOpcode(Opcode.TRANSLATE)).toBe(true);
      expect(isTransformOpcode(Opcode.ROTATE)).toBe(true);
      expect(isTransformOpcode(Opcode.SCALE)).toBe(true);
      expect(isTransformOpcode(Opcode.COLOR)).toBe(true);
    });

    it("returns false for non-transform opcodes", () => {
      expect(isTransformOpcode(Opcode.CIRCLE)).toBe(false);
      expect(isTransformOpcode(Opcode.START)).toBe(false);
      expect(isTransformOpcode(Opcode.ADD)).toBe(false);
    });
  });

  describe("isStackOpcode", () => {
    it("returns true for stack opcodes", () => {
      expect(isStackOpcode(Opcode.PUSH)).toBe(true);
      expect(isStackOpcode(Opcode.DUP)).toBe(true);
      expect(isStackOpcode(Opcode.POP)).toBe(true);
      expect(isStackOpcode(Opcode.SWAP)).toBe(true);
    });

    it("returns false for non-stack opcodes", () => {
      expect(isStackOpcode(Opcode.CIRCLE)).toBe(false);
      expect(isStackOpcode(Opcode.ADD)).toBe(false);
      expect(isStackOpcode(Opcode.START)).toBe(false);
    });
  });

  describe("isArithmeticOpcode", () => {
    it("returns true for arithmetic opcodes", () => {
      expect(isArithmeticOpcode(Opcode.ADD)).toBe(true);
      expect(isArithmeticOpcode(Opcode.SUB)).toBe(true);
      expect(isArithmeticOpcode(Opcode.MUL)).toBe(true);
      expect(isArithmeticOpcode(Opcode.DIV)).toBe(true);
    });

    it("returns false for non-arithmetic opcodes", () => {
      expect(isArithmeticOpcode(Opcode.CIRCLE)).toBe(false);
      expect(isArithmeticOpcode(Opcode.PUSH)).toBe(false);
      expect(isArithmeticOpcode(Opcode.START)).toBe(false);
    });
  });
});
