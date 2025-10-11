import { CodonLexer } from './lexer.js';
import { CodonVM } from './vm.js';
import { Canvas2DRenderer } from './renderer.js';
import { examples, ExampleKey } from './examples.js';

// Get DOM elements
const editor = document.getElementById('editor') as HTMLTextAreaElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;
const exampleSelect = document.getElementById('exampleSelect') as HTMLSelectElement;
const exportBtn = document.getElementById('exportBtn') as HTMLButtonElement;
const statusMessage = document.getElementById('statusMessage') as HTMLSpanElement;
const codonCount = document.getElementById('codonCount') as HTMLSpanElement;
const instructionCount = document.getElementById('instructionCount') as HTMLSpanElement;
const statusBar = document.querySelector('.status-bar') as HTMLDivElement;

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

// Event listeners
runBtn.addEventListener('click', runProgram);
clearBtn.addEventListener('click', clearCanvas);
exampleSelect.addEventListener('change', loadExample);
exportBtn.addEventListener('click', exportImage);

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
