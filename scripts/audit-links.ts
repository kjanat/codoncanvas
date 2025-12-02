#!/usr/bin/env node
/**
 * Documentation Link Audit Script
 * Validates internal links across all markdown documentation
 */

import * as fs from "node:fs";
import * as path from "node:path";

interface LinkRef {
  file: string;
  line: number;
  link: string;
  type: "internal" | "external" | "anchor";
}

interface AuditResult {
  totalLinks: number;
  brokenLinks: LinkRef[];
  missingFiles: LinkRef[];
  validLinks: number;
}

// Pattern: [text](link) or [text](link#anchor)
const LINK_REGEX = /\[([^\]]+)\]\(([^)]+)\)/g;

function isExternalLink(link: string): boolean {
  return link.startsWith("http://") || link.startsWith("https://");
}

function extractLinks(content: string, filepath: string): LinkRef[] {
  const links: LinkRef[] = [];
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    for (const match of line.matchAll(LINK_REGEX)) {
      const link = match[2];

      let type: "internal" | "external" | "anchor";
      if (isExternalLink(link)) {
        type = "external";
      } else if (link.startsWith("#")) {
        type = "anchor";
      } else {
        type = "internal";
      }

      links.push({
        file: filepath,
        line: idx + 1,
        link,
        type,
      });
    }
    LINK_REGEX.lastIndex = 0; // Reset regex state
  });

  return links;
}

function validateInternalLink(link: string, sourceFile: string): boolean {
  // Handle anchor links
  const [filepath, _anchor] = link.split("#");

  // If no filepath (pure anchor), skip for now
  if (!filepath) return true;

  // Resolve relative to source file
  const sourceDir = path.dirname(sourceFile);
  const targetPath = path.resolve(sourceDir, filepath);

  return fs.existsSync(targetPath);
}

function auditMarkdownFiles(dir: string): AuditResult {
  const result: AuditResult = {
    totalLinks: 0,
    brokenLinks: [],
    missingFiles: [],
    validLinks: 0,
  };

  // Find all .md files (excluding node_modules)
  const files = findMarkdownFiles(dir);

  console.log(`\nFound ${files.length} markdown files\n`);

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    const links = extractLinks(content, file);

    links.forEach((linkRef) => {
      result.totalLinks++;

      if (linkRef.type === "internal") {
        if (!validateInternalLink(linkRef.link, linkRef.file)) {
          result.brokenLinks.push(linkRef);
        } else {
          result.validLinks++;
        }
      } else if (linkRef.type === "anchor") {
        // Could validate anchors exist in target file, but skipping for now
        result.validLinks++;
      } else {
        // External links - assume valid unless we want to fetch
        result.validLinks++;
      }
    });
  });

  return result;
}

function findMarkdownFiles(
  dir: string,
  exclude: string[] = ["node_modules", ".git"],
): string[] {
  let results: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!exclude.includes(entry.name)) {
        results = results.concat(findMarkdownFiles(fullPath, exclude));
      }
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }

  return results;
}

function printResults(result: AuditResult): void {
  console.log("=".repeat(60));
  console.log("DOCUMENTATION LINK AUDIT REPORT");
  console.log("=".repeat(60));
  console.log();

  console.log(`Total Links: ${result.totalLinks}`);
  console.log(`Valid Links: ${result.validLinks}`);
  console.log(`Broken Links: ${result.brokenLinks.length}`);
  console.log();

  if (result.brokenLinks.length > 0) {
    console.log("BROKEN INTERNAL LINKS:");
    console.log("-".repeat(60));
    result.brokenLinks.forEach((ref) => {
      console.log(`  ${path.relative(process.cwd(), ref.file)}:${ref.line}`);
      console.log(`    → ${ref.link}`);
    });
    console.log();
  } else {
    console.log("✅ All internal links valid!\n");
  }
}

// Main execution
const projectRoot = process.cwd();
console.log(`Auditing links in: ${projectRoot}`);

const result = auditMarkdownFiles(projectRoot);
printResults(result);

process.exit(result.brokenLinks.length > 0 ? 1 : 0);
