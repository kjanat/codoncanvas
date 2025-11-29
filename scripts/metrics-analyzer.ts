#!/usr/bin/env tsx
/**
 * CodonCanvas Metrics Analyzer CLI
 *
 * Automates statistical analysis of usage metrics exported from ResearchMetrics system.
 * Analyzes engagement patterns, learning velocity, tool adoption, and render mode preferences.
 *
 * Features:
 * - Descriptive statistics (mean, SD, median, range, quartiles)
 * - Engagement metrics (session duration trends, retention analysis)
 * - Learning velocity (time-to-first-artifact distribution)
 * - Tool adoption patterns (feature usage frequencies)
 * - Render mode preferences (visual vs audio vs multi-sensory)
 * - Multi-sensory RCT analysis (compare groups)
 * - Publication-ready tables and visualizations
 *
 * Usage:
 *   bun run metrics:analyze -- --data metrics.csv
 *   bun run metrics:analyze -- --data metrics.csv --group visual --baseline audio
 *   bun run metrics:analyze -- --data metrics.csv --report full
 */

import * as fs from "node:fs";
import * as path from "node:path";

// Import all types and utilities from the browser-compatible core module
import {
  type ComparisonResult,
  type DescriptiveStats,
  formatDuration,
  MetricsAnalyzer,
  type MetricsSession,
  Stats,
} from "../src/metrics-analyzer-core";

/** Required fields for a valid MetricsSession */
const REQUIRED_SESSION_FIELDS = [
  "sessionId",
  "startTime",
  "endTime",
  "duration",
  "genomesCreated",
  "genomesExecuted",
  "mutationsApplied",
  "errorCount",
  "errorTypes",
] as const;

/** Validates that a parsed session object contains all required fields */
function validateSession(
  session: Record<string, string | number | null>,
  lineNumber: number,
): void {
  const missingFields = REQUIRED_SESSION_FIELDS.filter(
    (field) => !(field in session),
  );

  if (missingFields.length > 0) {
    throw new Error(
      `Invalid session data at line ${lineNumber}: missing required fields: ${missingFields.join(", ")}`,
    );
  }
}

function parseCSV(filepath: string): MetricsSession[] {
  const content = fs.readFileSync(filepath, "utf-8");
  const lines = content.trim().split("\n");

  if (lines.length < 2) {
    throw new Error("CSV file is empty or missing header");
  }

  const header = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"(.*)"$/, "$1"));
  const sessions: MetricsSession[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const session: Record<string, string | number | null> = {};

    header.forEach((key, idx) => {
      const value = values[idx];

      // Parse numbers
      if (
        key === "duration" ||
        key === "startTime" ||
        key === "endTime" ||
        key.startsWith("genomes") ||
        key.startsWith("mutation") ||
        key.startsWith("renderMode") ||
        key.startsWith("feature") ||
        key === "mutationsApplied" ||
        key === "errorCount"
      ) {
        session[key] = parseFloat(value) || 0;
      } else if (key === "timeToFirstArtifact") {
        session[key] =
          value === "null" || value === "" ? null : parseFloat(value);
      } else {
        session[key] = value;
      }
    });

    validateSession(session, i + 1);
    // Cast is safe after validation confirms required fields exist
    sessions.push(session as unknown as MetricsSession);
  }

  return sessions;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result.map((v) => v.replace(/^"(.*)"$/, "$1"));
}

