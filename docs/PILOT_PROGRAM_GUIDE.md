# CodonCanvas Pilot Program Guide

**Version:** 1.0.0
**Purpose:** Structured observation protocol for 10-student pilot validation
**Duration:** 3 sessions × 60 minutes (Week 5 deployment)
**Target:** Secondary/tertiary students (ages 15-18)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Pilot Objectives](#pilot-objectives)
3. [Participant Selection](#participant-selection)
4. [Pre-Pilot Preparation](#pre-pilot-preparation)
5. [Session Observation Protocol](#session-observation-protocol)
6. [Data Collection Instruments](#data-collection-instruments)
7. [Post-Pilot Analysis](#post-pilot-analysis)
8. [Appendices](#appendices)

---

## Executive Summary

### What is the Pilot?

A **10-student, 3-session pilot** (Week 5 deployment) to empirically validate CodonCanvas MVP against four primary metrics:

1. **Time-to-first-artifact**: <5 minutes target
2. **Retention across 3 lessons**: >80% attendance target
3. **Mutation identification accuracy**: >70% post-assessment target
4. **User satisfaction**: >80% positive feedback target

### Why Run a Pilot?

**Before large-scale deployment**, empirical data on:

- Pedagogical effectiveness (learning gains)
- Usability (interface friction points)
- Engagement (retention, satisfaction)
- Technical stability (browser compatibility, performance)

### Pilot Outcomes

**Deliverables:**

- Quantitative metrics (time, accuracy, satisfaction scores)
- Qualitative insights (student quotes, observed behaviors)
- Technical validation (bug reports, device compatibility)
- Iteration roadmap (Phase D priorities based on findings)

---

## Pilot Objectives

### Primary Objectives

**1. Validate Learning Effectiveness**

- **Measure:** Pre/post assessment score gains (target: +30% median improvement)
- **Method:** 10-question quiz before Lesson 1, after Lesson 3
- **Success Criterion:** ≥70% of students show improvement

**2. Validate Usability**

- **Measure:** Time-to-first-artifact (target: <5 minutes)
- **Method:** Timer from "open playground" to "first successful genome"
- **Success Criterion:** ≥80% of students achieve target

**3. Validate Engagement**

- **Measure:** Retention rate across 3 sessions (target: >80%)
- **Method:** Attendance tracking
- **Success Criterion:** ≥8/10 students attend all 3 sessions

**4. Validate Satisfaction**

- **Measure:** Thumbs-up rate (target: >80% positive)
- **Method:** Post-session 3 survey (5-point Likert scale)
- **Success Criterion:** ≥4/5 average rating

### Secondary Objectives

**Technical Validation:**

- Browser compatibility (Chrome, Safari, Firefox)
- Mobile/tablet usability (iPads, Chromebooks)
- Performance (render times, UI responsiveness)
- Accessibility (screen reader, keyboard navigation)

**Pedagogical Insights:**

- Which mutation types are hardest to grasp? (frameshift hypothesis)
- Do students make connections to real biology?
- Which examples resonate most?
- What scaffolding is needed for struggling students?

---

## Participant Selection

### Inclusion Criteria

**Required:**

- Ages 15-18 (secondary/tertiary education)
- Basic biology exposure (DNA structure, genes)
- Access to laptop/tablet with browser
- Availability for 3 × 60-minute sessions

**Preferred:**

- Mix of biology/CS backgrounds (50/50 if possible)
- Range of technical comfort levels (novice to advanced)
- Diverse demographics (gender, ethnicity, academic performance)

### Exclusion Criteria

- Previous exposure to CodonCanvas
- Color blindness (if cannot distinguish colors without accommodation)
- Severe visual impairments not accommodated by screen reader

### Recruitment

**Method 1: Classroom Recruitment**

- Partner with biology or CS teacher
- Recruit from existing course roster
- Offer extra credit or completion certificate

**Method 2: Student Organization**

- STEM club, coding club, biology society
- Advertise as "creative coding workshop"
- Emphasize no prior coding required

**Method 3: Open Call**

- Post flyers in school/campus
- Email blast to student body
- First-come, first-served (screen for criteria)

### Sample Size Rationale

**Why 10 students?**

- Large enough for statistical trends (qualitative insights)
- Small enough for detailed observation (1 observer can track)
- Pilot-appropriate (MVP validation, not publication-grade research)
- Manageable for single educator/researcher

---

## Pre-Pilot Preparation

### 2 Weeks Before Session 1

#### Administrative Tasks

**Consent & Permissions:**

- [ ] Obtain IRB approval (if research institution)
- [ ] Prepare parental consent forms (if minors <18)
- [ ] Prepare student assent forms
- [ ] Obtain institutional approval (school admin, department)

**Participant Communication:**

- [ ] Send welcome email with schedule
- [ ] Share pre-session logistics (device requirements, URL)
- [ ] Distribute pre-assessment (online, takes 10 minutes)
- [ ] Confirm attendance for Session 1

#### Technical Setup

**Environment Preparation:**

- [ ] Deploy CodonCanvas to stable URL (no local servers)
- [ ] Test on all target devices (Chrome, Safari, Firefox, iPad)
- [ ] Prepare backup plan (offline HTML bundle)
- [ ] Set up screen recording (optional, with consent)

**Materials Preparation:**

- [ ] Print codon charts (1 per student + extras)
- [ ] Print worksheets (Lesson 1-3, 1 per student)
- [ ] Print observation checklist (for observer)
- [ ] Prepare session handouts (see Appendices)

#### Observer Training

**If multiple observers:**

- [ ] Review observation protocol (see Section 5)
- [ ] Conduct practice observation (mock session)
- [ ] Calibrate rubrics (inter-rater reliability)
- [ ] Assign roles (primary observer, tech support, note-taker)

### 1 Week Before Session 1

**Pilot Rehearsal:**

- [ ] Run full Session 1 with colleague/volunteer
- [ ] Time all activities (ensure 60-minute fit)
- [ ] Test all examples on deployment URL
- [ ] Refine observation protocol based on rehearsal

**Final Logistics:**

- [ ] Confirm room reservation (computers, projector, tables)
- [ ] Send reminder email to participants (24 hours before)
- [ ] Prepare name tags and sign-in sheet
- [ ] Charge devices (laptops, tablets) if providing

---

## Session Observation Protocol

### Observer Roles

**Primary Observer (Educator/Researcher):**

- Lead instruction (follow lesson plans)
- Monitor student progress (circulate during activities)
- Record key observations (friction points, aha moments)
- Time critical metrics (time-to-first-artifact)

**Technical Support (Optional):**

- Troubleshoot device issues (browser crashes, network)
- Record bug reports (error messages, unexpected behaviors)
- Assist struggling students (without solving for them)

**Note-Taker (Optional):**

- Record verbatim quotes (student questions, comments)
- Document group dynamics (pair work, peer teaching)
- Capture non-verbal cues (frustration, excitement, confusion)

### Session 1 Observation (60 minutes)

#### Pre-Session (5 min before start)

- [ ] Set up recording equipment (if consent obtained)
- [ ] Distribute name tags and sign-in sheet
- [ ] Test all student devices (open CodonCanvas URL)

#### During Session

**Timing Checkpoint 1: Introduction (0-10 min)**

- [ ] Note: Are students engaged by hook (DNA → art)?
- [ ] Observe: Any questions about biology vs. programming?
- [ ] Record: Initial reactions to codon chart

**Timing Checkpoint 2: First Genome (10-20 min)**

- [ ] **START TIMER** when students begin typing "Hello Circle"
- [ ] **STOP TIMER** when first circle appears on canvas
- [ ] Record: Time-to-first-artifact for each student
  - Target: <5 minutes
  - Log: Student ID, time (MM:SS), issues encountered
- [ ] Observe: Common errors (typos, missing START/STOP, frame breaks)
- [ ] Note: How many students need help vs. self-debug?

**Timing Checkpoint 3: Silent Mutations (20-35 min)**

- [ ] Observe: Do students predict GGA → GGC = no change?
- [ ] Record: Aha moments when redundancy clicks
- [ ] Note: Confusion points (synonymous codon concept)

**Timing Checkpoint 4: Two-Shape Challenge (35-55 min)**

- [ ] Circulate: Which opcodes are hardest? (TRANSLATE hypothesis)
- [ ] Record: Creative strategies (trial-and-error vs. planning)
- [ ] Observe: Peer collaboration (helping vs. copying)

**Timing Checkpoint 5: Wrap-up (55-60 min)**

- [ ] Collect: Completed worksheets (Lesson 1)
- [ ] Administer: Quick exit survey (1 question, 5-point scale)
  - "How likely are you to return for Session 2?" (1=not at all, 5=definitely)
- [ ] Record: Verbal feedback (optional 1-minute share-out)

#### Post-Session (Immediate)

- [ ] Debrief: Observer notes (what worked, what didn't)
- [ ] Backup: Save all student .genome files (if using shared folder)
- [ ] Technical: Log any bugs or performance issues
- [ ] Prepare: Adjustments for Session 2 (if critical issues)

### Session 2 Observation (60 minutes)

#### During Session

**Focus Areas:**

- **Mutation classification accuracy** (during Worksheet 2.3)
- **Frameshift confusion** (hypothesis: hardest mutation type)
- **Visual prediction skills** (do students guess before running?)
- **Engagement with biological parallels** (do they connect to real DNA?)

**Key Observations:**

- [ ] Time: How long for students to complete 8 mutation challenges?
- [ ] Accuracy: Circulate and note correct vs. incorrect classifications
- [ ] Confusion: Which mutation types trigger most questions?
- [ ] Strategies: Do students use systematic testing or random guessing?

### Session 3 Observation (60 minutes)

#### During Session

**Focus Areas:**

- **Creative composition quality** (complexity, originality)
- **Transform operation mastery** (do students use TRANSLATE, ROTATE, SCALE confidently?)
- **"Evolution" understanding** (do students grasp cumulative mutation effects?)
- **Overall confidence** (compare to Session 1 hesitancy)

**Key Observations:**

- [ ] Independence: How much instructor help is needed?
- [ ] Complexity: Are students using ≥5 opcodes as required?
- [ ] Debugging: Can students identify and fix their own errors?
- [ ] Engagement: Are students experimenting beyond minimum requirements?

#### Post-Session (Final)

- [ ] Administer: Post-assessment (same 10 questions as pre-assessment)
- [ ] Administer: Satisfaction survey (see Appendix B)
- [ ] Collect: All student work (.genome files, worksheets)
- [ ] Optional: Brief interview (5 students, 10 minutes each)

---

## Data Collection Instruments

### Instrument 1: Pre/Post Assessment

**Purpose:** Measure learning gains (genetic concepts + computational thinking)

**Format:** 10 multiple-choice questions (5 biology, 5 CS)

**Timing:**

- **Pre:** 1 week before Session 1 (online, 10 minutes)
- **Post:** End of Session 3 (paper or online, 10 minutes)

**Sample Questions:**

**Biology Questions:**

1. Which of the following is a stop codon?
   - A) ATG B) GGA C) TAA ✓ D) CCA

2. What is a silent mutation?
   - A) Mutation with no effect on output ✓
   - B) Mutation that stops the program
   - C) Mutation that scrambles everything
   - D) Mutation that deletes a base

