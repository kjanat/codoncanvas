# Project Summary: DNA‑Inspired Programming Language (Working Title)

## 1) Executive Overview

Create an educational, playful programming language that uses DNA‑like **triplets (codons)** as its syntax. Learners write sequences of three‑character tokens that are **transcribed** to bytecode and **translated** into visual outputs. Small “mutations” to the code (point, silent, missense, nonsense, frameshift) produce characteristic changes in the output, building intuition for how genetic variation alters phenotypes—without simulating real biology.

---

## 2) Goals & Outcomes

- **Intuition‑building:** Make genetic concepts (codons, redundancy, reading frames, mutation types) tangible.
- **Low barrier to entry:** No prior coding needed; a postcard‑sized codon chart suffices.
- **Immediate feedback:** Live preview shows how tiny edits ripple through results.
- **Delight:** Make it fun to “evolve” programs and share results.

**Primary metrics**

- Time‑to‑first‑artifact (<5 minutes from opening the playground)
- Retention across 3 short lessons
- Ability to correctly identify mutation types in code challenges
- User satisfaction (thumbs‑up rate on demos)

---

## 3) Core Concept

- **Source language:** Only triplets `[A,C,G,T,U,X,…]` (configurable alphabet, default A/C/G/T). Whitespace is ignored.
- **Transcription:** Each codon maps to an **Opcode** (instruction). Synonymous codons map to the same Opcode to model genetic redundancy.
- **Translation/VM:** A tiny stack/graphics VM executes Opcodes to produce visuals (and/or sound).
- **Phenotype:** The rendered image/animation. Mutations alter the phenotype with predictable patterns.

> We are **not** predicting real proteins; we are using genetic metaphors to teach systems thinking.

---

## 4) Syntax & Readability

- **Human legibility:**
  - Fixed‑width triplets grouped into lines (60–80 chars/line).
  - Optional **spacer codons** (e.g., `NNN`) for visual chunking—ignored by the VM.
  - **Inline comments** start with `;` to end‑of‑line.
  - **Sections** delimited by `ATG` (start) and a stop codon (`TAA|TAG|TGA`).
- **Cheat‑sheet:** “Codon → Instruction” poster; color‑coded by opcode family.
- **Linter hints:** Highlights out‑of‑frame segments, unknown codons, or premature stops.

**Mini example**

```
ATG GGA GGA ACC CCA TCT GAA GAA TAA ; draw two circles, move, draw square, brighten, stop
```

---

## 5) Modeling Mutations (and their Visual Effects)

| Mutation type          | Source edit               | Interpreter effect             | Visual pedagogy                           |
| ---------------------- | ------------------------- | ------------------------------ | ----------------------------------------- |
| **Silent**             | `GGA → GGG` (same family) | Same Opcode                    | No visible change (or tiny jitter)        |
| **Missense**           | `GGA → GCA`               | Different but related Opcode   | Shape changes (circle → polygon)          |
| **Nonsense**           | `GGA → TAA`               | Early `STOP`                   | Truncated image; obvious missing elements |
| **Frameshift**         | Insert `C` after 9th char | All codons downstream re‑chunk | Sudden global change/“glitch” pattern     |
| **Insertion/Deletion** | Add/remove 3 chars        | Add/remove one instruction     | Local addition/removal in scene           |

**Toggleable teaching modes**

- **Hash‑like:** Exaggerate sensitivity so small edits cause big changes (good for shock value).
- **Biology‑like:** Redundancy + locality so many edits are benign, but frameshifts are catastrophic.

---

## 6) Example Codon Map (MVP)

> Exact mapping is arbitrary but pedagogically chosen; families mimic amino‑acid redundancy.

**Control**

- `ATG` → `START`
- `TAA|TAG|TGA` → `STOP`

**Drawing primitives**

- `GGA|GGC|GGG|GGT` → `CIRCLE` (radius from stack)
- `CCA|CCC|CCG|CCT` → `RECT` (w×h from stack)
- `AAA|AAG` → `LINE`

**State/transform**

- `GAA|GAG` → `ADD` (push a value; immediate follows as next codon’s numeric literal)
- `AC*` (all `ACX`) → `TRANSLATE` (dx,dy)
- `AG*` → `ROTATE` (deg)
- `TT*` → `COLOR` (H,S,L deltas)
- `CG*` → `SCALE`

**Utility**

