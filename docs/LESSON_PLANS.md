# CodonCanvas Lesson Plans

**Version:** 1.0.0
**Target Audience:** Secondary/tertiary biology students (ages 15+)
**Total Duration:** 3 × 60-minute sessions
**Prerequisites:** Basic biology (DNA, genes, mutations) and willingness to experiment

---

## Overview

This lesson sequence introduces genetic concepts through creative coding. Students write DNA-like programs (genomes) that produce visual outputs, then observe how different mutation types alter results. The three-lesson arc builds from basic shapes to complex compositions while reinforcing genetic literacy.

**Learning Arc:**

- **Lesson 1:** Foundation - syntax, codon families, silent mutations
- **Lesson 2:** Mutation types - missense, nonsense, frameshift effects
- **Lesson 3:** Application - composition, creativity, biological parallels

**Pedagogical Philosophy:**

- **Hands-on:** Students code from minute 5
- **Visual feedback:** Immediate phenotype changes reinforce concepts
- **Low barrier:** No prior programming required
- **High ceiling:** Advanced students can create complex artworks

**🎯 Teaching Resources:**

- **[Interactive Mutation Demos](demos.html)** - Visual before/after comparisons of all 4 mutation types (silent, missense, nonsense, frameshift). Perfect for projecting during Lesson 2! ⭐ **RECOMMENDED**
- **[Student Worksheets](worksheets/)** - Structured exercises for all 3 lessons
- **[Assessment Framework](ASSESSMENTS.md)** - Pre/post tests and rubrics

---

## Lesson Sequence Summary

| Lesson | Title              | Core Concept                  | Key Activity                                  | Assessment                                  |
| ------ | ------------------ | ----------------------------- | --------------------------------------------- | ------------------------------------------- |
| 1      | Hello DNA          | Codon families & redundancy   | Create first genome, explore silent mutations | Predict synonymous codon outcomes           |
| 2      | Mutation Gallery   | Mutation type classification  | Systematic mutation exploration               | Identify mutation types from visual changes |
| 3      | Genome Composition | Complex patterns & creativity | Design multi-shape composition                | Create "evolved" artwork with explanation   |

---

## Lesson 1: Hello DNA - Your First Genome

**Duration:** 60 minutes
**Learning Objectives:**

- Write and execute a valid CodonCanvas genome
- Understand codon families and synonymous codons
- Predict effects of silent mutations
- Navigate the CodonCanvas interface

### Lesson 1 Structure

#### Part 1: Introduction (10 min)

**Instructor Script:**

> "Today we're learning to program using DNA-like code. Just like DNA uses triplets (codons) to encode instructions, CodonCanvas uses three-letter codes to create drawings. We'll discover how genetic redundancy works by seeing it in action."

**Demo:** Show `01_hello_circle.ccd` running live

```
ATG GAA CCC GGA TAA
```

**Key Points:**

- ATG = START (like real biology)
- TAA = STOP (like real stop codons)
- GAA CCC = "Push number 21 onto stack"
- GGA = "Draw circle with that radius"

**Student Action:** Open CodonCanvas in browser, observe live preview

---

#### Part 2: Guided Exploration (15 min)

**Activity:** "Create Your First Shape"

**Step 1:** Type the hello circle genome

```
ATG GAA CCC GGA TAA
```

✅ **Check:** Students see a circle appear

**Step 2:** Change GGA → GGC

```
ATG GAA CCC GGC TAA
```

**Ask:** "What changed?" (Answer: Nothing! Silent mutation)

**Step 3:** Change GGA → GGT → GGG
**Observe:** All four GG\* codons produce identical circles

**Concept Introduction:** "These four codons are a FAMILY - they all mean CIRCLE. This is like how multiple DNA codons can code for the same amino acid!"

---

#### Part 3: Codon Family Exploration (15 min)

**Activity:** "Shape Shifter"

**Challenge 1:** Change GGA → CCA (CIRCLE → RECT)
**Expected:** Circle becomes rectangle (but needs 2 numbers!)

