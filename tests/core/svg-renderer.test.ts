/**
 * Tests for SVGRenderer
 */

import { describe, expect, test } from "bun:test";
import { SVGRenderer } from "@/core";

describe("SVGRenderer", () => {
  describe("initialization", () => {
    test("creates renderer with correct dimensions", () => {
      const renderer = new SVGRenderer(400, 300);

      expect(renderer.width).toBe(400);
      expect(renderer.height).toBe(300);
    });

    test("starts at center position", () => {
      const renderer = new SVGRenderer(400, 400);
      const transform = renderer.getCurrentTransform();

      expect(transform.x).toBe(200);
      expect(transform.y).toBe(200);
      expect(transform.rotation).toBe(0);
      expect(transform.scale).toBe(1);
    });
  });

  describe("shapes", () => {
    test("circle creates SVG circle element", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.setColor(0, 100, 50);
      renderer.circle(50);

      const svg = renderer.toSVG();
      expect(svg).toContain("<circle");
      expect(svg).toContain('r="50"');
      expect(svg).toContain("hsl(0, 100%, 50%)");
    });

    test("rect creates SVG rect element", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.rect(100, 60);

      const svg = renderer.toSVG();
      expect(svg).toContain("<rect");
      expect(svg).toContain('width="100"');
      expect(svg).toContain('height="60"');
    });

    test("line creates SVG line element", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.line(100);

      const svg = renderer.toSVG();
      expect(svg).toContain("<line");
      expect(svg).toContain('x2="100"');
    });

    test("triangle creates SVG polygon element", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.triangle(80);

      const svg = renderer.toSVG();
      expect(svg).toContain("<polygon");
      expect(svg).toContain("points=");
    });

    test("ellipse creates SVG ellipse element", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.ellipse(60, 40);

      const svg = renderer.toSVG();
      expect(svg).toContain("<ellipse");
      expect(svg).toContain('rx="60"');
      expect(svg).toContain('ry="40"');
    });

    test("noise creates group of rects", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.noise(42, 10);

      const svg = renderer.toSVG();
      expect(svg).toContain("<g");
      expect(svg).toContain("<rect");
    });
  });

  describe("transforms", () => {
    test("translate moves position", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.translate(50, 30);

      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(250);
      expect(transform.y).toBe(230);
    });

    test("setPosition sets absolute position", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.setPosition(100, 100);

      const transform = renderer.getCurrentTransform();
      expect(transform.x).toBe(100);
      expect(transform.y).toBe(100);
    });

    test("rotate adds to rotation", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.rotate(45);
      renderer.rotate(30);

      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(75);
    });

    test("setRotation sets absolute rotation", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.rotate(45);
      renderer.setRotation(90);

      const transform = renderer.getCurrentTransform();
      expect(transform.rotation).toBe(90);
    });

    test("scale multiplies scale factor", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.scale(2);
      renderer.scale(1.5);

      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(3);
    });

    test("setScale sets absolute scale", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.scale(2);
      renderer.setScale(0.5);

      const transform = renderer.getCurrentTransform();
      expect(transform.scale).toBe(0.5);
    });

    test("transforms are included in element attributes", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.translate(50, 50);
      renderer.rotate(45);
      renderer.scale(2);
      renderer.circle(30);

      const svg = renderer.toSVG();
      expect(svg).toContain("translate(250, 250)");
      expect(svg).toContain("rotate(45)");
      expect(svg).toContain("scale(2)");
    });
  });

  describe("color", () => {
    test("setColor changes fill and stroke", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.setColor(120, 80, 50);
      renderer.circle(30);

      const svg = renderer.toSVG();
      expect(svg).toContain("hsl(120, 80%, 50%)");
    });
  });

  describe("clear", () => {
    test("clear removes all elements", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.circle(30);
      renderer.rect(50, 50);
      renderer.clear();

      const svg = renderer.toSVG();
      expect(svg).not.toContain("<circle");
      expect(svg).not.toContain("<rect");
    });

    test("clear resets transforms", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.translate(100, 100);
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

  describe("output", () => {
    test("toSVG returns valid SVG document", () => {
      const renderer = new SVGRenderer(400, 300);
      renderer.circle(50);

      const svg = renderer.toSVG();
      expect(svg).toMatch(/^<svg/);
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(svg).toContain('width="400"');
      expect(svg).toContain('height="300"');
      expect(svg).toContain('viewBox="0 0 400 300"');
      expect(svg).toMatch(/<\/svg>$/);
    });

    test("toDataURL returns base64 data URL", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.circle(50);

      const dataUrl = renderer.toDataURL();
      expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    test("multiple shapes are included in order", () => {
      const renderer = new SVGRenderer(400, 400);
      renderer.circle(30);
      renderer.rect(50, 50);
      renderer.line(100);

      const svg = renderer.toSVG();
      const circleIdx = svg.indexOf("<circle");
      const rectIdx = svg.indexOf("<rect");
      const lineIdx = svg.indexOf("<line");

      expect(circleIdx).toBeLessThan(rectIdx);
      expect(rectIdx).toBeLessThan(lineIdx);
    });
  });
});
