import { Injectable, inject } from '@angular/core';
import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import markedKatex from 'marked-katex-extension';
import hljs from 'highlight.js/lib/common';
import { Chapter, Subchapter } from '../models/chapter.model';
import { ImagesService } from './images.service';

marked.use({ gfm: true });
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
}));
marked.use(markedKatex({ output: 'mathml', throwOnError: false, nonStandard: false }));

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  private readonly images = inject(ImagesService);

  parse(markdown: string): string {
    // Pass 0: rewrite epub-img:// references to data URLs for live preview
    const withDataUrls = this.images.replaceUrls(markdown, 'data');

    // Pass 1: strip [^label]: definition lines that are NOT inside a fenced code block
    const defs = new Map<string, string>();
    const cleaned = this.stripFootnoteDefs(withDataUrls, defs);

    // Pass 2: marked renders the cleaned markdown
    let html = marked.parse(cleaned) as string;

    // Pass 3: replace surviving [^label] refs with footnote markup, skipping <pre>/<code> regions
    const refOrder: string[] = [];
    html = this.replaceFootnoteRefs(html, refOrder);

    if (refOrder.length > 0) {
      const items = refOrder.map((label, i) => {
        const n = i + 1;
        const def = defs.get(label) ?? label;
        return `<li id="fn${n}" epub:type="footnote"><p>${def} <a class="footnote-back" href="#fnref${n}">↩</a></p></li>`;
      }).join('\n');
      html += `\n<section class="footnotes" epub:type="footnotes">\n<hr/>\n<ol>\n${items}\n</ol>\n</section>`;
    }

    return html;
  }

  private stripFootnoteDefs(markdown: string, defs: Map<string, string>): string {
    const lines = markdown.split('\n');
    let inFence = false;
    let fenceChar = '';
    return lines.map(line => {
      const fenceMatch = line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
      if (fenceMatch) {
        const ch = fenceMatch[1][0];
        if (!inFence) { inFence = true; fenceChar = ch; return line; }
        if (ch === fenceChar) { inFence = false; fenceChar = ''; return line; }
      }
      if (inFence) return line;
      const m = line.match(/^\[\^([^\]]+)\]:\s*(.+)$/);
      if (m) { defs.set(m[1], m[2].trim()); return ''; }
      return line;
    }).join('\n');
  }

  private replaceFootnoteRefs(html: string, refOrder: string[]): string {
    const codeRegion = /<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>/gi;
    const refRegex = /\[\^([^\]]+)\]/g;
    const transform = (chunk: string) => chunk.replace(refRegex, (_, label) => {
      if (!refOrder.includes(label)) refOrder.push(label);
      const n = refOrder.indexOf(label) + 1;
      return `<sup id="fnref${n}" class="footnote-ref"><a href="#fn${n}">${n}</a></sup>`;
    });
    let result = '';
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = codeRegion.exec(html)) !== null) {
      result += transform(html.slice(lastIndex, m.index)) + m[0];
      lastIndex = codeRegion.lastIndex;
    }
    return result + transform(html.slice(lastIndex));
  }

  getFirstHeading(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const h = doc.querySelector('h1, h2');
    return h?.textContent?.trim() ?? '';
  }

  /** H1-only headings with char offsets — used for drag-and-drop reordering. */
  getChapterHeadings(markdown: string): { title: string; offset: number }[] {
    const result: { title: string; offset: number }[] = [];
    const regex = /^# (.+)$/gm;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      result.push({ title: match[1].trim(), offset: match.index });
    }
    return result;
  }

  /** Full heading tree for the sidebar: H1 chapters with nested H2 subchapters. */
  getChapterTree(markdown: string): { title: string; offset: number; subchapters: { title: string; offset: number }[] }[] {
    const regex = /^(#{1,2}) (.+)$/gm;
    const result: { title: string; offset: number; subchapters: { title: string; offset: number }[] }[] = [];
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      const level = match[1].length;
      const title = match[2].trim();
      const offset = match.index;
      if (level === 1) {
        result.push({ title, offset, subchapters: [] });
      } else if (result.length > 0) {
        result[result.length - 1].subchapters.push({ title, offset });
      }
    }
    return result;
  }

  reorderMarkdownChapters(markdown: string, fromIndex: number, toIndex: number): string {
    if (fromIndex === toIndex) return markdown;
    const headings = this.getChapterHeadings(markdown);
    if (headings.length < 2) return markdown;
    if (fromIndex < 0 || fromIndex >= headings.length) return markdown;
    if (toIndex   < 0 || toIndex   >= headings.length) return markdown;

    const preamble = markdown.slice(0, headings[0].offset);
    const sections = headings.map((h, i) => {
      const start = h.offset;
      const end = i + 1 < headings.length ? headings[i + 1].offset : markdown.length;
      return markdown.slice(start, end);
    });

    const reordered = [...sections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    return preamble + reordered.join('');
  }

  splitIntoChapters(html: string): Chapter[] {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const chapters: Chapter[] = [];
    let idx = 1;
    let currentTitle = '';
    let currentContent = '';
    let currentSubchapters: Subchapter[] = [];
    let seenSlugs: string[] = [];
    let started = false;

    const pushChapter = () => {
      if (currentContent.trim()) {
        chapters.push({
          title: currentTitle || `Chapter ${idx}`,
          filename: `chapter${String(idx).padStart(3, '0')}.xhtml`,
          htmlContent: currentContent,
          subchapters: currentSubchapters,
        });
        idx++;
      }
    };

    for (const el of Array.from(doc.body.children)) {
      const tag = el.tagName.toUpperCase();
      if (tag === 'H1') {
        if (started) pushChapter();
        currentTitle = el.textContent?.trim() || `Chapter ${idx}`;
        currentContent = el.outerHTML;
        currentSubchapters = [];
        seenSlugs = [];
        started = true;
      } else if (tag === 'H2' && started) {
        const raw = el.textContent?.trim() || '';
        const id = this.uniqueSlug(raw, seenSlugs);
        seenSlugs.push(id);
        el.setAttribute('id', id);
        currentContent += el.outerHTML;
        currentSubchapters.push({ title: raw, id });
      } else {
        currentContent += el.outerHTML;
      }
    }
    pushChapter();

    if (chapters.length === 0) {
      return [{ title: 'Content', filename: 'chapter001.xhtml', htmlContent: html, subchapters: [] }];
    }
    return chapters;
  }

  private uniqueSlug(text: string, seen: string[]): string {
    const base = text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';
    let slug = base;
    let n = 2;
    while (seen.includes(slug)) slug = `${base}-${n++}`;
    return slug;
  }
}
