<script lang="ts">
	import CanvasView from '../lib/components/CanvasView.svelte';
	import type { Engine, Example, MutationResult } from '../lib/engine/index.js';
	import { router } from '../lib/router.svelte.js';
	import { genomeStore } from '../lib/state.svelte.js';

	interface Props {
		engine: Engine;
	}
	let { engine }: Props = $props();

	const SIZE = 240;
	const CANDIDATES = 6;
	const examples = $derived<Example[]>(engine.examples());

	let parent = $state(genomeStore.value);
	let generation = $state(0);
	let lineageLength = $state(1);
	let candidates = $state<MutationResult[]>([]);

	const parentResult = $derived(engine.run(parent, SIZE, SIZE));

	function generate(): void {
		// Over-generate and keep only mutants that still run and draw something,
		// so every offspring card shows a real phenotype. Lethal mutations
		// (frame-shifting indels, early STOPs, stack underflows) are naturally
		// selected out rather than rendered as blank cards.
		const seen = new Set<string>([parent]);
		const viable: MutationResult[] = [];
		for (const c of engine.mutateBatch(parent, CANDIDATES * 6)) {
			if (seen.has(c.mutated)) continue;
			const r = engine.run(c.mutated, SIZE, SIZE);
			if (r.ok && r.commands.length > 0) {
				viable.push(c);
				seen.add(c.mutated);
				if (viable.length >= CANDIDATES) break;
			}
		}
		candidates = viable;
	}

	function select(candidate: MutationResult): void {
		parent = candidate.mutated;
		generation += 1;
		lineageLength += 1;
		candidates = [];
	}

	function reset(seed?: string): void {
		if (seed) parent = seed;
		generation = 0;
		lineageLength = 1;
		candidates = [];
	}

	function loadExample(id: string): void {
		const ex = examples.find((e) => e.id === id);
		if (ex) reset(ex.genome);
	}

	function openInPlayground(): void {
		genomeStore.set(parent);
		router.go('playground');
	}
</script>

<h2>Evolution Lab</h2>
<p class="muted">
	You are the fitness function. Generate {CANDIDATES} mutated offspring, pick
	the one closest to whatever phenotype you're chasing, and repeat —
	cumulative selection in action.
</p>

<div class="panel" style="margin-bottom: 1.2rem">
	<div class="row" style="justify-content: space-between">
		<div class="row">
			<div class="field">
				<label for="evo-example">Seed from</label>
				<select
					id="evo-example"
					onchange={(e) => loadExample(e.currentTarget.value)}
				>
					<option value="" selected disabled>an example…</option>
					{#each examples as ex (ex.id)}
						<option value={ex.id}>{ex.title}</option>
					{/each}
				</select>
			</div>
			<div class="row" style="gap: 1rem">
				<span class="badge">generation {generation}</span>
				<span class="badge">lineage {lineageLength}</span>
			</div>
		</div>
		<div class="row">
			<button onclick={openInPlayground}>Open in Playground</button>
			<button class="primary" onclick={generate}>
				Generate offspring 🧬
			</button>
		</div>
	</div>
</div>

<div class="grid-2">
	<section class="panel">
		<h3>Current parent</h3>
		<CanvasView result={parentResult} size={SIZE} />
		{#if !parentResult.ok}
			<div class="diag error">⛔ {parentResult.error}</div>
		{/if}
	</section>

	<section class="panel">
		<h3>Offspring</h3>
		{#if candidates.length === 0}
			<p class="muted">
				Click <strong>Generate offspring</strong> to mutate the parent into
				{CANDIDATES} variants, then click the fittest to make it the next
				parent.
			</p>
		{:else}
			<div class="cards">
				{#each candidates as candidate, i (i)}
					{@const result = engine.run(candidate.mutated, SIZE, SIZE)}
					<button
						class="card"
						style="cursor: pointer; text-align: left"
						onclick={() => select(candidate)}
						title={candidate.description}
					>
						<CanvasView {result} size={SIZE} />
						<span class="badge">{candidate.type}</span>
					</button>
				{/each}
			</div>
		{/if}
	</section>
</div>
