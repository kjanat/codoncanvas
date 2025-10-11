# CodonCanvas 🧬

**DNA-Inspired Visual Programming Language**

CodonCanvas is an educational programming language that uses DNA-like triplets (codons) as syntax. Learners write sequences of three-character tokens that execute as visual outputs, making genetic concepts like mutations and reading frames tangible and playful.

## Features

- **Triplet-based syntax**: All instructions are 3-letter codons (e.g., `ATG`, `GGA`, `TAA`)
- **Genetic redundancy**: Multiple codons map to the same operation (synonymous codons)
- **Visual output**: Stack-based VM produces graphics on HTML5 canvas
- **Mutation demonstration**: Silent, missense, nonsense, and frameshift mutations
- **Live playground**: Web-based editor with instant visual feedback

## Quick Start

```bash
npm install
npm run dev
```

Open browser to `http://localhost:5173`

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
│   ├── types.ts          # Core type definitions
│   ├── lexer.ts          # Tokenizer and validator
│   ├── vm.ts             # Stack machine VM
│   ├── renderer.ts       # Canvas renderer
│   ├── examples.ts       # Built-in examples
│   ├── playground.ts     # Web UI
│   ├── lexer.test.ts     # Lexer tests
│   └── vm.test.ts        # VM tests
├── index.html            # Playground UI
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
- VM with all 9 opcode families
- Canvas2D renderer with transforms
- Base-4 numeric literal encoding
- Basic playground UI
- Comprehensive test suite

🚧 **Phase B: Pedagogy Tools (Next)**
- Mutation buttons (point, indel, frameshift)
- Diff viewer for genome comparison
- Timeline scrubber for step-through execution
- Enhanced linter with stack depth analysis

## License

MIT

## Credits

Created by Kaj Kjanat based on the CodonCanvas technical specification.

Inspired by the beauty of genetic code and the desire to make molecular biology concepts tangible through creative coding.

---

**Let's evolve some code!** 🧬🎨
