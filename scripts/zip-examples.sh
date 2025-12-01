#!/bin/bash
# Create distribution ZIP of example .genome files

set -e

OUTPUT="codoncanvas-examples.zip"
TEMP_DIR="codoncanvas-examples"

echo "📦 Creating CodonCanvas Examples distribution..."

# Clean old artifacts
rm -rf "${TEMP_DIR}" "${OUTPUT}"

# Create temp directory structure
mkdir -p "${TEMP_DIR}"

# Copy examples
cp -r examples/* "${TEMP_DIR}/"

# Copy codon chart reference
cp codon-chart.svg "${TEMP_DIR}/"

# Copy quick start from student handouts (extract relevant section)
cat >"${TEMP_DIR}/QUICK_START.txt" <<'EOF'
CodonCanvas Quick Start
=======================

STEP 1: Open CodonCanvas
   Web: https://codoncanvas.org
   Local: Open index.html in browser

STEP 2: Load an Example
   - Click "Load Example" button
   - Or drag-and-drop a .genome file

STEP 3: Run the Program
   - Click ▶ (Play) button
   - Watch visual output appear on canvas

STEP 4: Experiment
   - Change codons and re-run
   - Try mutations (see examples/README.md)
   - Save your work (Download button)

NEED HELP?
- See codon-chart.svg for complete reference
- See examples/README.md for mutation experiments
- All programs must start with ATG and end with TAA/TAG/TGA
- Only use bases A, C, G, T
- Total length must be divisible by 3

CLASSROOM USE:
See EDUCATORS.md and STUDENT_HANDOUTS.md for lesson plans
EOF

# Create distribution info
BUILD_DATE=$(date +%Y-%m-%d) || true
cat >"${TEMP_DIR}/VERSION.txt" <<EOF
CodonCanvas Example Programs
Version: 1.0.0
Date: ${BUILD_DATE}
Contents: 18 example .genome files + documentation
License: MIT

For more information:
- README.md: Overview of all examples
- codon-chart.svg: Visual reference poster
- QUICK_START.txt: Getting started guide

Web: https://codoncanvas.org
Docs: https://github.com/codoncanvas/codoncanvas
EOF

# Create ZIP
zip -r "${OUTPUT}" "${TEMP_DIR}" >/dev/null

# Cleanup
rm -rf "${TEMP_DIR}"

# Report
SIZE=$(du -h "${OUTPUT}" | cut -f1) || true
SIZE=${SIZE:-unknown}
echo "✅ Created ${OUTPUT} (${SIZE})"
echo "📊 Contents:"
echo "   - 18 example .genome files"
echo "   - examples/README.md (usage guide)"
echo "   - codon-chart.svg (reference poster)"
echo "   - QUICK_START.txt (beginner guide)"
echo "   - VERSION.txt (distribution info)"
echo ""
echo "📤 Ready for distribution!"
echo "   Classroom: Upload to LMS or share via Google Drive"
echo "   Web: Host on codoncanvas.org/downloads/"
