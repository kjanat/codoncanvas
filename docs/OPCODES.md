# CodonCanvas Opcode Reference

**Complete instruction set for CodonCanvas v1.0**

This document provides the complete mapping of all 64 codons to their corresponding opcodes, including stack effects, usage examples, and pedagogical notes.

---

## Table of Contents

1. [Control Flow](#control-flow) (4 codons)
2. [Drawing Primitives](#drawing-primitives) (20 codons)
3. [Transform Operations](#transform-operations) (16 codons)
4. [Stack Operations](#stack-operations) (8 codons)
5. [Arithmetic Operations](#arithmetic-operations) (4 codons)
6. [Comparison Operations](#comparison-operations) (2 codons)
7. [Control Flow - Loops](#loops) (1 codon)
8. [Utility Operations](#utility-operations) (4 codons)
9. [Advanced State Management](#advanced-state-management) (5 codons)

**Total: 64 codons (all possible DNA triplets mapped)**

---

## Control Flow

| Codon | Opcode | Stack Effect | Description                                                                          |
| ----- | ------ | ------------ | ------------------------------------------------------------------------------------ |
| `ATG` | START  | `[] → []`    | Begin execution block. Must be first codon in valid program. Biological start codon. |
| `TAA` | STOP   | `[] → []`    | Terminate execution immediately. Biological stop codon.                              |
| `TAG` | STOP   | `[] → []`    | Terminate execution (synonymous with TAA).                                           |
| `TGA` | STOP   | `[] → []`    | Terminate execution (synonymous with TAA).                                           |

**Pedagogy Note:** All valid programs must begin with `ATG` and end with one of the three stop codons (`TAA`, `TAG`, `TGA`). This models biological translation initiation and termination.

**Examples:**

```
ATG ... TAA  ; Minimal valid program structure
ATG ... TAG  ; Alternative stop codon
ATG ... TGA  ; Another alternative
```

---

## Drawing Primitives

All drawing operations occur at the current drawing position with current rotation, scale, and color applied.

### Circles

| Codon | Opcode | Stack Effect    | Description                            |
| ----- | ------ | --------------- | -------------------------------------- |
| `GGA` | CIRCLE | `[radius] → []` | Draw filled circle at current position |
| `GGC` | CIRCLE | `[radius] → []` | Synonymous with GGA                    |
| `GGG` | CIRCLE | `[radius] → []` | Synonymous with GGA                    |
| `GGT` | CIRCLE | `[radius] → []` | Synonymous with GGA                    |

**Example:**

```
ATG
  GAA CCC GGA    ; PUSH 21, CIRCLE (radius 21)
TAA
```

### Rectangles

| Codon | Opcode | Stack Effect           | Description                               |
| ----- | ------ | ---------------------- | ----------------------------------------- |
| `CCA` | RECT   | `[width, height] → []` | Draw filled rectangle at current position |
| `CCC` | RECT   | `[width, height] → []` | Synonymous with CCA                       |
| `CCG` | RECT   | `[width, height] → []` | Synonymous with CCA                       |
| `CCT` | RECT   | `[width, height] → []` | Synonymous with CCA                       |

**Example:**

```
ATG
  GAA AGG GAA CCC CCA    ; PUSH 10, PUSH 21, RECT (10×21)
TAA
```

### Lines

| Codon | Opcode | Stack Effect    | Description                                                   |
| ----- | ------ | --------------- | ------------------------------------------------------------- |
| `AAA` | LINE   | `[length] → []` | Draw line from current position in current rotation direction |
| `AAC` | LINE   | `[length] → []` | Synonymous with AAA                                           |
| `AAG` | LINE   | `[length] → []` | Synonymous with AAA                                           |
| `AAT` | LINE   | `[length] → []` | Synonymous with AAA                                           |

**Example:**

```
ATG
  GAA CCC AAA    ; PUSH 21, LINE (length 21, 0° = horizontal)
  GAA TCC AGA    ; PUSH 57, ROTATE (57 degrees)
  GAA CCC AAA    ; PUSH 21, LINE (diagonal line)
TAA
```

### Triangles

| Codon | Opcode   | Stack Effect  | Description                                   |
| ----- | -------- | ------------- | --------------------------------------------- |
| `GCA` | TRIANGLE | `[size] → []` | Draw equilateral triangle at current position |
| `GCC` | TRIANGLE | `[size] → []` | Synonymous with GCA                           |
| `GCG` | TRIANGLE | `[size] → []` | Synonymous with GCA                           |
| `GCT` | TRIANGLE | `[size] → []` | Synonymous with GCA                           |

**Pedagogy Note:** Triangle is a missense mutation from Circle (GG* → GC*), demonstrating how single base changes affect output.

### Ellipses

| Codon | Opcode  | Stack Effect    | Description                                                  |
| ----- | ------- | --------------- | ------------------------------------------------------------ |
| `GTA` | ELLIPSE | `[rx, ry] → []` | Draw ellipse at current position (horizontal/vertical radii) |
| `GTC` | ELLIPSE | `[rx, ry] → []` | Synonymous with GTA                                          |
| `GTG` | ELLIPSE | `[rx, ry] → []` | Synonymous with GTA                                          |
| `GTT` | ELLIPSE | `[rx, ry] → []` | Synonymous with GTA                                          |

**Example:**

```
ATG
  GAA AGG GAA CCC GTA    ; PUSH 10, PUSH 21, ELLIPSE (10×21 oval)
TAA
```

---

## Transform Operations

Transform operations modify the drawing state (position, rotation, scale, color) for subsequent drawing operations.

### Translation (Movement)

| Codon | Opcode    | Stack Effect    | Description                              |
| ----- | --------- | --------------- | ---------------------------------------- |
| `ACA` | TRANSLATE | `[dx, dy] → []` | Move drawing position by (dx, dy) pixels |
| `ACC` | TRANSLATE | `[dx, dy] → []` | Synonymous with ACA                      |
| `ACG` | TRANSLATE | `[dx, dy] → []` | Synonymous with ACA                      |
| `ACT` | TRANSLATE | `[dx, dy] → []` | Synonymous with ACA                      |

**Example:**

```
ATG
  GAA CCC GGA              ; Circle at center (200, 200)
  GAA CCC GAA AAA ACA      ; PUSH 21, PUSH 0, TRANSLATE (+21, +0)
  GAA CCC GGA              ; Circle at (221, 200)
TAA
```

### Rotation

| Codon | Opcode | Stack Effect     | Description                                       |
| ----- | ------ | ---------------- | ------------------------------------------------- |
| `AGA` | ROTATE | `[degrees] → []` | Rotate subsequent drawing by degrees (cumulative) |
| `AGC` | ROTATE | `[degrees] → []` | Synonymous with AGA                               |
| `AGG` | ROTATE | `[degrees] → []` | Synonymous with AGA                               |
| `AGT` | ROTATE | `[degrees] → []` | Synonymous with AGA                               |

**Example:**

```
ATG
  GAA AGG AAA    ; PUSH 10, LINE (horizontal)
  GAA TCC AGA    ; PUSH 57, ROTATE (57°)
  GAA AGG AAA    ; PUSH 10, LINE (diagonal)
TAA
```

### Scaling

| Codon | Opcode | Stack Effect    | Description                                      |
| ----- | ------ | --------------- | ------------------------------------------------ |
| `CGA` | SCALE  | `[factor] → []` | Scale subsequent drawing operations (cumulative) |
| `CGC` | SCALE  | `[factor] → []` | Synonymous with CGA                              |
| `CGG` | SCALE  | `[factor] → []` | Synonymous with CGA                              |
| `CGT` | SCALE  | `[factor] → []` | Synonymous with CGA                              |

**Note:** Scale values are normalized (32 = 1.0x, 16 = 0.5x, 48 = 1.5x).

### Color

| Codon | Opcode | Stack Effect     | Description                                                   |
| ----- | ------ | ---------------- | ------------------------------------------------------------- |
| `TTA` | COLOR  | `[h, s, l] → []` | Set color: hue (0-360), saturation (0-100), lightness (0-100) |
| `TTC` | COLOR  | `[h, s, l] → []` | Synonymous with TTA                                           |
| `TTG` | COLOR  | `[h, s, l] → []` | Synonymous with TTA                                           |
| `TTT` | COLOR  | `[h, s, l] → []` | Synonymous with TTA                                           |

**HSL Color Reference:**

- **Hue:** 0=red, 60=yellow, 120=green, 180=cyan, 240=blue, 300=magenta
- **Saturation:** 0=gray, 50=muted, 100=vivid
- **Lightness:** 0=black, 50=normal, 100=white

**Example:**

```
ATG
  TTA TTT CCC CCC    ; COLOR(63, 21, 21) - red hue, high saturation
  GAA CCC GGA        ; PUSH 21, CIRCLE (red circle)
TAA
```

---

## Stack Operations

CodonCanvas uses a stack-based architecture. Values must be pushed onto the stack before operations can consume them.

### Push (Load Literal)

| Codon | Opcode | Stack Effect   | Description                                     |
| ----- | ------ | -------------- | ----------------------------------------------- |
| `GAA` | PUSH   | `[] → [value]` | Push numeric literal (next codon encodes value) |
| `GAG` | PUSH   | `[] → [value]` | Synonymous with GAA                             |
| `GAC` | PUSH   | `[] → [value]` | Synonymous with GAA                             |
| `GAT` | PUSH   | `[] → [value]` | Synonymous with GAA                             |

**Literal Encoding:** The codon immediately following PUSH is read as a base-4 number:

- Formula: `value = d1×16 + d2×4 + d3`
- Where: `A=0, C=1, G=2, T=3`
- Range: 0-63

**Examples:**

```
GAA AAA  ; PUSH 0   (A=0, A=0, A=0 → 0)
GAA CCC  ; PUSH 21  (C=1, C=1, C=1 → 16+4+1 = 21)
GAA TTT  ; PUSH 63  (T=3, T=3, T=3 → 48+12+3 = 63)
GAA TCA  ; PUSH 52  (T=3, C=1, A=0 → 48+4+0 = 52)
```

### Duplicate

| Codon | Opcode | Stack Effect   | Description               |
| ----- | ------ | -------------- | ------------------------- |
| `ATA` | DUP    | `[a] → [a, a]` | Duplicate top stack value |
| `ATC` | DUP    | `[a] → [a, a]` | Synonymous with ATA       |
| `ATT` | DUP    | `[a] → [a, a]` | Synonymous with ATA       |

**Example:**

```
ATG
  GAA CCC ATA    ; PUSH 21, DUP (stack: [21, 21])
  GGA            ; CIRCLE(21)
  GGA            ; CIRCLE(21) again at same position
TAA
```

### Pop

| Codon | Opcode | Stack Effect | Description                        |
| ----- | ------ | ------------ | ---------------------------------- |
| `TAC` | POP    | `[a] → []`   | Remove and discard top stack value |
| `TAT` | POP    | `[a] → []`   | Synonymous with TAC                |
| `TGC` | POP    | `[a] → []`   | Synonymous with TAC                |

**Use case:** Remove unwanted values from stack.

### Swap

| Codon | Opcode | Stack Effect      | Description               |
| ----- | ------ | ----------------- | ------------------------- |
| `TGG` | SWAP   | `[a, b] → [b, a]` | Swap top two stack values |
| `TGT` | SWAP   | `[a, b] → [b, a]` | Synonymous with TGG       |

**Example:**

```
GAA AGG GAA CCC TGG    ; PUSH 10, PUSH 21, SWAP (stack: [21, 10])
CCA                     ; RECT(21, 10) - note swapped dimensions
```

---

## Arithmetic Operations

**Added:** Session 71-72 (October 2025)

Arithmetic operations enable computational programming beyond simple drawing. These opcodes form the foundation for algorithmic examples like Fibonacci sequences and mathematical patterns.

| Codon | Opcode | Stack Effect     | Description                                     |
| ----- | ------ | ---------------- | ----------------------------------------------- |
| `CTG` | ADD    | `[a, b] → [a+b]` | Addition: pop two values, push sum              |
| `CAG` | SUB    | `[a, b] → [a-b]` | Subtraction: pop two values, push difference    |
| `CTT` | MUL    | `[a, b] → [a*b]` | Multiplication: pop two values, push product    |
| `CAT` | DIV    | `[a, b] → [a/b]` | Integer division: pop two values, push quotient |

**Examples:**

```
; Addition: 5 + 3 = 8
GAA ACT GAA AAG CTG    ; PUSH 5, PUSH 3, ADD (result: 8)

; Fibonacci step: (a, b) → (b, a+b)
ATA                    ; DUP b (stack: [a, b, b])
CAG                    ; SUB (stack: [b, a+b]) ... wait, wrong

; Better Fibonacci:
GAA AAC GAA AAC        ; PUSH 1, PUSH 1 (initial: fib(1)=1, fib(2)=1)
ATA CTG                ; DUP, ADD (result: 2 = fib(3))
```

**Pedagogy Note:** Arithmetic opcodes demonstrate that CodonCanvas is a real programming language capable of computation, not just drawing. Combined with LOOP, these enable complex algorithms.

---

## Comparison Operations

**Added:** Session 75 (October 2025)

Comparison operations enable conditional behavior and algorithmic patterns. They return 1 (true) or 0 (false), which can be used with arithmetic multiplication to conditionally show/hide shapes.

| Codon | Opcode | Stack Effect                  | Description                             |
| ----- | ------ | ----------------------------- | --------------------------------------- |
| `CTA` | EQ     | `[a, b] → [1 if a==b else 0]` | Equality: push 1 if equal, 0 otherwise  |
| `CTC` | LT     | `[a, b] → [1 if a<b else 0]`  | Less than: push 1 if a < b, 0 otherwise |

**Creative Usage Pattern:**
Since CodonCanvas lacks branching (IF/ELSE), use comparison results as multipliers:

```
; Draw circle ONLY if 5 == 5 (should appear)
GAA ACT GAA ACT CTA    ; PUSH 5, PUSH 5, EQ → 1
GAA AGC CTT             ; PUSH 8, MUL → 8 * 1 = 8
GGA                     ; CIRCLE(8) - visible!

; Draw circle ONLY if 5 == 3 (should NOT appear)
GAA ACT GAA AAG CTA    ; PUSH 5, PUSH 3, EQ → 0
GAA AGC CTT             ; PUSH 8, MUL → 8 * 0 = 0
GGA                     ; CIRCLE(0) - invisible!
```

**Pedagogy Note:** This "conditional via multiplication" pattern is brilliant computational thinking - achieving branching behavior without branch instructions. Demonstrates creative problem-solving within constraints.

**Example: FizzBuzz Logic**

```
; Check if number is divisible by 3
GAA AAG CAT             ; PUSH 2, DIV (quotient)
GAA AAG CTT             ; PUSH 2, MUL (reconstructed multiple)
GAA ACT TGG CAG         ; PUSH 5, SWAP, SUB (original - reconstructed)
GAA AAA CTA             ; PUSH 0, EQ (is remainder 0?)
; Result: 1 if divisible by 3, 0 otherwise
```

---

## Loops

**Added:** Session 73 (October 2025)

The LOOP opcode enables efficient iteration without manually repeating code blocks.

| Codon | Opcode | Stack Effect                | Description                                |
| ----- | ------ | --------------------------- | ------------------------------------------ |
| `CAA` | LOOP   | `[count, ...block] → [...]` | Execute opcodes in loop body `count` times |

**Usage:**
The LOOP opcode reads a loop body from the source code and executes it multiple times based on the stack count value. The loop body is defined by a "loop counter" that specifies how many subsequent opcodes belong to the loop.

**Example:**

```
ATG
  GAA AGG CAA         ; PUSH 10, LOOP (repeat 10 times:)
    GAA ACT GGA       ;   PUSH 5, CIRCLE (10 circles)
    GAA AGG GAA AAA ACA  ;   PUSH 10, PUSH 0, TRANSLATE (move right)
TAA
```

**Implementation Note:** The loop body size is currently hard-coded or auto-detected. Future versions may use an explicit loop size parameter.

**Pedagogy Value:** LOOP demonstrates that CodonCanvas supports iteration, a fundamental programming concept. Combined with arithmetic, enables complex algorithmic patterns (Fibonacci, fractals, prime spirals).

---

## Utility Operations

### No Operation

| Codon | Opcode | Stack Effect | Description                                  |
| ----- | ------ | ------------ | -------------------------------------------- |
| `CAC` | NOP    | `[] → []`    | No operation; used for spacing and alignment |

**Use case:** Visual chunking of source code for readability.

**Example:**

```
ATG CAC CAC CAC    ; Visual separator
  GAA CCC GGA CAC  ; Instruction with spacer
TAA
```

---

## Advanced State Management

### Save/Restore State

| Codon | Opcode        | Stack Effect | Description                                                                    |
| ----- | ------------- | ------------ | ------------------------------------------------------------------------------ |
| `TCA` | SAVE_STATE    | `[] → []`    | Push current drawing state (position, rotation, scale, color) onto state stack |
| `TCC` | SAVE_STATE    | `[] → []`    | Synonymous with TCA                                                            |
| `TCG` | RESTORE_STATE | `[] → []`    | Pop and restore drawing state from state stack                                 |
| `TCT` | RESTORE_STATE | `[] → []`    | Synonymous with TCG                                                            |

**Use Case:** Nested compositions where you need to return to a previous drawing state.

**Example:**

```
ATG
  GAA CCC GGA          ; Circle at center (200, 200)
  TCA                  ; SAVE_STATE (remember center)
  GAA CCC GAA AAA ACA  ; PUSH 21, PUSH 0, TRANSLATE (move right)
  GAA CCC GGA          ; Circle at (221, 200)
  TCG                  ; RESTORE_STATE (back to center)
  GAA AAA GAA CCC ACA  ; PUSH 0, PUSH 21, TRANSLATE (move down)
  GAA CCC GGA          ; Circle at (200, 221)
TAA
```

**Pedagogy Note:** State management models biological regulation - saving "context" before exploring different paths, then returning to original state.

---

## Opcode Families & Synonymous Codons

CodonCanvas uses **synonymous codons** (codon families) to model genetic redundancy. Multiple codons map to the same opcode, enabling **silent mutations** for pedagogical demonstrations.

### Complete Family Mapping

| Opcode        | Codon Family                | Count | Pattern                      |
| ------------- | --------------------------- | ----- | ---------------------------- |
| CIRCLE        | `GG*` (GGA, GGC, GGG, GGT)  | 4     | All same                     |
| RECT          | `CC*` (CCA, CCC, CCG, CCT)  | 4     | All same                     |
| LINE          | `AA*` (AAA, AAC, AAG, AAT)  | 4     | All same                     |
| TRIANGLE      | `GC*` (GCA, GCC, GCG, GCT)  | 4     | All same                     |
| ELLIPSE       | `GT*` (GTA, GTC, GTG, GTT)  | 4     | All same                     |
| TRANSLATE     | `AC*` (ACA, ACC, ACG, ACT)  | 4     | All same                     |
| ROTATE        | `AG*` (AGA, AGC, AGG, AGT)  | 4     | All same                     |
| SCALE         | `CG*` (CGA, CGC, CGG, CGT)  | 4     | All same                     |
| COLOR         | `TT*` (TTA, TTC, TTG, TTT)  | 4     | All same                     |
| PUSH          | `GA*` (GAA, GAG, GAC, GAT)  | 4     | All same                     |
| DUP           | `AT*` (ATA, ATC, ATT)       | 3     | Missing ATG (used for START) |
| POP           | 3 scattered (TAC, TAT, TGC) | 3     | Non-family                   |
| SAVE_STATE    | 2 (TCA, TCC)                | 2     | Partial family               |
| RESTORE_STATE | 2 (TCG, TCT)                | 2     | Partial family               |
| SWAP          | 2 (TGG, TGT)                | 2     | Partial family               |
| STOP          | 3 (TAA, TAG, TGA)           | 3     | Biological stops             |
| START         | 1 (ATG)                     | 1     | Unique (biological start)    |
| NOP           | 1 (CAC)                     | 1     | Filler codon                 |
| ADD           | 1 (CTG)                     | 1     | Unique                       |
| SUB           | 1 (CAG)                     | 1     | Unique                       |
| MUL           | 1 (CTT)                     | 1     | Unique                       |
| DIV           | 1 (CAT)                     | 1     | Unique                       |
| EQ            | 1 (CTA)                     | 1     | Unique                       |
| LT            | 1 (CTC)                     | 1     | Unique                       |
| LOOP          | 1 (CAA)                     | 1     | Unique                       |

**Total: 27 unique opcodes mapped across 64 codons**

---

## Mutation Type Reference

### Silent Mutation

**Definition:** Change codon within same family → no output change

**Example:**

```
GGA → GGC (both CIRCLE)
CCA → CCT (both RECT)
```

**Pedagogy:** Models genetic redundancy where DNA changes don't affect protein function.

### Missense Mutation

**Definition:** Change codon to different family → output changes

**Example:**

```
GGA → GCA (CIRCLE → TRIANGLE)
CCA → AAA (RECT → LINE)
```

**Pedagogy:** Models mutations that alter protein structure/function.

### Nonsense Mutation

**Definition:** Change codon to STOP → early termination

**Example:**

```
GGA → TAA (CIRCLE → STOP)
```

**Pedagogy:** Models premature stop codons causing truncated proteins.

### Frameshift Mutation

**Definition:** Insert/delete bases (not multiple of 3) → all downstream codons change

**Example:**

```
Original:  ATG GAA CCC GGA TAA
Insert C:  ATG CGA ACC CGG ATA A
           ↑   └── frame shifted! ──┘
```

**Pedagogy:** Models how reading frame matters - catastrophic downstream effects.

---

## Computational Completeness

With the addition of arithmetic (ADD, SUB, MUL, DIV), comparison (EQ, LT), and iteration (LOOP) opcodes, CodonCanvas approaches **Turing completeness**:

✅ **Arithmetic:** Basic math operations
✅ **Conditionals:** Comparison opcodes + creative workarounds
✅ **Iteration:** LOOP opcode
✅ **Memory:** Value stack
⚠️ **Branching:** No IF/ELSE (but can simulate via multiplication)
⚠️ **Recursion:** No call stack (could simulate via LOOP + arithmetic)

**Conclusion:** CodonCanvas is a **real programming language** capable of expressing algorithms (FizzBuzz, Fibonacci, prime detection) beyond simple drawing commands.

---

## Examples Gallery

### Beginner Examples

- **Hello Circle:** `ATG GAA AAT GGA TAA` (minimal program)
- **Two Shapes:** Drawing multiple primitives with movement
- **Colorful Triangle:** Using COLOR opcode

### Intermediate Examples

- **Spiral Pattern:** LOOP + rotation + translation
- **Gradient Grid:** Nested loops with color gradients
- **Fractal Tree:** State management + recursion-like patterns

### Advanced Showcase

- **Fibonacci Spiral:** Arithmetic + LOOP (golden ratio approximation)
- **FizzBuzz Visual:** Comparison opcodes + conditional logic
- **Prime Number Spiral:** DIV for divisibility testing + Ulam spiral
- **Parametric Rose:** Mathematical curves with LOOP iteration

---

## Quick Reference Chart

Print this for easy lookup:

```
CONTROL       DRAWING        TRANSFORM      STACK
ATG = START   GG* = CIRCLE   AC* = TRANSLATE  GA* = PUSH
TAA = STOP    CC* = RECT     AG* = ROTATE     AT* = DUP (3)
TAG = STOP    AA* = LINE     CG* = SCALE      TA*/TG* = POP (3)
TGA = STOP    GC* = TRIANGLE TT* = COLOR      TG* = SWAP (2)
              GT* = ELLIPSE

ARITHMETIC    COMPARISON     CONTROL         UTILITY
CTG = ADD     CTA = EQ       CAA = LOOP      CAC = NOP
CAG = SUB     CTC = LT       TCA/TCC = SAVE
CTT = MUL                    TCG/TCT = RESTORE
CAT = DIV

Legend: * = all 4 bases (family of 4), (3) = 3 codons, (2) = 2 codons
```

---

## Version History

**v1.0.0 - October 2025**

- MVP: 19 opcodes (drawing, transform, stack, utility)

**v1.1.0 - October 2025 (Sessions 71-73)**

- Added: 4 arithmetic opcodes (ADD, SUB, MUL, DIV)
- Added: LOOP opcode (iteration)

**v1.2.0 - October 2025 (Session 75)**

- Added: 2 comparison opcodes (EQ, LT)
- **Total: 27 opcodes across 64 codons**

---

## Further Reading

- [MVP Technical Specification](MVP_Technical_Specification.md) - Original design document
- [Quick Reference](claudedocs/QUICK_REFERENCE.md) - 1-page cheat sheet for students
- [Example Gallery](/gallery) - 38+ working examples from simple to advanced
- [Interactive Tutorial](/tutorial) - Step-by-step guided learning

---

**CodonCanvas** • DNA-Inspired Visual Programming Language
MIT License • [https://github.com/kjanat/codoncanvas](https://github.com/kjanat/codoncanvas)
