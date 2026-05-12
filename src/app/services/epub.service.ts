import { Injectable, inject } from '@angular/core';
import JSZip from 'jszip';
import { BookMetadata } from '../models/book-metadata.model';
import { Chapter } from '../models/chapter.model';
import { MarkdownService } from './markdown.service';

@Injectable({ providedIn: 'root' })
export class EpubService {
  private readonly markdown = inject(MarkdownService);

  async build(markdownText: string, meta: BookMetadata): Promise<Blob> {
    const zip = new JSZip();
    const uuid = this.uuid();
    const lang = meta.language || 'en';
    const title = meta.title.trim() || 'Untitled';
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');

    const html = this.markdown.parse(markdownText);
    const chapters: Chapter[] = meta.splitChapters
      ? this.markdown.splitIntoChapters(html)
      : [{ title: this.markdown.getFirstHeading(html) || title, filename: 'chapter001.xhtml', htmlContent: html }];

    const hasCover = !!meta.coverDataUrl;
    const coverExt = meta.coverMimeType === 'image/png' ? 'png' : 'jpg';
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

    const tocItems = chapters
      .map(ch => `      <li><a href="${ch.filename}">${this.esc(ch.title)}</a></li>`)
      .join('\n');

    const creatorEl = meta.author.trim()
      ? `\n    <dc:creator>${this.esc(meta.author)}</dc:creator>`
      : '';
    const coverMeta = hasCover ? '\n    <meta name="cover" content="cover-image"/>' : '';

    // mimetype MUST be first and uncompressed
    zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

    zip.file('META-INF/container.xml', this.containerXml());
    zip.file('EPUB/package.opf', this.packageOpf({
      uuid, title, lang, now, creatorEl, coverMeta,
      manifestItems, spineItems,
    }));
    zip.file('EPUB/nav.xhtml', this.navXhtml({ lang, title: 'Table of Contents', tocItems }));
    zip.file('EPUB/style.css', this.epubCss());

    for (const ch of chapters) {
      zip.file(`EPUB/${ch.filename}`, this.chapterXhtml({ lang, title: ch.title, body: this.toXhtml(ch.htmlContent) }));
    }

    if (hasCover && meta.coverDataUrl) {
      zip.file(`EPUB/${coverImgPath}`, this.dataUrlToBytes(meta.coverDataUrl));
      zip.file('EPUB/cover.xhtml', this.coverXhtml({ lang, title, imgPath: coverImgPath }));
    }

    return zip.generateAsync({ type: 'blob', mimeType: 'application/epub+zip' });
  }

  // ─── XML templates ───────────────────────────────────────────────────────

  private containerXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:schemas:container">
  <rootfiles>
    <rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  }

  private packageOpf(p: {
    uuid: string; title: string; lang: string; now: string;
    creatorEl: string; coverMeta: string;
    manifestItems: string[]; spineItems: string[];
  }): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${p.lang}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">urn:uuid:${p.uuid}</dc:identifier>
    <dc:title>${this.esc(p.title)}</dc:title>${p.creatorEl}
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
hr{border:none;border-top:1px solid #ddd;margin:1em 0}`;
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
