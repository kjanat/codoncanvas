# CodonCanvas Implementation Notes

**Date:** October 12, 2025
**Status:** MVP Phase A Complete

## Summary

Successfully implemented core CodonCanvas system per MVP Technical Specification. All fundamental components operational and tested.

## Completed Components

### 1. Type System (`src/types.ts`)

- Base type: 'A' | 'C' | 'G' | 'T'
- Codon type: Template literal type for all 64 codons
- CodonToken interface with position tracking
- ParseError interface with severity levels
- Opcode enum (18 opcodes)
- VMState interface with full execution state
- CODON_MAP: Complete 64-codon to opcode mapping

### 2. Lexer (`src/lexer.ts`)

- `tokenize()`: Strips comments (`;` to EOL), validates bases, chunks into triplets
- `validateFrame()`: Detects mid-triplet whitespace breaks
- `validateStructure()`: Checks START/STOP placement, warns on unreachable code
- Error handling: Throws on invalid characters or non-triplet length
- Position tracking: Line numbers for error reporting

### 3. VM (`src/vm.ts`)

- Stack machine with transform state (position, rotation, scale, color)
- All opcode implementations:
  - Control: START, STOP
  - Drawing: CIRCLE, RECT, LINE, TRIANGLE, ELLIPSE
  - Transforms: TRANSLATE, ROTATE, SCALE, COLOR
  - Stack: PUSH, DUP, POP, SWAP
  - Utility: NOP, SAVE_STATE, NOISE (stub)
- Base-4 literal decoding: `value = d1×16 + d2×4 + d3`
- Value scaling: Maps 0-63 to canvas coordinates
- Snapshot system for timeline (returns VMState[])
- Safety: Stack underflow detection, instruction limit (10K)

### 4. Renderer (`src/renderer.ts`)

- Canvas2DRenderer implements all drawing primitives
- Transform management: translate, rotate, scale
- Color support: HSL color space
- Context save/restore for proper transform isolation
- Export to PNG via `toDataURL()`

### 5. Playground (`src/playground.ts` + `index.html`)

- Split-pane UI: editor (left) | canvas (right)
- Toolbar: Run, Clear, Example loader, Export
- Syntax: Monaco-style dark theme
- Status bar: Error/success messages, codon/instruction counts
- Keyboard shortcut: Cmd/Ctrl+Enter to run
- Auto-run on page load
- Built-in examples: Hello Circle, Two Shapes, Colorful Pattern

### 6. Test Suite

- `lexer.test.ts`: 12 tests covering tokenization, validation, error handling
- `vm.test.ts`: 15+ tests covering execution, stack ops, mutations, errors
- MockRenderer for isolated VM testing
- Mutation demonstration tests (silent, nonsense, frameshift)

## Key Design Decisions

### 1. PUSH Opcode Handling

- PUSH advances instruction pointer to read next codon as literal
- Separate decoding function for base-4 conversion
- Error if PUSH at end of program (missing literal)

### 2. Value Scaling Strategy

- Literals 0-63 map to 0-400 pixels (canvas size)
- Formula: `pixel_value = (literal / 64) × canvas_width`
- Allows reasonable drawing without too-large values

### 3. Transform State Management

- Renderer maintains current transform (x, y, rotation, scale)
- VM syncs state after transform operations
- Canvas save/restore for proper graphics context isolation

### 4. Error Handling Philosophy

- Lexer: Throws on invalid input (non-bases, wrong length)
- Validator: Returns ParseError[] with severity levels
- VM: Throws on runtime errors (stack underflow, unknown codon)
- Playground: Catches all errors, displays in status bar

## Technical Highlights

### Base-4 Numeric Encoding

```typescript
private decodeNumericLiteral(codon: string): number {
  const baseMap = { 'A': 0, 'C': 1, 'G': 2, 'T': 3 };
  const d1 = baseMap[codon[0]] || 0;
  const d2 = baseMap[codon[1]] || 0;
  const d3 = baseMap[codon[2]] || 0;
  return d1 * 16 + d2 * 4 + d3;
}
```

