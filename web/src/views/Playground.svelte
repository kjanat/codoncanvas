<script lang="ts">
	import CanvasView from '../lib/components/CanvasView.svelte';
	import type {
		Diagnostic,
		Engine,
		Example,
		RunResult,
	} from '../lib/engine/index.js';
	import {
		genomeFromLocation,
		parseGenomeFile,
		saveGenome,
		savePng,
		shareUrl,
	} from '../lib/genome-io.js';
	import { genomeStore } from '../lib/state.svelte.js';

	interface Props {
		engine: Engine;
	}
	let { engine }: Props = $props();

	const SIZE = 600;

	let genome = $state(genomeFromLocation() ?? genomeStore.value);
	const examples = $derived<Example[]>(engine.examples());
	let selectedExample = $state('');

	// Live recompute on every edit — the WASM engine is fast enough.
	const result = $derived<RunResult>(engine.run(genome, SIZE, SIZE));
	const diagnostics = $derived<Diagnostic[]>(engine.validate(genome));

	// Timeline: `stepValue === steps.length` means "show the whole drawing".
	let stepValue = $state(Number.MAX_SAFE_INTEGER);
	let playing = $state(false);
	let fps = $state(4);

	$effect(() => {
		// Reset to "show all" and stop playback whenever the program changes.
		void result;
		stepValue = result.steps.length;
		playing = false;
	});

	$effect(() => {
		if (!playing) return;
		const id = setInterval(() => {
			if (stepValue >= result.steps.length) {
				playing = false;
			} else {
				stepValue += 1;
			}
		}, 1000 / fps);
		return () => clearInterval(id);
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

	let canvasView: ReturnType<typeof CanvasView> | undefined = $state();
	let fileInput: HTMLInputElement | undefined = $state();
	let shareMsg = $state('');

	function loadExample(id: string): void {
		const ex = examples.find((e) => e.id === id);
		if (ex) genome = ex.genome;
	}

	function togglePlay(): void {
		if (playing) {
			playing = false;
		} else {
			if (showAll || stepValue >= result.steps.length) stepValue = 0;
			playing = true;
		}
	}

	function exportPng(): void {
		const canvas = canvasView?.getCanvas();
		if (canvas) savePng(canvas, 'codoncanvas');
	}

	async function share(): Promise<void> {
		const url = shareUrl(genome);
		try {
			await navigator.clipboard.writeText(url);
			shareMsg = 'Link copied!';
		} catch {
			shareMsg = url;
		}
		setTimeout(() => (shareMsg = ''), 2500);
	}

	async function onFile(event: Event): Promise<void> {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		try {
			genome = parseGenomeFile(await file.text());
		} catch (e) {
			shareMsg = `Load failed: ${e instanceof Error ? e.message : e}`;
			setTimeout(() => (shareMsg = ''), 3000);
		}
		if (fileInput) fileInput.value = '';
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

		<div class="row" style="margin-bottom: 0.6rem">
			<button onclick={() => saveGenome(genome)}>💾 Save</button>
			<button onclick={() => fileInput?.click()}>📂 Load</button>
			<button onclick={exportPng}>🖼️ PNG</button>
			<button onclick={share}>🔗 Share</button>
			{#if shareMsg}<span class="muted mono" style="font-size: 0.8rem">{
					shareMsg
				}</span>{/if}
			<input
				type="file"
				accept=".genome, .json, .txt"
				bind:this={fileInput}
				onchange={onFile}
				hidden
			>
		</div>

		<textarea bind:value={genome} rows="16" spellcheck="false"></textarea>

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
		<CanvasView
			bind:this={canvasView}
			{result}
			size={SIZE}
			count={shownCount}
		/>

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
			<div class="row">
				<button onclick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
					{playing ? '⏸ Pause' : '▶ Play'}
				</button>
				<label class="row" style="gap: 0.3rem; font-size: 0.8rem">
					speed
					<select bind:value={fps}>
						<option value={2}>2 fps</option>
						<option value={4}>4 fps</option>
						<option value={8}>8 fps</option>
						<option value={16}>16 fps</option>
					</select>
				</label>
				<input
					type="range"
					min="0"
					max={result.steps.length}
					bind:value={stepValue}
					style="flex: 1; min-width: 120px"
					aria-label="Execution step"
				>
			</div>
			{#if currentStep}
				<div class="row mono" style="font-size: 0.85rem; margin-top: 0.4rem">
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
				<p class="muted" style="font-size: 0.85rem; margin-top: 0.4rem">
					Showing the full drawing — drag or press play to step through
					execution like a ribosome translating the genome.
				</p>
			{/if}
		</div>
	</section>
</div>
