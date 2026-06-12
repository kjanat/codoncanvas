# CodonCanvas Web (Svelte 5 + WASM)

The CodonCanvas site, rebuilt in Svelte 5 (runes) on Vite. The language runs in
the browser via the Rust/WebAssembly [`engine`](../engine), loaded as a WASM
module.

## Views

- **Playground** — live editor, canvas preview, diagnostics, a timeline scrubber
  that steps through execution like a ribosome, and a stack inspector.
- **Gallery** — built-in example genomes, each rendered live; open any in the
  playground.
- **Mutation Lab** — apply a mutation and compare original vs. mutant side by
  side, with a codon-level diff and explanation.
- **Codon Reference** — all 64 codons grouped by opcode, with the real amino
  acid each encodes; toggle DNA/RNA notation.
- **About** — what changed in the rewrite, including the negative-offset fix.

## Develop

```bash
# Prerequisites (once):
rustup target add wasm32-unknown-unknown
cargo install wasm-bindgen-cli

npm install          # or: bun install
npm run dev          # builds the WASM module, then starts Vite
```

`dev` and `build` run `scripts/build-wasm.sh` first, which compiles the Rust
engine to WASM and writes the bindings into `src/lib/engine/pkg/` (git-ignored,
regenerated from source).

```bash
npm run build        # production build into web/dist
npm run check        # svelte-check type checking
```

## How the WASM is wired

`src/lib/engine/index.ts` initializes the wasm-bindgen module once and exposes
typed functions (`run`, `mutate`, `validate`, `examples`, …). The generated glue
uses `new URL('codoncanvas_bg.wasm', import.meta.url)`, which Vite resolves
automatically — no extra wasm plugin needed. `src/lib/render.ts` replays the
engine's draw commands onto a 2D canvas, exactly mirroring the original
renderer.
