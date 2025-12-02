#!/usr/bin/env bun
/**
 * Coverage Import Check - Identifies source files not imported by tests
 *
 * Analyzes test files to determine which source files are actually imported
 * (directly or transitively). Files not imported won't appear in coverage reports.
 *
 * Usage:
 *   bun tools/coverage-check.ts           # Console report
 *   bun tools/coverage-check.ts --json    # JSON output
 *   bun tools/coverage-check.ts --verbose # Include imported files list
 */

import { dirname, relative, resolve } from "node:path";

// ============ Types ============

interface ImportCheckResult {
  testFiles: number;
  sourceFiles: number;
  imported: string[];
  notImported: string[];
  coverage: number;
}

interface PathAlias {
  pattern: RegExp;
  replacement: string;
}

// ============ Constants ============

const PROJECT_ROOT = resolve(import.meta.dir, "..");
const SRC_DIR = resolve(PROJECT_ROOT, "src");
const TESTS_DIR = resolve(PROJECT_ROOT, "tests");

// Path aliases from tsconfig.json
const PATH_ALIASES: PathAlias[] = [
  // Specific module aliases (must come before generic @/*)
  { pattern: /^@\/core($|\/)/, replacement: "src/core$1" },
  { pattern: /^@\/genetics($|\/)/, replacement: "src/genetics$1" },
  { pattern: /^@\/analysis($|\/)/, replacement: "src/analysis$1" },
  { pattern: /^@\/education($|\/)/, replacement: "src/education$1" },
  { pattern: /^@\/exporters($|\/)/, replacement: "src/exporters$1" },
  { pattern: /^@\/ui($|\/)/, replacement: "src/ui$1" },
  { pattern: /^@\/demos($|\/)/, replacement: "src/demos$1" },
  { pattern: /^@\/data($|\/)/, replacement: "src/data$1" },
  { pattern: /^@\/types($|\/)/, replacement: "src/types$1" },
  { pattern: /^@\/utils($|\/)/, replacement: "src/utils$1" },
  { pattern: /^@\/playground($|\/)/, replacement: "src/playground$1" },
  { pattern: /^@\/pages($|\/)/, replacement: "src/pages$1" },
  { pattern: /^@\/components($|\/)/, replacement: "src/components$1" },
  { pattern: /^@\/hooks($|\/)/, replacement: "src/hooks$1" },
  { pattern: /^@\/tests($|\/)/, replacement: "tests$1" },
  { pattern: /^@\/tools($|\/)/, replacement: "tools$1" },
  { pattern: /^@\/scripts($|\/)/, replacement: "scripts$1" },
  // Generic aliases (must come last)
  { pattern: /^@\/(.*)/, replacement: "src/$1" },
  { pattern: /^~\/(.*)/, replacement: "$1" },
];

// ============ Path Resolution ============

/** Resolve a path alias to a relative path from project root */
function resolveAlias(importPath: string): string | null {
  for (const alias of PATH_ALIASES) {
    if (alias.pattern.test(importPath)) {
      return importPath.replace(alias.pattern, alias.replacement);
    }
  }
  return null;
}

/** Resolve an import path to an absolute file path */
function resolveImportPath(
  importPath: string,
  fromFile: string,
): string | null {
  // Skip external packages
  if (
    !importPath.startsWith(".") &&
    !importPath.startsWith("@/") &&
    !importPath.startsWith("~/")
  ) {
    return null;
  }

  let resolved: string;

  // Handle path aliases
  const aliasResolved = resolveAlias(importPath);
  if (aliasResolved) {
    resolved = resolve(PROJECT_ROOT, aliasResolved);
  } else {
    // Relative import
    resolved = resolve(dirname(fromFile), importPath);
  }

  return resolved;
}

/** Try to find the actual file (handle missing extensions, index files) */
async function findActualFile(basePath: string): Promise<string | null> {
  const extensions = [".ts", ".tsx", ".js", ".jsx"];

  // Direct file match
  for (const ext of extensions) {
    const withExt = basePath.endsWith(ext) ? basePath : `${basePath}${ext}`;
    if (await Bun.file(withExt).exists()) {
      return withExt;
    }
  }

  // Index file in directory
  for (const ext of extensions) {
    const indexPath = resolve(basePath, `index${ext}`);
    if (await Bun.file(indexPath).exists()) {
      return indexPath;
    }
  }

  return null;
}

// ============ Import Extraction ============

/** Extract all import paths from file content */
function extractImports(content: string): string[] {
  const imports: string[] = [];

  // Static imports: import X from "path" or import "path"
  const staticImportRegex =
    /import\s+(?:(?:type\s+)?(?:\{[^}]*\}|[^{}\s,]+|\*\s+as\s+\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+))?\s+from\s+)?["']([^"']+)["']/g;

  // Dynamic imports: import("path") or await import("path")
  const dynamicImportRegex = /import\s*\(\s*["']([^"']+)["']\s*\)/g;

  // Re-exports: export { X } from "path" or export * from "path"
  const reExportRegex = /export\s+(?:\{[^}]*\}|\*)\s+from\s+["']([^"']+)["']/g;

  let match: RegExpExecArray | null;

  match = staticImportRegex.exec(content);
  while (match !== null) {
    if (match[1]) imports.push(match[1]);
    match = staticImportRegex.exec(content);
  }

  match = dynamicImportRegex.exec(content);
  while (match !== null) {
    imports.push(match[1]);
    match = dynamicImportRegex.exec(content);
  }

  match = reExportRegex.exec(content);
  while (match !== null) {
    imports.push(match[1]);
    match = reExportRegex.exec(content);
  }

  return imports;
}

