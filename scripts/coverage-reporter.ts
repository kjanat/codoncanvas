#!/usr/bin/env bun

import { spawn } from "bun";

const coverageData: Array<{
  file: string;
  funcCoverage: string;
  lineCoverage: string;
  uncoveredLines: string;
}> = [];

const proc = spawn({
  cmd: ["bun", "test:agent", "--coverage"],
  stdout: "pipe",
  stderr: "pipe",
});

// Collect all output from both streams (don't print to console)
let stdoutData = "";
let stderrData = "";
const decoder = new TextDecoder();

const stdoutReader = proc.stdout.getReader();
const stderrReader = proc.stderr.getReader();

// Read both streams in parallel
await Promise.all([
  (async () => {
    try {
      while (true) {
        const { done, value } = await stdoutReader.read();
        if (done) break;
        stdoutData += decoder.decode(value);
      }
    } finally {
      stdoutReader.releaseLock();
    }
  })(),
  (async () => {
    try {
      while (true) {
        const { done, value } = await stderrReader.read();
        if (done) break;
        stderrData += decoder.decode(value);
      }
    } finally {
      stderrReader.releaseLock();
    }
  })(),
]);

await proc.exited;

// Combine both outputs for parsing
const output = stdoutData + stderrData;
const lines = output.split("\n");

let captureMode = false;
const summary: Record<string, string> = {};

for (const line of lines) {
  // Capture overall coverage
  if (line.includes("All files") && line.includes("|")) {
    const match = line.match(/All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/);
    if (match) {
      summary.functions = `${match[1]} %`;
      summary.lines = `${match[2]} %`;
    }
  }

  // Capture test summary (each stat is on its own line)
  const passMatch = line.match(/^\s*(\d+)\s+pass\s*$/);
  if (passMatch) summary.pass = passMatch[1];

  const skipMatch = line.match(/^\s*(\d+)\s+skip\s*$/);
  if (skipMatch) summary.skip = skipMatch[1];

  const failMatch = line.match(/^\s*(\d+)\s+fail\s*$/);
  if (failMatch) summary.fail = failMatch[1];

  const expectMatch = line.match(/^\s*(\d+)\s+expect\(\)\s+calls\s*$/);
  if (expectMatch) summary.expect = expectMatch[1];

  // Capture files ran summary
  const ranMatch = line.match(
    /^Ran (\d+) tests across (\d+) files\. \[([\d.]+)s\]/,
  );
  if (ranMatch) {
    summary.tests = ranMatch[1];
    summary.files = ranMatch[2];
    summary.time = `${ranMatch[3]}s`;
  }

  // Detect start of coverage table
  if (
    line.includes("File") &&
    line.includes("% Funcs") &&
    line.includes("% Lines")
  ) {
    captureMode = true;
    continue;
  }

  // Detect end of coverage table
  if (captureMode && line.match(/^\s*\d+\s+pass/)) {
    captureMode = false;
    continue;
  }

  // Parse coverage lines
  if (captureMode && !line.includes("---") && !line.includes("All files")) {
    const match = line.match(
      /^\s*(.+?)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s*(.*)$/,
    );
    if (match) {
      const [, file, funcCoverage, lineCoverage, uncoveredLines] = match;
      if (file.trim() && !file.includes("File")) {
        coverageData.push({
          file: file.trim(),
          funcCoverage,
          lineCoverage,
          uncoveredLines: uncoveredLines.trim(),
        });
      }
    }
  }
}

if (coverageData.length === 0) {
  console.error("\n❌ ERROR: No coverage data captured!");
  process.exit(1);
}

for (const item of coverageData) {
  const parts = [`func:${item.funcCoverage}`];

  if (item.uncoveredLines) {
    parts.push(`lines:${item.lineCoverage} [${item.uncoveredLines}]`);
  } else {
    parts.push(`lines:${item.lineCoverage}`);
  }

  console.log(`${item.file} ${parts.join(",")}`);
}

// Report inline coverage
console.log();
console.log("summary:");
console.log(`  functions: ${summary.functions}`);
console.log(`  lines:     ${summary.lines}`);
console.log(`  pass:      ${summary.pass}`);
console.log(`  skip:      ${summary.skip}`);
console.log(`  fail:      ${summary.fail}`);
console.log(`  expect:    ${summary.expect}`);
console.log(`  tests:     ${summary.tests}`);
console.log(`  files:     ${summary.files}`);
console.log(`  time:      ${summary.time}`);

process.exit(proc.exitCode ?? 0);
