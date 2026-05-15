# Markdown → EPUB Converter — Project Plan

## Overview
A fully client-side Markdown-to-EPUB 3 converter built with Angular 21 (standalone components + signals). No backend required. Deployable to GitHub Pages as a static site.

## Goals
- Accept Markdown input (type, paste, or drag-drop a `.md` file)
- Render a live split-pane HTML preview
- Generate a valid EPUB 3 file downloadable in the browser
- Support book metadata: title, author, language, cover image
- Support automatic chapter splitting at H1 headings; H2 headings become subchapters nested within their parent chapter

## Technology Choices

| Concern | Choice | Reason |
|---------|--------|--------|
| Framework | Angular 21 (standalone) | Requested by user; signals = reactive state |
| State | Angular Signals | Built-in, no NgRx needed for this scope |
| Markdown parsing | `marked` (npm) | Lightweight, fast, no dependencies |
| ZIP/EPUB assembly | `jszip` (npm) | Mature, browser-compatible, Promise-based |
| Styling | Custom SCSS | Full control over cold blue design |
| Package manager | yarn (auto-detected by Angular CLI) | |

## Architecture

```
src/app/
├── models/           — interfaces only, no logic
├── services/         — business logic, all providedIn root
├── i18n/             — TranslationMap interface + TRANSLATIONS for all locales
└── components/       — standalone UI components
    ├── toolbar/
    ├── editor-pane/
    ├── chapter-list/ — sidebar shown inside EditorPane when splitChapters is on
    ├── preview-pane/
    ├── pane-divider/
    ├── settings-panel/
    ├── flag-icon/
    ├── welcome-modal/
    └── toast/
```

## Implementation Phases

### Phase 1 — Scaffold ✓
- `ng new epub-converter --standalone --style=scss`
- Install `marked`, `jszip`, `angular-cli-ghpages`

### Phase 2 — Models & Services ✓
- `BookMetadata`, `Chapter`, `Toast` interfaces
- `EditorStateService`, `SettingsService`, `MarkdownService`, `EpubService`, `ToastService`

### Phase 3 — Components ✓
- `Toolbar`, `EditorPane`, `PreviewPane`, `PaneDivider`, `SettingsPanel`, `Toast`

### Phase 4 — App Shell & Design System ✓
- Root `App` component wiring everything together
- SCSS design tokens, reset, typography

### Phase 5 — Docs & Deployment Config ✓
- This file + `SPEC.md`
- GitHub Pages deployment instructions

### Phase 6 — Post-launch features ✓
- Publisher and Description metadata fields (`dc:publisher`, `dc:description` in OPF)
- Internationalisation: 7 locales (en, de, de-styr, es, da, ja, zh-TW) via `I18nService`
- WelcomeModal with language picker on first visit
- Chapter list sidebar in EditorPane (visible when Split Chapters is enabled)
- Drag-and-drop chapter reordering in the sidebar (H1-level; H2 subchapters move with their parent)
- H1 = chapters, H2 = subchapters: `splitIntoChapters()` splits only at H1 boundaries; H2 elements get slug `id` attrs injected and are listed as nested subchapters in both the sidebar and EPUB nav TOC

### Phase 7 — Editor & export enhancements ✓
- **Project Save/Load** — serialise content + metadata to `.epub-project.json` (cover excluded); restore via file picker
- **Autosave to localStorage** — content saved on every keystroke; metadata saved on every settings change; both restored on page load
- **Markdown formatting toolbar** — 8 buttons (H1, H2, Bold, Italic, Code, Link, Blockquote, List) + Ctrl+B/I shortcuts; block prefix toggling
- **EPUB themes** — 3 built-in CSS presets (Classic, Modern, Minimal) selectable in Settings; stored in `BookMetadata.epubTheme`
- **Footnote support** — Pandoc-style `[^label]` / `[^label]: text`; renders in preview and exports as `epub:type="footnotes"` section; cross-chapter hrefs rewritten in split mode
- **Scroll sync** — proportional scroll sync between editor and preview via `scrollRatio` output / `syncScrollRatio` input; `requestAnimationFrame` throttling; feedback-loop guard
- **Keyboard shortcuts modal** — `Ctrl+?` opens a modal listing all shortcuts; Mac-aware (`⌘` vs `Ctrl`); full i18n across 7 locales

