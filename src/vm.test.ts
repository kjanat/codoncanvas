import { beforeEach, describe, expect, test } from "vitest";
import { CodonLexer } from "./lexer";
import { Renderer } from "./renderer";
import { CodonVM } from "./vm";

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
		return "data:image/png;base64,mock";
	}

	setPosition(_x: number, _y: number): void {}
	setRotation(_degrees: number): void {}
	setScale(_scale: number): void {}
}

describe("CodonVM", () => {
	let vm: CodonVM;
	let renderer: MockRenderer;
	let lexer: CodonLexer;

	beforeEach(() => {
		renderer = new MockRenderer();
		vm = new CodonVM(renderer);
		lexer = new CodonLexer();
	});

	describe("Basic execution", () => {
		test("executes hello circle program", () => {
			const genome = "ATG GAA AAT GGA TAA";
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain("circle(18.75)"); // 3/64 * 400
		});

		test("handles PUSH opcode correctly", () => {
			const genome = "ATG GAA CCC TAA"; // PUSH 21
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(1);
			expect(vm.state.stack[0]).toBe(21);
		});

		test("decodes numeric literals correctly", () => {
			const testCases = [
				{ codon: "AAA", expected: 0 }, // 0*16 + 0*4 + 0 = 0
				{ codon: "AAT", expected: 3 }, // 0*16 + 0*4 + 3 = 3
				{ codon: "CCC", expected: 21 }, // 1*16 + 1*4 + 1 = 21
				{ codon: "TTT", expected: 63 }, // 3*16 + 3*4 + 3 = 63
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

	describe("Stack operations", () => {
		test("DUP duplicates top value", () => {
			const genome = "ATG GAA CCC ATA TAA"; // PUSH 21, DUP
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(2);
			expect(vm.state.stack[0]).toBe(21);
			expect(vm.state.stack[1]).toBe(21);
		});

		test("POP removes top value", () => {
			const genome = "ATG GAA CCC TAC TAA"; // PUSH 21, POP
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(0);
		});

		test("SWAP swaps top two values", () => {
			const genome = "ATG GAA CCC GAA AAT TGG TAA"; // PUSH 21, PUSH 3, SWAP
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(vm.state.stack).toHaveLength(2);
			expect(vm.state.stack[0]).toBe(3);
			expect(vm.state.stack[1]).toBe(21);
		});

		test("throws on stack underflow", () => {
			const genome = "ATG GGA TAA"; // CIRCLE without PUSH
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow("Stack underflow");
		});
	});

	describe("Drawing primitives", () => {
		test("draws rectangle with two values", () => {
			const genome = "ATG GAA AGG GAA AGG CCA TAA"; // PUSH 10, PUSH 10, RECT
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain("rect(62.5, 62.5)"); // 10/64 * 400
		});

		test("draws line", () => {
			const genome = "ATG GAA CCC AAA TAA"; // PUSH 21, LINE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain("line(131.25)"); // 21/64 * 400
		});
	});

	describe("Transform operations", () => {
		test("translates position", () => {
			const genome = "ATG GAA CCC GAA AAA ACA TAA"; // PUSH 21, PUSH 0, TRANSLATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain("translate(131.25, 0)");
		});

		test("rotates direction", () => {
			const genome = "ATG GAA ATT AGA TAA"; // PUSH 15, ROTATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			expect(renderer.operations).toContain("rotate(15)");
		});
	});

	describe("Advanced operations", () => {
		test("NOISE pops seed and intensity values", () => {
			const genome = "ATG GAA CCC GAA AGG CTA TAA"; // PUSH 21 (seed), PUSH 10 (intensity), NOISE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			// Should call noise with seed=21, intensity=10
			expect(renderer.operations).toContain("noise(21, 10)");

			// Stack should be empty after NOISE
			expect(vm.state.stack.length).toBe(0);
		});

		test("NOISE with different seeds produces different patterns", () => {
			const genome1 = "ATG GAA CCC GAA AGG CTA TAA"; // seed=21
			const genome2 = "ATG GAA CGC GAA AGG CTA TAA"; // seed=25

			const tokens1 = lexer.tokenize(genome1);
			const tokens2 = lexer.tokenize(genome2);

			vm.run(tokens1);
			const ops1 = [...renderer.operations];

			vm.reset();

			vm.run(tokens2);
			const ops2 = [...renderer.operations];

			// Different seeds = different noise calls
			expect(ops1).toContain("noise(21, 10)");
			expect(ops2).toContain("noise(25, 10)");
		});

		test("NOISE with same seed is reproducible", () => {
			const genome = "ATG GAA CCC GAA AGG CTA TAA"; // seed=21, intensity=10

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

		test("SAVE_STATE pushes state to stack", () => {
			const genome = "ATG TCA TAA"; // SAVE_STATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			// State stack should have one snapshot
			expect(vm.state.stateStack.length).toBe(1);
		});

		test("SAVE_STATE preserves transform state", () => {
			const genome = "ATG GAA CCC GAA AAA ACA TCA TAA"; // TRANSLATE(21, 0), SAVE_STATE
			const tokens = lexer.tokenize(genome);
			vm.run(tokens);

			const snapshot = vm.state.stateStack[0];
			expect(snapshot.position.x).not.toBe(200); // Position changed from center
		});
	});

	describe("Mutation testing", () => {
		test("silent mutation produces identical output", () => {
			const genome1 = "ATG GAA AGG GGA TAA";
			const genome2 = "ATG GAA AGG GGC TAA"; // GGA → GGC (both CIRCLE)

			const tokens1 = lexer.tokenize(genome1);
			const tokens2 = lexer.tokenize(genome2);

			vm.run(tokens1);
			const ops1 = [...renderer.operations];

			vm.reset();

			vm.run(tokens2);
			const ops2 = [...renderer.operations];

			expect(ops1).toEqual(ops2);
		});

		test("nonsense mutation truncates output", () => {
			const full = "ATG GAA AGG GGA GAA AGG GAA AGG CCA TAA";
			const truncated = "ATG GAA AGG GGA TAA"; // Early STOP

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

	describe("Error handling", () => {
		test("throws on unknown codon", () => {
			const tokens = [
				{ text: "ATG" as any, position: 0, line: 1 },
				{ text: "XXX" as any, position: 3, line: 1 },
				{ text: "TAA" as any, position: 6, line: 1 },
			];

			expect(() => vm.run(tokens)).toThrow("Unknown codon");
		});

		test("throws on PUSH at end of program", () => {
			const genome = "ATG GAA"; // PUSH without literal
			const tokens = lexer.tokenize(genome);

			expect(() => vm.run(tokens)).toThrow("missing numeric literal");
		});
	});
});
