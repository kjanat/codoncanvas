import { ExampleKey, examples, type DifficultyLevel, type Concept, ExampleMetadata } from './examples';
import { CodonLexer } from './lexer';
import { Canvas2DRenderer, type Renderer } from './renderer';
import { AudioRenderer } from './audio-renderer';
import { MIDIExporter } from './midi-exporter';
import { CodonVM } from './vm';
import { VMState } from './types';
import { downloadGenomeFile, readGenomeFile } from './genome-io';
import {
  applySilentMutation,
  applyMissenseMutation,
  applyNonsenseMutation,
  applyPointMutation,
  applyInsertion,
  applyDeletion,
  applyFrameshiftMutation,
  type MutationType
} from './mutations';
import { ShareSystem, injectShareStyles } from './share-system';
import { DiffViewer, injectDiffViewerStyles } from './diff-viewer';
import { TutorialManager, helloCircleTutorial } from './tutorial';
import { initializeTutorial } from './tutorial-ui';
import './tutorial-ui.css';
import { TimelineScrubber, injectTimelineStyles } from './timeline-scrubber';
import { ThemeManager } from './theme-manager';
import { AchievementEngine } from './achievement-engine';
import { AchievementUI } from './achievement-ui';
import './achievement-ui.css';
import { AssessmentEngine } from './assessment-engine';
import { AssessmentUI } from './assessment-ui';
import { ResearchMetrics } from './research-metrics';
import { analyzeCodonUsage, formatAnalysis, type CodonAnalysis } from './codon-analyzer';
import { predictMutationImpact, type MutationPrediction, type ImpactLevel } from './mutation-predictor';

// Get DOM elements
const editor = document.getElementById('editor') as HTMLTextAreaElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const exampleSelect = document.getElementById('exampleSelect') as HTMLSelectElement;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
const exportAudioBtn = document.getElementById('exportAudioBtn') as HTMLButtonElement;
const exportMidiBtn = document.getElementById('exportMidiBtn') as HTMLButtonElement;
const saveGenomeBtn = document.getElementById('saveGenomeBtn') as HTMLButtonElement;
const loadGenomeBtn = document.getElementById('loadGenomeBtn') as HTMLButtonElement;
const genomeFileInput = document.getElementById('genomeFileInput') as HTMLInputElement;
const statusMessage = document.getElementById('statusMessage') as HTMLSpanElement;
const codonCount = document.getElementById('codonCount') as HTMLSpanElement;
const instructionCount = document.getElementById('instructionCount') as HTMLSpanElement;
const statusBar = document.querySelector('.status-bar') as HTMLDivElement;

// Mutation buttons
const silentMutationBtn = document.getElementById('silentMutationBtn') as HTMLButtonElement;
const missenseMutationBtn = document.getElementById('missenseMutationBtn') as HTMLButtonElement;
const nonsenseMutationBtn = document.getElementById('nonsenseMutationBtn') as HTMLButtonElement;
const frameshiftMutationBtn = document.getElementById('frameshiftMutationBtn') as HTMLButtonElement;
const pointMutationBtn = document.getElementById('pointMutationBtn') as HTMLButtonElement;
const insertionMutationBtn = document.getElementById('insertionMutationBtn') as HTMLButtonElement;
const deletionMutationBtn = document.getElementById('deletionMutationBtn') as HTMLButtonElement;

// Share system
const shareContainer = document.getElementById('shareContainer') as HTMLDivElement;

// Example filter elements
const difficultyFilter = document.getElementById('difficultyFilter') as HTMLSelectElement;
const conceptFilter = document.getElementById('conceptFilter') as HTMLSelectElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const exampleInfo = document.getElementById('exampleInfo') as HTMLDivElement;

// Linter elements
const linterPanel = document.getElementById('linterPanel') as HTMLDivElement;
const linterToggle = document.getElementById('linterToggle') as HTMLButtonElement;
const linterMessages = document.getElementById('linterMessages') as HTMLDivElement;
const fixAllBtn = document.getElementById('fixAllBtn') as HTMLButtonElement;

// DiffViewer elements
const diffViewerPanel = document.getElementById('diffViewerPanel') as HTMLDivElement;
const diffViewerToggle = document.getElementById('diffViewerToggle') as HTMLButtonElement;
const diffViewerClearBtn = document.getElementById('diffViewerClearBtn') as HTMLButtonElement;
const diffViewerContainer = document.getElementById('diffViewerContainer') as HTMLDivElement;

// Analyzer elements
const analyzeBtn = document.getElementById('analyzeBtn') as HTMLButtonElement;
const analyzerPanel = document.getElementById('analyzerPanel') as HTMLDivElement;
const analyzerToggle = document.getElementById('analyzerToggle') as HTMLButtonElement;
const analyzerContent = document.getElementById('analyzerContent') as HTMLDivElement;

// Audio elements
const audioToggleBtn = document.getElementById('audioToggleBtn') as HTMLButtonElement;

// Timeline elements
const timelineToggleBtn = document.getElementById('timelineToggleBtn') as HTMLButtonElement;
const timelinePanel = document.getElementById('timelinePanel') as HTMLDivElement;
const timelineContainer = document.getElementById('timelineContainer') as HTMLDivElement;

// Theme elements
const themeToggleBtn = document.getElementById('themeToggleBtn') as HTMLButtonElement;

// Mode toggle elements
const modeToggleBtns = document.querySelectorAll('input[name="mode"]') as NodeListOf<HTMLInputElement>;
const playgroundContainer = document.getElementById('playgroundContainer') as HTMLDivElement;
const assessmentContainer = document.getElementById('assessmentContainer') as HTMLDivElement;

// Initialize lexer, renderer, and VM
const lexer = new CodonLexer();
const renderer = new Canvas2DRenderer(canvas);
const audioRenderer = new AudioRenderer();
const midiExporter = new MIDIExporter();
type RenderMode = 'visual' | 'audio' | 'both';
let renderMode: RenderMode = 'visual'; // Start with visual mode
const vm = new CodonVM(renderer);
let lastSnapshots: VMState[] = []; // Store last execution snapshots for MIDI export

// Initialize timeline scrubber
const timelineScrubber = new TimelineScrubber({
  containerElement: timelineContainer,
  canvasElement: canvas,
  autoPlay: false,
  playbackSpeed: 500,
});
let timelineVisible = false;

// Initialize theme manager
const themeManager = new ThemeManager();

// Initialize achievement system
const achievementEngine = new AchievementEngine();
const achievementUI = new AchievementUI(achievementEngine, 'achievementContainer');

// Initialize assessment system
const assessmentEngine = new AssessmentEngine();
let assessmentUI: AssessmentUI | null = null; // Initialize on first use

// Initialize research metrics (opt-in, disabled by default)
const researchMetrics = new ResearchMetrics({ enabled: false });

// Update theme button text
function updateThemeButton() {
  const icon = themeManager.getThemeIcon();
  const name = themeManager.getThemeDisplayName();
  themeToggleBtn.textContent = `${icon} ${name}`;
  themeToggleBtn.setAttribute('aria-label', `Current theme: ${name}. Click to cycle to next theme.`);
}

// Set initial button state
updateThemeButton();

