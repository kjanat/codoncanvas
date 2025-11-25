# CodonCanvas Research Data Collection Guide

**Version:** 1.0
**Date:** October 2025
**Purpose:** Instructions for collecting, formatting, and analyzing research data

---

## Overview

This guide explains how to:

1. Collect data from CodonCanvas studies
2. Format data for analysis
3. Run statistical analysis scripts
4. Interpret results for publication

**Companion Documents:**

- `RESEARCH_FRAMEWORK.md` - Full research methodology
- `ASSESSMENTS.md` - Assessment instruments and rubrics
- `data_collection_template.csv` - CSV template

---

## 1. Data Collection Setup

### Pre-Study Checklist

**IRB Approval:**

- [ ] IRB protocol submitted and approved
- [ ] Informed consent forms prepared
- [ ] Data storage plan documented
- [ ] Study ID system established

**Materials Prepared:**

- [ ] Pre-assessment printed/digital (ASSESSMENTS.md)
- [ ] CodonCanvas lesson plans ready (LESSON_PLANS.md)
- [ ] Post-assessment printed/digital
- [ ] Motivation survey (IMI) prepared
- [ ] Demographics survey ready

**Logistics:**

- [ ] Instructor training completed
- [ ] Computer lab/devices reserved
- [ ] CodonCanvas tested on all devices
- [ ] Data entry system set up (spreadsheet or database)

### Study Timeline

**Week 0: Pre-Assessment**

- Administer informed consent
- Collect demographics (GPA, prior programming experience)
- Administer Mutation Concept Inventory (MCI) pre-test
- Record baseline data in spreadsheet

**Week 1: Intervention**

- Implement 3 CodonCanvas lessons (or control activities)
- Monitor implementation fidelity
- Record attendance and completion

**Week 2: Post-Assessment**

- Administer MCI post-test
- Administer Mutation Transfer Task (MTT)
- Administer Intrinsic Motivation Inventory (IMI)
- Optional: Student reflection survey

**Week 6-8: Delayed Post-Assessment**

- Administer MCI retention test
- Record retention data

---

## 2. Data Format Specification

### CSV Structure

Use the provided `data_collection_template.csv` as your starting point.

**Required Columns:**

| Column                | Type   | Range              | Description                                    |
| --------------------- | ------ | ------------------ | ---------------------------------------------- |
| `id`                  | string | -                  | Unique student identifier (e.g., S001, S002)   |
| `group`               | string | treatment\|control | For RCT only; omit for pre-post                |
| `pretest_total`       | number | 0-100              | MCI pre-test total score (25 items × 4 points) |
| `posttest_total`      | number | 0-100              | MCI post-test total score                      |
| `delayed_total`       | number | 0-100              | MCI delayed post-test (optional)               |
| `pretest_silent`      | number | 0-20               | Silent mutation subscale (5 items × 4 points)  |
| `pretest_missense`    | number | 0-20               | Missense mutation subscale                     |
| `pretest_nonsense`    | number | 0-20               | Nonsense mutation subscale                     |
| `pretest_frameshift`  | number | 0-20               | Frameshift mutation subscale                   |
| `pretest_indel`       | number | 0-20               | Insertion/deletion subscale                    |
| `posttest_silent`     | number | 0-20               | Post-test silent mutation subscale             |
| `posttest_missense`   | number | 0-20               | Post-test missense subscale                    |
| `posttest_nonsense`   | number | 0-20               | Post-test nonsense subscale                    |
| `posttest_frameshift` | number | 0-20               | Post-test frameshift subscale                  |
| `posttest_indel`      | number | 0-20               | Post-test indel subscale                       |

**Optional Columns:**

