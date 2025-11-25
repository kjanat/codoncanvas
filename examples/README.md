# CodonCanvas Example Programs

This directory contains ready-to-use genome files for CodonCanvas.

## Usage

1. **Web Playground**: Click "Load Example" or drag-and-drop .genome files
2. **Command Line**: `codoncanvas run example.genome`
3. **Classroom**: Distribute to students for modification experiments

## Difficulty Levels

### Beginner (5 examples)

- **helloCircle.genome** - Hello Circle
- **twoShapes.genome** - Two Shapes
- **lineArt.genome** - Line Art
- **triangleDemo.genome** - Triangle Demo
- **silentMutation.genome** - Silent Mutation Demo

### Intermediate (7 examples)

- **colorfulPattern.genome** - Colorful Pattern
- **ellipseGallery.genome** - Ellipse Gallery
- **scaleTransform.genome** - Scale Transform
- **stackOperations.genome** - Stack Operations
- **face.genome** - Simple Face
- **colorGradient.genome** - Color Gradient
- **stackCleanup.genome** - Stack Cleanup with POP

### Advanced (6 examples)

- **rosette.genome** - Rosette Pattern
- **texturedCircle.genome** - Textured Circle with Noise
- **spiralPattern.genome** - Spiral Pattern
- **nestedFrames.genome** - Nested Frames with State
- **gridPattern.genome** - Grid Pattern
- **mandala.genome** - Mandala Pattern

### Advanced Showcase (7 examples)

Intricate compositions demonstrating full system capabilities:

- **fractalFlower.genome** - Fractal Flower (multi-layer petals, ellipses, NOISE)
- **geometricMosaic.genome** - Geometric Mosaic (gradient grid, mixed shapes)
- **starfield.genome** - Starfield (textured stars, NOISE effects, depth)
- **recursiveCircles.genome** - Recursive Circles (nested rings, rotational symmetry)
- **kaleidoscope.genome** - Kaleidoscope (6-fold symmetry, multi-shape)
- **wavyLines.genome** - Wavy Lines (flowing waves, rainbow gradient)
- **cosmicWheel.genome** - Cosmic Wheel (radial mandala, textures, complexity)

### Biological Patterns (5 examples) - NEW!

Nature-inspired patterns teaching biological concepts:

- **branching-tree.genome** - Branching Tree (fractal branching, tree/vessel structure)
- **phyllotaxis-sunflower.genome** - Phyllotaxis (golden angle, sunflower seeds)
- **cell-division.genome** - Cell Division (mitosis visualization, colony growth)
- **honeycomb-cells.genome** - Honeycomb (hexagonal tessellation, optimal packing)
- **dna-helix.genome** - DNA Double Helix (helical structure, base pairing)
- **neuron-network.genome** - Neuron Network (dendritic branching, synapses)

## Mutation Experiments

These examples are designed for classroom mutation experiments:

- **Silent mutations**: Change synonymous codons (e.g., GGA→GGC) - no output change
- **Missense mutations**: Change opcode family (e.g., GGA→CCA) - shape change
- **Nonsense mutations**: Insert STOP codon (TAA/TAG/TGA) - truncated output
- **Frameshift mutations**: Insert/delete 1-2 bases - scrambled downstream

## File Format

Each .genome file contains:

1. Comment header with metadata (lines starting with `;`)
2. DNA sequence using only A, C, G, T bases
3. Whitespace and comments ignored by interpreter
4. Total bases must be divisible by 3 (triplet codons)

## Biological Concepts Demonstrated

The new biological pattern examples teach key genetics and biology concepts:

- **Fractal Branching**: Trees, blood vessels, neurons all use recursive branching algorithms
- **Phyllotaxis**: Plant leaf arrangement follows mathematical patterns (Fibonacci, golden angle)
- **Cell Division**: Mitosis produces daughter cells with inherited traits
- **Optimal Packing**: Hexagonal structures maximize space efficiency (honeycombs, epithelial cells)
- **DNA Structure**: Double helix with complementary base pairing
- **Neural Morphology**: Dendritic trees collect inputs, axons transmit signals

Each example includes biological context in comments and can be used for:

- Visual demonstrations in biology lectures
- Mutation experiments showing how changes affect structure
- Pattern recognition exercises
- Cross-curricular STEM activities (biology + computer science)

## Quick Start

Try `helloCircle.genome` first - minimal example that draws a circle.

For biological examples, try `cell-division.genome` or `phyllotaxis-sunflower.genome`.

For classroom use, see EDUCATORS.md for lesson plans and mutation activities.
