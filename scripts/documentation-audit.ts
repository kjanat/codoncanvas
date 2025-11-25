#!/usr/bin/env tsx
/**
 * Documentation Audit Script - Session 91
 * Comprehensive validation of documentation consistency
 */

import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

interface AuditResult {
  category: string;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: string;
}

const results: AuditResult[] = [];

function audit(
  category: string,
  status: "pass" | "warn" | "fail",
  message: string,
  details?: string,
) {
  results.push({ category, status, message, details });
}

// Check 1: Verify all HTML demo files exist
function checkDemoFiles() {
  const demoFiles = [
    "index.html",
    "tutorial.html",
    "gallery.html",
    "demos.html",
    "mutation-demo.html",
    "timeline-demo.html",
    "evolution-demo.html",
    "population-genetics-demo.html",
    "genetic-algorithm-demo.html",
    "learning-paths.html",
    "teacher-dashboard.html",
    "research-dashboard.html",
    "achievements-demo.html",
    "assessment-demo.html",
  ];

  demoFiles.forEach((file) => {
    if (existsSync(file)) {
      const size = statSync(file).size;
      audit(
        "Demo Files",
        "pass",
        `${file} exists`,
        `${(size / 1024).toFixed(1)} KB`,
      );
    } else {
      audit("Demo Files", "fail", `${file} MISSING`);
    }
  });
}

// Check 2: Verify screenshot files
function checkScreenshots() {
  const screenshots = [
    "screenshot_playground.png",
    "screenshot_mutations.png",
    "screenshot_timeline.png",
  ];

  screenshots.forEach((file) => {
    if (existsSync(file)) {
      const size = statSync(file).size;
      audit(
        "Screenshots",
        "pass",
        `${file} exists`,
        `${(size / 1024).toFixed(1)} KB`,
      );
    } else {
      audit("Screenshots", "fail", `${file} MISSING`);
    }
  });
}

// Check 3: Count test files and assertions
function checkTests() {
  try {
    const testFiles = readdirSync("src").filter((f) => f.endsWith(".test.ts"));
    const testCount = testFiles.length;

    let totalTests = 0;
    testFiles.forEach((file) => {
      const content = readFileSync(join("src", file), "utf-8");
      const testMatches = content.match(/test\(/g) || [];
      totalTests += testMatches.length;
    });

    audit(
      "Tests",
      "pass",
      `${testCount} test files found`,
      `${totalTests} test cases`,
    );

    // Check README claim
    const readme = readFileSync("README.md", "utf-8");
    const claimMatch = readme.match(/(\d+) tests/);
    if (claimMatch) {
      const claimed = parseInt(claimMatch[1]);
      if (claimed === totalTests) {
        audit(
          "Tests",
          "pass",
          "Test count matches README claim",
          `${totalTests} tests`,
        );
      } else {
        audit(
          "Tests",
          "warn",
          `Test count mismatch: README claims ${claimed}, actual ${totalTests}`,
        );
      }
    }
  } catch (err) {
    audit("Tests", "fail", "Error counting tests", String(err));
  }
}

// Check 4: Verify documentation files exist
function checkDocFiles() {
  const docFiles = [
    "README.md",
    "EDUCATORS.md",
    "CHANGELOG.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "DEPLOYMENT.md",
    "LESSON_PLANS.md",
    "STUDENT_HANDOUTS.md",
    "ASSESSMENTS.md",
    "ASSESSMENT_SYSTEM.md",
    "GAMIFICATION_GUIDE.md",
    "PILOT_PROGRAM_GUIDE.md",
    "ACADEMIC_RESEARCH_PACKAGE.md",
    "RESEARCH_FOUNDATION.md",
    "RESEARCH_METRICS.md",
    "OPCODES.md",
    "CLI.md",
    "AUDIO_MODE.md",
    "PERFORMANCE.md",
    "PRODUCTION_READINESS_AUDIT.md",
    "CODE_QUALITY_AUDIT.md",
  ];

  docFiles.forEach((file) => {
    if (existsSync(file)) {
      const size = statSync(file).size;
      audit(
        "Documentation",
        "pass",
        `${file} exists`,
        `${(size / 1024).toFixed(1)} KB`,
      );
    } else {
      audit("Documentation", "warn", `${file} not found`);
    }
  });
}

// Check 5: Scan for broken internal links
function checkInternalLinks() {
  const docFiles = readdirSync(".").filter((f) => f.endsWith(".md"));

  docFiles.forEach((docFile) => {
    const content = readFileSync(docFile, "utf-8");

    // Match markdown links: [text](path)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      const linkPath = match[2];

      // Skip external URLs
      if (linkPath.startsWith("http://") || linkPath.startsWith("https://")) {
        continue;
      }

      // Skip anchors
      if (linkPath.startsWith("#")) {
        continue;
      }

      // Extract file path (remove anchors)
      const filePath = linkPath.split("#")[0];

      if (filePath && !existsSync(filePath)) {
        audit(
          "Links",
          "fail",
          `Broken link in ${docFile}`,
          `${linkText} → ${filePath}`,
        );
      }
    }
  });
}

