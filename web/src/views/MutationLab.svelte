<script lang="ts">
  import type {
    Engine,
    Example,
    MutationType,
    MutationResult,
    CodonDiff,
  } from "../lib/engine/index.js";
  import { genomeStore } from "../lib/state.svelte.js";
  import CanvasView from "../lib/components/CanvasView.svelte";

  interface Props {
    engine: Engine;
  }
  let { engine }: Props = $props();

  const SIZE = 380;
  const examples = $derived<Example[]>(engine.examples());

  const TYPES: MutationType[] = [
    "silent",
    "missense",
    "nonsense",
    "point",
    "insertion",
    "deletion",
    "frameshift",
  ];

  let genome = $state(genomeStore.value);
  let mutationType = $state<MutationType>("missense");
  let mutation = $state<MutationResult | null>(null);
  let mutationError = $state<string | null>(null);

  const original = $derived(engine.run(genome, SIZE, SIZE));
  const mutated = $derived(
    mutation ? engine.run(mutation.mutated, SIZE, SIZE) : null,
  );
  const diff = $derived<CodonDiff[]>(
    mutation ? engine.compare(mutation.original, mutation.mutated) : [],
  );
  const diffPositions = $derived(new Set(diff.map((d) => d.position)));
  const originalCodons = $derived(
    mutation ? mutation.original.replace(/;.*$/gm, "").trim().split(/\s+/) : [],
  );
  const mutatedCodons = $derived(
    mutation ? mutation.mutated.trim().split(/\s+/) : [],
  );

  function applyMutation(): void {
    try {
      mutationError = null;
      mutation = engine.mutate(genome, mutationType);
    } catch (e) {
      mutation = null;
      mutationError = String(e instanceof Error ? e.message : e);
    }
  }

  function loadExample(id: string): void {
    const ex = examples.find((e) => e.id === id);
    if (ex) {
      genome = ex.genome;
      mutation = null;
    }
  }
</script>

<h2>Mutation Lab</h2>
<p class="muted">
  Apply a biological mutation and compare the original genome with the mutant,
  side by side. Mutations are deterministic per click and explained below.
</p>

<div class="panel" style="margin-bottom: 1.2rem;">
  <div class="row" style="justify-content: space-between;">
    <div class="row">
      <div class="field">
        <label for="mut-example">Start from</label>
        <select id="mut-example" onchange={(e) => loadExample(e.currentTarget.value)}>
          <option value="" selected disabled>an example…</option>
          {#each examples as ex (ex.id)}
            <option value={ex.id}>{ex.title}</option>
          {/each}
        </select>
      </div>
      <div class="field">
        <label for="mut-type">Mutation type</label>
        <select id="mut-type" bind:value={mutationType}>
          {#each TYPES as t (t)}
            <option value={t}>{t}</option>
          {/each}
        </select>
      </div>
    </div>
    <button class="primary" onclick={applyMutation}>Apply mutation 🧬</button>
  </div>
  <textarea bind:value={genome} rows="6" spellcheck="false" style="margin-top: 0.8rem;"
  ></textarea>
  {#if mutationError}
    <div class="diag error" style="margin-top: 0.6rem;">⛔ {mutationError}</div>
  {/if}
</div>

<div class="grid-2">
  <section class="panel">
    <h3>Original</h3>
    <CanvasView result={original} size={SIZE} />
  </section>
  <section class="panel">
    <h3>Mutant</h3>
    {#if mutated}
      <CanvasView result={mutated} size={SIZE} />
    {:else}
      <p class="muted">Apply a mutation to see the result.</p>
    {/if}
  </section>
</div>

{#if mutation}
  <div class="panel" style="margin-top: 1.2rem;">
    <h3>{mutation.type} mutation</h3>
    <p class="mono" style="font-size: 0.88rem;">{mutation.description}</p>
    <div class="grid-2">
      <div>
        <span class="muted" style="font-size: 0.8rem;">original</span>
        <div class="diff-codons">
          {#each originalCodons as c, i (i)}
            <span class:changed={diffPositions.has(i)}>{c}</span>
          {/each}
        </div>
      </div>
      <div>
        <span class="muted" style="font-size: 0.8rem;">mutated</span>
        <div class="diff-codons">
          {#each mutatedCodons as c, i (i)}
            <span class:changed={diffPositions.has(i)}>{c}</span>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
