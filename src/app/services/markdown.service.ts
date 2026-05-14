import { Injectable } from '@angular/core';
import { marked } from 'marked';
import { Chapter } from '../models/chapter.model';

@Injectable({ providedIn: 'root' })
export class MarkdownService {
  parse(markdown: string): string {
    return marked.parse(markdown) as string;
  }

  getFirstHeading(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const h = doc.querySelector('h1, h2');
    return h?.textContent?.trim() ?? '';
  }

  getChapterHeadings(markdown: string): { title: string; offset: number }[] {
    const result: { title: string; offset: number }[] = [];
    const regex = /^#{1,2} (.+)$/gm;
    let match;
    while ((match = regex.exec(markdown)) !== null) {
      result.push({ title: match[1].trim(), offset: match.index });
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
    let started = false;

    const pushChapter = () => {
      if (currentContent.trim()) {
        chapters.push({
          title: currentTitle || `Chapter ${idx}`,
          filename: `chapter${String(idx).padStart(3, '0')}.xhtml`,
          htmlContent: currentContent,
        });
        idx++;
      }
    };

    for (const el of Array.from(doc.body.children)) {
      const tag = el.tagName.toUpperCase();
      if (tag === 'H1' || tag === 'H2') {
        if (started) pushChapter();
        currentTitle = el.textContent?.trim() || `Chapter ${idx}`;
        currentContent = el.outerHTML;
        started = true;
      } else {
        currentContent += el.outerHTML;
      }
    }
    pushChapter();

    if (chapters.length === 0) {
      return [{ title: 'Content', filename: 'chapter001.xhtml', htmlContent: html }];
    }
    return chapters;
  }
}
