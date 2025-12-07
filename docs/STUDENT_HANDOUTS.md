# CodonCanvas Student Handouts 🧬

> **Ready-to-print reference materials and worksheets for classroom use**

---

## Handout 1: Codon Chart Reference

**Print:** 1-sided, color or B&W, laminate for durability

```
╔═══════════════════════════════════════════════════════════════╗
║               CODONCANVAS INSTRUCTION REFERENCE               ║
║                      Quick Reference Card                     ║
╚═══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│ CONTROL FLOW                                                │
├─────────────────────────────────────────────────────────────┤
│ ATG             START      Begin program execution          │
│ TAA / TAG / TGA STOP       End program execution            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ DRAWING PRIMITIVES (pop values from stack)                 │
├─────────────────────────────────────────────────────────────┤
│ GGA / GGC       CIRCLE     Draw circle [radius]             │
│ GGG / GGT                  (4 synonymous codons)            │
│                                                              │
│ CCA / CCC       RECT       Draw rectangle [width, height]   │
│ CCG / CCT                  (4 synonymous codons)            │
│                                                              │
│ AAA / AAC       LINE       Draw line [length]               │
│ AAG / AAT                  (4 synonymous codons)            │
│                                                              │
│ GCA / GCC       TRIANGLE   Draw triangle [size]             │
│ GCG / GCT                  (4 synonymous codons)            │
│                                                              │
│ GTA / GTC       ELLIPSE    Draw ellipse [radiusX, radiusY]  │
│ GTG / GTT                  (4 synonymous codons)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TRANSFORMS (pop values from stack)                         │
├─────────────────────────────────────────────────────────────┤
│ ACA / ACC       TRANSLATE  Move position [dx, dy]           │
│ ACG / ACT                  (4 synonymous codons)            │
│                                                              │
│ AGA / AGC       ROTATE     Rotate direction [degrees]       │
│ AGG / AGT                  (4 synonymous codons)            │
│                                                              │
│ CGA / CGC       SCALE      Scale drawings [factor]          │
│ CGG / CGT                  (4 synonymous codons)            │
│                                                              │
│ TTA / TTC       COLOR      Set color [hue, sat, light]      │
│ TTG / TTT                  (4 synonymous codons)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ STACK OPERATIONS                                            │
├─────────────────────────────────────────────────────────────┤
│ GAA / GAC       PUSH       Push number to stack             │
│ GAG / GAT                  (next codon = number 0-63)       │
│                                                              │
│ ATA / ATC / ATT DUP        Duplicate top value [a] → [a,a]  │
│                                                              │
│ TAC / TAT / TGC POP        Remove top value [a] → []        │
│                                                              │
│ TGG / TGT       SWAP       Swap top two [a,b] → [b,a]       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ UTILITY & ADVANCED                                          │
├─────────────────────────────────────────────────────────────┤
│ CAA / CAC       NOP        No operation (spacer)            │
│ CAG / CAT                                                    │
│                                                              │
│ CTA / CTC       NOISE      Add texture [seed, intensity]    │
│ CTG / CTT                                                    │
│                                                              │
│ TCA / TCC       SAVE_STATE Save drawing state               │
│ TCG / TCT                                                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ NUMERIC LITERALS (Base-4 Encoding)                         │
├─────────────────────────────────────────────────────────────┤
│ After PUSH, next codon = number from 0 to 63               │
│                                                              │
│ Formula: value = d1 × 16 + d2 × 4 + d3                      │
│ where A=0, C=1, G=2, T=3                                    │
│                                                              │
│ Examples:                                                    │
│   AAA = 0×16 + 0×4 + 0 = 0                                  │
│   AAT = 0×16 + 0×4 + 3 = 3                                  │
│   CCC = 1×16 + 1×4 + 1 = 21                                 │
│   TTT = 3×16 + 3×4 + 3 = 63                                 │
│                                                              │
│ Canvas Scaling: pixel_value = (codon_value / 64) × 400     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EXAMPLE: Draw a Circle                                      │
├─────────────────────────────────────────────────────────────┤
│ ATG              ; START program                            │
│ GAA AAT          ; PUSH 3 (radius = 3)                      │
│ GGA              ; CIRCLE (draw it!)                        │
│ TAA              ; STOP program                             │
│                                                              │
│ Result: Small circle at center of canvas                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TIPS                                                         │
├─────────────────────────────────────────────────────────────┤
│ ✓ Always start with ATG (START)                            │
│ ✓ Always end with TAA, TAG, or TGA (STOP)                  │
│ ✓ Use semicolon ; for comments                             │
│ ✓ Codons MUST be exactly 3 letters (triplets!)             │
│ ✓ Only use bases: A, C, G, T                               │
│ ✓ Whitespace is ignored (use for readability)              │
│ ✓ Stack needs enough values for operations                 │
└─────────────────────────────────────────────────────────────┘

CodonCanvas v1.0 | https://github.com/codoncanvas/codoncanvas
```

