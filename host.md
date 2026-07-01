# Hosting this site on GitHub Pages

This repo has two separate frontends:

- **`/` (repo root)** — the marketing/docs site (`src/`, this is a Vite + React + React Router app). **This is the one you host on GitHub Pages.**
- **`/rhubarb-ide-webui`** — the desktop IDE's UI, loaded locally by `rhubarb_ide.py` via pywebview. It is not a public website and should not be deployed to Pages.

Everything below assumes the repo is `BlueBrik1/rhubarb` on branch `main` and already contains the code (confirmed via `git remote -v`).

## Why this needs a couple of code changes first

Two things about how this app is built don't work out of the box on GitHub Pages:

1. **Subpath hosting.** A project page (as opposed to a `<user>.github.io` user page) is served from `https://bluebrik1.github.io/rhubarb/`, not from the domain root. Vite's default `base: "/"` and the app's asset/script paths assume root hosting, so without a `base` set, the deployed page loads with broken CSS/JS.
2. **Client-side routing.** `src/main.tsx` wraps the app in React Router's `BrowserRouter`, which relies on the server sending back `index.html` for *any* path (like `/docs`) so React Router can take over client-side. GitHub Pages is a static file host with no such rewrite rule — a direct visit or refresh on `/docs` returns a real 404 unless you add the fallback trick below.

### 1. Set the Vite base path

Edit `vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/rhubarb/",
});
```

If you ever rename the repo to `bluebrik1.github.io` (a *user* page, served from the domain root) or point a custom domain at it, change this back to `base: "/"`.

### 2. Tell the router about the base path

Edit `src/main.tsx` so `BrowserRouter` knows routes are mounted under `/rhubarb/`, using the base path Vite already knows about (`import.meta.env.BASE_URL`) so this stays correct in local dev too:

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

### 3. Add the SPA fallback (`404.html`)

GitHub Pages serves a custom `404.html` for any unmatched path instead of a generic error page. The standard trick is to make `404.html` an exact copy of `index.html`: the browser loads it, the app boots, and React Router then reads the real URL and renders the right page client-side.

Add a small script step so this happens automatically after every build — in `package.json`:

```json
"scripts": {
  "build": "tsc -b && vite build && cp dist/index.html dist/404.html"
}
```

(On Windows without a Unix shell available, use `copy dist\\index.html dist\\404.html` instead, or let the GitHub Actions workflow below — which runs on Linux — do the copy for you.)

## Deploying: GitHub Actions + Pages (recommended)

This builds and deploys automatically on every push to `main`, with no extra npm package and no manual branch pushes.

1. **Enable Pages for Actions.** On GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
2. **Add the workflow file** at `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   permissions:
     contents: read
     pages: write
     id-token: write

   concurrency:
     group: pages
     cancel-in-progress: true

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
         - run: npm ci
         - run: npm run build
         - run: cp dist/index.html dist/404.html
         - uses: actions/upload-pages-artifact@v3
           with:
             path: dist

     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

   (Skip the separate `cp` step here if you already added it to the `build` script in `package.json`.)

3. **Commit and push** the workflow file plus the `vite.config.ts` / `main.tsx` changes above, to `main`.
4. Watch it run under the repo's **Actions** tab. Once it finishes, the site is live at:

   ```
   https://bluebrik1.github.io/rhubarb/
   ```

   GitHub also shows this exact URL under **Settings → Pages** once the first deployment succeeds.

## Alternative: `gh-pages` npm package

If you'd rather deploy manually from your own machine instead of via Actions:

```bash
npm install --save-dev gh-pages
```

Add to `package.json`:

```json
"scripts": {
  "deploy": "npm run build && cp dist/index.html dist/404.html && gh-pages -d dist"
}
```

Then run `npm run deploy` whenever you want to publish. Under **Settings → Pages**, set **Source** to **Deploy from a branch** → `gh-pages` → `/ (root)`. You still need the `vite.config.ts` base path and `main.tsx` basename changes from above either way — this just changes *how* `dist/` gets published, not the app's own routing/base-path requirements.

## Custom domain (optional)

To serve the site from your own domain instead of `bluebrik1.github.io/rhubarb/`:

1. Add a `public/CNAME` file containing just your domain, e.g. `rhubarb.dev` (Vite copies everything in `public/` into `dist/` as-is).
2. Point the domain's DNS at GitHub Pages (an `A`/`ALIAS` record to GitHub's Pages IPs, or a `CNAME` record to `bluebrik1.github.io`, per [GitHub's custom domain docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).
3. With a custom domain the site is served from the root again, so set `base: "/"` back in `vite.config.ts` and `basename="/"` (or just drop the `basename` prop) in `main.tsx`.

## Verifying it worked

- Visit `https://bluebrik1.github.io/rhubarb/` — the home page should load with styles and fonts intact (a wrong `base` shows an unstyled page with 404s in the browser console for `/assets/...`).
- Visit `https://bluebrik1.github.io/rhubarb/docs` **directly** (not by clicking through from home) and refresh it. If this 404s, the `404.html` fallback step was skipped or didn't run.
- Click the in-page anchor links (Language / Syntax / The IDE in the navbar) — these are plain `#hash` links on the home page itself and aren't affected by any of the routing changes above.
