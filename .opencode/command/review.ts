#!/usr/bin/env bun

import { relative } from "node:path";
import { $ } from "bun";

// Typed scopes for compile-time safety
const SCOPES = [
  "all",
  "staged",
  "unstaged",
  "commit",
  "committed",
  "branch",
  "pr",
] as const;
type Scope = (typeof SCOPES)[number];

const [scopeArg = "all", ref] = Bun.argv.slice(2);
const output: string[] = [];

const git = async (header: string, ...args: string[]): Promise<void> => {
  const proc = Bun.spawn(["git", "--no-pager", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const [text, err, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (exitCode !== 0) {
    output.push(`${header}\n[git exit ${exitCode}]\n${err.trim()}`);
    return;
  }
  if (text) {
    output.push(header, text);
  }
};

const getBaseBranch = async (): Promise<string> => {
  // Try symbolic-ref first (works when origin/HEAD is set)
  const result = await $`git symbolic-ref refs/remotes/origin/HEAD`
    .nothrow()
    .quiet();
  const text = result.text().trim();
  if (result.exitCode === 0 && text) {
    return text.replace("refs/remotes/origin/", "");
  }

  // Fallback: probe origin/main, then origin/master (common in shallow clones)
  const mainCheck = await $`git rev-parse --verify origin/main`
    .nothrow()
    .quiet();
  if (mainCheck.exitCode === 0) {
    return "main";
  }

  const masterCheck = await $`git rev-parse --verify origin/master`
    .nothrow()
    .quiet();
  if (masterCheck.exitCode === 0) {
    return "master";
  }

  // Ultimate fallback (neither exists)
  return "main";
};

const validateRef = async (r: string): Promise<void> => {
  const result = await $`git rev-parse --verify ${r}`.nothrow().quiet();
  if (result.exitCode !== 0) {
    console.error(`Invalid ref: ${r}`);
    process.exit(1);
  }
};

const showCommit = async (): Promise<void> => {
  const commitRef = ref ?? "HEAD";
  await validateRef(commitRef);
  await git(`=== COMMIT: ${commitRef} ===`, "show", commitRef);
};

const isValidScope = (s: string): s is Scope => SCOPES.includes(s as Scope);

const relativePath = relative(process.cwd(), import.meta.path);

const HELP = `Usage: bun diff [scope] [ref]
Usage: [bun --bun] ./${relativePath} [scope] [ref]

Options:
  scope      Scope of changes (default: all)
  ref        Reference (for scope-specific commands)

Scopes:
  all, staged, unstaged      # No ref needed
  commit (or committed)      # Optional ref (default: HEAD)
  branch, pr                 # Optional ref (default: base branch)

Examples:
  bun diff                   # all uncommitted changes
  bun diff staged            # staged changes only
  bun diff commit abc123     # show specific commit
  bun diff pr                # full PR review (commits + diff vs base)
`;

if (scopeArg === "--help" || scopeArg === "-h") {
  console.info(HELP);
  process.exit(0);
}

if (!isValidScope(scopeArg)) {
  console.error(`Unknown scope: ${scopeArg}\n`);
  console.info(HELP);
  process.exit(1);
}

const scope: Scope = scopeArg;
const base = await getBaseBranch();

const commands: Record<Scope, () => Promise<void>> = {
  staged: () => git("=== STAGED CHANGES ===", "diff", "--cached"),
  unstaged: () => git("=== UNSTAGED CHANGES ===", "diff"),
  commit: showCommit,
  committed: showCommit,
  branch: async () => {
    const baseRef = ref ?? base;
    await git(
      `=== BRANCH vs ${baseRef.toUpperCase()} ===\n--- Commits ---`,
      "log",
      "--oneline",
      `${baseRef}..HEAD`,
    );
    await git(
      "--- Changed Files ---",
      "diff",
      "--name-status",
      `${baseRef}...HEAD`,
    );
    await git("--- Diff ---", "diff", `${baseRef}...HEAD`);
  },
  pr: async () => {
    const baseRef = ref ?? base;
    await git(
      "=== PR REVIEW ===\n--- Commits ---",
      "log",
      "--oneline",
      `${baseRef}..HEAD`,
    );
    await git("--- Stats ---", "diff", "--stat", `${baseRef}...HEAD`);
    await git(
      "--- Changed Files ---",
      "diff",
      "--name-status",
      `${baseRef}...HEAD`,
    );
    await git("--- Full Diff ---", "diff", `${baseRef}...HEAD`);
  },
  all: () => git("=== ALL UNCOMMITTED CHANGES ===", "diff", "HEAD"),
};

await commands[scope]();
console.info(output.join("\n"));
