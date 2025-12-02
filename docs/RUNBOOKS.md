# CodonCanvas Operational Runbooks

**Purpose:** Incident response procedures and operational workflows for CodonCanvas deployment

---

## Incident Response Overview

**Classification Levels:**

- **P0 (Critical):** Complete site outage, data loss risk
- **P1 (High):** Major feature broken, significant user impact
- **P2 (Medium):** Minor feature broken, workaround available
- **P3 (Low):** Cosmetic issues, no functional impact

**Response Times:**

- P0: Immediate response (< 15 minutes)
- P1: 1 hour response, 4 hour resolution target
- P2: 24 hours response (business days)
- P3: Next sprint planning cycle

---

## P0: Complete Site Down

**Symptoms:**

- codoncanvas.dev returns 404 or 500 errors
- GitHub Pages shows "Site not found"
- All users unable to access application

**Response Procedure:**

### Step 1: Verify Outage (5 min)

```bash
# Check site availability
curl -I https://codoncanvas.dev

# Check GitHub Pages status
# Visit: https://www.githubstatus.com/
```

**Status Indicators:**

- 404 → Deployment configuration issue
- 500 → Build failure or corrupt deployment
- Timeout → DNS or GitHub Pages service issue

### Step 2: Check GitHub Actions (5 min)

```bash
# Navigate to repository
open https://github.com/[your-username]/codoncanvas/actions

# Look for failed workflow runs (red X)
# Click latest workflow → View logs
```

**Common Failures:**

- Build errors → Check error logs for specific failure
- Test failures → See "Tests Failing" runbook below
- Deployment errors → Check GitHub Pages settings

### Step 3: Emergency Rollback (5 min)

If last deployment failed, rollback to previous commit:

```bash
# Identify last working commit
git log --oneline -10

# Revert to last working version
git revert HEAD --no-edit
git push origin master

# Monitor GitHub Actions for successful deployment
```

**Expected Recovery Time:** 5-15 minutes

### Step 4: Root Cause Analysis

After site is restored:

- Review failed deployment logs
- Identify breaking change
- Create issue to fix properly
- Document lessons learned

---

## P1: Critical Feature Broken

**Symptoms:**

- Code editor not working
- Renderer not displaying graphics
- Examples failing to load
- Achievement system broken

**Response Procedure:**

### Step 1: Reproduce Locally (10 min)

```bash
cd /home/kjanat/projects/codoncanvas

# Pull latest changes
git pull origin master

# Install dependencies
bun install

# Run development server
bun dev

# Open browser → localhost:5173
# Attempt to reproduce issue
```

### Step 2: Check Browser Console (5 min)

- Open DevTools (F12)
- Check Console tab for errors
- Note error messages and stack traces
- Check Network tab for failed requests

**Common Errors:**

- `Uncaught TypeError` → JavaScript runtime error
- `Failed to fetch` → Asset loading failure
- `localStorage is not defined` → Storage API issue

### Step 3: Run Test Suite (5 min)

```bash
bun test

# Look for failures related to broken feature
# Tests provide specific failure location
```

### Step 4: Fix and Deploy (30-60 min)

```bash
# Create fix branch
git checkout -b fix/critical-issue

# Make necessary code changes
# Fix identified in Step 2-3

# Run tests to verify fix
bun test

# Build to verify no build errors
bun run build

# Commit and push
git add .
git commit -m "fix: resolve critical issue with [feature]"
git push origin fix/critical-issue

# Create PR → Merge to master
# GitHub Actions deploys automatically
```

**Expected Resolution Time:** 30-90 minutes

---

## P2: Performance Issue

**Symptoms:**

- Slow rendering (>500ms)
- Laggy editor interactions
- Browser freezing during execution

**Response Procedure:**

### Step 1: Measure Performance (15 min)

```bash
# Run benchmark suite
bun run benchmark

# Compare to baseline:
# - Simple genome: <50ms expected
# - Complex genome: <500ms expected
# - Lexer: <20ms expected
```

**Output Analysis:**

```
Lexer: 45ms → Slow (expected <20ms)
Renderer: 120ms → Normal (expected <100ms)
VM: 30ms → Normal (expected <50ms)
```

### Step 2: Profile Bottleneck (30 min)

```bash
# Use browser DevTools Performance profiler
# 1. Open DevTools → Performance tab
# 2. Record while running slow operation
# 3. Analyze flame graph for hot functions
```

**Common Bottlenecks:**

- Renderer state accumulation → Add caching
- Mutation predictor overhead → Optimize algorithm
- Excessive validation → Reduce validation frequency

### Step 3: Optimize and Test (1-2 hours)

```bash
# Make performance improvements
# Most likely: renderer.ts or mutation-predictor.ts

# Re-run benchmarks
bun run benchmark

# Verify improvement (aim for 30%+ reduction)

# Run full test suite
bun test

# Deploy fix
git add .
git commit -m "perf: optimize [component] for 30% speed improvement"
git push origin master
```

