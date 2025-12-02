# CodonCanvas Assessment System

**Automated Grading for Mutation Type Identification**

## Overview

The **Assessment System** provides automated challenges and grading for testing student understanding of genetic mutation types. Designed for educators running Week 5 pilot programs and beyond, it enables:

- ✅ **Automated Challenge Generation**: Random mutations at 3 difficulty levels
- ✅ **Instant Feedback**: Students learn from mistakes immediately
- ✅ **Progress Tracking**: Class-wide analytics for educators
- ✅ **Export Results**: JSON export for grade books and learning analytics

---

## Features

### For Students

- **Interactive Challenges**: Identify mutation types by comparing genomes
- **Difficulty Levels**:
  - **Easy**: Silent and missense mutations only, with helpful hints
  - **Medium**: Adds nonsense mutations, subtle hints
  - **Hard**: All mutation types (frameshift, insertion, deletion), no hints
- **Immediate Feedback**: Correct/incorrect with explanations
- **Progress Dashboard**: Real-time accuracy tracking

### For Educators

- **Automated Grading**: No manual review required
- **Analytics Dashboard**: Class performance by mutation type and difficulty
- **Export Results**: JSON format for learning management systems
- **Customizable Difficulty**: Adapt challenges to student skill level

---

## Quick Start

### Standalone Assessment Mode

1. **Open Assessment Demo**:

   ```
   Open: /demos/assessment
   ```

2. **Select Difficulty**:
   - Start students with "Easy" for first lesson
   - Progress to "Medium" after mastering basics
   - "Hard" for advanced assessment

3. **Monitor Progress**:
   - View real-time accuracy percentage
   - Track challenges attempted vs. correct answers

4. **Export Results**:
   - Click "📊 Export Results for Educator"
   - Downloads JSON file with full student data

### Integration with Main Playground

To add assessment mode to the main playground:

```typescript
import { AssessmentEngine } from "./assessment-engine";
import { AssessmentUI } from "./assessment-ui";

// Initialize
const engine = new AssessmentEngine();
const assessmentUI = new AssessmentUI(
  engine,
  document.getElementById("assessment-container")!,
);

// Toggle assessment mode
document
  .getElementById("assessment-toggle-btn")
  .addEventListener("click", () => {
    assessmentUI.show();
  });
```

---

## Mutation Types Reference

### Silent Mutation

**Definition**: Codon changes but opcode stays the same
**Example**: `GGA → GGC` (both code for CIRCLE)
**Visual Effect**: No change in output
**Common Error**: Students confuse with missense

### Missense Mutation

**Definition**: Codon changes to different opcode
**Example**: `GGA → GCA` (CIRCLE → TRIANGLE)
**Visual Effect**: Different shape/operation
**Common Error**: Students miss subtle visual differences

### Nonsense Mutation

**Definition**: Introduces STOP codon early
**Example**: `GGA → TAA` (CIRCLE → STOP)
**Visual Effect**: Truncated output
**Common Error**: Students confuse with deletion

### Frameshift Mutation

**Definition**: Insert/delete bases (not divisible by 3)
**Example**: `ATGGGATAAA → ATGGGTAAA` (deleted 1 base)
**Visual Effect**: Completely scrambled downstream
**Common Error**: Students don't check length carefully

### Insertion

**Definition**: Add 3+ bases (no frameshift)
**Example**: `ATG GGA TAA → ATG GGA CCA TAA` (+3 bases)
**Visual Effect**: Extra operation added
**Common Error**: Students confuse with missense

### Deletion

**Definition**: Remove 3+ bases (no frameshift)
**Example**: `ATG GGA CCA TAA → ATG GGA TAA` (-3 bases)
**Visual Effect**: Operation removed
**Common Error**: Students confuse with nonsense

---

## Assessment Workflow

### Recommended Lesson Plan (45 minutes)

**Phase 1: Introduction (10 min)**

1. Review mutation types with examples
2. Demonstrate assessment interface
3. Explain difficulty levels

**Phase 2: Guided Practice (15 min)**

1. Students complete 5 "Easy" challenges
2. Instructor reviews common errors
3. Discuss identification strategies

**Phase 3: Independent Practice (15 min)**

