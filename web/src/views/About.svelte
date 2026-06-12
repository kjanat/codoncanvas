<script lang="ts">
  import type { Engine } from "../lib/engine/index.js";

  interface Props {
    engine: Engine;
  }
  let { engine }: Props = $props();
</script>

<div class="panel">
  <h2>About this rewrite</h2>
  <p>
    CodonCanvas is a DNA-inspired visual programming language: you write
    three-letter codons (like <span class="mono">ATG GAA CGA GGA TAA</span>) and
    a stack-based virtual machine paints them onto a canvas. Synonymous codons
    map to the same operation, so mutations behave like real genetics — silent,
    missense, nonsense, and frameshift.
  </p>

  <h3>What changed</h3>
  <ul>
    <li>
      The entire engine — lexer, codon map, stack VM, and mutation tools — was
      rewritten in idiomatic Rust (edition 2024) and compiled to WebAssembly. It
      runs the same code natively (for tests) and in your browser.
    </li>
    <li>
      The site was rebuilt in <strong>Svelte 5</strong> (runes) on Vite; the
      engine is loaded as a WASM module (v{engine.version()}).
    </li>
    <li>
      <strong>The negative-offset bug is fixed.</strong> Stack values are 6-bit
      (<span class="mono">0–63</span>). The old engine mapped them to
      <span class="mono">(v / 64) × width</span>, which is never negative, so
      <span class="mono">TRANSLATE</span> could only move right and down. The new
      engine treats translation offsets as <em>signed around the midpoint 32</em>:
      <span class="mono">offset = ((v − 32) / 64) × width</span>. So
      <span class="mono">32</span> means "stay put", values below 32 move
      left/up, and values above 32 move right/down. Shape sizes keep the original
      unsigned mapping, since a negative radius is meaningless. See the
      <em>Negative Offset Demo</em> in the gallery.
    </li>
  </ul>

  <h3>The instruction set</h3>
  <p class="muted">
    Drawing: CIRCLE, RECT, LINE, TRIANGLE, ELLIPSE. Transforms: TRANSLATE,
    ROTATE, SCALE, COLOR. Stack: PUSH, DUP, POP, SWAP. Arithmetic: ADD, SUB, MUL,
    DIV. Comparison: EQ, LT. Control: START, STOP, LOOP. State: SAVE_STATE,
    RESTORE_STATE. Plus NOP. Browse them all in the Codon Reference.
  </p>
</div>
