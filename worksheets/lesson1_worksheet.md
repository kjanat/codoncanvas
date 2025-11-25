# Lesson 1 Student Worksheet: Hello DNA

**Name:** ____________________ **Date:** __________

**Learning Objectives:**

- Write your first CodonCanvas genome
- Understand codon families and synonymous codons
- Predict effects of silent mutations

---

## Part 1: Your First Genome (15 min)

### Exercise 1.1: Hello Circle

Type this genome into CodonCanvas:

```
ATG GAA CCC GGA TAA
```

**What do you see?** _______________________________________________

**Explain what each codon does:**

- `ATG`: _______________________________________________________
- `GAA CCC`: ___________________________________________________
- `GGA`: _______________________________________________________
- `TAA`: _______________________________________________________

---

### Exercise 1.2: Silent Mutations

Now change `GGA` to `GGC`:

```
ATG GAA CCC GGC TAA
```

**What changed in the output?** _____________________________________

Try all four GG* codons (GGA, GGC, GGG, GGT):

| Codon | Output Description | Same as GGA? (Y/N) |
| ----- | ------------------ | ------------------ |
| GGA   |                    | N/A                |
| GGC   |                    |                    |
| GGG   |                    |                    |
| GGT   |                    |                    |

**Conclusion:** Codons that start with _______ and _______ all produce the same _________. This is called a **codon family**.

---

## Part 2: Shape Families (15 min)

### Exercise 1.3: RECT Family

Change `GGA` to `CCA`:

```
ATG GAA CCC CCA TAA
```

**What happened?** _________________________________________________

**Error message (if any):** _________________________________________

**Why didn't it work?** HINT: RECT needs TWO numbers (width and height)

**Fix it:** Add another number before CCA:

```
ATG GAA CCC GAA CCC CCA TAA
```

**Now what do you see?** ___________________________________________

---

### Exercise 1.4: Exploring Families

Test if CC* is a family (like GG* was):

| Codon | Output | Same as CCA? |
| ----- | ------ | ------------ |
| CCA   |        | N/A          |
| CCC   |        |              |
| CCG   |        |              |
| CCT   |        |              |

**Are they all the same?** _________

---

### Exercise 1.5: LINE Family

Try the AA* family:

```
ATG GAA CCC AAA TAA
```

**Shape:** ____________ **Needs how many numbers?** _______

Test AA* family:

| Codon | Same? (Y/N) |
| ----- | ----------- |
| AAA   | N/A         |
| AAC   |             |
| AAG   |             |
| AAT   |             |

---

## Part 3: Creative Challenge (15 min)

### Exercise 1.6: Two Shapes

Create a genome that draws TWO circles side-by-side.

**Strategy:** Draw circle → TRANSLATE right → Draw another circle

**TRANSLATE codon:** `ACA` (needs dx, dy)

**Your genome:**

```
ATG
  _____ _____ _____      ; First circle
  _____ _____ _____ _____ _____  ; Translate
  _____ _____ _____      ; Second circle
TAA
```

**Sketch your output:**

[Draw your result here]

---

### Exercise 1.7: Mix Shapes

Modify your genome to use TWO different shapes (circle and rectangle, or circle and line, etc.)

**Your genome:**

```
ATG




TAA
```

**Describe your composition:** ______________________________________

---

---

## Part 4: Reflection (5 min)

### Question 1: Codon Families

Why might it be useful for biology to have multiple codons that code for the same thing?

---

---

---

### Question 2: Silent Mutations

A "silent mutation" in real biology changes DNA but doesn't change the protein. How is this similar to changing GGA → GGC in CodonCanvas?

---

---

---

### Question 3: Preview

What do you think happens if a mutation changes GGA (CIRCLE) to TAA (STOP)?

---

---

---

## Bonus Challenge

Create the most interesting composition you can using ONLY these codons:

- START: ATG
- STOP: TAA
- PUSH numbers: GAA + any codon for the number
- CIRCLE: GG*
- RECT: CC*
- TRANSLATE: ACA

**Your creative genome:**

```
ATG




TAA
```

**Title for your artwork:** _________________________________________

---

**Teacher Signature:** _______________ **Completion:** ☐ Excellent ☐ Good ☐ Needs Review