1. Students progress to "Medium" difficulty
2. Complete 10 challenges minimum
3. Aim for 80%+ accuracy

**Phase 4: Assessment (5 min)**

1. Students complete 5 "Hard" challenges
2. Export results for grading
3. Review class performance

---

## Grading Rubric

### Suggested Scoring

| Accuracy | Grade | Skill Level       |
| -------- | ----- | ----------------- |
| 90-100%  | A     | Mastery           |
| 80-89%   | B     | Proficient        |
| 70-79%   | C     | Developing        |
| 60-69%   | D     | Needs Support     |
| <60%     | F     | Re-teach Required |

### Performance by Mutation Type

Track student accuracy by mutation type to identify gaps:

```json
{
  "byType": {
    "silent": { "correct": 8, "total": 10 }, // 80% - Good
    "missense": { "correct": 7, "total": 10 }, // 70% - Needs practice
    "nonsense": { "correct": 9, "total": 10 }, // 90% - Excellent
    "frameshift": { "correct": 4, "total": 10 } // 40% - Re-teach ⚠️
  }
}
```

**Interpretation**:

- Students understand silent, missense, nonsense
- **Frameshift** needs focused review (40% accuracy)

---

## Exported Results Format

### JSON Structure

```json
{
  "results": [
    {
      "challenge": {
        "id": "challenge-1",
        "original": "ATG GGA TAA",
        "mutated": "ATG GGC TAA",
        "correctAnswer": "silent",
        "difficulty": "easy",
        "mutationPosition": 4
      },
      "studentAnswer": "silent",
      "correct": true,
      "feedback": "Correct! This is a silent mutation...",
      "timestamp": "2025-10-12T08:30:15.000Z"
    }
  ],
  "progress": {
    "totalAttempts": 15,
    "correctAnswers": 12,
    "accuracy": 80.0,
    "byType": { ... },
    "byDifficulty": { ... }
  },
  "timestamp": "2025-10-12T09:00:00.000Z"
}
```

### Import to Grade Book

1. **Excel/Google Sheets**:
   - Use JSON-to-CSV converter
   - Import `progress.accuracy` as grade

2. **Learning Management System**:
   - Most LMS support JSON import
   - Map `accuracy` to 0-100 scale

3. **Custom Analytics**:
   - Parse `byType` for targeted interventions
   - Track `byDifficulty` for adaptive learning

---

## Customization Options

### Adjust Difficulty Levels

Edit `src/assessment-engine.ts`:

```typescript
private generateBaseGenome(difficulty: DifficultyLevel): string {
  const lengths = {
    easy: 5,    // 5 codons = 15 bases
    medium: 8,  // 8 codons = 24 bases
    hard: 12,   // 12 codons = 36 bases
  };
  // Increase for more complex challenges
}
```

### Customize Mutation Types by Difficulty

```typescript
private selectMutationType(difficulty: DifficultyLevel): MutationType {
  const types: Record<DifficultyLevel, MutationType[]> = {
    easy: ['silent', 'missense'],
    medium: ['silent', 'missense', 'nonsense'],
    hard: ['silent', 'missense', 'nonsense', 'frameshift', 'insertion', 'deletion'],
  };
  // Modify arrays to change available types
}
```

### Customize Hints

Edit hint generation in `src/assessment-engine.ts`:

```typescript
private generateHint(mutationType: MutationType, difficulty: DifficultyLevel): string {
  // Add custom hints here
}
```

---

## Accessibility Features

### Keyboard Navigation

- **Tab**: Navigate between buttons
- **Enter/Space**: Select answer
- **Escape**: (Future) Return to main menu

### Screen Reader Support

- All buttons have ARIA labels
- Challenge text announced clearly
- Feedback provides detailed explanations

### High Contrast Mode

- Assessment UI inherits theme from main playground
- Works with Dark, Light, and High Contrast themes

---

## FAQ for Educators

### Q: How many challenges should students complete?

**A:** Recommended minimum:

- **Easy**: 5-10 challenges (introduction)
- **Medium**: 10-15 challenges (practice)
- **Hard**: 5-10 challenges (assessment)

### Q: What accuracy indicates mastery?

**A:** 80%+ accuracy across all mutation types indicates proficiency. Lower accuracy on specific types (e.g., frameshift) indicates need for targeted review.

