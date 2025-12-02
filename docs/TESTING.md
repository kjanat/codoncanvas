# Testing with Bun

## Overview

This project uses Bun's native test runner (`bun:test`). DOM testing uses happy-dom via `bun-test-setup.ts`.

---

## Quick reference

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific file
bun test tests/core/lexer.test.ts

# Run tests matching pattern
bun test --test-name-pattern "tokenize"

# Agent mode (filtered output)
bun test:agent
```

---

## Configuration

Test configuration lives in three files:

1. **bunfig.toml** - Test runner settings, coverage thresholds
2. **bun-test-setup.ts** - DOM mocking via happy-dom, storage mocks
3. **tests/** - Test files mirroring `src/` structure

```toml
# bunfig.toml
[test]
root = "tests"
preload = ["./bun-test-setup.ts"]
coverage = true
coverageDir = "coverage"

[test.coverageThreshold]
line = 0.85
function = 0.85
```

---

## Write tests

Import test utilities from `bun:test`:

```typescript
import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
```

Basic test structure:

```typescript
describe("Lexer", () => {
  test("tokenizes codon sequence", () => {
    const tokens = tokenize("AUG UGA");
    expect(tokens).toHaveLength(2);
  });
});
```

---

## Test organization

Tests live in `tests/` directory, mirroring `src/` structure:

```
src/
  core/
    lexer.ts
    parser.ts
tests/
  core/
    lexer.test.ts
    parser.test.ts
```

Pattern: `tests/**/*.test.ts`

---

## DOM testing

happy-dom provides DOM globals (`document`, `window`, etc.). Setup is automatic via `bun-test-setup.ts`.

Canvas `getContext('2d')` returns null by design. Mock locally when needed:

```typescript
test("renders to canvas", () => {
  const canvas = document.createElement("canvas");
  const mockCtx = {
    fillRect: mock(() => {}),
    strokeRect: mock(() => {}),
    // ... other methods
  };
  mock.module("canvas", () => ({ getContext: () => mockCtx }));

  // Test canvas operations
});
```

Storage (`localStorage`, `sessionStorage`) is mocked and cleared after each test.

---

## Coverage

Built-in coverage with `--coverage` flag. Thresholds configured in `bunfig.toml`.

```bash
# Run with coverage report
bun test --coverage
```

Coverage reports output to `coverage/` directory in text and lcov formats.

Agent mode (`bun test:agent`) filters passing test output for cleaner CI logs.

---

## Troubleshooting

### Canvas method not implemented

Mock canvas methods locally in your test. Don't rely on happy-dom's canvas implementation.

### Test files not discovered

Ensure files are in `tests/` directory and match `*.test.ts` pattern.

### Storage not isolated

Storage is cleared after each test automatically. If issues persist, check that `bun-test-setup.ts` is preloaded.

---

## CI integration

```yaml
- name: Install dependencies
  run: bun install

- name: Run tests
  run: bun test --coverage
```

---

## Resources

- [Bun Test Runner](https://bun.sh/docs/test/writing)
- [happy-dom](https://github.com/capricorn86/happy-dom)
