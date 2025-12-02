#!/usr/bin/env bun
/**
 * Genome Validator - Validates .genome files for correctness
 *
 * Checks:
 *   - START (ATG) at beginning
 *   - STOP (TAA/TAG/TGA) at end
 *   - Balanced SAVE/RESTORE (TCA/TCC vs TCG/TCT)
 *   - Valid codon sequences (only A, C, G, T)
 *
 * Usage:
 *   bun tools/genome-validator.ts <file.genome>
 *   bun tools/genome-validator.ts --all
 */

const VALID_BASES = new Set(["A", "C", "G", "T"]);
const START_CODON = "ATG";
const STOP_CODONS = new Set(["TAA", "TAG", "TGA"]);
const SAVE_CODONS = new Set(["TCA", "TCC"]);
const RESTORE_CODONS = new Set(["TCG", "TCT"]);

interface ValidationIssue {
  line: number;
  column?: number;
  severity: "error" | "warning";
  message: string;
}

interface ValidationResult {
  file: string;
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    codons: number;
    lines: number;
    saveCount: number;
    restoreCount: number;
  };
}

interface CodonInfo {
  codon: string;
  line: number;
  col: number;
}

function extractCodons(source: string): CodonInfo[] {
  const codons: CodonInfo[] = [];
  const lines = source.split("\n");

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    let line = lines[lineNum];
    const commentIdx = line.indexOf(";");
    if (commentIdx !== -1) {
      line = line.slice(0, commentIdx);
    }

    const codonRegex = /[ACGTacgt]{3}/g;
    let match: RegExpExecArray | null = codonRegex.exec(line);
    while (match !== null) {
      codons.push({
        codon: match[0].toUpperCase(),
        line: lineNum + 1,
        col: match.index + 1,
      });
      match = codonRegex.exec(line);
    }
  }

  return codons;
}

function checkStartCodon(codons: CodonInfo[], issues: ValidationIssue[]): void {
  if (codons[0].codon !== START_CODON) {
    issues.push({
      line: codons[0].line,
      column: codons[0].col,
      severity: "error",
      message: `Program must start with ATG (found ${codons[0].codon})`,
    });
  }
}

function checkStopCodon(codons: CodonInfo[], issues: ValidationIssue[]): void {
  const lastCodon = codons[codons.length - 1];
  if (!STOP_CODONS.has(lastCodon.codon)) {
    issues.push({
      line: lastCodon.line,
      column: lastCodon.col,
      severity: "error",
      message: `Program must end with TAA, TAG, or TGA (found ${lastCodon.codon})`,
    });
  }
}

function checkCodonCharacters(
  codon: string,
  line: number,
  col: number,
  issues: ValidationIssue[],
): void {
  for (const char of codon) {
    if (!VALID_BASES.has(char)) {
      issues.push({
        line,
        column: col,
        severity: "error",
        message: `Invalid character in codon: ${codon}`,
      });
    }
  }
}

function trackSaveRestore(
  codon: string,
  line: number,
  col: number,
  saveCount: number,
  restoreCount: number,
  issues: ValidationIssue[],
): { saveCount: number; restoreCount: number } {
  if (SAVE_CODONS.has(codon)) {
    return { saveCount: saveCount + 1, restoreCount };
  }
  if (RESTORE_CODONS.has(codon)) {
    const newRestoreCount = restoreCount + 1;
    if (newRestoreCount > saveCount) {
      issues.push({
        line,
        column: col,
        severity: "error",
        message: "RESTORE without matching SAVE",
      });
    }
    return { saveCount, restoreCount: newRestoreCount };
  }
  return { saveCount, restoreCount };
}

