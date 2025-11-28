import { getElement } from "../dom-utils";
import { CodonLexer } from "../lexer";
import { Canvas2DRenderer } from "../renderer";
import { CodonVM } from "../vm";

// Types
interface GalleryExample {
  id: string;
  name: string;
  difficulty: "beginner" | "intermediate" | "advanced" | "advanced-showcase";
  concepts: string;
  description: string;
  screenshot?: string;
}

// Example metadata
const examples: GalleryExample[] = [
  {
    id: "helloCircle",
    name: "Hello Circle",
    difficulty: "beginner",
    concepts: "drawing",
    description: "Minimal example - draws a single circle",
  },
  {
    id: "twoShapes",
    name: "Two Shapes",
    difficulty: "beginner",
    concepts: "drawing, transforms",
    description: "Two shapes with translation",
  },
  {
    id: "lineArt",
    name: "Line Art",
    difficulty: "beginner",
    concepts: "drawing, lines",
    description: "Simple line-based composition",
  },
  {
    id: "triangleDemo",
    name: "Triangle Demo",
    difficulty: "beginner",
    concepts: "drawing, triangles",
    description: "Triangle shape demonstration",
  },
  {
    id: "silentMutation",
    name: "Silent Mutation Demo",
    difficulty: "beginner",
    concepts: "mutations",
    description: "Demonstrates synonymous codons",
  },
  {
    id: "colorfulPattern",
    name: "Colorful Pattern",
    difficulty: "intermediate",
    concepts: "colors, drawing",
    description: "Multi-color shape composition",
  },
  {
    id: "ellipseGallery",
    name: "Ellipse Gallery",
    difficulty: "intermediate",
    concepts: "drawing, ellipses",
    description: "Various ellipse shapes",
  },
  {
    id: "scaleTransform",
    name: "Scale Transform",
    difficulty: "intermediate",
    concepts: "transforms, scaling",
    description: "Demonstrates SCALE opcode",
  },
  {
    id: "stackOperations",
    name: "Stack Operations",
    difficulty: "intermediate",
    concepts: "stack, DUP",
    description: "Stack manipulation with DUP",
  },
  {
    id: "face",
    name: "Simple Face",
    difficulty: "intermediate",
    concepts: "drawing, composition",
    description: "Face using multiple shapes",
  },
  {
    id: "colorGradient",
    name: "Color Gradient",
    difficulty: "intermediate",
    concepts: "colors, gradients",
    description: "Gradient color transitions",
  },
  {
    id: "stackCleanup",
    name: "Stack Cleanup",
    difficulty: "intermediate",
    concepts: "stack, POP",
    description: "Stack cleanup with POP opcode",
  },
  {
    id: "rosette",
    name: "Rosette Pattern",
    difficulty: "advanced",
    concepts: "rotation, patterns",
    description: "Radial rosette pattern",
  },
  {
    id: "texturedCircle",
    name: "Textured Circle",
    difficulty: "advanced",
    concepts: "advanced-opcodes, noise",
    description: "Circle with NOISE texture",
  },
  {
    id: "spiralPattern",
    name: "Spiral Pattern",
    difficulty: "advanced",
    concepts: "transforms, patterns",
    description: "Spiral composition",
  },
  {
    id: "nestedFrames",
    name: "Nested Frames",
    difficulty: "advanced",
    concepts: "state-management, SAVE_STATE",
    description: "Nested frames with state",
  },
  {
    id: "gridPattern",
    name: "Grid Pattern",
    difficulty: "advanced",
    concepts: "patterns, grids",
    description: "Grid layout composition",
  },
  {
    id: "mandala",
    name: "Mandala Pattern",
    difficulty: "advanced",
    concepts: "rotation, symmetry",
    description: "Complex mandala pattern",
  },
  {
    id: "fractalFlower",
    name: "Fractal Flower",
    difficulty: "advanced-showcase",
    concepts:
      "advanced-opcodes, composition, colors, transforms, state-management",
    description: "Multi-layer petals with ellipses and NOISE",
    screenshot: "fractalFlower.png",
  },
  {
    id: "geometricMosaic",
    name: "Geometric Mosaic",
    difficulty: "advanced-showcase",
    concepts: "patterns, grids, colors",
    description: "Gradient grid with mixed shapes",
    screenshot: "geometricMosaic.png",
  },
  {
    id: "starfield",
    name: "Starfield",
    difficulty: "advanced-showcase",
    concepts: "advanced-opcodes, noise, composition",
    description: "Textured stars with NOISE effects",
    screenshot: "starfield.png",
  },
  {
    id: "recursiveCircles",
    name: "Recursive Circles",
    difficulty: "advanced-showcase",
    concepts: "patterns, rotation",
    description: "Nested rings with rotational symmetry",
    screenshot: "recursiveCircles.png",
  },
  {
    id: "kaleidoscope",
    name: "Kaleidoscope",
    difficulty: "advanced-showcase",
    concepts: "rotation, symmetry, composition",
    description: "6-fold symmetry with multi-shape",
    screenshot: "kaleidoscope.png",
  },
  {
    id: "wavyLines",
    name: "Wavy Lines",
    difficulty: "advanced-showcase",
    concepts: "lines, colors, transforms",
    description: "Flowing waves with rainbow gradient",
    screenshot: "wavyLines.png",
  },
  {
    id: "cosmicWheel",
    name: "Cosmic Wheel",
    difficulty: "advanced-showcase",
    concepts: "advanced-opcodes, rotation, noise",
    description: "Radial mandala with textures",
    screenshot: "cosmicWheel.png",
  },
  {
    id: "fibonacci-spiral",
    name: "Fibonacci Spiral",
    difficulty: "advanced-showcase",
    concepts: "LOOP, arithmetic, golden-ratio, Fibonacci",
    description:
      "Golden ratio approximation via Fibonacci sequence using ADD opcode",
  },
  {
    id: "parametric-rose",
    name: "Parametric Rose",
    difficulty: "advanced-showcase",
    concepts: "LOOP, rotation, mathematical-curves, parametric",
    description: "Mathematical rose curve r = a·cos(k·θ) with 8-petal symmetry",
  },
  {
    id: "sierpinski-approximation",
    name: "Sierpinski Triangle",
    difficulty: "advanced-showcase",
    concepts: "LOOP, fractals, recursion, geometric-progression",
    description: "Fractal triangle with self-similar nested structure",
  },
  {
    id: "golden-ratio-demo",
    name: "Golden Ratio Demo",
    difficulty: "advanced-showcase",
    concepts: "arithmetic, golden-ratio, geometry, precision",
    description:
      "Visual proof of φ ≈ 1.618 using DIV for geometric construction",
  },
  {
    id: "prime-number-spiral",
    name: "Prime Number Spiral",
    difficulty: "advanced-showcase",
    concepts: "LOOP, number-theory, spirals, Ulam-spiral",
    description: "Ulam spiral approximation demonstrating LOOP efficiency",
  },
  {
    id: "fizzbuzz-visual",
    name: "FizzBuzz Visual",
    difficulty: "advanced-showcase",
    concepts: "conditionals, computational-thinking, FizzBuzz, patterns",
    description:
      "Classic programming challenge visualized: divisibility by 3, 5, and 15",
  },
  {
    id: "conditional-scaling",
    name: "Conditional Scaling",
    difficulty: "advanced-showcase",
    concepts: "EQ, LT, conditionals, arithmetic, comparison-opcodes",
    description:
      "Demonstrates EQ/LT opcodes for conditional behavior via size multiplication",
  },
  {
    id: "even-odd-spiral",
    name: "Even-Odd Spiral",
    difficulty: "advanced-showcase",
    concepts: "LOOP, DIV, modulo-arithmetic, parity, computational-patterns",
    description:
      "Spiral with alternating sizes based on even/odd number detection",
  },
  {
    id: "audio-scale",
    name: "Audio Scale",
    difficulty: "intermediate",
    concepts: "audio, experimental",
    description: "Musical scale demonstration",
  },
  {
    id: "audio-waveforms",
    name: "Audio Waveforms",
    difficulty: "intermediate",
    concepts: "audio, experimental",
    description: "Different waveform sounds",
  },
  {
    id: "audio-mutation-demo",
    name: "Audio Mutation Demo",
    difficulty: "intermediate",
    concepts: "audio, mutations",
    description: "Mutations affecting sound",
  },
  {
    id: "rna-hello",
    name: "RNA Hello",
    difficulty: "beginner",
    concepts: "rna-mode",
    description: "Hello circle using RNA notation",
  },
  {
    id: "rna-composition",
    name: "RNA Composition",
    difficulty: "intermediate",
    concepts: "rna-mode, composition",
    description: "Complex RNA genome",
  },
];