### Phase 8 — EPUB Preview, PWA, inline images ✓
- **EPUB Preview modal** — `Ctrl+Shift+P` paginated chapter-by-chapter view in a sandboxed iframe themed with the exact EPUB stylesheet
- **PWA manifest** — installable, dark theme-color matching the toolbar
- **localStorage namespacing** — all keys live under `epub:v1:` via `src/app/utils/storage.ts` with one-shot legacy migration
- **Inline image embedding** — drag-and-drop or paste images into the editor; stored hashed under `ImagesService`; rewritten to data URLs for preview and `images/<id>.<ext>` for export
- **Cover validation** — type (PNG/JPEG/WebP only) + size (≤ 5 MB) checks with `CoverRejectedError` reason codes for precise toasts

### Phase 9 — Typography polish ✓
- **GFM** — explicit `marked.use({ gfm: true })`; tables, task lists, strikethrough render in preview and EPUB
- **Chapter numbering** — `none` / `arabic` / `roman` / `word`, applied at build time so source markdown is untouched; prefix is i18n-aware
- **Body font picker** — five family choices (`serif`, `Georgia`, system sans, modern sans, mono) injected after the theme CSS
- **Drop caps** — opt-in `:first-letter` rule with conservative cross-reader styling

### Phase 10 — Code, math, custom CSS ✓
- **Code syntax highlighting** — `highlight.js/lib/common` via `marked-highlight`; GitHub Light theme inlined into both the app SCSS and the EPUB stylesheet
- **KaTeX math** — `marked-katex-extension` with `output: 'mathml'` so `$inline$` and `$$block$$` render as MathML in both preview and reader. DOMPurify USE_PROFILES extended with `mathMl`
- **Custom CSS pane** — Settings → Advanced disclosure → monospace textarea; sanitised via `src/app/utils/sanitize-css.ts` (strips HTML tags, `javascript:`/`vbscript:` URLs, `expression()`, `behavior:`, `@import`); appended to EPUB stylesheet, EPUB Preview modal, and live PreviewPane (via Renderer2-managed `<style>` element)
- **Bundle budget** — production initial-bundle warning bumped to 1 MB / error 1.5 MB to absorb the ~115 KB gzipped library cost
- **Splash screen** — inlined logo + spinner inside `<app-root>` in `src/index.html`; vanishes when Angular bootstrap replaces the contents

### Phase 11 — True offline (service worker) ✓
- **Service worker** — `@angular/service-worker` wired via `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })`; production-only, registers 30 s after stability so it doesn't compete with first paint
- **`ngsw-config.json`** — single prefetch group for the app shell (`index.html`, `*.css`, `*.js`, manifest, favicons) + single lazy group for other static assets; no `dataGroups` (zero API calls)
- **Update notification** — App constructor subscribes to `SwUpdate.versionUpdates`; on `VERSION_READY` shows a **persistent action-toast** with a "Reload" button that calls `activateUpdate()` then reloads
- **Toast model extension** — optional `action: { label, onClick }` and `persistent: boolean` fields; existing `show(msg, type)` callsites unchanged
- **Test bed** — `app.spec.ts` provides a disabled `provideServiceWorker('', { enabled: false })` so `SwUpdate` injection works under JSDOM

## Deployment to GitHub Pages

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs the unit test suite, builds with `--base-href /md2epub/`, and publishes to GitHub Pages via the official `actions/deploy-pages` action. Live site: https://cracksoldier.github.io/md2epub/

The workflow:
1. `npm ci` — install dependencies from the lockfile
2. `npm test` — broken tests block deploy
3. `npm run build -- --base-href /md2epub/` — production build
4. `actions/upload-pages-artifact` + `actions/deploy-pages` — publish

GitHub Pages must be enabled in Settings → Pages → Source: **GitHub Actions** (not `gh-pages` branch). Replace `/md2epub/` with your own repo name if you fork.

### Manual build (rarely needed)

```bash
npm run build -- --base-href /md2epub/
# dist/epub-converter/browser/ contains the static site
```

## Running Locally

```bash
# Install dependencies
yarn install

# Start dev server
yarn ng serve
# → http://localhost:4200

# Production build
yarn ng build

# Run unit tests
yarn ng test
```

## Validating EPUB Output
- **EPUBCheck**: https://www.w3.org/publishing/epubcheck/ (online validator)
- **Calibre**: Open `.epub` file to inspect content, TOC, and metadata
- **Apple Books**: Drag-drop `.epub` to import and verify on macOS/iOS
