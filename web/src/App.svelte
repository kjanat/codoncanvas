<script lang="ts">
	import { type Engine, loadEngine } from './lib/engine/index.js';
	import { type Route, router } from './lib/router.svelte.js';
	import About from './views/About.svelte';
	import Gallery from './views/Gallery.svelte';
	import MutationLab from './views/MutationLab.svelte';
	import Playground from './views/Playground.svelte';
	import Reference from './views/Reference.svelte';

	let engine = $state<Engine | null>(null);
	let loadError = $state<string | null>(null);

	loadEngine()
		.then((e) => (engine = e))
		.catch((err) => (loadError = String(err)));

	const NAV: { route: Route; label: string }[] = [
		{ route: 'playground', label: 'Playground' },
		{ route: 'gallery', label: 'Gallery' },
		{ route: 'mutations', label: 'Mutation Lab' },
		{ route: 'reference', label: 'Codon Reference' },
		{ route: 'about', label: 'About' },
	];
</script>

<header class="app-header">
	<div class="brand">
		🧬 CodonCanvas <span class="tag">RUST · WASM</span>
	</div>
	<nav class="main-nav">
		{#each NAV as item (item.route)}
			<button
				class:active={router.current === item.route}
				onclick={() => router.go(item.route)}
			>
				{item.label}
			</button>
		{/each}
	</nav>
</header>

<main>
	{#if loadError}
		<div class="panel">
			<h2>Engine failed to load</h2>
			<p class="diag error">{loadError}</p>
			<p class="muted">
				Build the WASM module first: <code class="mono"
				>npm run build:wasm</code>.
			</p>
		</div>
	{:else if !engine}
		<div class="panel">
			<p class="muted">Loading the WebAssembly engine…</p>
		</div>
	{:else if router.current === 'playground'}
		<Playground {engine} />
	{:else if router.current === 'gallery'}
		<Gallery {engine} />
	{:else if router.current === 'mutations'}
		<MutationLab {engine} />
	{:else if router.current === 'reference'}
		<Reference {engine} />
	{:else}
		<About {engine} />
	{/if}
</main>

<footer class="app-footer">
	CodonCanvas — DNA-inspired visual programming.
	{#if engine}Engine v{engine.version()} (Rust → WebAssembly).{/if}
	Write codons, watch a stack VM paint them.
</footer>
