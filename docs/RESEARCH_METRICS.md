# CodonCanvas Research Metrics Guide

**Version:** 1.0.0
**Date:** October 2025
**For:** Educators, Researchers, and Institutional Review Boards

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start for Educators](#quick-start-for-educators)
3. [Data Privacy & Ethics](#data-privacy--ethics)
4. [IRB Submission Guide](#irb-submission-guide)
5. [CSV Data Format](#csv-data-format)
6. [Data Analysis Workflow](#data-analysis-workflow)
7. [Research Dashboard Guide](#research-dashboard-guide)
8. [Troubleshooting](#troubleshooting)

---

## Overview

CodonCanvas includes **privacy-respecting research instrumentation** to measure learning effectiveness, engagement patterns, and tool usage. This system enables empirical validation of educational outcomes while protecting student privacy.

### Key Features

✅ **Privacy-First Design**

- No personally identifiable information (PII) collected
- All data stored locally on user's device (localStorage)
- No automatic transmission to servers
- User-controlled data export and deletion

✅ **Opt-In Only**

- Research metrics **disabled by default**
- Explicit consent required before data collection
- Users can disable anytime
- Transparent data visibility

✅ **Research-Ready**

- Publication-quality metrics (time-to-first-artifact, engagement, retention)
- CSV export for statistical analysis (SPSS, R, Python)
- Compatible with standard research designs (RCT, pre/post, longitudinal)
- IRB-compliant data collection procedures

### What Gets Tracked

**Session Metrics:**

- Session duration (start/end timestamps)
- Session ID (anonymous UUID, no student identification)

**Learning Activity:**

- Genomes created (count)
- Genomes executed successfully (count)
- Time to first artifact (key learning velocity metric)
- Errors encountered (type and count for debugging)

**Feature Usage:**

- Mutation types applied (silent, missense, nonsense, frameshift, point, insertion, deletion)
- Render modes used (visual, audio, both)
- Tool usage (diff viewer, timeline scrubber, evolution lab, assessment system, export)

**What's NOT Tracked:**

- ❌ Student names, emails, or IDs
- ❌ Student genome source code content
- ❌ IP addresses or location data
- ❌ Browsing history or external behavior
- ❌ Demographic information (unless separately collected with consent)

---

## Quick Start for Educators

### Step 1: Obtain Consent (REQUIRED)

Before enabling research metrics, you **must** obtain appropriate consent:

**For Students ≥18 years:** Individual informed consent
**For Students <18 years:** Parental consent + student assent

See [IRB Submission Guide](#irb-submission-guide) for consent form templates.

### Step 2: Enable Research Metrics (Classroom Setup)

**Option A: Individual Student Setup**

1. Open CodonCanvas playground (`index.html`)
2. Students enable research metrics (future: UI toggle in playground settings)
3. Students use CodonCanvas normally - data auto-saves every 30 seconds

**Option B: Educator-Configured Setup** (future enhancement)

1. Create custom CodonCanvas build with research metrics pre-enabled
2. Deploy to classroom computers or LMS
3. Students use without additional configuration

**Current Status:** Option A only (manual toggle in browser console)

**Temporary Enable Instructions (until UI added):**

```javascript
// Open browser console (F12), paste:
import("./src/research-metrics.js").then((m) => {
  const metrics = new m.ResearchMetrics();
  metrics.enable();
  console.log("Research metrics enabled ✓");
});
```

### Step 3: Collect Data

Students use CodonCanvas normally. Research metrics automatically track:

- Every genome creation and execution
- Every mutation applied
- Every tool used (diff viewer, timeline, etc.)
- All errors encountered

Data saves every 30 seconds to browser localStorage.

### Step 4: Export Data

**Method 1: Research Dashboard (Recommended)**

1. Open `research-dashboard.html` in same browser
2. View aggregate statistics and session table
3. Click "📊 Export CSV" button
4. Save CSV file (e.g., `pilot_study_oct2025.csv`)

**Method 2: Browser Console Export**

```javascript
import("./src/research-metrics.js").then((m) => {
  const metrics = new m.ResearchMetrics();
  const csv = metrics.exportCSV();

  // Download CSV
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "codoncanvas_metrics.csv";
  a.click();
});
```

### Step 5: Analyze Data

Use provided analysis script:

```bash
npm run metrics:analyze -- --data pilot_study_oct2025.csv
```

See [Data Analysis Workflow](#data-analysis-workflow) for details.

---

## Data Privacy & Ethics

### FERPA Compliance (Family Educational Rights and Privacy Act)

CodonCanvas research metrics are designed to comply with FERPA:

✅ **No PII Collected**

- Session IDs are anonymous UUIDs (not student names/IDs)
- No linkage to student educational records
- Aggregate statistics only

✅ **Local Storage Only**

- Data remains on student's device (not transmitted)
- No server-side collection or storage
- Educator must explicitly export data

✅ **Parental Rights**

- Parents can request data inspection (`research-dashboard.html`)
- Parents can delete data (browser localStorage clear)
- Data collection is optional (opt-in consent required)

**FERPA Risk Assessment:** **LOW** - Metrics do not constitute "education records" under FERPA as they lack student identification and are not maintained by educational institution.

### COPPA Compliance (Children's Online Privacy Protection Act)

For students under 13 years:

✅ **Parental Consent Required**

- School must obtain verifiable parental consent before enabling
- Use provided consent form template (see below)

✅ **Data Minimization**

- Only educational activity metrics collected
- No contact information or persistent identifiers tied to individual children

✅ **Deletion Rights**

- Parents can request data deletion anytime
- Educator must provide clear deletion instructions

**COPPA Risk Assessment:** **LOW** - Anonymous usage metrics with parental consent.

### IRB Review Requirements

**Exempt Research Categories** (likely applies):

✅ **Category 1 - Educational Settings**

- Research conducted in established educational settings
- Involves normal educational practices (programming instruction)
- Anonymous or coded data (session IDs not linkable to students)

**Criteria for Exemption:**

- Minimal risk to participants
- No identifiable private information
- Normal classroom activities
- Educational benefit

**If NOT Exempt** (IRB approval needed):

- Research involves vulnerable populations in atypical context
- Data linkage to sensitive student records
- Higher-than-minimal risk

**Recommendation:** Submit for exempt determination with emphasis on:

- Anonymous data collection (no PII)
- Educational setting (normal classroom use)
- Minimal risk (usage metrics only)

---

## IRB Submission Guide

### Informed Consent Template (Students ≥18)

```
INFORMED CONSENT FOR RESEARCH PARTICIPATION

Study Title: Evaluating DNA-Inspired Programming for Genetics Education
Principal Investigator: [Your Name], [Institution]
IRB Protocol #: [Assigned by IRB]

PURPOSE
You are invited to participate in a research study evaluating the effectiveness
of CodonCanvas, a DNA-inspired programming language for teaching genetic concepts.
This study aims to measure learning outcomes and engagement patterns.

PROCEDURES
If you agree to participate, you will:
- Use CodonCanvas as part of your normal coursework
- Have anonymous usage metrics collected (session duration, activities, errors)
- Complete pre/post assessments of genetic mutation concepts (separate)

Your participation involves NO additional time beyond normal class activities.

DATA COLLECTED
- Session duration and timestamps
- Number of programs created and executed
- Types of mutations applied (silent, missense, nonsense, frameshift)
- Tool usage (diff viewer, timeline, etc.)
- Errors encountered

DATA NOT COLLECTED (Privacy Protection):
- Your name, email, or student ID
- Your program source code content
- Your IP address or location
- Any personally identifiable information

DATA STORAGE & CONFIDENTIALITY
- Data stored locally on your device (browser localStorage)
- You control data export (via research dashboard)
- Data will be aggregated for analysis (no individual identification)
- Research publications will report group statistics only

RISKS
Minimal risk. Data collection is anonymous and involves only your usage of an
educational tool. There are no risks beyond those of normal classroom computer use.

BENEFITS
- Direct benefit: Learning genetics through interactive programming
- Societal benefit: Improved understanding of effective genetics education
- You will NOT receive compensation for participation

VOLUNTARY PARTICIPATION
Your participation is completely voluntary. You may:
- Decline to participate without penalty
- Withdraw at any time (data can be deleted)
- Skip any activities you prefer not to complete

Your grade will NOT be affected by your decision to participate or not participate.

QUESTIONS & CONTACT
For questions about this study:
- [Your Name], [Email], [Phone]

For questions about your rights as a research participant:
- [Institution IRB Contact], [Email], [Phone]

CONSENT
I have read this consent form. I have had the opportunity to ask questions.
I voluntarily agree to participate in this research study.

___________________________    __________
Participant Signature           Date

___________________________
Participant Name (printed)
```

### Parental Consent Template (Students <13)

```
PARENTAL CONSENT FOR RESEARCH PARTICIPATION

Study Title: Evaluating DNA-Inspired Programming for Genetics Education
Principal Investigator: [Your Name], [Institution]

Dear Parent/Guardian,

Your child is invited to participate in a research study about a new educational
tool called CodonCanvas. This letter explains the study and requests your permission
for your child to participate.

WHAT IS THE STUDY ABOUT?
We are testing whether CodonCanvas, a DNA-inspired programming language, helps
students learn genetic concepts like mutations. Your child's class will use
CodonCanvas as part of their normal science curriculum.

WHAT WILL MY CHILD DO?
Your child will:
- Use CodonCanvas during regular class time (no extra time required)
- Have their usage patterns measured anonymously (how long they use it, what
  activities they complete, what errors they encounter)
- Complete short quizzes about mutations (pre/post assessment, separate from metrics)

WHAT DATA WILL BE COLLECTED?
Anonymous usage metrics ONLY:
- Session duration (how long your child used CodonCanvas)
- Number of programs created
- Types of mutations practiced
- Tools used (diff viewer, timeline, etc.)

NO PERSONAL INFORMATION:
- NOT collected: Name, student ID, email, location, or program content
- Your child cannot be identified from this data

IS MY CHILD'S DATA SAFE?
YES. All data stays on your child's device (not sent to any server). You can:
- View exactly what data is collected (research dashboard)
- Delete all data at any time (clear browser storage)
- Ask questions about data use

WHAT ARE THE RISKS?
Minimal risk. This is an anonymous measurement of normal educational activities.

WHAT ARE THE BENEFITS?
- Your child learns genetics through interactive programming
- Helps researchers improve science education

IS PARTICIPATION REQUIRED?
NO. Participation is completely voluntary:
- Your child's grade will NOT be affected
- Your child can stop participating anytime
- You can request data deletion anytime

QUESTIONS?
Contact: [Your Name], [Email], [Phone]
IRB Questions: [Institution IRB], [Email], [Phone]

PERMISSION
☐ I GIVE permission for my child to participate
☐ I DO NOT give permission for my child to participate

Parent/Guardian Name: _______________________
Child's Name: _______________________
Signature: _______________________  Date: __________
```

### Student Assent Script (<13 years, verbal)

```
Hi! We're using a new programming tool called CodonCanvas to learn about DNA mutations.
We'd like to measure how well it works by tracking how you use it - like how long
you spend, what activities you do, and what errors you see.

We WON'T collect your name or your programs - just anonymous numbers.

Your parent already said it's okay, but it's YOUR choice too. You can:
- Say yes and help us learn how to teach genetics better
- Say no and still use CodonCanvas (we just won't track your usage)
- Change your mind later

Do you want to participate? You can ask me questions first!
```

### IRB Protocol Outline

**Section 1: Study Overview**

- **Title:** Evaluating CodonCanvas for Genetics Education
- **Purpose:** Measure learning effectiveness and engagement with DNA programming
- **Design:** [Pre/post, RCT, longitudinal - specify your design]
- **Sample:** [Target N, age range, recruitment method]

**Section 2: Risks & Benefits**

- **Risks:** Minimal (anonymous educational metrics)
- **Benefits:** Improved genetics education pedagogy
- **Risk Mitigation:** No PII collection, local storage, opt-in consent

**Section 3: Data Collection**

- **What:** Usage metrics (session duration, activities, errors)
- **How:** Automated browser localStorage (ResearchMetrics class)
- **Storage:** Local device only (no server transmission)
- **Retention:** Exported for analysis, then deleted from devices

**Section 4: Privacy & Confidentiality**

- **Identifiers:** None (anonymous UUIDs only)
- **Linkage:** No linkage to student records
- **Aggregation:** All reporting is group-level statistics
- **Compliance:** FERPA, COPPA, institutional policies

**Section 5: Consent Process**

- **Adults:** Informed consent form (see template above)
- **Minors:** Parental consent + student assent (see templates above)
- **Timing:** Before research metrics enabled
- **Documentation:** Signed forms retained per IRB requirements

**Section 6: Data Sharing**

- **Publications:** Aggregate statistics only
- **Open Data:** De-identified data may be shared with research community
- **Repository:** [Specify if depositing in OSF, Dataverse, etc.]

---

## CSV Data Format

Research metrics export to CSV with the following columns:

### Session-Level Fields

| Column                | Type   | Description                   | Example          |
| --------------------- | ------ | ----------------------------- | ---------------- |
| `sessionId`           | string | Anonymous UUID                | `"a7f3c2d1-..."` |
| `startTime`           | number | Unix timestamp (ms)           | `1729123456789`  |
| `endTime`             | number | Unix timestamp (ms)           | `1729125000000`  |
| `duration`            | number | Milliseconds                  | `1543211`        |
| `genomesCreated`      | number | Total genomes created         | `12`             |
| `genomesExecuted`     | number | Successful executions         | `11`             |
| `mutationsApplied`    | number | Total mutations               | `37`             |
| `timeToFirstArtifact` | number | Milliseconds to first success | `342000`         |

### Render Mode Fields

| Column              | Type   | Description              |
| ------------------- | ------ | ------------------------ |
| `renderMode_visual` | number | Visual-only executions   |
| `renderMode_audio`  | number | Audio-only executions    |
| `renderMode_both`   | number | Multi-sensory executions |

### Mutation Type Fields

| Column                | Type   | Description                    |
| --------------------- | ------ | ------------------------------ |
| `mutation_silent`     | number | Silent mutations applied       |
| `mutation_missense`   | number | Missense mutations applied     |
| `mutation_nonsense`   | number | Nonsense mutations applied     |
| `mutation_frameshift` | number | Frameshift mutations applied   |
| `mutation_point`      | number | Point mutations (generic)      |
| `mutation_insertion`  | number | Insertion mutations (3+ bases) |
| `mutation_deletion`   | number | Deletion mutations (3+ bases)  |

### Feature Usage Fields

| Column               | Type   | Description            |
| -------------------- | ------ | ---------------------- |
| `feature_diffViewer` | number | Diff viewer opens      |
| `feature_timeline`   | number | Timeline scrubber uses |
| `feature_evolution`  | number | Evolution lab uses     |
| `feature_assessment` | number | Assessment tool uses   |
| `feature_export`     | number | Export operations      |

### Error Tracking Fields

| Column       | Type   | Description               |
| ------------ | ------ | ------------------------- |
| `errorCount` | number | Total errors encountered  |
| `errorTypes` | string | JSON array of error types |

### Example CSV Row

```csv
sessionId,startTime,endTime,duration,genomesCreated,genomesExecuted,timeToFirstArtifact,mutationsApplied,renderMode_visual,renderMode_audio,renderMode_both,mutation_silent,mutation_missense,mutation_nonsense,mutation_frameshift,mutation_point,mutation_insertion,mutation_deletion,feature_diffViewer,feature_timeline,feature_evolution,feature_assessment,feature_export,errorCount,errorTypes
"a7f3c2d1-4b5e-6f8a-9d0c-1e2f3a4b5c6d",1729123456789,1729125000000,1543211,12,11,342000,37,8,2,1,15,10,8,4,0,0,0,5,3,1,0,2,3,"[""parse"",""execution"",""parse""]"
```

---

## Data Analysis Workflow

### Step 1: Export CSV from Research Dashboard

1. Open `research-dashboard.html`
2. Click "📊 Export CSV"
3. Save file (e.g., `study1_metrics.csv`)

### Step 2: Run Automated Analysis

```bash
npm run metrics:analyze -- --data study1_metrics.csv
```

**Output:**

- Descriptive statistics (mean, SD, median, range)
- Engagement metrics (session duration trends, retention rate)
- Learning velocity (time-to-first-artifact distribution)
- Tool adoption patterns (feature usage frequencies)
- Render mode preferences (visual vs audio vs multi-sensory)
- Publication-ready tables and figures

### Step 3: Review Analysis Report

Analysis script generates:

- `study1_metrics_report.txt` - Text summary
- `study1_metrics_stats.json` - Machine-readable statistics
- `study1_metrics_charts.html` - Interactive visualizations

### Step 4: Advanced Analysis (Manual)

For custom analysis, import CSV into your preferred tool:

**R:**

```r
data <- read.csv("study1_metrics.csv")
summary(data$duration)
t.test(data$timeToFirstArtifact ~ data$renderMode_visual)
```

**Python (pandas):**

```python
import pandas as pd

df = pd.read_csv("study1_metrics.csv")
df["duration"].describe()
df.groupby(["renderMode_visual", "renderMode_audio"]).mean()
```

**SPSS:**

1. File → Import Data → CSV
2. Analyze → Descriptive Statistics → Descriptives
3. Analyze → Compare Means → Independent-Samples T Test

---

## Research Dashboard Guide

The research dashboard (`research-dashboard.html`) provides visual analytics and data export.

### Dashboard Sections

**1. Aggregate Metrics Cards**

- Total sessions
- Average session duration
- Total genomes created
- Total mutations applied
- Average time-to-first-artifact (learning velocity)
- Total errors encountered

**2. Visual Analytics Charts**

- Mutation type distribution (bar chart)
- Render mode preferences (bar chart)
- Feature usage frequencies (bar chart)

**3. Sessions Table**

- Last 20 sessions displayed
- Columns: Session ID, Date, Duration, Genomes, Mutations, Time-to-First, Errors
- Sortable by clicking column headers

**4. Data Export Controls**

- **📊 Export JSON:** Full data with metadata (archival)
- **📋 Export CSV:** Statistical analysis format (SPSS, R, Python)
- **🗑️ Clear All Data:** Delete all sessions (irreversible)

### Accessing the Dashboard

**Method 1: Direct File Access**

```
file:///path/to/codoncanvas/research-dashboard.html
```

**Method 2: Local Server** (recommended)

```bash
cd codoncanvas
npx http-server -p 8080
# Open http://localhost:8080/research-dashboard.html
```

**Method 3: GitHub Pages** (if deployed)

```
https://yourusername.github.io/codoncanvas/research-dashboard.html
```

### Dashboard Limitations

- Shows data from **current browser only** (localStorage is browser-specific)
- No cross-device aggregation (each device has separate data)
- No real-time updates (refresh page to see new data)

**Multi-Device Collection Strategy:**

1. Each student exports their CSV individually
2. Educator merges CSV files (concatenate rows)
3. Analyze merged dataset

---

## Troubleshooting

### No Data Appearing in Dashboard

**Cause:** Research metrics not enabled
**Solution:** Enable metrics in playground (see [Quick Start](#quick-start-for-educators))

**Cause:** Different browser used
**Solution:** Open dashboard in **same browser** as playground

**Cause:** Private/Incognito mode
**Solution:** localStorage disabled in private mode - use normal browser mode

### CSV Export Empty

**Cause:** No sessions recorded yet
**Solution:** Use CodonCanvas, then re-export

**Cause:** Sessions not saved
**Solution:** Wait 30 seconds (auto-save interval) or manually trigger save

### Analysis Script Errors

**Cause:** CSV format mismatch
**Solution:** Ensure CSV exported from ResearchMetrics (not hand-edited)

**Cause:** Missing dependencies
**Solution:** Run `npm install` first

### Data Lost After Browser Update

**Cause:** localStorage cleared
**Solution:** Export CSV regularly (weekly) to prevent data loss

### Multi-Device Data Collection

**Challenge:** Each device has separate localStorage
**Solution:**

1. Student 1 exports CSV → `student1.csv`
2. Student 2 exports CSV → `student2.csv`
3. Educator merges:
   ```bash
   cat student1.csv > merged.csv
   tail -n +2 student2.csv >> merged.csv  # Skip header
   tail -n +2 student3.csv >> merged.csv
   ```
4. Analyze `merged.csv`

---

## Frequently Asked Questions

### Can I collect data without IRB approval?

**No.** Research involving human subjects requires IRB review, even if anonymous. Submit for exempt determination first.

### Can students use CodonCanvas without metrics collection?

**Yes.** Research metrics are **opt-in only**. Students can fully use CodonCanvas with metrics disabled.

### How long should I collect data?

**Minimum:** 2-3 weeks for engagement patterns
**Recommended:** Full semester (15 weeks) for longitudinal analysis
**RCT:** Duration depends on intervention (4-8 weeks typical)

### Can I link metrics to student grades?

**Caution:** Linking to grades requires additional IRB justification (educational records access). Recommend keeping metrics anonymous and separate from grades.

### What sample size do I need?

**Pilot study:** N=10-20 (feasibility)
**Pre/post:** N=30+ (detect medium effects)
**RCT:** N=60+ total (30 per group, detect d=0.5 with 80% power)
**Longitudinal:** N=50+ (account for 20-30% attrition)

See Session 62 (RESEARCH_FOUNDATION.md) for detailed power analyses.

### Can I share my data?

**Yes,** if:

- Data is de-identified (already is)
- IRB protocol allows data sharing (specify in protocol)
- Consent form disclosed potential sharing (add clause)

Recommend depositing in open repositories (OSF, Dataverse) for scientific transparency.

---

## Additional Resources

**Related Documentation:**

- `RESEARCH_FOUNDATION.md` - Research background and study designs
- `scripts/research-data-analyzer.ts` - Assessment data analysis (student test scores)
- `scripts/metrics-analyzer.ts` - Metrics data analysis (usage patterns)
- `src/research-metrics.ts` - Technical implementation details

**Research Design Resources:**

- [What Works Clearinghouse Standards](https://ies.ed.gov/ncee/wwc/Handbooks)
- [IRB Application Templates](https://www.hhs.gov/ohrp/regulations-and-policy/guidance/index.html)
- [FERPA Guidance](https://studentprivacy.ed.gov/)
- [COPPA Compliance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)

**Statistical Analysis Resources:**

- [G*Power Sample Size Calculator](https://www.psychologie.hhu.de/arbeitsgruppen/allgemeine-psychologie-und-arbeitspsychologie/gpower)
- [Effect Size Interpretation Guide](https://imaging.mrc-cbu.cam.ac.uk/statswiki/FAQ/effectSize)

---

## Contact & Support

**Technical Questions:**
Open GitHub issue: https://github.com/yourusername/codoncanvas/issues

**Research Design Consultation:**
Contact: [Your Email]

**IRB Questions:**
Contact your institutional IRB office

---

**Document Version:** 1.0.0
**Last Updated:** October 2025
**License:** CC BY 4.0 (documentation), MIT (code)
