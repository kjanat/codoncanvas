/**
 * Tests for generate-screenshots.ts script
 *
 * Tests the NodeCanvasRenderer class that implements the Renderer interface
 */

import { describe, expect, test } from "bun:test";
import { NodeCanvasRenderer } from "@/scripts/generate-screenshots";

describe("generate-screenshots script", () => {
  describe("NodeCanvasRenderer", () => {
    describe("initialization", () => {
      test("creates renderer with default dimensions (400x400)", () => {
        const renderer = new NodeCanvasRenderer();
        expect(renderer.width).toBe(400);
        expect(renderer.height).toBe(400);
      });

      test("creates renderer with custom dimensions", () => {
        const renderer = new NodeCanvasRenderer(800, 600);
        expect(renderer.width).toBe(800);
        expect(renderer.height).toBe(600);
      });

      test("starts at center position", () => {
        const renderer = new NodeCanvasRenderer(400, 400);
        const transform = renderer.getCurrentTransform();
        expect(transform.x).toBe(200);
        expect(transform.y).toBe(200);
        expect(transform.rotation).toBe(0);
        expect(transform.scale).toBe(1);
      });
    });

    describe("clear", () => {
      test("resets position to center", () => {
        const renderer = new NodeCanvasRenderer(400, 400);
        renderer.translate(50, 50);
        renderer.rotate(45);
        renderer.scale(2);

        renderer.clear();

        const transform = renderer.getCurrentTransform();
        expect(transform.x).toBe(200);
        expect(transform.y).toBe(200);
        expect(transform.rotation).toBe(0);
        expect(transform.scale).toBe(1);
      });
    });

    describe("resize", () => {
      test("resets transform state", () => {
        const renderer = new NodeCanvasRenderer(400, 400);
        renderer.translate(100, 100);
        renderer.rotate(90);
        renderer.scale(3);

        renderer.resize();

        const transform = renderer.getCurrentTransform();
        expect(transform.x).toBe(200);
        expect(transform.y).toBe(200);
        expect(transform.rotation).toBe(0);
        expect(transform.scale).toBe(1);
      });
    });

    describe("shape methods", () => {
      test("circle executes without error", () => {
        const renderer = new NodeCanvasRenderer();
        expect(() => renderer.circle(50)).not.toThrow();
      });

      test("rect executes without error", () => {
        const renderer = new NodeCanvasRenderer();
        expect(() => renderer.rect(100, 60)).not.toThrow();
      });

      test("line executes without error", () => {
        const renderer = new NodeCanvasRenderer();
        expect(() => renderer.line(100)).not.toThrow();
      });

      test("triangle executes without error", () => {
        const renderer = new NodeCanvasRenderer();
        expect(() => renderer.triangle(80)).not.toThrow();
      });

      test("ellipse executes without error", () => {
        const renderer = new NodeCanvasRenderer();
        expect(() => renderer.ellipse(50, 30)).not.toThrow();
      });

      test("noise executes without error", () => {
        const renderer = new NodeCanvasRenderer();
        expect(() => renderer.noise(42, 50)).not.toThrow();
      });
    });

    describe("transform methods", () => {
      test("translate moves position", () => {
        const renderer = new NodeCanvasRenderer(400, 400);
        renderer.translate(50, 30);

        const transform = renderer.getCurrentTransform();
        expect(transform.x).toBe(250);
        expect(transform.y).toBe(230);
      });

      test("setPosition sets absolute position", () => {
        const renderer = new NodeCanvasRenderer();
        renderer.setPosition(100, 150);

        const transform = renderer.getCurrentTransform();
        expect(transform.x).toBe(100);
        expect(transform.y).toBe(150);
      });

      test("rotate adds to rotation", () => {
        const renderer = new NodeCanvasRenderer();
        renderer.rotate(45);
        renderer.rotate(30);

        const transform = renderer.getCurrentTransform();
        expect(transform.rotation).toBe(75);
      });

      test("setRotation sets absolute rotation", () => {
        const renderer = new NodeCanvasRenderer();
        renderer.rotate(90);
        renderer.setRotation(45);

        const transform = renderer.getCurrentTransform();
        expect(transform.rotation).toBe(45);
      });

      test("scale multiplies current scale", () => {
        const renderer = new NodeCanvasRenderer();
        renderer.scale(2);
        renderer.scale(1.5);

        const transform = renderer.getCurrentTransform();
        expect(transform.scale).toBe(3);
      });

      test("setScale sets absolute scale", () => {
        const renderer = new NodeCanvasRenderer();
        renderer.scale(5);
        renderer.setScale(2);

        const transform = renderer.getCurrentTransform();
        expect(transform.scale).toBe(2);
      });
    });

    describe("setColor", () => {
      test("executes without error", () => {
        const renderer = new NodeCanvasRenderer();
        expect(() => renderer.setColor(180, 80, 50)).not.toThrow();
      });
    });

    describe("getCurrentTransform", () => {
      test("returns current transform state", () => {
        const renderer = new NodeCanvasRenderer(400, 400);
        renderer.translate(50, 30);
        renderer.rotate(45);
        renderer.scale(2);

        const transform = renderer.getCurrentTransform();
        expect(transform.x).toBe(250);
        expect(transform.y).toBe(230);
        expect(transform.rotation).toBe(45);
        expect(transform.scale).toBe(2);
      });
    });

    describe("output methods", () => {
      test("toDataURL returns data URL string", () => {
        const renderer = new NodeCanvasRenderer();
        renderer.circle(50);

        const dataUrl = renderer.toDataURL();
        expect(dataUrl).toMatch(/^data:image\/png;base64,/);
      });

      test("toPNG returns Buffer", () => {
        const renderer = new NodeCanvasRenderer();
        renderer.circle(50);

        const buffer = renderer.toPNG();
        expect(buffer).toBeInstanceOf(Buffer);
        expect(buffer.length).toBeGreaterThan(0);
      });
    });
  });
});
