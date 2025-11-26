# CodonCanvas Teacher Support Guide

**Quick Help:** Most common classroom issues and immediate solutions

---

## Getting Help

### Issue Reporting

**Email:** [your-contact-email]

**What to Include:**

1. Browser type and version (Chrome 120, Firefox 115, Safari 17)
2. Error message (screenshot or exact text)
3. Steps to reproduce the issue
4. What you expected vs what happened

**Example Good Report:**

```
Browser: Chrome 120 on Windows 11
Issue: Student's code won't run - shows "Invalid codon" error
Steps:
1. Student typed: ATG AAX GGG TAA
2. Clicked "Run" button
3. Red error box appeared: "Invalid codon: AAX"
Expected: Clear explanation that "AAX" isn't a valid DNA codon
```

### Response Times

- **Critical Issues** (site down, data loss): 1 hour response
- **High Priority** (feature broken): 4 hours response
- **Normal Issues** (questions, minor bugs): 24 hours response (school days)
- **Feature Requests:** Evaluated during sprint planning

---

## Common Student Issues

### "My code won't run!"

**Most Common Causes:**

#### 1. Invalid Codons (Most Frequent)

**Symptom:** Red linter box shows "Invalid codon: XYZ"

**Solution:**

- Check that all codons use only A, T, G, C letters
- Each codon must be exactly 3 letters
- Spaces separate codons

**Valid:**

```
ATG AAA GGG TAA  ✓
```

**Invalid:**

```
ATG AAX GGG TAA  ✗ (X is not valid)
ATG AA GGG TAA   ✗ (AA is only 2 letters)
ATGAAAGGG TAA    ✗ (missing spaces)
```

#### 2. Missing Start Codon (ATG)

**Symptom:** Error says "Genome must start with ATG"

**Solution:**

- Every genome must begin with ATG (the "start" signal)
- This is like a capital letter starting a sentence

**Correct:**

```
ATG AAA GGG TAA
^-- Must start here
```

#### 3. Missing Stop Codon

**Symptom:** Error says "Genome must end with stop codon"

**Solution:**

- Every genome must end with TAA, TAG, or TGA (stop signals)
- This is like a period ending a sentence

**Correct:**

```
ATG AAA GGG TAA
            ^-- Must end with TAA, TAG, or TGA
```

#### 4. Frameshift Error

**Symptom:** Error about "frameshift" or "must be multiple of 3"

**Solution:**

- Total number of DNA bases must be divisible by 3
- Count all letters (not spaces): should be 3, 6, 9, 12, 15, etc.

**Correct:** 12 letters (4 codons × 3 letters)

```
ATG AAA GGG TAA
```

**Incorrect:** 11 letters

```
ATG AAA GGG TA
              ^-- Missing one letter
```

---

### "Where is my code saved?"

**Answer:**

- Code is saved automatically in your browser's memory (localStorage)
- It stays on **your device** - not in the cloud
- Code remains even if you close the browser
- **IMPORTANT:** Code is lost if you clear browser data or use a different device

**To Keep Code Long-Term:**

1. Click the **Download** button (💾) in the editor
2. Save the `.genome` file to your computer/Google Drive
3. To reload: Click **Upload** button and select the file

**Best Practice for Students:**

- Download work at end of each class period
- Keep backup copies of important projects
- Don't rely on browser storage alone

---

### "Can I share my creation with friends?"

**Yes! Three Ways:**

#### 1. Download File (Recommended)

- Click Download button → Save `.genome` file
- Share file via email, Google Drive, etc.
- Friend uploads file to their CodonCanvas

#### 2. Copy-Paste Code

- Select all code in editor (Ctrl+A / Cmd+A)
- Copy (Ctrl+C / Cmd+C)
- Share in email/chat
- Friend pastes into their editor

#### 3. Screenshot (For Display Only)

- Take screenshot of rendered output
- Cannot be re-run by others
- Good for showing off results

---

### "Nothing appears when I click Run"

**Troubleshooting Steps:**

1. **Check for Errors**
   - Look for red error box below editor
   - Fix any errors before running

2. **Check Viewport**
   - Canvas may be empty if code has no drawing commands
   - Try a working example first: Click "Examples" → "Hello Circle"

3. **Clear Browser Data** (Last Resort)
   - Sometimes helps with weird glitches
   - ⚠️ WARNING: Erases all saved code!
   - Download your work first!

4. **Try Different Browser**
   - Test in Chrome, Firefox, or Safari
   - Report which browsers have issues

---

### "The colors look wrong"

**Check Theme Settings:**

- Look for theme toggle (🌙/☀️) in top-right corner
- Try switching between Light Mode and Dark Mode
- Some displays show colors differently

**If colors still wrong:**

- Try different browser
- Check monitor color calibration
- Report specific color issues (include screenshot)

---

## Teacher Tools

### Achievement System

**View Progress:**

- Click trophy icon (🏆) to see student's achievements
- Tracks genomes created, mutations applied, challenges completed

**Privacy Note:**

- Achievements stored locally on student device
- Teachers cannot view achievements remotely
- Students must show you their screen

### Examples Library

**Teaching Progression:**

1. **Hello Circle** - Minimal working genome
2. **Colorful Pattern** - Basic colors and movement
3. **Triangle Demo** - More complex shapes
4. **Kaleidoscope** - Advanced patterns

