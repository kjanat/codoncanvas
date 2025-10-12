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
import { TutorialManager, helloCircleTutorial } from './tutorial';
import { initializeTutorial } from './tutorial-ui';
import './tutorial-ui.css';
import { TimelineScrubber, injectTimelineStyles } from './timeline-scrubber';
import { ThemeManager } from './theme-manager';
import { AchievementEngine } from './achievement-engine';
import { AchievementUI } from './achievement-ui';
import './achievement-ui.css';

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

// Audio elements
const audioToggleBtn = document.getElementById('audioToggleBtn') as HTMLButtonElement;

// Timeline elements
const timelineToggleBtn = document.getElementById('timelineToggleBtn') as HTMLButtonElement;
const timelinePanel = document.getElementById('timelinePanel') as HTMLDivElement;
const timelineContainer = document.getElementById('timelineContainer') as HTMLDivElement;

// Theme elements
const themeToggleBtn = document.getElementById('themeToggleBtn') as HTMLButtonElement;

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

      // Track genome execution and drawing operations
      const opcodes = tokens.map(t => t.text);
      const unlocked2 = achievementEngine.trackGenomeExecuted(opcodes);
      const unlocked3 = trackDrawingOperations(tokens);
      achievementUI.handleUnlocks([...unlocked2, ...unlocked3]);
    }

  } catch (error) {
    if (error instanceof Error) {
      setStatus(`Error: ${error.message}`, 'error');
    } else if (Array.isArray(error)) {
      // ParseError array
      setStatus(`Error: ${error[0].message}`, 'error');
    } else {
      setStatus('Unknown error occurred', 'error');
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

// Audio toggle handler - cycles through visual → audio → both → visual
async function toggleAudio() {
  const modes: RenderMode[] = ['visual', 'audio', 'both'];
  const currentIndex = modes.indexOf(renderMode);
  const nextMode = modes[(currentIndex + 1) % modes.length];

  // If switching to audio or both mode, initialize AudioContext
  if ((nextMode === 'audio' || nextMode === 'both') && renderMode === 'visual') {
    try {
      await audioRenderer.initialize();
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

// Example filter listeners
difficultyFilter.addEventListener('change', updateExampleDropdown);
conceptFilter.addEventListener('change', updateExampleDropdown);
searchInput.addEventListener('input', updateExampleDropdown);

// Linter listeners
linterToggle.addEventListener('click', toggleLinter);
fixAllBtn.addEventListener('click', fixAllErrors);

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

const shareSystem = new ShareSystem({
  containerElement: shareContainer,
  getGenome: () => editor.value.trim(),
  appTitle: 'CodonCanvas Playground',
  showQRCode: true,
  socialPlatforms: ['twitter', 'reddit', 'email']
});

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

console.log('🧬 CodonCanvas Playground loaded');
console.log('Press Cmd/Ctrl + Enter to run your genome');
