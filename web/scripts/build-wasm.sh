#!/usr/bin/env bash
# Builds the Rust engine to WebAssembly and generates JS/TS bindings into
# web/src/lib/engine/pkg. Run automatically before `vite dev`/`vite build`.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENGINE="$(cd "$ROOT/../engine" && pwd)"
OUT="$ROOT/src/lib/engine/pkg"

if ! command -v wasm-bindgen >/dev/null 2>&1; then
	echo "error: wasm-bindgen CLI not found. Install with: cargo install wasm-bindgen-cli" >&2
	exit 1
fi

rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true

echo "Building codoncanvas-wasm (release, wasm32-unknown-unknown)..."
cargo build --manifest-path "$ENGINE/Cargo.toml" \
	-p codoncanvas-wasm --target wasm32-unknown-unknown --release

echo "Generating bindings with wasm-bindgen..."
wasm-bindgen --target web --out-dir "$OUT" --out-name codoncanvas \
	"$ENGINE/target/wasm32-unknown-unknown/release/codoncanvas_wasm.wasm"

echo "WASM bindings written to $OUT"