function generateReport(analyzer: MetricsAnalyzer, outputPath: string): void {
  const engagement = analyzer.engagementMetrics();
  const velocity = analyzer.learningVelocity();
  const tools = analyzer.toolAdoption();
  const renderMode = analyzer.renderModePreferences();
  const mutations = analyzer.mutationPatterns();

  let report = "";

  report +=
    "===============================================================================\n";
  report += "           CODONCANVAS METRICS ANALYSIS REPORT\n";
  report +=
    "===============================================================================\n\n";

  // Engagement Metrics
  report +=
    "-------------------------------------------------------------------------------\n";
  report += "1. ENGAGEMENT METRICS\n";
  report +=
    "-------------------------------------------------------------------------------\n\n";
  report += `Total Sessions:              ${engagement.totalSessions}\n`;
  report += `Average Session Duration:    ${formatDuration(
    engagement.avgSessionDuration.mean,
  )}\n`;
  report += `  (SD = ${formatDuration(
    engagement.avgSessionDuration.sd,
  )}, Range: ${formatDuration(engagement.avgSessionDuration.min)} - ${formatDuration(
    engagement.avgSessionDuration.max,
  )})\n\n`;
  report += `Total Genomes Created:       ${engagement.totalGenomesCreated}\n`;
  report += `Avg Genomes per Session:     ${engagement.avgGenomesPerSession.mean.toFixed(
    1,
  )}\n`;
  report += `  (SD = ${engagement.avgGenomesPerSession.sd.toFixed(1)})\n`;
  report += `Genome Execution Rate:       ${engagement.genomesExecutedRate.toFixed(
    1,
  )}%\n\n`;

  // Learning Velocity
  report +=
    "-------------------------------------------------------------------------------\n";
  report += "2. LEARNING VELOCITY\n";
  report +=
    "-------------------------------------------------------------------------------\n\n";
  report += `Time to First Artifact:\n`;
  report += `  Mean:     ${formatDuration(
    velocity.timeToFirstArtifact.mean,
  )}\n`;
  report += `  Median:   ${formatDuration(
    velocity.timeToFirstArtifact.median,
  )}\n`;
  report += `  SD:       ${formatDuration(velocity.timeToFirstArtifact.sd)}\n`;
  report += `  Range:    ${formatDuration(
    velocity.timeToFirstArtifact.min,
  )} - ${formatDuration(velocity.timeToFirstArtifact.max)}\n\n`;
  report += `Learner Distribution:\n`;
  report += `  Fast (<5 min):       ${velocity.fastLearners} (${(
    (velocity.fastLearners / engagement.totalSessions) * 100
  ).toFixed(1)}%)\n`;
  report += `  Moderate (5-15 min): ${velocity.moderateLearners} (${(
    (velocity.moderateLearners / engagement.totalSessions) * 100
  ).toFixed(1)}%)\n`;
  report += `  Slow (>15 min):      ${velocity.slowLearners} (${(
    (velocity.slowLearners / engagement.totalSessions) * 100
  ).toFixed(1)}%)\n`;
  report += `  No Artifact:         ${velocity.noArtifact} (${(
    (velocity.noArtifact / engagement.totalSessions) * 100
  ).toFixed(1)}%)\n\n`;

  // Tool Adoption
  report +=
    "-------------------------------------------------------------------------------\n";
  report += "3. TOOL ADOPTION\n";
  report +=
    "-------------------------------------------------------------------------------\n\n";
  report += formatToolRow(
    "Diff Viewer",
    tools.diffViewer,
    engagement.totalSessions,
  );
  report += formatToolRow(
    "Timeline Scrubber",
    tools.timeline,
    engagement.totalSessions,
  );
  report += formatToolRow(
    "Evolution Lab",
    tools.evolution,
    engagement.totalSessions,
  );
  report += formatToolRow(
    "Assessment System",
    tools.assessment,
    engagement.totalSessions,
  );
  report += formatToolRow(
    "Export Features",
    tools.export,
    engagement.totalSessions,
  );
  report += "\n";

  // Render Mode Preferences
  report +=
    "-------------------------------------------------------------------------------\n";
  report += "4. RENDER MODE PREFERENCES\n";
  report +=
    "-------------------------------------------------------------------------------\n\n";
  report += `Visual Only:         ${renderMode.visualOnly.percentage.toFixed(
    1,
  )}% (${renderMode.visualOnly.sessions} executions)\n`;
  report += `Audio Only:          ${renderMode.audioOnly.percentage.toFixed(
    1,
  )}% (${renderMode.audioOnly.sessions} executions)\n`;
  report += `Multi-Sensory:       ${renderMode.multiSensory.percentage.toFixed(
    1,
  )}% (${renderMode.multiSensory.sessions} executions)\n\n`;

  // Mutation Patterns
  report +=
    "-------------------------------------------------------------------------------\n";
  report += "5. MUTATION PATTERNS\n";
  report +=
    "-------------------------------------------------------------------------------\n\n";
  report += `Total Mutations Applied:     ${mutations.totalMutations}\n\n`;
  report += formatMutationRow(
    "Silent",
    mutations.silent,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Missense",
    mutations.missense,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Nonsense",
    mutations.nonsense,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Frameshift",
    mutations.frameshift,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Point",
    mutations.point,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Insertion",
    mutations.insertion,
    mutations.totalMutations,
  );
  report += formatMutationRow(
    "Deletion",
    mutations.deletion,
    mutations.totalMutations,
  );

  report +=
    "\n===============================================================================\n";
  report += "                         END OF REPORT\n";
  report +=
    "===============================================================================\n";

  fs.writeFileSync(outputPath, report);
  console.log(`\n Report generated: ${outputPath}\n`);
}

