/**
 * @fileoverview SVG rendering implementation for CodonCanvas
 *
 * Provides the {@link SVGRenderer} implementation for generating
 * vector graphics output from CodonCanvas programs.
 *
 * @module core/svg-renderer
 */

import type { Renderer, TransformState } from "./renderer";
import { SeededRandom } from "./renderer";

/**
 * SVG rendering implementation.
 * Renders CodonCanvas programs to SVG vector graphics.
 *
 * Unlike Canvas2DRenderer which draws to pixels, SVGRenderer builds
 * a list of SVG elements that can be serialized to an SVG string.
 * This produces scalable vector output suitable for print and editing.
 *
 * @example
 * ```typescript
 * const renderer = new SVGRenderer(400, 400);
 * renderer.setColor(200, 80, 50);
 * renderer.circle(50);
 * const svgString = renderer.toSVG();
 * ```
 */
export class SVGRenderer implements Renderer {
  private elements: string[] = [];
  private currentX: number;
  private currentY: number;
  private currentRotation: number = 0;
  private currentScale: number = 1;
  private currentColor: string = "hsl(0, 0%, 0%)";

  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.currentX = width / 2;
    this.currentY = height / 2;
  }

  clear(): void {
    this.elements = [];
    this.currentX = this.width / 2;
    this.currentY = this.height / 2;
    this.currentRotation = 0;
    this.currentScale = 1;
  }

  private getTransformAttr(): string {
    const parts: string[] = [];
    parts.push(`translate(${this.currentX}, ${this.currentY})`);
    if (this.currentRotation !== 0) {
      parts.push(`rotate(${this.currentRotation})`);
    }
    if (this.currentScale !== 1) {
      parts.push(`scale(${this.currentScale})`);
    }
    return parts.join(" ");
  }

  private addElement(element: string): void {
    this.elements.push(element);
  }

  circle(radius: number): void {
    const transform = this.getTransformAttr();
    this.addElement(
      `<circle cx="0" cy="0" r="${radius}" ` +
        `fill="${this.currentColor}" stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  rect(width: number, height: number): void {
    const transform = this.getTransformAttr();
    this.addElement(
      `<rect x="${-width / 2}" y="${-height / 2}" ` +
        `width="${width}" height="${height}" ` +
        `fill="${this.currentColor}" stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  line(length: number): void {
    const transform = this.getTransformAttr();
    this.addElement(
      `<line x1="0" y1="0" x2="${length}" y2="0" ` +
        `stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  triangle(size: number): void {
    const h = (size * Math.sqrt(3)) / 2;
    const points = `0,${-h / 2} ${-size / 2},${h / 2} ${size / 2},${h / 2}`;
    const transform = this.getTransformAttr();
    this.addElement(
      `<polygon points="${points}" ` +
        `fill="${this.currentColor}" stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  ellipse(rx: number, ry: number): void {
    const transform = this.getTransformAttr();
    this.addElement(
      `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" ` +
        `fill="${this.currentColor}" stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  noise(seed: number, intensity: number): void {
    const radius = (intensity / 64) * this.width;
    const dotCount = Math.floor(intensity * 5) + 10;
    const rng = new SeededRandom(seed);
    const transform = this.getTransformAttr();

    const dots: string[] = [];
    for (let i = 0; i < dotCount; i++) {
      let px: number;
      let py: number;
      do {
        px = (rng.next() * 2 - 1) * radius;
        py = (rng.next() * 2 - 1) * radius;
      } while (px * px + py * py > radius * radius);

      dots.push(
        `<rect x="${px}" y="${py}" width="1" height="1" fill="${this.currentColor}"/>`,
      );
    }

    this.addElement(`<g transform="${transform}">${dots.join("")}</g>`);
  }

  setPosition(x: number, y: number): void {
    this.currentX = x;
    this.currentY = y;
  }

  translate(dx: number, dy: number): void {
    this.currentX += dx;
    this.currentY += dy;
  }

  setRotation(degrees: number): void {
    this.currentRotation = degrees;
  }

  rotate(degrees: number): void {
    this.currentRotation += degrees;
  }

  setScale(scale: number): void {
    this.currentScale = scale;
  }

  scale(factor: number): void {
    this.currentScale *= factor;
  }

  setColor(h: number, s: number, l: number): void {
    this.currentColor = `hsl(${h}, ${s}%, ${l}%)`;
  }

  getCurrentTransform(): TransformState {
    return {
      x: this.currentX,
      y: this.currentY,
      rotation: this.currentRotation,
      scale: this.currentScale,
    };
  }

  /**
   * Get the SVG as a string.
   * @returns Complete SVG document as string
   */
  toSVG(): string {
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" ` +
      `width="${this.width}" height="${this.height}" ` +
      `viewBox="0 0 ${this.width} ${this.height}">` +
      this.elements.join("") +
      `</svg>`
    );
  }

  /**
   * Get the SVG as a data URL.
   * @returns Base64-encoded SVG data URL
   */
  toDataURL(): string {
    const svg = this.toSVG();
    // Convert UTF-8 string to base64 safely
    const bytes = new TextEncoder().encode(svg);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return `data:image/svg+xml;base64,${base64}`;
  }
}
