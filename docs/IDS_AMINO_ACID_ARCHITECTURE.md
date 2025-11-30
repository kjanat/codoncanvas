# Internal Design Specification: Amino Acid-Based Opcode Mapping

**Status:** Proposal
**Author:** CodonCanvas Team
**Date:** 2025-11-30
**Related:** [OPCODES.md](./OPCODES.md), [METAPHOR_LIMITATIONS.md](./METAPHOR_LIMITATIONS.md)

## Overview

This document proposes a more biologically accurate architecture where **codons map to amino acids**, and **amino acids determine opcodes**. This would replace the current direct codon→opcode mapping with a two-step translation that mirrors real protein synthesis.

## Current Architecture

```
Codon → Opcode (direct mapping)
GGA   → CIRCLE
ATG   → START
```

The current `CODON_MAP` directly maps each of the 64 codons to opcodes. While this works, it doesn't reflect how biology actually works.

## Proposed Architecture

```
Codon → Amino Acid → Opcode
GGA   → Glycine    → CIRCLE
ATG   → Methionine → START (also initiates translation)
```

### Why This Matters

1. **Educational Accuracy**: Students learn the real genetic code
2. **Natural Degeneracy**: Multiple codons → same amino acid → same behavior (silent mutations)
3. **Property-Based Behavior**: Amino acid properties (polar, hydrophobic, etc.) influence graphics
4. **Biological Intuition**: Understanding amino acids helps predict behavior

## Existing Infrastructure

CodonCanvas already has the building blocks in place:

### `src/data/amino-acids.ts`

- `STANDARD_GENETIC_CODE`: Maps all 64 DNA codons to real amino acids
- `AMINO_ACIDS`: Complete data for all 20 amino acids + STOP
- `AminoAcidInfo`: Properties like `nonpolar`, `polar`, `acidic`, `basic`, `aromatic`

### Current Amino Acid Distribution

| Property | Amino Acids                       | Count |
| -------- | --------------------------------- | ----- |
| Nonpolar | Gly, Ala, Val, Leu, Ile, Pro, Met | 7     |
| Polar    | Ser, Thr, Cys, Asn, Gln           | 5     |
| Acidic   | Asp, Glu                          | 2     |
| Basic    | Lys, Arg, His                     | 3     |
| Aromatic | Phe, Tyr, Trp                     | 3     |
| Stop     | *                                 | 1     |

## Proposed Mapping: Amino Acid → Opcode

This mapping is designed to create intuitive relationships between amino acid properties and graphical behaviors.

### Control Flow (Biological Meaning Preserved)

| Amino Acid       | Opcode | Rationale                              |
| ---------------- | ------ | -------------------------------------- |
| Met (Methionine) | START  | ATG is biological start codon          |
| STOP             | STOP   | UAA/UAG/UGA are biological stop codons |

### Drawing Primitives (Based on Amino Acid Structure)

| Amino Acid       | Opcode   | Rationale                                   |
| ---------------- | -------- | ------------------------------------------- |
| Gly (Glycine)    | CIRCLE   | Smallest, simplest AA → simple circle       |
| Pro (Proline)    | RECT     | Rigid, cyclic structure → angular rectangle |
| Ala (Alanine)    | TRIANGLE | Simple aliphatic side chain → triangle      |
| Val (Valine)     | ELLIPSE  | Branched chain → elliptical shape           |
| Leu (Leucine)    | LINE     | Long aliphatic chain → line                 |
| Ile (Isoleucine) | ELLIPSE  | Branched (similar to Val)                   |

### Transform Operations (Based on Chemical Behavior)

| Amino Acid      | Opcode    | Rationale                             |
| --------------- | --------- | ------------------------------------- |
| Thr (Threonine) | TRANSLATE | Hydroxyl group enables mobility       |
| Arg (Arginine)  | ROTATE    | Long charged side chain → rotation    |
| Ser (Serine)    | SCALE     | Phosphorylation site → scaling/growth |

### Stack Operations (Polar/Charged Amino Acids)

| Amino Acid          | Opcode | Rationale                              |
| ------------------- | ------ | -------------------------------------- |
| Glu (Glutamic acid) | PUSH   | Acidic, "pushes" H+ away               |
| Asp (Aspartic acid) | POP    | Acidic (similar to Glu)                |
| Lys (Lysine)        | DUP    | Positive charge → duplicating          |
| His (Histidine)     | SWAP   | Can be positive or neutral → switching |

### Color Operations (Aromatic Amino Acids)

Aromatic amino acids absorb UV light - perfect for color operations!

| Amino Acid          | Opcode | Rationale                          |
| ------------------- | ------ | ---------------------------------- |
| Phe (Phenylalanine) | COLOR  | Aromatic ring absorbs light        |
| Tyr (Tyrosine)      | COLOR  | Aromatic (hydroxyl adds variety)   |
| Trp (Tryptophan)    | COLOR  | Largest aromatic → strongest color |

### Arithmetic Operations (Charged/Polar)

| Amino Acid                | Opcode | Rationale                  |
| ------------------------- | ------ | -------------------------- |
| Asn (Asparagine)          | ADD    | Polar amide → combining    |
| Gln (Glutamine)           | SUB    | Polar amide (longer chain) |
| (MUL/DIV need assignment) | -      | -                          |

### State Management (Sulfur-Containing)

| Amino Acid     | Opcode     | Rationale                                    |
| -------------- | ---------- | -------------------------------------------- |
| Cys (Cysteine) | SAVE_STATE | Forms disulfide bonds → preserving structure |

## Implementation Plan

### Phase 1: Add Mapping Layer (Non-Breaking)

```typescript
// New file: src/types/protein-opcodes.ts
export const AMINO_ACID_TO_OPCODE: Record<AminoAcidCode, Opcode> = {
  Met: Opcode.START,
  STOP: Opcode.STOP,
  Gly: Opcode.CIRCLE,
  Pro: Opcode.RECT,
  // ... etc
};
```

### Phase 2: Alternative Execution Path

Add a VM option to use the biological mapping:

```typescript
const vm = new CodonVM(renderer, { biologicalMode: true });
```

### Phase 3: Educational Mode

Create a UI toggle that shows:

- Current codon
- Amino acid it codes for
- Why that amino acid produces that graphical effect

## Challenges

### 1. Not Enough Unique Opcodes

We have 20 amino acids but ~25 opcodes. Some amino acids may need to share opcodes or we need to add new ones.

### 2. Breaking Existing Genomes

The new mapping would change behavior. Solutions:

- Use a genome directive: `; @translation: biological`
- Keep current mode as default for backward compatibility

### 3. Amino Acid Degeneracy

Some amino acids have 6 codons (Leu, Arg, Ser) while others have 1 (Met, Trp). This affects:

- Silent mutation probability
- Codon choice for genome authors

## Benefits

1. **True Silent Mutations**: Any codon change within an amino acid family is truly silent
2. **Educational Value**: Students learn real biology while creating art
3. **Predictable Behavior**: Understanding amino acid properties helps predict outcomes
4. **Research Integration**: Aligns with `src/data/amino-acids.ts` research features

## References

- [Standard Genetic Code](https://en.wikipedia.org/wiki/DNA_and_RNA_codon_tables)
- [Amino Acid Properties](https://en.wikipedia.org/wiki/Amino_acid#Classification)
- CodonCanvas: `src/data/amino-acids.ts` (existing implementation)

## Next Steps

1. Community feedback on proposed AA→Opcode mapping
2. Prototype implementation in separate branch
3. Educational testing with biology students
4. Documentation and tutorials for biological mode
