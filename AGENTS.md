# AGENTS.md - AI Coding Agent Guidelines

## Commands

- **Test all**: `bun test`
- **Test single file**: `bun test tests/lexer.test.ts`
- **Test pattern**: `bun test --test-name-pattern "tokenize"`
- **Lint**: `bun run lint` (biome) | **Format**: `bun run fmt` (dprint)
- **Typecheck**: `bun run typecheck` | **Dev server**: `bun run dev`

## Code Style

- **TypeScript strict mode**, target ES2022, double quotes, 2-space indent
- **Naming**: files=`kebab-case.ts`, classes=`PascalCase`, functions=`camelCase`, constants=`UPPER_SNAKE_CASE`
- **Imports**: use path aliases `@/*` for src/, organize imports via biome
- **Types**: prefer interfaces over types, avoid `any`, use explicit return types
- **Errors**: throw typed errors, handle with try/catch, no silent failures

## Testing

- Use `bun:test` with `describe`/`test`/`expect` (vitest-compatible API)
- Tests in `tests/` mirror src structure, suffix `.test.ts`
- Unused vars: prefix with `_` (e.g., `_unusedParam`)

## Key Rules

- Max cognitive complexity: 15 | Keep files <300 lines
- Always use `const`, strict equality (`===`), curly braces for all blocks
- No `console.log` (use `console.warn`/`error` only)