3. Why are frameshift mutations often harmful?
   - A) They delete important codons
   - B) They change reading frame downstream ✓
   - C) They always cause stop codons
   - D) They are not harmful

4. What is genetic redundancy?
   - A) Extra DNA that does nothing
   - B) Multiple codons for same amino acid ✓
   - C) Mutations that happen twice
   - D) Backup copies of genes

5. In real DNA, how many bases code for one amino acid?
   - A) 1 B) 2 C) 3 ✓ D) 4

**Computational Thinking Questions:**

1. What is a stack in programming?

   - A) Pile of instructions to execute
   - B) Last-in-first-out data structure ✓
   - C) List of variables
   - D) Type of loop

2. What does PUSH GAA CCC do?
   - A) Draws a shape
   - B) Adds number 21 to stack ✓
   - C) Moves the cursor
   - D) Changes color

3. If a program needs 2 numbers but stack only has 1, what happens?
   - A) Program crashes with stack underflow ✓
   - B) Program uses 0 for missing number
   - C) Program skips the instruction
   - D) Program asks user for input

4. What is abstraction in programming?
   - A) Making code confusing
   - B) Hiding complex details behind simple interface ✓
   - C) Deleting unnecessary code
   - D) Using only letters, no numbers

5. What is debugging?
   - A) Writing code without errors
   - B) Finding and fixing errors ✓
   - C) Deleting a program
   - D) Adding comments to code

