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

## Deployment to GitHub Pages

### Option A — Manual (single command)
```bash
# Build with your repo's base href
ng build --base-href /epub-converter/

# Deploy dist/epub-converter/browser/ to gh-pages branch
npx angular-cli-ghpages --dir=dist/epub-converter/browser
```

### Option B — GitHub Actions (automated)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: yarn install --frozen-lockfile
      - run: yarn ng build --base-href /epub-converter/
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: dist/epub-converter/browser
```

### Important
- Replace `/epub-converter/` with your actual repository name
- Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch

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
