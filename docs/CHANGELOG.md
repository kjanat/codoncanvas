# Changelog

All notable changes to CodonCanvas are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-29

### Added - React 19 SPA Architecture

- **React 19**: Complete migration from vanilla JS to React 19 single-page application
- **TanStack Router**: File-based routing with type-safe navigation
- **Tailwind CSS v4**: Modern utility-first styling with semantic color tokens
- **Dark mode**: System-aware theme with manual toggle support

### Added - React Components

- **Playground**: Full-featured code editor with live preview, keyboard shortcuts, undo/redo
- **Gallery**: Sortable example browser with preview modal
- **Tutorial**: 10-lesson interactive tutorial engine with progress tracking
- **DiffViewer**: Side-by-side genome comparison component
- **Achievement system**: Gamification with toast notifications

### Added - React Hooks

- `useGenome`, `useVM`, `useCanvas`: Core genome execution
- `useHistory`: Undo/redo functionality
- `useLocalStorage`, `usePreferences`: Persistent state
- `useKeyboardShortcuts`: Declarative shortcut handling
- `useShareUrl`: URL-based genome sharing
- `useClipboard`: Copy/paste with feedback
- `useAchievements`: Achievement tracking

### Added - Dashboard Pages

- **Teacher Dashboard**: Student engagement metrics, at-risk detection, progress matrix
- **Research Dashboard**: Detailed analytics for educational research
- **Learning Paths**: Curated learning journeys with progress tracking

### Added - Demo Pages (React)

- Mutation Demo with DiffViewer
- Evolution Demo with lineage tracking
- Timeline Demo with GIF export
- Population Genetics simulation
- Genetic Algorithm with fitness visualization
- Achievements Demo

### Added - Developer Experience

- **Bun runtime**: CLI now runs on Bun for faster execution
- **Bun test runner**: Native testing with coverage
- **Commitlint**: Conventional commit message enforcement
- **VSCode configs**: Debugging and task configurations
- **MCP toolchain**: Modern tooling configuration

### Added - Type Safety

- Branded types for domain safety (StackValue, Degrees, Hue, etc.)
- VM state system with discriminated unions
- Comprehensive TypeScript strict mode

### Changed

- Test runner: Vitest -> Bun native test runner
- Styling: CSS files -> Tailwind CSS v4
- Routing: Multiple HTML files -> Single SPA with React Router
- State management: DOM manipulation -> React hooks and contexts

### Removed

- Legacy vanilla JS playground (`src/playground.ts`, `src/playground/`)
- Legacy demo pages (`pages/*.html`)
- Legacy CSS files (`css/`)
- ESLint (replaced by Biome)
- Vitest (replaced by Bun test runner)

### Migration Notes

- All demo URLs changed from `.html` extensions to clean paths
- Example: `/demos.html` -> `/demos`
- Example: `/mutation-demo.html` -> `/demos/mutation`

## [1.1.0] - 2025-10-12

### Added - Documentation & Distribution

- Visual documentation: Screenshots of playground, mutation lab, and timeline scrubber (Session 15)
- Educator documentation: EDUCATORS.md with lesson plans, learning objectives, and assessment rubrics (Session 12)
- Student materials: STUDENT_HANDOUTS.md with worksheets and reference materials (Session 12)
- Visual codon chart: Print-ready codon-chart.svg poster (10KB) (Session 13)
- Distribution package: codoncanvas-examples.zip with 18 genome files (14KB) (Session 13)
- Documentation polish: Fixed placeholder URLs, corrected test counts, added resource mentions (Session 14)

### Added - Accessibility & Mobile Support

- WCAG 2.1 Level AA compliance: Color contrast, keyboard navigation, ARIA labels (Session 10)
- Mobile responsiveness: Tablet-optimized layouts, touch-friendly controls (Session 11)
- Screen reader support: Comprehensive ARIA labels and live regions
- Keyboard shortcuts: Full keyboard navigation support (Cmd/Ctrl+Enter to run)
- High contrast mode: Accessible color schemes for low vision users

