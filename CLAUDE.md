# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # dev server at http://localhost:4200
npm run build          # production build → dist/epub-converter/browser/
npm run watch          # incremental dev build
npm test               # unit tests with Vitest

# GitHub Pages deployment (replace repo name)
ng build --base-href /epub-converter/
npx angular-cli-ghpages --dir=dist/epub-converter/browser
```

**Package manager:** npm. Lockfile is `package-lock.json`.

**Scaffolding new components/services:** `ng generate component components/foo` or `ng generate service services/foo`. Angular 21 names the class without the `Component` suffix (e.g. `Foo`, not `FooComponent`) and drops `.component.` from filenames (`foo.ts`, `foo.html`, `foo.scss`).

## Architecture

Single-page Angular 21 app. No routing, no NgModules — all components are standalone. State is managed entirely with Angular Signals; no NgRx.

### Data flow

```
EditorPane (textarea)
  → EditorStateService.content (Signal<string>)
    → PreviewPane (debounced 200ms via toObservable+toSignal → DomSanitizer → [innerHTML])
    → EpubService.build() on export

SettingsService.metadata (Signal<BookMetadata>)
  ← SettingsPanel (form inputs)
  → EpubService.build() on export (title, author, lang, cover, splitChapters flag)

ToastService.toasts (Signal<Toast[]>)
  ← show() called from App (export errors/success), SettingsPanel (cover load error)
  → Toast component renders them, auto-dismisses after 3.5s
```

### Key services

- **`EditorStateService`** — single signal holding the raw markdown string; initialized with a sample document.
- **`SettingsService`** — signal holding `BookMetadata`; `loadCoverFromFile(File)` reads the image as a base64 data URL.
- **`MarkdownService`** — wraps `marked.parse()`; `splitIntoChapters(html)` uses `DOMParser` to walk `body.children` and split at `H1`/`H2` boundaries.
- **`EpubService`** — assembles a valid EPUB 3 ZIP using `jszip`. The `mimetype` file **must** be the first entry and stored uncompressed (`{ compression: 'STORE' }`). Generates `container.xml`, `package.opf`, `nav.xhtml`, per-chapter XHTML files, and optionally a cover page.

### AppComponent (app.ts)

Owns `exportLoading`, `settingsOpen`, and `gridColumns` signals. Handles `Ctrl+E` (export) and `Ctrl+,` (toggle settings) via `@HostListener`. Calls `PaneDivider.saveRatio()` / `loadSavedRatio()` (static helpers) to persist the pane split in `localStorage`.

### SCSS design system

All color tokens and layout constants live in `src/styles/_variables.scss` and are imported with `@use 'variables' as *` in component stylesheets (path is relative, e.g. `../../../styles/variables`). Shared button (`.btn`) and form input (`.form-input`) classes are defined in `src/styles.scss`. Use `@use 'sass:color'` for color functions — the deprecated global `darken()`/`mix()` functions will error.

### EPUB output structure

```
mimetype                   ← STORE, first entry
META-INF/container.xml
EPUB/package.opf           ← manifest + spine
EPUB/nav.xhtml             ← epub:type="toc" nav
EPUB/style.css
EPUB/chapter001.xhtml      ← one per chapter
EPUB/cover.xhtml           ← only when cover uploaded
EPUB/images/cover.{jpg|png}
```

Validate generated EPUBs at https://www.w3.org/publishing/epubcheck/