**Custom Examples:**

- Create your own teaching examples
- Download and share with students
- Use for demonstrations and starter code

### Tutorial Mode

**Access:** Click "Tutorial" button on home page

**Features:**

- Step-by-step guided lessons
- Interactive challenges
- Immediate feedback
- Tracks completion progress

**Best Practice:**

- Assign tutorials as homework or in-class work
- Students progress at their own pace
- Check completion via achievement system

---

## Classroom Setup

### First Day Setup (per student)

1. **Navigate to Site**
   - Visit: https://codoncanvas.dev
   - Bookmark for easy access

2. **Test Basic Functionality**
   - Click "Examples" → "Hello Circle"
   - Click "Run" → Should see red circle
   - Verify editor and renderer both work

3. **Create First Genome**
   - Clear editor
   - Type: `ATG AAA GGG TAA`
   - Click "Run"
   - Should execute without errors

4. **Test Save/Load**
   - Click Download → Save file
   - Refresh page
   - Click Upload → Load saved file

### Browser Requirements

**Supported Browsers:**

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

**Not Supported:**

- Internet Explorer (any version)
- Very old browsers (>3 years old)

**Required Features:**

- JavaScript enabled
- localStorage enabled (not incognito mode)
- HTML5 Canvas support

### Network Requirements

**Initial Load:**

- ~500KB download (first visit)
- Cached for future visits

**Ongoing Use:**

- Works offline after initial load
- No internet required for code execution
- Examples and tutorials cached locally

**Firewall Settings:**

- Allow: codoncanvas.dev
- No other domains required
- No external API calls

---

## Troubleshooting by Platform

### Chromebooks

**Common Issues:**

- Storage quotas may be lower
- Some older models may be slow

**Solutions:**

- Clear browser data if quota error appears
- Reduce complexity of genomes on older devices
- Use lightweight examples for demos

### iPads/Tablets

**Known Issues:**

- Touch keyboard may cover editor
- Pinch-to-zoom may interfere

**Solutions:**

- Use landscape orientation
- External keyboard recommended
- Disable zoom in browser settings if needed

### School Networks

**Potential Blocks:**

- GitHub Pages may be blocked
- Contact IT to whitelist codoncanvas.dev

**Testing:**

- Have student visit site at home
- If works at home but not school → network block
- Provide documentation to IT department

---

## Known Limitations

### Current Restrictions

1. **No Multi-User Editing**
   - Each student works independently
   - No real-time collaboration features

2. **No Cloud Storage**
   - Code saved only on device
   - Cannot access code from different computer

3. **No Teacher Dashboard** (Yet)
   - Cannot view all student progress centrally
   - Students must show work individually

4. **Browser-Specific**
   - Code not accessible from mobile app
   - Must use web browser

### Workarounds

**For Collaboration:**

- Students share code via file download
- Use screen sharing for peer review

**For Progress Tracking:**

- Students maintain portfolio of downloaded work
- Submit `.genome` files as assignments

**For Multi-Device Access:**

- Students email files to themselves
- Use cloud storage (Google Drive) for backups

---

## Accessibility Support

### Screen Readers

**Current Status:**

- Basic screen reader support implemented
- Keyboard navigation available
- ARIA labels on interactive elements

**Limitations:**

- Visual output (graphics) not described
- May need sighted assistance for verification

### Keyboard Navigation

**Essential Shortcuts:**

- `Tab` - Navigate between controls
- `Enter` - Activate buttons
- `Ctrl/Cmd + S` - Download genome
- `Ctrl/Cmd + O` - Upload genome

### Visual Accommodations

**Available:**

- High contrast mode (system preference detection)
- Dark mode toggle
- Zoom support (browser zoom)

**To Request:**

- Specific color schemes
- Font size adjustments
- Other visual needs

---

## Getting Additional Help

### Documentation Resources

- **README.md** - Project overview and quick start
- **MVP_Technical_Specification.md** - Complete feature documentation
- **OPCODES.md** - All available DNA commands
- **LESSON_PLANS.md** - Curriculum integration guides

### Community Support

- **GitHub Issues:** Report bugs and request features
- **Email:** Direct support for urgent classroom issues

### Professional Development

**Available on Request:**

- Webinar for teacher onboarding
- Video tutorials for classroom integration
- Sample lesson plans and assessment rubrics

**Contact:** [your-email]

---

## Quick Reference Card

**Print and Post Near Computers:**

```
┌─────────────────────────────────────────────┐
│      CodonCanvas Quick Help                 │
├─────────────────────────────────────────────┤
│ Code Won't Run?                             │
│  → Check red error box                      │
│  → All codons need A, T, G, C only          │
│  → Must start with ATG                      │
│  → Must end with TAA, TAG, or TGA           │
│                                              │
│ Where's My Code?                            │
│  → Saved in browser automatically           │
│  → Download (💾) to keep forever            │
│                                              │
│ Need Help?                                  │
│  → Try an Example first                     │
│  → Read the error message                   │
│  → Ask teacher or classmate                 │
│                                              │
│ Site: https://codoncanvas.dev              │
│ Support: [your-email]                       │
└─────────────────────────────────────────────┘
```

---

**Last Updated:** 2025-11-25
**Support Contact:** [your-contact-email]