let currentFilter = "all";
let searchQuery = "";
let currentExample: GalleryExample | null = null;
let currentSort = "default";

// Difficulty ordering for sorting
const difficultyOrder: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  "advanced-showcase": 4,
};

// DOM elements
const searchInput = document.getElementById("search") as HTMLInputElement;
const sortSelect = document.getElementById("sort-by") as HTMLSelectElement;
const galleryGrid = getElement("gallery-grid");
const visibleCount = getElement("visible-count");
const totalCount = getElement("total-count");
const modalTitle = getElement("modal-title");
const previewModal = getElement("preview-modal");
const modalCode = getElement("modal-code");
const modalCanvas = document.getElementById(
  "modal-canvas",
) as HTMLCanvasElement;

// Initialize
renderGallery();

// Search functionality
searchInput.addEventListener("input", (e) => {
  searchQuery = (e.target as HTMLInputElement).value.toLowerCase();
  renderGallery();
});

// Difficulty filters
for (const chip of document.querySelectorAll("#difficulty-filters .chip")) {
  chip.addEventListener("click", (e) => {
    for (const c of document.querySelectorAll("#difficulty-filters .chip")) {
      c.classList.remove("active");
    }
    (e.target as HTMLElement).classList.add("active");
    currentFilter = (e.target as HTMLElement).dataset.difficulty || "all";
    renderGallery();
  });
}

