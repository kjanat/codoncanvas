#!/usr/bin/env tsx
/**
 * Generate Sample Research Data for CodonCanvas Studies
 *
 * Creates realistic synthetic datasets for:
 * - Testing analysis scripts
 * - Demonstrating research workflows
 * - Training researchers on data analysis procedures
 *
 * Usage:
 *   npm run research:generate-data -- --design prepost --n 50 --effect 0.6
 *   npm run research:generate-data -- --design rct --n 150 --effect 0.5
 */

import * as fs from "node:fs";

// ============================================================================
// Random Number Generation
// ============================================================================

/**
 * Normal distribution (Box-Muller transform)
 */
function randomNormal(mean: number = 0, sd: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * sd + mean;
}

/**
 * Bounded normal (clips to min/max)
 */
function randomBoundedNormal(
  mean: number,
  sd: number,
  min: number,
  max: number,
): number {
  const value = randomNormal(mean, sd);
  return Math.max(min, Math.min(max, value));
}

/**
 * Random integer in range [min, max]
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random choice from array
 */
function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ============================================================================
// Data Generation Functions
// ============================================================================

interface GenerationParams {
  n: number;
  effect_size: number;
  pre_mean: number;
  pre_sd: number;
  reliability: number;
  ceiling: number;
}

/** Subscale scores for mutation types */
interface SubscaleScores {
  pretest_silent: number;
  posttest_silent: number;
  pretest_missense: number;
  posttest_missense: number;
  pretest_nonsense: number;
  posttest_nonsense: number;
  pretest_frameshift: number;
  posttest_frameshift: number;
  pretest_indel: number;
  posttest_indel: number;
}

/** Research participant data record */
interface ParticipantData extends SubscaleScores {
  id: string;
  pretest_total: number;
  posttest_total: number;
  delayed_total: number;
  mtt_score: string;
  imi_interest: string;
  imi_competence: string;
  imi_effort: string;
  imi_value: string;
  gpa: string;
  prior_programming: number;
  institution: string;
  group?: string;
}

/**
 * Generate pre-post pilot data
 */
function generatePrePostData(params: GenerationParams): ParticipantData[] {
  const data: ParticipantData[] = [];

  for (let i = 0; i < params.n; i++) {
    const id = `S${String(i + 1).padStart(3, "0")}`;

    // Pre-test score (out of 100)
    const pretest_total = Math.round(
      randomBoundedNormal(params.pre_mean, params.pre_sd, 0, params.ceiling),
    );

    // Learning gain (effect size controls magnitude)
    // Post = Pre + (effect_size * SD) + noise
    const true_gain = params.effect_size * params.pre_sd;
    const noise = randomNormal(0, params.pre_sd * (1 - params.reliability));
    let posttest_total = Math.round(pretest_total + true_gain + noise);

    // Apply ceiling effect
    if (pretest_total > 80) {
      posttest_total = Math.round(pretest_total + true_gain * 0.5 + noise);
    }
    posttest_total = Math.min(params.ceiling, posttest_total);

    // Subscale scores (5 mutation types, each 0-20 points)
    const mutation_types = [
      "silent",
      "missense",
      "nonsense",
      "frameshift",
      "indel",
    ];
    const subscales = {} as Record<string, number>;

    for (const type of mutation_types) {
      const pre_sub = Math.round(
        randomBoundedNormal(pretest_total / 5, 4, 0, 20),
      );
      let post_sub = Math.round(pre_sub + true_gain / 5 + randomNormal(0, 2));
      post_sub = Math.max(0, Math.min(20, post_sub));

      subscales[`pretest_${type}`] = pre_sub;
      subscales[`posttest_${type}`] = post_sub;
    }

    // Delayed retention (4-6 weeks later, slight decay)
    const retention_rate = randomBoundedNormal(0.9, 0.1, 0.7, 1.0);
    const gain = posttest_total - pretest_total;
    let delayed_total = Math.round(pretest_total + gain * retention_rate);
    delayed_total = Math.max(0, Math.min(params.ceiling, delayed_total));

    // Transfer task (MTT, 0-15 points)
    // Correlates with post-test but adds measurement error
    const mtt_score = Math.round(
      randomBoundedNormal((posttest_total / 100) * 15, 2, 0, 15),
    );

    // Motivation (IMI, 1-7 scale)
    // High scores for successful learners
    const success = (posttest_total - pretest_total) / params.pre_sd;
    const imi_base = 4 + success * 0.5;

    const imi_interest = randomBoundedNormal(imi_base + 0.5, 0.8, 1, 7);
    const imi_competence = randomBoundedNormal(imi_base, 0.9, 1, 7);
    const imi_effort = randomBoundedNormal(imi_base - 0.3, 0.7, 1, 7);
    const imi_value = randomBoundedNormal(imi_base + 0.3, 0.8, 1, 7);

    // Demographics
    const gpa = randomBoundedNormal(3.2, 0.5, 2.0, 4.0);
    const prior_programming = randomChoice([0, 0, 1, 1, 2, 3]); // Most have little/no experience
    const institution = "University A";

    data.push({
      id,
      pretest_total,
      posttest_total,
      delayed_total,
      ...(subscales as SubscaleScores),
      mtt_score: mtt_score.toFixed(1),
      imi_interest: imi_interest.toFixed(1),
      imi_competence: imi_competence.toFixed(1),
      imi_effort: imi_effort.toFixed(1),
      imi_value: imi_value.toFixed(1),
      gpa: gpa.toFixed(2),
      prior_programming,
      institution,
    });
  }

  return data;
}

/**
 * Generate RCT data (treatment vs control)
 */
