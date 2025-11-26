/**
 * Genome Complexity Analysis Script
 *
 * Analyzes all 48 example genomes to provide empirical data on:
 * - Instruction counts
 * - Opcode distribution
 * - Stack depth requirements
 * - Complexity metrics
 *
 * Output: JSON report with complexity scores for each genome
 */

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { CodonLexer } from "../src/lexer";
import { CODON_MAP, Opcode } from "../src/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface GenomeComplexity {
  filename: string;
  instructionCount: number;
  uniqueOpcodes: number;
  opcodeDistribution: Record<string, number>;
  maxStackDepth: number;
  complexityScore: number;
  hasPush: boolean;
  hasLoop: boolean;
  hasConditional: boolean;
  hasArithmetic: boolean;
}

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
 * Analyze a single genome file
 */
function analyzeGenome(filename: string, content: string): GenomeComplexity {
  const lexer = new CodonLexer();

  try {
    const tokens = lexer.tokenize(content);
    const instructionCount = tokens.length;

    // Count opcode usage
    const opcodeDistribution: Record<string, number> = {};
    const uniqueOpcodes = new Set<Opcode>();

    tokens.forEach((token) => {
      const opcode = CODON_MAP[token.text];
      if (opcode !== undefined) {
        uniqueOpcodes.add(opcode);
        const opcodeName = Opcode[opcode];
        opcodeDistribution[opcodeName] =
          (opcodeDistribution[opcodeName] || 0) + 1;
      }
    });

    // Simulate stack depth (simple approximation)
    let currentDepth = 0;
    let maxStackDepth = 0;

    tokens.forEach((token) => {
      const opcode = CODON_MAP[token.text];

      // Stack producers
      if (opcode === Opcode.PUSH || opcode === Opcode.DUP) {
        currentDepth++;
        maxStackDepth = Math.max(maxStackDepth, currentDepth);
      }

      // Stack consumers
      if (
        opcode === Opcode.CIRCLE ||
        opcode === Opcode.LINE ||
        opcode === Opcode.TRIANGLE ||
        opcode === Opcode.ROTATE ||
        opcode === Opcode.SCALE ||
        opcode === Opcode.POP
      ) {
        currentDepth = Math.max(0, currentDepth - 1);
      }

      if (
        opcode === Opcode.RECT ||
        opcode === Opcode.ELLIPSE ||
        opcode === Opcode.TRANSLATE
      ) {
        currentDepth = Math.max(0, currentDepth - 2);
      }

      if (opcode === Opcode.COLOR) {
        currentDepth = Math.max(0, currentDepth - 3);
      }
    });

    // Detect advanced features
    const hasPush = uniqueOpcodes.has(Opcode.PUSH);
    const hasLoop = uniqueOpcodes.has(Opcode.LOOP);
    const hasConditional =
      uniqueOpcodes.has(Opcode.IF) || uniqueOpcodes.has(Opcode.IFELSE);
    const hasArithmetic =
      uniqueOpcodes.has(Opcode.ADD) ||
      uniqueOpcodes.has(Opcode.SUB) ||
      uniqueOpcodes.has(Opcode.MUL) ||
      uniqueOpcodes.has(Opcode.DIV);

    // Calculate complexity score
    let complexityScore = instructionCount;
    complexityScore += uniqueOpcodes.size * 5; // Variety of opcodes
    complexityScore += maxStackDepth * 3; // Stack management complexity
    if (hasLoop) complexityScore += 20;
    if (hasConditional) complexityScore += 15;
    if (hasArithmetic) complexityScore += 10;

    return {
      filename,
      instructionCount,
      uniqueOpcodes: uniqueOpcodes.size,
      opcodeDistribution,
      maxStackDepth,
      complexityScore,
      hasPush,
      hasLoop,
      hasConditional,
      hasArithmetic,
    };
  } catch (error) {
    // Return minimal analysis for invalid genomes
    return {
      filename,
      instructionCount: 0,
      uniqueOpcodes: 0,
      opcodeDistribution: {},
      maxStackDepth: 0,
      complexityScore: 0,
      hasPush: false,
      hasLoop: false,
      hasConditional: false,
      hasArithmetic: false,
    };
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
