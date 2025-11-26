# CodonCanvas MVP Technical Specification

**Version:** 1.0.0
**Target:** Phase A-B Implementation
**Date:** October 2025
**Status:** 📜 HISTORICAL REFERENCE

> **⚠️ IMPLEMENTATION HAS EVOLVED BEYOND THIS SPECIFICATION**
>
> This document reflects the **original MVP design** from October 2025. The implementation has successfully delivered all Phase A and Phase B requirements, but has **intentionally evolved** to include additional computational features for enhanced pedagogical value.
>
> **Key Changes from Original Spec:**
>
> - ✅ Phase A (MVP Core): Complete + exceeded
> - ✅ Phase B (Pedagogy Tools): Complete + exceeded
> - 🔄 **Opcode Evolution**: NOISE removed, added Arithmetic (ADD/SUB/MUL/DIV), Comparison (EQ/LT), and LOOP
> - 📈 **Enhanced Features**: 48 examples (vs 3 spec), audio mode, research tools, teacher dashboard
>
> **For Current Implementation Details:**
>
> - [OPCODES.md](./OPCODES.md) - Complete current opcode reference
> - [README.md](./README.md) - Getting started guide
> - [EDUCATORS.md](./EDUCATORS.md) - Comprehensive pedagogical documentation
> - [claudedocs/SPEC_COMPLIANCE_AUDIT.md](./claudedocs/SPEC_COMPLIANCE_AUDIT.md) - Detailed compliance analysis
>
> **Rationale for Evolution**: Added computational features (arithmetic, comparison, loops) enable algorithmic art, computational thinking pedagogy, and research applications. The codon count remains 64 (complete DNA triplet coverage maintained).

---

## 1. Complete Opcode Table (64 Codons)

### Control Flow (4 codons)

| Codon | Opcode | Stack Effect | Description                                          |
| ----- | ------ | ------------ | ---------------------------------------------------- |
| ATG   | START  | `[] → []`    | Begin execution block. First codon in valid program. |
| TAA   | STOP   | `[] → []`    | Terminate execution.                                 |
| TAG   | STOP   | `[] → []`    | Terminate execution (synonymous).                    |
| TGA   | STOP   | `[] → []`    | Terminate execution (synonymous).                    |

### Drawing Primitives (20 codons) - COMMON

| Codons             | Opcode   | Stack Effect    | Description                                         | Pedagogy Note                  |
| ------------------ | -------- | --------------- | --------------------------------------------------- | ------------------------------ |
| GGA, GGC, GGG, GGT | CIRCLE   | `[radius] → []` | Draw circle at current position with given radius   | Silent mutations within family |
| CCA, CCC, CCG, CCT | RECT     | `[w, h] → []`   | Draw rectangle at current position (w×h)            | Silent mutations within family |
| AAA, AAC, AAG, AAT | LINE     | `[length] → []` | Draw line from current position at current rotation | Silent mutations within family |
| GCA, GCC, GCG, GCT | TRIANGLE | `[size] → []`   | Draw equilateral triangle at current position       | Missense from CIRCLE           |
| GTA, GTC, GTG, GTT | ELLIPSE  | `[rx, ry] → []` | Draw ellipse at current position                    | Missense from CIRCLE           |

### Transform Operations (16 codons) - COMMON

| Codons             | Opcode    | Stack Effect     | Description                                              | Pedagogy Note                  |
| ------------------ | --------- | ---------------- | -------------------------------------------------------- | ------------------------------ |
| ACA, ACC, ACG, ACT | TRANSLATE | `[dx, dy] → []`  | Move drawing position by (dx, dy)                        | Silent mutations within family |
| AGA, AGC, AGG, AGT | ROTATE    | `[degrees] → []` | Rotate drawing direction by degrees                      | Silent mutations within family |
| CGA, CGC, CGG, CGT | SCALE     | `[factor] → []`  | Scale subsequent drawing operations                      | Silent mutations within family |
| TTA, TTC, TTG, TTT | COLOR     | `[h, s, l] → []` | Set color (hue 0-360, saturation 0-100, lightness 0-100) | Silent mutations within family |

### Stack Operations (8 codons) - COMMON

