# AGENTS.md - AI Coding Agent Guidelines

## Commands

- **Test all**: `bun test:agent`
- **Test single file**: `bun test:agent tests/lexer.test.ts`
- **Test pattern**: `bun test:agent --test-name-pattern "tokenize"`
- **Lint**: `bun run lint` (biome) | **Format**: `bun run fmt` (`dprint`)
- **Typecheck**: `bun run typecheck` | **Dev server**: `bun run dev`
- **All-in-one checks/validation**: run `bun validate`, which does all the checks mentioned above.

## Code Style

- **TypeScript strict mode**, target ES2022, double quotes, 2-space indent
- **Naming**: files=`kebab-case.ts` except for components which use `PascalCase`,
  classes=`PascalCase`, functions=`camelCase`, constants=`UPPER_SNAKE_CASE`
- **Imports**: use path aliases `@/*` for `src/`, organize imports via biome
- **Types**: prefer interfaces over types, avoid `any`, use explicit return types
- **Errors**: throw typed errors, handle with try/catch, no silent failures

## Testing

### Unit Tests (bun:test)

- Use `bun:test` with `describe`/`test`/`expect` (vitest-compatible API)
- Tests in `tests/` mirror `src` structure, suffix `.test.ts`
- Unused vars: prefix with `_` (e.g., `_unusedParam`)
- `test:agent` just filters out passing test output so you only see
  failures/warnings/coverage.
- Exit code 1 on failure or coverage less than configured in `bunfig.toml`.
- Don't touch the ignore and coverage thresholds in `bunfig.toml`!
- Focus on Quality, Not Just Quantity

  ```ts
  // Good: Test actual functionality
  test("calculateTax should handle different tax rates", () => {
    expect(calculateTax(100, 0.08)).toBe(8);
    expect(calculateTax(100, 0.1)).toBe(10);
    expect(calculateTax(0, 0.08)).toBe(0);
  });

  // Avoid: Just hitting lines for coverage
  test("calculateTax exists", () => {
    calculateTax(100, 0.08); // No assertions!
  });
  ```

- If files aren’t appearing in coverage reports, they might not be imported by
  your tests. Coverage only tracks files that are actually loaded.
- Aim For:
  - 80%+ overall coverage: Generally considered good
  - 90%+ critical paths: Important business logic should be well-tested
  - 100% utility functions: Pure functions and utilities are easy to test completely
  - Lower coverage for UI components: Often acceptable as they may require integration tests

### E2E Tests (Playwright)

- **Run all**: `bun run e2e` (starts dev server automatically)
- **Run headed**: `bun run e2e:headed` (watch browser)
- **Run single file**: `bun run e2e e2e/playground/run-genome.spec.ts`
- **Debug mode**: `bun run e2e:debug` (step through with inspector)
- **UI mode**: `bun run e2e:ui` (interactive test explorer)
- **View report**: `bun run e2e:report` (after test run)

Tests in `e2e/` organized by feature:

- `accessibility/` - ARIA, keyboard nav, landmarks
- `demos/` - mutation lab, timeline scrubber
- `file-operations/` - save, load, export, share
- `gallery/` - filtering, search, load examples
- `navigation/` - header, footer, theme toggle
- `playground/` - editor, run, clear, undo/redo
- `tutorial/` - lessons, hints, validation

Key patterns:

```ts
import { expect, test } from "@playwright/test";

test("loads playground and runs genome", async ({ page }) => {
  await page.goto("/playground");
  await page.getByRole("button", { name: "Run" }).click();
  await expect(page.locator("canvas")).toBeVisible();
});
```

- Use `getByRole`, `getByLabel`, `getByText` over CSS selectors
- Tests suffix `.spec.ts` (not `.test.ts`)
- CI runs on Chromium, Firefox, WebKit + mobile viewports
- Local dev runs Chromium only for speed

## Key Rules

- Max cognitive complexity: 15 | Keep files <300 lines
- Always use `const`, strict equality (`===`), curly braces for all blocks
- No `console.log` (use `console.info`/`warn`/`error` only)
- **Never add linter ignore comments** (e.g., `biome-ignore`, `eslint-disable`)
  without explicit user permission for each addition

## Genome Tools

See [tools/README](tools/README.md) for CLI utilities:

- `codon-calc.ts` - convert values, codons, colors
- `get-colours.ts` - extract colors from genome (runs VM)
- `audit-genome-comments.ts` - check comment/codon mismatches
- `fix-genome-codons.ts` - auto-fix codon discrepancies
- `genome-validator.ts` - validate genome structure

## Sidenotes

- If you are unsure how to do something, use `gh_grep` to search code examples from GitHub.
- When you need to search docs, use `context7` tools.
  - Or, when specifically searching for `bun` or `bun:test` docs, use `bun_docs` mcp.
- Running git commands: append `git` with `--no-pager`, e.g. `git --no-pager log`
- The default repo branch is `master`. The repo url is `https://github.com/kjanat/codoncanvas.git`