---

## Handout 2: Mutation Classification Worksheet

**Print:** 2-sided, 1 per student

### Part A: Mutation Types Review (5 min)

**Match each mutation type to its description:**

| Type          | Description                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| 1. Silent     | \_\_\_ A. Changes codon to STOP, causing early termination                    |
| 2. Missense   | \_\_\_ B. Inserts or deletes bases (not multiple of 3), scrambling downstream |
| 3. Nonsense   | \_\_\_ C. Changes codon to synonymous variant, no effect on output            |
| 4. Frameshift | \_\_\_ D. Changes codon to different operation, altering output               |

**Answers:** 1-C, 2-D, 3-A, 4-B

---

### Part B: Classification Practice (15 min)

**For each genome pair below:**

1. Circle the mutation
2. Classify as Silent / Missense / Nonsense / Frameshift
3. Predict the visual effect

**Example:**

```
Original:  ATG GAA AAT GGA TAA
Mutated:   ATG GAA AAT GGC TAA
                       ^^^
Type: [ ] Silent  [X] Missense  [ ] Nonsense  [ ] Frameshift
Effect: Both GGA and GGC are CIRCLE opcodes, so no change (synonymous)
```

---

**Problem 1:**

```
Original:  ATG GAA CCC GAA CCC GGA TAA
Mutated:   ATG GAA CCC GAA CCC CCA TAA
                               ^^^
Type: [ ] Silent  [ ] Missense  [ ] Nonsense  [ ] Frameshift
Effect: _________________________________________________
```

---

**Problem 2:**

```
Original:  ATG GAA AAT GGA GAA AAT CCA TAA
Mutated:   ATG GAA AAT TAA GAA AAT CCA TAA
                       ^^^
Type: [ ] Silent  [ ] Missense  [ ] Nonsense  [ ] Frameshift
Effect: _________________________________________________
```

---

**Problem 3:**

```
Original:  ATG GAA AGG GGA TAA
Mutated:   ATG GA AAG GGG ATA A
               ^^
Type: [ ] Silent  [ ] Missense  [ ] Nonsense  [ ] Frameshift
Effect: _________________________________________________
```

---

**Problem 4:**

```
Original:  ATG GAA CCC CCA TAA
Mutated:   ATG GAA CCC CCG TAA
                       ^^^
Type: [ ] Silent  [ ] Missense  [ ] Nonsense  [ ] Frameshift
Effect: _________________________________________________
```

---

**Problem 5:**

```
Original:  ATG GAA AAT GAA AAT ACA GAA AGG GGA TAA
Mutated:   ATG GAA AAT GAA AAT ACA GAA AGG GCA TAA
                                            ^^^
Type: [ ] Silent  [ ] Missense  [ ] Nonsense  [ ] Frameshift
Effect: _________________________________________________
```

---

### Part C: Reflection Questions (10 min)

