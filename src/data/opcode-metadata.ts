/**
 * Opcode Metadata - Static configuration for opcode display
 *
 * Contains opcode descriptions, categories, and UI constants
 * used by the CodonReference component.
 */

import { Opcode } from "@/types";

/** Opcode categories for filtering */
export type OpcodeCategory =
  | "all"
  | "control"
  | "drawing"
  | "transform"
  | "stack"
  | "math"
  | "comparison";

/** Opcode display information */
export interface OpcodeInfo {
  name: string;
  description: string;
  category: OpcodeCategory;
  codons: string[];
}

/** Opcode metadata for display (without codons - those are derived from CODON_MAP) */
export const OPCODE_INFO: Record<Opcode, Omit<OpcodeInfo, "codons">> = {
  [Opcode.START]: {
    name: "START",
    description: "Begin execution (ATG only)",
    category: "control",
  },
  [Opcode.STOP]: {
    name: "STOP",
    description: "End execution (TAA, TAG, TGA)",
    category: "control",
  },
  [Opcode.CIRCLE]: {
    name: "CIRCLE",
    description: "Draw circle with radius from stack",
    category: "drawing",
  },
  [Opcode.RECT]: {
    name: "RECT",
    description: "Draw rectangle (width, height from stack)",
    category: "drawing",
  },
  [Opcode.LINE]: {
    name: "LINE",
    description: "Draw line to relative position",
    category: "drawing",
  },
  [Opcode.TRIANGLE]: {
    name: "TRIANGLE",
    description: "Draw equilateral triangle",
    category: "drawing",
  },
  [Opcode.ELLIPSE]: {
    name: "ELLIPSE",
    description: "Draw ellipse (rx, ry from stack)",
    category: "drawing",
  },
  [Opcode.TRANSLATE]: {
    name: "TRANSLATE",
    description: "Move position (dx, dy from stack)",
    category: "transform",
  },
  [Opcode.ROTATE]: {
    name: "ROTATE",
    description: "Rotate by angle from stack",
    category: "transform",
  },
  [Opcode.SCALE]: {
    name: "SCALE",
    description: "Scale by factor from stack",
    category: "transform",
  },
  [Opcode.COLOR]: {
    name: "COLOR",
    description: "Set HSL color (h, s, l from stack)",
    category: "transform",
  },
  [Opcode.PUSH]: {
    name: "PUSH",
    description: "Push literal value (0-63) to stack",
    category: "stack",
  },
  [Opcode.DUP]: {
    name: "DUP",
    description: "Duplicate top of stack",
    category: "stack",
  },
  [Opcode.POP]: {
    name: "POP",
    description: "Remove top of stack",
    category: "stack",
  },
  [Opcode.SWAP]: {
    name: "SWAP",
    description: "Swap top two stack values",
    category: "stack",
  },
  [Opcode.NOP]: {
    name: "NOP",
    description: "No operation (silent mutation target)",
    category: "control",
  },
  [Opcode.SAVE_STATE]: {
    name: "SAVE",
    description: "Save transform state to stack",
    category: "transform",
  },
  [Opcode.RESTORE_STATE]: {
    name: "RESTORE",
    description: "Restore transform state from stack",
    category: "transform",
  },
  [Opcode.ADD]: {
    name: "ADD",
    description: "Add top two stack values",
    category: "math",
  },
  [Opcode.SUB]: {
    name: "SUB",
    description: "Subtract top from second",
    category: "math",
  },
  [Opcode.MUL]: {
    name: "MUL",
    description: "Multiply top two stack values",
    category: "math",
  },
  [Opcode.DIV]: {
    name: "DIV",
    description: "Divide second by top",
    category: "math",
  },
  [Opcode.LOOP]: {
    name: "LOOP",
    description: "Repeat instructions (count, n from stack)",
    category: "control",
  },
  [Opcode.EQ]: {
    name: "EQ",
    description: "Push 1 if equal, 0 otherwise",
    category: "comparison",
  },
  [Opcode.LT]: {
    name: "LT",
    description: "Push 1 if less than, 0 otherwise",
    category: "comparison",
  },
};

/** Category filter options */
export const CATEGORIES: { value: OpcodeCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "control", label: "Control" },
  { value: "drawing", label: "Drawing" },
  { value: "transform", label: "Transform" },
  { value: "stack", label: "Stack" },
  { value: "math", label: "Math" },
  { value: "comparison", label: "Compare" },
];

/** Category background colors for UI */
export const CATEGORY_COLORS: Record<OpcodeCategory, string> = {
  all: "bg-text-muted",
  control: "bg-danger",
  drawing: "bg-primary",
  transform: "bg-secondary",
  stack: "bg-warning",
  math: "bg-info",
  comparison: "bg-success",
};
