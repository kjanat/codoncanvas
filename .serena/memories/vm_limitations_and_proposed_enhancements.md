# VM Limitations and Proposed Enhancements

## Current Limitations (as of 2025-11)

### 1. No Negative/Signed Values

- Stack values are 6-bit unsigned (0-63)
- TRANSLATE only moves in positive direction (right/down)
- No way to encode "move left" or "move up" directly
- **Impact**: Grid layouts starting from corners are extremely verbose

### 2. No Absolute Positioning

- `setPosition(x, y)` exists in Renderer interface but has no opcode
- Can only move relative to current position
- **Impact**: Precise pixel placement is difficult

### 3. NOISE Opcode Not Implemented

- NOISE is mentioned in docs/comments but NOT in Opcode enum
- `noise(seed, intensity)` method exists in all renderers
- No codon is mapped to NOISE
- **Impact**: Cannot create textures or starfield effects programmatically

## Proposed Solutions

### Solution A: Signed TRANSLATE (Breaking Change)

Change `scaleValue()` to map 0-63 to signed range:

```typescript
private scaleValue(value: number): number {
  const normalized = (value - 32) / 32;  // -1 to +1
  return normalized * (this.renderer.width / 2);
}
```

- 0-31 = negative (left/up)
- 32 = zero
- 33-63 = positive (right/down)

**Requires**: Update all existing genome files

### Solution B: Add New Opcodes (Non-Breaking)

1. `SETPOS` - absolute positioning, maps to `setPosition()`
2. `NOISE` - add to enum, map unused codon
3. `NEG` - negate top of stack for signed math

**Candidate codons for new opcodes**:

- Need to identify unused or low-value codons
- Could repurpose some NOP synonyms

### Solution C: Hybrid Approach

- Keep existing TRANSLATE behavior
- Add `TRANSLATE2` with signed values
- Add SETPOS and NOISE

## Files to Modify

1. `src/types/vm.ts` - Add new opcodes to enum
2. `src/types/genetics.ts` - Map codons to new opcodes
3. `src/core/vm.ts` - Implement opcode execution
4. `docs/OPCODES.md` - Document new opcodes
5. All `.genome` files if breaking change chosen

## Related Issues

- geometricMosaic cannot create proper square grid (needs RECT + positioning)
- starfield would benefit from NOISE for texture
- Many examples are limited by positive-only translation
