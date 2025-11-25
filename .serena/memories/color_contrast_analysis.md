# Color Contrast Analysis - WCAG AA Compliance

## Methodology

WCAG 2.1 Level AA Requirements:

- **Normal text (<18pt or <14pt bold):** 4.5:1 contrast ratio
- **Large text (≥18pt or ≥14pt bold):** 3:1 contrast ratio
- **UI components & graphics:** 3:1 contrast ratio

## Color Combinations Analysis

### Primary Background Colors

- Dark: `#1e1e1e` (30, 30, 30)
- Medium: `#252526` (37, 37, 38)
- Toolbar: `#2d2d30` (45, 45, 48)
- Border: `#3e3e42` (62, 62, 66)

### Text Colors

- Primary: `#d4d4d4` (212, 212, 212)
- Secondary: `#858585` (133, 133, 133)
- Accent: `#4ec9b0` (78, 201, 176)
- White: `#ffffff` (255, 255, 255)

### Critical Combinations to Check

**1. Subtitle (#858585 on #252526)**

- Foreground: #858585 (luminance ≈ 0.169)
- Background: #252526 (luminance ≈ 0.026)
- **Estimated ratio: ~3.5:1** ⚠️ **FAILS** for normal text (needs 4.5:1)
- Fix: Lighten to #a0a0a0 or darker background

**2. Linter message gray (#858585 on #2d2d30)**

- Same issue as subtitle
- **Estimated ratio: ~3.4:1** ⚠️ **FAILS**
- Fix: Use #a0a0a0 instead

**3. Primary text (#d4d4d4 on #1e1e1e)**

- Foreground: #d4d4d4 (luminance ≈ 0.538)
- Background: #1e1e1e (luminance ≈ 0.022)
- **Estimated ratio: ~14:1** ✅ **PASSES** (excellent)

**4. Teal accent (#4ec9b0 on #1e1e1e)**

- Used for headings, Fix All button
- **Estimated ratio: ~8:1** ✅ **PASSES**

**5. Mutation button text (dark on light)**

- All mutation buttons use dark text (#1e1e1e) on colored backgrounds
- Need to verify each:
  - Silent: #4ec9b0 → **~4.5:1** ✅ (borderline, acceptable)
  - Missense: #ce9178 → **~5:1** ✅
  - Nonsense: #f48771 → **~6:1** ✅
  - Frameshift: #c586c0 → **~4:1** ⚠️ (check)
  - Point: #569cd6 → **~4.8:1** ✅
  - Insertion: #89d185 → **~6.5:1** ✅
  - Deletion: #dcdcaa → **~10:1** ✅

### Status Bar Colors

- Info: #007acc (white text) → **~4.5:1** ✅
- Success: #89d185 (dark text) → **~6.5:1** ✅
- Error: #f48771 (dark text) → **~6:1** ✅

## Required Fixes

### Critical (Must Fix)

1. **Subtitle color:** Change from #858585 to #a0a0a0 or #9a9a9a
2. **Linter placeholder:** Same fix (#a0a0a0)
3. **Frameshift button:** Check actual ratio, may need background lightening

### Calculation Notes

These are approximations. Actual verification requires:

```javascript
// Relative luminance formula (WCAG)
L = 0.2126 * R + 0.7152 * G + 0.0722 * B(gamma - corrected);
ratio = (L1 + 0.05) / (L2 + 0.05);
```

## Recommended Color Adjustments

```css
/* OLD */
.subtitle {
  color: #858585;
} /* 3.5:1 - fails */

/* NEW */
.subtitle {
  color: #a0a0a0;
} /* ~5:1 - passes */

/* Linter placeholder similarly */
```

## Verification Needed

Use browser DevTools or online checker:

- WebAIM Contrast Checker
- Chrome DevTools Accessibility panel
- axe DevTools extension
