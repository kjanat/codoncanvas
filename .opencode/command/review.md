---
description: Review code changes (all|staged|unstaged|commit|branch|pr)
---

Review the following code changes for:

1. Code quality and best practices
2. Potential bugs or edge cases
3. Performance considerations
4. Test coverage implications
5. Security concerns

## Changes

!`.opencode/command/review.sh $ARGUMENTS`

## CodonCanvas Guidelines

- TypeScript strict mode, no `any`
- Proper error handling (no silent failures)
- Naming: kebab-case files, PascalCase classes/components, camelCase functions
- Max cognitive complexity: 15
- No `console.log` (use info/warn/error)
- Import path aliases: `@/*`

Provide actionable feedback with `file:line` references.