1. **Which mutation type is most harmful? Why?**

   ---

2. **Why do you think genetic code has synonymous codons (redundancy)?**

   ---

3. **If you were "mutating" a classmate's genome, which type would you choose to
   minimize damage?**

   ---

4. **Real-world connection: Sickle cell anemia is caused by a single base change
   (GAG → GTG). What type of mutation is this?**

   [ ] Silent\
   [ ] Missense\
   [ ] Nonsense\
   [ ] Frameshift

---

### Answer Key (For Educators)

**Part B:**

1. **Missense** - GGA (CIRCLE) → CCA (RECT), shape changes from circle to
   rectangle
2. **Nonsense** - GGA → TAA (STOP), program terminates early, second shape
   (RECT) disappears
3. **Frameshift** - Delete 'A' shifts reading frame, all downstream codons
   scrambled: `GAA AGG` → `GA AAG`, `GGA` → `GGG`, `TAA` → `ATA A`
4. **Silent** - CCA → CCG, both are RECT opcode, no visual change
5. **Missense** - GGA (CIRCLE) → GCA (TRIANGLE), circle becomes triangle at end

**Part C:**

1. Frameshift (affects ALL downstream codons, not just one)
2. Redundancy reduces harm from point mutations (biological error tolerance)
3. Silent (no effect) or late-stage missense (only affects end)
4. Missense (changes amino acid: glutamic acid → valine)

---

## Handout 3: Base-4 Number Encoding Guide

**Print:** 1-sided, use as reference during coding

### What is Base-4?

Normal numbers (base-10) use digits 0-9. Base-4 uses only **4 digits: 0, 1, 2,
3**

In CodonCanvas:

- **A = 0**
- **C = 1**
- **G = 2**
- **T = 3**

### How to Calculate

**Formula:** `value = d1 × 16 + d2 × 4 + d3`

**Example: CCC**

- C = 1, C = 1, C = 1
- 1×16 + 1×4 + 1 = 16 + 4 + 1 = **21**

---

### Conversion Table (0-63)

| Codon | Value | Pixels\* | Codon | Value | Pixels\* |
| ----- | ----- | -------- | ----- | ----- | -------- |
| AAA   | 0     | 0        | CAA   | 16    | 100      |
| AAC   | 1     | 6        | CAC   | 17    | 106      |
| AAG   | 2     | 13       | CAG   | 18    | 113      |
| AAT   | 3     | 19       | CAT   | 19    | 119      |
| ACA   | 4     | 25       | CCA   | 20    | 125      |
| ACC   | 5     | 31       | CCC   | 21    | 131      |
| ACG   | 6     | 38       | CCG   | 22    | 138      |
| ACT   | 7     | 44       | CCT   | 23    | 144      |
| AGA   | 8     | 50       | CGA   | 24    | 150      |
| AGC   | 9     | 56       | CGC   | 25    | 156      |
| AGG   | 10    | 63       | CGG   | 26    | 163      |
| AGT   | 11    | 69       | CGT   | 27    | 169      |
| ATA   | 12    | 75       | CTA   | 28    | 175      |
| ATC   | 13    | 81       | CTC   | 29    | 181      |
| ATG   | 14    | 88       | CTG   | 30    | 188      |
| ATT   | 15    | 94       | CTT   | 31    | 194      |

