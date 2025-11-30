#!/usr/bin/env bun
/**
 * Export built-in examples as individual .genome files
 * Creates examples/ directory with all 18 examples
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { examples } from "../src/data/examples";

const OUTPUT_DIR = "examples";
const README_TEMPLATE = `# CodonCanvas Example Programs

This directory contains 18 ready-to-use genome files for CodonCanvas.

## Usage

1. **Web Playground**: Click "Load Example" or drag-and-drop .genome files
2. **Command Line**: \`codoncanvas run example.genome\`
3. **Classroom**: Distribute to students for modification experiments

## Difficulty Levels

### Beginner (5 examples)
`;

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

console.log("📦 Exporting CodonCanvas examples...\n");

// Export each example
let count = 0;
const metadataList: Array<{
  key: string;
  title: string;
  difficulty: string;
  concepts: string[];
}> = [];

for (const [key, example] of Object.entries(examples)) {
  const filename = `${key}.genome`;
  const filepath = join(OUTPUT_DIR, filename);

  // Create file with metadata header
  const content = `; ${example.title}
; ${example.description}
; Difficulty: ${example.difficulty}
; Concepts: ${example.concepts.join(", ")}
; Good for mutations: ${example.goodForMutations.join(", ")}

${example.genome}
`;

  writeFileSync(filepath, content, "utf-8");
  count++;

  metadataList.push({
    key,
    title: example.title,
    difficulty: example.difficulty,
    concepts: example.concepts,
  });

  console.log(`✅ ${filename.padEnd(30)} (${example.difficulty})`);
}

// Group by difficulty
const beginner = metadataList.filter((e) => e.difficulty === "beginner");
const intermediate = metadataList.filter(
  (e) => e.difficulty === "intermediate",
);
const advanced = metadataList.filter((e) => e.difficulty === "advanced");

// Generate README
let readme = README_TEMPLATE;

readme += beginner.map((e) => `- **${e.key}.genome** - ${e.title}`).join("\n");
readme += `\n\n### Intermediate (${intermediate.length} examples)\n`;
readme += intermediate
  .map((e) => `- **${e.key}.genome** - ${e.title}`)
  .join("\n");
readme += `\n\n### Advanced (${advanced.length} examples)\n`;
readme += advanced.map((e) => `- **${e.key}.genome** - ${e.title}`).join("\n");

readme += `

## Mutation Experiments

These examples are designed for classroom mutation experiments:

- **Silent mutations**: Change synonymous codons (e.g., GGA→GGC) - no output change
- **Missense mutations**: Change opcode family (e.g., GGA→CCA) - shape change
- **Nonsense mutations**: Insert STOP codon (TAA/TAG/TGA) - truncated output
- **Frameshift mutations**: Insert/delete 1-2 bases - scrambled downstream

## File Format

Each .genome file contains:
1. Comment header with metadata (lines starting with \`;\`)
2. DNA sequence using only A, C, G, T bases
3. Whitespace and comments ignored by interpreter
4. Total bases must be divisible by 3 (triplet codons)

## Quick Start

Try \`helloCircle.genome\` first - minimal example that draws a circle.

For classroom use, see EDUCATORS.md for lesson plans and mutation activities.
`;

writeFileSync(join(OUTPUT_DIR, "README.md"), readme, "utf-8");

console.log(`\n✅ Exported ${count} examples to ${OUTPUT_DIR}/`);
console.log("✅ Generated examples/README.md");
console.log(
  "\n📝 Next: Run `npm run zip-examples` to create distribution archive",
);
