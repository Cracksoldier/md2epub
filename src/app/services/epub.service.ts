import { Injectable, inject } from '@angular/core';
import JSZip from 'jszip';
import { BookMetadata, ChapterNumbering, EpubFont } from '../models/book-metadata.model';
import { Chapter } from '../models/chapter.model';
import { MarkdownService } from './markdown.service';
import { ImagesService } from './images.service';
import { sanitizeCss } from '../utils/sanitize-css';

@Injectable({ providedIn: 'root' })
export class EpubService {
  private readonly markdown = inject(MarkdownService);
  private readonly images = inject(ImagesService);

  async build(markdownText: string, meta: BookMetadata, chapterPrefix = 'Chapter'): Promise<Blob> {
    const zip = new JSZip();
    const uuid = this.uuid();
    const lang = meta.language || 'en';
    const title = meta.title.trim() || 'Untitled';
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

    const imageRefs = this.images.collectReferenced(markdownText);
    const markdownForEpub = this.images.replaceUrls(markdownText, 'epub-path');
    const html = this.markdown.parse(markdownForEpub);
    let chapters: Chapter[] = meta.splitChapters
      ? this.markdown.splitIntoChapters(html)
      : [{ title: this.markdown.getFirstHeading(html) || title, filename: 'chapter001.xhtml', htmlContent: html, subchapters: [] }];

    chapters = this.applyChapterNumbering(chapters, meta.chapterNumbering, chapterPrefix);

    if (chapters.length > 1) {
      const lastFile = chapters[chapters.length - 1].filename;
      for (let i = 0; i < chapters.length - 1; i++) {
        chapters[i] = {
          ...chapters[i],
          htmlContent: chapters[i].htmlContent.replace(/href="#fn(\d+)"/g, `href="${lastFile}#fn$1"`),
        };
      }
      for (let i = 0; i < chapters.length - 1; i++) {
        const matches = [...chapters[i].htmlContent.matchAll(/id="fnref(\d+)"/g)];
        for (const m of matches) {
          const n = m[1];
          const last = chapters.length - 1;
          chapters[last] = {
            ...chapters[last],
            htmlContent: chapters[last].htmlContent.replace(
              `href="#fnref${n}"`,
              `href="${chapters[i].filename}#fnref${n}"`
            ),
          };
        }
      }
    }

    const hasCover = !!meta.coverDataUrl;
    const coverExt =
      meta.coverMimeType === 'image/png'  ? 'png'  :
      meta.coverMimeType === 'image/webp' ? 'webp' :
      'jpg';
    const coverImgPath = `images/cover.${coverExt}`;

    // Build manifest + spine item lists
    const manifestItems: string[] = [
      `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
      `<item id="css" href="style.css" media-type="text/css"/>`,
    ];
    const spineItems: string[] = [];

    if (hasCover) {
      manifestItems.push(
        `<item id="cover-page" href="cover.xhtml" media-type="application/xhtml+xml"/>`,
        `<item id="cover-image" href="${coverImgPath}" media-type="${meta.coverMimeType}" properties="cover-image"/>`,
      );
      spineItems.push(`<itemref idref="cover-page"/>`);
    }

    chapters.forEach((ch, i) => {
      const id = `ch${String(i + 1).padStart(3, '0')}`;
      manifestItems.push(`<item id="${id}" href="${ch.filename}" media-type="application/xhtml+xml"/>`);
      spineItems.push(`<itemref idref="${id}"/>`);
    });

    for (const r of imageRefs) {
      manifestItems.push(
        `<item id="img-${r.id}" href="images/${r.id}.${r.ext}" media-type="${r.mimeType}"/>`
      );
    }

    const tocItems = chapters.map(ch => {
      const subItems = ch.subchapters.length
        ? '\n        <ol>\n' +
          ch.subchapters.map(s =>
            `          <li><a href="${ch.filename}#${s.id}">${this.esc(s.title)}</a></li>`
          ).join('\n') +
          '\n        </ol>'
        : '';
      return `      <li><a href="${ch.filename}">${this.esc(ch.title)}</a>${subItems}</li>`;
    }).join('\n');

    const creatorEl = meta.author.trim()
      ? `\n    <dc:creator>${this.esc(meta.author)}</dc:creator>`
      : '';
    const publisherEl = meta.publisher.trim()
      ? `\n    <dc:publisher>${this.esc(meta.publisher)}</dc:publisher>`
      : '';
    const descriptionEl = meta.description.trim()
      ? `\n    <dc:description>${this.esc(meta.description)}</dc:description>`
      : '';
    const coverMeta = hasCover ? '\n    <meta name="cover" content="cover-image"/>' : '';

    // mimetype MUST be first and uncompressed
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    zip.file('META-INF/container.xml', this.containerXml());
    zip.file('EPUB/package.opf', this.packageOpf({
      uuid, title, lang, now, creatorEl, publisherEl, descriptionEl, coverMeta,
      manifestItems, spineItems,
    }));
    zip.file('EPUB/nav.xhtml', this.navXhtml({ lang, title: 'Table of Contents', tocItems }));
    zip.file('EPUB/style.css', this.themeCss(meta.epubTheme, meta.epubFont, meta.dropCaps, meta.customCss));

    for (const ch of chapters) {
      zip.file(`EPUB/${ch.filename}`, this.chapterXhtml({ lang, title: ch.title, body: this.toXhtml(ch.htmlContent) }));
    }

    if (hasCover && meta.coverDataUrl) {
      zip.file(`EPUB/${coverImgPath}`, this.dataUrlToBytes(meta.coverDataUrl));
      zip.file('EPUB/cover.xhtml', this.coverXhtml({ lang, title, imgPath: coverImgPath }));
    }

    for (const r of imageRefs) {
      zip.file(`EPUB/images/${r.id}.${r.ext}`, r.bytes);
    }

    return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  }

  // ─── XML templates ───────────────────────────────────────────────────────

  private containerXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  }

  private packageOpf(p: {
    uuid: string; title: string; lang: string; now: string;
    creatorEl: string; publisherEl: string; descriptionEl: string; coverMeta: string;
    manifestItems: string[]; spineItems: string[];
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${p.lang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:${p.uuid}</dc:identifier>
    <dc:title>${this.esc(p.title)}</dc:title>${p.creatorEl}${p.publisherEl}${p.descriptionEl}
    <dc:language>${p.lang}</dc:language>
    <meta property="dcterms:modified">${p.now}</meta>${p.coverMeta}
  </metadata>
  <manifest>
    ${p.manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${p.spineItems.join('\n    ')}
  </spine>
</package>`;
  }

  private navXhtml(p: { lang: string; title: string; tocItems: string }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${p.lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${this.esc(p.title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
${p.tocItems}
    </ol>
  </nav>
</body>
</html>`;
  }

  private chapterXhtml(p: { lang: string; title: string; body: string }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${p.lang}">
<head>
  <meta charset="UTF-8"/>
  <title>${this.esc(p.title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
${p.body}
</body>
</html>`;
  }

  private coverXhtml(p: { lang: string; title: string; imgPath: string }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${p.lang}">
<head>
  <meta charset="UTF-8"/>
  <title>Cover</title>
  <style type="text/css">
    body { margin: 0; padding: 0; }
    img { width: 100%; height: 100vh; object-fit: cover; display: block; }
  </style>
</head>
<body>
  <img src="${p.imgPath}" alt="${this.esc(p.title)} cover"/>
</body>
</html>`;
  }

  themeCss(theme: BookMetadata['epubTheme'], font: EpubFont = 'serif', dropCaps = false, customCss = ''): string {
    const base =
      theme === 'modern'  ? this.modernCss()  :
      theme === 'minimal' ? this.minimalCss() :
      this.epubCss();
    const sanitizedUser = customCss ? `\n${sanitizeCss(customCss)}` : '';
    return base + this.extrasCss(font, dropCaps) + this.hljsCss() + sanitizedUser;
  }

  private extrasCss(font: EpubFont, dropCaps: boolean): string {
    const stack = this.fontStack(font);
    let css = `\nbody{font-family:${stack}}`;
    css += `\nli:has(> input[type="checkbox"]){list-style:none;margin-left:-1.4em}li > input[type="checkbox"]{margin-right:.4em}`;
    if (dropCaps) {
      css += `\nbody > p:first-of-type::first-letter{font-size:3.2em;line-height:1;float:left;padding-right:0.08em;margin-top:0.05em;font-weight:600}`;
    }
    return css;
  }

  private hljsCss(): string {
    return `\npre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#24292e;background:#fff}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#d73a49}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#6f42c1}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-variable,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id{color:#005cc5}.hljs-regexp,.hljs-string,.hljs-meta .hljs-string{color:#032f62}.hljs-built_in,.hljs-symbol{color:#e36209}.hljs-comment,.hljs-code,.hljs-formula{color:#6a737d}.hljs-name,.hljs-quote,.hljs-selector-tag,.hljs-selector-pseudo{color:#22863a}.hljs-subst{color:#24292e}.hljs-section{color:#005cc5;font-weight:bold}.hljs-bullet{color:#735c0f}.hljs-emphasis{color:#24292e;font-style:italic}.hljs-strong{color:#24292e;font-weight:bold}.hljs-addition{color:#22863a;background-color:#f0fff4}.hljs-deletion{color:#b31d28;background-color:#ffeef0}`;
  }

  private fontStack(font: EpubFont): string {
    switch (font) {
      case 'sans':        return `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif`;
      case 'modern-sans': return `'Inter','Helvetica Neue',Arial,sans-serif`;
      case 'mono':        return `'SF Mono','Consolas','Liberation Mono',Menlo,monospace`;
      case 'georgia':     return `Georgia,'Times New Roman',serif`;
      case 'serif':
      default:            return `Cambria,Georgia,'Times New Roman',serif`;
    }
  }

  private applyChapterNumbering(chapters: Chapter[], mode: ChapterNumbering, prefix: string): Chapter[] {
    if (mode === 'none') return chapters;
    return chapters.map((ch, i) => {
      const numeral = this.formatNumber(i + 1, mode);
      const newTitle = `${prefix} ${numeral}: ${ch.title}`;
      const newHtml = ch.htmlContent.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/, (_, attrs, inner) =>
        `<h1${attrs}>${this.esc(prefix)} ${numeral}: ${inner}</h1>`
      );
      return { ...ch, title: newTitle, htmlContent: newHtml };
    });
  }

  private formatNumber(n: number, mode: ChapterNumbering): string {
    if (mode === 'roman') return this.toRoman(n);
    if (mode === 'word')  return this.toWord(n);
    return String(n);
  }

  private toRoman(n: number): string {
    if (n <= 0 || n > 3999) return String(n);
    const map: [number, string][] = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100,  'C'], [90,  'XC'], [50,  'L'], [40,  'XL'],
      [10,   'X'], [9,   'IX'], [5,   'V'], [4,   'IV'], [1, 'I'],
    ];
    let out = '';
    let r = n;
    for (const [v, s] of map) {
      while (r >= v) { out += s; r -= v; }
    }
    return out;
  }

  private toWord(n: number): string {
    const words = [
      'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
    ];
    return words[n] ?? String(n);
  }

  private modernCss(): string {
    return `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:1em;line-height:1.75;margin:2em auto;max-width:36em}
h1,h2,h3,h4,h5,h6{font-weight:700;line-height:1.2;margin:1.5em 0 0.4em}
h1{font-size:2em}h2{font-size:1.5em}h3{font-size:1.2em}
p{margin:0.8em 0}
ul,ol{margin:0.8em 0;padding-left:1.8em}li{margin:0.3em 0}
blockquote{border-left:3px solid #ccc;margin:1em 0 1em 0;padding:0.4em 1em;color:#555}
pre{background:#f8f8f8;padding:1em;overflow-x:auto;margin:1em 0;border-radius:4px}
code{font-family:monospace;font-size:0.88em;background:#f0f0f0;padding:0.15em 0.35em;border-radius:3px}
pre code{background:none;padding:0}
table{border-collapse:collapse;width:100%;margin:1em 0}
th,td{border:1px solid #ddd;padding:0.5em 0.8em;text-align:left}
th{background:#f5f5f5;font-weight:600}
img{max-width:100%;height:auto}
a{color:#2563eb}
hr{border:none;border-top:1px solid #e0e0e0;margin:1.5em 0}
.footnote-ref{font-size:.75em;vertical-align:super;line-height:0}
.footnote-ref a{text-decoration:none;color:#2563eb}
.footnotes{border-top:1px solid #ccc;margin-top:2em;padding-top:1em;font-size:.85em}
.footnotes ol{padding-left:1.5em}
.footnotes li{margin:.3em 0}
.footnote-back{text-decoration:none;font-size:.9em}`;
  }

  private minimalCss(): string {
    return `body{font-size:1em;line-height:1.5;margin:1em}
h1,h2,h3,h4,h5,h6{font-weight:bold;margin:1em 0 0.4em;line-height:1.3}
p{margin:0.5em 0}
ul,ol{margin:0.5em 0;padding-left:1.4em}
pre,code{font-family:monospace;font-size:0.9em}
pre{margin:0.5em 0;overflow-x:auto}
blockquote{margin:0.5em 0 0.5em 1em}
img{max-width:100%;height:auto}
a{text-decoration:underline}
table{border-collapse:collapse}
th,td{border:1px solid;padding:0.3em 0.5em}
.footnote-ref{font-size:.75em;vertical-align:super}
.footnotes{border-top:1px solid;margin-top:1.5em;font-size:.85em}`;
  }

  private epubCss(): string {
    return `body{font-family:serif;font-size:1em;line-height:1.6;margin:1.5em}
h1,h2,h3,h4,h5,h6{font-family:sans-serif;line-height:1.3}
h1{font-size:1.8em;margin:1.2em 0 0.4em;border-bottom:1px solid #ccc;padding-bottom:0.2em}
h2{font-size:1.4em;margin:1em 0 0.3em}
h3{font-size:1.2em;margin:0.8em 0 0.2em}
p{margin:0.6em 0}
ul,ol{margin:0.6em 0;padding-left:1.5em}
li{margin:0.2em 0}
blockquote{border-left:3px solid #999;margin:0.8em 0 0.8em 1em;padding:0.2em 0.8em;color:#555}
pre{background:#f5f5f5;padding:0.8em;overflow-x:auto;margin:0.8em 0;border-radius:4px}
code{font-family:monospace;font-size:0.9em;background:#f5f5f5;padding:0.1em 0.3em;border-radius:2px}
pre code{background:none;padding:0}
table{border-collapse:collapse;width:100%;margin:0.8em 0}
th,td{border:1px solid #ccc;padding:0.4em 0.6em;text-align:left}
th{background:#f0f0f0;font-weight:bold}
img{max-width:100%;height:auto}
a{color:#2563eb}
hr{border:none;border-top:1px solid #ddd;margin:1em 0}
.footnote-ref{font-size:.75em;vertical-align:super;line-height:0}
.footnote-ref a{text-decoration:none;color:#2563eb}
.footnotes{border-top:1px solid #ccc;margin-top:2em;padding-top:1em;font-size:.85em}
.footnotes ol{padding-left:1.5em}
.footnotes li{margin:.3em 0}
.footnote-back{text-decoration:none;font-size:.9em}`;
  }

  // ─── Utilities ────────────────────────────────────────────────────────────

  /** Convert basic HTML to XHTML-safe: fix void elements */
  private toXhtml(html: string): string {
    return html
      .replace(/<br\s*>/gi, '<br/>')
      .replace(/<hr\s*>/gi, '<hr/>')
      .replace(/<img([^>]*[^/])>/gi, '<img$1/>')
      .replace(/<input([^>]*[^/])>/gi, '<input$1/>');
  }

  private esc(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  private dataUrlToBytes(dataUrl: string): Uint8Array {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }

  private uuid(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}