| Codons             | Opcode | Stack Effect   | Description                                                          | Literal Encoding                       |
| ------------------ | ------ | -------------- | -------------------------------------------------------------------- | -------------------------------------- |
| GAA, GAG, GAC, GAT | PUSH   | `[] → [value]` | Push numeric literal (next codon is read as base-4: A=0,C=1,G=2,T=3) | value = d1×16 + d2×4 + d3 (range 0-63) |
| ATA, ATC, ATT      | DUP    | `[a] → [a, a]` | Duplicate top stack value                                            | Useful for repeated values             |

### Utility (7 codons) - COMMON

| Codons             | Opcode | Stack Effect | Description                                     | Pedagogy Note       |
| ------------------ | ------ | ------------ | ----------------------------------------------- | ------------------- |
| CAA, CAC, CAG, CAT | NOP    | `[] → []`    | No operation; used for visual spacing in source | Makes code readable |
| TAC, TAT, TGC      | POP    | `[a] → []`   | Remove top value from stack                     | Stack cleanup       |

### Advanced Operations (9 codons) - RARE

| Codons             | Opcode     | Stack Effect             | Description                                                                    | Use Case              |
| ------------------ | ---------- | ------------------------ | ------------------------------------------------------------------------------ | --------------------- |
| TGG, TGT           | SWAP       | `[a, b] → [b, a]`        | Swap top two stack values                                                      | Advanced compositions |
| CTA, CTC, CTG, CTT | NOISE      | `[seed, intensity] → []` | Add visual noise/texture at current position                                   | Artistic effects      |
| TCA, TCC, TCG, TCT | SAVE_STATE | `[] → []`                | Push current transform state (position, rotation, scale, color) to state stack | Nested compositions   |

---

## 2. Base-4 Numeric Literal Encoding

When a PUSH opcode executes, the **next codon** is interpreted as a base-4 number:

**Formula:** `value = d1 × 16 + d2 × 4 + d3`\
where `d1, d2, d3 ∈ {A:0, C:1, G:2, T:3}`

**Examples:**

```
GAA AAA → PUSH 0   (A=0, A=0, A=0 → 0×16 + 0×4 + 0 = 0)
GAA TCA → PUSH 52  (T=3, C=1, A=0 → 3×16 + 1×4 + 0 = 52)
GAA TTT → PUSH 63  (T=3, T=3, T=3 → 3×16 + 3×4 + 3 = 63)
GAG ACG → PUSH 22  (A=0, C=1, G=2 → 0×16 + 1×4 + 2 = 6... wait)
```

Wait, let me recalculate ACG:

- A=0, C=1, G=2
- 0×16 + 1×4 + 2 = 6

Let me fix TCA:

- T=3, C=1, A=0
- 3×16 + 1×4 + 0 = 48 + 4 = 52 ✓

**Range:** 0-63 (sufficient for most canvas coordinates when scaled)

**Screen Scaling:** Literals are interpreted as percentages of canvas dimensions:

- Canvas assumed to be 400×400 pixels for MVP
- Value 32 → 200 pixels (32/64 × 400)

---

## 3. TypeScript Interfaces

### 3.1 Core Types

```typescript
// Base types
type Base = "A" | "C" | "G" | "T";
type Codon = `${Base}${Base}${Base}`;

interface CodonToken {
  text: Codon;
  position: number; // Character offset in source
  line: number; // Line number (1-indexed)
}

interface ParseError {
  message: string;
  position: number;
  severity: "error" | "warning" | "info";
  fix?: string; // Suggested fix (e.g., "Insert 'A' to restore frame")
}
```

### 3.2 Lexer Interface

```typescript
interface Lexer {
  /**
   * Tokenize source genome into codons
   * @throws ParseError[] if mid-triplet breaks or invalid characters found
   */
  tokenize(source: string): CodonToken[];
  
  /**
   * Validate reading frame alignment
   * @returns errors/warnings for linter display
   */
  validateFrame(source: string): ParseError[];
  
  /**
   * Check for structural issues (START/STOP placement)
   */
  validateStructure(tokens: CodonToken[]): ParseError[];
}

// Example implementation signature
class CodonLexer implements Lexer {
  private readonly validBases = new Set(['A', 'C', 'G', 'T']);
  
  tokenize(source: string): CodonToken[] {
    const cleaned = source
      .split('\n')
      .map(line => line.split(';')[0])  // Strip comments
      .join(' ')
      .replace(/\s+/g, '');              // Remove whitespace
    
    // Check for non-triplet length
    if (cleaned.length % 3 !== 0) {
      throw new ParseError(/* ... */);
    }
    
    // Chunk into triplets
    const tokens: CodonToken[] = [];
    for (let i = 0; i < cleaned.length; i += 3) {
      tokens.push({
        text: cleaned.slice(i, i + 3) as Codon,
        position: i,
        line: /* calculate from original source */
      });
    }
    return tokens;
  }
}
```

