import { beforeEach, describe, expect, test } from "bun:test";
import { Canvas2DRenderer, CanvasContextError } from "@/core";

/**
 * Mock Canvas 2D Context for testing rendering operations.
 * Tracks method calls without actual canvas rendering.
 */
class MockCanvasContext implements Partial<CanvasRenderingContext2D> {
  public operations: string[] = [];
  public fillStyle: string | CanvasGradient | CanvasPattern = "#000";
  public strokeStyle: string | CanvasGradient | CanvasPattern = "#000";
  public savedStates: number = 0;

  public canvas = {
    width: 400,
    height: 400,
    toDataURL: () => "data:image/png;base64,mock",
  } as HTMLCanvasElement;

  clearRect(x: number, y: number, w: number, h: number): void {
    this.operations.push(`clearRect(${x},${y},${w},${h})`);
  }

  save(): void {
    this.operations.push("save()");
    this.savedStates++;
  }

  restore(): void {
    this.operations.push("restore()");
    this.savedStates--;
  }

  translate(x: number, y: number): void {
    this.operations.push(`translate(${x},${y})`);
  }

  rotate(angle: number): void {
    this.operations.push(`rotate(${angle})`);
  }

  scale(x: number, y: number): void {
    this.operations.push(`scale(${x},${y})`);
  }

  beginPath(): void {
    this.operations.push("beginPath()");
  }

  arc(x: number, y: number, r: number, start: number, end: number): void {
    this.operations.push(`arc(${x},${y},${r},${start},${end})`);
  }

  rect(x: number, y: number, w: number, h: number): void {
    this.operations.push(`rect(${x},${y},${w},${h})`);
  }

  moveTo(x: number, y: number): void {
    this.operations.push(`moveTo(${x},${y})`);
  }

  lineTo(x: number, y: number): void {
    this.operations.push(`lineTo(${x},${y})`);
  }

  ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rot: number,
    start: number,
    end: number,
  ): void {
    this.operations.push(
      `ellipse(${x},${y},${rx},${ry},${rot},${start},${end})`,
    );
  }

  closePath(): void {
    this.operations.push("closePath()");
  }

  fill(): void {
    this.operations.push("fill()");
  }

  stroke(): void {
    this.operations.push("stroke()");
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.operations.push(`fillRect(${x},${y},${w},${h})`);
  }
}

/**
 * Create mock canvas element with mocked 2D context.
 */