**Fix:** Add second number

```
ATG GAA CCC GAA CCC CCA TAA
```

**Result:** Square appears

**Challenge 2:** Explore CC\* family (CCA, CCC, CCG, CCT)
**Observation:** All produce same rectangle (silent mutations)

**Challenge 3:** Try AA\* family (LINE)

```
ATG GAA CCC AAA TAA
```

**Concept Reinforcement:** "Each shape family has 4 synonymous codons. Why might biology use this redundancy?" (Error tolerance, wobble base pairing)

---

#### Part 4: Creative Experimentation (15 min)

**Activity:** "Two-Shape Composition"

**Worksheet Exercise 1.1:** Create a genome with:

- One circle
- One rectangle
- Use TRANSLATE to position them apart

**Hint:** Use ACA for TRANSLATE (needs dx, dy)

**Example Solution:**

```
ATG
  GAA CCC GGA           ; Circle radius 21
  GAA CCC GAA AAA ACA   ; Translate (21, 0)
  GAA CCC GAA CCC CCA   ; Rectangle 21×21
TAA
```

**Extension:** Try rotating with AGA (ROTATE family)

---

#### Part 5: Assessment & Reflection (5 min)

**Quick Quiz (Verbal):**

1. "If I change GGA to GGG, what happens?" (Nothing - same family)
2. "If I change GGA to CCA, what happens?" (Different shape)
3. "Why are codon families useful?" (Redundancy = error tolerance)

**Homework Preview:** "Next class: What happens when mutations AREN'T silent?"

---

## Lesson 2: Mutation Gallery - When Codons Change

**Duration:** 60 minutes
**Learning Objectives:**

- Classify mutations as silent, missense, nonsense, frameshift
- Predict visual outcomes from mutation type
- Connect visual phenotypes to biological concepts
- Use mutation tools systematically

### Lesson 2 Structure

#### Part 1: Review & Hook (5 min)

**Quick Review:**

- "Who can name a codon family?" (GG\*, CC\*, AA\*)
- "What's a silent mutation?" (Same family, same output)

**Today's Question:** "What if mutations AREN'T silent?"

**Demo:** Show `10_mutation_gallery.ccd` with missense mutation

```
; Original
ATG GAA CCC GGA TAA  → Circle

; Mutated (GGA → CCA)
ATG GAA CCC CCA TAA  → Rectangle (wrong # args → error?)
```

---

#### Part 2: Missense Mutations (15 min)

**Concept:** "Missense = different instruction, still functional"

**Activity:** "Shape Metamorphosis"

**Start Genome:**

```
ATG GAA AGG GGA TAA  ; Circle radius 10
```

**Systematic Mutations:**

1. GGA → GCA (CIRCLE → TRIANGLE)
   - **Result:** Circle becomes triangle
   - **Biology Parallel:** Different shape, still draws

2. GGA → GTA (CIRCLE → ELLIPSE, needs 2 args)
   - **Result:** May error (stack underflow)
   - **Biology Parallel:** Non-functional protein

**Worksheet Exercise 2.1:** Classify each mutation outcome

- Functional missense: Different shape appears
- Non-functional missense: Error or unexpected output

---

#### Part 3: Nonsense Mutations (10 min)

**Concept:** "Nonsense = early STOP, truncated output"

**Activity:** "The Disappearing Act"

**Start Genome:**

```
ATG
  GAA CCC GGA        ; Circle
  GAA CCC GAA AAA ACA  ; Translate
  GAA CCC GGA        ; Another circle
TAA
```

**Mutation:** Change middle GGA → TAA

```
ATG
  GAA CCC GGA        ; Circle
  GAA CCC GAA AAA TAA  ; EARLY STOP!
  GAA CCC GGA        ; Never executed
TAA
```

**Result:** Only first circle appears

**Discussion:** "In biology, nonsense mutations truncate proteins. What might this mean for function?"

---

