# epub-converter

A browser-based Markdown → EPUB 3 converter. Write or paste Markdown on the left, see a live preview on the right, and download a valid EPUB 3 file in one click. No server, no sign-up — everything runs client-side.

## Features

- Live Markdown preview (debounced 200 ms)
- EPUB 3 output with proper `package.opf`, `nav.xhtml`, and per-chapter XHTML files
- Optional chapter splitting (H1 = chapter, H2 = subchapter) with drag-and-drop reordering
- Footnotes (`[^label]` / `[^label]: …`), GFM tables, task lists, strikethrough
- Code syntax highlighting (highlight.js, ~36 common languages, GitHub Light theme)
- KaTeX math (`$inline$` and `$$block$$`) rendered as MathML — works in both preview and EPUB readers
- Inline images via drag-and-drop or paste (PNG / JPEG / WebP, ≤ 5 MB each)
- Three EPUB themes (Classic, Modern, Minimal) × five body fonts (serif, Georgia, system sans, modern sans, mono)
- Chapter numbering (none / arabic / roman / spelled-out)
- Drop caps toggle
- Custom CSS pane (sanitised) for power-user typography tweaks
- Cover image upload (JPEG / PNG / WebP), book metadata (title, author, publisher, description, language)
- Save / load project as JSON (markdown + metadata + image map round-trip)
- EPUB Preview modal — paginated, themed, in-app (Ctrl+Shift+P)
- 7 UI locales: English, Deutsch, Steirisch, Español, Dansk, 日本語, 繁體中文
- Splash loading screen on first paint, draggable pane divider, mobile tab bar
- Keyboard shortcuts: `Ctrl+E` export, `Ctrl+,` settings, `Ctrl+?` help, `Ctrl+Shift+P` preview
- **PWA-installable with true offline support** — Angular service worker caches the app shell so it loads + works without a network connection after first visit; a non-intrusive toast offers a one-click reload when a new version ships
- Deployable as a static site (GitHub Pages)

## Getting started

```bash
npm install
npm start          # dev server → http://localhost:4200
```

## Scripts

| Command | Description |
|---|---|
| `npm start` | Dev server at `http://localhost:4200` |
| `npm run build` | Production build → `dist/epub-converter/browser/` |
| `npm run watch` | Incremental dev build |
| `npm test` | Unit tests (Vitest) |

## Deploy to GitHub Pages

```bash
ng build --base-href /epub-converter/
npx angular-cli-ghpages --dir=dist/epub-converter/browser
```

## Validating output

Validate generated EPUB files at <https://www.w3.org/publishing/epubcheck/>.

## Tech stack

| | |
|---|---|
| Framework | Angular 21 (standalone components, Signals) |
| Markdown parsing | [marked](https://marked.js.org/) + `marked-highlight`, `marked-katex-extension` |
| Syntax highlighting | [highlight.js](https://highlightjs.org/) (common-languages bundle) |
| Math | [KaTeX](https://katex.org/) (MathML output) |
| HTML sanitization | [DOMPurify](https://github.com/cure53/DOMPurify) |
| ZIP / EPUB assembly | [jszip](https://stuk.github.io/jszip/) |
| Service worker | `@angular/service-worker` (offline + auto-update prompt) |
| Styling | Custom SCSS with cold-blue design tokens |
| Tests | Vitest (183 tests across 10 spec files) |
| Package manager | npm |

## Project structure

```
src/app/
  components/        # editor-pane, preview-pane, toolbar, settings-panel,
                     # pane-divider, toast, chapter-list, flag-icon,
                     # welcome-modal, shortcuts-modal, epub-preview-modal
  services/          # editor-state, settings, markdown, epub, images,
                     # i18n, toast
  models/            # BookMetadata, Chapter, Toast
  i18n/              # TranslationMap interface + 7 locale blocks
  utils/             # storage (epub:v1: namespace), sanitize-css
src/styles/          # _variables.scss (design tokens), shared classes
```

## License

MIT
