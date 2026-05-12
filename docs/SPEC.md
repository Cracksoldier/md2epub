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
interface BookMetadata {
  title: string;
  author: string;
  language: string;            // BCP 47 tag, e.g. 'en', 'fr'
  splitChapters: boolean;
  coverDataUrl: string | null; // base64 data URL from FileReader
  coverMimeType: 'image/jpeg' | 'image/png' | null;
}
```

### `Chapter`
```typescript
interface Chapter {
  title: string;      // heading text or fallback
  filename: string;   // e.g. 'chapter001.xhtml'
  htmlContent: string;
}
```

### `Toast`
```typescript
type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
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
  parse(markdown: string): string            // marked.parse() → HTML string
  splitIntoChapters(html: string): Chapter[] // see algorithm below
  getFirstHeading(html: string): string      // extract first H1/H2 text
}
```

**Chapter Splitting Algorithm:**
1. `DOMParser.parseFromString(html, 'text/html')`
2. Walk `document.body.children` (element children, not text nodes)
3. On `H1` or `H2`: close current chapter, start new one (title = `textContent`)
4. All other elements: `outerHTML` appended to current chapter content
5. Content before first heading: prepended to first chapter
6. Fallback: if no headings, return single chapter with all content

---

### `EpubService`
**File:** `src/app/services/epub.service.ts`

```typescript
class EpubService {
  build(markdown: string, meta: BookMetadata): Promise<Blob>
}
```

**EPUB 3 ZIP Layout:**
```
mimetype                         ← STORE (uncompressed), MUST be first
META-INF/container.xml
EPUB/package.opf
EPUB/nav.xhtml
EPUB/style.css
EPUB/chapter001.xhtml            ← one or more
EPUB/cover.xhtml                 ← only if cover uploaded
EPUB/images/cover.{jpg|png}      ← only if cover uploaded
```

**package.opf must:** list every file in `<manifest>`, list reading order in `<spine>`.
**nav.xhtml must:** have `<nav epub:type="toc">` element.

**Cover handling:**
- Strip `data:image/jpeg;base64,` prefix from dataUrl
- `atob()` → `Uint8Array` → add to JSZip as binary
- Add `cover.xhtml` with full-page `<img>` as first spine item

---

### `ToastService`
**File:** `src/app/services/toast.service.ts`

```typescript
class ToastService {
  readonly toasts: Signal<Toast[]>
  show(message: string, type?: ToastType): void  // auto-dismiss after 3s
  dismiss(id: string): void
}
```

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
settingsClick: OutputEmitterRef<void>
exportClick: OutputEmitterRef<void>
```

**Template:** Logo icon + "MD → EPUB" brand text | Import button | Settings button | Export button (with spinner when loading).

---

### `EditorPane`
**Selector:** `app-editor-pane`
**File:** `src/app/components/editor-pane/editor-pane.ts`

Injects: `EditorStateService`

**Features:**
- `<textarea>` bound two-way to `EditorStateService.content`
- Tab key → inserts 2 spaces (prevents focus loss)
- Word count in pane header (computed from content)
- Clear button resets content to empty string
- File drag-drop: `dragover` + `drop` handlers on pane element
- Import via hidden `<input type="file" accept=".md,.txt">`

---

### `PreviewPane`
**Selector:** `app-preview-pane`
**File:** `src/app/components/preview-pane/preview-pane.ts`

Injects: `EditorStateService`, `MarkdownService`, `DomSanitizer`, `SettingsService`

```typescript
// Debounced HTML (200ms via RxJS toObservable + debounceTime + toSignal)
safeHtml: Signal<SafeHtml>

// Chapter count for badge
chapterCount: Signal<number>
```

**Template:** `<div class="preview" [innerHTML]="safeHtml()">` + chapter badge in header.

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
- Language (select: English, French, German, Spanish, Japanese, Chinese, Arabic, Portuguese, Italian, Russian)
- Cover Image (file input → preview thumbnail)
- Split at H1/H2 (checkbox toggle)

---

### `Toast` (container)
**Selector:** `app-toast`
**File:** `src/app/components/toast/toast.ts`

Injects: `ToastService`

**Template:** `@for` over `toastService.toasts()`, each toast has type icon + message + close button. Positioned fixed bottom-right.

---

## App Shell (`App`)
**File:** `src/app/app.ts`

**State:**
```typescript
settingsOpen = signal(false);
exportLoading = signal(false);
gridColumns = signal('1fr 4px 1fr'); // updated by PaneDivider
```

**Keyboard shortcuts** (via `@HostListener`):
- `Control+e` / `Meta+e` → trigger export
- `Control+,` / `Meta+,` → toggle settings panel

**Template layout:**
```
<app-toolbar>
<main.workspace [style.grid-template-columns]>
  <app-editor-pane>
  <app-pane-divider>
  <app-preview-pane>
<app-settings-panel>
<div.backdrop>
<app-toast>
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
Embedded in the generated EPUB — not the web app styles.

```css
body { font-family: serif; font-size: 1em; line-height: 1.6; margin: 1.5em; }
h1, h2, h3 { font-family: sans-serif; margin: 1.2em 0 0.4em; }
p { margin: 0.6em 0; }
pre { background: #f5f5f5; padding: 1em; overflow-x: auto; }
code { font-family: monospace; background: #f5f5f5; padding: 0.1em 0.3em; }
blockquote { border-left: 3px solid #999; margin-left: 1.5em; padding-left: 0.8em; color: #555; }
img { max-width: 100%; height: auto; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ddd; padding: 0.5em; }
a { color: #2563eb; }
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
