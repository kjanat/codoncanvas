/**
 * Diff viewer component for comparing genomes
 * Provides side-by-side visualization with highlighting
 */

import { compareGenomes, MutationResult } from './mutations';
import { CodonLexer } from './lexer';
import { Canvas2DRenderer } from './renderer';
import { CodonVM } from './vm';

export interface DiffViewOptions {
  containerElement: HTMLElement;
  showCanvas?: boolean;
  highlightColor?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

export class DiffViewer {
  private container: HTMLElement;
  private options: Required<DiffViewOptions>;
  private lexer: CodonLexer;

  constructor(options: DiffViewOptions) {
    this.container = options.containerElement;
    this.options = {
      containerElement: options.containerElement,
      showCanvas: options.showCanvas ?? true,
      highlightColor: options.highlightColor ?? '#ff6b6b',
      canvasWidth: options.canvasWidth ?? 300,
      canvasHeight: options.canvasHeight ?? 300
    };
    this.lexer = new CodonLexer();
  }

  /**
   * Render diff comparison from mutation result
   */
  renderMutation(result: MutationResult): void {
    const comparison = compareGenomes(result.original, result.mutated);
    this.render(result.original, result.mutated, result.type, result.description, comparison.differences);
  }

  /**
   * Render diff comparison between two genomes
   */
  renderComparison(original: string, mutated: string, title: string = 'Genome Comparison'): void {
    const comparison = compareGenomes(original, mutated);
    this.render(original, mutated, 'point', title, comparison.differences);
  }

  private render(
    original: string,
    mutated: string,
    mutationType: string,
    description: string,
    differences: Array<{ position: number; original: string; mutated: string }>
  ): void {
    const comparison = compareGenomes(original, mutated);

    const html = `
      <div class="diff-viewer">
        <div class="diff-header">
          <h3>${description}</h3>
          <div class="diff-stats">
            <span class="badge mutation-${mutationType}">${mutationType}</span>
            <span class="diff-count">${differences.length} codon${differences.length !== 1 ? 's' : ''} changed</span>
          </div>
        </div>

        <div class="diff-content">
          <div class="diff-panel">
            <div class="diff-panel-header">Original</div>
            <div class="diff-codons">
              ${this.renderCodons(comparison.originalCodons, differences.map(d => ({ pos: d.position, type: 'removed' })))}
            </div>
          </div>

          <div class="diff-panel">
            <div class="diff-panel-header">Mutated</div>
            <div class="diff-codons">
              ${this.renderCodons(comparison.mutatedCodons, differences.map(d => ({ pos: d.position, type: 'added' })))}
            </div>
          </div>
        </div>

        ${this.options.showCanvas ? this.renderCanvasDiff(original, mutated) : ''}

        <div class="diff-details">
          ${this.renderDifferencesList(differences)}
        </div>
      </div>
    `;

    this.container.innerHTML = html;

    // Render canvases if enabled
    if (this.options.showCanvas) {
      this.renderCanvasOutputs(original, mutated);
    }
  }

  private renderCodons(codons: string[], highlights: Array<{ pos: number; type: string }>): string {
    return codons
      .map((codon, i) => {
        const highlight = highlights.find(h => h.pos === i);
        const className = highlight ? `codon-${highlight.type}` : '';
        return `<span class="codon ${className}">${codon}</span>`;
      })
      .join(' ');
  }

  private renderCanvasDiff(original: string, mutated: string): string {
    return `
      <div class="diff-canvas-container">
        <div class="canvas-wrapper">
          <div class="canvas-label">Original Output</div>
          <canvas id="diff-canvas-original" width="${this.options.canvasWidth}" height="${this.options.canvasHeight}"></canvas>
        </div>
        <div class="canvas-wrapper">
          <div class="canvas-label">Mutated Output</div>
          <canvas id="diff-canvas-mutated" width="${this.options.canvasWidth}" height="${this.options.canvasHeight}"></canvas>
        </div>
      </div>
    `;
  }

