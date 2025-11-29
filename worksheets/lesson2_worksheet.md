# Lesson 2 Student Worksheet: Mutation Gallery

**Name:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Date:** \_\_\_\_\_\_\_\_\_\_

**Learning Objectives:**

- Classify mutations as silent, missense, nonsense, or frameshift
- Predict visual outcomes from mutation type
- Connect visual changes to biological concepts

---

## Part 1: Review (5 min)

### Quick Check

**1. Name three codon families you learned:**

- \_\_\_\_\_\_\_\_ family (shape: \_\_\_\_\_\_\_)
- \_\_\_\_\_\_\_\_ family (shape: \_\_\_\_\_\_\_)
- \_\_\_\_\_\_\_\_ family (shape: \_\_\_\_\_\_\_)

**2. What is a silent mutation?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

---

## Part 2: Missense Mutations (15 min)

A **missense mutation** changes one codon to a DIFFERENT codon family, producing a different instruction but still functional.

### Exercise 2.1: Shape Shifter

**Start with this genome:**

```
ATG GAA AGG GGA TAA
```

**Original output:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Now make these changes ONE AT A TIME (undo after each):

| Mutation  | New Codon      | New Shape | Functional? (Y/N) |
| --------- | -------------- | --------- | ----------------- |
| GGA → GCA | GCA (TRIANGLE) |           |                   |
| GGA → CCA | CCA (RECT)     |           |                   |
| GGA → GTA | GTA (ELLIPSE)  |           |                   |
| GGA → AAA | AAA (LINE)     |           |                   |

**Which mutations worked?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Which mutations failed?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Why did some fail?** HINT: Look at how many numbers each shape needs

---

---

---

### Exercise 2.2: Functional Missense

Create a missense mutation that WORKS:

**Original genome:**

```
ATG GAA AGG GAA AGG GGA TAA
```

**Your mutation:** Change \_\_\_\_\_ to \_\_\_\_\_

**New genome:**

```
ATG GAA AGG GAA AGG _____ TAA
```

**Result:** Circle became \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Biological parallel:** In real biology, a missense mutation changes one amino acid to another. Sometimes the protein still works (like your drawing), sometimes it doesn't. Can you think of an example of each?

Works: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Doesn't work: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Part 3: Nonsense Mutations (10 min)

A **nonsense mutation** introduces an early STOP codon, truncating the output.

### Exercise 2.3: The Disappearing Act

**Start genome (draws 2 circles):**

```
ATG
  GAA CCC GGA
  GAA CCC GAA AAA ACA
  GAA CCC GGA
TAA
```

**How many circles do you see?** \_\_\_\_\_\_\_

**Now introduce a nonsense mutation:** Change the SECOND `GGA` to `TAA`

**New genome:**

```
ATG
  GAA CCC GGA
  GAA CCC GAA AAA ACA
  GAA CCC TAA
TAA
```

**How many circles now?** \_\_\_\_\_\_\_

**What happened?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

---

### Exercise 2.4: Early vs Late Nonsense

**Hypothesis:** Where you put the STOP matters!

Test these three genomes:

**A) Early STOP:**

```
ATG TAA GAA CCC GGA GAA CCC GGA TAA
```

**Circles drawn:** \_\_\_\_\_\_\_

**B) Middle STOP:**

```
ATG GAA CCC GGA TAA GAA CCC GGA TAA
```

**Circles drawn:** \_\_\_\_\_\_\_

**C) Late STOP:**

```
ATG GAA CCC GGA GAA CCC GGA TAA
```

**Circles drawn:** \_\_\_\_\_\_\_

**Conclusion:** The earlier the nonsense mutation, the \_\_\_\_\_\_\_\_\_\_\_\_\_ information is lost.

---

## Part 4: Frameshift Mutations (20 min)

A **frameshift mutation** inserts or deletes bases, shifting how triplets are read. Everything downstream gets scrambled!

### Exercise 2.5: Understanding Reading Frames

**Original sequence (with frame markers):**

```
ATG|GAA|CCC|GGA|TAA
```

**If we DELETE one 'A' after ATG:**

```
ATG GAA CCC GGA TAA  (spaces ignored)
ATGGACCCGGATAA       (raw sequence)
ATG|GAC|CCG|GAT|AA   (new frame!)
```

**Original codons:**

- ATG = START
- GAA = PUSH (part of number)
- CCC = PUSH number
- GGA = CIRCLE
- TAA = STOP

**New codons after deletion:**

- ATG = START
- GAC = ??? (different opcode!)
- CCG = ??? (different opcode!)
- GAT = ??? (different opcode!)
- AA = incomplete!

