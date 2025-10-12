#!/usr/bin/env tsx
/**
 * Performance benchmark suite for CodonCanvas v1.1.0
 *
 * Measures lexer, VM, and renderer performance across various genome sizes
 * and opcode patterns to establish baseline performance characteristics.
 */

import { createCanvas } from 'canvas';
import { CodonLexer } from '../src/lexer';
import { CodonVM } from '../src/vm';
import { Canvas2DRenderer } from '../src/renderer';

// Benchmark configuration
const ITERATIONS = 20;
const WARMUP_ITERATIONS = 5;
const GENOME_SIZES = [10, 50, 100, 500, 1000];

// Test genome generators
function generateSimpleGenome(numCodeons: number): string {
  // ATG + (PUSH 10 + CIRCLE) * n + TAA
  const pattern = 'GAA AAT GGA '; // PUSH 10, CIRCLE
  const body = pattern.repeat(Math.floor((numCodeons - 2) / 2));
  return `ATG ${body}TAA`;
}

function generateComplexGenome(numCodeons: number): string {
  // Mix of drawing primitives and transforms
  const patterns = [
    'GAA AAT GGA ', // PUSH 10, CIRCLE
    'GAA AAT GAA AAT CCA ', // PUSH 10, PUSH 10, RECT
    'GAA CCC GAA AAA ACA ', // PUSH 21, PUSH 0, TRANSLATE
    'GAA AGG AGA ', // PUSH 10, ROTATE
    'GAA AAC CGA ', // PUSH 2, SCALE
  ];

  let body = '';
  let count = 0;
  while (count < numCodeons - 2) {
    const pattern = patterns[count % patterns.length];
    body += pattern;
    count += pattern.trim().split(/\s+/).length;
  }

  return `ATG ${body}TAA`;
}

function generateTransformHeavy(numCodeons: number): string {
  // Heavy on transforms and state management
  const pattern = 'GAA AAT ACA GAA AGG AGA GAA AAC CGA TCA '; // translate, rotate, scale, save_state
  const body = pattern.repeat(Math.floor((numCodeons - 2) / 10));
  return `ATG ${body}GAA AAT GGA TAA`; // End with a shape
}

// Statistics calculation
interface BenchmarkStats {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
}

function calculateStats(times: number[]): BenchmarkStats {
  const sorted = [...times].sort((a, b) => a - b);
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);

  return {
    mean,
    median,
    stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

// Benchmark functions
function benchmarkLexer(genome: string, iterations: number): number[] {
  const lexer = new CodonLexer();
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    lexer.tokenize(genome);
    const end = performance.now();
    times.push(end - start);
  }

  return times;
}

function benchmarkVM(genome: string, iterations: number): number[] {
  const lexer = new CodonLexer();
  const tokens = lexer.tokenize(genome);
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const canvas = createCanvas(400, 400);
    const renderer = new Canvas2DRenderer(canvas as any);
    const vm = new CodonVM(renderer);

    const start = performance.now();
    vm.run(tokens);
    const end = performance.now();
    times.push(end - start);
  }

  return times;
}

function benchmarkEndToEnd(genome: string, iterations: number): number[] {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const lexer = new CodonLexer();
    const canvas = createCanvas(400, 400);
    const renderer = new Canvas2DRenderer(canvas as any);
    const vm = new CodonVM(renderer);

    const start = performance.now();
    const tokens = lexer.tokenize(genome);
    vm.run(tokens);
    const end = performance.now();
    times.push(end - start);
  }

  return times;
}

// Run benchmarks
console.log('🧬 CodonCanvas Performance Benchmark Suite v1.1.0\n');
console.log(`Configuration: ${ITERATIONS} iterations, ${WARMUP_ITERATIONS} warmup runs\n`);

interface BenchmarkResult {
  size: number;
  type: string;
  lexer: BenchmarkStats;
  vm: BenchmarkStats;
  endToEnd: BenchmarkStats;
  codonCount: number;
}

const results: BenchmarkResult[] = [];