function setStatus(message: string, type: 'info' | 'error' | 'success') {
  statusMessage.textContent = message;
  statusBar.className = `status-bar ${type}`;
}

function updateStats(codons: number, instructions: number) {
  codonCount.textContent = `Codons: ${codons}`;
  instructionCount.textContent = `Instructions: ${instructions}`;
}

// Track drawing operations from executed tokens
function trackDrawingOperations(tokens: { text: string }[]) {
  const allUnlocked: any[] = [];

  for (const token of tokens) {
    const codon = token.text;

    // Track shapes (CIRCLE, RECT, LINE, TRIANGLE, ELLIPSE)
    if (['GGA', 'GGC', 'GGG', 'GGT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn('CIRCLE'));
    } else if (['CCA', 'CCC', 'CCG', 'CCT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn('RECT'));
    } else if (['AAA', 'AAC', 'AAG', 'AAT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn('LINE'));
    } else if (['GCA', 'GCC', 'GCG', 'GCT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn('TRIANGLE'));
    } else if (['GTA', 'GTC', 'GTG', 'GTT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackShapeDrawn('ELLIPSE'));
    }

    // Track color usage (COLOR opcode)
    else if (['TTA', 'TTC', 'TTG', 'TTT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackColorUsed());
    }

    // Track transforms (TRANSLATE, ROTATE, SCALE)
    else if (['ACA', 'ACC', 'ACG', 'ACT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackTransformApplied('TRANSLATE'));
    } else if (['AGA', 'AGC', 'AGG', 'AGT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackTransformApplied('ROTATE'));
    } else if (['CGA', 'CGC', 'CGG', 'CGT'].includes(codon)) {
      allUnlocked.push(...achievementEngine.trackTransformApplied('SCALE'));
    }
  }

  return allUnlocked;
}

async function runProgram() {
  try {
    const source = editor.value;

    // Track genome created
    const unlocked1 = achievementEngine.trackGenomeCreated(source.replace(/\s+/g, '').length);
    achievementUI.handleUnlocks(unlocked1);

    // Research metrics tracking
    researchMetrics.trackGenomeCreated(source.replace(/\s+/g, '').length);

    // Tokenize
    const tokens = lexer.tokenize(source);
    updateStats(tokens.length, 0);

    // Validate structure
    const structureErrors = lexer.validateStructure(tokens);
    const criticalErrors = structureErrors.filter(e => e.severity === 'error');

    if (criticalErrors.length > 0) {
      setStatus(`Error: ${criticalErrors[0].message}`, 'error');
      return;
    }

    // Validate frame
    const frameErrors = lexer.validateFrame(source);
    if (frameErrors.length > 0) {
      setStatus(`Warning: ${frameErrors[0].message}`, 'error');
    }

    // Execute with appropriate renderer(s)
    if (renderMode === 'audio') {
      // Audio only mode: use AudioRenderer
      const audioVM = new CodonVM(audioRenderer);
      audioRenderer.clear();

      // Start recording for potential export
      audioRenderer.startRecording();

      audioVM.reset();
      const snapshots = audioVM.run(tokens);
      lastSnapshots = snapshots; // Store for MIDI export

      updateStats(tokens.length, audioVM.state.instructionCount);
      setStatus(`♪ Playing ${audioVM.state.instructionCount} audio instructions`, 'success');

      // Research metrics: track execution
      researchMetrics.trackGenomeExecuted({
        timestamp: Date.now(),
        renderMode: 'audio',
        genomeLength: tokens.length,
        instructionCount: audioVM.state.instructionCount,
        success: true
      });

      // Track genome execution and drawing operations
      const opcodes = tokens.map(t => t.text);
      const unlocked2 = achievementEngine.trackGenomeExecuted(opcodes);
      const unlocked3 = trackDrawingOperations(tokens);
      achievementUI.handleUnlocks([...unlocked2, ...unlocked3]);
    } else if (renderMode === 'visual') {
      // Visual only mode: use Canvas2DRenderer
      vm.reset();
      const snapshots = vm.run(tokens);
      lastSnapshots = snapshots; // Store for MIDI export

      updateStats(tokens.length, vm.state.instructionCount);
      setStatus(`Executed ${vm.state.instructionCount} instructions successfully`, 'success');

      // Research metrics: track execution
      researchMetrics.trackGenomeExecuted({
        timestamp: Date.now(),
        renderMode: 'visual',
        genomeLength: tokens.length,
        instructionCount: vm.state.instructionCount,
        success: true
      });

      // Track genome execution and drawing operations
      const opcodes = tokens.map(t => t.text);
      const unlocked2 = achievementEngine.trackGenomeExecuted(opcodes);
      const unlocked3 = trackDrawingOperations(tokens);
      achievementUI.handleUnlocks([...unlocked2, ...unlocked3]);
    } else {
      // Both mode: run both renderers simultaneously
      const audioVM = new CodonVM(audioRenderer);

      // Clear both renderers
      renderer.clear();
      audioRenderer.clear();

      // Start audio recording
      audioRenderer.startRecording();

      // Run both VMs in parallel (audio starts first for timing)
      audioVM.reset();
      vm.reset();

      // Execute both simultaneously
      const [audioSnapshots, visualSnapshots] = await Promise.all([
        Promise.resolve(audioVM.run(tokens)),
        Promise.resolve(vm.run(tokens))
      ]);
      lastSnapshots = audioSnapshots; // Store for MIDI export (use audio snapshots)

      updateStats(tokens.length, vm.state.instructionCount);
      setStatus(`♪🎨 Playing ${audioVM.state.instructionCount} audio + visual instructions`, 'success');

      // Research metrics: track execution
      researchMetrics.trackGenomeExecuted({
        timestamp: Date.now(),
        renderMode: 'both',
        genomeLength: tokens.length,
        instructionCount: audioVM.state.instructionCount,
        success: true
      });

      // Track genome execution and drawing operations
      const opcodes = tokens.map(t => t.text);
      const unlocked2 = achievementEngine.trackGenomeExecuted(opcodes);
      const unlocked3 = trackDrawingOperations(tokens);
      achievementUI.handleUnlocks([...unlocked2, ...unlocked3]);
    }

  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Error: ${error.message}`, 'error');
      researchMetrics.trackError('execution', error.message);
    } else if (Array.isArray(error)) {
      // ParseError array
      setStatus(`Error: ${error[0].message}`, 'error');
      researchMetrics.trackError('parse', error[0].message);
    } else {
      setStatus('Unknown error occurred', 'error');
      researchMetrics.trackError('unknown', 'Unknown error occurred');
    }
  }
}

function clearCanvas() {
  vm.reset();
  renderer.clear();
  setStatus('Canvas cleared', 'info');
  updateStats(0, 0);
}

function getFilteredExamples(): Array<[ExampleKey, ExampleMetadata]> {
  const difficulty = difficultyFilter.value as DifficultyLevel | '';
  const concept = conceptFilter.value as Concept | '';
  const search = searchInput.value.toLowerCase().trim();

  return Object.entries(examples).filter(([key, ex]) => {
    // Difficulty filter
    if (difficulty && ex.difficulty !== difficulty) {
return false;
}

    // Concept filter
    if (concept && !ex.concepts.includes(concept)) {
return false;
}

    // Search filter
    if (search) {
      const searchableText = [
        ex.title,
        ex.description,
        ...ex.keywords,
        ...ex.concepts
      ].join(' ').toLowerCase();

      if (!searchableText.includes(search)) {
return false;
}
    }

    return true;
  }) as Array<[ExampleKey, ExampleMetadata]>;
}

function updateExampleDropdown() {
  const filtered = getFilteredExamples();

  // Clear existing options (except first)
  exampleSelect.innerHTML = '<option value="">Load Example...</option>';

  // Group by difficulty for better UX
  const grouped = {
    beginner: [] as Array<[ExampleKey, ExampleMetadata]>,
    intermediate: [] as Array<[ExampleKey, ExampleMetadata]>,
    advanced: [] as Array<[ExampleKey, ExampleMetadata]>,
    'advanced-showcase': [] as Array<[ExampleKey, ExampleMetadata]>
  };

  filtered.forEach(([key, ex]) => {
    grouped[ex.difficulty].push([key, ex]);
  });

  // Add beginner examples
  if (grouped.beginner.length > 0) {
    const beginnerGroup = document.createElement('optgroup');
    beginnerGroup.label = '🌱 Beginner';
    grouped.beginner.forEach(([key, ex]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = ex.title;
      beginnerGroup.appendChild(option);
    });
    exampleSelect.appendChild(beginnerGroup);
  }

  // Add intermediate examples
  if (grouped.intermediate.length > 0) {
    const intermediateGroup = document.createElement('optgroup');
    intermediateGroup.label = '🌿 Intermediate';
    grouped.intermediate.forEach(([key, ex]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = ex.title;
      intermediateGroup.appendChild(option);
    });
    exampleSelect.appendChild(intermediateGroup);
  }

  // Add advanced examples
  if (grouped.advanced.length > 0) {
    const advancedGroup = document.createElement('optgroup');
    advancedGroup.label = '🌳 Advanced';
    grouped.advanced.forEach(([key, ex]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = ex.title;
      advancedGroup.appendChild(option);
    });
    exampleSelect.appendChild(advancedGroup);
  }

  // Add advanced showcase examples
  if (grouped['advanced-showcase'].length > 0) {
    const showcaseGroup = document.createElement('optgroup');
    showcaseGroup.label = '✨ Advanced Showcase';
    grouped['advanced-showcase'].forEach(([key, ex]) => {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = ex.title;
      showcaseGroup.appendChild(option);
    });
    exampleSelect.appendChild(showcaseGroup);
  }

  // Update count
  const totalCount = Object.keys(examples).length;
  const filteredCount = filtered.length;

  if (filteredCount < totalCount) {
    exampleSelect.options[0].textContent = `Load Example... (${filteredCount} of ${totalCount})`;
  }
}

function showExampleInfo(key: ExampleKey) {
  const ex = examples[key];
  if (!ex) {
    exampleInfo.style.display = 'none';
    return;
  }

  exampleInfo.innerHTML = `
    <div style="margin-bottom: 8px;">
      <strong>${ex.title}</strong>
      <span style="float: right; font-size: 0.85em; opacity: 0.7;">
        ${ex.difficulty}
      </span>
    </div>
    <div style="font-size: 0.9em; margin-bottom: 8px;">
      ${ex.description}
    </div>
    <div style="font-size: 0.85em; opacity: 0.7;">
      <div><strong>Concepts:</strong> ${ex.concepts.join(', ')}</div>
      <div><strong>Good for mutations:</strong> ${ex.goodForMutations.join(', ')}</div>
    </div>
  `;
  exampleInfo.style.display = 'block';
}

function runLinter(source: string): void {
  try {
    // Try to tokenize first
    const tokens = lexer.tokenize(source);

    // Get validation errors
    const frameErrors = lexer.validateFrame(source);
    const structErrors = lexer.validateStructure(tokens);
    const allErrors = [...frameErrors, ...structErrors];

    displayLinterErrors(allErrors);
  } catch (error) {
    // Tokenization failed - show parse error
    if (Array.isArray(error)) {
      displayLinterErrors(error);
    } else if (error instanceof Error) {
      displayLinterErrors([{
        message: error.message,
        position: 0,
        severity: 'error' as const
      }]);
    } else {
      displayLinterErrors([{
        message: 'Unknown error during linting',
        position: 0,
        severity: 'error' as const
      }]);
    }
  }
}

/**
 * Check if an error can be auto-fixed
 */
function canAutoFix(errorMessage: string): boolean {
  const fixablePatterns = [
    /Program should begin with START codon/,
    /Program should end with STOP codon/,
    /Mid-triplet break detected/,
    /Source length \d+ is not divisible by 3/
  ];
  return fixablePatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Auto-fix a linter error
 */
function autoFixError(errorMessage: string, source: string): string | null {
  // Missing START codon
  if (/Program should begin with START codon/.test(errorMessage)) {
    return 'ATG ' + source.trim();
  }

  // Missing STOP codon
  if (/Program should end with STOP codon/.test(errorMessage)) {
    return source.trim() + ' TAA';
  }

  // Mid-triplet break - remove all whitespace and re-space by triplets
  if (/Mid-triplet break detected/.test(errorMessage)) {
    const cleaned = source.replace(/\s+/g, '');
    const triplets: string[] = [];
    for (let i = 0; i < cleaned.length; i += 3) {
      triplets.push(cleaned.slice(i, i + 3));
    }
    return triplets.join(' ');
  }

  // Non-triplet length - pad with 'A' or truncate
  if (/Source length (\d+) is not divisible by 3/.test(errorMessage)) {
    const match = errorMessage.match(/Missing (\d+) bases/);
    if (match) {
      const missing = parseInt(match[1]);
      return source.trim() + 'A'.repeat(missing);
    }
  }

  return null;
}

/**
 * Apply auto-fix to editor
 */
function applyAutoFix(errorMessage: string): void {
  const source = editor.value;
  const fixed = autoFixError(errorMessage, source);

  if (fixed) {
    editor.value = fixed;
    setStatus('Applied auto-fix', 'success');
    runLinter(fixed);
  } else {
    setStatus('Could not auto-fix this error', 'error');
  }
}

/**
 * Fix all auto-fixable errors iteratively
 */
function fixAllErrors(): void {
  let source = editor.value;
  let iterations = 0;
  const maxIterations = 10; // Prevent infinite loops
  let fixedCount = 0;

  // Keep fixing until no more fixable errors or max iterations
  while (iterations < maxIterations) {
    try {
      const tokens = lexer.tokenize(source);
      const frameErrors = lexer.validateFrame(source);
      const structErrors = lexer.validateStructure(tokens);
      const allErrors = [...frameErrors, ...structErrors];

      // Find first fixable error
      const fixableError = allErrors.find(err => canAutoFix(err.message));

      if (!fixableError) {
        // No more fixable errors
        break;
      }

      // Apply fix
      const fixed = autoFixError(fixableError.message, source);
      if (fixed && fixed !== source) {
        source = fixed;
        fixedCount++;
      } else {
        // Fix didn't work, avoid infinite loop
        break;
      }
    } catch (error) {
      // Tokenization errors need fixing too
      if (error instanceof Error) {
        const fixed = autoFixError(error.message, source);
        if (fixed && fixed !== source) {
          source = fixed;
          fixedCount++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    iterations++;
  }

  if (fixedCount > 0) {
    editor.value = source;
    setStatus(`Fixed ${fixedCount} error${fixedCount > 1 ? 's' : ''}`, 'success');
    runLinter(source);
  } else {
    setStatus('No auto-fixable errors found', 'info');
  }
}

function displayLinterErrors(errors: Array<{ message: string; position: number; severity: 'error' | 'warning' | 'info' }>): void {
  if (errors.length === 0) {
    linterMessages.innerHTML = '<div style="color: #89d185;">✅ No errors found</div>';
  } else {
    const errorHTML = errors.map((err, idx) => {
      const icon = err.severity === 'error' ? '🔴' : err.severity === 'warning' ? '🟡' : 'ℹ️';
      const color = err.severity === 'error' ? '#f48771' : err.severity === 'warning' ? '#dcdcaa' : '#4ec9b0';
      const fixable = canAutoFix(err.message);
      const fixButton = fixable
        ? `<button
             class="fix-button"
             data-error-msg="${err.message.replace(/"/g, '&quot;')}"
             style="margin-left: 12px; padding: 2px 8px; background: #4ec9b0; color: #1e1e1e; border: none; border-radius: 3px; cursor: pointer; font-size: 0.85em; font-weight: 500;"
             onmouseover="this.style.background='#6dd3bb'"
             onmouseout="this.style.background='#4ec9b0'">
             Fix
           </button>`
        : '';
      return `<div style="margin-bottom: 8px; padding: 6px 8px; border-left: 3px solid ${color}; background: rgba(255,255,255,0.03); display: flex; align-items: center;">
        <span style="margin-right: 8px;">${icon}</span>
        <span style="color: ${color}; font-weight: 500;">${err.severity.toUpperCase()}</span>
        <span style="color: #d4d4d4; margin-left: 8px; flex: 1;">${err.message}</span>
        ${err.position !== undefined ? `<span style="color: #858585; margin-left: 8px; font-size: 0.9em;">(pos: ${err.position})</span>` : ''}
        ${fixButton}
      </div>`;
    }).join('');
    linterMessages.innerHTML = errorHTML;

    // Attach click handlers to Fix buttons
    const fixButtons = linterMessages.querySelectorAll('.fix-button');
    fixButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const errorMsg = (e.target as HTMLElement).getAttribute('data-error-msg');
        if (errorMsg) {
          applyAutoFix(errorMsg);
        }
      });
    });
  }
}

function toggleLinter(): void {
  const isHidden = linterPanel.style.display === 'none';

  if (isHidden) {
    linterPanel.style.display = 'block';
    linterToggle.textContent = 'Hide';
    linterToggle.setAttribute('aria-expanded', 'true');
  } else {
    linterPanel.style.display = 'none';
    linterToggle.textContent = 'Show';
    linterToggle.setAttribute('aria-expanded', 'false');
  }
}

function toggleDiffViewer(): void {
  const contentContainer = diffViewerContainer.parentElement;
  if (!contentContainer) return;

  const isHidden = contentContainer.style.display === 'none';

  if (isHidden) {
    contentContainer.style.display = 'block';
    diffViewerToggle.textContent = 'Hide';
    diffViewerToggle.setAttribute('aria-expanded', 'true');
  } else {
    contentContainer.style.display = 'none';
    diffViewerToggle.textContent = 'Show';
    diffViewerToggle.setAttribute('aria-expanded', 'false');
  }
}

function clearDiffViewer(): void {
  diffViewer.clear();
  diffViewerPanel.style.display = 'none';
  originalGenomeBeforeMutation = '';
}

function loadExample() {
  const key = exampleSelect.value as ExampleKey;
  if (key && examples[key]) {
    editor.value = examples[key].genome;
    setStatus(`Loaded: ${examples[key].title}`, 'info');
    showExampleInfo(key);
    runLinter(examples[key].genome);
    exampleSelect.value = '';
  }
}

function exportImage() {
  try {
    const dataURL = renderer.toDataURL();
    const link = document.createElement('a');
    link.download = 'codoncanvas-output.png';
    link.href = dataURL;
    link.click();
    setStatus('Image exported successfully', 'success');
  } catch (error) {
    setStatus('Failed to export image', 'error');
  }
}

function saveGenome() {
  try {
    const genome = editor.value.trim();
    if (!genome) {
      setStatus('No genome to save', 'error');
      return;
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `codoncanvas-${timestamp}`;

    // Use the genome content as title (first line or first 30 chars)
    const firstLine = genome.split('\n')[0].replace(/;.*$/, '').trim();
    const title = firstLine.slice(0, 30) || 'CodonCanvas Genome';

    downloadGenomeFile(genome, filename, {
      description: 'Created with CodonCanvas Playground',
      author: 'CodonCanvas User'
    });

    setStatus('Genome saved successfully', 'success');
  } catch (error) {
    setStatus('Failed to save genome', 'error');
  }
}

function loadGenome() {
  // Trigger hidden file input
  genomeFileInput.click();
}

async function handleFileLoad(event: Event) {
  try {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const genomeFile = await readGenomeFile(file);

    // Load genome into editor
    editor.value = genomeFile.genome;

    // Show success with metadata
    const info = genomeFile.title + (genomeFile.author ? ` by ${genomeFile.author}` : '');
    setStatus(`Loaded: ${info}`, 'success');

    // Reset file input
    input.value = '';

  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Failed to load genome: ${error.message}`, 'error');
    } else {
      setStatus('Failed to load genome', 'error');
    }

    // Reset file input
    const input = event.target as HTMLInputElement;
    input.value = '';
  }
}

function applyMutation(type: MutationType) {
  try {
    const genome = editor.value.trim();

    if (!genome) {
      setStatus('No genome to mutate', 'error');
      return;
    }

    // Store original genome before mutation
    originalGenomeBeforeMutation = genome;

    let result;

    switch (type) {
      case 'silent':
        result = applySilentMutation(genome);
        break;
      case 'missense':
        result = applyMissenseMutation(genome);
        break;
      case 'nonsense':
        result = applyNonsenseMutation(genome);
        break;
      case 'point':
        result = applyPointMutation(genome);
        break;
      case 'insertion':
        result = applyInsertion(genome);
        break;
      case 'deletion':
        result = applyDeletion(genome);
        break;
      case 'frameshift':
        result = applyFrameshiftMutation(genome);
        break;
      default:
        throw new Error(`Unknown mutation type: ${type}`);
    }

    // Update editor with mutated genome
    editor.value = result.mutated;

    // Track mutation applied
    const unlocked = achievementEngine.trackMutationApplied();
    achievementUI.handleUnlocks(unlocked);

    // Show DiffViewer with comparison
    diffViewer.renderMutation(result);
    diffViewerPanel.style.display = 'block';

    // Scroll DiffViewer into view (smooth scroll)
    diffViewerPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-run to show effect
    runProgram();

    // Show mutation info
    setStatus(`🧬 ${result.description}`, 'success');

  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Mutation failed: ${error.message}`, 'error');
    } else {
      setStatus('Mutation failed', 'error');
    }
  }
}

// Mutation preview modal functions
function injectPreviewModalStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .preview-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease-in;
    }

    .preview-modal-overlay.active {
      display: flex;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .preview-modal {
      background: var(--bg-secondary, #1e1e1e);
      border: 2px solid var(--accent-primary, #4a90e2);
      border-radius: 12px;
      padding: 24px;
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .preview-modal h3 {
      margin: 0 0 16px 0;
      color: var(--text-primary, #f0f0f0);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .preview-comparison {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 16px 0;
    }

    .preview-canvas-container {
      text-align: center;
    }

    .preview-canvas-container h4 {
      margin: 0 0 8px 0;
      font-size: 0.9em;
      color: var(--text-secondary, #ccc);
    }

    .preview-canvas {
      border: 2px solid var(--border-color, #444);
      border-radius: 8px;
      max-width: 100%;
      height: auto;
      background: var(--canvas-bg, #fff);
    }

    .preview-impact-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.9em;
      margin: 8px 0;
    }

    .preview-impact-badge.SILENT {
      background: #22c55e;
      color: #fff;
    }

    .preview-impact-badge.LOCAL {
      background: #eab308;
      color: #000;
    }

    .preview-impact-badge.MAJOR {
      background: #f97316;
      color: #fff;
    }

    .preview-impact-badge.CATASTROPHIC {
      background: #ef4444;
      color: #fff;
    }

    .preview-confidence {
      margin: 8px 0;
      color: var(--text-secondary, #ccc);
    }

    .preview-confidence-stars {
      color: #fbbf24;
      font-size: 1.2em;
    }

    .preview-description {
      margin: 12px 0;
      padding: 12px;
      background: var(--bg-tertiary, #2a2a2a);
      border-radius: 6px;
      font-size: 0.95em;
      line-height: 1.5;
      color: var(--text-primary, #f0f0f0);
    }

    .preview-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin: 12px 0;
      font-size: 0.85em;
    }

    .preview-stat {
      background: var(--bg-tertiary, #2a2a2a);
      padding: 8px;
      border-radius: 4px;
      color: var(--text-secondary, #ccc);
    }

    .preview-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
      justify-content: flex-end;
    }

    .preview-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 1em;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .preview-btn-apply {
      background: var(--accent-primary, #4a90e2);
      color: #fff;
    }

    .preview-btn-apply:hover {
      background: var(--accent-hover, #3a7bc8);
      transform: translateY(-1px);
    }

    .preview-btn-cancel {
      background: var(--bg-tertiary, #2a2a2a);
      color: var(--text-primary, #f0f0f0);
    }

    .preview-btn-cancel:hover {
      background: var(--bg-secondary, #3a3a3a);
    }
  `;
  document.head.appendChild(style);
}

function createPreviewModal() {
  const overlay = document.createElement('div');
  overlay.className = 'preview-modal-overlay';
  overlay.id = 'previewModalOverlay';
  overlay.innerHTML = `
    <div class="preview-modal" role="dialog" aria-labelledby="previewModalTitle" aria-modal="true">
      <h3 id="previewModalTitle">🔮 Mutation Preview</h3>

      <div class="preview-comparison">
        <div class="preview-canvas-container">
          <h4>Original</h4>
          <img id="previewOriginalCanvas" class="preview-canvas" alt="Original genome rendering">
        </div>
        <div class="preview-canvas-container">
          <h4>After Mutation</h4>
          <img id="previewMutatedCanvas" class="preview-canvas" alt="Mutated genome rendering">
        </div>
      </div>

      <div style="text-align: center;">
        <div class="preview-impact-badge" id="previewImpactBadge">SILENT</div>
        <div class="preview-confidence">
          Confidence: <span class="preview-confidence-stars" id="previewConfidenceStars">⭐⭐⭐</span>
          <span id="previewConfidencePercent">(95%)</span>
        </div>
      </div>

      <div class="preview-description" id="previewDescription">
        Minimal visual change - outputs nearly identical
      </div>

      <div class="preview-stats">
        <div class="preview-stat">
          <strong>Pixel Difference:</strong> <span id="previewPixelDiff">2.3%</span>
        </div>
        <div class="preview-stat">
          <strong>Shape Changes:</strong> <span id="previewShapeChanges">0</span>
        </div>
        <div class="preview-stat">
          <strong>Color Changes:</strong> <span id="previewColorChanges">No</span>
        </div>
        <div class="preview-stat">
          <strong>Position Changes:</strong> <span id="previewPositionChanges">No</span>
        </div>
      </div>

      <div class="preview-actions">
        <button class="preview-btn preview-btn-cancel" id="previewCancelBtn">Cancel</button>
        <button class="preview-btn preview-btn-apply" id="previewApplyBtn">Apply Mutation</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closePreviewModal();
    }
  });

  // Cancel button
  const cancelBtn = document.getElementById('previewCancelBtn') as HTMLButtonElement;
  cancelBtn.addEventListener('click', closePreviewModal);

  // Apply button
  const applyBtn = document.getElementById('previewApplyBtn') as HTMLButtonElement;
  applyBtn.addEventListener('click', applyPredictedMutation);

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closePreviewModal();
    }
  });
}

function showPreviewModal(prediction: MutationPrediction, mutationType: MutationType) {
  currentPrediction = prediction;
  currentMutationType = mutationType;

  const overlay = document.getElementById('previewModalOverlay') as HTMLDivElement;
  const originalCanvas = document.getElementById('previewOriginalCanvas') as HTMLImageElement;
  const mutatedCanvas = document.getElementById('previewMutatedCanvas') as HTMLImageElement;
  const impactBadge = document.getElementById('previewImpactBadge') as HTMLDivElement;
  const confidenceStars = document.getElementById('previewConfidenceStars') as HTMLSpanElement;
  const confidencePercent = document.getElementById('previewConfidencePercent') as HTMLSpanElement;
  const description = document.getElementById('previewDescription') as HTMLDivElement;
  const pixelDiff = document.getElementById('previewPixelDiff') as HTMLSpanElement;
  const shapeChanges = document.getElementById('previewShapeChanges') as HTMLSpanElement;
  const colorChanges = document.getElementById('previewColorChanges') as HTMLSpanElement;
  const positionChanges = document.getElementById('previewPositionChanges') as HTMLSpanElement;

  // Set preview images
  originalCanvas.src = prediction.originalPreview;
  mutatedCanvas.src = prediction.mutatedPreview;

  // Set impact badge
  impactBadge.textContent = `${getImpactIcon(prediction.impact)} ${prediction.impact}`;
  impactBadge.className = `preview-impact-badge ${prediction.impact}`;

  // Set confidence
  const stars = getConfidenceStars(prediction.confidence);
  confidenceStars.textContent = stars;
  confidencePercent.textContent = `(${Math.round(prediction.confidence * 100)}%)`;

  // Set description
  description.textContent = prediction.description;

  // Set stats
  pixelDiff.textContent = `${prediction.pixelDiffPercent.toFixed(1)}%`;
  shapeChanges.textContent = prediction.analysis.shapeChanges.toString();
  colorChanges.textContent = prediction.analysis.colorChanges ? 'Yes' : 'No';
  positionChanges.textContent = prediction.analysis.positionChanges ? 'Yes' : 'No';

  // Show modal
  overlay.classList.add('active');
}

function closePreviewModal() {
  const overlay = document.getElementById('previewModalOverlay') as HTMLDivElement;
  overlay.classList.remove('active');
  currentPrediction = null;
  currentMutationType = null;
}

function applyPredictedMutation() {
  if (!currentMutationType) {
    return;
  }

  closePreviewModal();

  // Apply the mutation (reuse existing logic)
  applyMutation(currentMutationType);
}

function getImpactIcon(impact: ImpactLevel): string {
  switch (impact) {
    case 'SILENT': return '🟢';
    case 'LOCAL': return '🟡';
    case 'MAJOR': return '🟠';
    case 'CATASTROPHIC': return '🔴';
  }
}

function getConfidenceStars(confidence: number): string {
  if (confidence >= 0.85) return '⭐⭐⭐';
  if (confidence >= 0.60) return '⭐⭐';
  return '⭐';
}

async function previewMutation(type: MutationType) {
  try {
    const genome = editor.value.trim();

    if (!genome) {
      setStatus('No genome to preview', 'error');
      return;
    }

    let result;

    switch (type) {
      case 'silent':
        result = applySilentMutation(genome);
        break;
      case 'missense':
        result = applyMissenseMutation(genome);
        break;
      case 'nonsense':
        result = applyNonsenseMutation(genome);
        break;
      case 'point':
        result = applyPointMutation(genome);
        break;
      case 'insertion':
        result = applyInsertion(genome);
        break;
      case 'deletion':
        result = applyDeletion(genome);
        break;
      case 'frameshift':
        result = applyFrameshiftMutation(genome);
        break;
      default:
        throw new Error(`Unknown mutation type: ${type}`);
    }

    // Predict impact
    const prediction = predictMutationImpact(genome, result, 300, 300);

    // Show modal
    showPreviewModal(prediction, type);

  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Preview failed: ${error.message}`, 'error');
    } else {
      setStatus('Preview failed', 'error');
    }
  }
}

function addPreviewButtons() {
  // Add "🔮 Preview All" button before mutation buttons
  const mutationToolbar = silentMutationBtn.parentElement;
  if (!mutationToolbar) return;

  // Create preview all button
  const previewAllBtn = document.createElement('button');
  previewAllBtn.className = 'secondary';
  previewAllBtn.textContent = '🔮 Preview';
  previewAllBtn.title = 'Preview mutation effects before applying';
  previewAllBtn.setAttribute('aria-label', 'Preview mutation effects before applying');
  previewAllBtn.style.marginLeft = 'auto';
  previewAllBtn.style.fontWeight = '600';

  // Create dropdown for selecting mutation type to preview
  const previewContainer = document.createElement('span');
  previewContainer.style.display = 'inline-flex';
  previewContainer.style.gap = '0.25rem';
  previewContainer.style.marginLeft = 'auto';

  previewAllBtn.addEventListener('click', () => {
    // Show menu to select mutation type
    const mutationType = prompt('Select mutation type to preview:\n1. Silent\n2. Missense\n3. Nonsense\n4. Frameshift\n5. Point\n6. Insertion\n7. Deletion\n\nEnter number (1-7):');
    if (!mutationType) return;

    const types: MutationType[] = ['silent', 'missense', 'nonsense', 'frameshift', 'point', 'insertion', 'deletion'];
    const index = parseInt(mutationType) - 1;
    if (index >= 0 && index < types.length) {
      previewMutation(types[index]);
    }
  });

  previewContainer.appendChild(previewAllBtn);
  mutationToolbar.appendChild(previewContainer);

  // Add right-click preview to each mutation button
  const mutationButtons = [
    { btn: silentMutationBtn, type: 'silent' as MutationType },
    { btn: missenseMutationBtn, type: 'missense' as MutationType },
    { btn: nonsenseMutationBtn, type: 'nonsense' as MutationType },
    { btn: frameshiftMutationBtn, type: 'frameshift' as MutationType },
    { btn: pointMutationBtn, type: 'point' as MutationType },
    { btn: insertionMutationBtn, type: 'insertion' as MutationType },
    { btn: deletionMutationBtn, type: 'deletion' as MutationType }
  ];

  mutationButtons.forEach(({ btn, type }) => {
    // Right-click to preview
    btn.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      previewMutation(type);
    });

    // Update tooltip to mention right-click
    const currentTitle = btn.getAttribute('title') || '';
    btn.setAttribute('title', `${currentTitle}\nRight-click to preview`);
  });
}

