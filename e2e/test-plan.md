# CodonCanvas E2E Test Plan

## Application Overview

CodonCanvas is a DNA-inspired visual programming language web application targeting educators and students. It features a code editor with genome syntax, canvas rendering for visual output, multiple interactive demos (mutation, timeline, evolution, population genetics, genetic algorithm, achievements, assessment), a tutorial system with progressive lessons, an example gallery with 39 examples, and educational dashboards for teachers and researchers.

## Test Scenarios

### 1. Core Playground

**Seed:** `e2e/seed.spec.ts`

#### 1.1. loads-application-with-default-state

**File:** `e2e/playground/loads-application.spec.ts`

**Steps:**

1. Navigate to http://127.0.0.1:5173/
2. Verify page title contains 'CodonCanvas'
3. Verify editor textbox is visible with placeholder text
4. Verify 'Run' button is present
5. Verify 'Output' canvas section is present
6. Verify navigation links (Playground, Gallery, Tutorial, Demos) are present

**Expected Results:**

- Page title is 'CodonCanvas - DNA-Inspired Visual Programming'
- Editor contains default genome 'ATG GAA AAT GGA TAA'
- Validation indicator shows 'Valid'
- Codon count shows '5 codons, 4 instructions'

#### 1.2. editor-typing-and-validation

**File:** `e2e/playground/editor-validation.spec.ts`

**Steps:**

1. Navigate to playground
2. Clear the editor textbox
3. Type invalid genome 'ATG XXX TAA'
4. Verify validation shows error
5. Clear editor and type valid genome 'ATG GAA CCC GGA TAA'
6. Verify validation shows valid

**Expected Results:**

- Invalid codon shows validation error
- Valid genome shows 'Valid' status
- Codon count updates correctly

#### 1.3. run-genome-renders-canvas

**File:** `e2e/playground/run-genome.spec.ts`

**Steps:**

1. Navigate to playground
2. Ensure default genome is loaded
3. Click 'Run' button
4. Wait for canvas to render

**Expected Results:**

- Canvas image updates after run
- No console errors during execution

#### 1.4. clear-canvas

**File:** `e2e/playground/clear-canvas.spec.ts`

**Steps:**

1. Navigate to playground
2. Run the default genome
3. Click 'Clear' button in output section

**Expected Results:**

- Canvas is cleared/reset to blank state

#### 1.5. undo-redo-functionality

**File:** `e2e/playground/undo-redo.spec.ts`

**Steps:**

1. Navigate to playground
2. Verify Undo button is initially disabled
3. Type additional codons in editor
4. Verify Undo button becomes enabled
5. Click Undo button
6. Verify Redo button becomes enabled
7. Click Redo button

**Expected Results:**

- Undo restores previous editor state
- Redo restores the undone change
- Button states update correctly

#### 1.6. nucleotide-mode-toggle

**File:** `e2e/playground/nucleotide-mode.spec.ts`

**Steps:**

1. Navigate to playground
2. Verify initial mode shows 'DNA'
3. Click RNA/DNA toggle button
4. Verify mode changes to 'RNA'
5. Hover over toggle to see tooltip explanation

**Expected Results:**

- Toggle switches between DNA and RNA modes
- Tooltip shows mode-specific information

#### 1.7. codon-reference-panel

**File:** `e2e/playground/codon-reference.spec.ts`

**Steps:**

1. Navigate to playground
2. Click 'Reference' button
3. Verify reference panel opens
4. Search for 'CIRCLE' in search box
5. Click category filter (e.g., 'Drawing')
6. Click a codon button (e.g., 'GGA')

**Expected Results:**

- Reference panel displays all codon categories
- Search filters codons correctly
- Category buttons filter by type
- Clicking codon inserts it into editor

### 2. File Operations

**Seed:** `e2e/seed.spec.ts`

#### 2.1. load-example-from-dropdown

**File:** `e2e/file-operations/load-example.spec.ts`

**Steps:**

1. Navigate to playground
2. Open example selector dropdown
3. Select 'Hello Circle' option
4. Verify genome code loads in editor
5. Verify example info panel appears

**Expected Results:**

- URL updates to include ?example=helloCircle
- Editor contains Hello Circle genome code
- Info panel shows title, description, and difficulty tag

#### 2.2. save-genome-file

**File:** `e2e/file-operations/save-genome.spec.ts`

**Steps:**

1. Navigate to playground
2. Enter custom genome in editor
3. Click 'Save' button