for (const size of GENOME_SIZES) {
  console.log(`\n📊 Testing genome size: ${size} codons`);

  // Test simple genome
  console.log('  → Simple genome (repeated shapes)...');
  const simple = generateSimpleGenome(size);
  const simpleLexer = new CodonLexer();
  const simpleTokens = simpleLexer.tokenize(simple);
  const simpleCodonCount = simpleTokens.length;

  // Warmup
  benchmarkLexer(simple, WARMUP_ITERATIONS);
  benchmarkVM(simple, WARMUP_ITERATIONS);
  benchmarkEndToEnd(simple, WARMUP_ITERATIONS);

  // Actual benchmarks
  const simpleLexerTimes = benchmarkLexer(simple, ITERATIONS);
  const simpleVMTimes = benchmarkVM(simple, ITERATIONS);
  const simpleE2ETimes = benchmarkEndToEnd(simple, ITERATIONS);

  results.push({
    size,
    type: 'simple',
    lexer: calculateStats(simpleLexerTimes),
    vm: calculateStats(simpleVMTimes),
    endToEnd: calculateStats(simpleE2ETimes),
    codonCount: simpleCodonCount,
  });

  // Test complex genome
  console.log('  → Complex genome (mixed opcodes)...');
  const complex = generateComplexGenome(size);
  const complexLexer = new CodonLexer();
  const complexTokens = complexLexer.tokenize(complex);
  const complexCodonCount = complexTokens.length;

  // Warmup
  benchmarkLexer(complex, WARMUP_ITERATIONS);
  benchmarkVM(complex, WARMUP_ITERATIONS);
  benchmarkEndToEnd(complex, WARMUP_ITERATIONS);

  // Actual benchmarks
  const complexLexerTimes = benchmarkLexer(complex, ITERATIONS);
  const complexVMTimes = benchmarkVM(complex, ITERATIONS);
  const complexE2ETimes = benchmarkEndToEnd(complex, ITERATIONS);

  results.push({
    size,
    type: 'complex',
    lexer: calculateStats(complexLexerTimes),
    vm: calculateStats(complexVMTimes),
    endToEnd: calculateStats(complexE2ETimes),
    codonCount: complexCodonCount,
  });

  console.log(`  ✓ Complete (${simpleCodonCount} codons simple, ${complexCodonCount} codons complex)`);
}

// Output results
console.log('\n\n📈 BENCHMARK RESULTS\n');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

for (const result of results) {
  console.log(`${result.type.toUpperCase()} GENOME (${result.codonCount} codons, target ~${result.size})`);
  console.log('─────────────────────────────────────────────────────────────────────────');
  console.log(`  Lexer:      ${result.lexer.mean.toFixed(3)}ms (±${result.lexer.stdDev.toFixed(3)}ms)`);
  console.log(`  VM:         ${result.vm.mean.toFixed(3)}ms (±${result.vm.stdDev.toFixed(3)}ms)`);
  console.log(`  End-to-End: ${result.endToEnd.mean.toFixed(3)}ms (±${result.endToEnd.stdDev.toFixed(3)}ms)`);
  console.log(`  Throughput: ${(result.codonCount / (result.endToEnd.mean / 1000)).toFixed(0)} codons/sec`);
  console.log('');
}

// Generate markdown table for PERFORMANCE.md
console.log('\n📝 MARKDOWN TABLE FOR DOCUMENTATION\n');
console.log('═══════════════════════════════════════════════════════════════════════════\n');

console.log('## Simple Genomes (Repeated Shapes)\n');
console.log('| Codons | Lexer (ms) | VM (ms) | End-to-End (ms) | Throughput (codons/sec) |');
console.log('|--------|------------|---------|-----------------|-------------------------|');
for (const result of results.filter(r => r.type === 'simple')) {
  const throughput = Math.round(result.codonCount / (result.endToEnd.mean / 1000));
  console.log(`| ${result.codonCount} | ${result.lexer.mean.toFixed(2)} | ${result.vm.mean.toFixed(2)} | ${result.endToEnd.mean.toFixed(2)} | ${throughput.toLocaleString()} |`);
}

console.log('\n## Complex Genomes (Mixed Opcodes)\n');
console.log('| Codons | Lexer (ms) | VM (ms) | End-to-End (ms) | Throughput (codons/sec) |');
console.log('|--------|------------|---------|-----------------|-------------------------|');
for (const result of results.filter(r => r.type === 'complex')) {
  const throughput = Math.round(result.codonCount / (result.endToEnd.mean / 1000));
  console.log(`| ${result.codonCount} | ${result.lexer.mean.toFixed(2)} | ${result.vm.mean.toFixed(2)} | ${result.endToEnd.mean.toFixed(2)} | ${throughput.toLocaleString()} |`);
}

console.log('\n\n✅ Benchmark complete! Copy tables above to PERFORMANCE.md\n');

// Export results as JSON for further analysis
const output = {
  version: '1.1.0',
  timestamp: new Date().toISOString(),
  config: {
    iterations: ITERATIONS,
    warmup: WARMUP_ITERATIONS,
    genomeSizes: GENOME_SIZES,
  },
  results,
};

console.log('📊 Raw JSON data:');
console.log(JSON.stringify(output, null, 2));