// Audio toggle handler - cycles through visual → audio → both → visual
async function toggleAudio() {
  const modes: RenderMode[] = ['visual', 'audio', 'both'];
  const currentIndex = modes.indexOf(renderMode);
  const nextMode = modes[(currentIndex + 1) % modes.length];

  // If switching to audio or both mode, initialize AudioContext
  if ((nextMode === 'audio' || nextMode === 'both') && renderMode === 'visual') {
    try {
      await audioRenderer.initialize();
      // Track audio synthesis achievement
      const unlocked = achievementEngine.trackAudioSynthesis();
      achievementUI.handleUnlocks(unlocked);
    } catch (error) {
      setStatus('Error initializing audio: ' + (error as Error).message, 'error');
      return;
    }
  }

  renderMode = nextMode;

  // Update UI based on mode
  if (renderMode === 'visual') {
    audioToggleBtn.textContent = '🎨 Visual';
    audioToggleBtn.setAttribute('aria-label', 'Visual mode - click for audio');
    exportBtn.style.display = 'inline-block';
    exportAudioBtn.style.display = 'none';
    exportMidiBtn.style.display = 'none';
    canvas.style.display = 'block';
    setStatus('Visual mode - genomes render to canvas', 'info');
  } else if (renderMode === 'audio') {
    audioToggleBtn.textContent = '🔊 Audio';
    audioToggleBtn.setAttribute('aria-label', 'Audio mode - click for both');
    exportBtn.style.display = 'none';
    exportAudioBtn.style.display = 'inline-block';
    exportMidiBtn.style.display = 'inline-block'; // MIDI export available in audio mode
    canvas.style.display = 'none'; // Hide canvas in audio-only mode
    setStatus('Audio mode - genomes play as sound', 'info');
  } else {
    audioToggleBtn.textContent = '🎨🔊 Both';
    audioToggleBtn.setAttribute('aria-label', 'Both modes - click for visual only');
    exportBtn.style.display = 'inline-block';
    exportAudioBtn.style.display = 'inline-block';
    exportMidiBtn.style.display = 'inline-block'; // MIDI export available in both mode
    canvas.style.display = 'block';
    setStatus('Multi-sensory mode - audio + visual simultaneously', 'info');
  }
}

