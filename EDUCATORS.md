# CodonCanvas Educator Guide 🧬📚

> **Comprehensive guide for educators teaching genetics and computational thinking through DNA-inspired visual programming**

**Version:** 1.0.0
**Target Audience:** Secondary/tertiary biology educators, computer science teachers, STEM coordinators
**Recommended Duration:** 3-5 class sessions (45-90 minutes each)
**Prerequisites:** Basic biology (DNA structure, codons) or willingness to learn alongside students

---

## Table of Contents

1. [Quick Start for Educators](#quick-start-for-educators)
2. [Installation & Setup](#installation--setup)
3. [Learning Objectives](#learning-objectives)
4. [Lesson Plan Templates](#lesson-plan-templates)
5. [Assessment Rubrics](#assessment-rubrics)
6. [Example Activities](#example-activities)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [FAQ](#faq)

---

## Quick Start for Educators

### What is CodonCanvas?

CodonCanvas is an educational programming language that uses **DNA-like triplets (codons)** as its syntax. Students write sequences of three-letter codes (e.g., `ATG`, `GGA`, `TAA`) that execute as visual graphics on a canvas. The system models genetic concepts—synonymous codons, reading frames, and mutation types—making molecular biology tangible and playful.

### Why Use CodonCanvas?

**For Biology Teachers:**
- Makes abstract genetic concepts (mutations, reading frames, redundancy) **visually concrete**
- Demonstrates how small DNA changes create large phenotype effects
- No prior coding experience required for students
- Immediate visual feedback builds intuition

**For Computer Science Teachers:**
- Introduces stack-based programming through biological metaphor
- Teaches computational thinking via pattern recognition and debugging
- Unique "language design" case study
- Cross-disciplinary STEM integration

**For Students:**
- **Low barrier to entry**: Codon chart fits on a postcard
- **Instant gratification**: See results in <5 minutes
- **Creative expression**: Code becomes visual art
- **Authentic learning**: Real programming concepts through biological lens

### Classroom-Ready Features

✅ **Web-based**: No installation, works on Chromebooks/iPads/laptops
✅ **Mobile-responsive**: Portrait and landscape support for tablets
✅ **Accessible**: WCAG 2.1 Level AA compliant (screen readers, keyboard navigation)
✅ **Visual Reference**: Print-ready codon chart poster (`codon-chart.svg`)
✅ **18 Built-in Examples**: Progressive difficulty (beginner → advanced)
✅ **Distribution Package**: Example genomes ZIP for LMS deployment (`codoncanvas-examples.zip`)
✅ **Mutation Tools**: One-click demonstration of 7 mutation types
✅ **Save/Load**: Students can save work and submit .genome files
✅ **Offline-capable**: Can run locally without internet after initial setup

---

## Installation & Setup

### Option 1: Web Deployment (Recommended for Classroom)

**Best for:** Schools with reliable internet, BYOD environments, Chromebook labs

1. **Deploy to Static Host** (one-time setup by IT/teacher):
   ```bash
   # Clone repository
   git clone https://github.com/codoncanvas/codoncanvas.git
   cd codoncanvas

   # Install dependencies
   npm install

   # Build for production
   npm run build

   # Deploy 'dist/' folder to:
   # - GitHub Pages (free)
   # - Netlify (free)
   # - Vercel (free)
   # - School web server
   ```

2. **Share URL with students**:
   - Example: `https://yourdomain.com/codoncanvas`
   - Bookmark in school browser profiles
   - Add to LMS (Canvas, Google Classroom, Moodle)

3. **Test on target devices**:
   - ✅ Chromebooks (Chrome 90+)
   - ✅ iPads (Safari 14+)
   - ✅ Windows laptops (Edge 90+, Chrome 90+, Firefox 88+)
   - ✅ Smartphones (optional for homework)

**Advantages:**
- Zero installation for students
- Always up-to-date (update once, affects all users)
- Access from home/library
- Works on locked-down devices

### Option 2: Local Development Server (Advanced)

**Best for:** Computer labs with Node.js installed, advanced CS classes

1. **Install Node.js 16+** (if not already installed)
2. **Clone & Run**:
   ```bash
   git clone https://github.com/codoncanvas/codoncanvas.git
   cd codoncanvas
   npm install
   npm run dev
   ```
3. **Open `http://localhost:5173` in browser**

**Advantages:**
- Full development environment
- Can modify source code
- No internet dependency after download

### Option 3: Offline HTML Bundle (No Build Tools)

**Best for:** Air-gapped networks, workshops without internet

1. **Download pre-built bundle** from releases page
2. **Extract ZIP** to any folder
3. **Double-click `index.html`** to run

**Limitations:**
- Manual updates required
- No hot-reload during development

---

## Learning Objectives

### Biology Domain

**Genetic Code Structure:**
- **LO1**: Explain the triplet nature of the genetic code
- **LO2**: Identify start (ATG) and stop codons (TAA, TAG, TGA)
- **LO3**: Describe reading frames and their importance

**Genetic Redundancy:**
- **LO4**: Define synonymous codons and their biological role
- **LO5**: Compare codon families with similar functions (e.g., GG* → CIRCLE)

**Mutation Types:**
- **LO6**: Classify mutations as silent, missense, nonsense, or frameshift
- **LO7**: Predict phenotype effects of different mutation types
- **LO8**: Explain why frameshift mutations are typically most harmful

**Systems Thinking:**
- **LO9**: Analyze how local changes (single base) cascade to global effects
- **LO10**: Evaluate mutation severity based on position and type

### Computer Science Domain

**Programming Fundamentals:**
- **LO11**: Write and debug stack-based programs
- **LO12**: Use abstraction (codons as instructions)
- **LO13**: Apply sequential execution logic

**Computational Thinking:**
- **LO14**: Decompose visual goals into instruction sequences
- **LO15**: Recognize patterns in code (loops, repetition)
- **LO16**: Debug programs using linter feedback

**Language Design:**
- **LO17**: Explain why language designers create synonyms (redundancy)
- **LO18**: Evaluate trade-offs between expressiveness and simplicity

### Cross-Disciplinary

**Inquiry & Investigation:**
- **LO19**: Form hypotheses about mutation effects
- **LO20**: Test predictions through experimentation
- **LO21**: Analyze unexpected results systematically

**Communication:**
- **LO22**: Document genetic programs with comments
- **LO23**: Explain code logic to peers
- **LO24**: Create visual artifacts demonstrating concepts

---

## Lesson Plan Templates

### Lesson 1: Hello CodonCanvas (45-60 min)

**Learning Objectives:** LO1, LO2, LO11, LO12
**Materials:** Computer/tablet per student, CodonCanvas URL, Codon Chart handout

#### Structure

**Introduction (10 min)**
1. **Hook**: Show two DNA sequences that differ by one letter, produce dramatically different visual outputs
2. **Explain Analogy**: DNA → CodonCanvas as Genetics → Programming
3. **Learning Goals**: "By end of class, you'll write a program that draws shapes using DNA-like code"

**Demo (10 min)**
1. **Live Coding**: Teacher codes "Hello Circle" on projector
   ```dna
   ATG GAA AAT GGA TAA
   ```
2. **Explain Each Codon**:
   - ATG = "Start reading here"
   - GAA AAT = "Remember the number 3"
   - GGA = "Draw a circle with radius 3"
   - TAA = "Stop"
3. **Run**: Show instant visual output

**Guided Practice (15 min)**
1. **Students Code Along**: Replicate "Hello Circle"
2. **Experiment**: Change AAT to different values (reference base-4 chart)
3. **Challenge**: "Make the circle bigger/smaller"
4. **Pair-Share**: Compare outputs with neighbor

**Independent Exploration (10 min)**
1. **Load Example 2** ("Two Shapes")
2. **Modify**: Change one codon, predict outcome, test
3. **Document**: Write comment explaining what changed

**Wrap-Up (5 min)**
1. **Gallery Walk**: 3-4 students share creations
2. **Reflection**: "What surprised you about this language?"
3. **Preview Next Lesson**: "Next time: Mutations!"

#### Assessment (Formative)
- ✅ Student successfully runs "Hello Circle"
- ✅ Student modifies numeric literal and observes change
- ✅ Student explains START/STOP function
- ⚠️ **Common Issues**: Reading frame errors (explain triplets), typos (use linter)

---

### Lesson 2: Mutations (60-90 min)

**Learning Objectives:** LO4, LO6, LO7, LO8, LO19, LO20
**Materials:** CodonCanvas, Mutation Lab (mutation-demo.html), Worksheet (provided below)

#### Structure

**Review (5 min)**
- Recall: What's a codon? What's a reading frame?

**Introduction to Mutations (10 min)**
1. **Real Biology**: Show DNA mutation examples (sickle cell, color blindness)
2. **CodonCanvas Parallel**: "We'll see how code 'mutations' change output"
3. **Four Types Preview**:
   - Silent (no change)
   - Missense (shape change)
   - Nonsense (early stop)
   - Frameshift (scramble)

**Demo: Silent Mutation (10 min)**
1. **Load Example 16** (Silent Mutation Demo)
2. **Show Original**: `ATG GAA AAT GGA TAA` (circle)
3. **Mutate**: `GGA → GGC` (both mean CIRCLE)
4. **Compare Outputs**: Identical!
5. **Explain**: "Synonymous codons = same instruction"
6. **Biology Connection**: Multiple codons code for same amino acid

**Guided Practice: Missense (10 min)**
1. **Students Load Example 1**
2. **Predict**: "What if GGA (CIRCLE) → CCA (RECT)?"
3. **Test**: Use mutation tool or manual edit
4. **Observe**: Circle becomes rectangle
5. **Discuss**: "Shape changed but program still works"

**Independent Investigation (20 min)**
1. **Worksheet**: Students test 8 mutations (provided below)
2. **Record**: Prediction → Actual outcome → Classification
3. **Highlight**: Frameshift effects (most dramatic)

**Group Discussion (10 min)**
1. **Share Findings**: Which mutation type is most harmful? Why?
2. **Biology Parallel**: Why are frameshifts rare in nature?
3. **Synthesis**: Small changes → big effects

**Wrap-Up (5 min)**
- **Key Takeaway**: Mutation type determines severity
- **Challenge**: "Create a genome immune to silent mutations" (hint: avoid synonymous codons)

#### Assessment (Formative + Summative)
- **Formative**: Circulate during investigation, check predictions
- **Summative**: Collect worksheets, evaluate:
  - Correct classification of 6/8 mutations
  - Explanation of frameshift severity
  - Evidence of hypothesis testing

---

### Lesson 3: Creative Composition (45-60 min)

**Learning Objectives:** LO13, LO14, LO15, LO22, LO24
**Materials:** CodonCanvas, Codon Chart, blank canvas

#### Structure

**Introduction (5 min)**
- **Goal**: Create original visual artwork using CodonCanvas
- **Constraints**: Must use ≥5 different opcodes, ≥20 codons total

**Planning Phase (10 min)**
1. **Sketch on Paper**: What do you want to draw?
2. **Decompose**: Break into shapes (circles, rectangles, lines)
3. **Sequence**: Plan order of operations
4. **Pseudocode**: Write comments first
   ```dna
   ; Draw sun in top-left
   ; Draw house in center
   ; Draw tree on right
   ```

**Coding Phase (20 min)**
1. **Incremental Development**: Build one section at a time
2. **Test Frequently**: Run after each shape
3. **Debug**: Use linter to catch frame errors
4. **Refine**: Adjust positions, colors, sizes

**Peer Review (10 min)**
1. **Pair Up**: Exchange .genome files
2. **Review Checklist**:
   - ✅ Program runs without errors
   - ✅ Comments explain logic
   - ✅ Uses ≥5 opcodes
   - ✅ Creative/original output
3. **Suggest One Improvement**

**Sharing (10 min)**
1. **Gallery**: Display outputs on projector
2. **Artist Statement**: Student explains their code (30 sec each)
3. **Peer Questions**

**Wrap-Up (5 min)**
- **Reflection**: "What was hardest? What would you add to the language?"
- **Homework**: Optional—mutate a classmate's genome, share results

#### Assessment (Summative)
**Rubric (see full rubric section below):**
- **Functionality** (30%): Program runs, produces intended output
- **Complexity** (25%): Uses ≥5 opcodes appropriately
- **Creativity** (20%): Original, aesthetically interesting
- **Documentation** (15%): Clear comments
- **Technical Quality** (10%): No linter errors, efficient code

---

### Lesson 4: Directed Evolution (Optional Extension, 60 min)

**Learning Objectives:** LO9, LO10, LO16, LO19, LO21
**Materials:** CodonCanvas, target image (provided by teacher)

#### Structure

**Challenge**: Evolve a genome to match a target image through iterative mutations

**Process:**
1. **Start**: Random or simple genome
2. **Mutate**: Apply 1-2 mutations (student's choice)
3. **Evaluate**: Does output move closer to target?
4. **Select**: Keep if better, revert if worse
5. **Repeat**: 5-10 generations

**Discussion:**
- How did you decide which mutations to try?
- What role does randomness vs. strategy play?
- Connection to natural selection?

---

## Assessment Rubrics

### Formative Assessment: Mutation Classification Worksheet

**Task:** Given 8 genome pairs, classify each mutation and predict effect

**Scoring:**
- **4 (Advanced)**: 8/8 correct classifications + accurate effect predictions
- **3 (Proficient)**: 6-7/8 correct + mostly accurate predictions
- **2 (Developing)**: 4-5/8 correct + some prediction errors
- **1 (Beginning)**: <4/8 correct

**Sample Questions:**
1. `GGA → GGC`: Silent / Missense / Nonsense / Frameshift? Effect: ___________
2. `GGA → TAA`: Silent / Missense / Nonsense / Frameshift? Effect: ___________
3. `ATG GAA → ATG GA A`: Silent / Missense / Nonsense / Frameshift? Effect: ___________

---

### Summative Assessment: Creative Composition Project

**Criteria & Weight:**

| Criterion | 4 (Exemplary) | 3 (Proficient) | 2 (Developing) | 1 (Beginning) | Weight |
|-----------|---------------|----------------|----------------|---------------|--------|
| **Functionality** | Runs perfectly, achieves all goals | Runs with minor visual flaws | Runs but output incomplete | Errors prevent execution | 30% |
| **Complexity** | Uses 7+ opcodes creatively | Uses 5-6 opcodes appropriately | Uses 3-4 opcodes | Uses <3 opcodes | 25% |
| **Creativity** | Highly original, aesthetically compelling | Original concept, good execution | Derivative but functional | Minimal effort | 20% |
| **Documentation** | Clear comments for every section | Most sections commented | Some comments present | No comments | 15% |
| **Technical Quality** | Zero linter errors, efficient | 1-2 minor errors | 3-4 errors or inefficient | Many errors | 10% |

**Total: 100 points**

**Grading Note:** Focus on **process** (planning, iteration, debugging) as much as **product** (final image). Consider requiring students to submit intermediate drafts to demonstrate growth.

---

### Summative Assessment: Mutation Analysis Lab Report

**Task:** Analyze how 5 different mutations affect a provided genome

**Structure:**
1. **Hypothesis**: Predict effect of each mutation (before testing)
2. **Method**: Document exact changes made
3. **Results**: Screenshot outputs, describe differences
4. **Analysis**: Explain why each mutation had observed effect
5. **Conclusion**: Which mutation types are most/least harmful? Why?

**Rubric:**

| Criterion | Points | Description |
|-----------|--------|-------------|
| **Hypotheses** | 15 | Testable predictions for all 5 mutations |
| **Methodology** | 10 | Clear documentation of mutations applied |
| **Results** | 15 | Accurate screenshots + descriptions |
| **Analysis** | 30 | Correct classification + biological reasoning |
| **Conclusion** | 20 | Synthesis of findings, addresses severity question |
| **Communication** | 10 | Clear writing, organized structure |

**Total: 100 points**

---

## Example Activities

### Activity 1: Codon Scavenger Hunt (15 min)

**Goal:** Familiarize students with codon map

**Process:**
1. Give students codon chart + list of 10 operations (e.g., "Find a codon that draws circles")
2. Students race to find codons
3. First to find all 10 wins

**Learning:** Active engagement with codon map before programming

---

### Activity 2: Debugging Challenge (20 min)

**Goal:** Develop systematic debugging skills

**Process:**
1. Provide students with 5 broken genomes (frame errors, missing START/STOP, stack underflow)
2. Students identify error type and fix
3. Discuss strategies: "How did you know where the error was?"

**Genomes:**
```dna
; Genome 1: Missing START
GAA AAT GGA TAA

; Genome 2: Frame error (mid-triplet break)
ATG GA A AAT GGA TAA

; Genome 3: Stack underflow
ATG GGA TAA

; Genome 4: Unclosed program (no STOP)
ATG GAA AAT GGA

; Genome 5: Wrong operand count
ATG GAA AAT ACA TAA  ; TRANSLATE needs 2 values
```

---

### Activity 3: Codon Golf (15 min)

**Goal:** Write shortest genome to achieve target output

**Challenge:** Draw 3 circles using fewest codons possible

**Solution Space:**
- Naïve: 3 × (PUSH + CIRCLE) = 15 codons + START/STOP = 17 total
- Optimized: PUSH + DUP + DUP + CIRCLE + CIRCLE + CIRCLE = 11 codons + 2 = 13 total

**Discussion:** Efficiency vs. readability trade-offs

---

### Activity 4: Mutation Telephone (30 min)

**Goal:** Demonstrate cumulative mutation effects

**Process:**
1. **Round 1**: Student A writes genome, saves as `genome_v1.genome`
2. **Round 2**: Student B loads `v1`, applies 1 mutation, saves as `v2`
3. **Round 3**: Student C loads `v2`, applies 1 mutation, saves as `v3`
4. **Continue**: 5-6 rounds
5. **Compare**: Display v1 vs v6 side-by-side
6. **Discuss**: How much drift occurred? What if mutations were random vs. directed?

---

### Activity 5: Biological Case Studies (20 min)

**Goal:** Connect CodonCanvas mutations to real genetic diseases

**Process:**
1. **Present Case**: Sickle cell anemia (GAG → GTG, glutamic acid → valine)
2. **Model in CodonCanvas**: Show missense mutation example
3. **Discuss Parallels**: Single base change → altered function
4. **Additional Cases**:
   - Cystic fibrosis (deletion mutation → frameshift)
   - Tay-Sachs (nonsense mutation → truncated protein)

**Differentiation:** Advanced students research their own cases

---

## Troubleshooting Guide

### Common Student Issues

#### Issue 1: "My code doesn't run"

**Symptoms:** Canvas stays blank, error in status bar

**Diagnosis Checklist:**
- ✅ Does genome start with `ATG`?
- ✅ Does genome end with `TAA`, `TAG`, or `TGA`?
- ✅ Are all bases valid (`A`, `C`, `G`, `T` only)?
- ✅ Is length a multiple of 3? (Check linter for frame errors)
- ✅ Are there enough values on stack? (e.g., CIRCLE needs 1, RECT needs 2)

**Solution Path:**
1. Click "Clear Canvas"
2. Check linter panel for specific errors
3. Use "Fix All" button for auto-fixable issues
4. Add missing START/STOP if needed
5. Count bases: should be divisible by 3

---

#### Issue 2: "Nothing shows up on canvas"

**Symptoms:** Program runs (status bar says "Success"), but canvas is blank/white

**Possible Causes:**
1. **All shapes drawn off-canvas**: Values too large (>63) or too small (0)
2. **White color on white background**: Change color with `TT*` opcodes
3. **STOP before drawing**: Nonsense mutation before drawing commands

**Solution:**
1. **Check numeric literals**: Use values 10-50 for visible results
2. **Add color command**: `TTT TTT TTT TTT` (black)
3. **Verify codon order**: START → PUSH → DRAW → STOP

---

#### Issue 3: "Output looks scrambled"

**Symptoms:** Canvas has chaotic/unexpected shapes

**Likely Cause:** Frameshift mutation (reading frame error)

**Solution:**
1. Check linter: Look for "mid-triplet break" warnings
2. Count bases: Total should be divisible by 3
3. Remove stray spaces inside codons: `ATG` not `AT G`
4. Use "Fix All" if available

---

#### Issue 4: "Program is too slow"

**Symptoms:** Browser freezes, long delay before output

**Likely Cause:** Infinite loop (no STOP codon) or extremely long program

**Solution:**
1. Check for STOP codon at end
2. If program >200 codons, consider simplifying
3. Reload page if browser hangs (Ctrl+Shift+R)

---

### Technical Issues (Educator/IT)

#### Issue 1: "Playground won't load on school network"

**Possible Causes:**
- Firewall blocking JavaScript
- Content Security Policy (CSP) restrictions
- HTTPS mixed-content issues

**Solution:**
1. **Check browser console** (F12 → Console tab)
2. **Whitelist domain** in network firewall
3. **Use HTTPS** for hosted version (not http://)
4. **Fallback**: Run local development server on teacher machine

---

#### Issue 2: "Students can't save .genome files"

**Possible Causes:**
- Browser download restrictions
- Pop-up blocker
- File system permissions

**Solution:**
1. **Enable downloads** in browser settings
2. **Allow pop-ups** for CodonCanvas domain
3. **Try different browser** (Chrome vs. Firefox)
4. **Fallback**: Copy-paste genome text into document

---

#### Issue 3: "Mobile responsiveness not working on iPads"

**Check:**
1. Safari version (needs 14+)
2. Zoom level (reset to 100%)
3. Orientation lock (try rotating device)

---

## FAQ

### For Educators

**Q: Do I need to know biology to teach this?**
A: Basic DNA knowledge helps (codons, mutations), but you can learn alongside students. Focus on the **metaphor** (code = DNA) rather than deep molecular mechanisms.

**Q: Do I need to know programming?**
A: No! CodonCanvas is designed for non-programmers. If you can follow a recipe, you can write CodonCanvas code. The visual feedback makes debugging intuitive.

**Q: How long does it take for students to create their first program?**
A: 5-10 minutes for "Hello Circle." Most students create original compositions within 45 minutes.

**Q: What ages is this appropriate for?**
A: **Recommended**: Grades 9-12 (ages 14-18), some college intro courses
**Possible with scaffolding**: Advanced middle school (grades 7-8)
**Too young**: Elementary (abstract concepts challenging)

**Q: Can I use this if my class has already covered genetics?**
A: **Yes!** Use it as a review/enrichment activity. Students with genetics background often make deeper connections.

**Q: What if students finish early?**
A: **Extensions**:
- Codon golf (shortest program challenge)
- Mutation telephone (cumulative drift activity)
- Create tutorial genome for younger students
- Explore advanced opcodes (NOISE, SAVE_STATE)

**Q: How do I grade creative work fairly?**
A: Use **rubric** (functionality, complexity, creativity, documentation). Focus on **process** (iteration, debugging) as much as product. Consider peer review component.

**Q: Can I modify the codon map?**
A: Technically yes (edit `src/types.ts`), but **not recommended** during pilot. Changing mappings breaks all examples and requires relearning.

---

### For Students (Teacher Reference)

**Q: What if I make a mistake?**
A: The linter will highlight errors! Look for red/yellow warnings and follow suggestions. Most errors are typos or missing START/STOP.

**Q: Can I use real DNA sequences?**
A: You can paste real DNA, but it likely won't draw anything interesting (real genes don't have START/STOP in the right places). CodonCanvas uses DNA **structure**, not real sequences.

**Q: Why do some codons do the same thing?**
A: This models genetic **redundancy**—in real DNA, multiple codons code for the same amino acid. It makes mutations less harmful!

**Q: What's the coolest thing I can make?**
A: Check Example 14 (Mandala Pattern) or 12 (Textured Circle with NOISE). Some students create fractals, spirals, or abstract art!

**Q: Can I share my work?**
A: Yes! Use the **💾 Save .genome** button to download your code, then share the file with friends/teacher.

---

## Additional Resources

### Handouts (Create These)

1. **Codon Chart (1 page)**: Printable reference with all 64 codons
2. **Quick Start Guide (1 page)**: Step-by-step first program
3. **Mutation Worksheet (2 pages)**: Classification practice
4. **Base-4 Encoding Chart (1 page)**: Number-to-codon lookup table

### Suggested Extensions

- **Cross-Curricular**: Math (base-4 number systems), art (generative design)
- **Advanced CS**: Implement new opcodes, design alternative codon maps
- **Biology**: Compare CodonCanvas to real codon table structure
- **Ethics**: Discuss genetic engineering parallels (should we "edit" code/DNA?)

---

## Contact & Support

**Found a bug?** Report at: [GitHub Issues](https://github.com/codoncanvas/codoncanvas/issues)
**Teaching tips?** Share with: [community forum link]
**Need help?** Email: [educator-support email]

---

**🎓 Happy Teaching! Let's evolve some computational thinking! 🧬**
