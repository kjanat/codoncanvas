/**
 * Genome Complexity Analysis Script
 *
 * Analyzes all example genomes to provide empirical data on:
 * - Instruction counts
 * - Opcode distribution
 * - Stack depth requirements
 * - Complexity metrics
 *
 * Uses the centralized analyzeComplexity function from codon-analyzer.ts
 * Output: JSON report with complexity scores for each genome
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeComplexity, type GenomeComplexity } from "@/analysis";
import { CodonLexer } from "@/core/lexer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ComplexityReport {
  timestamp: string;
  totalGenomes: number;
  analysis: GenomeComplexity[];
  summary: {
    avgInstructions: number;
    avgUniqueOpcodes: number;
    avgComplexity: number;
    simplest: { name: string; score: number };
    mostComplex: { name: string; score: number };
  };
}

/**
 * Analyze a single genome file using the centralized complexity analyzer
 */
function analyzeGenome(filename: string, content: string): GenomeComplexity {
  const lexer = new CodonLexer();

  try {
    const tokens = lexer.tokenize(content);
    return analyzeComplexity(filename, tokens);
  } catch (_error) {
    // Return minimal analysis for invalid genomes
    return analyzeComplexity(filename, []);
  }
}

/**
 * Main analysis function
 */
function main() {
  const examplesDir = join(__dirname, "..", "examples");
  const files = readdirSync(examplesDir).filter((f) => f.endsWith(".genome"));

  console.log(`\n📊 Analyzing ${files.length} genomes...\n`);

  const analyses: GenomeComplexity[] = [];

  files.forEach((filename) => {
    const content = readFileSync(join(examplesDir, filename), "utf-8");
    const analysis = analyzeGenome(filename, content);
    analyses.push(analysis);

    console.log(
      `✓ ${filename.padEnd(30)} | ${analysis.instructionCount
        .toString()
        .padStart(3)} instructions | ${analysis.uniqueOpcodes
        .toString()
        .padStart(2)} opcodes | complexity: ${analysis.complexityScore}`,
    );
  });

  // Calculate summary statistics
  const avgInstructions =
    analyses.reduce((sum, a) => sum + a.instructionCount, 0) / analyses.length;
  const avgUniqueOpcodes =
    analyses.reduce((sum, a) => sum + a.uniqueOpcodes, 0) / analyses.length;
  const avgComplexity =
    analyses.reduce((sum, a) => sum + a.complexityScore, 0) / analyses.length;

  const sortedByComplexity = [...analyses].sort(
    (a, b) => a.complexityScore - b.complexityScore,
  );
  const simplest = sortedByComplexity[0];
  const mostComplex = sortedByComplexity[sortedByComplexity.length - 1];

  const report: ComplexityReport = {
    timestamp: new Date().toISOString(),
    totalGenomes: analyses.length,
    analysis: analyses.sort((a, b) => a.complexityScore - b.complexityScore),
    summary: {
      avgInstructions: Math.round(avgInstructions * 10) / 10,
      avgUniqueOpcodes: Math.round(avgUniqueOpcodes * 10) / 10,
      avgComplexity: Math.round(avgComplexity * 10) / 10,
      simplest: {
        name: simplest.filename,
        score: simplest.complexityScore,
      },
      mostComplex: {
        name: mostComplex.filename,
        score: mostComplex.complexityScore,
      },
    },
  };

  // Write report
  const reportPath = join(
    __dirname,
    "..",
    "claudedocs",
    "complexity-analysis.json",
  );
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n📈 Summary Statistics:`);
  console.log(`   Average instructions: ${report.summary.avgInstructions}`);
  console.log(`   Average unique opcodes: ${report.summary.avgUniqueOpcodes}`);
  console.log(`   Average complexity: ${report.summary.avgComplexity}`);
  console.log(`\n🎯 Complexity Range:`);
  console.log(
    `   Simplest: ${report.summary.simplest.name} (${report.summary.simplest.score})`,
  );
  console.log(
    `   Most complex: ${report.summary.mostComplex.name} (${report.summary.mostComplex.score})`,
  );
  console.log(`\n💾 Full report saved to: ${reportPath}\n`);
}

main();