function createMockCanvas(): {
  canvas: HTMLCanvasElement;
  ctx: MockCanvasContext;
} {
  const ctx = new MockCanvasContext();
  const canvas = {
    width: 400,
    height: 400,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;

  return { canvas, ctx };
}

describe("Canvas2DRenderer", () => {
  let renderer: Canvas2DRenderer;
  let ctx: MockCanvasContext;

  beforeEach(() => {
    const { canvas, ctx: mockCtx } = createMockCanvas();
    ctx = mockCtx;
    renderer = new Canvas2DRenderer(canvas);
  });

  describe("initialization", () => {
    test("sets dimensions from canvas", () => {
      expect(renderer.width).toBe(400);
      expect(renderer.height).toBe(400);
    });

    test("initializes position at canvas center", () => {
      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(200); // 400/2
      expect(transform.y).toBe(200);
    });

    test("initializes rotation to 0", () => {
      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(0);
    });

    test("initializes scale to 1", () => {
      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(1);
    });

    test("throws CanvasContextError when canvas context unavailable", () => {
      const badCanvas = {
        getContext: () => null,
      } as unknown as HTMLCanvasElement;

      expect(() => new Canvas2DRenderer(badCanvas)).toThrow(
        "Could not get 2D context",
      );
    });

    test("thrown error is instance of CanvasContextError", () => {
      const badCanvas = {
        getContext: () => null,
      } as unknown as HTMLCanvasElement;

      let caughtError: unknown;
      try {
        new Canvas2DRenderer(badCanvas);
      } catch (e) {
        caughtError = e;
      }

      expect(caughtError).toBeInstanceOf(CanvasContextError);
      expect((caughtError as CanvasContextError).name).toBe(
        "CanvasContextError",
      );
    });
  });

  describe("clear()", () => {
    test("clears entire canvas", () => {
      renderer.clear();

      expect(ctx.operations).toContain("clearRect(0,0,400,400)");
    });

    test("resets position to center", () => {
      renderer.translate(50, 50);
      renderer.clear();

      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(200);
      expect(transform.y).toBe(200);
    });

    test("resets rotation to 0", () => {
      renderer.rotate(45);
      renderer.clear();

      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(0);
    });

    test("resets scale to 1", () => {
      renderer.scale(2);
      renderer.clear();

      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(1);
    });
  });

  describe("circle()", () => {
    test("draws circle with correct radius", () => {
      renderer.circle(50);

      const arcCall = ctx.operations.find((op) => op.startsWith("arc("));
      expect(arcCall).toBeDefined();
      expect(arcCall).toContain("arc(0,0,50,"); // radius 50
    });

    test("applies transform before drawing", () => {
      renderer.circle(25);

      const saveIndex = ctx.operations.indexOf("save()");
      const arcIndex = ctx.operations.findIndex((op) => op.startsWith("arc("));

      expect(saveIndex).toBeLessThan(arcIndex);
    });

    test("restores transform after drawing", () => {
      renderer.circle(25);

      const arcIndex = ctx.operations.findIndex((op) => op.startsWith("arc("));
      const restoreIndex = ctx.operations.indexOf("restore()");

      expect(arcIndex).toBeLessThan(restoreIndex);
    });

    test("fills and strokes the circle", () => {
      renderer.circle(25);

      expect(ctx.operations).toContain("fill()");
      expect(ctx.operations).toContain("stroke()");
    });
  });

  describe("rect()", () => {
    test("draws rectangle with correct dimensions", () => {
      renderer.rect(100, 50);

      const rectCall = ctx.operations.find((op) => op.startsWith("rect("));
      expect(rectCall).toBeDefined();
      // Centered: -width/2, -height/2
      expect(rectCall).toContain("rect(-50,-25,100,50)");
    });

    test("centers rectangle at current position", () => {
      renderer.rect(60, 40);

      const rectCall = ctx.operations.find((op) => op.startsWith("rect("));
      expect(rectCall).toContain("rect(-30,-20,60,40)");
    });

    test("applies and restores transform", () => {
      renderer.rect(50, 50);

      expect(ctx.operations).toContain("save()");
      expect(ctx.operations).toContain("restore()");
    });
  });

  describe("line()", () => {
    test("draws line with correct length (center-anchored)", () => {
      renderer.line(100);

      const moveCall = ctx.operations.find((op) => op.startsWith("moveTo("));
      const lineCall = ctx.operations.find((op) => op.startsWith("lineTo("));

      // Line is center-anchored: from -length/2 to +length/2
      expect(moveCall).toBe("moveTo(-50,0)");
      expect(lineCall).toBe("lineTo(50,0)");
    });

    test("strokes the line", () => {
      renderer.line(50);

      expect(ctx.operations).toContain("stroke()");
    });

    test("applies transform for rotation", () => {
      renderer.line(75);

      expect(ctx.operations).toContain("save()");
      expect(ctx.operations).toContain("restore()");
    });
  });

  describe("triangle()", () => {
    test("draws equilateral triangle", () => {
      renderer.triangle(60);

      const moveCall = ctx.operations.find((op) => op.startsWith("moveTo("));
      expect(moveCall).toBeDefined();
      expect(ctx.operations).toContain("closePath()");
    });

    test("uses correct geometry for equilateral triangle", () => {
      const size = 60;
      const _height = (size * Math.sqrt(3)) / 2;

      renderer.triangle(size);

      // Should have moveTo and two lineTo calls
      const moves = ctx.operations.filter(
        (op) => op.startsWith("moveTo(") || op.startsWith("lineTo("),
      );
      expect(moves).toHaveLength(3);
    });

    test("fills and strokes triangle", () => {
      renderer.triangle(40);

      expect(ctx.operations).toContain("fill()");
      expect(ctx.operations).toContain("stroke()");
    });
  });

  describe("ellipse()", () => {
    test("draws ellipse with correct radii", () => {
      renderer.ellipse(50, 30);

      const ellipseCall = ctx.operations.find((op) =>
        op.startsWith("ellipse("),
      );
      expect(ellipseCall).toContain("ellipse(0,0,50,30,");
    });

    test("fills and strokes ellipse", () => {
      renderer.ellipse(40, 20);

      expect(ctx.operations).toContain("fill()");
      expect(ctx.operations).toContain("stroke()");
    });

    test("applies transform", () => {
      renderer.ellipse(30, 15);

      expect(ctx.operations).toContain("save()");
      expect(ctx.operations).toContain("restore()");
    });
  });

  describe("noise()", () => {
    test("generates deterministic output with same seed", () => {
      renderer.noise(42, 10);
      const ops1 = [...ctx.operations];

      ctx.operations = [];
      renderer.noise(42, 10);
      const ops2 = [...ctx.operations];

      // Same seed should produce identical operations
      expect(ops1).toEqual(ops2);
    });

    test("generates different output with different seeds", () => {
      renderer.noise(42, 10);
      const ops1 = [...ctx.operations];

      ctx.operations = [];
      renderer.noise(999, 10);
      const ops2 = [...ctx.operations];

      // Different seeds should produce different operations
      expect(ops1).not.toEqual(ops2);
    });

    test("scales dot count with intensity", () => {
      renderer.noise(1, 5);
      const lowIntensity = ctx.operations.filter((op) =>
        op.startsWith("fillRect("),
      ).length;

      ctx.operations = [];
      renderer.noise(1, 50);
      const highIntensity = ctx.operations.filter((op) =>
        op.startsWith("fillRect("),
      ).length;

      expect(highIntensity).toBeGreaterThan(lowIntensity);
    });

    test("applies transform", () => {
      renderer.noise(1, 10);

      expect(ctx.operations).toContain("save()");
      expect(ctx.operations).toContain("restore()");
    });
  });

  describe("translate()", () => {
    test("moves position by dx, dy", () => {
      renderer.translate(50, 30);

      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(250); // 200 + 50
      expect(transform.y).toBe(230); // 200 + 30
    });

    test("accumulates multiple translations", () => {
      renderer.translate(20, 10);
      renderer.translate(30, 15);

      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(250); // 200 + 20 + 30
      expect(transform.y).toBe(225); // 200 + 10 + 15
    });

    test("handles negative offsets", () => {
      renderer.translate(-50, -30);

      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(150);
      expect(transform.y).toBe(170);
    });
  });

  describe("rotate()", () => {
    test("rotates by degrees", () => {
      renderer.rotate(45);

      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(45);
    });

    test("accumulates multiple rotations", () => {
      renderer.rotate(30);
      renderer.rotate(15);

      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(45);
    });

    test("handles negative angles", () => {
      renderer.rotate(-90);

      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(-90);
    });

    test("allows rotation beyond 360 degrees", () => {
      renderer.rotate(400);

      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(400);
    });
  });

  describe("scale()", () => {
    test("scales by factor", () => {
      renderer.scale(2);

      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(2);
    });

    test("accumulates multiple scale operations", () => {
      renderer.scale(2);
      renderer.scale(1.5);

      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(3); // 2 * 1.5
    });

    test("handles scale factor less than 1", () => {
      renderer.scale(0.5);

      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(0.5);
    });

    test("allows scale factor of 0", () => {
      renderer.scale(0);

      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(0);
    });
  });

  describe("setColor()", () => {
    test("sets HSL color correctly", () => {
      renderer.setColor(200, 80, 50);

      expect(ctx.fillStyle).toBe("hsl(200, 80%, 50%)");
      expect(ctx.strokeStyle).toBe("hsl(200, 80%, 50%)");
    });

    test("accepts full hue range (0-360)", () => {
      renderer.setColor(360, 100, 50);

      expect(ctx.fillStyle).toBe("hsl(360, 100%, 50%)");
    });

    test("accepts full saturation range (0-100)", () => {
      renderer.setColor(180, 0, 50);

      expect(ctx.fillStyle).toBe("hsl(180, 0%, 50%)");
    });

    test("accepts full lightness range (0-100)", () => {
      renderer.setColor(120, 50, 100);

      expect(ctx.fillStyle).toBe("hsl(120, 50%, 100%)");
    });

    test("sets both fill and stroke styles", () => {
      renderer.setColor(90, 70, 60);

      expect(ctx.fillStyle).toBe(ctx.strokeStyle);
    });
  });

  describe("getCurrentTransform()", () => {
    test("returns current transform state", () => {
      renderer.translate(50, 30);
      renderer.rotate(45);
      renderer.scale(2);

      const transform = renderer.getCurrentTransform();

      expect(transform.x).toBe(250);
      expect(transform.y).toBe(230);
      expect(transform.rotation).toBe(45);
      expect(transform.scale).toBe(2);
    });

    test("returns independent copy of state", () => {
      const t1 = renderer.getCurrentTransform();
      t1.x = 999;

      const t2 = renderer.getCurrentTransform();
      expect(t2.x).not.toBe(999);
    });
  });

  describe("toDataURL()", () => {
    test("returns data URL from canvas", () => {
      const url = renderer.toDataURL();

      expect(url).toBe("data:image/png;base64,mock");
    });
  });

  describe("transform combinations", () => {
    test("translate then rotate affects drawing position", () => {
      renderer.translate(100, 0);
      renderer.rotate(90);
      renderer.circle(10);

      // Should have translate and rotate calls in canvas operations
      const translateCall = ctx.operations.find((op) =>
        op.includes("translate(300,200)"),
      ); // 200+100, 200+0
      const rotateCall = ctx.operations.find((op) => op.includes("rotate("));

      expect(translateCall).toBeDefined();
      expect(rotateCall).toBeDefined();
    });

    test("scale affects subsequent drawing sizes", () => {
      renderer.scale(2);
      renderer.circle(25);

      const scaleCall = ctx.operations.find((op) => op.includes("scale(2,2)"));
      expect(scaleCall).toBeDefined();
    });

    test("multiple transforms apply cumulatively", () => {
      renderer.translate(10, 20);
      renderer.rotate(30);
      renderer.scale(1.5);

      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(210);
      expect(transform.y).toBe(220);
      expect(transform.rotation).toBe(30);
      expect(transform.scale).toBe(1.5);
    });
  });

  describe("transform state isolation", () => {
    test("each drawing operation saves and restores transform", () => {
      renderer.circle(10);

      expect(ctx.savedStates).toBe(0); // Should be balanced
    });

    test("multiple drawings maintain independent transforms", () => {
      renderer.circle(10);
      renderer.rect(20, 20);
      renderer.triangle(15);

      // All saves should be balanced with restores
      expect(ctx.savedStates).toBe(0);
    });
  });

  describe("numeric validation for transforms", () => {
    test("translate handles NaN by using 0", () => {
      renderer.translate(Number.NaN, Number.POSITIVE_INFINITY);

      const transform = renderer.getCurrentTransform();
      // Center (200,200) + safeNum(NaN,Infinity) = (200,200)
      expect(transform.x).toBe(200);
      expect(transform.y).toBe(200);
    });

    test("setPosition handles NaN/Infinity by using 0", () => {
      renderer.setPosition(Number.NaN, Number.NEGATIVE_INFINITY);

      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(0);
      expect(transform.y).toBe(0);
    });

    test("rotate handles NaN by using 0", () => {
      renderer.rotate(45);
      renderer.rotate(Number.NaN);

      const transform = renderer.getCurrentTransform();
      // 45 + safeNum(NaN) = 45 + 0 = 45
      expect(transform.rotation).toBe(45);
    });

    test("setRotation handles Infinity by using 0", () => {
      renderer.rotate(90);
      renderer.setRotation(Number.POSITIVE_INFINITY);

      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(0);
    });

    test("scale handles NaN by using 0 (multiplies to 0)", () => {
      renderer.scale(2);
      renderer.scale(Number.NaN);

      const transform = renderer.getCurrentTransform();
      // 2 * safeNum(NaN) = 2 * 0 = 0
      expect(transform.scale).toBe(0);
    });

    test("setScale handles Infinity by using 0", () => {
      renderer.scale(5);
      renderer.setScale(Number.NEGATIVE_INFINITY);

      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(0);
    });
  });
});
