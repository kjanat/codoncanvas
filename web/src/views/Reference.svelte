<script lang="ts">
	import type { CodonInfo, Engine } from '../lib/engine/index.js';

	interface Props {
		engine: Engine;
	}
	let { engine }: Props = $props();

	const chart = $derived<CodonInfo[]>(engine.codonChart());
	let rna = $state(false);

	// Group by opcode for a tidy, learnable layout.
	const groups = $derived.by(() => {
		const map = new Map<string, CodonInfo[]>();
		for (const c of chart) {
			const key = c.opcode ?? '—';
			const list = map.get(key) ?? [];
			list.push(c);
			map.set(key, list);
		}
		return [...map.entries()];
	});
</script>

<div class="row" style="justify-content: space-between">
	<h2>Codon Reference</h2>
	<label class="row" style="gap: 0.4rem">
		<input type="checkbox" bind:checked={rna}> RNA notation (U)
	</label>
</div>
<p class="muted">
	All 64 codons map to an opcode. Many are synonymous (genetic redundancy); the
	real amino acid each codon encodes is shown for biological comparison.
</p>

{#each groups as [opcode, codons] (opcode)}
	<h3 style="margin-bottom: 0.4rem">{opcode}</h3>
	<div class="codon-grid" style="margin-bottom: 1rem">
		{#each codons as c (c.dna)}
			<div class="codon-cell" class:start={c.is_start} class:stop={c.is_stop}>
				<div class="dna">{rna ? c.rna : c.dna}</div>
				<div class="muted">
					aa: {c.amino_acid} · val: {c.literal_value}
				</div>
			</div>
		{/each}
	</div>
{/each}