**Scoring:**

- 1 point per correct answer (max 10 points)
- Calculate: % improvement = (post_score - pre_score) / (10 - pre_score) × 100%
- Target: Median improvement ≥30%

### Instrument 2: Time-to-First-Artifact Tracking

**Purpose:** Validate usability (MVP target: <5 minutes)

**Method:**

- **Timer:** Stopwatch or digital timer (phone app)
- **Start Event:** Instructor says "Begin typing your first genome"
- **Stop Event:** Student raises hand + canvas shows correct circle

**Data Sheet:**

| Student ID | Start Time | Stop Time | Duration (MM:SS) | Issues Encountered | Notes                      |
| ---------- | ---------- | --------- | ---------------- | ------------------ | -------------------------- |
| P01        | 10:15:00   | 10:18:30  | 03:30 ✓          | None               | Completed independently    |
| P02        | 10:15:05   | 10:22:10  | 07:05 ⚠️          | Typo (ATF → ATG)   | Needed hint                |
| P03        | 10:15:02   | 10:19:45  | 04:43 ✓          | Frame error        | Self-corrected with linter |
| ...        |            |           |                  |                    |                            |

**Analysis:**

- Calculate: Median, mean, min, max times
- Target: ≥80% of students <5 minutes
- Identify: Common failure modes (typos, frame errors, missing START)

