# Contributing to CodonCanvas

Thank you for your interest in contributing to CodonCanvas! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)
- [Performance Guidelines](#performance-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Example Genome Contributions](#example-genome-contributions)
- [Documentation Contributions](#documentation-contributions)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Basic understanding of TypeScript
- Familiarity with HTML5 Canvas (for renderer contributions)
- Understanding of stack-based virtual machines (for VM contributions)

### Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/codoncanvas.git
cd codoncanvas

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/codoncanvas.git

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Run type checking
npm run typecheck
```

### Project Structure

```
codoncanvas/
├── src/
│   ├── lexer/          # Tokenization and parsing
│   ├── vm/             # Virtual machine and opcodes
│   ├── renderer/       # Canvas rendering
│   ├── examples/       # Built-in example genomes
│   └── utils/          # Shared utilities
├── scripts/            # Build and utility scripts
├── examples/           # Exported .genome files
├── docs/               # Documentation
└── tests/              # Test files
```

## Development Workflow

### Creating a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features or enhancements
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `perf/` - Performance improvements
- `refactor/` - Code refactoring
- `test/` - Test additions or improvements

### Development Commands

```bash
# Start dev server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Type checking
npm run typecheck

# Lint code
npm run lint

# Run performance benchmarks
npm run benchmark
```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout master
git merge upstream/master
git push origin master
```

## Code Style

### TypeScript Standards

- Use TypeScript strict mode (already configured)
- Prefer interfaces over types for object shapes
- Use explicit return types for functions
- Avoid `any` - use `unknown` if necessary
- Use const assertions where appropriate

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `codon-lexer.ts`)
- **Classes**: `PascalCase` (e.g., `CodonLexer`)
- **Interfaces**: `PascalCase` (e.g., `VMState`)
- **Functions**: `camelCase` (e.g., `tokenize()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `CODON_MAP`)

### Code Organization

- One class/interface per file
- Group related functionality
- Keep files under 300 lines where possible
- Extract complex logic into separate functions
- Use JSDoc comments for public APIs

### Example Code Style

```typescript
/**
 * Tokenizes a source genome into codons.
 * @param source - The raw genome string to tokenize
 * @returns Array of codon tokens with position metadata
 * @throws {ParseError} If invalid characters or frame breaks detected
 */
export function tokenize(source: string): CodonToken[] {
  const cleaned = cleanSource(source);

  if (cleaned.length % 3 !== 0) {
    throw new ParseError('Invalid reading frame', cleaned.length);
  }

  return chunkIntoCodons(cleaned);
}
```

## Testing Requirements

### Test Coverage

- All new features must include tests
- Bug fixes must include regression tests
- Aim for >90% code coverage for new code
- Test both success and failure cases

### Test Organization

```typescript
import { describe, test, expect } from 'vitest';
import { CodonLexer } from '../src/lexer/codon-lexer';

describe('CodonLexer', () => {
  describe('tokenize', () => {
    test('handles valid triplets', () => {
      const lexer = new CodonLexer();
      const result = lexer.tokenize('ATG GGA TAA');
      expect(result).toHaveLength(3);
    });

    test('throws on invalid frame', () => {
      const lexer = new CodonLexer();
      expect(() => lexer.tokenize('ATG GG')).toThrow('Invalid reading frame');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode during development
npm run test:watch

# With UI for debugging
npm run test:ui

# Before committing
npm run typecheck && npm run test
```

## Performance Guidelines

### Performance Standards

CodonCanvas maintains high performance standards:
- Lexer overhead: <1% of total execution time
- VM throughput: >70,000 codons/sec (simple) or >300,000 codons/sec (complex)
- Educational genomes (10-500 codons): <10ms execution time
- Real-time capability: >500 FPS for typical student genomes

### Performance Testing

```bash
# Run benchmarks before making changes
npm run benchmark > before.txt

# Make your changes
# ...

# Run benchmarks after changes
npm run benchmark > after.txt

# Compare results
diff before.txt after.txt
```

### Optimization Guidelines

- Profile before optimizing (don't guess bottlenecks)
- Focus on algorithmic improvements over micro-optimizations
- Rendering is the primary bottleneck (95%+ of execution time)
- Stack operations and VM logic are already highly optimized
- See [PERFORMANCE.md](PERFORMANCE.md) for detailed performance analysis

## Pull Request Process

### Before Submitting

1. **Update from upstream**: `git fetch upstream && git rebase upstream/master`
2. **Run all checks**:
   ```bash
   npm run typecheck
   npm run test
   npm run benchmark  # If making performance-related changes
   ```
3. **Update documentation**: Update README, JSDoc, or other docs as needed
4. **Write clear commit messages**: Follow format below

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `perf`: Performance improvement
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build process or auxiliary tool changes

**Example:**
```
feat(vm): Add SWAP opcode for stack manipulation

Implements SWAP operation to exchange top two stack values.
Useful for advanced compositions requiring parameter reordering.

- Add SWAP to Opcode enum
- Implement swap logic in VM.execute()
- Add tests for stack underflow cases
- Update codon map (TGG, TGT → SWAP)
- Document in README and codon chart

Closes #42
```

### Pull Request Template

When creating a PR, include:

```markdown
## Description
[Clear description of changes]

## Type of Change
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to change)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally (`npm run test`)
- [ ] Type checking passes (`npm run typecheck`)
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Performance Impact
- [ ] No performance impact
- [ ] Performance improved (include benchmark results)
- [ ] Performance regression acceptable (explain why)

## Documentation
- [ ] JSDoc comments added/updated
- [ ] README.md updated (if needed)
- [ ] CHANGELOG.md updated (if needed)

## Screenshots (if applicable)
[Include before/after screenshots for visual changes]
```

### PR Review Process

1. Automated checks must pass (tests, type checking)
2. At least one maintainer review required
3. Address all review comments or explain why not
4. Keep PR scope focused (one feature/fix per PR)
5. Rebase on master before merging (no merge commits)

## Issue Guidelines

### Bug Reports

```markdown
**Describe the bug**
Clear and concise description of the bug.

**To Reproduce**
Steps to reproduce:
1. Open playground
2. Enter genome: `ATG GGA TAA`
3. Click run
4. See error

**Expected behavior**
What you expected to happen.

**Actual behavior**
What actually happened.

**Genome (if applicable)**
```
ATG GGA TAA
```

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14]
- CodonCanvas version: [e.g., 1.0.0]

**Screenshots**
[If applicable]
```

### Feature Requests

```markdown
**Problem Statement**
What problem does this solve?

**Proposed Solution**
How would you solve it?

**Alternatives Considered**
Other approaches you've thought about.

**Educational Value**
How does this enhance the learning experience?

**Additional Context**
Any other relevant information.
```

## Example Genome Contributions

### Criteria for Example Genomes

1. **Educational Value**: Demonstrates a concept clearly
2. **Appropriate Complexity**: Matches target difficulty level (beginner/intermediate/advanced)
3. **Visual Interest**: Produces engaging output
4. **Well-Commented**: Explains what each section does
5. **Correct Syntax**: Passes linter validation

### Example Genome Template

```typescript
{
  name: "Descriptive Name",
  difficulty: "beginner", // or "intermediate" or "advanced"
  description: "Clear explanation of what this demonstrates",
  code: `
; Purpose: Demonstrate [concept]
; Learning Goal: Understand [goal]

ATG               ; Start
  GAA CCC         ; Push 21
  GGA             ; Draw circle (radius 21)
TAA               ; Stop
  `,
  pedagogyNotes: "Optional teaching tips for educators"
}
```

### Adding Examples

1. Add to `src/examples/example-genomes.ts`
2. Test in playground
3. Add to `scripts/export-examples.ts` metadata
4. Run `npm run export-examples` to generate .genome file
5. Include screenshot in PR

## Documentation Contributions

### Documentation Areas

- **README.md**: User-facing overview and quick start
- **EDUCATORS.md**: Teaching guide for instructors
- **STUDENT_HANDOUTS.md**: Student reference materials
- **JSDoc**: Inline API documentation
- **PERFORMANCE.md**: Performance characteristics
- **Code comments**: Explain complex logic

### Documentation Standards

- Use clear, concise language
- Include code examples where helpful
- Keep line length under 100 characters
- Use proper markdown formatting
- Test all code examples
- Consider international audience (avoid idioms)

### API Documentation (JSDoc)

All public APIs must include JSDoc:

```typescript
/**
 * Execute a single opcode instruction.
 *
 * Updates VM state including stack, position, rotation, scale, and color
 * based on the opcode type. Renders to canvas for drawing primitives.
 *
 * @param opcode - The opcode to execute
 * @param codon - The source codon (used for error messages)
 * @throws {Error} If stack underflow or instruction limit exceeded
 *
 * @example
 * ```typescript
 * vm.execute(Opcode.CIRCLE, 'GGA');
 * ```
 */
execute(opcode: Opcode, codon: Codon): void {
  // Implementation
}
```

## Questions?

- Open a discussion on GitHub for questions
- Check existing issues and PRs for related work
- Read the full documentation in README.md and docs/

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- CHANGELOG.md (for significant contributions)
- Special thanks section in README (for major features)

Thank you for contributing to CodonCanvas! Your efforts help make genetic concepts more accessible and engaging for learners everywhere. 🧬
