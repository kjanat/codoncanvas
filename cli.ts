#!/usr/bin/env bun

/**
 * CodonCanvas CLI Tool
 *
 * Command-line interface for validating, linting, and analyzing CodonCanvas genomes.
 * Useful for educators grading assignments, researchers automating data collection,
 * and developers integrating genome validation into CI/CD pipelines.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { CodonLexer } from "@/core/lexer";
import type { ParseError } from "@/types";

const program = new Command();

program
  .name("codoncanvas")
  .description("CLI tool for CodonCanvas genome validation and analysis")
  .version("1.0.0");

program
  .command("validate <file>")
  .description(
    "Validate a single .genome file for frame alignment and structure",
  )
  .option("-v, --verbose", "Show detailed validation output")
  .option("--json", "Output results as JSON")
  .action((file: string, options: { verbose?: boolean; json?: boolean }) => {
    try {
      const source = readFileSync(file, "utf-8");
      const lexer = new CodonLexer();

      // Validate frame and structure
      const frameErrors = lexer.validateFrame(source);
      const tokens = lexer.tokenize(source);
      const structureErrors = lexer.validateStructure(tokens);
      const allErrors = [...frameErrors, ...structureErrors];

      if (options.json) {
        console.log(
          JSON.stringify(
            {
              file,
              valid: allErrors.length === 0,
              errors: allErrors,
              stats: {
                codons: tokens.length,
                bases: source.replace(/\s+/g, "").replace(/;.*/g, "").length,
              },
            },
            null,
            2,
          ),
        );
      } else {
        if (allErrors.length === 0) {
          console.log(chalk.green(`✓ ${file} is valid`));
          if (options.verbose) {
            console.log(chalk.gray(`  Codons: ${tokens.length}`));
            console.log(
              chalk.gray(
                `  Bases: ${
                  source.replace(/\s+/g, "").replace(/;.*/g, "").length
                }`,
              ),
            );
          }
        } else {
          console.log(chalk.red(`✗ ${file} has ${allErrors.length} error(s):`));
          allErrors.forEach((err) => {
            const icon = err.severity === "error" ? "✗" : "⚠";
            const color = err.severity === "error" ? chalk.red : chalk.yellow;
            console.log(
              color(`  ${icon} ${err.message} (position ${err.position})`),
            );
            if (err.fix) {
              console.log(chalk.gray(`    Fix: ${err.fix}`));
            }
          });
        }
      }

      process.exit(
        allErrors.filter((e) => e.severity === "error").length > 0 ? 1 : 0,
      );
    } catch (error) {
      console.error(chalk.red(`Error reading file: ${error}`));
      process.exit(1);
    }
  });

program
  .command("lint <pattern>")
  .description(
    'Validate multiple .genome files (supports glob patterns like "examples/*.genome")',
  )
  .option(
    "--fix",
    "Automatically fix frame alignment issues (not implemented yet)",
  )
  .option("--json", "Output results as JSON")
  .action((pattern: string, options: { fix?: boolean; json?: boolean }) => {
    const files: string[] = [];

    // Simple glob expansion (supports *.genome in current directory or subdirectory)
    if (pattern.includes("*")) {
      const dir = pattern.split("*")[0] || ".";
      const ext = pattern.includes(".genome") ? ".genome" : "";

      try {
        const allFiles = readdirSync(dir);
        files.push(
          ...allFiles
            .filter((f) => (ext ? f.endsWith(ext) : true))
            .map((f) => join(dir, f))
            .filter((f) => statSync(f).isFile()),
        );
      } catch (error) {
        console.error(chalk.red(`Error reading directory: ${error}`));
        process.exit(1);
      }
    } else {
      files.push(pattern);
    }

    const results: Array<{
      file: string;
      valid: boolean;
      errors: ParseError[];
    }> = [];
    const lexer = new CodonLexer();

    for (const file of files) {
      try {
        const source = readFileSync(file, "utf-8");
        const frameErrors = lexer.validateFrame(source);
        const tokens = lexer.tokenize(source);
        const structureErrors = lexer.validateStructure(tokens);
        const allErrors = [...frameErrors, ...structureErrors];

        results.push({
          file,
          valid: allErrors.length === 0,
          errors: allErrors,
        });
      } catch (error) {
        results.push({
          file,
          valid: false,
          errors: [
            {
              message: `Failed to read: ${error}`,
              position: 0,
              severity: "error",
            },
          ],
        });
      }
    }

    const valid = results.filter((r) => r.valid).length;
    const invalid = results.filter((r) => !r.valid).length;

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            total: results.length,
            valid,
            invalid,
            results,
          },
          null,
          2,
        ),
      );
    } else {
      console.log(chalk.bold(`\nValidation Summary:`));
      console.log(chalk.green(`  ✓ Valid: ${valid}`));
      console.log(chalk.red(`  ✗ Invalid: ${invalid}`));
      console.log(chalk.gray(`  Total: ${results.length}\n`));

      results.forEach((result) => {
        if (result.valid) {
          console.log(chalk.green(`✓ ${result.file}`));
        } else {
          console.log(chalk.red(`✗ ${result.file}:`));
          result.errors.forEach((err) => {
            const color = err.severity === "error" ? chalk.red : chalk.yellow;
            console.log(color(`    ${err.message}`));
          });
        }
      });
    }

    process.exit(invalid > 0 ? 1 : 0);
  });

