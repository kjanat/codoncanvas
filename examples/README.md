# CodonCanvas Example Programs

This directory contains 18 ready-to-use genome files for CodonCanvas.

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

## Quick Start

Try `helloCircle.genome` first - minimal example that draws a circle.

For classroom use, see EDUCATORS.md for lesson plans and mutation activities.