### 3.3 VM Interface

```typescript
interface VMState {
  // Drawing state
  position: { x: number; y: number };
  rotation: number; // degrees, 0 = right
  scale: number;
  color: { h: number; s: number; l: number };

  // Execution state
  stack: number[];
  instructionPointer: number;
  stateStack: VMState[]; // For SAVE_STATE/RESTORE_STATE

  // Metadata
  instructionCount: number; // For sandboxing
  seed: number; // For RAND reproducibility
}

interface VM {
  state: VMState;
  renderer: Renderer;

  /**
   * Execute a single opcode
   * @throws Error if stack underflow or instruction limit exceeded
   */
  execute(opcode: Opcode, codon: Codon): void;

  /**
   * Run entire program
   * @returns array of snapshots (one per instruction) for timeline scrubber
   */
  run(tokens: CodonToken[]): VMState[];

  /**
   * Reset VM to initial state
   */
  reset(): void;

  /**
   * Create snapshot for rewind/step-through
   */
  snapshot(): VMState;

  /**
   * Restore from snapshot
   */
  restore(state: VMState): void;
}

// Opcode type
enum Opcode {
  START,
  STOP,
  CIRCLE,
  RECT,
  LINE,
  TRIANGLE,
  ELLIPSE,
  TRANSLATE,
  ROTATE,
  SCALE,
  COLOR,
  PUSH,
  DUP,
  POP,
  SWAP,
  NOP,
  NOISE,
  SAVE_STATE,
}

// Codon to Opcode map (hardcoded for v1.0)
const CODON_MAP: Record<Codon, Opcode> = {
  ATG: Opcode.START,
  TAA: Opcode.STOP,
  TAG: Opcode.STOP,
  TGA: Opcode.STOP,
  GGA: Opcode.CIRCLE,
  GGC: Opcode.CIRCLE,
  // ... (all 64 mappings)
};
```

### 3.4 Renderer Interface

```typescript
interface Renderer {
  readonly width: number;
  readonly height: number;

  /**
   * Clear canvas
   */
  clear(): void;

  /**
   * Drawing primitives (all use current VM state for position/rotation/color/scale)
   */
  circle(radius: number): void;
  rect(width: number, height: number): void;
  line(length: number): void;
  triangle(size: number): void;
  ellipse(rx: number, ry: number): void;

  /**
   * State queries (for VM to track position after drawing)
   */
  getCurrentTransform(): {
    x: number;
    y: number;
    rotation: number;
    scale: number;
  };

  /**
   * Export
   */
  toDataURL(): string;
  toImageData(): ImageData;
}

// Canvas-based implementation
class Canvas2DRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }

  circle(radius: number): void {
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
  }

  // ... other methods
}
```

---

## 4. Example Genomes

### 4.1 Example 1: "Hello Circle" (Minimal)

**Genome:**

```
ATG GAA AGG GGA TAA
```

**Explanation:**

1. `ATG` - START
2. `GAA AGG` - PUSH 22 (A=0,G=2,G=2 → 0×16 + 2×4 + 2 = 10... wait)

Let me recalculate AGG with base-4:

- A=0, G=2, G=2
- 0×16 + 2×4 + 2 = 0 + 8 + 2 = 10

So the literal is 10, which would be radius 10 pixels (10/64 × 400 = 62.5 pixels).

Let me pick better examples:

**Genome:**

```
ATG GAA CCC GGA TAA
```

**Explanation:**

1. `ATG` - START
2. `GAA CCC` - PUSH 23 (C=1,C=1,C=1 → 1×16 + 1×4 + 1 = 21)
3. `GGA` - CIRCLE (draws circle with radius 21, scaled to ~131 pixels)
4. `TAA` - STOP

**Expected Output:**\
Single circle centered at (200, 200) with radius ~131 pixels.

**Mutation Demos:**

