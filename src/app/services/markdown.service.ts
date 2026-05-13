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
