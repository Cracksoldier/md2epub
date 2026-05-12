# epub-converter

A browser-based Markdown → EPUB 3 converter. Write or paste Markdown on the left, see a live preview on the right, and download a valid EPUB 3 file in one click. No server, no sign-up — everything runs client-side.

## Features

- Live Markdown preview (debounced 200 ms)
- EPUB 3 output with proper `package.opf`, `nav.xhtml`, and per-chapter XHTML files
- Optional chapter splitting at H1/H2 boundaries
- Cover image upload (JPEG or PNG)
- Book metadata: title, author, language
- Draggable pane divider (ratio persisted in `localStorage`)
- Keyboard shortcuts: `Ctrl+E` export, `Ctrl+,` settings panel
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
| Markdown parsing | [marked](https://marked.js.org/) |
| ZIP / EPUB assembly | [jszip](https://stuk.github.io/jszip/) |
| Styling | Custom SCSS with cold-blue design tokens |
| Tests | Vitest |
| Package manager | npm |

## Project structure

```
src/app/
  components/        # editor-pane, preview-pane, toolbar, settings-panel, pane-divider, toast
  services/          # editor-state, settings, markdown, epub, toast
  models/            # BookMetadata, Chapter, Toast
src/styles/          # _variables.scss (design tokens), shared classes
```

## License

MIT