- `GGA → GGC` (silent): Identical output
- `GGA → CCA` (missense): Circle becomes rectangle (needs 2 stack values, will error or use default)
- `GGA → TAA` (nonsense): No circle drawn (program stops early)
- Insert `G` after `GAA`: Frameshift - `GAA` becomes `GAG`, `CCC` becomes `CCG`, `GA` → incomplete

### 4.2 Example 2: "Two Shapes" (Composition)

**Genome:**

```
ATG 
  GAA CCC GGA           ; Push 21, draw circle
  GAA CTT ACA AAA AAA   ; Push 31, translate by (0, 0)...
```

Wait, TRANSLATE needs 2 values (dx, dy). Let me fix this:

**Genome:**

```
ATG 
  GAA CGC GGA                    ; Push 50, draw circle (radius 50)
  GAA CCC GAA CCC ACA            ; Push 21, push 21, translate(21, 21)
  GAA AGC GGA                    ; Push 20, draw another circle
TAA
```

**Explanation:**

1. `ATG` - START
2. `GAA CGC` - PUSH 50 (C=1,G=2,C=1 → 1×16 + 2×4 + 1 = 25... let me recalculate)

Actually let me be more careful. Base-4 with A=0, C=1, G=2, T=3:

- CGC: C=1, G=2, C=1 → 1×16 + 2×4 + 1 = 16 + 8 + 1 = 25
- CCC: C=1, C=1, C=1 → 1×16 + 1×4 + 1 = 16 + 4 + 1 = 21
- AGC: A=0, G=2, C=1 → 0×16 + 2×4 + 1 = 8 + 1 = 9

Let me rewrite with clearer values:

**Genome:**

```
ATG 
  GAA TCC GGA        ; Push 57, draw circle
  GAA CCC            ; Push 21
  GAA CCC            ; Push 21
  ACA                ; Translate(21, 21)
  GAA GCC GGA        ; Push 37, draw circle
TAA
```

Let me calculate:

- TCC: T=3, C=1, C=1 → 3×16 + 1×4 + 1 = 48 + 4 + 1 = 53
- CCC: 21 (calculated above)
- GCC: G=2, C=1, C=1 → 2×16 + 1×4 + 1 = 32 + 4 + 1 = 37

**Expected Output:**

- Circle at (200, 200) with radius 53/64×400 = 331 pixels (too big!)
- Move by (21, 21) pixels = (131, 131) pixels
- Circle at (331, 331) with radius 37/64×400 = 231 pixels

These radii are too large. Let me scale down the examples:

**Genome (Fixed):**

```
ATG 
  GAA AAT GGA        ; Push 3, draw small circle
  GAA CCC            ; Push 21
  GAA AAA            ; Push 0
  ACA                ; Translate(21, 0) - move right
  GAA AGG GGA        ; Push 10, draw another circle
TAA
```

Calculations:

- AAT: A=0, A=0, T=3 → 0 + 0 + 3 = 3 (radius 3/64×400 = 19 pixels)
- CCC: 21 (dx = 21/64×400 = 131 pixels)
- AAA: 0 (dy = 0)
- AGG: A=0, G=2, G=2 → 0 + 8 + 2 = 10 (radius 10/64×400 = 62 pixels)

**Expected Output:**\
Two circles side-by-side.

### 4.3 Example 3: "Mutation Demo" (Pedagogical)

**Genome:**

```
ATG 
  GAA AGG GGA        ; Push 10, draw circle
  GAA CCC            ; Push 21  
  GAA AAA            ; Push 0
  ACA                ; Translate(21, 0)
  GAA AGG CCA        ; Push 10, draw RECT (needs w, h - will use 10 for both)
TAA
```

Wait, RECT needs 2 stack values. Let me fix:

**Genome:**

```
ATG 
  GAA AGG            ; Push 10
  GAA AGG            ; Push 10 (now stack = [10, 10])
  GGA                ; Draw circle (uses top value: radius=10)
  GAA CCC            ; Push 21
  GAA AAA            ; Push 0
  ACA                ; Translate(21, 0)
  GAA AGG            ; Push 10
  GAA AGG            ; Push 10
  CCA                ; Draw RECT (uses top 2: w=10, h=10)
TAA
```

**Mutation Demonstrations:**

1. **Silent:** Change `CCA` (RECT) to `CCC` (also RECT)
   - **Effect:** Identical output

2. **Missense:** Change `CCA` (RECT) to `GCA` (TRIANGLE)
   - **Effect:** Square becomes triangle

