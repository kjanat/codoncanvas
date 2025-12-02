#!/usr/bin/env bun

import { relative } from "node:path";
import { $ } from "bun";

const [scope = "all", ref] = Bun.argv.slice(2);
const output: string[] = [];

const git = async (header: string, ...args: string[]) => {
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

const getBaseBranch = async () => {
  const result = await $`git symbolic-ref refs/remotes/origin/HEAD`
    .nothrow()
    .quiet();
  return result.text().trim().replace("refs/remotes/origin/", "") || "master";
};

const validateRef = async (r: string) => {
  const result = await $`git rev-parse --verify ${r}`.nothrow().quiet();
  if (result.exitCode !== 0) {
    console.error(`Invalid ref: ${r}`);
    process.exit(1);
  }
};

const fileName = import.meta.file;
const relativePath = relative(process.cwd(), import.meta.path);

const HELP = `Usage: bun diff [scope] [ref]
Usage: [bun --bun] ./${relativePath} [scope] [ref]

Options:
  scope      Scope of changes (default: all)
  ref        Reference (for scope-specific commands)

Scopes:
  all, staged, unstaged    # No ref needed
  commit, branch, pr       # Optional ref parameter

Examples:
  ${fileName}                  # all uncommitted changes
  ${fileName} staged           # staged changes only
  ${fileName} commit abc123    # show specific commit
  ${fileName} pr               # full PR review
`;

if (scope === "--help" || scope === "-h") {
  console.info(HELP);
  process.exit(0);
}

const base = await getBaseBranch();

const commands: Record<string, () => Promise<void>> = {
  staged: () => git("=== STAGED CHANGES ===", "diff", "--cached"),
  unstaged: () => git("=== UNSTAGED CHANGES ===", "diff"),
  commit: async () => {
    const commitRef = ref ?? "HEAD";
    await validateRef(commitRef);
    await git(`=== COMMIT: ${commitRef} ===`, "show", commitRef);
  },
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

commands.committed = commands.commit;

if (!(scope in commands)) {
  console.error(`Unknown scope: ${scope}\n`);
  console.info(HELP);
  process.exit(1);
}

await commands[scope]();
console.info(output.join("\n"));