### Instrument 3: Mutation Classification Accuracy

**Purpose:** Assess mutation type identification skills (target: >70% post-assessment)

**Method:**

- Use built-in assessment system (`assessment-demo.html`)
- Students complete 10 "Medium" difficulty challenges
- Export results as JSON (automatic scoring)

**Data Collected:**

- Overall accuracy (%)
- Accuracy by mutation type (silent, missense, nonsense, frameshift)
- Time per challenge
- Attempts per challenge (guessing indicator)

**Analysis:**

```json
{
  "progress": {
    "totalAttempts": 10,
    "correctAnswers": 8,
    "accuracy": 80.0,
    "byType": {
      "silent": { "correct": 9, "total": 10 },
      "missense": { "correct": 8, "total": 10 },
      "nonsense": { "correct": 7, "total": 10 },
      "frameshift": { "correct": 4, "total": 10 } // ⚠️ Needs review
    }
  }
}
```

**Interpretation:**

- Accuracy ≥70% overall: Target met ✓
- Frameshift <60%: Common struggle (anticipated)
- Use per-type data to refine Lesson 2

### Instrument 4: Satisfaction Survey (Post-Session 3)

**Purpose:** Measure user satisfaction (target: >80% positive)

**Format:** 8 questions, 5-point Likert scale (1=strongly disagree, 5=strongly agree)

