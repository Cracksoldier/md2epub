# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # dev server at http://localhost:4200
npm run build          # production build → dist/epub-converter/browser/
npm run watch          # incremental dev build
npm test               # run all unit tests (Vitest via @angular/build:unit-test)

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

Owns `exportLoading`, `settingsOpen`, `gridColumns`, `showWelcome`, and `mobileView` signals. Handles `Ctrl+E` (export) and `Ctrl+,` (toggle settings) via `@HostListener`. Calls `PaneDivider.saveRatio()` / `loadSavedRatio()` (static helpers) to persist the pane split in `localStorage`. `showWelcome` is `true` on first visit (no `epub-welcomed` key in `localStorage`); `onWelcomeClosed()` sets the flag and hides the modal.

`mobileView` (`Signal<'editor' | 'preview'>`) tracks the active tab on phones; toggled by the mobile bottom tab bar in `app.html`. `i18n` is `protected` (not `private`) so the template can call `i18n.t()` directly for tab labels.

### WelcomeModal component

Shown on first visit only. Displays a client-side privacy notice and a language picker so users can set their locale before starting. Dismisses on button click, backdrop click, or Escape. Dismissed state stored in `localStorage` key `epub-welcomed`.

### Responsive layout

Three layout tiers, all handled purely in CSS — no JS media queries:

| Viewport | Layout |
|---|---|
| ≥ 769px | Split pane (editor left, preview right, draggable divider) |
| 641–768px | Stacked (editor top, preview bottom 45 vh) |
| ≤ 640px | Single pane + bottom tab bar (Editor / Preview tabs) |

The mobile breakpoint is `$breakpoint-mobile: 640px` in `src/styles/_variables.scss`. On phones the inactive pane gets a `mobile-hidden` class (`display: none`) and the `.mobile-tabs` / `.mobile-tab` bar is shown via `@media (max-width: $breakpoint-mobile)` in `app.scss`. The `PaneDivider` is hidden on mobile via `app-pane-divider { display: none }`.

Toolbar button text is wrapped in `<span class="btn__label">` so it can be hidden on mobile without hiding icons; `toolbar.scss` hides `.btn__label` at the same breakpoint.

### Toolbar component

`src/app/components/toolbar/toolbar.html` — contains the brand logo (inline SVG, 32×32 viewBox), action buttons (import, settings, export), a custom locale dropdown, and a **Buy Me a Coffee** `<a class="btn btn--coffee">` placeholder. Update its `href` when a real donation link is available. Button text is wrapped in `<span class="btn__label">` for mobile hiding.

**Locale dropdown** — a fully custom dropdown replacing the native `<select>`. `Toolbar` owns a `localeOpen` signal and a `currentLocaleLabel` computed. A `@HostListener('document:click')` closes the panel on outside click; `@HostListener('document:keydown.escape')` closes it on Escape. The trigger (`.toolbar__locale-trigger`) shows the current locale's flag, label, and a rotating chevron. The panel (`.locale-dropdown`) and its options (`.locale-option`) are styled with the app's dark palette — active locale gets `$accent-light` / `$accent-glow`. Styles live in `toolbar.scss`.

**FlagIcon component** — `src/app/components/flag-icon/flag-icon.ts`. Standalone component, takes a `locale` input (string) and renders an inline SVG flag (20×14 px, `border-radius: 2px`). Flags: 🇬🇧 `en`, 🇩🇪 `de`, 🇦🇹 `de-styr`, 🇪🇸 `es`, 🇩🇰 `da`, 🇯🇵 `ja`, 🇹🇼 `zh-TW`. Each SVG has a subtle `rgba(0,0,0,.15)` border overlay so light-coloured flags (Japan, Austria) stay visible against any background. Adding a new locale requires adding a matching `@case` block in the component template.

### Favicon

`public/favicon.svg` — matches the toolbar logo exactly (dark book with blue text lines and arrow, `#050d1a` rounded background). Referenced in `src/index.html` as `<link rel="icon" type="image/svg+xml">` with the existing `favicon.ico` as fallback for older browsers.

### SCSS design system

All color tokens and layout constants live in `src/styles/_variables.scss` and are imported with `@use 'variables' as *` in component stylesheets (path is relative, e.g. `../../../styles/variables`). Shared button (`.btn`) and form input (`.form-input`) classes are defined in `src/styles.scss`. Use `@use 'sass:color'` for color functions — the deprecated global `darken()`/`mix()` functions will error.

Button variants: `btn--primary` (blue), `btn--ghost` (bordered), `btn--icon` (icon-only), `btn--coffee` (amber/gold, used for the donation link). Button text that should hide on mobile is wrapped in `<span class="btn__label">` and toggled via `toolbar.scss`.

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

### Unit tests

Test runner: **Vitest** via `@angular/build:unit-test` (jsdom environment). Run with `npm test`. All spec files sit next to the file they test (`.spec.ts` suffix).

| Spec file | Coverage |
|---|---|
| `services/markdown.service.spec.ts` | `parse()`, `getFirstHeading()`, `splitIntoChapters()` edge cases |
| `services/epub.service.spec.ts` | ZIP structure, mimetype STORE + first-entry, container namespace, opf metadata, chapters, cover, XML escaping |
| `services/i18n.service.spec.ts` | Key lookup, `{0}` interpolation, `setLocale()`, localStorage persistence, fallbacks |
| `services/settings.service.spec.ts` | Defaults, `update()` merge, `loadCoverFromFile()` (PNG/JPEG/reject), `clearCover()` |
| `services/toast.service.spec.ts` | `show()`, `dismiss()`, auto-dismiss via fake timers (`vi.useFakeTimers`), unique IDs |
| `services/editor-state.service.spec.ts` | Initial sample content, `setContent()` |
| `components/pane-divider/pane-divider.spec.ts` | Static `loadSavedRatio()`/`saveRatio()`, clamping, ArrowLeft/ArrowRight keyboard resize |
| `components/toolbar/toolbar.spec.ts` | Dropdown open/close, `selectLocale()`, `currentLocaleLabel()`, Escape/outside-click |

**Testing patterns:**
- Services are obtained via `TestBed.inject()` after `TestBed.configureTestingModule({})`.
- Clear `localStorage` in `beforeEach` for any service that reads it on init (`I18nService`, `PaneDivider`).
- Mock `window.FileReader` by replacing it with a class: `(window as any).FileReader = class FakeReader { ... }`. Arrow-function implementations don't work as constructors.
- Use `vi.useFakeTimers()` / `vi.useRealTimers()` from `'vitest'` to control `setTimeout`-based behaviour (toast auto-dismiss).
- `splitIntoChapters()` discards content that appears before the first `H1`/`H2` heading; this is by design and is tested explicitly.
