// Replays engine draw commands onto a 2D canvas. This mirrors the original
// Canvas2DRenderer: each command applies translate -> rotate -> scale and then
// draws its primitive centered at the origin, both filled and stroked.

import type { DrawCommand, RunResult } from './engine/index.js';

const TAU = Math.PI * 2;

function drawShape(ctx: CanvasRenderingContext2D, cmd: DrawCommand): void {
	const { shape } = cmd;
	ctx.beginPath();
	switch (shape.kind) {
		case 'circle':
			ctx.arc(0, 0, Math.abs(shape.radius), 0, TAU);
			ctx.fill();
			ctx.stroke();
			break;
		case 'rect':
			ctx.rect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
			ctx.fill();
			ctx.stroke();
			break;
		case 'line':
			ctx.moveTo(-shape.length / 2, 0);
			ctx.lineTo(shape.length / 2, 0);
			ctx.stroke();
			break;
		case 'triangle': {
			const h = (shape.size * Math.sqrt(3)) / 2;
			ctx.moveTo(0, -h / 2);
			ctx.lineTo(-shape.size / 2, h / 2);
			ctx.lineTo(shape.size / 2, h / 2);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();
			break;
		}
		case 'ellipse':
			ctx.ellipse(0, 0, Math.abs(shape.rx), Math.abs(shape.ry), 0, 0, TAU);
			ctx.fill();
			ctx.stroke();
			break;
	}
}

/**
 * Renders a run result. When `count` is given, only the first `count` draw
 * commands are painted — used by the timeline scrubber to show partial state.
 */
export function renderRun(
	canvas: HTMLCanvasElement,
	result: RunResult,
	count?: number,
): void {
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.lineWidth = 1.5;

	const limit = count ?? result.commands.length;
	for (let i = 0; i < limit && i < result.commands.length; i++) {
		const cmd = result.commands[i];
		const { x, y, rotation, scale } = cmd.transform;
		const color = `hsl(${cmd.color.h}, ${cmd.color.s}%, ${cmd.color.l}%)`;

		ctx.save();
		ctx.translate(x, y);
		ctx.rotate((rotation * Math.PI) / 180);
		ctx.scale(scale, scale);
		ctx.fillStyle = color;
		ctx.strokeStyle = color;
		drawShape(ctx, cmd);
		ctx.restore();
	}
}
