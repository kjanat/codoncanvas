# AGENTS.md - AI Coding Agent Guidelines

## Commands

- **Test all**: `bun test`
- **Test single file**: `bun test tests/lexer.test.ts`
- **Test pattern**: `bun test --test-name-pattern "tokenize"`
- **Lint**: `bun run lint` (biome) | **Format**: `bun run fmt` (dprint)
- **Typecheck**: `bun run typecheck` | **Dev server**: `bun run dev`

## Code Style

- **TypeScript strict mode**, target ES2022, double quotes, 2-space indent
- **Naming**: files=`kebab-case.ts` except for components which use `PascalCase`,
  classes=`PascalCase`, functions=`camelCase`, constants=`UPPER_SNAKE_CASE`
- **Imports**: use path aliases `@/*` for src/, organize imports via biome
- **Types**: prefer interfaces over types, avoid `any`, use explicit return types
- **Errors**: throw typed errors, handle with try/catch, no silent failures

## Testing

- Use `bun:test` with `describe`/`test`/`expect` (vitest-compatible API)
- Tests in `tests/` mirror src structure, suffix `.test.ts`
- Unused vars: prefix with `_` (e.g., `_unusedParam`)
- Run `bun test:agent` to get output relevant only to failing tests (as agent)

## Key Rules

- Max cognitive complexity: 15 | Keep files <300 lines
- Always use `const`, strict equality (`===`), curly braces for all blocks
- No `console.log` (use `console.info`/`warn`/`error` only)
- **Never add linter ignore comments** (e.g., `biome-ignore`, `eslint-disable`)
  without explicit user permission for each addition

## Genome Tools

See [tools/README.md](tools/README.md) for CLI utilities:

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