**Expected Results:**

- Browser downloads a .genome file
- File contains the editor content

#### 2.3. copy-genome-code

**File:** `e2e/file-operations/copy-genome.spec.ts`

**Steps:**

1. Navigate to playground
2. Enter genome code
3. Click 'Copy' button

**Expected Results:**

- Button shows feedback (copied state)
- Clipboard contains genome code

#### 2.4. share-link-generation

**File:** `e2e/file-operations/share-link.spec.ts`

**Steps:**

1. Navigate to playground
2. Enter genome code
3. Click 'Share' button

**Expected Results:**

- Shareable link is generated/copied
- Link contains encoded genome data

#### 2.5. export-canvas-as-png

**File:** `e2e/file-operations/export-png.spec.ts`

**Steps:**

1. Navigate to playground
2. Run a genome to render output
3. Click 'Export PNG' button

**Expected Results:**

- Browser downloads a PNG file
- Image contains canvas content

### 3. Example Gallery

**Seed:** `e2e/seed.spec.ts`

#### 3.1. gallery-page-loads

**File:** `e2e/gallery/gallery-loads.spec.ts`

**Steps:**

1. Navigate to /gallery
2. Verify page heading 'Example Gallery'
3. Verify example count displays correctly
4. Verify example cards are visible

**Expected Results:**

- Page shows 'Browse 39 examples'
- Example cards show title, description, and difficulty

#### 3.2. filter-by-difficulty

**File:** `e2e/gallery/filter-difficulty.spec.ts`

**Steps:**

1. Navigate to /gallery
2. Click 'Beginner' radio button
3. Verify only beginner examples shown
4. Click 'Advanced' radio button
5. Verify only advanced examples shown
6. Click 'All Examples' to reset

**Expected Results:**

- Filtering reduces visible examples
- Each filter shows correct subset
- Difficulty badges match filter

#### 3.3. search-examples

**File:** `e2e/gallery/search-examples.spec.ts`

**Steps:**

1. Navigate to /gallery
2. Type 'spiral' in search box
3. Verify filtered results contain spiral examples
4. Clear search and verify all examples return

**Expected Results:**

- Search filters examples by name/description
- Results update in real-time

#### 3.4. sort-examples

**File:** `e2e/gallery/sort-examples.spec.ts`

**Steps:**

1. Navigate to /gallery
2. Select 'Name A-Z' from sort dropdown
3. Verify alphabetical ordering
4. Select 'Difficulty (Easy first)'
5. Verify difficulty ordering

**Expected Results:**

- Sort changes example card order
- Examples reorder without page reload

#### 3.5. load-example-from-gallery

**File:** `e2e/gallery/load-from-gallery.spec.ts`

**Steps:**

1. Navigate to /gallery
2. Click on 'Fibonacci Spiral' example card
3. Verify navigation to playground
4. Verify example code loads

**Expected Results:**

- User redirected to playground
- URL includes example parameter
- Editor contains example code

### 4. Tutorial System

**Seed:** `e2e/seed.spec.ts`

#### 4.1. tutorial-page-structure

**File:** `e2e/tutorial/tutorial-structure.spec.ts`

**Steps:**

1. Navigate to /tutorial
2. Verify lesson sidebar with modules
3. Verify progress indicator shows 0%
4. Verify first lesson content loads

**Expected Results:**

- Three modules visible (First Steps, Mutations, Advanced)
- Progress bar shows 0/10 lessons
- Module 1 Lesson 1 content displays

#### 4.2. navigate-between-lessons

**File:** `e2e/tutorial/lesson-navigation.spec.ts`

**Steps:**

1. Navigate to /tutorial
2. Click on lesson '2.Moving Around - TRANSLATE'
3. Verify lesson content updates
4. Click on Module 2 lesson

**Expected Results:**

- Lesson content changes correctly
- Instructions and objectives update
- Code editor resets for new lesson

#### 4.3. lesson-code-validation

**File:** `e2e/tutorial/lesson-validation.spec.ts`

**Steps:**

1. Navigate to /tutorial on first lesson
2. Type correct solution in lesson editor
3. Click 'Run & Validate' button

**Expected Results:**

- Validation checks submitted code
- Success feedback on correct answer

#### 4.4. hint-system

**File:** `e2e/tutorial/hints.spec.ts`

**Steps:**

1. Navigate to /tutorial
2. Click 'Show hint' button
3. Verify hint content displays
4. Click again for additional hints

**Expected Results:**

