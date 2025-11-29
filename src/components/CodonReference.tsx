/**
 * CodonReference - Interactive codon reference panel
 *
 * Shows all codons grouped by opcode with descriptions.
 * Supports search, filtering by category, and click-to-insert.
 */

import { useCallback, useMemo, useState } from "react";
import { CODON_MAP, Opcode } from "@/types";

/** Opcode categories for filtering */
type OpcodeCategory =
  | "all"
  | "control"
  | "drawing"
  | "transform"
  | "stack"
  | "math"
  | "comparison";

interface OpcodeInfo {
  name: string;
  description: string;
  category: OpcodeCategory;
  codons: string[];
}

/** Opcode metadata for display */
const OPCODE_INFO: Record<Opcode, Omit<OpcodeInfo, "codons">> = {
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

const CATEGORIES: { value: OpcodeCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "control", label: "Control" },
  { value: "drawing", label: "Drawing" },
  { value: "transform", label: "Transform" },
  { value: "stack", label: "Stack" },
  { value: "math", label: "Math" },
  { value: "comparison", label: "Compare" },
];

const CATEGORY_COLORS: Record<OpcodeCategory, string> = {
  all: "bg-text-muted",
  control: "bg-danger",
  drawing: "bg-primary",
  transform: "bg-secondary",
  stack: "bg-warning",
  math: "bg-info",
  comparison: "bg-success",
};

interface CodonReferenceProps {
  /** Callback when a codon is clicked */
  onInsert?: (codon: string) => void;
  /** Whether panel is collapsed */
  collapsed?: boolean;
  /** Toggle collapse callback */
  onToggleCollapse?: () => void;
}

export function CodonReference({
  onInsert,
  collapsed = false,
  onToggleCollapse,
}: CodonReferenceProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<OpcodeCategory>("all");

  // Build opcode info with codons
  const opcodeData = useMemo(() => {
    const data: OpcodeInfo[] = [];

    // Group codons by opcode
    const codonsByOpcode = new Map<Opcode, string[]>();
    for (const [codon, opcode] of Object.entries(CODON_MAP)) {
      const existing = codonsByOpcode.get(opcode);
      if (existing) {
        existing.push(codon);
      } else {
        codonsByOpcode.set(opcode, [codon]);
      }
    }

    // Build info array
    for (const [opcode, info] of Object.entries(OPCODE_INFO)) {
      const opcodeNum = Number(opcode) as Opcode;
      data.push({
        ...info,
        codons: codonsByOpcode.get(opcodeNum) ?? [],
      });
    }

    return data;
  }, []);

  // Filter opcodes
  const filteredOpcodes = useMemo(() => {
    return opcodeData.filter((info) => {
      // Category filter
      if (category !== "all" && info.category !== category) {
        return false;
      }

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesName = info.name.toLowerCase().includes(searchLower);
        const matchesDesc = info.description
          .toLowerCase()
          .includes(searchLower);
        const matchesCodon = info.codons.some((c) =>
          c.toLowerCase().includes(searchLower),
        );
        if (!matchesName && !matchesDesc && !matchesCodon) {
          return false;
        }
      }

      return true;
    });
  }, [opcodeData, category, search]);

  const handleCodonClick = useCallback(
    (codon: string) => {
      onInsert?.(codon);
    },
    [onInsert],
  );

  if (collapsed) {
    return (
      <button
        className="flex h-full w-10 items-center justify-center border-l border-border bg-bg-light hover:bg-border"
        onClick={onToggleCollapse}
        title="Show codon reference"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5l7 7-7 7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="flex w-72 flex-col border-l border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <h3 className="text-sm font-semibold text-text">Codon Reference</h3>
        {onToggleCollapse && (
          <button
            className="rounded p-1 hover:bg-bg-light"
            onClick={onToggleCollapse}
            title="Hide reference"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="border-b border-border p-2">
        <input
          className="w-full rounded-md border border-border px-2 py-1 text-sm focus:border-primary focus:outline-none"
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search codons..."
          type="search"
          value={search}
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 border-b border-border p-2">
        {CATEGORIES.map((cat) => (
          <button
            className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
              category === cat.value
                ? `${CATEGORY_COLORS[cat.value]} text-white`
                : "bg-bg-light text-text-muted hover:bg-border"
            }`}
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            type="button"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Opcode list */}
      <div className="flex-1 overflow-y-auto">
        {filteredOpcodes.map((info) => (
          <div className="border-b border-border p-3" key={info.name}>
            <div className="mb-1 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${CATEGORY_COLORS[info.category]}`}
              />
              <span className="font-mono text-sm font-semibold text-text">
                {info.name}
              </span>
            </div>
            <p className="mb-2 text-xs text-text-muted">{info.description}</p>
            <div className="flex flex-wrap gap-1">
              {info.codons.map((codon) => (
                <button
                  className="rounded bg-dark-bg px-1.5 py-0.5 font-mono text-xs text-dark-text transition-colors hover:bg-primary hover:text-white"
                  key={codon}
                  onClick={() => handleCodonClick(codon)}
                  title={`Click to insert ${codon}`}
                  type="button"
                >
                  {codon}
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredOpcodes.length === 0 && (
          <div className="p-4 text-center text-sm text-text-muted">
            No matching codons found
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="border-t border-border px-3 py-2 text-xs text-text-muted">
        Click a codon to insert it at cursor
      </div>
    </div>
  );
}

export default CodonReference;
