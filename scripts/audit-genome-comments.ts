#!/usr/bin/env bun
/**
 * Audit genome file comments for accuracy.
 * Compares commented values against actual codon-decoded values.
 *
 * Usage: bun scripts/audit-genome-comments.ts
 */

import { encodeCodonValue } from "@/types/genetics";
import {
  extractCommentValues,
  findNumericLiterals,
  type GenomeLine,
  parseGenomeLines,
} from "@/utils";

// ============ Types ============

interface Discrepancy {
  file: string;
  lineNumber: number;
  codon: string;
  commentedValue: number;
  actualValue: number;
  suggestedCodon: string;
}

// ============ Analysis ============

/** Analyze a line for discrepancies */
function analyzeLine(file: string, line: GenomeLine): Discrepancy[] {
  const discrepancies: Discrepancy[] = [];

  if (!line.comment || line.codons.length === 0) {
    return discrepancies;
  }

  const commentValues = extractCommentValues(line.comment);
  if (commentValues.length === 0) {
    return discrepancies;
  }

  const literals = findNumericLiterals(line.codons);
  if (literals.length === 0) {
    return discrepancies;
  }

  // Compare comment values with actual literal values
  // Try to match them up - assume they appear in order
  for (let i = 0; i < Math.min(commentValues.length, literals.length); i++) {
    const commented = commentValues[i];
    const literal = literals[i];

    if (commented !== literal.value) {
      discrepancies.push({
        file,
        lineNumber: line.lineNumber,
        codon: literal.codon,
        commentedValue: commented,
        actualValue: literal.value,
        suggestedCodon: encodeCodonValue(commented),
      });
    }
  }

  return discrepancies;
}

// ============ Main ============

async function main(): Promise<void> {
  console.info("Genome Comment Audit");
  console.info(`${"=".repeat(60)}\n`);

  const glob = new Bun.Glob("*.genome");
  const allDiscrepancies: Discrepancy[] = [];
  let filesScanned = 0;

  for await (const file of glob.scan({ cwd: "examples", onlyFiles: true })) {
    filesScanned++;
    const content = await Bun.file(`examples/${file}`).text();
    const lines = parseGenomeLines(content);

    for (const line of lines) {
      const issues = analyzeLine(file, line);
      allDiscrepancies.push(...issues);
    }
  }

  console.info(`Scanned ${filesScanned} genome files\n`);

  if (allDiscrepancies.length === 0) {
    console.info("No discrepancies found!");
    return;
  }

  console.info(`Found ${allDiscrepancies.length} discrepancies:\n`);

  // Group by file
  const byFile = new Map<string, Discrepancy[]>();
  for (const d of allDiscrepancies) {
    const existing = byFile.get(d.file);
    if (existing) {
      existing.push(d);
    } else {
      byFile.set(d.file, [d]);
    }
  }

  for (const [file, issues] of byFile) {
    console.info(`\n${file}:`);
    for (const issue of issues) {
      console.info(`  Line ${issue.lineNumber}:`);
      console.info(`    Codon ${issue.codon} decodes to ${issue.actualValue}`);
      console.info(`    Comment suggests value ${issue.commentedValue}`);
      console.info(
        `    Fix: Change codon to ${issue.suggestedCodon}, or update comment to ${issue.actualValue}`,
      );
    }
  }

  // Summary
  console.info(`\n${"=".repeat(60)}`);
  console.info("Summary:");
  console.info(`  Files with issues: ${byFile.size}`);
  console.info(`  Total discrepancies: ${allDiscrepancies.length}`);

  // Generate a quick-fix suggestion
  console.info("\nQuick reference - common values:");
  const commonValues = [10, 15, 20, 21, 25, 30, 37, 45, 50, 53, 60, 63];
  for (const v of commonValues) {
    console.info(`  ${v} = ${encodeCodonValue(v)}`);
  }
}

await main();