// Audio export handler
async function exportAudio() {
  try {
    const blob = await audioRenderer.exportWAV();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codoncanvas-audio-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('Audio exported successfully', 'success');
  } catch (error) {
    setStatus('Error exporting audio: ' + (error as Error).message, 'error');
  }
}

// MIDI export handler
function exportMidi() {
  try {
    if (lastSnapshots.length === 0) {
      setStatus('Run genome first before exporting MIDI', 'error');
      return;
    }

    const midiBlob = midiExporter.generateMIDI(lastSnapshots);
    const url = URL.createObjectURL(midiBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codoncanvas-${Date.now()}.mid`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus('MIDI exported successfully - import into GarageBand, Ableton, etc.', 'success');
  } catch (error) {
    setStatus('Error exporting MIDI: ' + (error as Error).message, 'error');
  }
}

// Timeline toggle function
function toggleTimeline() {
  timelineVisible = !timelineVisible;
  if (timelineVisible) {
    timelinePanel.style.display = 'block';
    timelineToggleBtn.textContent = '⏱️ Hide Timeline';
    // Load current genome into timeline
    const source = editor.value.trim();
    if (source) {
      try {
        timelineScrubber.loadGenome(source);
      } catch (error) {
        setStatus(`Timeline error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    }
  } else {
    timelinePanel.style.display = 'none';
    timelineToggleBtn.textContent = '⏱️ Timeline';
  }
}