#### Part 4: Frameshift Mutations (20 min)

**Concept:** "Frameshift = reading frame disrupted, everything downstream scrambled"

**Activity:** "The Chaos Mutation"

**Start Genome:**

```
ATG GAA CCC GGA GAA CCC CCA TAA
; Codons: ATG|GAA|CCC|GGA|GAA|CCC|CCA|TAA
```

**Frameshift:** Delete one 'A' after ATG

```
ATG GAA CCC GGA GAA CCC CCA TAA
; Codons: ATG|GAA|CCC|GGA|GAA|CCC|CAT|AA?
; Wait, now: ATG|GGA|ACC|CGG|AGA|ACC|CCC|ATA|A
```

**Corrected Frameshift:**

```
ATG GAACCC GGA GAA CCC CCA TAA
; Remove space: ATGGAACCCGGAGAACCCCCTAA
; New frame: ATG|GAA|CCC|GGA|GAA|CCC|CCT|AA
```

Actually, let me demonstrate correctly:

**Proper Frameshift Demo:**

```
Original: ATG AAA GGA TAA (3 codons read correctly)
Delete 'A': ATG AAG GAT AA? (frame shifts, new codons)
Insert 'G': ATG GAA AGG ATA A?? (frame shifts differently)
```

**Worksheet Exercise 2.2:** Given a genome, predict frameshift outcome

---

#### Part 5: Mutation Classification Challenge (10 min)

**Activity:** "Mutation Detective"

**Given:** Starting genome + mutated genome + visual outputs

**Task:** Identify mutation type (silent, missense, nonsense, frameshift)

**Example Set:**

1. Output identical → Silent
2. Shape changed → Missense
3. Partial output → Nonsense
4. Complete chaos → Frameshift

**Worksheet Exercise 2.3:** 8 mutation classification problems

---

## Lesson 3: Genome Composition - Creative Evolution

**Duration:** 60 minutes
**Learning Objectives:**

- Design multi-component visual compositions
- Apply transform operations (translate, rotate, scale)
- Create intentional mutations for "evolution"
- Connect creative process to biological variation

### Lesson 3 Structure

#### Part 1: Transform Operations (15 min)

**Concept:** "Position, rotation, and scale control WHERE and HOW shapes appear"

**Activity:** "Transform Playground"

**Demo 1: TRANSLATE (ACA family)**

```
ATG
  GAA AAT GGA        ; Small circle
  GAA CCC GAA AAA ACA  ; Move right
  GAA AAT GGA        ; Another circle
TAA
```

**Demo 2: ROTATE (AGA family)**

```
ATG
  GAA CCC AAA        ; Line length 21
  GAA CGC AGA        ; Rotate 50 degrees
  GAA CCC AAA        ; Another line (rotated)
TAA
```

**Demo 3: SCALE (CGA family)**

```
ATG
  GAA CCC GGA        ; Circle
  GAA AGG CGA        ; Scale by 2×
  GAA CCC GGA        ; Bigger circle
TAA
```

**Worksheet Exercise 3.1:** Create pattern using transforms

---

#### Part 2: Composition Design (25 min)

**Activity:** "Geometric Garden"

**Challenge:** Create a composition with:

- Minimum 3 different shapes
- Use at least 2 transform operations
- Intentional color variation (TTA family for COLOR)

**Example Approach:**

```
ATG
  ; Flower center
  GAA AGG GGA

  ; Petals (rotate and draw)
  GAA TTT GAA AAA GAA AAA TTA  ; Color (red-ish)
  GAA AAT GAA ATT ACA          ; Translate
  GAA AAT GCA                  ; Small triangle

  ; Repeat with rotation...
TAA
```

**Student Work Time:** 20 minutes to design

**Gallery Walk:** Share screens, observe variations

---

#### Part 3: "Evolution" Challenge (15 min)

**Activity:** "Evolve Your Genome"

**Task:**

