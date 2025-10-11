# CodonCanvas 🧬

> **DNA-Inspired Visual Programming Language**

CodonCanvas is an educational programming language that uses DNA-like triplets (codons) as syntax. Learners write sequences of three-character tokens that execute as visual outputs, making genetic concepts like mutations and reading frames tangible and playful.

## Features

- **Triplet-based syntax**: All instructions are 3-letter codons (e.g., `ATG`, `GGA`, `TAA`)
- **Genetic redundancy**: Multiple codons map to the same operation (synonymous codons)
- **Visual output**: Stack-based VM produces graphics on HTML5 canvas
- **Mutation demonstration**: Silent, missense, nonsense, and frameshift mutations
- **Live playground**: Web-based editor with instant visual feedback

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Then open in browser:
- Main playground: `http://localhost:5173`
- Mutation lab: `http://localhost:5173/mutation-demo.html`
- Timeline demo: `http://localhost:5173/timeline-demo.html`

## Example: Hello Circle

```dna
ATG GAA AAT GGA TAA
```

**Explanation:**

- `ATG` - START (begin execution)
- `GAA AAT` - PUSH 3 (push value 3 to stack)
- `GGA` - CIRCLE (draw circle with radius from stack)
- `TAA` - STOP (end execution)

## Codon Map Quick Reference

### Control Flow

- `ATG` - START
- `TAA|TAG|TGA` - STOP

### Drawing Primitives

- `GG*` (GGA, GGC, GGG, GGT) - CIRCLE
- `CC*` - RECT
- `AA*` - LINE
- `GC*` - TRIANGLE
- `GT*` - ELLIPSE

### Transforms

- `AC*` - TRANSLATE
- `AG*` - ROTATE
- `CG*` - SCALE
- `TT*` - COLOR

### Stack Operations

- `GA*` - PUSH (next codon is numeric literal)
- `AT*` (ATA, ATC, ATT) - DUP
- `TA*` (TAC, TAT), `TGC` - POP
- `TG*` (TGG, TGT) - SWAP

### Utility

- `CA*` - NOP
- `CT*` - NOISE
- `TC*` - SAVE_STATE

**Note:** `*` means all 4 bases create synonymous codons

## Numeric Literals (Base-4 Encoding)

After a PUSH opcode, the next codon encodes a number 0-63:

```
value = d1 × 16 + d2 × 4 + d3
where A=0, C=1, G=2, T=3
```

Examples:

- `AAA` = 0
- `CCC` = 21
- `TTT` = 63

Values are scaled: `pixel_value = (codon_value / 64) × canvas_width`

## Mutation Demonstration

### Silent Mutation (No Change)

```dna
ATG GAA AGG GGA TAA  → ATG GAA AGG GGC TAA
```

GGA → GGC: Both are CIRCLE, output identical

### Missense Mutation (Shape Change)

```dna
ATG GAA AGG GGA TAA  → ATG GAA AGG CCA TAA
```

GGA → CCA: CIRCLE becomes RECT

### Nonsense Mutation (Early Stop)

```dna
ATG GAA AGG GGA CCA TAA  → ATG GAA AGG TAA
```

GGA → TAA: Early STOP, second shape missing

### Frameshift (Complete Scramble)

```dna
ATG GAA AGG GGA TAA  → ATG GA AAG GGG ATA A
```

Delete first 'A': All downstream codons shift, output completely different

## Project Structure

```
codoncanvas/
├── src/
│   ├── types.ts              # Core type definitions & CODON_MAP
│   ├── lexer.ts              # Tokenizer and validator
│   ├── vm.ts                 # Stack machine VM
│   ├── renderer.ts           # Canvas2D renderer
│   ├── mutations.ts          # Mutation tools (7 types)
│   ├── diff-viewer.ts        # Genome comparison component
│   ├── timeline-scrubber.ts  # Step-through execution
│   ├── examples.ts           # Built-in example genomes
│   ├── playground.ts         # Main playground UI logic
│   ├── lexer.test.ts         # Lexer tests (13 tests)
│   ├── vm.test.ts            # VM tests (17 tests)
│   └── mutations.test.ts     # Mutation tests (15 tests)
├── index.html                # Main playground interface
├── mutation-demo.html        # Mutation laboratory
├── timeline-demo.html        # Timeline scrubber demo
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Type check
npm run typecheck

# Build for production
npm run build
```

## Testing

```bash
npm test
```

Test suite includes:

- Lexer tokenization and validation
- VM execution and stack operations
- Numeric literal decoding
- Mutation demonstrations
- Error handling

## Pedagogy

CodonCanvas teaches:

- **Genetic code structure**: Triplet codons, reading frames
- **Redundancy**: Synonymous codons mapping to same function
- **Mutation types**: Silent, missense, nonsense, frameshift
- **Computational thinking**: Stack-based programming, sequential execution
- **Systems thinking**: Small changes → large effects (frameshift)

## Implementation Status

✅ **Phase A: MVP Core (Completed)**

- Lexer with comment stripping and validation
- VM with all 9 opcode families (64 codons)
- Canvas2D renderer with all drawing primitives
- Base-4 numeric literal encoding (0-63 range)
- Interactive playground UI with examples
- Comprehensive test suite (30+ tests)

✅ **Phase B: Pedagogy Tools (Completed)**

- **Mutation Tools** (`src/mutations.ts`)
  - Silent, missense, nonsense mutations
  - Point mutations, insertions, deletions
  - Frameshift mutations (1-2 base changes)
  - compareGenomes() utility for analysis
- **Diff Viewer** (`src/diff-viewer.ts`)
  - Side-by-side genome comparison
  - Highlighted codon changes
  - Optional canvas output comparison
  - Mutation type badges
- **Timeline Scrubber** (`src/timeline-scrubber.ts`)
  - Step-through execution visualization
  - Play/pause controls with speed adjustment
  - Stack and instruction display
  - Timeline markers for each codon
- **Interactive Demos**
  - Mutation Lab (`mutation-demo.html`)
  - Timeline Demo (`timeline-demo.html`)

🚧 **Phase C: Extensions (Future)**

- Audio backend for sound synthesis
- Evolutionary mode with fitness selection
- Alternative alphabets (U for RNA)
- Enhanced linter with stack depth analysis
- Visual regression testing infrastructure

## License

MIT

## Credits

Created by Kaj Kjanat based on the CodonCanvas technical specification.

Inspired by the beauty of genetic code and the desire to make molecular biology concepts tangible through creative coding.

---

**Let's evolve some code!** 🧬🎨