function formatToolRow(
  name: string,
  data: { users: number; avgUsage: number },
  total: number,
): string {
  const adoption = (data.users / total) * 100;
  return `${name.padEnd(20)} ${adoption.toFixed(1)}% adoption (avg ${data.avgUsage.toFixed(
    1,
  )} uses/session)\n`;
}

function formatMutationRow(
  name: string,
  stats: DescriptiveStats,
  total: number,
): string {
  const sum = stats.mean * stats.n;
  const percentage = total > 0 ? (sum / total) * 100 : 0;
  return `  ${name.padEnd(12)} ${percentage.toFixed(1)}% (M=${stats.mean.toFixed(
    1,
  )}, SD=${stats.sd.toFixed(1)})\n`;
}

function generateComparisonReport(
  comparisons: ComparisonResult[],
  outputPath: string,
): void {
  let report = "";

  report +=
    "===============================================================================\n";
  report += "           GROUP COMPARISON ANALYSIS (RCT)\n";
  report +=
    "===============================================================================\n\n";

  for (const comp of comparisons) {
    report += `-------------------------------------------------------------------------------\n`;
    report += `${comp.metric}\n`;
    report += `-------------------------------------------------------------------------------\n\n`;
    report += `${comp.group1}:  M = ${comp.group1Mean.toFixed(2)}\n`;
    report += `${comp.group2}:  M = ${comp.group2Mean.toFixed(2)}\n`;
    report += `Difference:      ${comp.diff > 0 ? "+" : ""}${comp.diff.toFixed(
      2,
    )} (${comp.percentChange > 0 ? "+" : ""}${comp.percentChange.toFixed(
      1,
    )}%)\n\n`;
    report += `t-test:          t = ${comp.t.toFixed(3)}, p = ${comp.p.toFixed(
      4,
    )}\n`;
    report += `Effect Size:     Cohen's d = ${comp.cohensD.toFixed(
      3,
    )} (${comp.interpretation})\n`;
    report += `Interpretation:  ${Stats.interpretPValue(comp.p)}\n\n`;
  }

  report +=
    "===============================================================================\n";

  fs.writeFileSync(outputPath, report);
  console.log(`\n Comparison report generated: ${outputPath}\n`);
}

