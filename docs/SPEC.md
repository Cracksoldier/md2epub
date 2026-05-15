# Markdown → EPUB Converter — Technical Specification

## Color Design Tokens

```scss
// Cold blue palette
$bg-base:        #050d1a;   // page background
$bg-surface:     #0a1628;   // toolbar, panels
$bg-elevated:    #0f2040;   // pane headers, cards
$bg-input:       #152b52;   // textarea, form inputs
$border-subtle:  #1e3a6e;   // dividers, borders
$border-focus:   #2563eb;   // focus rings
$accent:         #2563eb;   // primary CTA buttons
$accent-hover:   #3b82f6;   // button hover state
$accent-light:   #60a5fa;   // links, info badges
$accent-glow:    rgba(37, 99, 235, 0.15);
$text-primary:   #e2e8f0;
$text-secondary: #94a3b8;
$text-muted:     #64748b;
$success:        #10b981;
$danger:         #ef4444;
$toolbar-height: 56px;
$settings-width: 320px;
```

---

## Models

### `BookMetadata`
```typescript
type EpubTheme       = 'classic' | 'modern' | 'minimal';
type EpubFont        = 'serif' | 'sans' | 'modern-sans' | 'mono' | 'georgia';
type ChapterNumbering = 'none' | 'arabic' | 'roman' | 'word';

interface BookMetadata {
  title: string;
  author: string;
  publisher: string;
  description: string;
  language: string;                // BCP 47 tag, e.g. 'en', 'fr'
  epubTheme: EpubTheme;            // base CSS preset
  epubFont: EpubFont;              // body font-family override appended to theme CSS
  chapterNumbering: ChapterNumbering; // applied at build time; source markdown stays untouched
  dropCaps: boolean;               // adds body > p:first-of-type::first-letter rule
  splitChapters: boolean;
  customCss: string;               // appended to EPUB style.css and live preview, sanitised
  coverDataUrl: string | null;     // base64 data URL from FileReader
  coverMimeType: 'image/jpeg' | 'image/png' | 'image/webp' | null;
}
```

### `Subchapter`
```typescript
interface Subchapter {
  title: string;  // H2 text content
  id: string;     // slug used as fragment href, e.g. 'my-section'
}
```

### `Chapter`
```typescript
interface Chapter {
  title: string;           // H1 text or fallback
  filename: string;        // e.g. 'chapter001.xhtml'
  htmlContent: string;     // full chapter HTML; H2 elements have id attrs injected
  subchapters: Subchapter[];
}
```

### `Toast`
```typescript
type ToastType = 'success' | 'error' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;   // when set, the toast renders an action button
  persistent?: boolean;   // when true, ToastService skips the 3.5s auto-dismiss
}
```

---

## Services

### `EditorStateService`
**File:** `src/app/services/editor-state.service.ts`

```typescript
class EditorStateService {
  readonly content: Signal<string>          // current markdown text
  setContent(v: string): void               // update content
}
```

Default content: a sample markdown document (shown on first load).

---

### `SettingsService`
**File:** `src/app/services/settings.service.ts`

```typescript
class SettingsService {
  readonly metadata: Signal<BookMetadata>
  update(patch: Partial<BookMetadata>): void
  loadCoverFromFile(file: File): Promise<void>  // FileReader → base64
  clearCover(): void
}
```

---

### `MarkdownService`
**File:** `src/app/services/markdown.service.ts`

```typescript
class MarkdownService {
  parse(markdown: string): string                                    // 3-pass: strip footnote defs → marked.parse() → inject footnote HTML
  getFirstHeading(html: string): string                              // extract first H1/H2 text
  getChapterHeadings(markdown: string): { title: string; offset: number }[]  // H1-only regex scan; used for drag-and-drop reordering
  getChapterTree(markdown: string): {                                // H1+H2 hierarchy for ChapterList sidebar
    title: string; offset: number;
    subchapters: { title: string; offset: number }[];
  }[]
  splitIntoChapters(html: string): Chapter[]                        // see algorithm below
  reorderMarkdownChapters(markdown: string, from: number, to: number): string
}
```

**Footnote syntax** (Pandoc-style, not standard CommonMark):
- Inline: `[^label]` → `<sup id="fnref1" class="footnote-ref"><a href="#fn1">1</a></sup>`
- Definition: `[^label]: text` (standalone line, single-line only)
- Footnote section appended to full HTML: `<section class="footnotes" epub:type="footnotes">`
- `EpubService` rewrites cross-chapter hrefs in split mode (see EpubService notes)

