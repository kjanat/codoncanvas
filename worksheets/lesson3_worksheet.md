# Lesson 3 Student Worksheet: Genome Composition

**Name:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_

**Learning Objectives:**

- Design multi-component visual compositions
- Apply transform operations effectively
- Create intentional mutations for evolution
- Express creativity through genome design

---

## Part 1: Transform Operations Review (15 min)

### Exercise 3.1: TRANSLATE

**ACA family** moves the drawing position (dx, dy)

**Test genome:**

```
ATG
  GAA AAT GGA        ; Small circle at center
  GAA CCC GAA AAA ACA  ; Translate (21, 0) - move right
  GAA AAT GGA        ; Another small circle
TAA
```

**Sketch the result:**

[Draw two circles here]

**Now modify:** Change `GAA AAA` (dx=0) to `GAA AAA` (dy value)

Try moving in different directions:

- Right: dx = positive, dy = 0
- Left: dx = negative (need to encode negative... tricky!)
- Down: dx = 0, dy = positive
- Up: dx = 0, dy = negative

---

### Exercise 3.2: ROTATE

**AGA family** rotates the drawing direction (degrees)

**Test genome:**

```
ATG
  GAA CCC AAA        ; Draw line length 21
  GAA CGC AGA        ; Rotate 50 degrees
  GAA CCC AAA        ; Draw another line
  GAA CGC AGA        ; Rotate again
  GAA CCC AAA        ; Draw third line
TAA
```

**Sketch result:**

[Draw three rotated lines here]

**Experiment:** Try different rotation amounts

- `GAA CGC` = 50 degrees
- `GAA TTT` = 63 degrees (maximum with base-4 encoding)
- `GAA AAA` = 0 degrees (no rotation)

---

### Exercise 3.3: SCALE

**CGA family** changes the size of subsequent shapes

**Test genome:**

```
ATG
  GAA AAT GGA        ; Small circle
  GAA AGG CGA        ; Scale by 2 (approx)
  GAA AAT GGA        ; Bigger circle
TAA
```

**Try scaling progressively:**

```
ATG
  GAA AAT GGA
  GAA AAG CGA  ; Small scale increase
  GAA AAT GGA
  GAA AAG CGA  ; Another increase
  GAA AAT GGA
TAA
```

---

### Exercise 3.4: COLOR

**TTA family** changes the drawing color (hue, saturation, lightness)

**Test genome:**

```
ATG
  GAA TTT GAA AAA GAA AGG TTA  ; Red-ish color
  GAA CCC GGA                   ; Red circle
  GAA AAA GAA TTT GAA AGG TTA  ; Blue-ish color
  GAA CCC GGA                   ; Blue circle
TAA
```

**Note:** Color needs 3 values (H, S, L):

- Hue: 0-360 degrees (red, orange, yellow, green, blue, purple)
- Saturation: 0-100%
- Lightness: 0-100%

With base-4 encoding (0-63), you're working with scaled values!

---

## Part 2: Composition Design (25 min)

### Exercise 3.5: Geometric Garden

**Challenge:** Create a composition with AT LEAST:

- ☐ 3 different shape types
- ☐ 2 or more uses of TRANSLATE
- ☐ 1 use of ROTATE or SCALE
- ☐ Visual balance and intentionality

**Planning space:** Sketch your design first!

[Sketch your composition idea here]

**List your shapes and their positions:**

1. \_\_\_\_\_\_\_\_\_\_\_\_\_ at position (\_\_\_\_\_, \_\_\_\_\_)
2. \_\_\_\_\_\_\_\_\_\_\_\_\_ at position (\_\_\_\_\_, \_\_\_\_\_)
3. \_\_\_\_\_\_\_\_\_\_\_\_\_ at position (\_\_\_\_\_, \_\_\_\_\_)

---

**Your genome:**

```
ATG










TAA
```

**Title for your artwork:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Description (what were you trying to create?):**

---

---

---

---

### Exercise 3.6: Pattern Creation

**Challenge:** Create a REPEATING pattern using rotation

**Strategy:** Draw shape → Rotate → Draw shape → Rotate → Repeat

**Example approach (flower petals):**

```
ATG
  ; Petal 1
  GAA AAT GCA        ; Small triangle
  GAA CCC AGA        ; Rotate 21 degrees

  ; Petal 2
  GAA AAT GCA
  GAA CCC AGA

  ; Petal 3
  GAA AAT GCA
  GAA CCC AGA

  ; Center
  GAA AAG GGA        ; Small circle
TAA
```

**Create your own pattern:**

```
ATG










TAA
```

**Pattern name:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Part 3: Evolution Challenge (15 min)