- Hints reveal progressively
- Hint counter updates (1/3, 2/3, etc.)

### 5. Demos - Mutation Lab

**Seed:** `e2e/seed.spec.ts`

#### 5.1. mutation-lab-page-loads

**File:** `e2e/demos/mutation-lab-loads.spec.ts`

**Steps:**

1. Navigate to /demos/mutation
2. Verify page heading 'Mutation Laboratory'
3. Verify mutation type buttons are visible
4. Verify original genome textarea is present

**Expected Results:**

- Mutation type buttons: Silent, Missense, Nonsense, Point, Insertion, Deletion, Frameshift
- Original and Mutated genome panels visible
- Codon visualization displays

#### 5.2. apply-silent-mutation

**File:** `e2e/demos/mutation-silent.spec.ts`

**Steps:**

1. Navigate to /demos/mutation
2. Click 'Silent' mutation button
3. Click 'Apply Mutation' button
4. Compare original and mutated genomes

**Expected Results:**

- Mutation is applied to genome
- Codon changes but output remains same
- 'No differences found' message or identical output

#### 5.3. apply-missense-mutation

**File:** `e2e/demos/mutation-missense.spec.ts`

**Steps:**

1. Navigate to /demos/mutation
2. Click 'Missense' mutation button
3. Click 'Apply Mutation'
4. Compare visual outputs

**Expected Results:**

- Mutation changes codon function
- Visual output differs between original and mutated
- Difference highlighted in codon display

#### 5.4. apply-frameshift-mutation

**File:** `e2e/demos/mutation-frameshift.spec.ts`

**Steps:**

1. Navigate to /demos/mutation
2. Click 'Frameshift' mutation button
3. Click 'Apply Mutation'
4. Observe downstream changes

**Expected Results:**

- Reading frame shifts
- Multiple downstream codons affected
- Visual output significantly different

### 6. Demos - Timeline Scrubber

**Seed:** `e2e/seed.spec.ts`

#### 6.1. timeline-demo-loads

**File:** `e2e/demos/timeline-loads.spec.ts`

**Steps:**

1. Navigate to /demos/timeline
2. Verify genome textbox is present
3. Verify 'Run & Capture Timeline' button exists

**Expected Results:**

- Default genome code is loaded
- VM State panel shows placeholder message

#### 6.2. run-and-capture-timeline

**File:** `e2e/demos/timeline-capture.spec.ts`

**Steps:**

1. Navigate to /demos/timeline
2. Click 'Run & Capture Timeline' button
3. Verify timeline controls appear
4. Verify VM state updates

**Expected Results:**

- Step counter shows 'Step 1 of N'
- VM state displays Position, Rotation, Scale, Color, Stack
- Playback controls are enabled

#### 6.3. timeline-navigation-controls

**File:** `e2e/demos/timeline-controls.spec.ts`

**Steps:**

1. Run timeline demo
2. Click 'Next step' button multiple times
3. Click 'Previous step' button
4. Click 'Reset to start' button
5. Use slider to jump to specific step
6. Click 'Play' to auto-advance

**Expected Results:**

- Step counter updates correctly
- Previous disabled at step 1
- Reset returns to step 1
- Slider enables random access
- Play auto-advances through steps

#### 6.4. timeline-playback-speed

**File:** `e2e/demos/timeline-speed.spec.ts`

**Steps:**

1. Run timeline demo
2. Select '2x' playback speed
3. Click Play
4. Select '0.5x' speed

**Expected Results:**

- Playback speed changes accordingly
- Speed dropdown shows selected value

### 7. Demos - Assessment Mode

**Seed:** `e2e/seed.spec.ts`

#### 7.1. assessment-page-loads

**File:** `e2e/demos/assessment-loads.spec.ts`

**Steps:**

1. Navigate to /demos/assessment
2. Verify heading 'Assessment Mode'
3. Verify difficulty buttons (Easy, Medium, Hard)
4. Verify mutation types reference section

**Expected Results:**

- Settings panel with difficulty options
- 'Start Challenge' button visible
- Reference shows 7 mutation types

#### 7.2. start-assessment-challenge

**File:** `e2e/demos/assessment-start.spec.ts`

**Steps:**

1. Navigate to /demos/assessment
2. Select 'Easy' difficulty
3. Click 'Start Challenge' button
4. Verify challenge UI appears

**Expected Results:**

- Original and Mutated genome panels display
- Question 'What type of mutation occurred?' appears
- Answer options are clickable buttons

