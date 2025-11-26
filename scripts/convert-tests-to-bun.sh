#!/bin/bash
# Convert all test files from Vitest to Bun test format

for file in src/*.test.ts; do
  if [ -f "$file" ]; then
    echo "Converting $file..."

    # Replace vitest imports with bun:test imports
    sed -i 's/from "vitest"/from "bun:test"/g' "$file"

    # Replace 'it' with 'test'
    sed -i 's/\bit(/test(/g' "$file"

    # Replace vi.fn() with mock()
    sed -i 's/vi\.fn()/mock()/g' "$file"

    # Replace vi with mock for other usages (but keep vitest-specific like spyOn for manual fixing)
    # We'll leave spyOn alone as it needs more complex changes
  fi
done

echo "Conversion complete! Please review the changes and fix any remaining vitest-specific code."
