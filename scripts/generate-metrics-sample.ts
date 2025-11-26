#!/usr/bin/env tsx
/**
 * Generate Sample Metrics Data for CodonCanvas Research Dashboard
 *
 * Creates realistic synthetic session data matching ResearchMetrics CSV schema.
 * Simulates varied learner profiles with correlated behaviors.
 *
 * Usage:
 *   npm run metrics:generate-sample -- --n 20
 *   npm run metrics:generate-sample -- --n 50 --output pilot-metrics.csv
 */

import * as fs from "node:fs";

// ============================================================================
// Random Utilities
// ============================================================================

function randomNormal(mean: number = 0, sd: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * sd + mean;
}

function randomBoundedNormal(
  mean: number,
  sd: number,
  min: number,
  max: number,
): number {
  const value = randomNormal(mean, sd);
  return Math.max(min, Math.min(max, value));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomWeighted<T>(choices: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  const rand = Math.random() * total;
  let cumulative = 0;
  for (let i = 0; i < choices.length; i++) {
    cumulative += weights[i];
    if (rand < cumulative) return choices[i];
  }
  return choices[choices.length - 1];
}

// ============================================================================
// Learner Profiles
// ============================================================================

type LearnerProfile =
  | "explorer"
  | "focused"
  | "experimenter"
  | "struggling"
  | "advanced";

interface ProfileCharacteristics {
  sessionDuration: { mean: number; sd: number };
  genomesCreated: { mean: number; sd: number };
  genomesExecuted: { mean: number; sd: number };
  mutationsApplied: { mean: number; sd: number };
  timeToFirstArtifact: { mean: number; sd: number };
  errorRate: number; // 0-1, probability of errors
  featureAdoption: number; // 0-1, likelihood of using advanced features
  renderModePreference: { visual: number; audio: number; both: number };
  mutationFocus: string[]; // Preferred mutation types
}

const PROFILES: Record<LearnerProfile, ProfileCharacteristics> = {
  explorer: {
    sessionDuration: { mean: 25 * 60 * 1000, sd: 8 * 60 * 1000 }, // 25 ± 8 min
    genomesCreated: { mean: 8, sd: 3 },
    genomesExecuted: { mean: 15, sd: 5 },
    mutationsApplied: { mean: 20, sd: 7 },
    timeToFirstArtifact: { mean: 3 * 60 * 1000, sd: 90 * 1000 }, // 3 ± 1.5 min
    errorRate: 0.15,
    featureAdoption: 0.8, // High feature usage
    renderModePreference: { visual: 0.4, audio: 0.2, both: 0.4 },
    mutationFocus: ["silent", "missense", "nonsense", "frameshift"], // Tries everything
  },
  focused: {
    sessionDuration: { mean: 15 * 60 * 1000, sd: 5 * 60 * 1000 }, // 15 ± 5 min
    genomesCreated: { mean: 4, sd: 2 },
    genomesExecuted: { mean: 8, sd: 3 },
    mutationsApplied: { mean: 10, sd: 4 },
    timeToFirstArtifact: { mean: 2 * 60 * 1000, sd: 45 * 1000 }, // 2 ± 0.75 min
    errorRate: 0.08,
    featureAdoption: 0.4, // Uses core features only
    renderModePreference: { visual: 0.8, audio: 0.1, both: 0.1 },
    mutationFocus: ["silent", "missense", "point"], // Sticks to basics
  },
  experimenter: {
    sessionDuration: { mean: 35 * 60 * 1000, sd: 10 * 60 * 1000 }, // 35 ± 10 min
    genomesCreated: { mean: 12, sd: 4 },
    genomesExecuted: { mean: 25, sd: 8 },
    mutationsApplied: { mean: 40, sd: 12 },
    timeToFirstArtifact: { mean: 2.5 * 60 * 1000, sd: 60 * 1000 }, // 2.5 ± 1 min
    errorRate: 0.2, // High experimentation = more errors
    featureAdoption: 0.9, // Uses everything
    renderModePreference: { visual: 0.3, audio: 0.3, both: 0.4 },
    mutationFocus: ["frameshift", "insertion", "deletion", "nonsense"], // Advanced
  },
  struggling: {
    sessionDuration: { mean: 12 * 60 * 1000, sd: 6 * 60 * 1000 }, // 12 ± 6 min
    genomesCreated: { mean: 2, sd: 1 },
    genomesExecuted: { mean: 4, sd: 2 },
    mutationsApplied: { mean: 5, sd: 3 },
    timeToFirstArtifact: { mean: 7 * 60 * 1000, sd: 3 * 60 * 1000 }, // 7 ± 3 min
    errorRate: 0.35,
    featureAdoption: 0.2, // Low feature exploration
    renderModePreference: { visual: 0.9, audio: 0.05, both: 0.05 },
    mutationFocus: ["point", "silent"], // Simple mutations only
  },
  advanced: {
    sessionDuration: { mean: 20 * 60 * 1000, sd: 6 * 60 * 1000 }, // 20 ± 6 min
    genomesCreated: { mean: 6, sd: 2 },
    genomesExecuted: { mean: 12, sd: 4 },
    mutationsApplied: { mean: 18, sd: 6 },
    timeToFirstArtifact: { mean: 90 * 1000, sd: 30 * 1000 }, // 1.5 ± 0.5 min
    errorRate: 0.05, // Very efficient
    featureAdoption: 0.85,
    renderModePreference: { visual: 0.5, audio: 0.2, both: 0.3 },
    mutationFocus: ["frameshift", "missense", "insertion", "deletion"],
  },
};

// ============================================================================
// Session Generation
// ============================================================================

interface MetricsSession {
  sessionId: string;
  startTime: string;
  duration: number;
  genomesCreated: number;
  genomesExecuted: number;
  mutationsApplied: number;
  timeToFirstArtifact: number;
  visualMode: number;
  audioMode: number;
  bothMode: number;
  silentMutations: number;
  missenseMutations: number;
  nonsenseMutations: number;
  frameshiftMutations: number;
  pointMutations: number;
  insertions: number;
  deletions: number;
  diffViewerUsage: number;
  timelineUsage: number;
  evolutionUsage: number;
  assessmentUsage: number;
  exportUsage: number;
  errorCount: number;
}

function generateSession(
  id: string,
  profile: LearnerProfile,
  baseTime: Date,
): MetricsSession {
  const char = PROFILES[profile];

  // Session metadata
  const duration = Math.max(
    60 * 1000, // Min 1 minute
    Math.round(
      randomBoundedNormal(
        char.sessionDuration.mean,
        char.sessionDuration.sd,
        0,
        60 * 60 * 1000,
      ),
    ),
  );
  const startTime = new Date(
    baseTime.getTime() + randomInt(-7 * 24 * 60 * 60 * 1000, 0),
  ); // Past week

  // Engagement metrics
  const genomesCreated = Math.max(
    0,
    Math.round(randomNormal(char.genomesCreated.mean, char.genomesCreated.sd)),
  );
  const genomesExecuted = Math.max(
    genomesCreated,
    Math.round(
      randomNormal(char.genomesExecuted.mean, char.genomesExecuted.sd),
    ),
  );
  const mutationsApplied = Math.max(
    0,
    Math.round(
      randomNormal(char.mutationsApplied.mean, char.mutationsApplied.sd),
    ),
  );

  const timeToFirstArtifact =
    genomesCreated > 0
      ? Math.max(
          10 * 1000, // Min 10 seconds
          Math.round(
            randomBoundedNormal(
              char.timeToFirstArtifact.mean,
              char.timeToFirstArtifact.sd,
              0,
              duration,
            ),
          ),
        )
      : 0;

  // Render mode distribution (must sum to genomesExecuted)
  const renderModeRoll = Math.random();
  let visualMode = 0,
    audioMode = 0,
    bothMode = 0;

  if (genomesExecuted > 0) {
    const total = genomesExecuted;
    if (renderModeRoll < char.renderModePreference.visual) {
      visualMode = Math.max(
        1,
        Math.round(total * Random.boundedNormal(0.7, 0.2, 0.3, 1.0)),
      );
      audioMode = Math.round(
        (total - visualMode) * Random.boundedNormal(0.3, 0.2, 0, 0.5),
      );
      bothMode = total - visualMode - audioMode;
    } else if (
      renderModeRoll <
      char.renderModePreference.visual + char.renderModePreference.audio
    ) {
      audioMode = Math.max(
        1,
        Math.round(total * Random.boundedNormal(0.6, 0.2, 0.3, 1.0)),
      );
      visualMode = Math.round(
        (total - audioMode) * Random.boundedNormal(0.3, 0.2, 0, 0.5),
      );
      bothMode = total - visualMode - audioMode;
    } else {
      bothMode = Math.max(
        1,
        Math.round(total * Random.boundedNormal(0.6, 0.2, 0.3, 1.0)),
      );
      visualMode = Math.round(
        (total - bothMode) * Random.boundedNormal(0.5, 0.2, 0, 0.7),
      );
      audioMode = total - visualMode - bothMode;
    }
  }

  // Mutation type distribution
  const mutationTypes = {
    silent: 0,
    missense: 0,
    nonsense: 0,
    frameshift: 0,
    point: 0,
    insertion: 0,
    deletion: 0,
  };

  if (mutationsApplied > 0) {
    // Distribute mutations based on profile focus
    const focusSet = new Set(char.mutationFocus);
    for (let i = 0; i < mutationsApplied; i++) {
      if (Math.random() < 0.7 && focusSet.size > 0) {
        // 70% chance to use focused mutation
        const type = randomChoice(
          char.mutationFocus,
        ) as keyof typeof mutationTypes;
        mutationTypes[type]++;
      } else {
        // 30% chance for random mutation
        const type = randomChoice([
          "silent",
          "missense",
          "nonsense",
          "frameshift",
          "point",
          "insertion",
          "deletion",
        ]) as keyof typeof mutationTypes;
        mutationTypes[type]++;
      }
    }
  }

  // Feature usage (correlated with mutations and duration)
  const featureUsageProbability =
    char.featureAdoption * (duration / (30 * 60 * 1000)); // Higher for longer sessions
  const diffViewerUsage =
    mutationsApplied > 5 && Math.random() < featureUsageProbability
      ? randomInt(1, Math.ceil(mutationsApplied / 3))
      : 0;

  const timelineUsage =
    genomesExecuted > 5 && Math.random() < featureUsageProbability
      ? randomInt(1, Math.ceil(genomesExecuted / 4))
      : 0;

  const evolutionUsage =
    mutationsApplied > 10 && Math.random() < featureUsageProbability * 0.6
      ? randomInt(1, 5)
      : 0;

  const assessmentUsage =
    Math.random() < featureUsageProbability * 0.4 ? randomInt(1, 3) : 0;

  const exportUsage =
    genomesCreated > 2 && Math.random() < featureUsageProbability * 0.7
      ? randomInt(1, Math.ceil(genomesCreated / 2))
      : 0;

  // Error count
  const errorCount =
    Math.random() < char.errorRate
      ? randomInt(1, Math.ceil(mutationsApplied * 0.3))
      : 0;

  return {
    sessionId: id,
    startTime: startTime.toISOString(),
    duration,
    genomesCreated,
    genomesExecuted,
    mutationsApplied,
    timeToFirstArtifact,
    visualMode,
    audioMode,
    bothMode,
    silentMutations: mutationTypes.silent,
    missenseMutations: mutationTypes.missense,
    nonsenseMutations: mutationTypes.nonsense,
    frameshiftMutations: mutationTypes.frameshift,
    pointMutations: mutationTypes.point,
    insertions: mutationTypes.insertion,
    deletions: mutationTypes.deletion,
    diffViewerUsage,
    timelineUsage,
    evolutionUsage,
    assessmentUsage,
    exportUsage,
    errorCount,
  };
}

// ============================================================================
// Dataset Generation
// ============================================================================

function generateMetricsDataset(n: number): MetricsSession[] {
  const sessions: MetricsSession[] = [];
  const baseTime = new Date();

  // Profile distribution (realistic classroom mix)
  const profiles: LearnerProfile[] = [
    "explorer",
    "focused",
    "experimenter",
    "struggling",
    "advanced",
  ];
  const profileWeights = [0.25, 0.3, 0.2, 0.15, 0.1]; // Most are focused/explorers

  for (let i = 0; i < n; i++) {
    const sessionId = `session_${String(i + 1).padStart(4, "0")}`;
    const profile = randomWeighted(profiles, profileWeights);
    const session = generateSession(sessionId, profile, baseTime);
    sessions.push(session);
  }

  return sessions;
}

// ============================================================================
// CSV Export
// ============================================================================

function writeCSV(sessions: MetricsSession[], filename: string): void {
  const headers = [
    "sessionId",
    "startTime",
    "duration",
    "genomesCreated",
    "genomesExecuted",
    "mutationsApplied",
    "timeToFirstArtifact",
    "visualMode",
    "audioMode",
    "bothMode",
    "silentMutations",
    "missenseMutations",
    "nonsenseMutations",
    "frameshiftMutations",
    "pointMutations",
    "insertions",
    "deletions",
    "diffViewerUsage",
    "timelineUsage",
    "evolutionUsage",
    "assessmentUsage",
    "exportUsage",
    "errorCount",
  ];

  const rows = sessions.map((s) => [
    s.sessionId,
    s.startTime,
    s.duration.toString(),
    s.genomesCreated.toString(),
    s.genomesExecuted.toString(),
    s.mutationsApplied.toString(),
    s.timeToFirstArtifact.toString(),
    s.visualMode.toString(),
    s.audioMode.toString(),
    s.bothMode.toString(),
    s.silentMutations.toString(),
    s.missenseMutations.toString(),
    s.nonsenseMutations.toString(),
    s.frameshiftMutations.toString(),
    s.pointMutations.toString(),
    s.insertions.toString(),
    s.deletions.toString(),
    s.diffViewerUsage.toString(),
    s.timelineUsage.toString(),
    s.evolutionUsage.toString(),
    s.assessmentUsage.toString(),
    s.exportUsage.toString(),
    s.errorCount.toString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  fs.writeFileSync(filename, csv, "utf-8");
  console.log(`✅ Generated ${filename} (${sessions.length} sessions)`);
}

// ============================================================================
// Summary Statistics
// ============================================================================

function printSummary(sessions: MetricsSession[]): void {
  const durations = sessions.map((s) => s.duration);
  const genomesCreated = sessions.map((s) => s.genomesCreated);
  const mutations = sessions.map((s) => s.mutationsApplied);
  const timeToFirst = sessions
    .filter((s) => s.timeToFirstArtifact > 0)
    .map((s) => s.timeToFirstArtifact);

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const formatDuration = (ms: number) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}m ${sec}s`;
  };

  console.log("\n📊 Dataset Summary:");
  console.log(`  Sessions:           ${sessions.length}`);
  console.log(`  Avg duration:       ${formatDuration(mean(durations))}`);
  console.log(`  Avg genomes:        ${mean(genomesCreated).toFixed(1)}`);
  console.log(`  Avg mutations:      ${mean(mutations).toFixed(1)}`);
  console.log(`  Avg time-to-first:  ${formatDuration(mean(timeToFirst))}`);

  // Render mode distribution
  const totalExecutions = sessions.reduce(
    (sum, s) => sum + s.genomesExecuted,
    0,
  );
  const visualTotal = sessions.reduce((sum, s) => sum + s.visualMode, 0);
  const audioTotal = sessions.reduce((sum, s) => sum + s.audioMode, 0);
  const bothTotal = sessions.reduce((sum, s) => sum + s.bothMode, 0);

  console.log("\n🎨 Render Modes:");
  console.log(
    `  Visual only:  ${((visualTotal / totalExecutions) * 100).toFixed(1)}%`,
  );
  console.log(
    `  Audio only:   ${((audioTotal / totalExecutions) * 100).toFixed(1)}%`,
  );
  console.log(
    `  Both modes:   ${((bothTotal / totalExecutions) * 100).toFixed(1)}%`,
  );

  // Feature adoption
  const diffUsers = sessions.filter((s) => s.diffViewerUsage > 0).length;
  const timelineUsers = sessions.filter((s) => s.timelineUsage > 0).length;
  const evolutionUsers = sessions.filter((s) => s.evolutionUsage > 0).length;

  console.log("\n🔧 Feature Adoption:");
  console.log(
    `  Diff Viewer:  ${((diffUsers / sessions.length) * 100).toFixed(1)}%`,
  );
  console.log(
    `  Timeline:     ${((timelineUsers / sessions.length) * 100).toFixed(1)}%`,
  );
  console.log(
    `  Evolution:    ${((evolutionUsers / sessions.length) * 100).toFixed(1)}%`,
  );
}

// ============================================================================
// CLI
// ============================================================================

function printUsage(): void {
  console.log(`
CodonCanvas Metrics Sample Data Generator
═══════════════════════════════════════════

USAGE:
  npm run metrics:generate-sample -- [OPTIONS]

OPTIONS:
  --n <number>         Number of sessions to generate (default: 20)
  --output <file>      Output CSV filename (default: sample-metrics.csv)

EXAMPLES:
  # Generate 20 sessions
  npm run metrics:generate-sample

  # Generate 50 sessions for pilot study
  npm run metrics:generate-sample -- --n 50 --output pilot-metrics.csv

  # Generate 100 sessions for larger study
  npm run metrics:generate-sample -- --n 100 --output study-metrics.csv
`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  const nIdx = args.indexOf("--n");
  const outputIdx = args.indexOf("--output");

  const n = nIdx !== -1 ? parseInt(args[nIdx + 1], 10) : 20;
  const output = outputIdx !== -1 ? args[outputIdx + 1] : "sample-metrics.csv";

  console.log(
    "\n╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║     CodonCanvas Metrics Sample Data Generator               ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝\n",
  );

  console.log(`Generating ${n} sessions...`);
  console.log(`Output: ${output}\n`);

  const sessions = generateMetricsDataset(n);
  writeCSV(sessions, output);
  printSummary(sessions);

  console.log("\n═".repeat(64));
  console.log("💡 Next steps:");
  console.log("  1. Open research-dashboard.html");
  console.log("  2. Import this CSV file");
  console.log('  3. Click "📈 Analyze Data" to view statistics\n');
}

main();

export { generateMetricsDataset, generateSession, PROFILES, writeCSV };