| Column              | Type   | Range   | Description                                               |
| ------------------- | ------ | ------- | --------------------------------------------------------- |
| `mtt_score`         | number | 0-15    | Mutation Transfer Task total (3 scenarios × 5 points)     |
| `imi_interest`      | number | 1-7     | IMI Interest/Enjoyment subscale average                   |
| `imi_competence`    | number | 1-7     | IMI Perceived Competence subscale average                 |
| `imi_effort`        | number | 1-7     | IMI Effort/Importance subscale average                    |
| `imi_value`         | number | 1-7     | IMI Value/Usefulness subscale average                     |
| `gpa`               | number | 0.0-4.0 | Cumulative GPA (covariate)                                |
| `prior_programming` | number | 0-3     | Programming experience (0=none, 1=little, 2=some, 3=lots) |
| `institution`       | string | -       | Institution identifier (for multi-site studies)           |

### Data Entry Tips

1. **Use consistent IDs:** S001, S002, S003 (not S1, S02, S3)
2. **Missing data:** Leave blank (don't use 0 or -999)
3. **Decimal precision:** Use 1 decimal place for subscores (e.g., 10.5)
4. **No spaces:** In column names or values
5. **Save as UTF-8:** Ensure proper character encoding

### Example Data Entry

```csv
id,group,pretest_total,posttest_total,pretest_silent,posttest_silent,...
S001,treatment,55,72,11,15,...
S002,treatment,48,65,9,13,...
S003,control,52,58,10,11,...
```

---

## 3. Running Statistical Analysis

### Installation

Ensure you have Node.js and TypeScript installed:

```bash
# Install dependencies (if not already done)
npm install

# Verify research scripts are available
npm run research:analyze -- --help
```

### Analysis Commands

**Pre-Post Design (Pilot Study):**

```bash
# Basic analysis
npm run research:analyze -- --design prepost --data my_pilot_data.csv

# With publication table
npm run research:analyze -- --design prepost --data my_pilot_data.csv --table
```

**RCT Design (Treatment vs. Control):**

```bash
# Single CSV with "group" column
npm run research:analyze -- --design rct --data my_rct_data.csv

# Separate files for treatment and control
npm run research:analyze -- --design rct \
  --data treatment_data.csv \
  --control control_data.csv
```

**Power Analysis (Study Planning):**

```bash
# Standard parameters (d=0.5, α=0.05, power=0.80)
npm run research:analyze -- --power-analysis

# Custom parameters
npm run research:analyze -- --power-analysis \
  --effect 0.6 \
  --alpha 0.05 \
  --power 0.90
```

### Generating Sample Data

For testing or training purposes:

```bash
# Pre-post pilot (N=50, d=0.6)
npm run research:generate-data -- --design prepost --n 50 --effect 0.6

# RCT (N=75 per group, d=0.5)
npm run research:generate-data -- --design rct --n 75 --effect 0.5

# Custom output filename
npm run research:generate-data -- --design prepost --n 30 --output test.csv
```

---

## 4. Interpreting Results

### Statistical Output Explained

**Descriptive Statistics:**

```
N:      50
Mean:   65.20
SD:     12.50
Median: 64.00
Range:  [35.00, 92.00]
```

- **N:** Sample size (aim for N ≥ 30 for pilot, N ≥ 64 per group for RCT)
- **Mean:** Average score (compare pre vs. post, or treatment vs. control)
- **SD:** Standard deviation (variability in scores)
- **Median:** Middle value (use if data is skewed)
- **Range:** Min to max (check for floor/ceiling effects)

**Paired t-test (Pre-Post):**

```
t(49) = 8.45, p < .001
Mean difference: 15.30 (95% CI: [11.50, 19.10])
Cohen's d: 1.20 (large)
```

- **t(df):** t-statistic and degrees of freedom
- **p-value:** Probability result is due to chance
  - p < .05 = significant (conventional threshold)
  - p < .01 = highly significant
  - p < .001 = very highly significant
- **Mean difference:** Average gain from pre to post
- **95% CI:** Confidence interval (range of plausible values)
- **Cohen's d:** Effect size
  - 0.2 = small
  - 0.5 = medium
  - 0.8 = large

**Independent t-test (RCT):**

```
Treatment post-test: M = 72.30, SD = 11.20
Control post-test:   M = 58.50, SD = 13.10
t(98) = 5.67, p < .001
Mean difference: 13.80 (95% CI: [9.05, 18.55])
Cohen's d: 1.14 (large)
```

- Compare post-test means between groups
- Positive difference = treatment outperforms control
- Check pre-test equivalence (should be p > .05)

### Publication Reporting Template

**For Pre-Post Study:**

> Students demonstrated significant learning gains from pre-test (M = 55.2, SD = 12.5) to post-test (M = 70.5, SD = 10.8), t(49) = 8.45, p < .001, d = 1.20. The mean gain of 15.3 points (95% CI: [11.5, 19.1]) represents a large effect size and suggests substantial improvement in mutation concept understanding.

**For RCT Study:**

> The treatment group (M = 72.3, SD = 11.2) significantly outperformed the control group (M = 58.5, SD = 13.1) on the post-test, t(98) = 5.67, p < .001, d = 1.14. This 13.8-point difference (95% CI: [9.1, 18.6]) represents a large treatment effect and provides strong evidence for CodonCanvas effectiveness.

---

## 5. Quality Checks

### Data Validation Checklist

Before running analysis, verify:

**Completeness:**

- [ ] All student IDs present
- [ ] No duplicate IDs
- [ ] Pre and post scores for all participants
- [ ] Missing data < 10% of sample

**Range Checks:**

- [ ] All scores within valid range (0-100 for total, 0-20 for subscales)
- [ ] No impossible values (e.g., negative scores, scores > 100)
- [ ] GPA values between 0.0-4.0
- [ ] IMI values between 1-7

**Consistency:**

- [ ] Subscale scores sum to total score (within rounding)
- [ ] Pre-test administered before intervention
- [ ] Post-test administered after intervention
- [ ] Group assignments correct (for RCT)

### Common Issues and Solutions

**Issue:** "Groups differ at baseline (p < .05)"

- **Solution:** Use ANCOVA with pre-test as covariate (report in methods)
- **Report:** "We controlled for baseline differences using ANCOVA..."

**Issue:** "Effect size smaller than expected"

- **Possible causes:** Implementation fidelity issues, sample heterogeneity, ceiling effects
- **Actions:** Check instructor fidelity logs, analyze by subgroup, examine score distributions

**Issue:** "High attrition rate (>20%)"

- **Solution:** Conduct attrition analysis (compare completers vs. non-completers)
- **Report:** "Attrition rate was X%. Completers and non-completers did not differ on baseline characteristics (p > .05)."

**Issue:** "Ceiling effect (many scores at 100)"

- **Solution:** Report but acknowledge limitation
- **Report:** "A ceiling effect was observed, with X% of participants scoring 95-100 on post-test, potentially underestimating treatment effects."

---

## 6. Data Storage and Security

### File Organization

```
research_data/
├── study_2025_fall/
│   ├── raw_data/
│   │   ├── consent_forms/        # Locked cabinet or encrypted folder
│   │   ├── paper_assessments/    # Original paper copies
│   │   └── id_mapping.xlsx       # Links study IDs to names (SEPARATE STORAGE)
│   ├── processed_data/
│   │   ├── deidentified_data.csv # Analysis-ready data
│   │   └── codebook.txt          # Variable definitions
│   ├── analysis/
│   │   ├── analysis_output.txt   # Statistical results
│   │   ├── figures/              # Plots and graphs
│   │   └── tables/               # Publication tables
│   └── documentation/
│       ├── irb_approval.pdf
│       ├── study_protocol.md
│       └── data_collection_log.xlsx
```

### Security Best Practices

**De-identification:**

1. Assign study IDs (S001, S002, ...) before data entry
2. Store ID-to-name mapping separately (locked location)
3. Never include names, email, or identifiable info in analysis files
4. Use institution codes (A, B, C) instead of institution names

**Storage:**

- **Consent forms:** Locked filing cabinet (paper) or encrypted drive (digital)
- **Raw data:** Password-protected folder on secure university server
- **Analysis data:** Can be stored on researcher laptop (de-identified)
- **Backups:** Weekly backups to university cloud storage

**Access Control:**

- Only PI and approved research staff have access
- Use password-protected files for sensitive data
- Log all access to raw data (required by many IRBs)

**Retention:**

- **During study:** All data retained
- **After publication:** De-identified data retained 3-7 years (check IRB policy)
- **Identifiable data:** Destroyed after retention period
- **Public sharing:** Only de-identified data (OSF, Zenodo) if consented

---

## 7. Troubleshooting

### Script Errors

**Error:** "Cannot find module"

```bash
# Solution: Install dependencies
npm install
```

**Error:** "File not found"

```bash
# Solution: Use full path or run from project root
npm run research:analyze -- --design prepost --data /full/path/to/data.csv
```

**Error:** "Invalid CSV format"

- Check for extra commas, missing headers, or encoding issues
- Open in Excel/Google Sheets and re-save as CSV (UTF-8)

### Statistical Questions

**Q: What sample size do I need?**

- **A:** Run power analysis: `npm run research:analyze -- --power-analysis --effect 0.5`
- Typical result: N=64 per group (RCT), N=34 total (pre-post, d=0.5)

**Q: My p-value is .06, almost significant. What do I do?**

- **A:** Report as non-significant (p > .05). Discuss as trend in limitations.
- Never "round down" p-values or cherry-pick analyses.

**Q: How do I report subscale results?**

- **A:** Use repeated measures analysis or separate t-tests with Bonferroni correction.
- Example: α = .05 / 5 tests = .01 per test (conservative)

**Q: Can I combine pilot data with main study data?**

- **A:** Generally no (different populations/times). Report separately.
- Exception: Pre-registered plan to pool data if pilot successful.

---

## 8. Additional Resources

### Statistical Software Alternatives

If you prefer GUI-based tools:

- **SPSS:** Commercial, widely used in education research
- **R/RStudio:** Free, powerful, steep learning curve
- **jamovi:** Free, user-friendly, SPSS-like interface
- **JASP:** Free, Bayesian and frequentist stats

### Recommended Reading

**Research Design:**

- Shadish, Cook, & Campbell (2002). _Experimental and Quasi-Experimental Designs_
- Creswell & Creswell (2017). _Research Design_ (5th ed.)

**Statistical Analysis:**

- Field (2018). _Discovering Statistics Using IBM SPSS Statistics_ (5th ed.)
- Cumming (2012). _Understanding the New Statistics: Effect Sizes, CIs, and Meta-Analysis_

**Education Research:**

- American Educational Research Association (2006). _Standards for Reporting_
- Hattie (2008). _Visible Learning_ (effect size interpretation)

### Getting Help

**Technical Issues:**

- GitHub Issues: [codoncanvas/issues](https://github.com/username/codoncanvas/issues)
- Email support: [contact info]

**Methodological Consultation:**

- Consult your institution's statistics consulting center
- Seek collaboration with education research faculty
- Consider hiring a statistician for complex designs

**IRB Questions:**

- Contact your institution's IRB office
- Refer to RESEARCH_FRAMEWORK.md Section 7 (Ethical Considerations)

---

## Appendix A: Quick Reference Commands

```bash
# Generate sample data for testing
npm run research:generate-data -- --design prepost --n 50

# Analyze pre-post pilot
npm run research:analyze -- --design prepost --data pilot.csv

# Analyze RCT
npm run research:analyze -- --design rct --data study.csv

# Power analysis
npm run research:analyze -- --power-analysis --effect 0.5

# Generate publication table
npm run research:analyze -- --design prepost --data study.csv --table
```

---

## Appendix B: CSV Column Reference

**Core Variables (Required):**

- `id` - Student identifier
- `pretest_total` - MCI pre-test score (0-100)
- `posttest_total` - MCI post-test score (0-100)
- `pretest_[type]` - Subscale pre-scores (0-20 each)
- `posttest_[type]` - Subscale post-scores (0-20 each)

**RCT Variables:**

- `group` - "treatment" or "control"

**Optional Variables:**

- `delayed_total` - Retention test score
- `mtt_score` - Transfer task score (0-15)
- `imi_*` - Motivation subscales (1-7)
- `gpa` - Cumulative GPA (0.0-4.0)
- `prior_programming` - Experience level (0-3)
- `institution` - Site identifier

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Contact:** [Project PI contact information]