function validateGenome(source: string, filename: string): ValidationResult {
  const issues: ValidationIssue[] = [];
  const codons = extractCodons(source);
  const lineCount = source.split("\n").length;

  if (codons.length === 0) {
    issues.push({
      line: 1,
      severity: "error",
      message: "No codons found in file",
    });
    return {
      file: filename,
      valid: false,
      issues,
      stats: { codons: 0, lines: lineCount, saveCount: 0, restoreCount: 0 },
    };
  }

  checkStartCodon(codons, issues);
  checkStopCodon(codons, issues);

  let saveCount = 0;
  let restoreCount = 0;

  for (const { codon, line, col } of codons) {
    checkCodonCharacters(codon, line, col, issues);
    const counts = trackSaveRestore(
      codon,
      line,
      col,
      saveCount,
      restoreCount,
      issues,
    );
    saveCount = counts.saveCount;
    restoreCount = counts.restoreCount;
  }

  if (saveCount !== restoreCount) {
    const lastCodon = codons[codons.length - 1];
    issues.push({
      line: lastCodon.line,
      severity: "warning",
      message: `Unbalanced SAVE/RESTORE: ${saveCount} saves, ${restoreCount} restores`,
    });
  }

  return {
    file: filename,
    valid: issues.filter((i) => i.severity === "error").length === 0,
    issues,
    stats: { codons: codons.length, lines: lineCount, saveCount, restoreCount },
  };
}

function printResult(result: ValidationResult): void {
  const status = result.valid
    ? "\x1b[32mVALID\x1b[0m"
    : "\x1b[31mINVALID\x1b[0m";
  console.info(`\n${result.file}: ${status}`);
  console.info(
    `  Codons: ${result.stats.codons}, Lines: ${result.stats.lines}`,
  );
  console.info(
    `  SAVE/RESTORE: ${result.stats.saveCount}/${result.stats.restoreCount}`,
  );

  if (result.issues.length > 0) {
    console.info("  Issues:");
    for (const issue of result.issues) {
      const prefix =
        issue.severity === "error"
          ? "\x1b[31mERROR\x1b[0m"
          : "\x1b[33mWARN\x1b[0m";
      const loc = issue.column
        ? `${issue.line}:${issue.column}`
        : `${issue.line}`;
      console.info(`    ${prefix} [${loc}]: ${issue.message}`);
    }
  }
}

async function validateFile(filepath: string): Promise<ValidationResult> {
  const file = Bun.file(filepath);
  const source = await file.text();
  const filename = filepath.split("/").pop() ?? filepath;
  return validateGenome(source, filename);
}

async function validateAllExamples(): Promise<void> {
  const glob = new Bun.Glob("*.genome");
  const results: ValidationResult[] = [];

  for await (const file of glob.scan({ cwd: "examples", onlyFiles: true })) {
    const result = await validateFile(`examples/${file}`);
    results.push(result);
    printResult(result);
  }

  const valid = results.filter((r) => r.valid).length;
  const invalid = results.length - valid;
  const warnings = results.reduce(
    (sum, r) => sum + r.issues.filter((i) => i.severity === "warning").length,
    0,
  );

  console.info(`\n${"=".repeat(50)}`);
  console.info(
    `Summary: ${valid} valid, ${invalid} invalid, ${warnings} warnings`,
  );
}

function printUsage(): void {
  console.info(`Genome Validator - Validate .genome files

Usage:
  bun tools/genome-validator.ts <file.genome>
  bun tools/genome-validator.ts --all

Options:
  --all    Validate all .genome files in examples/

Checks performed:
  - START codon (ATG) at beginning
  - STOP codon (TAA/TAG/TGA) at end
  - Balanced SAVE/RESTORE operations
  - Valid codon characters (A, C, G, T only)`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    printUsage();
    process.exit(1);
  }

  if (args[0] === "--all") {
    await validateAllExamples();
  } else {
    const result = await validateFile(args[0]);
    printResult(result);
    process.exit(result.valid ? 0 : 1);
  }
}

if (import.meta.main) {
  main();
}

export { validateGenome, type ValidationResult, type ValidationIssue };
