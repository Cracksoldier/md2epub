# Color Reference

## App UI — Design Tokens (`src/styles/_variables.scss`)

### Backgrounds
| Token | Hex | Usage |
|-------|-----|-------|
| `$bg-base` | `#050d1a` | Page background, textarea |
| `$bg-surface` | `#0a1628` | Toolbar, panels |
| `$bg-elevated` | `#0f2040` | Pane headers, cards, format bar |
| `$bg-input` | `#152b52` | Form inputs, hover states |

### Borders
| Token | Hex | Usage |
|-------|-----|-------|
| `$border-subtle` | `#1e3a6e` | Dividers, borders |
| `$border-focus` | `#2563eb` | Focus rings |

### Accent (Blue)
| Token | Hex | Usage |
|-------|-----|-------|
| `$accent` | `#2563eb` | Primary CTA buttons, focus rings |
| `$accent-hover` | `#3b82f6` | Button hover state |
| `$accent-light` | `#60a5fa` | Links, info badges, caret |
| `$accent-glow` | `rgba(37, 99, 235, 0.15)` | Active locale highlight, text selection |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| `$text-primary` | `#e2e8f0` | Main body text |
| `$text-secondary` | `#94a3b8` | Secondary labels |
| `$text-muted` | `#64748b` | Hints, placeholders, word count |

### Status
| Token | Hex / rgba | Usage |
|-------|-----------|-------|
| `$success` | `#10b981` | Success toast border/icon |
| `$success-bg` | `rgba(16, 185, 129, 0.12)` | Success toast background |
| `$danger` | `#ef4444` | Error toast border/icon |
| `$danger-bg` | `rgba(239, 68, 68, 0.12)` | Error toast background |
| `$info-bg` | `rgba(37, 99, 235, 0.12)` | Info toast background |

---

## App UI — Hardcoded Colors

| Color | Hex | Location | Usage |
|-------|-----|----------|-------|
| White | `#ffffff` | `styles.scss`, `settings-panel.scss` | Spinner, file input label, spinner border |
| Coffee amber | `#fbbf24` | `styles.scss` | Buy-me-a-coffee button text |
| Coffee amber (hover) | `#fcd34d` | `styles.scss` | Buy-me-a-coffee button hover text |

---

## Logo SVG (Toolbar & Welcome Modal)

The brand logo uses hardcoded hex values that correspond directly to existing tokens:

| Hex | Equivalent token | Element |
|-----|-----------------|---------|
| `#1e3a6e` | `$border-subtle` | Book rectangle fill |
| `#2563eb` | `$accent` | Book rectangle stroke |
| `#60a5fa` | `$accent-light` | Text line strokes |
| `#3b82f6` | `$accent-hover` | Arrow strokes |

---

## EPUB Reader Stylesheet

These colors are embedded inside every exported EPUB (`EPUB/style.css`). They use a light/print-optimised palette independent of the app's dark UI.

| Hex | Usage |
|-----|-------|
| `#2563eb` | Link color (matches `$accent`) |
| `#ccc` | H1 bottom border, table cell borders |
| `#ddd` | `<hr>` border |
| `#999` | Blockquote left border |
| `#555` | Blockquote text |
| `#f5f5f5` | `<pre>` and `<code>` backgrounds |
| `#f0f0f0` | Table `<th>` background |

---

## Flag Icon Colors

National flag colors used in `flag-icon.ts`. These are fixed specifications and not part of the design system.

| Locale | Colors |
|--------|--------|
| 🇬🇧 `en` | `#012169` (navy), `#C8102E` (red), `#ffffff` |
| 🇩🇪 `de` | `#000000`, `#DD0000`, `#FFCE00` |
| 🇦🇹 `de-styr` | `#ED2939` (red), `#ffffff` |
| 🇪🇸 `es` | `#AA151B` (red), `#F1BF00` (yellow) |
| 🇩🇰 `da` | `#C60C30` (red), `#ffffff` |
| 🇯🇵 `ja` | `#BC002D` (red), `#ffffff` |
| 🇹🇼 `zh-TW` | `#FE0000` (red), `#000095` (blue), `#ffffff` |
