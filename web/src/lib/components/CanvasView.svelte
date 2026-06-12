<script lang="ts">
	import type { RunResult } from '../engine/index.js';
	import { renderRun } from '../render.js';

	interface Props {
		result: RunResult | null;
		/** Internal pixel resolution of the canvas (square). */
		size?: number;
		/** Render only the first `count` draw commands (timeline scrubbing). */
		count?: number;
	}

	let { result, size = 600, count }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();

	/** Exposes the underlying canvas (for PNG export) via `bind:this`. */
	export function getCanvas(): HTMLCanvasElement | undefined {
		return canvas;
	}

	$effect(() => {
		// Re-run whenever the result or step count changes.
		void result;
		void count;
		if (canvas && result) {
			renderRun(canvas, result, count);
		} else if (canvas) {
			canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
		}
	});
</script>

<canvas class="preview" bind:this={canvas} width={size} height={size}></canvas>
