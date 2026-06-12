// TypeScript shapes mirroring the serde-serialized output of the Rust engine
// (engine/core). Keep these in sync with the `#[derive(Serialize)]` structs.

export interface Hsl {
	h: number;
	s: number;
	l: number;
}

export interface Transform {
	x: number;
	y: number;
	/** Degrees, clockwise. */
	rotation: number;
	scale: number;
}

export type Shape =
	| { kind: 'circle'; radius: number }
	| { kind: 'rect'; width: number; height: number }
	| { kind: 'line'; length: number }
	| { kind: 'triangle'; size: number }
	| { kind: 'ellipse'; rx: number; ry: number };

export interface DrawCommand {
	transform: Transform;
	color: Hsl;
	shape: Shape;
}

export interface Step {
	index: number;
	codon: string;
	opcode: string;
	push_value?: number;
	stack: number[];
	transform: Transform;
	color: Hsl;
	command_count: number;
	instruction_count: number;
}

export interface RunResult {
	ok: boolean;
	error?: string;
	width: number;
	height: number;
	commands: DrawCommand[];
	steps: Step[];
}

export type Severity = 'error' | 'warning';

export interface Diagnostic {
	message: string;
	position: number;
	severity: Severity;
	fix: string;
}

export interface Token {
	text: string;
	position: number;
	line: number;
}

export interface TokenizeResult {
	ok: boolean;
	tokens: Token[];
	error?: string;
}

export type MutationType =
	| 'silent'
	| 'missense'
	| 'nonsense'
	| 'point'
	| 'insertion'
	| 'deletion'
	| 'frameshift';

export interface MutationResult {
	original: string;
	mutated: string;
	type: MutationType;
	position: number;
	description: string;
}

export interface CodonDiff {
	position: number;
	original: string;
	mutated: string;
}

export interface CodonInfo {
	dna: string;
	rna: string;
	opcode: string | null;
	amino_acid: string;
	literal_value: number;
	is_start: boolean;
	is_stop: boolean;
}

export interface Example {
	id: string;
	title: string;
	description: string;
	genome: string;
	difficulty: string;
	concepts: string[];
	good_for_mutations: string[];
}