// ============ Import Collection ============

/** Recursively collect all imported files starting from a file */
async function collectImports(
  filePath: string,
  visited: Set<string>,
  sourceFiles: Set<string>,
): Promise<void> {
  // Normalize path for comparison
  const normalizedPath = resolve(filePath);

  // Skip if already visited
  if (visited.has(normalizedPath)) {
    return;
  }
  visited.add(normalizedPath);

  // Read file content
  const file = Bun.file(normalizedPath);
  if (!(await file.exists())) {
    return;
  }

  const content = await file.text();
  const imports = extractImports(content);

  // Process each import
  for (const importPath of imports) {
    const resolvedPath = resolveImportPath(importPath, normalizedPath);
    if (!resolvedPath) continue;

    const actualFile = await findActualFile(resolvedPath);
    if (!actualFile) continue;

    // Only track source files (not test files, node_modules, etc.)
    const relativePath = relative(PROJECT_ROOT, actualFile);
    if (relativePath.startsWith("src/")) {
      sourceFiles.add(relativePath);
    }

    // Recursively collect imports from this file
    await collectImports(actualFile, visited, sourceFiles);
  }
}

// ============ Main Analysis ============

async function analyzeImports(): Promise<ImportCheckResult> {
  // Collect all test files
  const testGlob = new Bun.Glob("**/*.test.{ts,tsx}");
  const testFiles: string[] = [];
  for await (const file of testGlob.scan({ cwd: TESTS_DIR, onlyFiles: true })) {
    testFiles.push(resolve(TESTS_DIR, file));
  }

  // Collect all source files
  const srcGlob = new Bun.Glob("**/*.{ts,tsx}");
  const allSourceFiles = new Set<string>();
  for await (const file of srcGlob.scan({ cwd: SRC_DIR, onlyFiles: true })) {
    allSourceFiles.add(`src/${file}`);
  }

  // Track visited files and imported source files
  const visited = new Set<string>();
  const importedSourceFiles = new Set<string>();

  // Process each test file
  for (const testFile of testFiles) {
    await collectImports(testFile, visited, importedSourceFiles);
  }

  // Calculate results
  const imported = [...importedSourceFiles].sort();
  const notImported = [...allSourceFiles]
    .filter((f) => !importedSourceFiles.has(f))
    .sort();

  const coverage =
    allSourceFiles.size > 0
      ? (importedSourceFiles.size / allSourceFiles.size) * 100
      : 0;

  return {
    testFiles: testFiles.length,
    sourceFiles: allSourceFiles.size,
    imported,
    notImported,
    coverage: Math.round(coverage * 10) / 10,
  };
}

// ============ Output ============

function printConsoleReport(result: ImportCheckResult, verbose: boolean): void {
  console.info("Coverage Import Check");
  console.info("=".repeat(50));
  console.info("");
  console.info(`Scanned ${result.testFiles} test files`);
  console.info(`Found ${result.sourceFiles} source files`);
  console.info("");
  console.info(
    `\x1b[32mImported by tests:\x1b[0m ${result.imported.length} files (${result.coverage}%)`,
  );
  console.info(
    `\x1b[33mNot imported:\x1b[0m ${result.notImported.length} files`,
  );

  if (verbose && result.imported.length > 0) {
    console.info("");
    console.info("\x1b[32mFiles imported by tests:\x1b[0m");
    for (const file of result.imported) {
      console.info(`  ${file}`);
    }
  }

  if (result.notImported.length > 0) {
    console.info("");
    console.info("\x1b[33mFiles not imported by any test:\x1b[0m");
    for (const file of result.notImported) {
      console.info(`  ${file}`);
    }
  }

  if (!verbose && result.imported.length > 0) {
    console.info("");
    console.info("Run with --verbose to see all imported files");
  }

  console.info("");
  console.info("=".repeat(50));
  console.info(
    `Summary: ${result.coverage}% of source files are imported by tests`,
  );
}

function printJsonReport(result: ImportCheckResult): void {
  console.info(JSON.stringify(result, null, 2));
}

function printUsage(): void {
  console.info(`Coverage Import Check - Identify files not imported by tests

Usage:
  bun tools/coverage-check.ts           # Console report
  bun tools/coverage-check.ts --json    # JSON output
  bun tools/coverage-check.ts --verbose # Include imported files list
  bun tools/coverage-check.ts --help    # Show this help

This tool analyzes which source files are imported (directly or transitively)
by test files. Files not imported won't appear in coverage reports.`);
}

// ============ CLI ============

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  const jsonOutput = args.includes("--json");
  const verbose = args.includes("--verbose") || args.includes("-v");

  const result = await analyzeImports();

  if (jsonOutput) {
    printJsonReport(result);
  } else {
    printConsoleReport(result, verbose);
  }
}

if (import.meta.main) {
  main();
}

export { analyzeImports, extractImports, resolveAlias, type ImportCheckResult };
