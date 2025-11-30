/**
 * Tests for renderer factory
 */

import { describe, expect, test } from "bun:test";
import { Canvas2DRenderer, createRenderer, SVGRenderer } from "@/core";

class MockCanvasContext {
  fillStyle: string = "#000";
  strokeStyle: string = "#000";
  canvas = { width: 400, height: 300, toDataURL: () => "data:mock" };
  clearRect(): void {}
  save(): void {}
  restore(): void {}
  translate(): void {}
  rotate(): void {}
  scale(): void {}
  beginPath(): void {}
  arc(): void {}
  rect(): void {}
  moveTo(): void {}
  lineTo(): void {}
  ellipse(): void {}
  closePath(): void {}
  fill(): void {}
  stroke(): void {}
  fillRect(): void {}
}

function createMockCanvas(width = 400, height = 300): HTMLCanvasElement {
  const ctx = new MockCanvasContext();
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  return {
    width,
    height,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
}

describe("createRenderer", () => {
  describe("canvas type", () => {
    test("creates Canvas2DRenderer when type is canvas", () => {
      const canvas = createMockCanvas();
      const renderer = createRenderer({
        type: "canvas",
        width: 400,
        height: 300,
        canvas,
      });

      expect(renderer).toBeInstanceOf(Canvas2DRenderer);
    });

    test("uses canvas element dimensions", () => {
      const canvas = createMockCanvas(500, 400);
      const renderer = createRenderer({
        type: "canvas",
        width: 100, // ignored for canvas type
        height: 100, // ignored for canvas type
        canvas,
      });

      expect(renderer.width).toBe(500);
      expect(renderer.height).toBe(400);
    });

    test("throws error when canvas element is missing", () => {
      expect(() =>
        createRenderer({
          type: "canvas",
          width: 400,
          height: 300,
        }),
      ).toThrow("Canvas renderer requires canvas element");
    });

    test("throws error when canvas is undefined", () => {
      expect(() =>
        createRenderer({
          type: "canvas",
          width: 400,
          height: 300,
          canvas: undefined,
        }),
      ).toThrow("Canvas renderer requires canvas element");
    });
  });

  describe("svg type", () => {
    test("creates SVGRenderer when type is svg", () => {
      const renderer = createRenderer({
        type: "svg",
        width: 400,
        height: 300,
      });

      expect(renderer).toBeInstanceOf(SVGRenderer);
    });

    test("uses provided width and height", () => {
      const renderer = createRenderer({
        type: "svg",
        width: 800,
        height: 600,
      });

      expect(renderer.width).toBe(800);
      expect(renderer.height).toBe(600);
    });

    test("ignores canvas element for svg type", () => {
      const canvas = createMockCanvas();
      const renderer = createRenderer({
        type: "svg",
        width: 400,
        height: 300,
        canvas, // should be ignored
      });

      expect(renderer).toBeInstanceOf(SVGRenderer);
    });
  });

  describe("unknown type", () => {
    test("throws error for unknown renderer type", () => {
      expect(() =>
        createRenderer({
          type: "webgl" as "canvas",
          width: 400,
          height: 300,
        }),
      ).toThrow("Unknown renderer type: webgl");
    });
  });

  describe("renderer interface compliance", () => {
    test("canvas renderer implements Renderer interface", () => {
      const canvas = createMockCanvas();
      const renderer = createRenderer({
        type: "canvas",
        width: 400,
        height: 300,
        canvas,
      });

      expect(typeof renderer.clear).toBe("function");
      expect(typeof renderer.circle).toBe("function");
      expect(typeof renderer.rect).toBe("function");
      expect(typeof renderer.line).toBe("function");
      expect(typeof renderer.triangle).toBe("function");
      expect(typeof renderer.ellipse).toBe("function");
      expect(typeof renderer.noise).toBe("function");
      expect(typeof renderer.setColor).toBe("function");
      expect(typeof renderer.translate).toBe("function");
      expect(typeof renderer.rotate).toBe("function");
      expect(typeof renderer.scale).toBe("function");
      expect(typeof renderer.getCurrentTransform).toBe("function");
    });

    test("svg renderer implements Renderer interface", () => {
      const renderer = createRenderer({
        type: "svg",
        width: 400,
        height: 300,
      });

      expect(typeof renderer.clear).toBe("function");
      expect(typeof renderer.circle).toBe("function");
      expect(typeof renderer.rect).toBe("function");
      expect(typeof renderer.line).toBe("function");
      expect(typeof renderer.triangle).toBe("function");
      expect(typeof renderer.ellipse).toBe("function");
      expect(typeof renderer.noise).toBe("function");
      expect(typeof renderer.setColor).toBe("function");
      expect(typeof renderer.translate).toBe("function");
      expect(typeof renderer.rotate).toBe("function");
      expect(typeof renderer.scale).toBe("function");
      expect(typeof renderer.getCurrentTransform).toBe("function");
    });
  });
});
