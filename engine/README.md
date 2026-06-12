# CodonCanvas Engine (Rust → WebAssembly)

The CodonCanvas language engine, rewritten in idiomatic Rust (edition 2024) and
compiled to WebAssembly. It replaces the original TypeScript core
(`src/core`, `src/genetics`).

## Layout

```
engine/
├── core/    codoncanvas-core — pure logic, no platform deps, fully tested
│   └── src/
│       ├── opcode.rs     instruction set
│       ├── base.rs       bases, codons, base-4 decoding
│       ├── codon.rs      codon → opcode map + standard genetic code
│       ├── lexer.rs      tokenizer + structural/frame validation
│       ├── vm.rs         stack VM, emits renderer-agnostic draw commands
│       ├── genome.rs     genome string utilities
│       ├── mutation.rs   silent/missense/nonsense/point/indel/frameshift
│       └── examples.rs   built-in example genomes
└── wasm/    codoncanvas-wasm — wasm-bindgen bindings exposed to JS
```

## The negative-offset fix

Stack values are 6-bit (`0..=63`). The original engine mapped them to
`(v / 64) * width`, which is never negative, so `TRANSLATE` could only move
right and down. The Rust VM treats translation offsets as **signed around the
midpoint 32**:

```
offset_px = ((v - 32) / 64) * width
```

So `32` = no movement, `< 32` = left/up, `> 32` = right/down. Shape dimensions
keep the original unsigned mapping (a negative radius is meaningless). See
`Vm::translate_offset` and the `negative_offset_moves_left_and_up` test.

## Design notes

- The VM is **renderer-agnostic**: it emits an ordered list of `DrawCommand`s
  (each carrying its full transform + color), plus a per-instruction timeline.
  Any backend can replay them — the Svelte app draws them on a 2D canvas.
- Randomness in the mutation engine is a seeded SplitMix64, so results are
  deterministic and reproducible without `getrandom` on wasm.
- All types derive `serde::Serialize`; the wasm layer hands plain JS objects to
  the frontend via `serde-wasm-bindgen`.

## Build & test

```bash
# Native tests (fast)
cargo test

# Lint
cargo clippy --all-targets

# Build the WASM module + JS bindings (done for you by web/'s npm scripts)
cargo build -p codoncanvas-wasm --target wasm32-unknown-unknown --release
wasm-bindgen --target web --out-dir ../web/src/lib/engine/pkg \
  --out-name codoncanvas \
  target/wasm32-unknown-unknown/release/codoncanvas_wasm.wasm
```

Prerequisites: `rustup target add wasm32-unknown-unknown` and
`cargo install wasm-bindgen-cli`.
