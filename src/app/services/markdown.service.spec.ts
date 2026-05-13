import { TestBed } from '@angular/core/testing';
import { MarkdownService } from './markdown.service';

describe('MarkdownService', () => {
  let service: MarkdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkdownService);
  });

  describe('parse()', () => {
    it('converts markdown heading to h1 HTML', () => {
      const html = service.parse('# Hello World');
      expect(html).toContain('<h1>Hello World</h1>');
    });

    it('converts bold markdown to strong tag', () => {
      const html = service.parse('**bold**');
      expect(html).toContain('<strong>bold</strong>');
    });

    it('returns empty string for empty input', () => {
      const html = service.parse('');
      expect(html.trim()).toBe('');
    });

    it('returns a string', () => {
      expect(typeof service.parse('# Title')).toBe('string');
    });
  });

  describe('getFirstHeading()', () => {
    it('returns h1 text content', () => {
      const html = '<h1>My Book</h1><p>Some text</p>';
      expect(service.getFirstHeading(html)).toBe('My Book');
    });

    it('returns h2 text when no h1 present', () => {
      const html = '<p>Intro</p><h2>Section One</h2>';
      expect(service.getFirstHeading(html)).toBe('Section One');
    });

    it('prefers h1 over h2', () => {
      const html = '<h2>Section</h2><h1>Title</h1>';
      expect(service.getFirstHeading(html)).toBe('Section');
    });

    it('returns empty string when no heading found', () => {
      const html = '<p>Just a paragraph</p>';
      expect(service.getFirstHeading(html)).toBe('');
    });

    it('trims whitespace from heading text', () => {
      const html = '<h1>  Spaced Title  </h1>';
      expect(service.getFirstHeading(html)).toBe('Spaced Title');
    });
  });

  describe('splitIntoChapters()', () => {
    it('returns single auto-titled chapter when html has no headings', () => {
      // No heading → title falls back to "Chapter 1" (auto-generated via idx counter)
      const html = '<p>Just some text</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters).toHaveLength(1);
      expect(chapters[0].title).toBe('Chapter 1');
      expect(chapters[0].filename).toBe('chapter001.xhtml');
    });

    it('splits on h1 boundaries', () => {
      const html = '<h1>Part One</h1><p>Content 1</p><h1>Part Two</h1><p>Content 2</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters).toHaveLength(2);
      expect(chapters[0].title).toBe('Part One');
      expect(chapters[1].title).toBe('Part Two');
    });

    it('splits on h2 boundaries', () => {
      const html = '<h2>Section A</h2><p>Text A</p><h2>Section B</h2><p>Text B</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters).toHaveLength(2);
      expect(chapters[0].title).toBe('Section A');
      expect(chapters[1].title).toBe('Section B');
    });

    it('pads filename index with leading zeros', () => {
      const html = '<h1>Part A</h1><p>Text A</p><h1>Part B</h1><p>Text B</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters[0].filename).toBe('chapter001.xhtml');
      expect(chapters[1].filename).toBe('chapter002.xhtml');
    });

    it('content before the first heading is not included in any chapter', () => {
      // The splitter replaces currentContent when it finds a heading, so pre-heading nodes are lost.
      const html = '<p>Preamble</p><h1>Title</h1><p>Body</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters).toHaveLength(1);
      expect(chapters[0].title).toBe('Title');
      expect(chapters[0].htmlContent).not.toContain('Preamble');
    });

    it('each chapter htmlContent includes the heading element', () => {
      const html = '<h1>Chapter One</h1><p>Body</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters[0].htmlContent).toContain('<h1>');
    });

    it('returns "Content" chapter for empty html string', () => {
      const chapters = service.splitIntoChapters('');
      expect(chapters).toHaveLength(1);
      expect(chapters[0].title).toBe('Content');
    });
  });
});