### Q: Can students retake challenges?

**A:** Yes! Challenges are randomly generated. Students can practice unlimited times. Export results periodically to track improvement.

### Q: How do I identify struggling students?

**A:** Look for:

- Accuracy <70% after 10+ attempts
- Consistent errors on specific mutation types
- Low accuracy on "Easy" difficulty

Export results and review `byType` performance to identify gaps.

### Q: Can I use this for summative assessment?

**A:** Yes! Recommended approach:

1. Give students practice time (10-15 challenges)
2. Administer 10 "Hard" challenges as timed assessment
3. Export results immediately
4. Grade based on accuracy (90%+ = A, 80-89% = B, etc.)

### Q: How do I prevent students from guessing?

**A:** The system tracks all attempts. Review `totalAttempts` vs. `correctAnswers`. High attempt counts with low accuracy indicate guessing. Recommend:

- Require written explanations for wrong answers
- Use assessment mode as formative, not solely summative
- Combine with visual output analysis

---

## Technical Integration

### API Reference

#### AssessmentEngine Class

```typescript
class AssessmentEngine {
  // Identify mutation type between genomes
  identifyMutation(original: string, mutated: string): MutationType;

  // Generate random challenge
  generateChallenge(difficulty: DifficultyLevel): Challenge;

  // Score student response
  scoreResponse(challenge: Challenge, response: MutationType): AssessmentResult;

  // Calculate progress from results
  calculateProgress(results: AssessmentResult[]): StudentProgress;
}
```

#### AssessmentUI Class

```typescript
class AssessmentUI {
  constructor(engine: AssessmentEngine, container: HTMLElement);

  // Show/hide UI
  show(): void;
  hide(): void;

  // Get progress for analytics
  getProgress(): StudentProgress;

  // Export results as JSON
  exportResults(): string;
}
```

---

## Support & Feedback

### Reporting Issues

If you encounter bugs or have feature requests:

1. Check existing issues: [GitHub Issues](https://github.com/USERNAME/codoncanvas/issues)
2. Open new issue with:
   - Description of problem
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshot (if applicable)

### Feature Requests

Educators can request features such as:

- Custom challenge sets
- Multi-student analytics dashboard
- Integration with specific LMS platforms
- Adaptive difficulty (automatic progression)

---

## Appendix: Sample Assessment

### Sample 10-Question Assessment (Medium Difficulty)

**Instructions**: Identify the mutation type for each challenge. Aim for 80%+ accuracy.

1. `ATG GGA TAA` → `ATG GGC TAA`
   - **Answer**: Silent

2. `ATG GGA TAA` → `ATG GCA TAA`
   - **Answer**: Missense

3. `ATG GGA CCA TAA` → `ATG TAG CCA TAA`
   - **Answer**: Nonsense

4. `ATGGGATAAA` → `ATGGGTAAA`
   - **Answer**: Frameshift

5. `ATG GGA TAA` → `ATG GGA CCA TAA`
   - **Answer**: Insertion

6. `ATG GGA CCA TAA` → `ATG CCA TAA`
   - **Answer**: Deletion

7. `ATG CCA TAA` → `ATG CCC TAA`
   - **Answer**: Silent

8. `ATG AAA TAA` → `ATG AAC TAA`
   - **Answer**: Silent

9. `ATG GGA TAA` → `ATG GTA TAA`
   - **Answer**: Missense

10. `ATGCCATAAA` → `ATGCCATAAAC`
    - **Answer**: Frameshift

**Answer Key**: 1-Silent, 2-Missense, 3-Nonsense, 4-Frameshift, 5-Insertion, 6-Deletion, 7-Silent, 8-Silent, 9-Missense, 10-Frameshift

---

## Changelog

### Version 1.0.0 (2025-10-12)

**Initial Release**:

- ✅ Automated challenge generation (3 difficulty levels)
- ✅ 6 mutation types supported
- ✅ Instant feedback with explanations
- ✅ Progress tracking and analytics
- ✅ JSON export for educators
- ✅ Standalone assessment demo page
- ✅ Comprehensive educator documentation

---

**🎓 Ready to assess student learning? Open `/demos/assessment` to get started!**
