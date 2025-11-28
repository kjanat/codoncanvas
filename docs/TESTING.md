# Testing with Bun + Vitest

## Overview

This project uses **Vitest** for testing, NOT Bun's native test runner. Vitest provides DOM testing capabilities through `happy-dom`.

## Quick Reference

```bash
# Run all tests (CORRECT)
bun run test

# Watch mode
bun run test:watch

# UI mode
bun run test:ui

# Run specific test file
bunx vitest run src/mutation-predictor.test.ts

# WRONG - Uses Bun's native test runner (no DOM support)
bun test  # ❌ Don't use this
```

## Why Not `bun test`?

**Problem**: `bun test` uses Bun's native test runner, which:

- Doesn't read `vite.config.ts`
- Doesn't provide DOM globals (`document`, `window`, etc.)
- Results in `ReferenceError: document is not defined`

**Solution**: Always use `bun run test` or `bunx vitest` to invoke Vitest, which:

- Reads `vite.config.ts` for DOM environment setup
- Provides full DOM API support via happy-dom
- Runs all canvas/DOM-dependent tests successfully

## DOM Testing Setup

### Configuration Stack

1. **vite.config.ts** - Vitest configuration

   ```ts
   test: {
     globals: true,
     environment: "happy-dom",  // DOM environment
     setupFiles: ["./vitest.setup.ts"],
     fileParallelism: false,    // Prevent race conditions
     pool: "threads",
   }
   ```

2. **vitest.setup.ts** - Global test setup
   - Verifies DOM environment loaded
   - Mocks canvas 2D context (happy-dom doesn't fully implement canvas)
   - Provides localStorage mock
   - Sets up test cleanup hooks

3. **happy-dom** - Fast DOM implementation
   - Lightweight alternative to jsdom
   - ~36% faster test execution (4.3s vs 7.2s)
   - Full DOM API compatibility
   - Better Bun integration

### jsdom vs happy-dom

| Feature           | jsdom         | happy-dom     | Choice                  |
| ----------------- | ------------- | ------------- | ----------------------- |
| Speed             | Slower (7.2s) | Faster (4.3s) | ✅ happy-dom            |
| Accuracy          | High          | High          | Both good               |
| Canvas Support    | Partial       | Partial       | Equal (both need mocks) |
| Bun Compatibility | Good          | Better        | ✅ happy-dom            |
| Maintenance       | Active        | Very Active   | ✅ happy-dom            |

## Testing DOM-Dependent Code

### Example: document.createElement

```ts
// mutation-predictor.ts
export function predictMutationImpact(...) {
  const canvas = document.createElement("canvas");  // ✅ Works with Vitest
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  // ... render logic
}
```

```ts
// mutation-predictor.test.ts
import { describe, it, expect } from "vitest";

describe("Mutation Predictor", () => {
  it("should predict impact with canvas rendering", () => {
    const prediction = predictMutationImpact(genome, mutation);
    expect(prediction.originalPreview).toMatch(/^data:image\/png/);
  });
});
```

### Canvas Mocking Strategy

happy-dom provides `document.createElement("canvas")` but canvas methods are mocked in `vitest.setup.ts`:

```ts
HTMLCanvasElement.prototype.getContext = (contextId) => {
  if (contextId === "2d") {
    return {
      fillRect: () => {},
      strokeRect: () => {},
      fillText: () => {},
      // ... all canvas 2D methods
      getImageData: (sx, sy, sw, sh) => ({
        data: new Uint8ClampedArray(sw * sh * 4),
        width: sw,
        height: sh,
      }),
    };
  }
  return null;
};
```

## Best Practices

### 1. Always Use Test Scripts

```bash
✅ bun run test       # Uses Vitest
✅ bunx vitest run    # Direct Vitest invocation
❌ bun test           # Bun's native runner (no DOM)
```

### 2. File Organization

```
src/
  mutation-predictor.ts        # Source file
  mutation-predictor.test.ts   # Test file (same directory)
vite.config.ts                 # Vitest configuration
vitest.setup.ts                # Global test setup
```

### 3. Test File Naming

- Pattern: `*.test.ts`
- Vitest auto-discovers all `**/*.test.ts` files
- Co-locate tests with source files

### 4. Import from vitest

```ts
import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
```

### 5. Handle Async Canvas Operations

```ts
it("should handle canvas toBlob", async () => {
  const canvas = document.createElement("canvas");
  const blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b));
  });
  expect(blob).toBeInstanceOf(Blob);
});
```

## Performance Optimization

### Current Configuration

- **environment**: `happy-dom` (faster than jsdom)
- **fileParallelism**: `false` (prevents DOM race conditions)
- **pool**: `threads` (parallel tests within each file)

### Performance Metrics

- **Total tests**: 469
- **Test files**: 17
- **Execution time**: ~4.3s (with happy-dom)
- **Environment setup**: ~2.4s
- **Test execution**: ~188ms

### Optimization Tips

1. Minimize canvas operations in setup/teardown
2. Reuse test fixtures across tests
3. Keep DOM manipulation focused in specific tests
4. Use `vi.clearAllTimers()` in cleanup to prevent leaks

## Troubleshooting

### "document is not defined"

**Problem**: Using `bun test` instead of `bun run test`
**Solution**: Always use `bun run test` or `bunx vitest`

### Canvas method not implemented

**Problem**: happy-dom doesn't implement all canvas methods
**Solution**: Check `vitest.setup.ts` canvas mocks - add missing methods if needed

### Test files not discovered

**Problem**: File naming or location issue
**Solution**: Ensure files match `**/*.test.ts` pattern in `src/` directory

### Race conditions in DOM tests

**Problem**: Parallel file execution causes DOM conflicts
**Solution**: Already configured - `fileParallelism: false` in vite.config.ts

### Slow test execution

**Problem**: Using jsdom instead of happy-dom
**Solution**: Already optimized - using happy-dom for 36% faster tests

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Install dependencies
  run: bun install

- name: Run tests
  run: bun run test # NOT bun test
```

### Pre-commit Hook

```bash
#!/bin/bash
bun run test || exit 1
```

## Migration Notes

### From jsdom to happy-dom

1. Update `vite.config.ts`: `environment: "jsdom"` → `environment: "happy-dom"`
2. Update `vitest.setup.ts` comments
3. Install: `bun add -d happy-dom`
4. Optional: Remove jsdom if not used elsewhere: `bun remove -d jsdom`

### From Bun test to Vitest

1. Keep existing test syntax (compatible)
2. Change test invocation: `bun test` → `bun run test`
3. Add DOM environment configuration to `vite.config.ts`
4. Create `vitest.setup.ts` for global mocks

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [happy-dom GitHub](https://github.com/capricorn86/happy-dom)
- [Bun Testing Guide](https://bun.sh/docs/test/writing)
- [Canvas API Reference](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