**Chapter Splitting Algorithm:**
1. `DOMParser.parseFromString(html, 'text/html')`
2. Walk `document.body.children` (element children, not text nodes)
3. On `H1`: close current chapter, start new one (title = `textContent`)
4. On `H2` (while a chapter is open): inject `id="<slug>"` attribute onto the element, append to current chapter content, push `{ title, id }` to current chapter's `subchapters` array. Slugs are deduplicated within the chapter with `-2`, `-3` suffixes.
5. All other elements: `outerHTML` appended to current chapter content
6. Content before first H1: discarded (not included in any chapter)
7. Fallback: if no H1 headings, return single chapter with all content

---

### `EpubService`
**File:** `src/app/services/epub.service.ts`

```typescript
class EpubService {
  build(markdown: string, meta: BookMetadata, chapterPrefix?: string): Promise<Blob>
  themeCss(theme: EpubTheme, font?: EpubFont, dropCaps?: boolean, customCss?: string): string  // public for EpubPreviewModal
}
```

`chapterPrefix` defaults to `'Chapter'`; `App.onExport()` passes `i18n.t('epub.chapterPrefix')` so the numbering label is localised.

**EPUB 3 ZIP Layout:**
```
mimetype                              ← STORE (uncompressed), MUST be first
META-INF/container.xml
EPUB/package.opf
EPUB/nav.xhtml
EPUB/style.css                        ← theme + font + drop-cap + hljs + sanitised customCss
EPUB/chapter001.xhtml                 ← one or more; carries inline MathML when present
EPUB/cover.xhtml                      ← only if cover uploaded
EPUB/images/cover.{jpg|png|webp}      ← only if cover uploaded
EPUB/images/<hash>.{jpg|png|webp}     ← inline images dropped/pasted into the editor
```

**package.opf must:** list every file in `<manifest>`, list reading order in `<spine>`.
**nav.xhtml must:** have `<nav epub:type="toc">` element with nested `<ol>` entries for subchapters (fragment `#slug` hrefs linking into the chapter XHTML).

**`themeCss(theme, font, dropCaps, customCss)`** composes the embedded stylesheet in this order:
1. Theme base — `classic` (serif), `modern` (system sans, `max-width: 36em`), or `minimal` (near-bare).
2. Font override — `body { font-family: <stack> }` from `fontStack(font)`.
3. Task-list checkbox CSS (always).
4. Drop-cap rule (`body > p:first-of-type::first-letter`) if `dropCaps`.
5. Inlined hljs GitHub-Light theme CSS (always; harmless when there are no code blocks).
6. `sanitizeCss(customCss)` if non-empty — last in the cascade so user rules win on equal specificity.

**Chapter numbering:** `applyChapterNumbering(chapters, mode, prefix)` runs after `splitIntoChapters()`. For `arabic` / `roman` / `word`, it rewrites the first `<h1>` of each chapter and the `chapter.title` field (so the nav.xhtml TOC matches). Romans cap at 3999, words cap at 20 (fall back to arabic above).

**Footnote cross-chapter rewriting** (split mode only): after splitting into chapters, `EpubService.build()` rewrites `href="#fn1"` in early chapters to `href="chapterN.xhtml#fn1"`, and rewrites back-links in the footnote section to `href="chapterM.xhtml#fnref1"`.

**Cover handling:**
- Strip `data:image/jpeg;base64,` prefix from dataUrl
- `atob()` → `Uint8Array` → add to JSZip as binary
- Add `cover.xhtml` with full-page `<img>` as first spine item

---

### `ToastService`
**File:** `src/app/services/toast.service.ts`

```typescript
interface ToastOptions {
  action?: ToastAction;
  persistent?: boolean;
}

class ToastService {
  readonly toasts: Signal<Toast[]>
  show(message: string, type?: ToastType, opts?: ToastOptions): void  // auto-dismiss after 3.5s unless persistent
  dismiss(id: string): void
}
```

When `opts.persistent` is true, the service skips its `setTimeout`-based dismissal — the toast stays until clicked or `dismiss()` is called explicitly. When `opts.action` is set, the Toast component renders an action button; clicking it invokes the handler then dismisses the toast. The two are typically combined for the SW update prompt.

---

## Components

### `Toolbar`
**Selector:** `app-toolbar`
**File:** `src/app/components/toolbar/toolbar.ts`

```typescript
// Inputs
exportLoading: InputSignal<boolean>

// Outputs
importClick: OutputEmitterRef<void>
saveProjectClick: OutputEmitterRef<void>
loadProjectClick: OutputEmitterRef<void>
settingsClick: OutputEmitterRef<void>
exportClick: OutputEmitterRef<void>
```

**Template:** Logo icon + "MD → EPUB" brand text (hidden ≤1024px) | Import | Load Project | Save Project | Settings | Export (with spinner when loading) | locale dropdown | Buy Me a Coffee link.

---

### `EditorPane`
**Selector:** `app-editor-pane`
**File:** `src/app/components/editor-pane/editor-pane.ts`