function generateRCTData(
  n_per_group: number,
  treatment_effect: number,
  pre_mean: number = 55,
  pre_sd: number = 15,
): ParticipantData[] {
  const data: ParticipantData[] = [];

  // Generate treatment group
  const treatmentParams: GenerationParams = {
    n: n_per_group,
    effect_size: treatment_effect,
    pre_mean,
    pre_sd,
    reliability: 0.85,
    ceiling: 100,
  };

  const treatmentData = generatePrePostData(treatmentParams);
  treatmentData.forEach((d, i) => {
    d.id = `T${String(i + 1).padStart(3, "0")}`;
    d.group = "treatment";
    data.push(d);
  });

  // Generate control group (smaller or no effect)
  const controlParams: GenerationParams = {
    n: n_per_group,
    effect_size: treatment_effect * 0.3, // Control shows small test-retest effect
    pre_mean,
    pre_sd,
    reliability: 0.85,
    ceiling: 100,
  };

  const controlData = generatePrePostData(controlParams);
  controlData.forEach((d, i) => {
    d.id = `C${String(i + 1).padStart(3, "0")}`;
    d.group = "control";
    data.push(d);
  });

  return data;
}

/**
 * Write data to CSV
 */
function writeCSV(data: ParticipantData[], filename: string): void {
  const headers = Object.keys(data[0]) as (keyof ParticipantData)[];
  const rows = data.map((row) => headers.map((h) => row[h]).join(","));
  const csv = [headers.join(","), ...rows].join("\n");

  fs.writeFileSync(filename, csv, "utf-8");
  console.log(`✅ Generated ${filename} (${data.length} rows)`);
}

// ============================================================================
// CLI
// ============================================================================

function printUsage(): void {
  console.log(`
CodonCanvas Sample Data Generator
══════════════════════════════════

USAGE:
  npm run research:generate-data -- [OPTIONS]

OPTIONS:
  --design <type>       Study design: prepost | rct (default: prepost)
  --n <number>          Sample size per group (default: 50)
  --effect <value>      Effect size (Cohen's d, default: 0.6)
  --output <file>       Output filename (default: sample_data.csv)

EXAMPLES:
  # Pre-post pilot (N=50, d=0.6)
  npm run research:generate-data -- --design prepost --n 50 --effect 0.6

  # RCT (N=75 per group, d=0.5)
  npm run research:generate-data -- --design rct --n 75 --effect 0.5

  # Small pilot with large effect
  npm run research:generate-data -- --design prepost --n 30 --effect 0.8 --output pilot.csv
`);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  // Parse arguments
  const designIdx = args.indexOf("--design");
  const nIdx = args.indexOf("--n");
  const effectIdx = args.indexOf("--effect");
  const outputIdx = args.indexOf("--output");

  const design = designIdx !== -1 ? args[designIdx + 1] : "prepost";
  const n = nIdx !== -1 ? parseInt(args[nIdx + 1], 10) : 50;
  const effect = effectIdx !== -1 ? parseFloat(args[effectIdx + 1]) : 0.6;
  const output = outputIdx !== -1 ? args[outputIdx + 1] : "sample_data.csv";

  console.log(
    "\n╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║         CodonCanvas Sample Data Generator                    ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝\n",
  );

  console.log(`Design:      ${design}`);
  console.log(`Sample size: ${design === "rct" ? `${n} per group` : n}`);
  console.log(
    `Effect size: ${effect} (${
      effect < 0.3 ? "small" : effect < 0.6 ? "medium" : "large"
    })`,
  );
  console.log(`Output:      ${output}\n`);

  let data: ParticipantData[];

  if (design === "prepost") {
    const params: GenerationParams = {
      n,
      effect_size: effect,
      pre_mean: 55,
      pre_sd: 15,
      reliability: 0.85,
      ceiling: 100,
    };
    data = generatePrePostData(params);
  } else if (design === "rct") {
    data = generateRCTData(n, effect);
  } else {
    console.error(`Error: Unknown design "${design}". Use "prepost" or "rct"`);
    process.exit(1);
  }

  writeCSV(data, output);

  // Summary statistics
  const pre = data.map((d) => d.pretest_total);
  const post = data.map((d) => d.posttest_total);
  const preMean = pre.reduce((a, b) => a + b, 0) / pre.length;
  const postMean = post.reduce((a, b) => a + b, 0) / post.length;

  console.log(`\n📊 Summary:`);
  console.log(`  Pre-test:  M = ${preMean.toFixed(2)}`);
  console.log(`  Post-test: M = ${postMean.toFixed(2)}`);
  console.log(`  Gain:      M = ${(postMean - preMean).toFixed(2)}`);

  if (design === "rct") {
    const treatment = data.filter((d) => d.group === "treatment");
    const control = data.filter((d) => d.group === "control");

    const tPost = treatment.map((d) => d.posttest_total);
    const cPost = control.map((d) => d.posttest_total);
    const tMean = tPost.reduce((a, b) => a + b, 0) / tPost.length;
    const cMean = cPost.reduce((a, b) => a + b, 0) / cPost.length;

    console.log(`\n  Treatment post: M = ${tMean.toFixed(2)}`);
    console.log(`  Control post:   M = ${cMean.toFixed(2)}`);
    console.log(`  Difference:     ${(tMean - cMean).toFixed(2)} points`);
  }

  console.log(`${"\n═".repeat(64)}\n`);
}

// Run if executed directly
main();

export {
  generatePrePostData,
  generateRCTData,
  randomBoundedNormal,
  randomChoice,
  randomInt,
  randomNormal,
  writeCSV,
};