### Added - Enhanced Example Library

- 18 pedagogical examples (up from 3): Basic shapes, stack operations, advanced features, educational demos (Session 5)
- Example categories: Organized by difficulty and pedagogical focus
- New primitives demonstrated: TRIANGLE, ELLIPSE, SWAP, SAVE_STATE, NOISE
- Educational value: Progressive difficulty from "Hello Circle" to "Mandala Pattern"

### Added - Quality Tools

- Linter UI integration: Visual display of warnings/errors in editor (Session 6)
- Autofix system: Automatic correction of common genome errors (Sessions 8-9)
- Enhanced error messages: Descriptive feedback with suggested fixes
- Test coverage expansion: 59 tests across lexer, VM, mutations, and genome I/O

### Changed

- Test count correction: Updated README to reflect actual 59 tests (11+20+17+11) (Session 14)
- GitHub URLs: Changed from placeholder to github.com/codoncanvas/codoncanvas (Session 14)
- Resource visibility: Added mentions of codon chart and distribution ZIP to documentation (Session 14)

### Fixed

- NOISE opcode: Fixed test mocking and seed-based deterministic output (Session 7)
- Color contrast: Enhanced contrast ratios for WCAG compliance (Session 10)
- Mobile layout: Fixed canvas overflow and control sizing on tablets (Session 11)

## [1.0.0] - 2025-10-12 - Phase B Complete

### Added - Pedagogy Tools (Sessions 1-4)

- Mutation tools module (`src/mutations.ts`): 7 mutation types (silent, missense, nonsense, point, insertion, deletion, frameshift)
- Diff viewer component (`src/diff-viewer.ts`): Side-by-side genome comparison with syntax highlighting
- Mutation lab interface (`mutation-demo.html`): Interactive mutation laboratory with dual-canvas visualization
- Timeline scrubber (`timeline-demo.html`): Step-through execution with state visualization
- Genome I/O (`src/genome-io.ts`): Export/import .genome files with metadata

### Added - Test Coverage

- Mutation tests: 17 tests covering all mutation types and compareGenomes utility
- Genome I/O tests: 11 tests for export/import with metadata validation
- Expanded VM tests: 20 tests (up from 17) covering new opcodes and edge cases
- Total test suite: 59 tests across 4 test files

### Added - Advanced Features

- SAVE_STATE opcode: Push transform state to state stack for nested compositions
- NOISE opcode: Add visual texture/noise at current position (seed-based deterministic)
- SWAP opcode: Swap top two stack values for advanced stack manipulation
- TRIANGLE primitive: Equilateral triangle drawing
- ELLIPSE primitive: Ellipse drawing with separate rx/ry parameters

### Added - UI Components

- Timeline scrubber controls: Play/pause, step forward/back, speed control, reset
- Mutation type badges: Color-coded indicators for mutation classification
- Example loader: Dropdown with 18 built-in examples
- Status notifications: User feedback for operations and errors

## [0.5.0] - 2025-10-12 - Phase A Complete

### Added - Core Engine

- Lexer (`src/lexer.ts`): Tokenize triplets, strip comments, validate reading frame
- VM (`src/vm.ts`): Stack-based execution engine with 64 codon opcodes
- Renderer (`src/renderer.ts`): Canvas2D implementation with drawing primitives and transforms
- Type system (`src/types.ts`): Complete TypeScript interfaces and Opcode enum

### Added - Opcodes (Initial Set)

- **Control flow**: START (ATG), STOP (TAA/TAG/TGA)
- **Drawing primitives**: CIRCLE (GG\*), RECT (CC\*), LINE (AA\*)
- **Transform operations**: TRANSLATE (AC\*), ROTATE (AG\*), SCALE (CG\*), COLOR (TT\*)
- **Stack operations**: PUSH (GA\*), DUP (AT\*), POP (TA\*/TG\*)
- **Utility**: NOP (CA\*)

### Added - Testing Infrastructure

- Lexer tests: 11 tests covering tokenization, frame validation, structure validation
- VM tests: 20 tests covering execution, stack operations, drawing, errors
- Test framework: Vitest with TypeScript support
- Coverage: Core functionality tested with edge cases

