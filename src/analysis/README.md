# Analysis Module

Statistical analysis and metrics collection for educational research.

---

## Structure

```tree
analysis/
  analyzers/      # Genome analysis, session aggregation
  collectors/     # Research metrics (localStorage telemetry)
  formatters/     # Duration, number formatting
  parsers/        # CSV parsing with schema validation
  statistics/     # Descriptive and inferential stats
  types/          # TypeScript interfaces
  constants.ts    # Shared constants and thresholds
  index.ts        # Barrel exports
```

---

## Import from barrel

All exports available from `@/analysis`:

```typescript
import {
  MetricsAnalyzer,
  analyzeCodonUsage,
  parseCSVContent,
  mean,
  sd,
  formatDuration,
  type MetricsSession,
} from "@/analysis";
```

---

## Analyzers

### Codon analyzer

Bioinformatics-inspired genome analysis:

```typescript
import { analyzeCodonUsage, analyzeComplexity } from "@/analysis";

const analysis = analyzeCodonUsage(tokens);
// { gcContent, atContent, topCodons, opcodeFamilies, signature }

const complexity = analyzeComplexity("file.genome", tokens);
// { complexityScore, maxStackDepth, hasLoop, hasArithmetic }
```

### Metrics analyzer

Aggregate session data for classroom analytics:

```typescript
import { MetricsAnalyzer } from "@/analysis";

const analyzer = new MetricsAnalyzer(sessions);
const report = analyzer.generateReport();
// { engagement, velocity, tools, renderMode, mutations }

const comparison = analyzer.compareGroups(groupA, groupB, "A", "B");
// t-test results with effect size
```

---

## Statistics

### Descriptive

```typescript
import { mean, sd, median, quartile, descriptiveStats } from "@/analysis";

mean([1, 2, 3]); // 2
sd([1, 2, 3]); // 1
descriptiveStats(values); // { n, mean, sd, min, max, median, q1, q3 }
```

### Inferential

```typescript
import { tTest, cohensD, interpretEffectSize } from "@/analysis";

const { t, p, df } = tTest(group1, group2);
const d = cohensD(group1, group2);
interpretEffectSize(d); // "small" | "medium" | "large"
```

---

## Collectors

Privacy-respecting telemetry (opt-in only):

```typescript
import { ResearchMetrics } from "@/analysis"

const metrics = new ResearchMetrics({ enabled: false })
metrics.enable()  // User must opt-in

metrics.trackGenomeExecuted({ renderMode: "visual", success: true, ... })
metrics.trackMutation({ type: "silent", ... })

const csv = metrics.exportCSV()
```

---

## Parsers

CSV import with schema validation:

```typescript
import { parseCSVContent, parseCSVContentWithErrors } from "@/analysis";

const sessions = parseCSVContent(csvString);

// With error handling
const { sessions, errors } = parseCSVContentWithErrors(csvString);
```

---

## Formatters

```typescript
import { formatDuration, formatPercentage, formatNumber } from "@/analysis";

formatDuration(90000); // "1m 30s"
formatPercentage(85.5); // "85.5%"
formatNumber(3.14159, 2); // "3.14"
```

---

## Types

Key interfaces:

| Type               | Description                               |
| ------------------ | ----------------------------------------- |
| `MetricsSession`   | Flattened session for CSV/analysis        |
| `ResearchSession`  | Rich session for localStorage             |
| `DescriptiveStats` | { n, mean, sd, min, max, median, q1, q3 } |
| `AnalysisReport`   | Complete classroom analytics              |
| `ComparisonResult` | t-test with effect size                   |