**Questions:**

1. **Enjoyment:** "I enjoyed learning with CodonCanvas."
   - 1 = Strongly Disagree → 5 = Strongly Agree ✓

2. **Understanding:** "CodonCanvas helped me understand genetic mutations better."
   - 1 = Strongly Disagree → 5 = Strongly Agree ✓

3. **Ease of Use:** "The CodonCanvas interface was easy to use."
   - 1 = Strongly Disagree → 5 = Strongly Agree ✓

4. **Engagement:** "I was engaged throughout the 3 sessions."
   - 1 = Strongly Disagree → 5 = Strongly Agree ✓

5. **Recommend:** "I would recommend CodonCanvas to a friend."
   - 1 = Strongly Disagree → 5 = Strongly Agree ✓

6. **Biology Connection:** "CodonCanvas helped me see connections between programming and biology."
   - 1 = Strongly Disagree → 5 = Strongly Agree ✓

7. **Future Use:** "I would use CodonCanvas again if available."
   - 1 = Strongly Disagree → 5 = Strongly Agree ✓

8. **Open-Ended:** "What did you like most about CodonCanvas? What would you improve?"
   - Free text response

**Scoring:**

- Calculate: Mean rating per question, overall mean
- Target: ≥4.0 average (80% positive)
- Analyze: Open-ended responses for themes (praise, criticism)

### Instrument 5: Observation Checklist

**Purpose:** Structured qualitative observation during sessions

**Format:** Observer checklist with yes/no + notes

#### Engagement Indicators

- [ ] Students ask questions spontaneously
- [ ] Students help each other without prompting
- [ ] Students experiment beyond minimum requirements
- [ ] Students express excitement (verbal/non-verbal)
- [ ] Students stay on-task (minimal off-topic browsing)

**Notes:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

#### Confusion Indicators

- [ ] Students re-read instructions multiple times
- [ ] Students ask "what does this mean?" repeatedly
- [ ] Students appear stuck for >3 minutes
- [ ] Students attempt same error multiple times
- [ ] Students request instructor help frequently

**Confused Concepts:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

#### Technical Issues

- [ ] Browser crashes or freezes
- [ ] Playground fails to load
- [ ] Linter provides incorrect feedback
- [ ] Examples fail to run
- [ ] Canvas rendering errors

**Bug Details:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

#### Biological Connections

- [ ] Students mention real DNA/genes
- [ ] Students ask "is this how real DNA works?"
- [ ] Students connect mutations to diseases
- [ ] Students discuss evolutionary implications
- [ ] Students critique differences from biology

**Quotes:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

### Instrument 6: Technical Performance Log

**Purpose:** Document device compatibility and performance

**Format:** Spreadsheet with device/browser matrix

| Device      | OS       | Browser    | Session | Load Time | Render Perf   | Issues |
| ----------- | -------- | ---------- | ------- | --------- | ------------- | ------ |
| MacBook Pro | macOS 14 | Chrome 120 | 1       | 1.2s      | Smooth        | None   |
| iPad Air    | iOS 17   | Safari 17  | 1       | 2.5s      | Smooth        | None   |
| Chromebook  | ChromeOS | Chrome 119 | 1       | 3.1s      | Laggy (NOISE) | ⚠️      |
| ...         |          |            |         |           |               |        |

**Metrics:**

- **Load Time:** Time from URL enter to playground ready
- **Render Performance:** Smooth (60fps) / Acceptable (30fps) / Laggy (<30fps)
- **Issues:** Any errors, crashes, visual glitches

---

## Post-Pilot Analysis

### Data Analysis Workflow

#### Week 6: Data Aggregation (2-3 days)

**1. Quantitative Data Processing:**