// Sort functionality
sortSelect.addEventListener("change", (e) => {
  currentSort = (e.target as HTMLSelectElement).value;
  renderGallery();
});

function renderGallery(): void {
  const filtered = examples.filter((ex) => {
    const matchesDifficulty =
      currentFilter === "all" || ex.difficulty === currentFilter;
    const matchesSearch =
      !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery) ||
      ex.concepts.toLowerCase().includes(searchQuery) ||
      ex.description.toLowerCase().includes(searchQuery);
    return matchesDifficulty && matchesSearch;
  });

  // Apply sorting
  if (currentSort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (currentSort === "difficulty") {
    filtered.sort(
      (a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty],
    );
  } else if (currentSort === "difficulty-desc") {
    filtered.sort(
      (a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty],
    );
  }
  // 'default' preserves original array order

  galleryGrid.innerHTML = "";

  if (filtered.length === 0) {
    galleryGrid.innerHTML =
      '<div class="empty-state"><h2>No examples found</h2><p>Try adjusting your filters or search query</p></div>';
  } else {
    for (const example of filtered) {
      const card = createGalleryCard(example);
      galleryGrid.appendChild(card);
    }
  }

  visibleCount.textContent = String(filtered.length);
  totalCount.textContent = String(examples.length);
}

