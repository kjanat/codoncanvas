<script lang="ts">
	import { type Engine, loadEngine } from './lib/engine/index.js';
	import { type Route, router } from './lib/router.svelte.js';
	import About from './views/About.svelte';
	import EvolutionLab from './views/EvolutionLab.svelte';
	import Gallery from './views/Gallery.svelte';
	import MutationLab from './views/MutationLab.svelte';
	import Playground from './views/Playground.svelte';
	import Reference from './views/Reference.svelte';

	let engine = $state<Engine | null>(null);
	let loadError = $state<string | null>(null);
	let menuOpen = $state(false);

	loadEngine()
		.then((e) => (engine = e))
		.catch((err) => (loadError = String(err)));

	const NAV: { route: Route; label: string }[] = [
		{ route: 'playground', label: 'Playground' },
		{ route: 'gallery', label: 'Gallery' },
		{ route: 'mutations', label: 'Mutation Lab' },
		{ route: 'evolution', label: 'Evolution Lab' },
		{ route: 'reference', label: 'Codon Reference' },
		{ route: 'about', label: 'About' },
	];

	function navigate(route: Route): void {
		router.go(route);
		menuOpen = false;
	}
</script>

<header class="app-header">
	<div class="brand">
		🧬 CodonCanvas <span class="tag">RUST · WASM</span>
	</div>
	<button
		class="nav-toggle"
		aria-label="Toggle navigation"
		aria-expanded={menuOpen}
		onclick={() => (menuOpen = !menuOpen)}
	>
		☰
	</button>
	<nav class="main-nav" class:open={menuOpen} aria-label="Primary">
		{#each NAV as item (item.route)}
			<button
				class:active={router.current === item.route}
				aria-current={router.current === item.route ? 'page' : undefined}
				onclick={() => navigate(item.route)}
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
	{:else if router.current === 'evolution'}
		<EvolutionLab {engine} />
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