- [ ] Compile pre/post assessment scores (Excel/Google Sheets)
- [ ] Calculate learning gains (% improvement per student)
- [ ] Aggregate time-to-first-artifact data (median, range)
- [ ] Compile mutation classification accuracy (overall + by type)
- [ ] Aggregate satisfaction survey ratings (mean per question)
- [ ] Calculate retention rate (attendance across 3 sessions)

**2. Qualitative Data Coding:**

- [ ] Transcribe observation notes (typed, organized by theme)
- [ ] Code open-ended survey responses (thematic analysis)
- [ ] Extract representative quotes (praise, criticism, confusion)
- [ ] Identify recurring themes (usability issues, pedagogical gaps)

#### Week 6: Analysis & Interpretation (3-4 days)

**Primary Metrics Evaluation:**

**1. Time-to-First-Artifact (<5 min target)**

```
Result: 8/10 students <5 min (80%) ✓ TARGET MET
Median: 4:15, Range: 2:30 - 8:45
Outliers: P02 (typo), P07 (frame error requiring instructor help)
Conclusion: Usability validated, consider linter auto-fix for outliers
```

**2. Retention (>80% target)**

```
Result: 9/10 students attended all 3 sessions (90%) ✓ TARGET EXCEEDED
Dropout: P05 (scheduling conflict, not due to dissatisfaction)
Conclusion: Engagement strong, scheduling robust
```

**3. Mutation Accuracy (>70% target)**

```
Result: 8/10 students >70% accuracy (80%) ✓ TARGET MET
Median accuracy: 75%, Range: 55% - 95%
By Type:
  - Silent: 88% (strong grasp)
  - Missense: 82% (good understanding)
  - Nonsense: 78% (adequate)
  - Frameshift: 53% (⚠️ needs reinforcement)
Conclusion: Overall target met, frameshift requires additional scaffolding
```

**4. Satisfaction (>80% positive target)**

```
Result: Mean rating 4.3/5.0 (86% positive) ✓ TARGET EXCEEDED
Highest: Q1 (Enjoyment) 4.7/5.0, Q5 (Recommend) 4.6/5.0
Lowest: Q3 (Ease of Use) 3.9/5.0 (still positive but needs polish)
Conclusion: High satisfaction, minor usability friction
```

**Secondary Insights:**

**Pedagogical Findings:**

- **Frameshift Challenge:** Confirmed hypothesis (lowest accuracy at 53%)
  - Recommendation: Add visual demo (physical cards showing frame shift)
  - Consider: Interactive frameshift visualization tool
- **Silent Mutation Success:** High accuracy (88%) indicates redundancy concept clear
- **Transform Operations:** TRANSLATE caused confusion (45% needed help)
  - Recommendation: Add coordinate system visual aid

**Usability Findings:**

- **Linter Effectiveness:** 9/10 students used linter to self-correct
- **Friction Point:** Base-4 encoding confusing for 6/10 students
  - Recommendation: Provide number-to-codon lookup table
- **Mobile Experience:** iPad users (3/10) reported smaller screen challenging
  - Recommendation: Improve mobile responsive layout (collapsible panels)

**Technical Findings:**

- **Browser Compatibility:** 10/10 devices ran successfully
- **Performance:** Chromebook lagged with NOISE opcode (3/10 students)
  - Recommendation: Optimize NOISE rendering or add "low performance mode"
- **Bugs Identified:** None critical, 2 minor (logged in GitHub Issues)

### Report Structure

**Pilot Evaluation Report Outline:**