- `NNN` → `NOP` (whitespace codon)
- `XXX` → `RAND` (seeded; for evolutionary mode)

**Sample program**

```
; Draw a flower‑like rosette
ATG NNN  GAA AAA  GGA  ACU ACG  AGC  TTG  CCA  
     GAA AAA  GGA  ACU ACG  AGC  TTG  CCA  
     GAA AAA  GGA  ACU ACG  AGC  TTG  CCA  TAA
```

*(Mutate any single **``** → **``** for a small petal rotation change; delete one **``** early to trigger a frameshift and watch the entire rosette deform.)*

---

## 7) Output & Visualization

- **Live canvas** with split‑view: source, codon map, and phenotype.
- **Mutation overlay:** Diff view highlighting changed codons and their downstream frame.
- **Timeline scrubber:** See the phenotype build step‑by‑step (like ribosome movement).
- **Export:** PNG/GIF for images/animations; `.genome` for source.
- **Accessibility:** Deterministic rendering; seed control for reproducibility.

---

## 8) Demos & Lesson Seeds

1. **Point vs. frameshift:** Start with a simple motif; switch a codon (point) vs. insert one base (frameshift). Contrast outputs.
2. **Synonymous codons:** Flip `GGA ↔ GGG`; show near‑identical phenotype.
3. **Nonsense mutation:** Introduce an early `TAA`; the output truncates—great for discussion.
4. **Directed evolution:** Auto‑mutate 1–2 codons per generation; learners select “fitter” phenotypes to evolve toward a target image.
5. **Codon puzzles:** Given a target picture, identify which codon class to tweak.
6. **Theme packs:** Swap the codon map to a **sound** backend (pitch, duration, envelope) or a **robot plotter**.

---

## 9) Developer Experience (DX)

- **Playground/REPL:** Type codons, see preview instantly; mutation presets (point/indel/frameshift).
- **Linter & tooling:** Frame guardrails, stop‑before‑start warnings, color‑by‑opcode.
- **Shareability:** One‑click link/export; gallery with fork/mutate buttons.
- **Curriculum hooks:** Worksheets that pair program snippets with biology questions.

---

## 10) Implementation Plan (phased)

- **Phase A – MVP Core:** Lexer (triplets), codon→opcode map, VM, 2D renderer, start/stop, 8–10 opcode families, playground.
- **Phase B – Pedagogy:** Mutation tools, diff overlays, lesson templates, assessment items.
- **Phase C – Extensions:** Audio backend, evolutionary mode, alternative alphabets (incl. `U`), theming.
- **Phase D – Packaging:** Docs, cheat‑sheet poster, educator guide, gallery moderation.

---

## 11) Risks & Mitigations

- **Biology confusion:** Users may mistake it for real protein synthesis → Clear disclaimers, “metaphor mode” labels, and a sidebar linking the metaphor to real concepts.
- **Over‑fragile outputs:** Hash‑like chaos hurts learning → Provide “biology‑like” mode with redundancy and locality.
- **Readability fatigue:** Wall of letters → spacers, comments, color‑coding, and foldable sections.

---

## 12) Audience & Use Cases

- Secondary/tertiary biology courses, outreach events, maker spaces, and creative‑coding clubs.
- Short workshops (60–90 minutes) culminating in a shared gallery.

---

## 13) Naming (shortlist + criteria)

**Criteria:** evocative, pronounceable, 2–3 syllables, .org/.io availability likely, no conflict with major projects.

**Shortlist (new options):**

- **CodonPlay**
- **Triplet**
- **HelixCode**
- **GeneWeave**
- **Nucleo**
- **FrameShift**
- **GenoGlyph**
- **CodonCanvas**
- **HelixCraft**
- **Amino** (if trademark clear)

*(Earlier options remain available; we’ll test with a quick name survey.)*

---

## 14) “Done” Definition for MVP

- Users can write triplets, run, and export visuals.
- Built‑in mutation tools visibly illustrate silent/missense/nonsense/frameshift.
- At least 6 guided demos + a gallery of 50+ shared artifacts.
- Educator‑ready docs (getting started, lesson plan, assessment rubric).

---

## 15) Ask

- Approval to proceed with Phase A–B scope.
- Green‑light to user‑test with a small cohort of learners and iterate on the codon map.

---

*Prepared by: Kaj — concept, pedagogy, and prototyping.*