// Event listeners
runBtn.addEventListener('click', runProgram);
clearBtn.addEventListener('click', clearCanvas);
audioToggleBtn.addEventListener('click', toggleAudio);
timelineToggleBtn.addEventListener('click', toggleTimeline);
themeToggleBtn.addEventListener('click', () => {
  themeManager.cycleTheme();
  updateThemeButton();
  setStatus(`Theme changed to ${themeManager.getThemeDisplayName()}`, 'info');
});
exampleSelect.addEventListener('change', loadExample);
exportBtn.addEventListener('click', exportImage);
exportAudioBtn.addEventListener('click', exportAudio);
exportMidiBtn.addEventListener('click', exportMidi);
saveGenomeBtn.addEventListener('click', saveGenome);
loadGenomeBtn.addEventListener('click', loadGenome);
genomeFileInput.addEventListener('change', handleFileLoad);

// Mutation button listeners
silentMutationBtn.addEventListener('click', () => applyMutation('silent'));
missenseMutationBtn.addEventListener('click', () => applyMutation('missense'));
nonsenseMutationBtn.addEventListener('click', () => applyMutation('nonsense'));
frameshiftMutationBtn.addEventListener('click', () => applyMutation('frameshift'));
pointMutationBtn.addEventListener('click', () => applyMutation('point'));
insertionMutationBtn.addEventListener('click', () => applyMutation('insertion'));
deletionMutationBtn.addEventListener('click', () => applyMutation('deletion'));