```markdown
# CodonCanvas Pilot Evaluation Report

## Executive Summary

- Pilot overview (10 students, 3 sessions, Week 5)
- Primary metrics results (all targets met/exceeded)
- Key recommendation: Proceed to wider deployment with minor refinements

## Methodology

- Participant demographics
- Data collection instruments
- Analysis methods

## Results

### Primary Metrics

- Time-to-first-artifact: 80% <5 min ✓
- Retention: 90% ✓
- Mutation accuracy: 80% >70% ✓
- Satisfaction: 86% positive ✓

### Secondary Insights

- Pedagogical findings (frameshift challenge)
- Usability findings (base-4 confusion)
- Technical findings (Chromebook performance)

## Discussion

- What worked well (redundancy concept, linter, engagement)
- What needs improvement (frameshift scaffolding, mobile layout)
- Unexpected findings (peer teaching emergence)

## Recommendations

### Immediate (Week 7-8)

- Add frameshift visual demo
- Provide number-to-codon lookup table
- Optimize mobile responsive layout

### Future (Phase D)

- Interactive frameshift visualization tool
- Low-performance mode for older devices
- Expanded example library (10 more examples)

## Conclusion

- MVP validated for wider deployment
- Minor refinements needed (documented above)
- Proceed with 50-student pilot (Week 9-10)

## Appendices

- Raw data (pre/post scores, time logs, survey results)
- Student quotes (representative excerpts)
- Technical logs (device matrix, bug reports)
```

### Decision Framework

**Based on pilot results, decide:**

**GREEN LIGHT (Proceed to Wider Deployment):**

- ✅ All 4 primary metrics met
- ✅ High satisfaction (>80%)
- ✅ No critical bugs
- ✅ Strong engagement/retention

**YELLOW LIGHT (Iterate Before Scaling):**

- ⚠️ 2-3 metrics partially met (60-80%)
- ⚠️ Moderate satisfaction (60-80%)
- ⚠️ Usability friction points
- ⚠️ Need pedagogical refinements

**RED LIGHT (Major Rework Needed):**

- ❌ <2 metrics met
- ❌ Low satisfaction (<60%)
- ❌ Critical bugs blocking usage
- ❌ Fundamental pedagogical issues

---

## Appendices

### Appendix A: Consent Form Template

```
INFORMED CONSENT FOR RESEARCH PARTICIPATION

Study Title: CodonCanvas Pilot Evaluation
Principal Investigator: [Your Name, Institution]
IRB Protocol: [Number, if applicable]

PURPOSE:
You are invited to participate in a pilot study evaluating CodonCanvas, an educational programming language for learning genetic concepts. The study involves 3 × 60-minute sessions where you will learn to write DNA-like code that produces visual outputs.

PROCEDURES:
- Complete pre-assessment (10 minutes, online)
- Attend 3 learning sessions (60 minutes each)
- Complete post-assessment and survey (15 minutes)
- Optional: 10-minute interview

RISKS:
Minimal risk. Possible mild frustration with coding challenges.

BENEFITS:
- Learn programming and genetics concepts
- Receive completion certificate
- Contribute to educational research

CONFIDENTIALITY:
Your identity will be kept confidential. Data will be anonymized (assigned participant ID: P01-P10). Only aggregated results will be reported.

VOLUNTARY:
Participation is voluntary. You may withdraw at any time without penalty.

CONSENT:
I have read this form and agree to participate.

Signature: _____________________ Date: _________
Parent/Guardian (if <18): _____________________ Date: _________
```

### Appendix B: Session Handouts

**Handout 1: Codon Chart (1-page, double-sided)**

- Front: All 64 codons organized by opcode family (color-coded)
- Back: Base-4 encoding table (AAA=0, TTT=63)

**Handout 2: Quick Start Guide (1-page)**

- Step-by-step first genome
- Common errors and fixes
- Where to get help

**Handout 3: Mutation Reference Card (1-page)**

- 4 mutation types with examples
- Visual phenotype predictions
- Biological parallels

### Appendix C: Observer Training Script

**Pre-Pilot Training (30 minutes):**

**Part 1: Protocol Review (10 min)**

- Walk through observation checklist
- Review timing checkpoints
- Practice using stopwatch for time-to-first-artifact

**Part 2: Calibration Exercise (15 min)**

- Watch 5-minute mock video
- Independently fill out checklist
- Compare notes (inter-rater reliability)
- Discuss discrepancies