| Codon | Value | Pixels\* | Codon | Value | Pixels\* |
| ----- | ----- | -------- | ----- | ----- | -------- |
| GAA   | 32    | 200      | TAA   | 48    | 300      |
| GAC   | 33    | 206      | TAC   | 49    | 306      |
| GAG   | 34    | 213      | TAG   | 50    | 313      |
| GAT   | 35    | 219      | TAT   | 51    | 319      |
| GCA   | 36    | 225      | TCA   | 52    | 325      |
| GCC   | 37    | 231      | TCC   | 53    | 331      |
| GCG   | 38    | 238      | TCG   | 54    | 338      |
| GCT   | 39    | 244      | TCT   | 55    | 344      |
| GGA   | 40    | 250      | TGA   | 56    | 350      |
| GGC   | 41    | 256      | TGC   | 57    | 356      |
| GGG   | 42    | 263      | TGG   | 58    | 363      |
| GGT   | 43    | 269      | TGT   | 59    | 369      |
| GTA   | 44    | 275      | TTA   | 60    | 375      |
| GTC   | 45    | 281      | TTC   | 61    | 381      |
| GTG   | 46    | 288      | TTG   | 62    | 388      |
| GTT   | 47    | 294      | TTT   | 63    | 394      |

\*Pixels = (value / 64) × 400 (for 400×400 canvas)

---

### Practice Problems

**Convert these codons to numbers:**

1. `AAT` = \_\_\_\_\_\_\_
2. `CCC` = \_\_\_\_\_\_\_
3. `GAA` = \_\_\_\_\_\_\_
4. `TTT` = \_\_\_\_\_\_\_

**Convert these numbers to codons:**

5. 10 = \_\_\_\_\_\_\_
6. 25 = \_\_\_\_\_\_\_
7. 50 = \_\_\_\_\_\_\_

**Answers:** 1) 3, 2) 21, 3) 32, 4) 63, 5) AGG, 6) CGC, 7) TAG

---

## Handout 4: Quick Start Guide

**Print:** 1-sided, use for first-time students

### Step 1: Open CodonCanvas

Go to: `[YOUR DEPLOYMENT URL]`

You should see:

- Editor panel (left)
- Canvas panel (right)
- Toolbar with ▶ Run button

---

### Step 2: Write Your First Program

**In the editor, type:**

```dna
ATG GAA AAT GGA TAA
```

**What each part means:**

- `ATG` - "Start here!"
- `GAA AAT` - "Remember the number 3"
- `GGA` - "Draw a circle"
- `TAA` - "All done!"

---

### Step 3: Run It!

Click the **▶ Run** button (or press Ctrl+Enter)

You should see a small circle appear on the canvas!

---

### Step 4: Experiment

**Try changing `AAT` to different codons:**

| Change to | Result                     |
| --------- | -------------------------- |
| `AAA`     | Tiny circle (value = 0)    |
| `AGG`     | Medium circle (value = 10) |
| `CCC`     | Bigger circle (value = 21) |
| `TTT`     | Huge circle (value = 63)   |

---

### Step 5: Add Color

**Modify your program:**

```dna
ATG
  TTA CCC CCC AAA  ; Set color (red)
  GAA AAT           ; Push 3
  GGA               ; Draw circle
TAA
```

**Explanation:**

- `TTA CCC CCC AAA` sets color to red (hue=21, sat=21, light=0)
- Lines starting with `;` are comments (ignored)

---

### Step 6: Load an Example

1. Click **"Load Example..."** dropdown
2. Choose "Hello Circle"
3. Explore the code
4. Try modifying it!

---

### Common Mistakes

❌ **Forgot START:** Program won't run ✅ **Always begin with `ATG`**

❌ **Forgot STOP:** Program hangs ✅ **Always end with `TAA`, `TAG`, or `TGA`**

❌ **Typo in codon:** `AT G` (has space) ✅ **Codons must be exactly 3
letters:** `ATG`

❌ **Not enough numbers on stack:** RECT needs 2 values (width, height) ✅
**Check linter for "Stack underflow" errors**

---

### Next Steps

- Try Example 2 (Two Shapes)
- Experiment with mutations
- Create your own design!

---

## Handout 5: Debugging Checklist

**Print:** 1-sided, laminate and post in classroom