  private renderCanvasOutputs(original: string, mutated: string): void {
    try {
      const originalCanvas = this.container.querySelector('#diff-canvas-original') as HTMLCanvasElement;
      const mutatedCanvas = this.container.querySelector('#diff-canvas-mutated') as HTMLCanvasElement;

      if (!originalCanvas || !mutatedCanvas) {
return;
}

      // Render original
      const originalRenderer = new Canvas2DRenderer(originalCanvas);
      const originalVM = new CodonVM(originalRenderer);
      const originalTokens = this.lexer.tokenize(original);
      originalVM.run(originalTokens);

      // Render mutated
      const mutatedRenderer = new Canvas2DRenderer(mutatedCanvas);
      const mutatedVM = new CodonVM(mutatedRenderer);
      const mutatedTokens = this.lexer.tokenize(mutated);
      mutatedVM.run(mutatedTokens);

    } catch (error) {
      console.error('Failed to render canvas outputs:', error);
    }
  }

  private renderDifferencesList(differences: Array<{ position: number; original: string; mutated: string }>): string {
    if (differences.length === 0) {
      return '<div class="no-differences">No differences found</div>';
    }

    return `
      <h4>Changes at codon level:</h4>
      <ul class="differences-list">
        ${differences.map(diff => `
          <li>
            Position ${diff.position}:
            <code class="codon-removed">${diff.original || '(deleted)'}</code>
            →
            <code class="codon-added">${diff.mutated || '(inserted)'}</code>
          </li>
        `).join('')}
      </ul>
    `;
  }

  /**
   * Clear the diff viewer
   */
  clear(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Default styles for diff viewer (inject into document head)
 */
export function injectDiffViewerStyles(): void {
  if (document.getElementById('diff-viewer-styles')) {
return;
}

  const style = document.createElement('style');
  style.id = 'diff-viewer-styles';
  style.textContent = `
    .diff-viewer {
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      background: #1e1e1e;
      color: #d4d4d4;
      padding: 1rem;
      border-radius: 4px;
    }

    .diff-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #3e3e42;
    }

    .diff-header h3 {
      margin: 0;
      font-size: 1.125rem;
      color: #4ec9b0;
    }

    .diff-stats {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      font-size: 0.875rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 3px;
      font-weight: bold;
      text-transform: uppercase;
      font-size: 0.75rem;
    }

    .mutation-silent { background: #89d185; color: #1e1e1e; }
    .mutation-missense { background: #f48771; color: #1e1e1e; }
    .mutation-nonsense { background: #ff6b6b; color: white; }
    .mutation-point { background: #ffa94d; color: #1e1e1e; }
    .mutation-insertion { background: #a991f7; color: white; }
    .mutation-deletion { background: #ff8787; color: white; }
    .mutation-frameshift { background: #ff6b6b; color: white; }

    .diff-count {
      color: #858585;
    }

    .diff-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .diff-panel {
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      overflow: hidden;
    }

    .diff-panel-header {
      background: #2d2d30;
      padding: 0.5rem;
      font-weight: bold;
      border-bottom: 1px solid #3e3e42;
      text-align: center;
    }

    .diff-codons {
      padding: 1rem;
      line-height: 2;
      font-size: 14px;
      min-height: 100px;
    }

    .codon {
      display: inline-block;
      padding: 0.125rem 0.25rem;
      border-radius: 2px;
    }

    .codon-removed {
      background: rgba(255, 107, 107, 0.3);
      border: 1px solid #ff6b6b;
    }

    .codon-added {
      background: rgba(137, 209, 133, 0.3);
      border: 1px solid #89d185;
    }

    .diff-canvas-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .canvas-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .canvas-label {
      font-size: 0.875rem;
      color: #858585;
    }

    .canvas-wrapper canvas {
      border: 1px solid #3e3e42;
      background: white;
      border-radius: 4px;
    }

    .diff-details {
      background: #252526;
      border: 1px solid #3e3e42;
      border-radius: 4px;
      padding: 1rem;
    }

    .diff-details h4 {
      margin: 0 0 0.5rem 0;
      font-size: 0.875rem;
      color: #4ec9b0;
    }

    .differences-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .differences-list li {
      padding: 0.5rem;
      margin-bottom: 0.25rem;
      background: #1e1e1e;
      border-radius: 3px;
      font-size: 0.875rem;
    }

    .differences-list code {
      padding: 0.125rem 0.25rem;
      border-radius: 2px;
      font-family: inherit;
    }

    .no-differences {
      text-align: center;
      color: #858585;
      padding: 1rem;
    }
  `;

  document.head.appendChild(style);
}