**Part 3: Logistics (5 min)**

- Assign roles (if multiple observers)
- Review emergency procedures (tech failure, student distress)
- Confirm communication protocol (silent signals during session)

### Appendix D: Data Privacy Protocol

**GDPR/FERPA Compliance:**

**Data Collection:**

- Anonymize immediately (assign P01-P10 IDs)
- Store consent forms separately from data
- Encrypt digital data (password-protected files)
- No identifying info in reports (names, photos without consent)

**Data Storage:**

- Secure location (locked cabinet or encrypted drive)
- Access limited to research team
- Retention period: 3 years (or per IRB protocol)
- Destruction method: Shred paper, securely delete digital

**Data Sharing:**

- Only aggregated results published
- Individual data shared only if explicitly consented
- De-identified datasets may be shared with collaborators (with IRB approval)

### Appendix E: Contingency Plans

**Plan A: Technical Failure (Web Deployment Down)**

- **Backup:** Offline HTML bundle on USB drives
- **Action:** Distribute USBs, run locally
- **Time Cost:** 5-minute delay

**Plan B: Low Attendance (<8 students)**

- **Threshold:** If <8 students show for Session 1
- **Action:** Recruit 2-3 drop-in participants (same criteria)
- **Alternative:** Proceed with smaller N, acknowledge in report

**Plan C: Major Usability Blocker (>50% students stuck)**

- **Trigger:** If >50% cannot complete first genome in 15 minutes
- **Action:** Pause, demonstrate again, provide partially complete template
- **Log:** Document issue for urgent fix before Session 2

**Plan D: Student Distress (Frustration, Anxiety)**

- **Recognize:** Student expressing strong negative emotion
- **Action:** Offer break, one-on-one support, option to withdraw
- **Follow-up:** Debrief with participant, assess if pilot design issue

### Appendix F: Timeline Checklist

**Week 3 (2 weeks before pilot):**

- [ ] Finalize participant roster (10 confirmed)
- [ ] Send welcome email + pre-assessment link
- [ ] Deploy CodonCanvas to production URL
- [ ] Print all materials (codon charts, worksheets, consent forms)

**Week 4 (1 week before pilot):**

- [ ] Collect pre-assessment responses (follow up on missing)
- [ ] Conduct pilot rehearsal (1-hour mock session)
- [ ] Confirm room reservation + tech setup
- [ ] Send 24-hour reminder email

**Week 5 (Pilot Sessions):**

- **Session 1 (Day 1):** Collect consents, administer Lesson 1, track time-to-first-artifact
- **Session 2 (Day 3):** Administer Lesson 2, focus on mutation classification
- **Session 3 (Day 5):** Administer Lesson 3, collect post-assessment + survey

**Week 6 (Analysis):**

- [ ] Aggregate quantitative data (Days 1-2)
- [ ] Code qualitative data (Days 3-4)
- [ ] Write pilot report (Days 5-7)
- [ ] Share findings with stakeholders (Day 8)

**Week 7 (Iteration):**

- [ ] Prioritize recommendations (high/medium/low impact)
- [ ] Implement urgent fixes (critical usability issues)
- [ ] Update documentation (based on findings)
- [ ] Plan next pilot (50 students) or deployment

---

## Contact & Support

**Questions During Pilot?**

- **Technical Issues:** [Your email/Slack channel]
- **Participant Concerns:** [Student support contact]
- **Research Ethics:** [IRB coordinator, if applicable]

**Post-Pilot Collaboration:**

- Share findings: [Community forum/GitHub Discussions]
- Contribute improvements: [GitHub repository]
- Request custom features: [Feature request form]

---

**🎓 Ready to pilot? Review checklist, gather materials, and validate CodonCanvas with real students! 🧬**

**Document Version:** 1.0.0
**Last Updated:** 2025-10-12
**Next Review:** After pilot completion (Week 6)