function createGalleryCard(example: GalleryExample): HTMLElement {
  const card = document.createElement("div");
  card.className = "gallery-card";
  card.onclick = () => openModal(example);

  const difficultyClass = example.difficulty.replace("-", "");
  const difficultyLabel = example.difficulty.replace("-", " ");

  // Parse concept tags
  const conceptTags = example.concepts
    .split(",")
    .map((c) => c.trim())
    .slice(0, 4); // Max 4 tags

  card.innerHTML = `
    <div class="card-thumbnail" id="thumb-${example.id}">
      ${
        example.screenshot
          ? `<img src="examples/screenshots/${example.screenshot}" alt="${example.name}">`
          : '<canvas width="400" height="400"></canvas>'
      }
    </div>
    <div class="card-content">
      <div class="card-title">${example.name}</div>
      <div class="card-meta">
        <span class="badge badge-${difficultyClass}">${difficultyLabel}</span>
      </div>
      <div class="card-concepts">${example.description}</div>
      <div class="concept-tags">
        ${conceptTags
          .map(
            (tag) =>
              `<span class="concept-tag" onclick="filterByConcept('${tag}'); event.stopPropagation();">${tag}</span>`,
          )
          .join("")}
      </div>
    </div>
  `;

  // Generate thumbnail if no screenshot
  if (!example.screenshot) {
    setTimeout(() => generateThumbnail(example.id), 100);
  }

  return card;
}

async function generateThumbnail(exampleId: string): Promise<void> {
  try {
    const response = await fetch(`examples/${exampleId}.genome`);
    const code = await response.text();

    const canvas = document.querySelector(
      `#thumb-${exampleId} canvas`,
    ) as HTMLCanvasElement | null;
    if (!canvas) return;

    const renderer = new Canvas2DRenderer(canvas);
    const lexer = new CodonLexer();
    const vm = new CodonVM(renderer);

    const tokens = lexer.tokenize(code);
    vm.run(tokens);
  } catch (error) {
    console.error(`Failed to generate thumbnail for ${exampleId}:`, error);
  }
}

async function openModal(example: GalleryExample): Promise<void> {
  currentExample = example;
  modalTitle.textContent = example.name;
  previewModal.classList.add("active");

  try {
    const response = await fetch(`examples/${example.id}.genome`);
    const code = await response.text();

    // Show code
    modalCode.textContent = code;

    // Render preview
    const ctx = modalCanvas.getContext("2d");
    ctx?.clearRect(0, 0, modalCanvas.width, modalCanvas.height);

    const renderer = new Canvas2DRenderer(modalCanvas);
    const lexer = new CodonLexer();
    const vm = new CodonVM(renderer);

    const tokens = lexer.tokenize(code);
    vm.run(tokens);
  } catch (error) {
    console.error("Failed to load example:", error);
    modalCode.textContent = "Error loading example";
  }
}

function filterByConcept(concept: string): void {
  searchInput.value = concept;
  searchQuery = concept.toLowerCase();
  renderGallery();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeModal(): void {
  previewModal.classList.remove("active");
  currentExample = null;
}

async function openInPlayground(): Promise<void> {
  if (!currentExample) return;

  try {
    const response = await fetch(`examples/${currentExample.id}.genome`);
    const code = await response.text();

    // Store code in sessionStorage for playground to load
    sessionStorage.setItem("codoncanvas-import-code", code);
    sessionStorage.setItem(
      "codoncanvas-import-filename",
      `${currentExample.id}.genome`,
    );

    // Navigate to playground
    window.location.href = "index.html";
  } catch (error) {
    console.error("Failed to open in playground:", error);
    alert("Failed to load example");
  }
}

// Expose functions to window for HTML onclick handlers
declare global {
  interface Window {
    filterByConcept: (concept: string) => void;
    closeModal: () => void;
    openInPlayground: () => Promise<void>;
  }
}
window.filterByConcept = filterByConcept;
window.closeModal = closeModal;
window.openInPlayground = openInPlayground;

// Close modal on background click
previewModal.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).id === "preview-modal") {
    closeModal();
  }
});

// Close modal on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
  }
});
