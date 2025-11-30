#!/usr/bin/env tsx

/**
 * Test new algorithmic showcase examples
 * Validates that all new .genome files parse and render without errors
 */

import { readFileSync } from "node:fs";
import { createCanvas } from "canvas";
import { Canvas2DRenderer } from "@/core";
import { CodonLexer } from "@/core/lexer";
import { CodonVM } from "@/core/vm";

const examples = [
  "fibonacci-spiral.genome",
  "parametric-rose.genome",
  "sierpinski-approximation.genome",
  "golden-ratio-demo.genome",
  "prime-number-spiral.genome",
];

console.log("🧬 Testing new algorithmic showcase examples...\n");

const lexer = new CodonLexer();
let allPassed = true;

for (const example of examples) {
  try {
    console.log(`Testing ${example}...`);

    // Read genome file
    const genome = readFileSync(`examples/${example}`, "utf-8");

    // Tokenize
    const tokens = lexer.tokenize(genome);
    console.log(`  ✓ Tokenized: ${tokens.length} codons`);

    // Validate structure
    const errors = lexer.validateStructure(tokens);
    if (errors.filter((e) => e.severity === "error").length > 0) {
      console.log(`  ✗ Validation errors:`, errors);
      allPassed = false;
      continue;
    }
    console.log(`  ✓ Structure valid`);

    // Create VM and render
    const canvas = createCanvas(400, 400);
    const renderer = new Canvas2DRenderer(
      canvas as unknown as HTMLCanvasElement,
    );
    const vm = new CodonVM(renderer);

    const snapshots = vm.run(tokens);
    console.log(`  ✓ Rendered: ${snapshots.length} instructions executed`);

    // Check operations (may not be exposed in public API)
    const opCount =
      (renderer as unknown as { operations?: unknown[] }).operations?.length ||
      "N/A";
    console.log(`  ✓ Drawing operations: ${opCount}`);

    // Basic success check - if we got here, rendering succeeded
    console.log(`  ✓ Final stack size: ${vm.state.stack.length}`);

    console.log(`  ✅ PASS\n`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`  ❌ FAIL: ${message}\n`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log("🎉 All examples passed!");
  process.exit(0);
} else {
  console.log("❌ Some examples failed");
  process.exit(1);
}