Injects: `EditorStateService`, `SettingsService`

```typescript
// Inputs
syncScrollRatio: InputSignal<number>   // NaN = no-op

// Outputs
scrollRatio: OutputEmitterRef<number>  // emitted on scroll via requestAnimationFrame
```

**Features:**
- `<textarea>` bound two-way to `EditorStateService.content`
- Tab key → inserts 2 spaces (prevents focus loss)
- Ctrl+B / Ctrl+I → bold / italic formatting
- **Format bar** (`.format-bar`) — 8 buttons: H1, H2, Bold, Italic, Code, Link, Blockquote, List. Hidden on mobile. `format(type)` method handles inline wrapping and block prefix toggling.
- Word count in pane header (computed from content)
- Clear button resets content to empty string
- File drag-drop: `dragover` + `drop` handlers on pane element
- Import via hidden `<input type="file" accept=".md,.txt">`
- `showChapterList` computed signal — true when `metadata().splitChapters` is on
- `scrollToOffset(offset)` — scrolls textarea to a given character offset (line-height calculation)
- Renders `<app-chapter-list>` in a flex `.editor-body` row when `showChapterList()` is true
- Scroll sync: emits `scrollRatio` on textarea scroll; applies `syncScrollRatio` input via `effect()` with a 50 ms feedback-loop guard

---

### `ChapterList`
**Selector:** `app-chapter-list`
**File:** `src/app/components/chapter-list/chapter-list.ts`

Injects: `EditorStateService`, `MarkdownService`

```typescript
// Output
chapterSelect: OutputEmitterRef<number>  // character offset in markdown

// Computed
chapters: Signal<{ title: string; offset: number; subchapters: { title: string; offset: number }[] }[]>
```

**Template:** numbered, draggable chapter items (drag handle + number + title button). Each item may have an indented sub-list of H2 subchapter buttons beneath it. Both chapter and subchapter buttons emit `chapterSelect` with the heading's character offset. Shows localised empty-state text when no H1 headings are found. 168px fixed-width sidebar styled with the dark palette.

**Drag-and-drop:** native HTML5 API. `dragstart`/`dragover`/`dragleave`/`drop`/`dragend` handlers on the host element. A `drop-before` CSS class provides a visual indicator line. On drop, calls `MarkdownService.reorderMarkdownChapters()` — entire H1 sections move, so subchapters follow their parent automatically.

---

### `PreviewPane`
**Selector:** `app-preview-pane`
**File:** `src/app/components/preview-pane/preview-pane.ts`

Injects: `EditorStateService`, `MarkdownService`, `DomSanitizer`, `SettingsService`

```typescript
// Inputs
syncScrollRatio: InputSignal<number>   // NaN = no-op

// Outputs
scrollRatio: OutputEmitterRef<number>  // emitted on scroll via requestAnimationFrame

// Debounced HTML (200ms via RxJS toObservable + debounceTime + toSignal)
safeHtml: Signal<SafeHtml>

// Chapter count for badge
chapterCount: Signal<number>
```

**Template:** `<div class="preview-scroll" #scrollContainer>` scroll container wrapping `<div class="preview" [innerHTML]="safeHtml()">` + chapter badge in header. Scroll sync via same pattern as EditorPane.

---

### `PaneDivider`
**Selector:** `app-pane-divider`
**File:** `src/app/components/pane-divider/pane-divider.ts`

```typescript
// Output: emits new left-pane fraction [0.2 … 0.8]
ratioChange: OutputEmitterRef<number>
```

**Logic:**
- `mousedown` on divider → attach `mousemove` + `mouseup` to document
- Calculate `leftWidth / workspaceWidth` → clamp to [0.2, 0.8]
- `mouseup` → detach listeners, save to `localStorage('pane-ratio')`

---

### `SettingsPanel`
**Selector:** `app-settings-panel`
**File:** `src/app/components/settings-panel/settings-panel.ts`

```typescript
// Inputs
isOpen: InputSignal<boolean>

// Outputs
closePanel: OutputEmitterRef<void>
```

Injects: `SettingsService`

**Form fields:**
- Book Title (text input)
- Author (text input)
- Publisher (text input)
- Description (textarea)
- Language (select: en, fr, de, es, pt, it, nl, ru, ja, zh, ar, ko)
- EPUB Theme (select: classic / modern / minimal)
- Cover Image (file input → preview thumbnail)
- Split into chapters (checkbox toggle — also shows `ChapterList` sidebar in EditorPane)

---

### `Toast` (container)
**Selector:** `app-toast`
**File:** `src/app/components/toast/toast.ts`

Injects: `ToastService`

**Template:** `@for` over `toastService.toasts()`, each toast has type icon + message + close button. Positioned fixed bottom-right.