### Added - Playground UI

- Interactive editor: Syntax highlighting with Monaco-style textarea
- Live canvas preview: Instant visual feedback on code changes (300ms debounce)
- Example loader: 3 initial examples (Hello Circle, Two Shapes, Colorful Pattern)
- Export functionality: Save canvas as PNG
- Keyboard shortcuts: Cmd/Ctrl+Enter to execute genome
- Status bar: Execution feedback and error reporting

### Added - Documentation

- README.md: Project overview, quick start, codon map reference
- MVP Technical Specification: Complete 64-codon table with pedagogical notes
- Code examples: "Hello Circle" minimal example with explanation

### Technical Details

- **Language**: TypeScript with strict type checking
- **Build tool**: Vite for fast development and bundling
- **Canvas**: HTML5 Canvas API with 2D context
- **Base-4 encoding**: Numeric literals encoded as triplets (A=0, C=1, G=2, T=3)
- **Codon redundancy**: 4-codon families model genetic synonymous codons
- **Reading frame**: Enforced 3-base alignment with mid-triplet break detection

## [0.1.0] - 2025-10-12 - Initial Concept

### Added

- Project vision: DNA-inspired visual programming language
- Pedagogical goals: Make genetic concepts (codons, mutations, reading frames) tangible
- Design principles: Low barrier to entry, immediate feedback, delightful evolution
- Target audience: Secondary/tertiary biology courses, outreach events, maker spaces

### Defined

- Core concepts: Triplet syntax, transcription to opcodes, stack/graphics VM
- Mutation types: Silent, missense, nonsense, frameshift, insertion/deletion
- Codon map: 64 codons mapped to opcode families with redundancy
- Output: 2D graphics on HTML5 canvas (with future audio/plotter extensions)

---

## Semantic Versioning Strategy

- **Major version (1.x.x → 2.x.x)**: Breaking changes to genome format or codon map
- **Minor version (x.1.x → x.2.x)**: New features (opcodes, tools, examples)
- **Patch version (x.x.1 → x.x.2)**: Bug fixes, documentation updates, minor improvements

## Release Notes

### v1.1.0 Highlights

- **Professional documentation**: Educator guides, student handouts, visual codon chart
- **Accessibility**: WCAG 2.1 Level AA compliant for inclusive education
- **Mobile support**: Works on tablets for classroom flexibility
- **18 examples**: Comprehensive pedagogical progression
- **Visual proof**: Screenshots show UI quality for evaluation

### v1.0.0 Highlights

- **Complete Phase B**: All pedagogy tools implemented (mutation lab, timeline, diff viewer)
- **7 mutation types**: Demonstrate all genetic mutation categories
- **59 tests**: Comprehensive test coverage across all modules
- **Genome I/O**: Save/load genomes with metadata for sharing
- **Advanced opcodes**: SAVE_STATE, NOISE, SWAP, TRIANGLE, ELLIPSE

### v0.5.0 Highlights

- **MVP core complete**: Lexer, VM, Renderer, Playground all functional
- **64 codons**: Full codon map with genetic redundancy model
- **Live preview**: Instant visual feedback in web-based editor
- **Test foundation**: 31 initial tests for core functionality
- **Professional codebase**: TypeScript with strict typing, Vitest testing

## Future Roadmap

### v2.1.0 (Planned)

- Alternative backends: Audio synthesis, robot plotter
- Collaborative editing: Real-time multi-user genome editing
- AI-assisted learning: Intelligent hints and suggestions
- Mobile apps: Native iOS/Android versions

### v2.0.0 (Released)

- React 19 SPA migration
- TanStack Router with type-safe navigation
- Tailwind CSS v4 styling
- Comprehensive hook library
- Teacher and Research dashboards

## Contributors

- Autonomous development sessions 1-15 (2025-10-12)
- Technical specification: MVP_Technical_Specification.md
- Concept design: dna_inspired_programming_language_proposal_summary.md