**Expected Resolution Time:** 1-3 hours

---

## P2: Tests Failing in CI

**Symptoms:**

- GitHub Actions workflow shows red X
- PRs blocked due to failing tests
- Deployment prevented by test failures

**Response Procedure:**

### Step 1: Identify Failing Tests (5 min)

```bash
# View GitHub Actions logs
# Click "Details" next to failed check
# Scroll to test results section

# Or run locally:
bun test
```

### Step 2: Reproduce Locally (10 min)

```bash
# Run specific failing test
bun test [test-file-name]

# Example:
bun test achievement-engine.test.ts

# Run with verbose output
bun test --reporter=verbose
```

### Step 3: Fix Test or Code (20-40 min)

**If test is broken:**

- Review test expectations
- Update test to match correct behavior
- Ensure test is deterministic (no flakiness)

**If code is broken:**

- Fix code to meet test expectations
- Ensure fix doesn't break other functionality
- Run full test suite before committing

### Step 4: Verify and Deploy (10 min)

```bash
# Run full test suite
bun test

# All tests must pass:
# 443 tests passing

# Commit and push
git add .
git commit -m "fix: resolve test failures in [component]"
git push origin master
```

**Expected Resolution Time:** 30-60 minutes

---

## P3: UI/UX Issues

**Symptoms:**

- Button styling broken
- Layout misaligned
- Accessibility issues
- Dark mode problems

**Response Procedure:**

### Step 1: Document Issue (10 min)

- Take screenshot showing problem
- Note browser and version
- Describe expected vs actual behavior
- Check if issue exists across browsers

### Step 2: Create Issue (5 min)

```bash
# Create GitHub issue with:
# - Screenshot
# - Browser info
# - Steps to reproduce
# - Severity assessment
```

### Step 3: Schedule Fix (next sprint)

- Add to sprint backlog
- Prioritize based on user impact
- Assign to appropriate developer

**Expected Resolution Time:** Next sprint cycle (1-2 weeks)

---

## Emergency Contacts

**Primary Contact:**

- Name: [Your Name]
- Email: [your-email]
- Response Time: Within 1 hour (P0/P1), 24 hours (P2/P3)

**Backup Contact:**

- Name: [Backup Name]
- Email: [backup-email]
- Response Time: Within 2 hours

**Escalation Path:**

1. Primary contact (immediate)
2. Backup contact (if no response in 1 hour)
3. Project stakeholders (if no response in 4 hours)

---

## Monitoring and Alerts

**Manual Monitoring:**

- Check GitHub Actions daily for failed workflows
- Review open issues weekly
- Test critical features after each deployment

**Health Check Procedure:**

```bash
# Weekly health check (5 min)
1. Visit https://codoncanvas.dev
2. Create new genome → Run code
3. Load example genome → Verify rendering
4. Check achievement system → Unlock achievement
5. Test export functionality → Download genome
```

**Success Criteria:**

- All steps complete without errors
- Render time <200ms for typical examples
- No console errors in browser DevTools

---

## Deployment Checklist

**Pre-Deployment:**

- [ ] All tests passing locally (`bun test`)
- [ ] No linter errors (`bun run lint`)
- [ ] Build succeeds (`bun run build`)
- [ ] Manual smoke test completed

**Post-Deployment:**

- [ ] GitHub Actions workflow succeeded
- [ ] Site accessible at codoncanvas.dev
- [ ] Spot check critical features
- [ ] No errors in browser console

**Rollback Criteria:**

- Test failures in CI
- Complete site outage
- Critical feature broken
- Security vulnerability introduced

---

## Common Issues and Quick Fixes

### Issue: localStorage not working

**Cause:** Browser privacy settings or incognito mode
**Fix:** Instruct users to use normal browser mode with cookies enabled

### Issue: Examples not loading

**Cause:** Network issue or broken example files
**Fix:** Check examples/ directory integrity, verify file paths

### Issue: Renderer not displaying

**Cause:** Canvas API issue or missing DOM element
**Fix:** Check canvas element exists, verify browser compatibility

### Issue: Achievements not persisting

**Cause:** localStorage quota exceeded or browser data cleared
**Fix:** Check localStorage quota, implement quota warning

---

## Post-Incident Review

After P0/P1 incidents, conduct post-mortem:

1. **Timeline:** Document incident timeline
2. **Root Cause:** Identify underlying cause
3. **Impact:** Quantify user impact
4. **Resolution:** Document fix applied
5. **Prevention:** Actions to prevent recurrence
6. **Documentation:** Update runbooks with learnings

**Template:** Save in `claudedocs/incident-YYYY-MM-DD.md`

---

## Maintenance Windows

**Planned Maintenance:**

- Schedule during low-usage hours (weekends, evenings)
- Post notification on site 48 hours in advance
- Expected downtime: <30 minutes
- Rollback plan prepared before maintenance

**Emergency Maintenance:**

- Document reason and urgency
- Notify stakeholders immediately
- Complete within 2 hours or rollback