// Codon Analyzer functions
let currentAnalysis: CodonAnalysis | null = null;

function runAnalyzer() {
  try {
    const genome = editor.value.trim();

    if (!genome) {
      setStatus('No genome to analyze', 'error');
      return;
    }

    // Tokenize genome
    const tokens = lexer.tokenize(genome);

    if (tokens.length === 0) {
      setStatus('No valid codons to analyze', 'error');
      return;
    }

    // Analyze codon usage
    currentAnalysis = analyzeCodonUsage(tokens);

    // Render analysis
    renderAnalysis(currentAnalysis);

    // Show panel
    analyzerPanel.style.display = 'block';

    // Scroll into view
    analyzerPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setStatus(`📊 Analyzed ${currentAnalysis.totalCodons} codons`, 'success');

  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Analysis failed: ${error.message}`, 'error');
    } else {
      setStatus('Analysis failed', 'error');
    }
  }
}

function renderAnalysis(analysis: CodonAnalysis) {
  const html: string[] = [];

  // Summary stats (compact grid)
  html.push('<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">');
  html.push(`<div style="background: #1e1e1e; padding: 8px; border-radius: 4px; border-left: 3px solid #4ec9b0;"><div style="color: #a0a0a0; font-size: 11px;">Total Codons</div><div style="font-weight: 600; font-size: 16px; color: #4ec9b0;">${analysis.totalCodons}</div></div>`);
  html.push(`<div style="background: #1e1e1e; padding: 8px; border-radius: 4px; border-left: 3px solid #569cd6;"><div style="color: #a0a0a0; font-size: 11px;">GC Content</div><div style="font-weight: 600; font-size: 16px; color: #569cd6;">${analysis.gcContent.toFixed(1)}%</div></div>`);
  html.push(`<div style="background: #1e1e1e; padding: 8px; border-radius: 4px; border-left: 3px solid #dcdcaa;"><div style="color: #a0a0a0; font-size: 11px;">Complexity</div><div style="font-weight: 600; font-size: 16px; color: #dcdcaa;">${(analysis.signature.complexity * 100).toFixed(1)}%</div></div>`);
  html.push('</div>');

  // Top codons
  html.push('<div style="margin-bottom: 16px;">');
  html.push('<div style="color: #4ec9b0; font-weight: 600; margin-bottom: 8px;">Top 5 Codons</div>');
  html.push('<div style="display: flex; flex-direction: column; gap: 4px;">');
  for (const { codon, count, percentage } of analysis.topCodons) {
    html.push(`<div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: #1e1e1e; border-radius: 3px;">` +
      `<span style="font-family: 'Courier New', monospace; font-weight: 600; color: #dcdcaa;">${codon}</span>` +
      `<span style="color: #a0a0a0; font-size: 11px;">${count}× (${percentage.toFixed(1)}%)</span>` +
      `<div style="width: 80px; height: 6px; background: #2d2d30; border-radius: 3px; overflow: hidden;"><div style="width: ${percentage}%; height: 100%; background: #4ec9b0;"></div></div>` +
      `</div>`);
  }
  html.push('</div></div>');

  // Opcode families (visual bars)
  html.push('<div style="margin-bottom: 16px;">');
  html.push('<div style="color: #4ec9b0; font-weight: 600; margin-bottom: 8px;">Opcode Family Distribution</div>');
  html.push('<div style="display: flex; flex-direction: column; gap: 6px;">');

  const families = [
    { name: 'Control', value: analysis.opcodeFamilies.control, color: '#c586c0' },
    { name: 'Drawing', value: analysis.opcodeFamilies.drawing, color: '#4ec9b0' },
    { name: 'Transform', value: analysis.opcodeFamilies.transform, color: '#569cd6' },
    { name: 'Stack', value: analysis.opcodeFamilies.stack, color: '#dcdcaa' },
    { name: 'Utility', value: analysis.opcodeFamilies.utility, color: '#a0a0a0' },
  ];

  for (const family of families) {
    html.push(`<div style="display: flex; align-items: center; gap: 8px;">` +
      `<span style="width: 80px; color: #d4d4d4; font-size: 11px;">${family.name}</span>` +
      `<div style="flex: 1; height: 16px; background: #2d2d30; border-radius: 3px; overflow: hidden; position: relative;">` +
      `<div style="width: ${family.value}%; height: 100%; background: ${family.color}; transition: width 0.3s;"></div>` +
      `</div>` +
      `<span style="width: 45px; text-align: right; color: #a0a0a0; font-size: 11px; font-weight: 600;">${family.value.toFixed(1)}%</span>` +
      `</div>`);
  }
  html.push('</div></div>');

  // Genome signature
  html.push('<div style="margin-bottom: 16px;">');
  html.push('<div style="color: #4ec9b0; font-weight: 600; margin-bottom: 8px;">Genome Signature</div>');
  html.push('<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">');
  html.push(`<div style="background: #1e1e1e; padding: 8px; border-radius: 4px;"><div style="color: #a0a0a0; font-size: 11px;">Drawing Density</div><div style="color: #4ec9b0; font-weight: 600;">${analysis.signature.drawingDensity.toFixed(1)}%</div></div>`);
  html.push(`<div style="background: #1e1e1e; padding: 8px; border-radius: 4px;"><div style="color: #a0a0a0; font-size: 11px;">Transform Density</div><div style="color: #569cd6; font-weight: 600;">${analysis.signature.transformDensity.toFixed(1)}%</div></div>`);
  html.push(`<div style="background: #1e1e1e; padding: 8px; border-radius: 4px;"><div style="color: #a0a0a0; font-size: 11px;">Redundancy</div><div style="color: #dcdcaa; font-weight: 600;">${analysis.signature.redundancy.toFixed(2)}</div></div>`);
  html.push(`<div style="background: #1e1e1e; padding: 8px; border-radius: 4px;"><div style="color: #a0a0a0; font-size: 11px;">AT Content</div><div style="color: #c586c0; font-weight: 600;">${analysis.atContent.toFixed(1)}%</div></div>`);
  html.push('</div></div>');

  // Info note
  html.push('<div style="padding: 8px; background: #1e1e1e; border-left: 3px solid #569cd6; border-radius: 3px; font-size: 11px; color: #a0a0a0; line-height: 1.5;">');
  html.push('💡 <strong style="color: #569cd6;">Bioinformatics Insight:</strong> GC content and codon usage bias are real genomic metrics used in computational biology. This analysis connects programming to actual research techniques!');
  html.push('</div>');

  analyzerContent.innerHTML = html.join('');
}

