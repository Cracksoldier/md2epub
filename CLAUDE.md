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

I18nService.locale (Signal<Locale>)
  ← WelcomeModal language picker (first visit), Toolbar language switcher
  → all components via i18n.t(key) — reactive because t() reads the locale signal
```

### Key services

- **`EditorStateService`** — single signal holding the raw markdown string; initialized with a sample document.
- **`SettingsService`** — signal holding `BookMetadata`; `loadCoverFromFile(File)` reads the image as a base64 data URL.
- **`MarkdownService`** — wraps `marked.parse()`; `splitIntoChapters(html)` uses `DOMParser` to walk `body.children` and split at `H1`/`H2` boundaries.
- **`EpubService`** — assembles a valid EPUB 3 ZIP using `jszip`. The `mimetype` file **must** be the first entry and stored uncompressed (`{ compression: 'STORE' }`). Generates `container.xml`, `package.opf`, `nav.xhtml`, per-chapter XHTML files, and optionally a cover page.
- **`I18nService`** — signal-based UI localisation. `locale` signal holds the active `Locale` code; `t(key, ...args)` looks up dot-notation keys (e.g. `'toolbar.import'`) with `{0}` interpolation for dynamic values. Locale is persisted in `localStorage` under `epub-i18n-locale`.

### Internationalisation (i18n)

All user-visible strings live in `src/app/i18n/translations.ts` as a typed `TranslationMap`. Supported locales:

| Code | Label |
|------|-------|
| `en` | English (default) |
| `de` | Deutsch |
| `de-styr` | Steirisch |
| `es` | Español |
| `da` | Dansk |
| `ja` | 日本語 |
| `zh-TW` | 繁體中文 |

**Adding a new locale:** add the code to the `Locale` union, add an entry to `LOCALES`, and add a full `TranslationMap` block to `TRANSLATIONS` in `translations.ts`. No other files need to change.

**Adding a new string:** add the key to the `TranslationMap` interface and to every locale block, then call `i18n.t('section.key')` in the template or `this.i18n.t('section.key')` in TypeScript. For strings with runtime values use `{0}` placeholders: `i18n.t('toast.downloaded', filename)`.

### AppComponent (app.ts)

Owns `exportLoading`, `settingsOpen`, `gridColumns`, and `showWelcome` signals. Handles `Ctrl+E` (export) and `Ctrl+,` (toggle settings) via `@HostListener`. Calls `PaneDivider.saveRatio()` / `loadSavedRatio()` (static helpers) to persist the pane split in `localStorage`. `showWelcome` is `true` on first visit (no `epub-welcomed` key in `localStorage`); `onWelcomeClosed()` sets the flag and hides the modal.

### WelcomeModal component

Shown on first visit only. Displays a client-side privacy notice and a language picker so users can set their locale before starting. Dismisses on button click, backdrop click, or Escape. Dismissed state stored in `localStorage` key `epub-welcomed`.

### Toolbar component

`src/app/components/toolbar/toolbar.html` — contains the brand logo (inline SVG, 32×32 viewBox), action buttons (import, settings, export), locale switcher, and a **Buy Me a Coffee** `<a class="btn btn--coffee">` placeholder. Update its `href` when a real donation link is available.

### Favicon

`public/favicon.svg` — matches the toolbar logo exactly (dark book with blue text lines and arrow, `#050d1a` rounded background). Referenced in `src/index.html` as `<link rel="icon" type="image/svg+xml">` with the existing `favicon.ico` as fallback for older browsers.

### SCSS design system

All color tokens and layout constants live in `src/styles/_variables.scss` and are imported with `@use 'variables' as *` in component stylesheets (path is relative, e.g. `../../../styles/variables`). Shared button (`.btn`) and form input (`.form-input`) classes are defined in `src/styles.scss`. Use `@use 'sass:color'` for color functions — the deprecated global `darken()`/`mix()` functions will error.

Button variants: `btn--primary` (blue), `btn--ghost` (bordered), `btn--icon` (icon-only), `btn--coffee` (amber/gold, used for the donation link).

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