program
  .command("check-similarity <file1> <file2>")
  .description(
    "Check similarity between two genomes (useful for plagiarism detection)",
  )
  .option(
    "-t, --threshold <number>",
    "Similarity threshold (0-1, default: 0.8)",
    "0.8",
  )
  .action((file1: string, file2: string, options: { threshold: string }) => {
    try {
      const source1 = readFileSync(file1, "utf-8")
        .replace(/\s+/g, "")
        .replace(/;.*/g, "");
      const source2 = readFileSync(file2, "utf-8")
        .replace(/\s+/g, "")
        .replace(/;.*/g, "");

      // Levenshtein distance for edit similarity
      const distance = levenshteinDistance(source1, source2);
      const maxLen = Math.max(source1.length, source2.length);
      const similarity = maxLen > 0 ? 1 - distance / maxLen : 1;

      // Longest common substring
      const lcs = longestCommonSubstring(source1, source2);
      const lcsRatio = Math.max(
        lcs.length / source1.length,
        lcs.length / source2.length,
      );

      const threshold = parseFloat(options.threshold);
      const isSimilar = similarity >= threshold || lcsRatio >= threshold;

      console.log(chalk.bold("\nSimilarity Analysis:"));
      console.log(chalk.gray(`  File 1: ${file1} (${source1.length} bases)`));
      console.log(chalk.gray(`  File 2: ${file2} (${source2.length} bases)`));
      console.log();
      console.log(`  Edit similarity: ${(similarity * 100).toFixed(1)}%`);
      console.log(
        `  Longest common substring: ${lcs.length} bases (${(
          lcsRatio * 100
        ).toFixed(1)}%)`,
      );
      console.log(`  Threshold: ${(threshold * 100).toFixed(0)}%`);
      console.log();

      if (isSimilar) {
        console.log(chalk.yellow(`⚠ Files are SIMILAR (may indicate copying)`));
        if (lcs.length > 30) {
          console.log(
            chalk.gray(`  Common sequence: ${lcs.substring(0, 60)}...`),
          );
        }
      } else {
        console.log(
          chalk.green(`✓ Files are DIFFERENT (likely independent work)`),
        );
      }

      process.exit(isSimilar ? 1 : 0);
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

program
  .command("stats <file>")
  .description("Display statistics about a genome file")
  .action((file: string) => {
    try {
      const source = readFileSync(file, "utf-8");
      const lexer = new CodonLexer();
      const tokens = lexer.tokenize(source);

      // Count opcode usage
      const opcodeCounts: Record<string, number> = {};
      tokens.forEach((token) => {
        const firstBase = token.text[0];
        const family =
          firstBase === "A"
            ? "Stack/Control"
            : firstBase === "C"
              ? "Shapes/Utility"
              : firstBase === "G"
                ? "Shapes/Stack"
                : "Transform/Color";
        opcodeCounts[family] = (opcodeCounts[family] || 0) + 1;
      });

      // Calculate complexity metrics
      const bases = source.replace(/\s+/g, "").replace(/;.*/g, "");
      const lines = source
        .split("\n")
        .filter((l) => l.trim() && !l.trim().startsWith(";")).length;
      const comments = source
        .split("\n")
        .filter((l) => l.trim().startsWith(";")).length;

      console.log(chalk.bold(`\nGenome Statistics: ${file}`));
      console.log(chalk.gray("─".repeat(50)));
      console.log();
      console.log(chalk.bold("Size:"));
      console.log(`  Total bases: ${bases.length}`);
      console.log(`  Total codons: ${tokens.length}`);
      console.log(`  Lines of code: ${lines}`);
      console.log(`  Comment lines: ${comments}`);
      console.log();
      console.log(chalk.bold("Opcode Usage:"));
      Object.entries(opcodeCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([family, count]) => {
          console.log(
            `  ${family}: ${count} (${((count / tokens.length) * 100).toFixed(
              1,
            )}%)`,
          );
        });
      console.log();
      console.log(chalk.bold("Complexity:"));
      console.log(
        `  Avg codons per line: ${(tokens.length / lines).toFixed(1)}`,
      );
      console.log(
        `  Documentation ratio: ${(
          (comments / (lines + comments)) * 100
        ).toFixed(1)}%`,
      );
    } catch (error) {
      console.error(chalk.red(`Error: ${error}`));
      process.exit(1);
    }
  });

function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1, // substitution
        );
      }
    }
  }

  return dp[m][n];
}

function longestCommonSubstring(str1: string, str2: string): string {
  const m = str1.length;
  const n = str2.length;
  let maxLen = 0;
  let endIndex = 0;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        if (dp[i][j] > maxLen) {
          maxLen = dp[i][j];
          endIndex = i;
        }
      }
    }
  }

  return str1.substring(endIndex - maxLen, endIndex);
}

program.parse();
