<script lang="ts">
  import type { Engine, Example } from "../lib/engine/index.js";
  import { genomeStore } from "../lib/state.svelte.js";
  import { router } from "../lib/router.svelte.js";
  import CanvasView from "../lib/components/CanvasView.svelte";

  interface Props {
    engine: Engine;
  }
  let { engine }: Props = $props();

  const SIZE = 300;
  const examples = $derived<Example[]>(engine.examples());

  function open(ex: Example): void {
    genomeStore.set(ex.genome);
    router.go("playground");
  }
</script>

<h2>Example Gallery</h2>
<p class="muted">
  {examples.length} built-in genomes, each rendered live by the WASM engine.
  Click one to open it in the playground.
</p>

<div class="cards">
  {#each examples as ex (ex.id)}
    {@const result = engine.run(ex.genome, SIZE, SIZE)}
    <div class="card">
      <CanvasView {result} size={SIZE} />
      <h3>{ex.title}</h3>
      <p class="muted" style="font-size: 0.85rem; margin: 0;">{ex.description}</p>
      <div class="row">
        <span class="badge">{ex.difficulty}</span>
        {#each ex.concepts as c (c)}
          <span class="badge">{c}</span>
        {/each}
      </div>
      <button class="primary" onclick={() => open(ex)}>Open in Playground</button>
    </div>
  {/each}
</div>