function toggleAnalyzer() {
  const isVisible = analyzerPanel.style.display !== 'none';
  analyzerPanel.style.display = isVisible ? 'none' : 'block';
  analyzerToggle.textContent = isVisible ? 'Show' : 'Hide';
  analyzerToggle.setAttribute('aria-expanded', (!isVisible).toString());
}

// Example filter listeners
difficultyFilter.addEventListener('change', updateExampleDropdown);
conceptFilter.addEventListener('change', updateExampleDropdown);
searchInput.addEventListener('input', updateExampleDropdown);

// Linter listeners
linterToggle.addEventListener('click', toggleLinter);
fixAllBtn.addEventListener('click', fixAllErrors);

// DiffViewer listeners
diffViewerToggle.addEventListener('click', toggleDiffViewer);
diffViewerClearBtn.addEventListener('click', clearDiffViewer);

// Analyzer listeners
analyzeBtn.addEventListener('click', runAnalyzer);
analyzerToggle.addEventListener('click', toggleAnalyzer);

// Debounced linter on editor input
let linterTimeout: number | null = null;
editor.addEventListener('input', () => {
  if (linterTimeout) {
    clearTimeout(linterTimeout);
  }
  linterTimeout = setTimeout(() => {
    runLinter(editor.value);
  }, 300) as unknown as number;
});

