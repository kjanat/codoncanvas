// Typed wrapper around the generated wasm-bindgen module. Initializes the WASM
// instance exactly once and exposes the engine functions with proper types.
//
// `./pkg` is produced by `scripts/build-wasm.sh` (run via `npm run build:wasm`).
// Vite resolves the `new URL('codoncanvas_bg.wasm', import.meta.url)` inside the
// generated glue, so no extra wasm plugin is needed.

import init, * as wasm from './pkg/codoncanvas.js';
import type {
	CodonDiff,
	CodonInfo,
	Example,
	MutationResult,
	MutationType,
	RunResult,
	TokenizeResult,
} from './types.js';

export * from './types.js';

export interface Engine {
	run(source: string, width: number, height: number): RunResult;
	tokenize(source: string): TokenizeResult;
	validate(source: string): import('./types.js').Diagnostic[];
	mutate(genome: string, kind: MutationType, seed?: number): MutationResult;
	compare(original: string, mutated: string): CodonDiff[];
	codonInfo(codon: string): CodonInfo;
	codonChart(): CodonInfo[];
	examples(): Example[];
	decodeLiteral(codon: string): number;
	version(): string;
}

let enginePromise: Promise<Engine> | null = null;

/** Loads (once) and returns the engine. Safe to call from many components. */
export function loadEngine(): Promise<Engine> {
	if (!enginePromise) {
		enginePromise = init().then(() => engine);
	}
	return enginePromise;
}

const randomSeed = () => Math.floor(Math.random() * 0xffff_ffff) >>> 0;

const engine: Engine = {
	run: (source, width, height) => wasm.run(source, width, height) as RunResult,
	tokenize: (source) => wasm.tokenize(source) as TokenizeResult,
	validate: (source) => wasm.validate(source) as import('./types.js').Diagnostic[],
	mutate: (genome, kind, seed) => wasm.mutate(genome, kind, seed ?? randomSeed()) as MutationResult,
	compare: (original, mutated) => wasm.compare(original, mutated) as CodonDiff[],
	codonInfo: (codon) => wasm.codon_info(codon) as CodonInfo,
	codonChart: () => wasm.codon_chart() as CodonInfo[],
	examples: () => wasm.examples() as Example[],
	decodeLiteral: (codon) => wasm.decode_literal(codon),
	version: () => wasm.version(),
};