1. Start with your composition
2. Make 3 intentional mutations (document type)
3. Observe how "phenotype" changes
4. Select "fittest" variant (most interesting)

**Reflection Questions:**

- Which mutation type had biggest effect? (Likely frameshift)
- Which mutation type was safest? (Likely silent)
- How does this relate to biological evolution?

**Worksheet Exercise 3.2:** Document evolution process

---

#### Part 4: Final Showcase & Assessment (5 min)

**Activity:** "Genome Gallery"

Students export their final genomes and share

**Discussion:**

- "What did you learn about genetic redundancy?"
- "Why might organisms have 'silent' mutations?"
- "How do frameshift mutations relate to reading frames in DNA?"

---

## Assessment Framework

### Formative Assessment (During Lessons)

- **Lesson 1:** Can student create valid genome and predict silent mutations?
- **Lesson 2:** Can student classify mutation types from visual outputs?
- **Lesson 3:** Can student use transforms and document mutations?

### Summative Assessment (Post-Lesson 3)

See `ASSESSMENTS.md` for:

- Pre/post quiz (10 questions)
- Mutation identification challenge (5 problems)
- Creative composition rubric
- Learning objectives checklist

---

## Instructor Resources

### Common Student Issues

**Issue 1: "My genome doesn't run"**

- **Cause:** Missing START or STOP
- **Fix:** Check for ATG at beginning, TAA/TAG/TGA at end

**Issue 2: "Stack underflow error"**

- **Cause:** Shape needs more numbers than provided
- **Fix:** RECT needs 2 numbers (width, height), ELLIPSE needs 2 (rx, ry)

**Issue 3: "I changed a codon but nothing happened"**

- **Cause:** Likely silent mutation (same family)
- **Opportunity:** "Excellent! You found redundancy!"

**Issue 4: "Frameshift is confusing"**

- **Cause:** Abstract concept
- **Fix:** Use physical demo - have students hold cards with bases, physically shift reading

### Timing Flexibility

**If Running Short:**

- Lesson 1: Skip rotation demo, focus on shapes only
- Lesson 2: Do 2 mutation types instead of 4
- Lesson 3: Simplify composition requirements

**If Students Ahead:**

- Introduce NOISE opcode for texture
- Explore SAVE_STATE for nested transforms
- Challenge: Create specific target image

### Differentiation Strategies

**For Struggling Students:**

- Provide partially complete genomes to modify
- Partner with peer mentor
- Focus on 2 shape families instead of all
- Use visual codon chart reference

**For Advanced Students:**

- Challenge: Create specific biological structure (flower, cell)
- Explore NOISE and SAVE_STATE opcodes
- Create tutorial genome for peers
- Research how real genetic code differs

---

## Materials Checklist

### Required

- [ ] Computer/laptop per student with browser
- [ ] CodonCanvas web application (index.html)
- [ ] Codon reference chart (printed or screen)
- [ ] Student worksheets (3 total)

### Optional

- [ ] Projector for demos
- [ ] Physical codon cards for frameshift demo
- [ ] Example genomes loaded in gallery

---

## Alignment with Learning Standards

**NGSS (Next Generation Science Standards):**

- HS-LS3-1: Understand role of DNA and chromosomes in heredity
- HS-LS3-2: Make predictions about genetic traits
- HS-LS4-1: Communicate information about mutations and variation

**Common Core:**

- CCSS.ELA-LITERACY.RST.11-12.7: Translate information across formats

**21st Century Skills:**

- Computational thinking
- Problem solving
- Creative expression
- Pattern recognition

---

## Lesson Plan Version History

**v1.0.0 (2025-10-12):**

- Initial three-lesson sequence created
- Aligned with MVP spec learning objectives
- Designed for 60-minute class periods
- Includes formative and summative assessments

---

**For Additional Resources:**

- Student worksheets: See `worksheets/lesson_*.md`
- Assessment tools: See `ASSESSMENTS.md`
- Educator background: See `EDUCATORS.md`
- Example genomes: See `examples/` directory