---

### `ShortcutsModal`
**Selector:** `app-shortcuts-modal`
**File:** `src/app/components/shortcuts-modal/shortcuts-modal.ts`

```typescript
// Outputs
close: OutputEmitterRef<void>
```

Opened via `Ctrl+?` / `⌘+?`. Lists shortcuts in two groups (General, Editor). Detects Mac via `navigator.platform`. Same modal pattern as `WelcomeModal` (Escape, backdrop click, Tab focus trap).

---

## App Shell (`App`)
**File:** `src/app/app.ts`

**State:**
```typescript
settingsOpen    = signal(false);
showShortcuts   = signal(false);
exportLoading   = signal(false);
editorScrollRatio  = signal(NaN);
previewScrollRatio = signal(NaN);
gridColumns     = signal('1fr 4px 1fr'); // updated by PaneDivider
showWelcome     = signal(!localStorage.getItem('epub-welcomed'));
mobileView      = signal<'editor' | 'preview'>('editor');
```

**Keyboard shortcuts** (via `@HostListener`):
- `Ctrl+E` / `⌘+E` → trigger export
- `Ctrl+,` / `⌘+,` → toggle settings panel
- `Ctrl+?` / `⌘+?` → toggle shortcuts modal

**Project Save/Load:** `onSaveProject()` serialises `EditorStateService.content()` + `SettingsService.metadata()` (excluding cover) to a `.epub-project.json` blob download. `onLoadProject()` triggers a hidden `<input type="file">` and `onProjectFileSelected()` restores content + metadata.

**Template layout:**
```
<app-toolbar>
<input #projectFileInput type="file" hidden>
<main.workspace [style.grid-template-columns]>
  <app-editor-pane [syncScrollRatio] (scrollRatio)>
  <app-pane-divider>
  <app-preview-pane [syncScrollRatio] (scrollRatio)>
<app-settings-panel>
<div.backdrop>
<app-toast>
@if (showWelcome()) <app-welcome-modal>
@if (showShortcuts()) <app-shortcuts-modal>
```

---

## CSS Layout

### Workspace Grid
```scss
.workspace {
  display: grid;
  grid-template-columns: 1fr 4px 1fr;  // updated dynamically by JS
  height: calc(100vh - $toolbar-height);
  overflow: hidden;
}
```

### Settings Panel Slide-in
```scss
.settings-panel {
  position: fixed;
  right: 0; top: 0;
  width: $settings-width;
  height: 100%;
  transform: translateX(100%);
  transition: transform 0.25s ease;

  &.is-open {
    transform: translateX(0);
  }
}
```

### Responsive (≤768px)
```scss
@media (max-width: 768px) {
  .workspace {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 4px 40vh;
  }
  .pane-divider { cursor: row-resize; }
}
```

---

## EPUB Inner Stylesheet (`EPUB/style.css`)
Embedded in the generated EPUB — not the web app styles. Selected by `meta.epubTheme`.

| Theme | Body font | Notable rules |
|-------|-----------|---------------|
| `classic` | `serif` | H1 underline border, 1.6 line-height |
| `modern` | system sans-serif | `max-width: 36em`, centred, 1.75 line-height |
| `minimal` | (reader default) | Near-bare — font-size, margin, pre/code only |

All themes append footnote rules:
```css
.footnote-ref { font-size: .75em; vertical-align: super; }
.footnotes { border-top: 1px solid #ccc; margin-top: 2em; font-size: .85em; }
```

---

## Export Flow (sequence)

```
User: click Export button (or Ctrl+E)
  → App sets exportLoading = true
  → Validate: content.trim() !== '' → else toast error, abort
  → Call EpubService.build(content, metadata) → Promise<Blob>
  → URL.createObjectURL(blob) → anchor click with [download] attribute
  → setTimeout(URL.revokeObjectURL, 1s)
  → App sets exportLoading = false
  → ToastService.show('EPUB downloaded!', 'success')
```

---

## File Import Flow

```
User: drop .md file onto editor  OR  click Import button
  → FileReader.readAsText(file)
  → EditorStateService.setContent(result)
  → PreviewPane auto-updates via computed signal
```

---

## EPUB Validation Checklist
- [ ] EPUBCheck online: https://www.w3.org/publishing/epubcheck/
- [ ] `mimetype` is first ZIP entry, stored uncompressed
- [ ] All XHTML files have `xmlns="http://www.w3.org/1999/xhtml"`
- [ ] All manifest items present in ZIP
- [ ] nav.xhtml has valid `epub:type="toc"` nav
- [ ] Package `unique-identifier` attribute matches `<dc:identifier id="uid">`
- [ ] `dcterms:modified` is in ISO 8601 UTC format
