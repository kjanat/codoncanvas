import { beforeEach, describe, expect, test } from 'vitest';
import { CodonLexer } from './lexer';
import { Renderer } from './renderer';
import { CodonVM } from './vm';

// Mock renderer for testing
class MockRenderer implements Renderer {
	readonly width = 400;
	readonly height = 400;

	private transform = { x: 200, y: 200, rotation: 0, scale: 1 };
	public operations: string[] = [];

	clear(): void {
		this.operations = [];
		this.transform = { x: 200, y: 200, rotation: 0, scale: 1 };
	}

	circle(radius: number): void {
		this.operations.push(`circle(${radius})`);
	}

	rect(width: number, height: number): void {
		this.operations.push(`rect(${width}, ${height})`);
	}

	line(length: number): void {
		this.operations.push(`line(${length})`);
	}

	triangle(size: number): void {
		this.operations.push(`triangle(${size})`);
	}

	ellipse(rx: number, ry: number): void {
		this.operations.push(`ellipse(${rx}, ${ry})`);
	}

	noise(seed: number, intensity: number): void {
		this.operations.push(`noise(${seed}, ${intensity})`);
	}

	translate(dx: number, dy: number): void {
		this.transform.x += dx;
		this.transform.y += dy;
		this.operations.push(`translate(${dx}, ${dy})`);
	}

	rotate(degrees: number): void {
		this.transform.rotation += degrees;
		this.operations.push(`rotate(${degrees})`);
	}

	scale(factor: number): void {
		this.transform.scale *= factor;
		this.operations.push(`scale(${factor})`);
	}

	setColor(h: number, s: number, l: number): void {
		this.operations.push(`color(${h}, ${s}, ${l})`);
	}

	getCurrentTransform() {
		return this.transform;
	}

	toDataURL(): string {
		return 'data:image/png;base64,mock';
	}

	setPosition(_x: number, _y: number): void {}
	setRotation(_degrees: number): void {}
	setScale(_scale: number): void {}
}

