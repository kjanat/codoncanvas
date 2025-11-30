#!/usr/bin/env bun
/**
 * Audit genome file comments for accuracy.
 * Compares commented values against actual codon-decoded values.
 *
 * Usage: bun scripts/audit-genome-comments.ts
 */

import { decodeCodonValue, encodeCodonValue } from "@/types/genetics";

// ============ Types ============

interface ParsedLine {
  lineNumber: number;
  codons: string[];
  comment: string | null;
  raw: string;
}

interface Discrepancy {
  file: string;
  lineNumber: number;
  codon: string;
  commentedValue: number;
  actualValue: number;
  suggestedCodon: string;
}

// ============ Opcode Detection ============

/** Check if a codon is a PUSH opcode (GA*) */
function isPush(codon: string): boolean {
  return codon.startsWith("GA");
}

// ============ Comment Parsing ============

/** Comment patterns to extract numeric values */
const COMMENT_PATTERNS = [
  // Color(r, g, b) pattern
  /Color\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/gi,
  // Ellipse/Rect WxH pattern
  /(?:Ellipse|Rect)\s+(\d+)\s*[x×]\s*(\d+)/gi,
  // Generic (x, y) pairs
  /\(\s*(\d+)\s*,\s*(\d+)\s*\)/g,
  // Operation followed by number: "Rotate 30", "Circle 21", "PUSH 37"
  /(?:Rotate|Circle|Line|Scale|Translate|PUSH|Push|push)\s+(\d+)/gi,
  // Standalone numbers that look like values (not line refs)
  /\b(\d{1,2})\b(?!\s*(?:degrees|deg|px|%|x\d))/g,
];

/** Extract matches from a single pattern */
function extractFromPattern(pattern: RegExp, comment: string): number[] {
  const values: number[] = [];
  pattern.lastIndex = 0;
  let match: RegExpExecArray | null = pattern.exec(comment);
  while (match !== null) {
    for (let i = 1; i < match.length; i++) {
      if (match[i] !== undefined) {
        const num = parseInt(match[i], 10);
        if (num >= 0 && num <= 63) {
          values.push(num);
        }
      }
    }
    match = pattern.exec(comment);
  }
  return values;
}

/**
 * Extract numeric values from a comment string.
 * Matches patterns like:
 * - "Rotate 30" -> [30]
 * - "Color(63, 53, 37)" -> [63, 53, 37]
 * - "Circle 21" -> [21]
 * - "Ellipse 53x21" -> [53, 21]
 * - "PUSH 37, draw line" -> [37]
 */
function extractCommentValues(comment: string): number[] {
  const allValues: number[] = [];

  for (const pattern of COMMENT_PATTERNS) {
    const matches = extractFromPattern(pattern, comment);
    for (const val of matches) {
      if (!allValues.includes(val)) {
        allValues.push(val);
      }
    }
  }

  return allValues;
}

// ============ File Parsing ============

/** Parse a genome file into structured lines */
function parseGenomeFile(content: string): ParsedLine[] {
  const lines = content.split("\n");
  const parsed: ParsedLine[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const commentIndex = line.indexOf(";");

    let codons: string[] = [];
    let comment: string | null = null;

    if (commentIndex >= 0) {
      comment = line.slice(commentIndex + 1).trim();
      const codesPart = line.slice(0, commentIndex).trim();
      codons = codesPart.split(/\s+/).filter((c) => /^[ACGT]{3}$/i.test(c));
    } else {
      codons = line
        .trim()
        .split(/\s+/)
        .filter((c) => /^[ACGT]{3}$/i.test(c));
    }

    parsed.push({
      lineNumber: i + 1,
      codons: codons.map((c) => c.toUpperCase()),
      comment,
      raw: line,
    });
  }

  return parsed;
}

// ============ Analysis ============

/** Find numeric literal codons (codons following PUSH) */
function findNumericLiterals(
  codons: string[],
): Array<{ index: number; codon: string; value: number }> {
  const literals: Array<{ index: number; codon: string; value: number }> = [];

  for (let i = 0; i < codons.length - 1; i++) {
    if (isPush(codons[i])) {
      const literalCodon = codons[i + 1];
      literals.push({
        index: i + 1,
        codon: literalCodon,
        value: decodeCodonValue(literalCodon),
      });
    }
  }

  return literals;
}

/** Analyze a line for discrepancies */
function analyzeLine(file: string, line: ParsedLine): Discrepancy[] {
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
    const lines = parseGenomeFile(content);

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