// Initialize example dropdown with all examples
updateExampleDropdown();

// Keyboard shortcuts
editor.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter: Run program
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    runProgram();
  }
  // Ctrl/Cmd + K: Clear canvas
  else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    clearCanvas();
  }
  // Ctrl/Cmd + S: Save genome
  else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
    e.preventDefault();
    saveGenome();
  }
  // Ctrl/Cmd + E: Export PNG
  else if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
    e.preventDefault();
    exportImage();
  }
  // Ctrl/Cmd + L: Toggle linter
  else if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
    e.preventDefault();
    toggleLinter();
  }
});

// Global keyboard shortcuts (not just in editor)
document.addEventListener('keydown', (e) => {
  // Esc: Hide linter or example info
  if (e.key === 'Escape') {
    if (linterPanel.style.display !== 'none') {
      linterPanel.style.display = 'none';
      linterToggle.textContent = 'Show';
      linterToggle.setAttribute('aria-expanded', 'false');
    } else if (exampleInfo.style.display !== 'none') {
      exampleInfo.style.display = 'none';
    }
  }
});

// Initialize share system
injectShareStyles();

// Initialize timeline scrubber styles
injectTimelineStyles();

// Initialize DiffViewer styles
injectDiffViewerStyles();

// Initialize mutation preview modal
injectPreviewModalStyles();
createPreviewModal();
addPreviewButtons();

const shareSystem = new ShareSystem({
  containerElement: shareContainer,
  getGenome: () => editor.value.trim(),
  appTitle: 'CodonCanvas Playground',
  showQRCode: true,
  socialPlatforms: ['twitter', 'reddit', 'email']
});

// Initialize DiffViewer
const diffViewer = new DiffViewer({
  containerElement: diffViewerContainer,
  showCanvas: true,
  highlightColor: '#ff6b6b',
  canvasWidth: 300,
  canvasHeight: 300
});

// Track original genome for comparison
let originalGenomeBeforeMutation: string = '';

// Track current prediction for preview modal
let currentPrediction: MutationPrediction | null = null;
let currentMutationType: MutationType | null = null;

// Initialize tutorial system
const tutorialManager = new TutorialManager();
tutorialManager.start(helloCircleTutorial);
const tutorialUI = initializeTutorial(
  document.body,
  tutorialManager,
  editor
);

// Load genome from URL if present
const urlGenome = ShareSystem.loadFromURL();
if (urlGenome) {
  editor.value = urlGenome;
  setStatus('Loaded genome from share link', 'success');
  setTimeout(() => {
    runProgram();
    runLinter(urlGenome);
  }, 100);
} else if (editor.value.trim()) {
  // Auto-run on load if there's content
  setTimeout(() => {
    runProgram();
    runLinter(editor.value);
  }, 100);
}

// Mode switching logic
function switchMode(mode: 'playground' | 'assessment') {
  if (mode === 'playground') {
    playgroundContainer.style.display = 'grid';
    assessmentContainer.style.display = 'none';
  } else {
    playgroundContainer.style.display = 'none';
    assessmentContainer.style.display = 'block';

    // Initialize assessment UI on first access
    if (!assessmentUI) {
      assessmentUI = new AssessmentUI(
        assessmentEngine,
        assessmentContainer,
        achievementEngine,
        achievementUI
      );
    }
    assessmentUI.show();
  }
}

// Setup mode toggle listeners
modeToggleBtns.forEach(btn => {
  btn.addEventListener('change', (e) => {
    const mode = (e.target as HTMLInputElement).value as 'playground' | 'assessment';
    switchMode(mode);
  });
});

// Initialize in playground mode
switchMode('playground');

console.log('🧬 CodonCanvas Playground loaded');
console.log('Press Cmd/Ctrl + Enter to run your genome');
console.log('💡 Switch to Assessment mode to test your mutation knowledge');