#### 7.3. submit-assessment-answer

**File:** `e2e/demos/assessment-submit.spec.ts`

**Steps:**

1. Start an assessment challenge
2. Click one of the mutation type answers
3. Click 'Submit Answer' button

**Expected Results:**

- Submit button becomes enabled after selection
- Feedback shows if answer is correct/incorrect
- Score or progress updates

#### 7.4. assessment-hint-system

**File:** `e2e/demos/assessment-hints.spec.ts`

**Steps:**

1. Start an assessment challenge
2. Click 'Show Hint' button

**Expected Results:**

- Hint provides guidance without revealing answer

### 8. Demos - Evolution Lab

**Seed:** `e2e/seed.spec.ts`

#### 8.1. evolution-lab-loads

**File:** `e2e/demos/evolution-loads.spec.ts`

**Steps:**

1. Navigate to /demos/evolution
2. Verify page loads with parent genome panel
3. Verify candidate generation UI

**Expected Results:**

- Evolution Lab heading visible
- Parent genome display present
- Controls for generating mutations

### 9. Demos - Population Genetics

**Seed:** `e2e/seed.spec.ts`

#### 9.1. population-genetics-loads

**File:** `e2e/demos/population-loads.spec.ts`

**Steps:**

1. Navigate to /demos/population
2. Verify allele frequency visualization
3. Verify generation controls

**Expected Results:**

- Population panel displays
- Allele frequencies shown
- Educational content visible

### 10. Demos - Genetic Algorithm

**Seed:** `e2e/seed.spec.ts`

#### 10.1. genetic-algorithm-loads

**File:** `e2e/demos/genetic-loads.spec.ts`

**Steps:**

1. Navigate to /demos/genetic
2. Verify population grid
3. Verify fitness chart
4. Verify parameter controls

**Expected Results:**

- Population visualization displays
- Fitness tracking chart visible
- Configurable parameters available

### 11. Demos - Achievements

**Seed:** `e2e/seed.spec.ts`

#### 11.1. achievements-page-loads

**File:** `e2e/demos/achievements-loads.spec.ts`

**Steps:**

1. Navigate to /demos/achievements
2. Verify achievements grid
3. Verify progress/stats panel

**Expected Results:**

- Achievement cards displayed
- Progress tracking visible
- Unlock notifications system present

### 12. Dashboards

**Seed:** `e2e/seed.spec.ts`

#### 12.1. learning-paths-dashboard

**File:** `e2e/dashboards/learning-paths.spec.ts`

**Steps:**

1. Navigate to /dashboards/learning
2. Verify 4 learning paths displayed
3. Verify progress indicators
4. Click 'Continue Learning' on a path

**Expected Results:**

- DNA Fundamentals, Visual Programming, Nature's Algorithms, Mathematical Beauty paths visible
- Progress percentages shown
- Clicking navigates to playground with path parameter

#### 12.2. teacher-dashboard-empty-state

**File:** `e2e/dashboards/teacher-empty.spec.ts`

**Steps:**

1. Navigate to /dashboards/teacher
2. Verify empty state message
3. Verify import and demo data options

**Expected Results:**

- 'No Student Data Imported' message displayed
- 'Import Files' and 'Load Demo Data' buttons visible

#### 12.3. teacher-dashboard-load-demo

**File:** `e2e/dashboards/teacher-demo.spec.ts`

**Steps:**

1. Navigate to /dashboards/teacher
2. Click 'Load Demo Data' button
3. Verify dashboard populates with data

**Expected Results:**

- Demo student data loads
- Analytics and progress tables display

#### 12.4. research-dashboard-loads

**File:** `e2e/dashboards/research.spec.ts`

**Steps:**

1. Navigate to /dashboards/research
2. Verify research analytics interface

**Expected Results:**

- Research dashboard displays
- Metrics and data visualization present

### 13. Navigation and Layout

**Seed:** `e2e/seed.spec.ts`

#### 13.1. main-navigation-links

**File:** `e2e/navigation/main-nav.spec.ts`

**Steps:**

1. Navigate to homepage
2. Click 'Gallery' link and verify URL
3. Click 'Tutorial' link and verify URL
4. Click 'Demos' link and verify URL
5. Click 'Playground' link (logo) and verify URL

**Expected Results:**

- Each link navigates to correct route
- Active state shows on current page link

#### 13.2. more-dropdown-menu

**File:** `e2e/navigation/more-dropdown.spec.ts`

**Steps:**