### Codon Mapping Pattern

All synonymous codons (family of 4) map to same opcode:

```typescript
'GGA': Opcode.CIRCLE,
'GGC': Opcode.CIRCLE,
'GGG': Opcode.CIRCLE,
'GGT': Opcode.CIRCLE
```

Demonstrates genetic redundancy pedagogically.

## Testing Results

All tests passing:

- ✅ Lexer tokenization
- ✅ Comment stripping
- ✅ Frame validation
- ✅ Structure validation
- ✅ VM execution
- ✅ Stack operations
- ✅ Numeric literal decoding
- ✅ Mutation demonstrations
- ✅ Error handling

## Performance Characteristics

- **Tokenization**: O(n) where n = source length
- **Execution**: O(m) where m = token count (max 10K)
- **Rendering**: Depends on canvas operations, generally <100ms
- **Memory**: VMState snapshots grow with program length

## Known Limitations (MVP Scope)

1. **NOISE opcode**: Stub implementation (pops values but no effect)
2. **SAVE_STATE**: Pushes state but no RESTORE_STATE implemented
3. **No undo/redo**: Single execution model
4. **No animation**: Static output only
5. **No timeline scrubber**: Returns snapshots but no UI
6. **No mutation tools**: Manual editing only

## Next Steps (Phase B)

1. **Mutation Tools**
   - Point mutation button (random synonymous codon swap)
   - Indel buttons (+1, -1, +3, -3 bases)
   - Frameshift button (insert 1-2 random bases)

2. **Diff Viewer**
   - Side-by-side genome comparison
   - Highlight changed codons
   - Show downstream frame shift visualization
   - Visual output comparison

3. **Timeline Scrubber**
   - Step-through execution UI
   - Rewind/forward controls
   - Display current stack contents
   - Position marker on canvas

4. **Enhanced Linter**
   - Stack depth tracking
   - Unreachable code detection
   - Type mismatches (e.g., RECT without 2 values)

## File Organization

```
codoncanvas/
├── src/
│   ├── types.ts           # 200 LOC - Core types
│   ├── lexer.ts           # 150 LOC - Tokenizer
│   ├── vm.ts              # 250 LOC - VM implementation
│   ├── renderer.ts        # 150 LOC - Canvas renderer
│   ├── examples.ts        # 50 LOC - Built-in examples
│   ├── playground.ts      # 120 LOC - UI logic
│   ├── lexer.test.ts      # 120 LOC - Lexer tests
│   └── vm.test.ts         # 250 LOC - VM tests
├── index.html             # 150 LOC - UI structure
├── README.md              # Documentation
├── claudedocs/
│   └── implementation-notes.md  # This file
└── config files (package.json, tsconfig.json, vite.config.ts)

Total: ~1,450 LOC (excluding config)
```

## Git Strategy

Commit pattern:

1. Initial commit: Project structure + config
2. Core implementation: Types + Lexer + VM + Renderer
3. Playground: UI + examples
4. Tests: Complete test suite
5. Documentation: README + notes

## Dependencies

**Runtime:**

- None (browser APIs only)

**Development:**

- TypeScript 5.x
- Vite 5.x (build tool)
- Vitest 1.x (testing)
- ESLint (linting)

Minimal dependency footprint per specification.

## Memory for Future Sessions

**Key Context:**

- This is an educational tool, not a real biology simulator
- Pedagogy focus: genetic mutations → visual effects
- Stack-based VM with 400×400 canvas
- All codons are 3 letters, A/C/G/T only
- PUSH reads next codon as base-4 literal (0-63)
- Synonymous codons demonstrate genetic redundancy

**Quick Test Command:**

```bash
npm install && npm test && npm run typecheck
```

**Quick Start Command:**

```bash
npm run dev
# Open http://localhost:5173
```

---

**Implementation complete. System operational. Ready for Phase B enhancements.**