// Check 6: Verify package.json metadata
function checkPackageJson() {
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf-8"));

    audit("Package", "pass", `Version: ${pkg.version}`);
    audit("Package", "pass", `Name: ${pkg.name}`);
    audit(
      "Package",
      "pass",
      `Scripts: ${Object.keys(pkg.scripts).length} commands`,
    );

    // Check if CLI is configured
    if (pkg.bin) {
      audit(
        "Package",
        "pass",
        "CLI binary configured",
        JSON.stringify(pkg.bin),
      );
    }
  } catch (err) {
    audit("Package", "fail", "Error reading package.json", String(err));
  }
}

// Check 7: Verify critical source files
function checkSourceFiles() {
  const criticalFiles = [
    "src/lexer.ts",
    "src/vm.ts",
    "src/renderer.ts",
    "src/playground.ts",
    "src/mutations.ts",
    "src/diff-viewer.ts",
    "src/timeline-scrubber.ts",
    "src/examples.ts",
    "src/types.ts",
  ];

  criticalFiles.forEach((file) => {
    if (existsSync(file)) {
      const size = statSync(file).size;
      audit(
        "Source",
        "pass",
        `${file} exists`,
        `${(size / 1024).toFixed(1)} KB`,
      );
    } else {
      audit("Source", "fail", `${file} MISSING`);
    }
  });
}

// Run all checks
console.log("🔍 CodonCanvas Documentation Audit\n");

checkDemoFiles();
checkScreenshots();
checkTests();
checkDocFiles();
checkInternalLinks();
checkPackageJson();
checkSourceFiles();

// Generate report
console.log("\n📊 Audit Results:\n");

const categories = [...new Set(results.map((r) => r.category))];
categories.forEach((category) => {
  const categoryResults = results.filter((r) => r.category === category);
  const passed = categoryResults.filter((r) => r.status === "pass").length;
  const warned = categoryResults.filter((r) => r.status === "warn").length;
  const failed = categoryResults.filter((r) => r.status === "fail").length;

  console.log(`\n${category}:`);
  console.log(`  ✅ Pass: ${passed}`);
  if (warned > 0) console.log(`  ⚠️  Warn: ${warned}`);
  if (failed > 0) console.log(`  ❌ Fail: ${failed}`);

  // Show failures and warnings
  categoryResults.forEach((r) => {
    if (r.status === "fail") {
      console.log(`    ❌ ${r.message}${r.details ? ` (${r.details})` : ""}`);
    } else if (r.status === "warn") {
      console.log(`    ⚠️  ${r.message}${r.details ? ` (${r.details})` : ""}`);
    }
  });
});

// Summary
const totalPassed = results.filter((r) => r.status === "pass").length;
const totalWarned = results.filter((r) => r.status === "warn").length;
const totalFailed = results.filter((r) => r.status === "fail").length;
const total = results.length;

console.log(`\n\n📈 Overall: ${totalPassed}/${total} passed`);
if (totalWarned > 0) console.log(`⚠️  ${totalWarned} warnings`);
if (totalFailed > 0) console.log(`❌ ${totalFailed} failures`);

console.log("\n✅ Audit complete!\n");
