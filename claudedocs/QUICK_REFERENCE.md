# CodonCanvas Quick Reference

**1-Page Cheat Sheet for Students**

---

## Basic Genome Structure

```
ATG [instructions] TAA
 ↑                  ↑
START             STOP
```

Every genome begins with `ATG` (START) and ends with a stop codon (`TAA`, `TAG`, or `TGA`).

---

## Essential Opcodes

### Control
```
ATG  = Start execution
TAA  = Stop execution
TAG  = Stop (alternative)
TGA  = Stop (alternative)
```

### Drawing Shapes
```
GGA, GGC, GGG, GGT = CIRCLE    [radius]
CCA, CCC, CCG, CCT = RECT      [width, height]
AAA, AAC, AAG, AAT = LINE      [length]
GCA, GCC, GCG, GCT = TRIANGLE  [size]
```

### Moving & Rotating
```
ACA, ACC, ACG, ACT = TRANSLATE [dx, dy]
AGA, AGC, AGG, AGT = ROTATE    [degrees]
```

### Colors
```
TTA, TTC, TTG, TTT = COLOR [hue, saturation, lightness]
```

### Stack Operations
```
GAA, GAC, GAG, GAT = PUSH [value]  (load a number)
ATA, ATC, ATT      = DUP           (duplicate top value)
TAC, TAT, TGC      = POP           (remove top value)
```

---

## Number Encoding

Numbers are encoded as **3-letter codons** using base-4:

```
A = 0    C = 1    G = 2    T = 3
```

**Formula**: `value = d1×16 + d2×4 + d3`

**Examples**:
```
AAA = 0×16 + 0×4 + 0 = 0
CCC = 1×16 + 1×4 + 1 = 21
TTT = 3×16 + 3×4 + 3 = 63
```

**Range**: 0-63

**Screen Scale**: Values scale to canvas (e.g., 32 → 200 pixels on 400px canvas)

---

## Example Genomes

### Hello Circle
```
ATG GAA AAT GGA TAA
```
- `ATG` = START
- `GAA AAT` = PUSH 3
- `GGA` = CIRCLE (radius 3)
- `TAA` = STOP

**Output**: Small circle at center

---

### Two Shapes
```
ATG
  GAA AGG GGA              ; Circle (radius 10)
  GAA CCC GAA AAA ACA      ; Move (21, 0)
  GAA AGG GAA AGG CCA       ; Rectangle (10×10)
TAA
```

**Output**: Circle and square side-by-side

---

### Colorful Triangle
```
ATG
  TTA TTT AAA AAA          ; Color (red: hue=255)
  GAA CCC GCA              ; Triangle (size 21)
TAA
```

**Output**: Red triangle at center

---

## Mutation Types

### Silent Mutation
**Change**: `GGA` → `GGC`
**Effect**: Same opcode (both CIRCLE) → **no visual change**

### Missense Mutation
**Change**: `GGA` → `GCA`
**Effect**: Different opcode (CIRCLE → TRIANGLE) → **shape changes**

### Nonsense Mutation
**Change**: `GGA` → `TAA`
**Effect**: Drawing opcode → STOP → **output truncated**

### Frameshift Mutation
**Change**: Insert `C` after position 9
**Effect**: All downstream codons shift → **everything breaks**

---

## Common Patterns

### Stack Usage
```
PUSH value      ; Load number
CIRCLE          ; Use number (removes from stack)
```

Need 2 values? Push twice:
```
PUSH 10         ; width
PUSH 20         ; height
RECT            ; Uses both (width=10, height=20)
```

### Duplication
```
PUSH 15
DUP             ; Now have two 15s on stack
CIRCLE          ; Draws circle (radius 15)
CIRCLE          ; Draws another circle (same radius)
```

### Movement
```
CIRCLE          ; Draw at (200, 200)
PUSH 50
PUSH 0
TRANSLATE       ; Move right by 50
CIRCLE          ; Draw at (250, 200)
```

### Rotation
```
PUSH 10
LINE            ; Horizontal line (length 10)
PUSH 45
ROTATE          ; Rotate 45 degrees
PUSH 10
LINE            ; Diagonal line
```

---

## Tips & Tricks

### Use Comments
```
ATG              ; Start program
  GAA CCC GGA    ; Push 21, draw circle
TAA              ; End program
```

