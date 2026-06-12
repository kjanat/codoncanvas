<script lang="ts">
	import CanvasView from '../lib/components/CanvasView.svelte';
	import type {
		Diagnostic,
		Engine,
		Example,
		RunResult,
	} from '../lib/engine/index.js';
	import { genomeStore } from '../lib/state.svelte.js';

	interface Props {
		engine: Engine;
	}
	let { engine }: Props = $props();

	const SIZE = 600;

	let genome = $state(genomeStore.value);
	const examples = $derived<Example[]>(engine.examples());
	let selectedExample = $state('');

	// Live recompute on every edit — the WASM engine is fast enough.
	const result = $derived<RunResult>(engine.run(genome, SIZE, SIZE));
	const diagnostics = $derived<Diagnostic[]>(engine.validate(genome));

	// Timeline: `stepValue === steps.length` means "show the whole drawing".
	let stepValue = $state(Number.MAX_SAFE_INTEGER);
	$effect(() => {
		// Reset to "show all" whenever the program changes.
		void result;
		stepValue = result.steps.length;
	});

	const showAll = $derived(stepValue >= result.steps.length);
	const shownCount = $derived(
		showAll
			? result.commands.length
			: result.steps[stepValue]?.command_count ?? 0,
	);
	const currentStep = $derived(
		showAll ? null : result.steps[stepValue] ?? null,
	);

	function loadExample(id: string): void {
		const ex = examples.find((e) => e.id === id);
		if (ex) {
			genome = ex.genome;
			genomeStore.set(genome);
		}
	}

	$effect(() => {
		genomeStore.set(genome);
	});
</script>

<div class="grid-2">
	<section class="panel">
		<div
			class="row"
			style="justify-content: space-between; margin-bottom: 0.7rem"
		>
			<h2>Editor</h2>
			<div class="row">
				<select
					bind:value={selectedExample}
					onchange={() => loadExample(selectedExample)}
				>
					<option value="" disabled selected>Load an example…</option>
					{#each examples as ex (ex.id)}
						<option value={ex.id}>{ex.title}</option>
					{/each}
				</select>
			</div>
		</div>

		<textarea bind:value={genome} rows="18" spellcheck="false"></textarea>

		<div style="margin-top: 0.9rem">
			<h3>Diagnostics</h3>
			{#if result.error}
				<div class="diag error">⛔ {result.error}</div>
			{/if}
			{#if diagnostics.length === 0 && !result.error}
				<p class="muted">No issues. {result.commands.length} shape(s) drawn.</p>
			{:else}
				{#each diagnostics as d (d.message + d.position)}
					<div class="diag {d.severity}">
						{d.severity === 'error' ? '⛔' : '⚠️'}
						{d.message}
						<span class="muted">— {d.fix}</span>
					</div>
				{/each}
			{/if}
		</div>
	</section>

	<section class="panel">
		<h2>Canvas</h2>
		<CanvasView {result} size={SIZE} count={shownCount} />

		<div style="margin-top: 0.9rem">
			<div class="row" style="justify-content: space-between">
				<h3 style="margin: 0">Timeline</h3>
				<span class="muted mono">
					{
						showAll
						? `${result.steps.length} steps`
						: `step ${stepValue + 1} / ${result.steps.length}`
					}
				</span>
			</div>
			<input
				type="range"
				min="0"
				max={result.steps.length}
				bind:value={stepValue}
				style="width: 100%"
			>
			{#if currentStep}
				<div class="row mono" style="font-size: 0.85rem">
					<span class="badge">#{currentStep.index}</span>
					<strong>{currentStep.codon}</strong>
					<span class="muted">{currentStep.opcode}</span>
					{#if currentStep.push_value !== undefined}
						<span class="muted">= {currentStep.push_value}</span>
					{/if}
				</div>
				<div style="margin-top: 0.4rem">
					<span class="muted" style="font-size: 0.8rem">stack:</span>
					<div class="stack-view">
						{#if currentStep.stack.length === 0}
							<span class="muted">empty</span>
						{:else}
							{#each currentStep.stack as v, i (i)}
								<span class="stack-cell">{v}</span>
							{/each}
						{/if}
					</div>
				</div>
			{:else}
				<p class="muted" style="font-size: 0.85rem">
					Showing the full drawing — drag to step through execution like a
					ribosome translating the genome.
				</p>
			{/if}
		</div>
	</section>
</div>
