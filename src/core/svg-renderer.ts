/**
 * @fileoverview SVG rendering implementation for CodonCanvas
 *
 * Provides the {@link SVGRenderer} implementation for generating
 * vector graphics output from CodonCanvas programs.
 *
 * @module core/svg-renderer
 */

import type { Renderer, TransformState } from "./renderer";
import { generateNoisePoints, safeNum } from "./renderer";

/** Minimum scale to prevent zero/negative values breaking rendering */
const MIN_SCALE = 0.001;

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

  private _width: number;
  private _height: number;

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
    this.currentX = width / 2;
    this.currentY = height / 2;
  }

  /**
   * Update renderer dimensions.
   * Recenters position and resets rotation/scale.
   * Clears existing elements.
   * @param width - New width (optional, keeps current if omitted)
   * @param height - New height (optional, keeps current if omitted)
   */
  resize(width?: number, height?: number): void {
    if (width !== undefined) this._width = width;
    if (height !== undefined) this._height = height;
    this.elements = [];
    this.currentX = this._width / 2;
    this.currentY = this._height / 2;
    this.currentRotation = 0;
    this.currentScale = 1;
  }

  clear(): void {
    this.elements = [];
    this.currentX = this._width / 2;
    this.currentY = this._height / 2;
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
    const r = safeNum(radius);
    const transform = this.getTransformAttr();
    this.addElement(
      `<circle cx="0" cy="0" r="${r}" ` +
        `fill="${this.currentColor}" stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  rect(width: number, height: number): void {
    const w = safeNum(width);
    const h = safeNum(height);
    const transform = this.getTransformAttr();
    this.addElement(
      `<rect x="${-w / 2}" y="${-h / 2}" ` +
        `width="${w}" height="${h}" ` +
        `fill="${this.currentColor}" stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  line(length: number): void {
    const len = safeNum(length);
    const transform = this.getTransformAttr();
    this.addElement(
      `<line x1="${-len / 2}" y1="0" x2="${len / 2}" y2="0" ` +
        `stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  triangle(size: number): void {
    const s = safeNum(size);
    const h = (s * Math.sqrt(3)) / 2;
    const points = `0,${-h / 2} ${-s / 2},${h / 2} ${s / 2},${h / 2}`;
    const transform = this.getTransformAttr();
    this.addElement(
      `<polygon points="${points}" ` +
        `fill="${this.currentColor}" stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  ellipse(rx: number, ry: number): void {
    const safeRx = safeNum(rx);
    const safeRy = safeNum(ry);
    const transform = this.getTransformAttr();
    this.addElement(
      `<ellipse cx="0" cy="0" rx="${safeRx}" ry="${safeRy}" ` +
        `fill="${this.currentColor}" stroke="${this.currentColor}" ` +
        `transform="${transform}"/>`,
    );
  }

  noise(seed: number, intensity: number): void {
    const points = generateNoisePoints(seed, intensity, this.width);
    const transform = this.getTransformAttr();

    const dots = points.map(
      ({ x, y }) =>
        `<rect x="${x}" y="${y}" width="1" height="1" fill="${this.currentColor}"/>`,
    );

    this.addElement(`<g transform="${transform}">${dots.join("")}</g>`);
  }

  setPosition(x: number, y: number): void {
    this.currentX = safeNum(x);
    this.currentY = safeNum(y);
  }

  translate(dx: number, dy: number): void {
    this.currentX += safeNum(dx);
    this.currentY += safeNum(dy);
  }

  setRotation(degrees: number): void {
    this.currentRotation = safeNum(degrees);
  }

  rotate(degrees: number): void {
    this.currentRotation += safeNum(degrees);
  }

  setScale(scale: number): void {
    this.currentScale = Math.max(safeNum(scale), MIN_SCALE);
  }

  scale(factor: number): void {
    this.currentScale = Math.max(
      this.currentScale * safeNum(factor),
      MIN_SCALE,
    );
  }

  setColor(h: number, s: number, l: number): void {
    const sanitizedH = safeNum(h);
    const sanitizedS = safeNum(s);
    const sanitizedL = safeNum(l);
    const safeH = ((sanitizedH % 360) + 360) % 360; // Normalize hue to 0-359
    const safeS = Math.max(0, Math.min(100, sanitizedS));
    const safeL = Math.max(0, Math.min(100, sanitizedL));
    this.currentColor = `hsl(${safeH}, ${safeS}%, ${safeL}%)`;
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
