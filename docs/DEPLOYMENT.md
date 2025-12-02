# CodonCanvas Deployment Guide

This guide explains how to deploy CodonCanvas to GitHub Pages for public access.

## Prerequisites

- GitHub account
- Git installed locally
- Node.js 20+ or Bun 1.0+ installed

## Quick Deployment Steps

### 1. Create GitHub Repository

```bash
# On GitHub, create a new repository named 'codoncanvas'
# DO NOT initialize with README (we already have one)

# Then locally, add the remote:
git remote add origin https://github.com/YOUR_USERNAME/codoncanvas.git
git branch -M master
git push -u origin master
```

### 2. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy on every push to `master`

### 3. Update Social Sharing URLs

After deployment, update the following files to use your actual GitHub Pages URL:

**In `index.html`** (lines 14, 17, 21, 24):

- Replace `https://yourusername.github.io/codoncanvas/` with your actual URL

**In `vite.config.ts`** (line 6):

- Base path is already set to `/codoncanvas/` for GitHub Pages
- If deploying to custom domain, change this to `/`

### 4. Push Changes

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

### 5. Wait for Deployment

- Go to **Actions** tab in GitHub repository
- Watch the "Deploy to GitHub Pages" workflow run
- Deployment typically takes 2-3 minutes
- Once complete, your site will be live at: `https://YOUR_USERNAME.github.io/codoncanvas/`

## Deployment Architecture

### GitHub Actions Workflow

Location: `.github/workflows/deploy.yml`

**Build Job:**

1. Checkout code
2. Setup Bun
3. Install dependencies (`bun install --frozen-lockfile`)
4. Run tests (`bun test`) - fails deployment if tests fail
5. Build production bundle (`bun run build`)
6. Upload artifact for deployment

**Deploy Job:**

1. Deploy artifact to GitHub Pages
2. Set environment URL for easy access

### Vite Configuration

Location: `vite.config.ts`

**Key Settings:**

- **Base path:** Dynamically set via `VITE_BASE_PATH` env var (defaults to `/codoncanvas/`)
- **SPA:** React application with TanStack Router for client-side routing
- **Output:** `dist/` directory with bundled assets

### Build Output

```
dist/
├── index.html              # Single-page application entry
├── assets/
│   ├── index-*.js          # Bundled JavaScript
│   ├── index-*.css         # Bundled Tailwind CSS
│   └── *.svg               # Static assets
└── ...
```

## Testing Deployment Locally

Before pushing, test the production build locally:

```bash
# Build for production
bun run build

# Preview the production build
bun run preview

# Open browser to preview URL (typically http://localhost:4173)
# All routes work via React Router:
# - http://localhost:4173/
# - http://localhost:4173/gallery
# - http://localhost:4173/tutorial
# - http://localhost:4173/demos
# - http://localhost:4173/demos/mutation
# - http://localhost:4173/demos/timeline
# - http://localhost:4173/demos/evolution
# - http://localhost:4173/dashboards/teacher
```

## Troubleshooting

### 404 Errors on Page Load

**Problem:** Assets not loading, 404 errors in console.

**Solution:** Check `base` path in `vite.config.ts`:

- For GitHub Pages: `/codoncanvas/`
- For custom domain root: `/`

### Pages Not Found

**Problem:** Direct URL access gives 404 errors.

**Solution:** React Router handles client-side routing. For GitHub Pages, a `404.html` redirect may be needed for direct URL access. The build process should copy `index.html` to `404.html`.

### Deployment Fails on Tests

**Problem:** GitHub Actions fails at "Run tests" step.

**Solution:** Fix failing tests locally first:

```bash
bun test
```

### Social Sharing Images Not Showing

**Problem:** Link previews on Twitter/Facebook show no image.

**Solution:**

1. Ensure `screenshot_playground.png` exists in repository root
2. Update Open Graph URLs in HTML files with correct deployment URL
3. Use absolute URLs (not relative paths)
4. Test with [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)

## Custom Domain Setup (Optional)

If you want to use a custom domain instead of GitHub Pages subdomain:

1. Add `CNAME` file to repository root with your domain
2. Configure DNS records (A/CNAME) to point to GitHub Pages
3. Update `base` in `vite.config.ts` to `/`
4. Update social sharing URLs in HTML files

## Deployment Checklist

Before deploying:

- [ ] All tests passing (`bun test`)
- [ ] Build succeeds locally (`bun run build`)
- [ ] Preview works locally (`bun run preview`)
- [ ] Social sharing URLs updated in HTML files
- [ ] README.md updated with live demo links
- [ ] CHANGELOG.md updated with deployment info

## Automatic Deployment

Every push to `master` branch triggers automatic deployment:

1. Tests run first (deployment fails if tests fail)
2. Production build generated
3. Artifact uploaded to GitHub Pages
4. Site updated automatically (2-3 minutes)

## Manual Deployment

To trigger deployment without pushing code:

1. Go to **Actions** tab in GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click **Run workflow** → **Run workflow**

## Monitoring

Check deployment status:

- **Actions tab:** View workflow runs and logs
- **Settings → Pages:** See deployment history and current URL
- **Deployments:** Shows all deployment events

## Support

For deployment issues:

- Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- Check [GitHub Pages documentation](https://docs.github.com/en/pages)
- Review workflow logs in Actions tab
