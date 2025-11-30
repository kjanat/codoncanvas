# Genome Tools

CLI utilities for working with `.genome` files.

---

## codon-calc.ts

Convert between values, codons, and colors.

```bash
bun tools/codon-calc.ts value 21        # decimal -> codon
bun tools/codon-calc.ts codon CCC       # codon -> decimal
bun tools/codon-calc.ts color 180 50 50 # HSL -> codon sequence
bun tools/codon-calc.ts position 30 60  # polar coords -> translate codons
bun tools/codon-calc.ts table           # full reference table
```

---

## get-colours.ts

Extract and display all colors from a genome file by executing the VM.

```bash
bun tools/get-colours.ts examples/starfield.genome
```

Shows actual decoded stack values, HSL, and hex for each `TLA` (color) instruction. Output includes clickable file links.

---

## audit-genome-comments.ts

Check for discrepancies between inline comments and actual codon values.

```bash
bun tools/audit-genome-comments.ts
```

Scans all `examples/*.genome` files. Only checks **same-line** comment/code mismatches. Does not detect multi-line comment inconsistencies (e.g., descriptive comment on line N vs code on line N+1).

---

## fix-genome-codons.ts

Auto-fix codons to match comment-intended values.

```bash
bun tools/fix-genome-codons.ts --dry-run  # preview changes
bun tools/fix-genome-codons.ts            # apply fixes
```

Uses same logic as `audit-genome-comments.ts`. Only fixes same-line discrepancies.

---

## genome-validator.ts

Validate genome files for structural correctness.

```bash
bun tools/genome-validator.ts examples/starfield.genome
bun tools/genome-validator.ts --all
```

Checks:

- START codon (ATG) at beginning
- STOP codon (TAA/TAG/TGA) at end
- Balanced SAVE/RESTORE (TCA/TCC vs TCG/TCT)
- Valid codon characters (A, C, G, T only)
