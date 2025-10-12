/**
 * Timeline scrubber for step-through execution visualization
 * Allows users to see genome execution frame-by-frame like a ribosome
 */

import { VMState, CodonToken } from './types';
import { CodonLexer } from './lexer';
import { Canvas2DRenderer } from './renderer';
import { CodonVM } from './vm';
import { GifExporter } from './gif-exporter';

export interface TimelineOptions {
  containerElement: HTMLElement;
  canvasElement: HTMLCanvasElement;
  autoPlay?: boolean;
  playbackSpeed?: number; // milliseconds per step
}

export class TimelineScrubber {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: Canvas2DRenderer;
  private vm: CodonVM;
  private lexer: CodonLexer;

  private snapshots: VMState[] = [];
  private tokens: CodonToken[] = [];
  private currentStep: number = 0;
  private isPlaying: boolean = false;
  private playbackSpeed: number;
  private playbackTimer?: number;

  private controls: {
    slider?: HTMLInputElement;
    playButton?: HTMLButtonElement;
    stepBackButton?: HTMLButtonElement;
    stepForwardButton?: HTMLButtonElement;
    resetButton?: HTMLButtonElement;
    speedSelect?: HTMLSelectElement;
    stepDisplay?: HTMLElement;
    stackDisplay?: HTMLElement;
    instructionDisplay?: HTMLElement;
  } = {};

  constructor(options: TimelineOptions) {
    this.container = options.containerElement;
    this.canvas = options.canvasElement;
    this.renderer = new Canvas2DRenderer(this.canvas);
    this.vm = new CodonVM(this.renderer);
    this.lexer = new CodonLexer();
    this.playbackSpeed = options.playbackSpeed ?? 500;

    this.initializeUI();
  }

  /**
   * Load a genome and prepare for execution
   */
  loadGenome(genome: string): void {
    try {
      this.tokens = this.lexer.tokenize(genome);
      this.snapshots = this.vm.run(this.tokens);
      this.currentStep = 0;
      this.isPlaying = false;

      this.updateUI();
      this.renderStep(0);

    } catch (error) {
      console.error('Failed to load genome:', error);
      throw error;
    }
  }

