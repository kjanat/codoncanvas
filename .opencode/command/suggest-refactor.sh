#!/usr/bin/env bash
set -euo pipefail # Strict mode: exit on error/unbound vars/pipefail [web:20]

# Check if rg is installed
if ! command -v rg &>/dev/null; then
	echo "Error: unable to list the files to refactor: rg is not installed. Please install it first."
	exit 1
fi

# Configurable patterns and globs
PATTERNS="biome-ignore|eslint-disable|ts-expect-error|ts-ignore|@ts-nocheck|prettier-ignore|stylelint-disable"
GLBS=(
	"*.{ts,tsx,js,jsx,json,css,scss}"
	'!**/*.gen.ts'
	'!**/.git'
	'!**/.next'
	'!**/build'
	'!**/dist'
	'!**/node_modules'
)
INPUT="${1:-.}"

# Build rg command
rg_cmd=(rg -n "$PATTERNS")
for glob in "${GLBS[@]}"; do
	rg_cmd+=("--glob" "$glob")
done
rg_cmd+=("$INPUT")

# Run and exit 1 if matches found (treat as "lint error")
"${rg_cmd[@]}" || exit 1
