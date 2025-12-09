# Copilot Coding Agent Onboarding

Repository: `kjanat/codoncanvas` – DNA-inspired visual programming language built with TypeScript/React and Bun.

## Environment
- Package manager/runtime: **Bun 1.3.3** (see the `packageManager` field in `package.json`). Install Bun and ensure `$HOME/.bun/bin` is on `PATH`.
- Install dependencies: `bun install`

## Core commands
- Lint: `bun run lint` (biome)
- Format: `bun run fmt` (dprint)
- Typecheck: `bun run typecheck`
- Unit tests with coverage (agent-filtered output): `bun test:agent`
  - Single file: `bun test:agent tests/lexer.test.ts`
  - By name pattern: `bun test:agent --test-name-pattern "<pattern>"`
- E2E (Playwright): `bun run e2e` (headed: `bun run e2e:headed`, debug: `bun run e2e:debug`)
- All-in-one check: `bun validate` (runs lint:fix, fmt, typecheck, test:agent, and e2e)

## Conventions (see `AGENTS.md` for full details)
- TypeScript strict, ES2022 target, double quotes, 2-space indent.
- Naming: files kebab-case (components PascalCase); classes PascalCase; functions camelCase; constants UPPER_SNAKE_CASE.
- Imports use `@/*` alias for `src/`; organize via biome.
- Prefer interfaces over types; avoid `any`; explicit return types.
- Always use `const`, strict equality, braces for all blocks. Avoid `console.log`; use `console.info/warn/error`.
- Do not add linter ignore comments without explicit approval.

## Testing guidance
- Unit tests live in `tests/` mirroring `src/` with `.test.ts` suffix.
- E2E specs live in `e2e/` (use `getByRole`/`getByLabel`/`getByText` selectors).

## Git/CI notes
- Default branch: `master`.
- CI workflows live in `.github/workflows`; keep lint, typecheck, tests, and e2e passing.
- Never run `git push` directly; use the Copilot `/commit push` command to commit and push (see Git Rules in `AGENTS.md`).

## Helpful tools
- Genome CLI utilities in `tools/` (see `tools/README.md`), e.g., `codon-calc.ts`, `get-colours.ts`, `audit-genome-comments.ts`, `fix-genome-codons.ts`, `genome-validator.ts`, `coverage-check.ts`.

Keep this file in sync with `AGENTS.md` when processes change.
