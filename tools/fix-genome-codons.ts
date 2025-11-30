#!/usr/bin/env bun
/**
 * Auto-fix genome files by updating codons to match comment-intended values.
 * Uses the same parsing logic as audit-genome-comments.ts.
 *
 * Usage: bun tools/fix-genome-codons.ts [--dry-run]
 */

import { encodeCodonValue } from "@/types/genetics";
import {
  extractCommentValues,
  findNumericLiterals,
  type GenomeLine,
  parseGenomeLines,
} from "@/utils";

// ============ Types ============

interface Fix {
  lineNumber: number;
  oldCodon: string;
  newCodon: string;
  codonIndex: number;
}

// ============ Analysis ============

/** Find fixes needed for a line */
function findLineFixes(line: GenomeLine): Fix[] {
  const fixes: Fix[] = [];

  if (!line.comment || line.codons.length === 0) {
    return fixes;
  }

  const commentValues = extractCommentValues(line.comment);
  if (commentValues.length === 0) {
    return fixes;
  }

  const literals = findNumericLiterals(line.codons);
  if (literals.length === 0) {
    return fixes;
  }

  for (let i = 0; i < Math.min(commentValues.length, literals.length); i++) {
    const commented = commentValues[i];
    const literal = literals[i];

    if (commented !== literal.value) {
      fixes.push({
        lineNumber: line.lineNumber,
        oldCodon: literal.codon,
        newCodon: encodeCodonValue(commented),
        codonIndex: literal.index,
      });
    }
  }

  return fixes;
}

/** Apply fixes to file content */
function applyFixes(
  content: string,
  lines: GenomeLine[],
  fixes: Fix[],
): string {
  const rawLines = content.split("\n");

  // Group fixes by line number
  const fixesByLine = new Map<number, Fix[]>();
  for (const fix of fixes) {
    const existing = fixesByLine.get(fix.lineNumber) ?? [];
    existing.push(fix);
    fixesByLine.set(fix.lineNumber, existing);
  }

  for (const [lineNum, lineFixes] of fixesByLine) {
    const lineIdx = lineNum - 1;
    let rawLine = rawLines[lineIdx];
    const parsed = lines[lineIdx];

    for (const fix of lineFixes) {
      // Find which occurrence of oldCodon to replace
      let targetOccurrence = 0;
      for (let i = 0; i <= fix.codonIndex; i++) {
        if (parsed.codons[i] === fix.oldCodon) {
          targetOccurrence++;
        }
      }

      // Replace the specific occurrence
      let occurrence = 0;
      rawLine = rawLine.replace(new RegExp(fix.oldCodon, "gi"), (match) => {
        occurrence++;
        return occurrence === targetOccurrence ? fix.newCodon : match;
      });
    }

    rawLines[lineIdx] = rawLine;
  }

  return rawLines.join("\n");
}

// ============ Main ============

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");

  console.info(`Genome Codon Fix ${dryRun ? "(DRY RUN)" : ""}`);
  console.info(`${"=".repeat(60)}\n`);

  const glob = new Bun.Glob("*.genome");
  let totalFixes = 0;
  let filesModified = 0;

  for await (const file of glob.scan({ cwd: "examples", onlyFiles: true })) {
    const path = `examples/${file}`;
    const content = await Bun.file(path).text();
    const lines = parseGenomeLines(content);

    const fixes: Fix[] = [];
    for (const line of lines) {
      fixes.push(...findLineFixes(line));
    }

    if (fixes.length > 0) {
      filesModified++;
      totalFixes += fixes.length;

      if (dryRun) {
        console.info(`Would fix ${fixes.length} codons in ${file}`);
        for (const fix of fixes) {
          console.info(
            `  Line ${fix.lineNumber}: ${fix.oldCodon} -> ${fix.newCodon}`,
          );
        }
      } else {
        const newContent = applyFixes(content, lines, fixes);
        await Bun.write(path, newContent);
        console.info(`Fixed ${fixes.length} codons in ${file}`);
      }
    }
  }

  console.info(
    `\n${dryRun ? "Would fix" : "Fixed"} ${totalFixes} codons in ${filesModified} files`,
  );
}

await main();