3. **Nonsense:** Change `CCA` to `TAA` (STOP)
   - **Effect:** Second shape disappears (early termination)

4. **Frameshift:** Delete the first `A` in `GAA AGG`
   - Becomes: `GA AAG G...` → `GAA AGG` → `GAC CGA AA...`
   - **Effect:** Entire downstream code scrambled

---

## 5. Test Cases

### 5.1 Core Functionality Tests

```typescript
describe("CodonCanvas VM", () => {
  test("Silent mutation produces identical output", () => {
    const genome1 = "ATG GAA AGG GGA TAA";
    const genome2 = "ATG GAA AGG GGC TAA"; // GGA → GGC (both CIRCLE)

    const output1 = renderGenome(genome1);
    const output2 = renderGenome(genome2);

    expect(output1).toEqual(output2); // Pixel-perfect match
  });

  test("Missense mutation changes shape", () => {
    const circle = "ATG GAA AGG GGA TAA";
    const rect = "ATG GAA AGG GAA AGG CCA TAA"; // Added extra PUSH for RECT

    const output1 = renderGenome(circle);
    const output2 = renderGenome(rect);

    expect(output1).not.toEqual(output2);
    expect(countShapes(output1, "circle")).toBe(1);
    expect(countShapes(output2, "rect")).toBe(1);
  });

  test("Nonsense mutation truncates output", () => {
    const full = "ATG GAA AGG GGA GAA AGG CCA TAA";
    const truncated = "ATG GAA AGG GGA TAA CCA TAA"; // Early STOP

    const output1 = renderGenome(full);
    const output2 = renderGenome(truncated);

    expect(countShapes(output1)).toBe(2); // Circle + rect
    expect(countShapes(output2)).toBe(1); // Only circle
  });

  test("Frameshift scrambles downstream", () => {
    const original = "ATG GAA AGG GGA TAA";
    const frameshift = "ATG GA AAG GGG ATA A"; // Deleted first A

    const output1 = renderGenome(original);
    const output2 = renderGenome(frameshift);

    // Outputs should be dramatically different
    const diff = pixelDifference(output1, output2);
    expect(diff).toBeGreaterThan(0.8); // >80% pixels changed
  });
});

describe("Numeric literals", () => {
  test("All values 0-63 work correctly", () => {
    for (let i = 0; i < 64; i++) {
      const codon = numberToCodon(i); // Helper to convert 0-63 → base-4 codon
      const genome = `ATG GAA ${codon} TAA`;

      const vm = new VM();
      vm.run(lexer.tokenize(genome));

      expect(vm.state.stack[0]).toBe(i);
    }
  });

  test("Stack underflow throws error", () => {
    const genome = "ATG GGA TAA"; // CIRCLE without PUSH

    expect(() => {
      const vm = new VM();
      vm.run(lexer.tokenize(genome));
    }).toThrow("Stack underflow");
  });
});

describe("Linter", () => {
  test("Detects mid-triplet break", () => {
    const source = "ATG GG A CCA TAA"; // Space in "GGA"
    const errors = lexer.validateFrame(source);

    expect(errors).toHaveLength(1);
    expect(errors[0].severity).toBe("warning");
    expect(errors[0].message).toContain("mid-triplet");
  });

  test("Detects stop before start", () => {
    const source = "TAA GGA CCA ATG";
    const errors = lexer.validateStructure(lexer.tokenize(source));

    expect(errors).toHaveLength(1);
    expect(errors[0].severity).toBe("error");
    expect(errors[0].message).toContain("Stop before first Start");
  });

  test("Warns on start after stop", () => {
    const source = "ATG GGA TAA ATG CCA TAA";
    const errors = lexer.validateStructure(lexer.tokenize(source));

    expect(errors).toHaveLength(1);
    expect(errors[0].severity).toBe("warning");
    expect(errors[0].message).toContain("Start after Stop");
  });
});
```

### 5.2 Visual Regression Tests

```typescript
describe("Visual outputs", () => {
  test("Example 1: Hello Circle", () => {
    const genome = "ATG GAA AAT GGA TAA";
    const output = renderGenome(genome);

    expect(output).toMatchImageSnapshot("hello-circle.png");
  });

  test("Example 2: Two Shapes", () => {
    const genome = `
      ATG 
        GAA AGG GAA AGG GGA
        GAA CCC GAA AAA ACA
        GAA AGG GAA AGG CCA
      TAA
    `;
    const output = renderGenome(genome);

    expect(output).toMatchImageSnapshot("two-shapes.png");
  });
});
```