### Exercise 3.7: Intentional Evolution

Take your composition from Exercise 3.5 and "evolve" it through mutations.

**Original genome (copy from 3.5):**

```
ATG




TAA
```

**Mutation 1 (Silent):**
Change: \_\_\_\_\_\_\_ → \_\_\_\_\_\_\_

**Predicted effect:** No change (same family)

**Actual result:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

**Mutation 2 (Missense):**
Change: \_\_\_\_\_\_\_ → \_\_\_\_\_\_\_

**Predicted effect:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Actual result:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

**Mutation 3 (Your Choice):**
Change: \_\_\_\_\_\_\_ → \_\_\_\_\_\_\_

**Mutation type:** ☐ Silent ☐ Missense ☐ Nonsense ☐ Frameshift

**Predicted effect:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Actual result:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### Exercise 3.8: Selection & Fitness

**Which variant do you like best?**
☐ Original ☐ Mutation 1 ☐ Mutation 2 ☐ Mutation 3

**Why is it "fittest"?** (Most interesting, balanced, beautiful?)

---

---

**Biological parallel:** In evolution, "fitness" means better at surviving and reproducing. In art, "fitness" might mean more appealing or interesting. How are these similar? Different?

Similar: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

Different: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

---

## Part 4: Advanced Challenges

### Exercise 3.9: Nested Transforms (BONUS)

**SAVE_STATE** (TCA family) lets you save your current position/rotation, make changes, then restore!

**Advanced pattern:**

```
ATG
  TCA                    ; Save state
  GAA CCC GAA AAA ACA    ; Move right
  GAA AAT GGA            ; Draw circle
  ; (State automatically restores... wait, no restore opcode!)
TAA
```

**Note:** If RESTORE_STATE exists, try nested compositions!

---

### Exercise 3.10: Maximum Complexity

**Final Challenge:** Create the most complex genome you can that still looks intentional (not random).

**Requirements:**

- ☐ Minimum 5 shapes
- ☐ Uses TRANSLATE, ROTATE, and SCALE
- ☐ At least 2 colors
- ☐ Creates recognizable image or pattern

**Your masterpiece:**

```
ATG




















TAA
```

**Artwork title:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Artist statement (what does it represent?):**

---

---

---

**Estimated time to first artifact:** \_\_\_\_\_\_\_ minutes

---

## Part 5: Reflection Questions

### Question 1: Composition Process

How was designing a genome different from drawing with traditional tools?

**Advantages of genome coding:**

---

---

**Disadvantages:**

---

---

---

### Question 2: Mutation as Tool

You used mutations to "evolve" your artwork. In biology, mutations are random. How did you use mutations intentionally?

---

---

---

Could an organism "intentionally" mutate? Why or why not?

---

---

---

### Question 3: Creative Constraints

The codon system limits what you can express (only certain shapes, limited numbers, specific transforms). How did these constraints affect your creativity?

Did they make it easier or harder? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Did they make your work more or less interesting? \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Real biology parallel:** DNA can only code for 20 amino acids, yet creates incredible diversity. How is this similar to your experience?

---

---

---

---

### Question 4: Project Reflection (Across all 3 lessons)

**Most important thing you learned about genetics:**

---

---

**Most surprising thing:**

---

---

**How has your understanding of mutations changed?**
Before CodonCanvas: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

After CodonCanvas: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

---

## Bonus: Gallery Submission

**Would you like to share your work in the class gallery?** ☐ Yes ☐ No

**If yes, which genome would you showcase?**

☐ Exercise 3.5 (Geometric Garden)\
☐ Exercise 3.6 (Pattern Creation)\
☐ Exercise 3.10 (Maximum Complexity)\
☐ Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Export your genome:** Save as .ccd file and submit with this worksheet

---

## Self-Assessment

Rate yourself on these skills (1 = still learning, 5 = confident):

**Technical Skills:**

- Writing valid genomes: 1 2 3 4 5
- Using codon families: 1 2 3 4 5
- Applying transforms: 1 2 3 4 5
- Debugging errors: 1 2 3 4 5

**Conceptual Understanding:**

- Codon redundancy: 1 2 3 4 5
- Mutation types: 1 2 3 4 5
- Reading frames: 1 2 3 4 5
- Genotype vs phenotype: 1 2 3 4 5

**What would help you improve most?**

☐ More practice examples\
☐ Better codon chart reference\
☐ Video tutorials\
☐ Pair programming with peer\
☐ Other: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

**Teacher Signature:**

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Completion:**

☐ Excellent\
☐ Good\
☐ Needs Review

**Teacher Comments:**

---

---

---