```
┌─────────────────────────────────────────────────────────────┐
│                   DEBUGGING CHECKLIST                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ WHEN YOUR CODE DOESN'T WORK:                                │
│                                                             │
│ Step 1: READ THE LINTER                                     │
│ └─ Look at the panel below the editor                       │
│ └─ Red = error (must fix)                                   │
│ └─ Yellow = warning (should fix)                            │
│                                                             │
│ Step 2: CHECK THE BASICS                                    │
│ ☐ Does it start with ATG?                                  │
│ ☐ Does it end with TAA, TAG, or TGA?                       │
│ ☐ Are all bases valid? (Only A, C, G, T allowed)           │
│ ☐ Is length divisible by 3? (Count all letters)            │
│                                                             │
│ Step 3: CHECK THE STACK                                     │
│ ☐ Does CIRCLE have 1 value before it?                      │
│    (PUSH one number first)                                  │
│ ☐ Does RECT have 2 values?                                 │
│    (PUSH width, PUSH height, then RECT)                     │
│ ☐ Does TRANSLATE have 2 values?                            │
│    (PUSH dx, PUSH dy, then TRANSLATE)                       │
│                                                             │
│ Step 4: SIMPLIFY                                            │
│ └─ Comment out half the code (add ; at start of lines)      │
│ └─ Which half causes the error?                             │
│ └─ Keep narrowing until you find the problem codon          │
│                                                             │
│ Step 5: ASK FOR HELP                                        │
│ └─ Show your teacher:                                       │
│    • What you're trying to do                               │
│    • What's happening instead                               │
│    • What the linter says                                   │
│                                                             │
│ STILL STUCK?                                                │
│ └─ Click "Clear Canvas" and try a fresh start               │
│ └─ Load a working example and modify it gradually           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Handout 6: Project Rubric (Student View)

**Print:** 1-sided, distribute with project assignment

### Creative Composition Project

**Goal:** Create an original visual artwork using CodonCanvas

**Requirements:**

- ☐ Program runs without errors
- ☐ Uses at least 5 different opcodes
- ☐ Contains at least 20 codons (not counting START/STOP)
- ☐ Includes comments explaining your code
- ☐ Produces a creative/original visual output

---

### How You'll Be Graded

| Criterion             | What This Means                                   | Points  |
| --------------------- | ------------------------------------------------- | ------- |
| **Does It Work?**     | Program runs and shows what you intended          | 30      |
| **Is It Complex?**    | Uses 5+ opcodes appropriately (not just repeated) | 25      |
| **Is It Creative?**   | Original idea, interesting to look at             | 20      |
| **Is It Documented?** | Comments explain what each section does           | 15      |
| **Is It Clean?**      | No linter errors, efficient code                  | 10      |
| **TOTAL**             |                                                   | **100** |

---

### Tips for Success

✅ **Plan First**: Sketch on paper before coding ✅ **Build Gradually**: Add one
shape at a time, test frequently ✅ **Comment As You Go**: Don't wait until the
end ✅ **Use Examples**: Look at built-in examples for inspiration ✅ **Ask
Questions**: Better to ask than stay stuck!

---

### Submission

1. Click **💾 Save .genome** button
2. Save file as `YourName_Project.genome`
3. Submit to [LMS/email/folder]
4. **Optional**: Export PNG for visual portfolio

**Due Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Usage Notes for Educators

**Printing Recommendations:**

- **Codon Chart**: Color preferred (helps distinguish opcode families), laminate
  for reuse
- **Worksheets**: B&W acceptable, single-sided for note-taking space
- **Conversion Table**: Color optional, consider posting one large version in
  classroom
- **Quick Start**: B&W acceptable, give to all students on Day 1

**Differentiation:**

- **Struggling**: Provide partially completed programs to finish
- **Advanced**: Challenge to use NOISE, SAVE_STATE, or minimize codon count
- **ELL Students**: Add visual icons to codon chart, pair with native speaker

**Digital Alternatives:**

- Share as PDFs in LMS
- Create Google Doc versions for collaborative annotation
- Use digital whiteboard for whole-class mutation practice

---

**📄 End of Student Handouts**
