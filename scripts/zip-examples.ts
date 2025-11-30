#!/usr/bin/env bun
/**
 * Create distribution ZIP of example .genome files using Bun's native features.
 * Pure TypeScript implementation with fflate for cross-platform ZIP creation.
 *
 * Usage: bun scripts/zip-examples.ts
 * Output: codoncanvas-examples.zip
 */

import { rm } from "node:fs/promises";
import { join } from "node:path";
import { zipSync } from "fflate";
import pkg from "~/package.json";

const OUTPUT_ZIP = "codoncanvas-examples.zip";
const TEMP_DIR = "codoncanvas-examples";

/**
 * Distribution contents: [directory, glob patterns]
 */
const DISTRIBUTION_SOURCES: [string, string[]][] = [
  [
    "examples",
    ["*.genome", "README.md", "learning-paths.json", "screenshots/*.png"],
  ],
  ["public/assets", ["codon-chart.svg"]],
];

interface ZipEntry {
  [path: string]: Uint8Array;
}

/**
 * Collect files matching glob patterns into ZIP entries.
 * Uses Bun.Glob for efficient file discovery and Bun.file().bytes() for reading.
 */
async function collectFiles(): Promise<ZipEntry> {
  const entries: ZipEntry = {};

  for (const [dir, patterns] of DISTRIBUTION_SOURCES) {
    for (const pattern of patterns) {
      const glob = new Bun.Glob(pattern);

      for await (const relativePath of glob.scan({
        cwd: dir,
        onlyFiles: true,
      })) {
        const fullPath = join(dir, relativePath);
        const zipPath = `${TEMP_DIR}/${relativePath}`;
        entries[zipPath] = await Bun.file(fullPath).bytes();
      }
    }
  }

  return entries;
}

/**
 * Generate QUICK_START.txt content
 */
function generateQuickStart(): string {
  return `CodonCanvas Quick Start
=======================

STEP 1: Open CodonCanvas
   Web: https://codoncanvas.org
   Local: Open index.html in browser

STEP 2: Load an Example
   - Click "Load Example" button
   - Or drag-and-drop a .genome file

STEP 3: Run the Program
   - Click Play button
   - Watch visual output appear on canvas

STEP 4: Experiment
   - Change codons and re-run
   - Try mutations (see examples/README.md)
   - Save your work (Download button)

NEED HELP?
- See codon-chart.svg for complete reference
- See examples/README.md for mutation experiments
- All programs must start with ATG and end with TAA/TAG/TGA
- Only use bases A, C, G, T
- Total length must be divisible by 3

CLASSROOM USE:
See EDUCATORS.md and STUDENT_HANDOUTS.md for lesson plans
`;
}

/**
 * Generate VERSION.txt content with build metadata
 */
function generateVersionInfo(genomeCount: number): string {
  const buildDate = new Date().toISOString().split("T")[0];

  return `CodonCanvas Example Programs
Version: ${pkg.version}
Date: ${buildDate}
Contents: ${genomeCount} example .genome files + documentation
License: MIT

For more information:
- README.md: Overview of all examples
- codon-chart.svg: Visual reference poster
- QUICK_START.txt: Getting started guide

Web: https://codoncanvas.org
Docs: https://github.com/codoncanvas/codoncanvas
`;
}

/**
 * Format file size in human-readable format
 */
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

async function main(): Promise<void> {
  console.info("Creating CodonCanvas Examples distribution...\n");

  // Clean old artifacts
  await rm(OUTPUT_ZIP, { force: true });

  // Collect all files for the ZIP
  const zipEntries: ZipEntry = {};

  // 1. Collect all distribution files
  console.info("Collecting files...");
  const collectedFiles = await collectFiles();
  Object.assign(zipEntries, collectedFiles);

  // Count genome files for VERSION.txt metadata
  const collectedPaths = Object.keys(collectedFiles);
  const genomeCount = collectedPaths.filter((p) =>
    p.endsWith(".genome"),
  ).length;

  // 2. Add generated documentation files
  console.info("Generating documentation...");
  const encoder = new TextEncoder();
  zipEntries[`${TEMP_DIR}/QUICK_START.txt`] = encoder.encode(
    generateQuickStart(),
  );
  zipEntries[`${TEMP_DIR}/VERSION.txt`] = encoder.encode(
    generateVersionInfo(genomeCount),
  );

  // Create ZIP archive
  console.info("\nCreating ZIP archive...");
  const zipped = zipSync(zipEntries, {
    level: 9, // Maximum compression
  });

  // Write ZIP file using Bun.write()
  await Bun.write(OUTPUT_ZIP, zipped);

  // Report results
  const zipSize = formatSize(zipped.byteLength);
  const paths = Object.keys(zipEntries);
  const pngCount = paths.filter((p) => p.endsWith(".png")).length;
  const hasCodonChart = paths.some((p) => p.endsWith("codon-chart.svg"));
  const hasReadme = paths.some((p) => p.endsWith("README.md"));

  console.info(`\nCreated ${OUTPUT_ZIP} (${zipSize})`);
  console.info("Contents:");
  console.info(`   - ${genomeCount} example .genome files`);
  if (pngCount > 0) {
    console.info(`   - ${pngCount} screenshot images`);
  }
  if (hasReadme) {
    console.info("   - README.md (usage guide)");
  }
  if (hasCodonChart) {
    console.info("   - codon-chart.svg (reference poster)");
  }
  console.info("   - QUICK_START.txt (beginner guide)");
  console.info("   - VERSION.txt (distribution info)");
  console.info("");
  console.info("Ready for distribution!");
  console.info("   Classroom: Upload to LMS or share via Google Drive");
  console.info("   Web: Host on codoncanvas.org/downloads/");
}

// Run main function
await main();