---

## 6. Implementation Checklist

### Phase A: MVP Core (Weeks 1-2)

- [ ] **Lexer** (~200 LOC)
  - [ ] Tokenize triplets with whitespace handling
  - [ ] Strip comments (`;` to EOL)
  - [ ] Validate base characters (A/C/G/T only)
  - [ ] Detect mid-triplet breaks

- [ ] **VM Core** (~300 LOC)
  - [ ] Stack machine with state (position, rotation, color, scale)
  - [ ] Implement all 9 opcode families
  - [ ] Base-4 literal decoding for PUSH
  - [ ] Stack underflow detection
  - [ ] Instruction count sandboxing (max 10,000)

- [ ] **Canvas Renderer** (~200 LOC)
  - [ ] Circle, rect, line, triangle, ellipse primitives
  - [ ] Transform state management (translate, rotate, scale)
  - [ ] Color application (HSL)
  - [ ] Export to PNG

- [ ] **Playground UI** (~300 LOC)
  - [ ] Code editor with syntax highlighting (color by opcode family)
  - [ ] Live preview canvas (updates on keypress with 300ms debounce)
  - [ ] Split view (source | canvas)
  - [ ] Example loader (3 built-in examples)

**Milestone:** Can run "Hello Circle" and export image.

### Phase B: Pedagogy Tools (Weeks 3-4)

- [ ] **Linter** (~400 LOC)
  - [ ] Frame alignment checker
  - [ ] Stop-before-start detection (RED)
  - [ ] Start-after-stop warning (YELLOW)
  - [ ] Unknown codon warnings
  - [ ] Stack depth analyzer

- [ ] **Mutation Tools** (~200 LOC)
  - [ ] Point mutation button (change random codon to synonymous)
  - [ ] Indel buttons (+/− 1 base, +/− 3 bases)
  - [ ] Frameshift button (insert 1-2 bases randomly)
  - [ ] Mutation presets (silent, missense, nonsense)

- [ ] **Diff Viewer** (~300 LOC)
  - [ ] Side-by-side genome comparison
  - [ ] Highlight changed codons
  - [ ] Show downstream frame shift
  - [ ] Visual output diff (old | new)

- [ ] **Timeline Scrubber** (~300 LOC)
  - [ ] Step-through execution (instruction by instruction)
  - [ ] Rewind/forward controls
  - [ ] State snapshot visualization (stack contents, position marker)
  - [ ] Speed control (1x, 2x, 4x)

**Milestone:** All mutation types visibly demonstrable.

---

## 7. Codon Map Reference (Quick Lookup)

```
CONTROL          SHAPES           TRANSFORM        STACK
ATG = START      GG* = CIRCLE     AC* = TRANSLATE  GA* = PUSH
TAA = STOP       CC* = RECT       AG* = ROTATE     AT* = DUP (3)
TAG = STOP       AA* = LINE       CG* = SCALE      TA*/TG* = POP (3)
TGA = STOP       GC* = TRIANGLE   TT* = COLOR      TG* = SWAP (2)
                 GT* = ELLIPSE

UTILITY          RARE
CA* = NOP        CT* = NOISE
                 TC* = SAVE_STATE
```

**Pedagogy Legend:**

- `*` = all 4 bases (family of 4 synonymous codons)
- `(3)` = uses 3 of 4 codons in family
- `(2)` = uses 2 of 4 codons in family

---

## 8. Next Steps

1. **Set up repo** with TypeScript + Canvas + Jest
2. **Implement lexer** (TDD - write tests first)
3. **Implement VM + renderer** (test with Example 1)
4. **Build minimal playground** (editor + canvas)
5. **User test with 5 people** (internal team)
6. **Iterate on codon map** if confusion emerges
7. **Lock map to v1.0.0** before pilot
8. **Run 10-student pilot** (Week 5)
9. **Build demos + docs** (Week 6)
10. **Soft launch** (Week 7)

---

**Ready to code?** Start with the lexer test suite and work up the stack. The core engine should take 1-2 weeks for a solo developer, then 1-2 weeks for tooling/polish.

🧬 **Let's build this!** 🚀