function printUsage() {
  console.log(`
CodonCanvas Metrics Analyzer

USAGE:
  bun run metrics:analyze -- --data <file> [options]

OPTIONS:
  --data <file>           Input CSV file exported from research dashboard
  --group <name>          Group name for RCT comparison
  --baseline <file>       Baseline group CSV for comparison
  --report <type>         Report type: basic|full (default: full)
  --output <path>         Output directory (default: current directory)

EXAMPLES:
  # Basic analysis
  bun run metrics:analyze -- --data pilot_study.csv

  # RCT comparison (visual vs audio groups)
  bun run metrics:analyze -- --data visual_group.csv --group visual --baseline audio_group.csv

  # Custom output location
  bun run metrics:analyze -- --data study1.csv --output ./results/

CSV FORMAT:
  Expects CSV exported from ResearchMetrics.exportCSV() with columns:
  sessionId, startTime, endTime, duration, genomesCreated, genomesExecuted,
  timeToFirstArtifact, mutationsApplied, renderMode_*, mutation_*, feature_*, etc.

STATISTICAL METHODS:
  - Descriptive statistics (M, SD, median, quartiles, range)
  - Independent samples t-test (group comparisons)
  - Cohen's d effect size
  - Engagement metrics (session duration, retention, productivity)
  - Learning velocity (time-to-first-artifact distribution)
  - Tool adoption rates (feature usage patterns)
  `);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  const options = parseArguments(args);

  if (!options.dataFile) {
    console.error("Error: --data <file> is required\n");
    printUsage();
    process.exit(1);
  }

  if (!fs.existsSync(options.dataFile)) {
    console.error(`Error: Data file not found: ${options.dataFile}\n`);
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(options.outputDir)) {
    fs.mkdirSync(options.outputDir, { recursive: true });
  }

  console.log("\nCodonCanvas Metrics Analyzer\n");
  console.log(`Data file: ${options.dataFile}`);

  try {
    runAnalysis(options);
  } catch (error) {
    console.error(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}\n`,
    );
    process.exit(1);
  }
}

function parseArguments(args: string[]) {
  let dataFile = "";
  let groupName = "Group 1";
  let baselineFile = "";
  let reportType = "full";
  let outputDir = ".";

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (i + 1 >= args.length) break;

    switch (arg) {
      case "--data":
        dataFile = args[++i];
        break;
      case "--group":
        groupName = args[++i];
        break;
      case "--baseline":
        baselineFile = args[++i];
        break;
      case "--report":
        reportType = args[++i];
        break;
      case "--output":
        outputDir = args[++i];
        break;
    }
  }

  return { dataFile, groupName, baselineFile, reportType, outputDir };
}

function runAnalysis(options: {
  dataFile: string;
  groupName: string;
  baselineFile: string;
  reportType: string;
  outputDir: string;
}) {
  // Parse CSV
  console.log("Parsing CSV...");
  const sessions = parseCSV(options.dataFile);
  console.log(`Loaded ${sessions.length} sessions\n`);

  // Create analyzer
  const analyzer = new MetricsAnalyzer(sessions);

  // Generate main report
  const timestamp = new Date().toISOString().slice(0, 10);
  const reportPath = path.join(
    options.outputDir,
    `metrics_report_${timestamp}.txt`,
  );
  generateReport(analyzer, reportPath);

  // If baseline provided, run comparison
  if (options.baselineFile) {
    runComparison(
      analyzer,
      sessions,
      options.baselineFile,
      options.groupName,
      options.outputDir,
      timestamp,
    );
  }

  console.log("Analysis complete!\n");
}

function runComparison(
  analyzer: MetricsAnalyzer,
  sessions: MetricsSession[],
  baselineFile: string,
  groupName: string,
  outputDir: string,
  timestamp: string,
) {
  if (!fs.existsSync(baselineFile)) {
    throw new Error(`Baseline file not found: ${baselineFile}`);
  }

  console.log(`Baseline file: ${baselineFile}`);
  const baselineSessions = parseCSV(baselineFile);
  console.log(`Loaded ${baselineSessions.length} baseline sessions\n`);

  const comparisons = analyzer.compareGroups(
    sessions,
    baselineSessions,
    groupName,
    "Baseline",
  );

  const comparisonPath = path.join(
    outputDir,
    `comparison_report_${timestamp}.txt`,
  );
  generateComparisonReport(comparisons, comparisonPath);
}

main();
