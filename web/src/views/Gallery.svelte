<script lang="ts">
	import CanvasView from '../lib/components/CanvasView.svelte';
	import type { Engine, Example } from '../lib/engine/index.js';
	import { router } from '../lib/router.svelte.js';
	import { genomeStore } from '../lib/state.svelte.js';

	interface Props {
		engine: Engine;
	}
	let { engine }: Props = $props();

	const SIZE = 300;
	const examples = $derived<Example[]>(engine.examples());

	let search = $state('');
	let difficulty = $state('all');
	let concept = $state('all');

	const difficulties = $derived([
		'all',
		...new Set(examples.map((e) => e.difficulty)),
	]);
	const concepts = $derived([
		'all',
		...new Set(examples.flatMap((e) => e.concepts)),
	]);

	const filtered = $derived(
		examples.filter((e) => {
			const q = search.trim().toLowerCase();
			const matchesSearch = q === ''
				|| e.title.toLowerCase().includes(q)
				|| e.description.toLowerCase().includes(q);
			const matchesDifficulty = difficulty === 'all'
				|| e.difficulty === difficulty;
			const matchesConcept = concept === 'all' || e.concepts.includes(concept);
			return matchesSearch && matchesDifficulty && matchesConcept;
		}),
	);

	function open(ex: Example): void {
		genomeStore.set(ex.genome);
		router.go('playground');
	}
</script>

<h2>Example Gallery</h2>
<p class="muted">
	{examples.length} built-in genomes, each rendered live by the WASM engine.
	Click one to open it in the playground.
</p>

<div class="panel" style="margin-bottom: 1.2rem">
	<div class="row">
		<input
			type="text"
			placeholder="Search examples…"
			bind:value={search}
			style="flex: 1; min-width: 160px"
			aria-label="Search examples"
		>
		<label class="row" style="gap: 0.3rem; font-size: 0.8rem">
			difficulty
			<select bind:value={difficulty}>
				{#each difficulties as d (d)}
					<option value={d}>{d}</option>
				{/each}
			</select>
		</label>
		<label class="row" style="gap: 0.3rem; font-size: 0.8rem">
			concept
			<select bind:value={concept}>
				{#each concepts as c (c)}
					<option value={c}>{c}</option>
				{/each}
			</select>
		</label>
		<span class="muted" style="font-size: 0.8rem">{filtered.length} shown</span>
	</div>
</div>

{#if filtered.length === 0}
	<p class="muted">No examples match those filters.</p>
{:else}
	<div class="cards">
		{#each filtered as ex (ex.id)}
			{@const result = engine.run(ex.genome, SIZE, SIZE)}
			<div class="card">
				<CanvasView {result} size={SIZE} />
				<h3>{ex.title}</h3>
				<p class="muted" style="font-size: 0.85rem; margin: 0">
					{ex.description}
				</p>
				<div class="row">
					<span class="badge">{ex.difficulty}</span>
					{#each ex.concepts as c (c)}
						<span class="badge">{c}</span>
					{/each}
				</div>
				<button class="primary" onclick={() => open(ex)}>
					Open in Playground
				</button>
			</div>
		{/each}
	</div>
{/if}