1. Click 'More' button in navigation
2. Verify dropdown shows Demos submenu
3. Verify dropdown shows Dashboards submenu
4. Click a link from dropdown

**Expected Results:**

- Dropdown opens with two sections
- Demos: Mutation Lab, Timeline, Evolution, Population, Genetic Algorithm
- Dashboards: Learning Paths, Teacher Dashboard, Research

#### 13.3. theme-toggle

**File:** `e2e/navigation/theme-toggle.spec.ts`

**Steps:**

1. Click theme toggle button
2. Verify theme changes (system -> light -> dark)
3. Verify visual styling updates

**Expected Results:**

- Button label updates to show current theme
- Page styling changes accordingly

#### 13.4. github-link

**File:** `e2e/navigation/github-link.spec.ts`

**Steps:**

1. Verify GitHub link in header
2. Verify link points to correct repository

**Expected Results:**

- Link has correct href to github.com/kjanat/codoncanvas

#### 13.5. footer-content

**File:** `e2e/navigation/footer.spec.ts`

**Steps:**

1. Scroll to page footer
2. Verify CodonCanvas branding
3. Verify creator attribution link

**Expected Results:**

- Footer shows 'CodonCanvas - DNA-Inspired Visual Programming'
- Creator link points to github.com/kjanat

### 14. Error Handling

**Seed:** `e2e/seed.spec.ts`

#### 14.1. invalid-genome-syntax

**File:** `e2e/errors/invalid-syntax.spec.ts`

**Steps:**

1. Navigate to playground
2. Enter genome with invalid codons
3. Observe validation feedback

**Expected Results:**

- Validation shows error state
- Error message indicates invalid codon
- Run button may be disabled or show warning

#### 14.2. incomplete-genome-structure

**File:** `e2e/errors/incomplete-genome.spec.ts`

**Steps:**

1. Enter genome without START codon (ATG)
2. Enter genome without STOP codon
3. Observe validation

**Expected Results:**

- Missing START/STOP produces appropriate warning
- User receives clear feedback on required structure

#### 14.3. 404-not-found-page

**File:** `e2e/errors/not-found.spec.ts`

**Steps:**

1. Navigate to non-existent route like /nonexistent
2. Verify 404 page displays

**Expected Results:**

- NotFound page component renders
- User can navigate back to valid routes

#### 14.4. console-errors-during-execution

**File:** `e2e/errors/console-errors.spec.ts`

**Steps:**

1. Run various genome examples
2. Monitor browser console for errors

**Expected Results:**

- No JavaScript errors during normal execution
- Genome errors handled gracefully without crashes

### 15. Accessibility

**Seed:** `e2e/seed.spec.ts`

#### 15.1. keyboard-navigation

**File:** `e2e/accessibility/keyboard-nav.spec.ts`

**Steps:**

1. Use Tab key to navigate through page elements
2. Use Enter/Space to activate buttons
3. Navigate dropdown menus with arrow keys

**Expected Results:**

- All interactive elements are focusable
- Focus indicators are visible
- Dropdowns are keyboard accessible

#### 15.2. aria-labels-present

**File:** `e2e/accessibility/aria-labels.spec.ts`

**Steps:**

1. Verify buttons have aria-labels
2. Verify form inputs have labels
3. Verify images have alt text

**Expected Results:**

- All buttons have descriptive aria-labels
- Editor textbox has 'Genome editor' label
- Canvas has 'Genome execution output' alt

#### 15.3. screen-reader-landmarks

**File:** `e2e/accessibility/landmarks.spec.ts`

**Steps:**

1. Verify page has proper landmark regions
2. Check for banner, main, contentinfo roles

**Expected Results:**

- Header uses banner role
- Main content area uses main role
- Footer uses contentinfo role

### 16. Responsive Design

**Seed:** `e2e/seed.spec.ts`

#### 16.1. mobile-viewport-layout

**File:** `e2e/responsive/mobile-layout.spec.ts`

**Steps:**

1. Set viewport to mobile size (375x667)
2. Navigate through main pages
3. Verify layout adapts appropriately

**Expected Results:**

- Navigation collapses or adapts
- Editor and canvas stack vertically
- All content remains accessible

#### 16.2. tablet-viewport-layout

**File:** `e2e/responsive/tablet-layout.spec.ts`

**Steps:**

1. Set viewport to tablet size (768x1024)
2. Navigate through main pages

**Expected Results:**

- Layout adjusts for medium screens
- Side-by-side layouts may stack