  /**
   * Initialize UI controls
   */
  private initializeUI(): void {
    const html = `
      <div class="timeline-scrubber">
        <div class="timeline-info">
          <div class="info-item">
            <span class="info-label">Step:</span>
            <span id="timeline-step-display" class="info-value">0 / 0</span>
          </div>
          <div class="info-item">
            <span class="info-label">Instruction:</span>
            <code id="timeline-instruction-display" class="info-value">-</code>
          </div>
          <div class="info-item">
            <span class="info-label">Stack:</span>
            <code id="timeline-stack-display" class="info-value">[]</code>
          </div>
        </div>

        <div class="timeline-controls">
          <button id="timeline-reset" class="control-btn" title="Reset to start">⏮</button>
          <button id="timeline-step-back" class="control-btn" title="Step back">⏪</button>
          <button id="timeline-play" class="control-btn primary" title="Play/Pause">▶</button>
          <button id="timeline-step-forward" class="control-btn" title="Step forward">⏩</button>
          <select id="timeline-speed" class="speed-select" title="Playback speed">
            <option value="100">0.1x</option>
            <option value="250">0.25x</option>
            <option value="500" selected>0.5x</option>
            <option value="1000">1x</option>
            <option value="2000">2x</option>
          </select>
        </div>

        <div class="timeline-slider-container">
          <input
            type="range"
            id="timeline-slider"
            class="timeline-slider"
            min="0"
            max="0"
            value="0"
            step="1"
          />
          <div id="timeline-markers" class="timeline-markers"></div>
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    // Get control elements
    this.controls.slider = this.container.querySelector('#timeline-slider') as HTMLInputElement;
    this.controls.playButton = this.container.querySelector('#timeline-play') as HTMLButtonElement;
    this.controls.stepBackButton = this.container.querySelector('#timeline-step-back') as HTMLButtonElement;
    this.controls.stepForwardButton = this.container.querySelector('#timeline-step-forward') as HTMLButtonElement;
    this.controls.resetButton = this.container.querySelector('#timeline-reset') as HTMLButtonElement;
    this.controls.speedSelect = this.container.querySelector('#timeline-speed') as HTMLSelectElement;
    this.controls.stepDisplay = this.container.querySelector('#timeline-step-display') as HTMLElement;
    this.controls.stackDisplay = this.container.querySelector('#timeline-stack-display') as HTMLElement;
    this.controls.instructionDisplay = this.container.querySelector('#timeline-instruction-display') as HTMLElement;

    // Attach event listeners
    this.controls.slider?.addEventListener('input', () => this.onSliderChange());
    this.controls.playButton?.addEventListener('click', () => this.togglePlay());
    this.controls.stepBackButton?.addEventListener('click', () => this.stepBack());
    this.controls.stepForwardButton?.addEventListener('click', () => this.stepForward());
    this.controls.resetButton?.addEventListener('click', () => this.reset());
    this.controls.speedSelect?.addEventListener('change', () => this.onSpeedChange());
  }

  /**
   * Render a specific step
   */
  private renderStep(step: number): void {
    if (step < 0 || step >= this.snapshots.length) {
return;
}

    const snapshot = this.snapshots[step];
    this.vm.restore(snapshot);

    // Re-render from beginning up to this step
    this.renderer.clear();
    for (let i = 0; i <= step; i++) {
      const token = this.tokens[this.snapshots[i].instructionPointer];
      if (token) {
        // Render accumulated state
        this.vm.restore(this.snapshots[i]);
      }
    }
  }

  /**
   * Update UI elements
   */
  private updateUI(): void {
    if (!this.controls.slider || !this.controls.stepDisplay) {
return;
}

    this.controls.slider.max = String(Math.max(0, this.snapshots.length - 1));
    this.controls.slider.value = String(this.currentStep);

    this.controls.stepDisplay.textContent = `${this.currentStep + 1} / ${this.snapshots.length}`;

    if (this.currentStep < this.snapshots.length) {
      const snapshot = this.snapshots[this.currentStep];
      const token = this.tokens[snapshot.instructionPointer];

      if (this.controls.instructionDisplay) {
        this.controls.instructionDisplay.textContent = token?.text || '-';
      }

      if (this.controls.stackDisplay) {
        this.controls.stackDisplay.textContent = `[${snapshot.stack.join(', ')}]`;
      }
    }

    // Update play button
    if (this.controls.playButton) {
      this.controls.playButton.textContent = this.isPlaying ? '⏸' : '▶';
    }

    this.renderMarkers();
  }

  /**
   * Render timeline markers
   */
  private renderMarkers(): void {
    const markersContainer = this.container.querySelector('#timeline-markers');
    if (!markersContainer || this.tokens.length === 0) {
return;
}

    const markers = this.tokens.map((token, i) => {
      const position = (i / (this.tokens.length - 1)) * 100;
      return `<div class="marker" style="left: ${position}%" title="${token.text}"></div>`;
    }).join('');

    markersContainer.innerHTML = markers;
  }

  /**
   * Event handlers
   */
  private onSliderChange(): void {
    if (!this.controls.slider) {
return;
}
    this.currentStep = parseInt(this.controls.slider.value);
    this.renderStep(this.currentStep);
    this.updateUI();
  }

  private onSpeedChange(): void {
    if (!this.controls.speedSelect) {
return;
}
    this.playbackSpeed = parseInt(this.controls.speedSelect.value);
  }

  private togglePlay(): void {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.play();
    } else {
      this.pause();
    }

    this.updateUI();
  }

  private play(): void {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
    }

    this.playbackTimer = window.setInterval(() => {
      if (this.currentStep >= this.snapshots.length - 1) {
        this.pause();
        this.isPlaying = false;
        this.updateUI();
        return;
      }

      this.currentStep++;
      this.renderStep(this.currentStep);
      this.updateUI();
    }, this.playbackSpeed);
  }

  private pause(): void {
    if (this.playbackTimer) {
      clearInterval(this.playbackTimer);
      this.playbackTimer = undefined;
    }
  }

  private stepForward(): void {
    if (this.currentStep < this.snapshots.length - 1) {
      this.currentStep++;
      this.renderStep(this.currentStep);
      this.updateUI();
    }
  }

  private stepBack(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.renderStep(this.currentStep);
      this.updateUI();
    }
  }

  private reset(): void {
    this.pause();
    this.isPlaying = false;
    this.currentStep = 0;
    this.renderStep(0);
    this.updateUI();
  }

  /**
   * Clean up resources
   */
  /**
   * Export timeline animation as GIF
   */
  async exportToGif(
    options: { fps?: number; quality?: number; genomeName?: string } = {},
    onProgress?: (progress: { percent: number; currentFrame: number; totalFrames: number }) => void
  ): Promise<void> {
    const exporter = new GifExporter({
      width: this.canvas.width,
      height: this.canvas.height,
      fps: options.fps ?? 4,
      quality: options.quality ?? 10,
      repeat: 0, // loop once
    });

    // Capture frames by stepping through timeline
    const frames: HTMLCanvasElement[] = [];
    const originalStep = this.currentStep;
    const wasPlaying = this.isPlaying;

    // Pause if playing
    if (wasPlaying) {
      this.pause();
    }

    // Capture all frames
    for (let i = 0; i < this.snapshots.length; i++) {
      this.currentStep = i;
      this.renderStep(i);
      const frame = exporter.captureFrame(this.canvas);
      frames.push(frame);
    }

    // Restore original position
    this.currentStep = originalStep;
    this.renderStep(originalStep);
    this.updateUI();

    // Export to GIF
    try {
      const blob = await exporter.exportFrames(frames, onProgress);
      const filename = options.genomeName
        ? `${options.genomeName}-animation.gif`
        : 'codoncanvas-animation.gif';
      exporter.downloadGif(blob, filename);
    } catch (error) {
      console.error('GIF export failed:', error);
      throw error;
    }
  }

  destroy(): void {
    this.pause();
  }
}

/**
 * Inject timeline scrubber styles
 */
export function injectTimelineStyles(): void {
  if (document.getElementById('timeline-scrubber-styles')) {
return;
}

  const style = document.createElement('style');
  style.id = 'timeline-scrubber-styles';
  style.textContent = `
    .timeline-scrubber {
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      padding: 1rem;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    }

    .timeline-info {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #3e3e42;
      flex-wrap: wrap;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .info-label {
      color: #858585;
      font-weight: bold;
    }

    .info-value {
      color: #d4d4d4;
    }

    .info-value code {
      background: #1e1e1e;
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      color: #4ec9b0;
    }

    .timeline-controls {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      align-items: center;
    }

    .control-btn {
      background: #3e3e42;
      color: #d4d4d4;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 3px;
      cursor: pointer;
      font-size: 1rem;
      font-family: inherit;
      transition: background 0.2s;
      min-width: 40px;
    }

    .control-btn:hover {
      background: #505052;
    }

    .control-btn.primary {
      background: #0e639c;
      color: white;
    }

    .control-btn.primary:hover {
      background: #1177bb;
    }

    .speed-select {
      background: #3e3e42;
      color: #d4d4d4;
      border: 1px solid #505052;
      padding: 0.5rem;
      border-radius: 3px;
      font-family: inherit;
      cursor: pointer;
      margin-left: auto;
    }

    .timeline-slider-container {
      position: relative;
      padding-top: 1.5rem;
    }

    .timeline-slider {
      width: 100%;
      height: 8px;
      background: #1e1e1e;
      border-radius: 4px;
      outline: none;
      appearance: none;
      cursor: pointer;
    }

    .timeline-slider::-webkit-slider-thumb {
      appearance: none;
      width: 18px;
      height: 18px;
      background: #0e639c;
      border-radius: 50%;
      cursor: pointer;
    }

    .timeline-slider::-moz-range-thumb {
      width: 18px;
      height: 18px;
      background: #0e639c;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    .timeline-markers {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 20px;
      pointer-events: none;
    }

    .marker {
      position: absolute;
      width: 2px;
      height: 12px;
      background: #4ec9b0;
      transform: translateX(-50%);
    }
  `;

  document.head.appendChild(style);
}