describe('CodonVM', () => {
	let vm: CodonVM;
	let renderer: MockRenderer;
	let lexer: CodonLexer;

	beforeEach(() => {
		renderer = new MockRenderer();
		vm = new CodonVM(renderer);
		lexer = new CodonLexer();
	});

	describe('Basic execution', () => {
		test('executes hello circle program', () => {
			const genome = 'ATG GAA AAT GGA TAA';
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain('circle(18.75)'); // 3/64 * 400
		});

		test('handles PUSH opcode correctly', () => {
			const genome = 'ATG GAA CCC TAA'; // PUSH 21
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(21);
		});

		test('decodes numeric literals correctly', () => {
			const testCases = [
				{ codon: 'AAA', expected: 0 }, // 0*16 + 0*4 + 0 = 0
				{ codon: 'AAT', expected: 3 }, // 0*16 + 0*4 + 3 = 3
				{ codon: 'CCC', expected: 21 }, // 1*16 + 1*4 + 1 = 21
				{ codon: 'TTT', expected: 63 }, // 3*16 + 3*4 + 3 = 63
			];

			for (const { codon, expected } of testCases) {
				const genome = `ATG GAA ${codon} TAA`;
				const tokens = lexer.tokenize(genome);
				vm.run(tokens);
				expect(vm.state.stack[0]).toBe(expected);
				vm.reset();
			}
		});
	});

	describe('Stack operations', () => {
		test('DUP duplicates top value', () => {
			const genome = 'ATG GAA CCC ATA TAA'; // PUSH 21, DUP
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(2);
			expect(vm.state.stack[0]).toBe(21);
			expect(vm.state.stack[1]).toBe(21);
		});

		test('POP removes top value', () => {
			const genome = 'ATG GAA CCC TAC TAA'; // PUSH 21, POP
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(0);
		});

		test('SWAP swaps top two values', () => {
			const genome = 'ATG GAA CCC GAA AAT TGG TAA'; // PUSH 21, PUSH 3, SWAP
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(2);
			expect(vm.state.stack[0]).toBe(3);
			expect(vm.state.stack[1]).toBe(21);
		});

		test('throws on stack underflow', () => {
			const genome = 'ATG GGA TAA'; // CIRCLE without PUSH
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow('Stack underflow');
		});
	});

	describe('Drawing primitives', () => {
		test('draws rectangle with two values', () => {
			const genome = 'ATG GAA AGG GAA AGG CCA TAA'; // PUSH 10, PUSH 10, RECT
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain('rect(62.5, 62.5)'); // 10/64 * 400
		});

		test('draws line', () => {
			const genome = 'ATG GAA CCC AAA TAA'; // PUSH 21, LINE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain('line(131.25)'); // 21/64 * 400
		});
	});

	describe('Transform operations', () => {
		test('translates position', () => {
			const genome = 'ATG GAA CCC GAA AAA ACA TAA'; // PUSH 21, PUSH 0, TRANSLATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain('translate(131.25, 0)');
		});

		test('rotates direction', () => {
			const genome = 'ATG GAA ATT AGA TAA'; // PUSH 15, ROTATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain('rotate(15)');
		});
	});

	describe('Advanced operations', () => {
		test('NOISE pops seed and intensity values', () => {
			const genome = 'ATG GAA CCC GAA AGG CTA TAA'; // PUSH 21 (seed), PUSH 10 (intensity), NOISE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			// Should call noise with seed=21, intensity=10
			expect(renderer.operations).toContain('noise(21, 10)');

			// Stack should be empty after NOISE
			expect(vm.state.stack.length).toBe(0);
		});

		test('NOISE with different seeds produces different patterns', () => {
			const genome1 = 'ATG GAA CCC GAA AGG CTA TAA'; // seed=21
			const genome2 = 'ATG GAA CGC GAA AGG CTA TAA'; // seed=25

			const tokens1 = lexer.tokenize(genome1);
			const tokens2 = lexer.tokenize(genome2);

			vm.run(tokens1);
			const ops1 = [...renderer.operations];

			vm.reset();

			vm.run(tokens2);
			const ops2 = [...renderer.operations];

			// Different seeds = different noise calls
			expect(ops1).toContain('noise(21, 10)');
			expect(ops2).toContain('noise(25, 10)');
		});

		test('NOISE with same seed is reproducible', () => {
			const genome = 'ATG GAA CCC GAA AGG CTA TAA'; // seed=21, intensity=10

			const tokens1 = lexer.tokenize(genome);
			const tokens2 = lexer.tokenize(genome);

			vm.run(tokens1);
			const ops1 = [...renderer.operations];

			vm.reset();

			vm.run(tokens2);
			const ops2 = [...renderer.operations];

			// Same genome = same operations
			expect(ops1).toEqual(ops2);
		});

		test('SAVE_STATE pushes state to stack', () => {
			const genome = 'ATG TCA TAA'; // SAVE_STATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			// State stack should have one snapshot
			expect(vm.state.stateStack.length).toBe(1);
		});

		test('SAVE_STATE preserves transform state', () => {
			const genome = 'ATG GAA CCC GAA AAA ACA TCA TAA'; // TRANSLATE(21, 0), SAVE_STATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			const snapshot = vm.state.stateStack[0];
			expect(snapshot.position.x).not.toBe(200); // Position changed from center
		});

		test('RESTORE_STATE pops state from stack', () => {
			const genome = 'ATG TCA TCG TAA'; // SAVE_STATE, RESTORE_STATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			// State stack should be empty after restore
			expect(vm.state.stateStack.length).toBe(0);
		});

		test('RESTORE_STATE restores transform state', () => {
			const genome = 'ATG TCA GAA CCC GAA AAA ACA TCG TAA'; // SAVE_STATE, TRANSLATE(21, 0), RESTORE_STATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			// Position should be back to center (200, 200)
			expect(vm.state.position.x).toBe(200);
			expect(vm.state.position.y).toBe(200);
		});

		test('RESTORE_STATE with empty stack throws error', () => {
			const genome = 'ATG TCG TAA'; // RESTORE_STATE without SAVE_STATE
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow('RESTORE_STATE with empty state stack');
		});

		test('Nested save/restore for complex compositions', () => {
			// SAVE_STATE → translate → SAVE_STATE → translate → RESTORE_STATE → RESTORE_STATE
			const genome = 'ATG TCA GAA AAT GAA AAA ACA TCA GAA AAT GAA AAA ACA TCG TCG TAA';
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			// Both states should be restored (empty stack)
			expect(vm.state.stateStack.length).toBe(0);
			// Position back to original
			expect(vm.state.position.x).toBe(200);
			expect(vm.state.position.y).toBe(200);
		});
	});

	describe('Mutation testing', () => {
		test('silent mutation produces identical output', () => {
			const genome1 = 'ATG GAA AGG GGA TAA';
			const genome2 = 'ATG GAA AGG GGC TAA'; // GGA → GGC (both CIRCLE)

			const tokens1 = lexer.tokenize(genome1);
			const tokens2 = lexer.tokenize(genome2);

			vm.run(tokens1);
			const ops1 = [...renderer.operations];

			vm.reset();

			vm.run(tokens2);
			const ops2 = [...renderer.operations];

			expect(ops1).toEqual(ops2);
		});

		test('nonsense mutation truncates output', () => {
			const full = 'ATG GAA AGG GGA GAA AGG GAA AGG CCA TAA';
			const truncated = 'ATG GAA AGG GGA TAA'; // Early STOP

			const tokensFull = lexer.tokenize(full);
			const tokensTrunc = lexer.tokenize(truncated);

			vm.run(tokensFull);
			const opsFull = renderer.operations.length;

			vm.reset();

			vm.run(tokensTrunc);
			const opsTrunc = renderer.operations.length;

			expect(opsTrunc).toBeLessThan(opsFull);
		});
	});

	describe('Arithmetic operations', () => {
		test('ADD operation', () => {
			const genome = 'ATG GAA AAC GAA AAT CTG TAA'; // PUSH 1, PUSH 3, ADD → 4
			const tokens = lexer.tokenize(genome);
			const states = vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(4);
		});

		test('MUL operation', () => {
			const genome = 'ATG GAA AAC GAA ATT CTT TAA'; // PUSH 1, PUSH 15, MUL → 15
			const tokens = lexer.tokenize(genome);
			const states = vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(15);
		});

		test('ADD with larger values', () => {
			const genome = 'ATG GAA CCC GAA AGG CTG TAA'; // PUSH 21, PUSH 10, ADD → 31
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(31);
		});

		test('MUL with larger values', () => {
			const genome = 'ATG GAA AAT GAA ACT CTT TAA'; // PUSH 3, PUSH 7, MUL → 21
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(21);
		});

		test('computed circle radius with ADD', () => {
			const genome = 'ATG GAA AAC GAA AAT CTG GGA TAA'; // PUSH 1, PUSH 3, ADD (=4), CIRCLE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toHaveLength(1);
			expect(renderer.operations[0]).toContain('circle(');
			// Circle should have radius based on 4/64 * 400 = 25
			expect(renderer.operations[0]).toContain('25');
		});

		test('computed circle radius with MUL', () => {
			const genome = 'ATG GAA AAT GAA AAT CTT GGA TAA'; // PUSH 3, PUSH 3, MUL (=9), CIRCLE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toHaveLength(1);
			expect(renderer.operations[0]).toContain('circle(');
			// Circle should have radius based on 9/64 * 400 = 56.25
		});

		test('arithmetic underflow throws error', () => {
			const genome = 'ATG GAA AAC CTG TAA'; // PUSH 1, ADD (no second value)
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow('Stack underflow');
		});

		test('chained arithmetic operations', () => {
			const genome = 'ATG GAA AAC GAA AAT CTG GAA ACT CTT TAA'; // PUSH 1, PUSH 3, ADD (=4), PUSH 7, MUL (=28)
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(28);
		});

		test('SUB operation', () => {
			const genome = 'ATG GAA AGG GAA AAT CAG TAA'; // PUSH 10, PUSH 3, SUB → 7
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(7);
		});

		test('DIV operation', () => {
			const genome = 'ATG GAA CGC GAA AGA CAT TAA'; // PUSH 25, PUSH 8, DIV → 3
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(3);
		});

		test('SUB with larger values', () => {
			const genome = 'ATG GAA TGG GAA ATT CAG TAA'; // PUSH 58, PUSH 15, SUB → 43
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(43);
		});

		test('DIV with larger values', () => {
			const genome = 'ATG GAA TCC GAA ATC CAT TAA'; // PUSH 53, PUSH 13, DIV → 4
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(4);
		});

		test('SUB resulting in negative', () => {
			const genome = 'ATG GAA ACT GAA AGG CAG TAA'; // PUSH 7, PUSH 10, SUB → -3
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(-3);
		});

		test('DIV with floor division', () => {
			const genome = 'ATG GAA AGG GAA AAT CAT TAA'; // PUSH 10, PUSH 3, DIV → 3 (10/3 = 3.33 → floor to 3)
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(3);
		});

		test('DIV by zero throws error', () => {
			const genome = 'ATG GAA AGG GAA AAA CAT TAA'; // PUSH 10, PUSH 0, DIV → error
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow('Division by zero');
		});

		test('DIV resulting in zero', () => {
			const genome = 'ATG GAA AAG GAA ACT CAT TAA'; // PUSH 2, PUSH 7, DIV → 0 (2/7 = 0.28 → floor to 0)
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(0);
		});

		test('SUB underflow throws error', () => {
			const genome = 'ATG GAA AAC CAG TAA'; // PUSH 1, SUB (no second value)
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow('Stack underflow');
		});

		test('DIV underflow throws error', () => {
			const genome = 'ATG GAA AAC CAT TAA'; // PUSH 1, DIV (no second value)
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow('Stack underflow');
		});

		test('computed circle radius via SUB', () => {
			const genome = 'ATG GAA TCC GAA AGG CAG GGA TAA'; // PUSH 52, PUSH 10, SUB (=42), CIRCLE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);
			const renderer = vm.renderer as MockRenderer;

			expect(renderer.operations).toHaveLength(1);
			expect(renderer.operations[0]).toContain('circle(');
			// Circle should have radius based on 42/64 * 400 = 262.5
		});

		test('computed circle radius via DIV', () => {
			const genome = 'ATG GAA TCC GAA AAG CAT GGA TAA'; // PUSH 52, PUSH 2, DIV (=26), CIRCLE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);
			const renderer = vm.renderer as MockRenderer;

			expect(renderer.operations).toHaveLength(1);
			expect(renderer.operations[0]).toContain('circle(');
			// Circle should have radius based on 26/64 * 400 = 162.5
		});

		test('complex arithmetic formula', () => {
			const genome = 'ATG GAA CGC GAA ACT CTG GAA CGC GAA AGA CAT CAG TAA'; // PUSH 25, PUSH 7, ADD (=32), PUSH 25, PUSH 8, DIV (=3), SUB (=29)
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(29);
		});
	});

	describe('LOOP opcode', () => {
		test('basic loop - 3 circles total', () => {
			// PUSH 10, CIRCLE, PUSH 2 (instr count=PUSH+CIRCLE), PUSH 2 (loop 2 more times), LOOP
			const genome = 'ATG GAA AGG GGA GAA AAG GAA AAG CAA TAA';
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);
			expect(renderer.operations.filter((op) => op.startsWith('circle'))).toHaveLength(3);
		});

		test('loop with zero count', () => {
			// PUSH 10, CIRCLE, PUSH 2, PUSH 0, LOOP (no additional loops)
			const genome = 'ATG GAA AGG GGA GAA AAG GAA AAA CAA TAA';
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);
			expect(renderer.operations.filter((op) => op.startsWith('circle'))).toHaveLength(1);
		});

		test('loop stack underflow throws error', () => {
			const genome = 'ATG CAA TAA';
			const tokens = lexer.tokenize(genome);
			expect(() => vm.run(tokens)).toThrow('Stack underflow');
		});

		test('loop with negative count throws error', () => {
			// PUSH 0, PUSH 5, SUB (=-5), PUSH 1, LOOP
			const genome = 'ATG GAA AAA GAA ACT CAG GAA AAC CAA TAA';
			const tokens = lexer.tokenize(genome);
			expect(() => vm.run(tokens)).toThrow('non-negative parameters');
		});

		test('loop exceeding history throws error', () => {
			// PUSH 5, PUSH 100, LOOP (tries to loop 100 instructions)
			const genome = 'ATG GAA ACT GAA TTT CAA TAA';
			const tokens = lexer.tokenize(genome);
			expect(() => vm.run(tokens)).toThrow('exceeds history length');
		});
	});

	describe('Error handling', () => {
		test('throws on unknown codon', () => {
			const tokens = [
				{ text: 'ATG' as any, position: 0, line: 1 },
				{ text: 'XXX' as any, position: 3, line: 1 },
				{ text: 'TAA' as any, position: 6, line: 1 },
			];

			expect(() => vm.run(tokens)).toThrow('Unknown codon');
		});

		test('throws on PUSH at end of program', () => {
			const genome = 'ATG GAA'; // PUSH without literal
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow('missing numeric literal');
		});
	});
});
