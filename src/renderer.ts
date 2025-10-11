export interface Renderer {
  readonly width: number;
  readonly height: number;

  clear(): void;
  circle(radius: number): void;
  rect(width: number, height: number): void;
  line(length: number): void;
  triangle(size: number): void;
  ellipse(rx: number, ry: number): void;
  translate(dx: number, dy: number): void;
  rotate(degrees: number): void;
  scale(factor: number): void;
  setColor(h: number, s: number, l: number): void;
  getCurrentTransform(): { x: number; y: number; rotation: number; scale: number };
  toDataURL(): string;
}

export class Canvas2DRenderer implements Renderer {
  private ctx: CanvasRenderingContext2D;
  private currentX: number = 0;
  private currentY: number = 0;
  private currentRotation: number = 0;
  private currentScale: number = 1;

  readonly width: number;
  readonly height: number;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;
    this.width = canvas.width;
    this.height = canvas.height;

    // Initialize at center
    this.currentX = this.width / 2;
    this.currentY = this.height / 2;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.currentX = this.width / 2;
    this.currentY = this.height / 2;
    this.currentRotation = 0;
    this.currentScale = 1;
  }

  private applyTransform(): void {
    this.ctx.save();
    this.ctx.translate(this.currentX, this.currentY);
    this.ctx.rotate((this.currentRotation * Math.PI) / 180);
    this.ctx.scale(this.currentScale, this.currentScale);
  }

  private restoreTransform(): void {
    this.ctx.restore();
  }

  circle(radius: number): void {
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.restoreTransform();
  }

  rect(width: number, height: number): void {
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.rect(-width / 2, -height / 2, width, height);
    this.ctx.fill();
    this.ctx.stroke();
    this.restoreTransform();
  }

  line(length: number): void {
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(length, 0);
    this.ctx.stroke();
    this.restoreTransform();
  }

  triangle(size: number): void {
    this.applyTransform();
    const height = (size * Math.sqrt(3)) / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -height / 2);
    this.ctx.lineTo(-size / 2, height / 2);
    this.ctx.lineTo(size / 2, height / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.restoreTransform();
  }

  ellipse(rx: number, ry: number): void {
    this.applyTransform();
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();
    this.restoreTransform();
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
    const color = `hsl(${h}, ${s}%, ${l}%)`;
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
  }

  getCurrentTransform(): { x: number; y: number; rotation: number; scale: number } {
    return {
      x: this.currentX,
      y: this.currentY,
      rotation: this.currentRotation,
      scale: this.currentScale
    };
  }

  toDataURL(): string {
    return this.ctx.canvas.toDataURL();
  }
}