---

### Exercise 2.6: Frameshift Experiment

**Original genome:**

```
ATG AAA GGA TAA
```

**Normal output:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Now create frameshift:** Insert ONE extra base anywhere after ATG

**Your modified genome:**

```
ATG ____AA AG GA TAA
```

(Note: You're literally adding a base, which breaks the triplet pattern)

Actually, let me show proper frameshift demo:

**Better demo:** Remove one base from a codon

**Original (proper triplets):**

```
ATGAAAGGATAA  (ATG|AAA|GGA|TAA)
```

**Delete one A:**

```
ATGAAGGATAA   (ATG|AAG|GAT|AA)
```

Now the codons are: ATG (START) | AAG (LINE family) | GAT (PUSH family) | AA (incomplete)

**Result:** Completely different instructions!

---

### Exercise 2.7: Frameshift vs Missense

Compare these two mutations:

**A) Missense (point mutation):**

```
Original: ATG GAA CCC GGA TAA
Mutated:  ATG GAA CCC CCA TAA  (one codon changes)
```

**B) Frameshift (deletion):**

```
Original: ATG GAA CCC GGA TAA
Raw:      ATGAAACCCGGATAA
Delete C: ATGAAACCGGATAA
New:      ATG|AAA|CCG|GAT|AA
```

| Mutation Type | Codons Affected  | Severity     |
| ------------- | ---------------- | ------------ |
| Missense      | \_\_\_\_\_\_\_\_ | Low/Med/High |
| Frameshift    | \_\_\_\_\_\_\_\_ | Low/Med/High |

**Why is frameshift more severe?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

---

## Part 5: Mutation Detective Challenge (10 min)

For each pair, identify the mutation type AND predict the visual effect.

### Challenge 1

**Original:** `ATG GAA CCC GGA TAA`
**Mutated:** `ATG GAA CCC GGC TAA`

**Mutation type:** ☐ Silent ☐ Missense ☐ Nonsense ☐ Frameshift

**Predicted effect:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### Challenge 2

**Original:** `ATG GAA CCC GGA GAA CCC CCA TAA`
**Mutated:** `ATG GAA CCC GGA TAA CCC CCA TAA`

**Mutation type:** ☐ Silent ☐ Missense ☐ Nonsense ☐ Frameshift

**Predicted effect:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### Challenge 3

**Original:** `ATG GAA CCC GGA TAA`
**Mutated:** `ATG GAA CCC GCA TAA`

**Mutation type:** ☐ Silent ☐ Missense ☐ Nonsense ☐ Frameshift

**Predicted effect:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### Challenge 4

**Original:** `ATGAAACCCGGATAA` (ATG|AAA|CCC|GGA|TAA)
**Mutated:** `ATGAACCCGGATAA` (ATG|AAC|CCG|GAT|AA)

**Mutation type:** ☐ Silent ☐ Missense ☐ Nonsense ☐ Frameshift

**Predicted effect:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### Challenge 5

**Original:** `ATG GAA CCC GGA GAA CCC GGA TAA`
**Mutated:** `ATG GAA CCC CCA GAA CCC GGA TAA`

**Mutation type:** ☐ Silent ☐ Missense ☐ Nonsense ☐ Frameshift

**Predicted effect:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

## Part 6: Reflection Questions

### Question 1: Mutation Severity Ranking

Rank these mutation types from least to most severe (1 = least, 4 = most):

\_\_\_\_\_ Silent
\_\_\_\_\_ Missense
\_\_\_\_\_ Nonsense
\_\_\_\_\_ Frameshift

**Explain your ranking:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

---

---

### Question 2: Real Biology Connection

In real biology, sickle cell anemia is caused by a single base change in the hemoglobin gene (glutamic acid → valine).

**What type of mutation is this?** ☐ Silent ☐ Missense ☐ Nonsense ☐ Frameshift

**Why is this mutation harmful even though it's just one amino acid?**

---

---

---

### Question 3: Evolution Implications

If an organism has a mutation in its DNA, which mutation type would be:

**Most likely to be passed to offspring without harm?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Most likely to be lethal?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

**Why?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

---

## Bonus Challenge: Create Your Own

Design a genome, then create THREE different mutations (one missense, one nonsense, one frameshift).

**Original genome:**

```
ATG




TAA
```

**Missense mutation:**

```
ATG




TAA
```

**Nonsense mutation:**

```
ATG




TAA
```

**Frameshift mutation:**

```
```

(Show actual base deletion/insertion)

**Which had the biggest visual impact?** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

**Teacher Signature:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ **Completion:** ☐ Excellent ☐ Good ☐ Needs Review