Comments start with `;` and go to end of line.

### Whitespace is Ignored
These are identical:
```
ATGGAAAGGGGATAA
ATG GAA AGG GGA TAA
ATG
  GAA AGG
  GGA
TAA
```

Use spacing for readability!

### Silent Mutations
Any codon in the same family works:
```
GGA = GGC = GGG = GGT  (all draw CIRCLE)
CCA = CCC = CCG = CCT  (all draw RECT)
```

Change `GGA` to `GGC` → output stays identical.

### Check Your Frame
Codons must be triplets. This is **broken**:
```
ATG GG A CCA TAA
     ↑
   Mid-triplet break!
```

Should be:
```
ATG GGA CCA TAA
```

---

## Debugging Checklist

### Program Doesn't Run
- [ ] Started with `ATG`?
- [ ] Ended with `TAA`/`TAG`/`TGA`?
- [ ] All codons are triplets (no mid-codon spaces)?
- [ ] Only A, C, G, T characters (no typos)?

### Nothing Draws
- [ ] Did you PUSH values before drawing?
- [ ] Check stack: CIRCLE needs 1 value, RECT needs 2
- [ ] Is there a STOP before your drawing opcode?

### Unexpected Output
- [ ] Use Timeline to step through execution
- [ ] Check stack contents at each step
- [ ] Verify PUSH values encode correctly (use calculator)

### Frameshift Confusion
- [ ] Count bases carefully (should be multiple of 3)
- [ ] Use comments to mark codon boundaries
- [ ] Try reading aloud: "A-T-G, G-A-A, A-G-G..."

---

## Quick Calculations

### HSL Colors
```
Hue (0-360):
  0   = Red
  60  = Yellow
  120 = Green
  180 = Cyan
  240 = Blue
  300 = Magenta

Saturation (0-100):
  0   = Gray
  50  = Muted
  100 = Vivid

Lightness (0-100):
  0   = Black
  50  = Normal
  100 = White
```

### Common Values
```
Small:   5-15   (1-3 on codon scale)
Medium:  20-40  (12-25 on codon scale)
Large:   60-100 (38-63 on codon scale)
```

### Canvas Coordinates
Default canvas: 400×400 pixels
Center: (200, 200)

```
Position Guide:
  AAA AAA = (0, 0)     top-left
  TCC AAA = (50, 0)    top-middle
  AAA TCC = (0, 50)    middle-left
  TCC TCC = (50, 50)   center
```

---

## Advanced: State Stack

Save/restore drawing state:
```
TCA, TCC, TCG, TCT = SAVE_STATE
```

**Use case**: Draw something, save state, draw elsewhere, restore original position.

Example:
```
ATG
  GAA CCC GGA          ; Circle at center
  SAVE_STATE           ; Remember this position
  PUSH 50 PUSH 0
  TRANSLATE            ; Move right
  GAA CCC GGA          ; Circle at new position
  RESTORE_STATE        ; (not implemented in MVP - placeholder)
  PUSH 0 PUSH 50
  TRANSLATE            ; Move down from original
  GAA CCC GGA          ; Circle below center
TAA
```

*Note: RESTORE_STATE planned for Phase C*

---

## Learning Path

1. **Start Simple**: `ATG GAA AAA GGA TAA` (push 0, draw tiny circle)
2. **Add Movement**: Add TRANSLATE to move shapes around
3. **Try Colors**: Use COLOR opcode with different hues
4. **Experiment**: Change single codons, observe effects
5. **Mutate**: Try silent → missense → nonsense → frameshift
6. **Compose**: Combine multiple shapes into patterns
7. **Evolve**: Use Evolution Lab to breed interesting designs

---

## Resources

- **Interactive Tutorials**: Step-by-step guided lessons
- **Example Library**: 25 genomes from simple to complex
- **Timeline Scrubber**: Debug by stepping through execution
- **Evolution Lab**: Simulate natural selection
- **Full Docs**: Technical specification and API reference

---

## Need Help?

- **Stuck?** Try Timeline mode to see each instruction
- **Error message?** Linter highlights problems (red underlines)
- **Want examples?** Browse Example Library (left panel)
- **Learning mutations?** Complete Tutorial 2 (5 minutes)

---

**CodonCanvas** • [URL] • Open Source (MIT License)

*Print this reference for easy access during coding*
