import { ExampleKey, examples } from './examples';
import { CodonLexer } from './lexer';
import { Canvas2DRenderer } from './renderer';
import { CodonVM } from './vm';
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

// Get DOM elements
const editor = document.getElementById('editor') as HTMLTextAreaElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const exampleSelect = document.getElementById('exampleSelect') as HTMLSelectElement;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
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

// Initialize lexer, renderer, and VM
const lexer = new CodonLexer();
const renderer = new Canvas2DRenderer(canvas);
const vm = new CodonVM(renderer);

function setStatus(message: string, type: 'info' | 'error' | 'success') {
  statusMessage.textContent = message;
  statusBar.className = `status-bar ${type}`;
}

function updateStats(codons: number, instructions: number) {
  codonCount.textContent = `Codons: ${codons}`;
  instructionCount.textContent = `Instructions: ${instructions}`;
}

function runProgram() {
  try {
    const source = editor.value;

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

    // Execute
    vm.reset();
    const snapshots = vm.run(tokens);

    updateStats(tokens.length, vm.state.instructionCount);
    setStatus(`Executed ${vm.state.instructionCount} instructions successfully`, 'success');

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

function loadExample() {
  const key = exampleSelect.value as ExampleKey;
  if (key && examples[key]) {
    editor.value = examples[key].genome;
    setStatus(`Loaded: ${examples[key].title}`, 'info');
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

// Event listeners
runBtn.addEventListener('click', runProgram);
clearBtn.addEventListener('click', clearCanvas);
exampleSelect.addEventListener('change', loadExample);
exportBtn.addEventListener('click', exportImage);
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

// Keyboard shortcut: Cmd/Ctrl + Enter to run
editor.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    runProgram();
  }
});

// Auto-run on load if there's content
if (editor.value.trim()) {
  setTimeout(runProgram, 100);
}

console.log('🧬 CodonCanvas Playground loaded');
console.log('Press Cmd/Ctrl + Enter to run your genome');
