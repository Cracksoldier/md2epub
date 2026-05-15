import { TestBed } from '@angular/core/testing';
import { MarkdownService } from './markdown.service';
import { ImagesService } from './images.service';

describe('MarkdownService', () => {
  let service: MarkdownService;
  let images: ImagesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarkdownService);
    images = TestBed.inject(ImagesService);
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

    it('renders footnote inline ref as superscript link', () => {
      const html = service.parse('Text[^1] here.\n\n[^1]: My note.');
      expect(html).toContain('<sup id="fnref1" class="footnote-ref"><a href="#fn1">1</a></sup>');
    });

    it('appends footnote section when refs are present', () => {
      const html = service.parse('Text[^1].\n\n[^1]: The note.');
      expect(html).toContain('<section class="footnotes"');
      expect(html).toContain('<li id="fn1"');
      expect(html).toContain('The note.');
    });

    it('numbers multiple footnotes in first-appearance order', () => {
      const html = service.parse('A[^b] and B[^a].\n\n[^a]: Alpha.\n[^b]: Beta.');
      expect(html).toContain('<a href="#fn1">1</a>');
      expect(html).toContain('<a href="#fn2">2</a>');
      expect(html).toContain('<li id="fn1"');
      const fn1Pos = html.indexOf('<li id="fn1"');
      const fn2Pos = html.indexOf('<li id="fn2"');
      expect(fn1Pos).toBeLessThan(fn2Pos);
    });

    it('falls back to the label when definition is missing', () => {
      const html = service.parse('Text[^missing].');
      expect(html).toContain('<li id="fn1"');
      expect(html).toContain('>missing ');
    });

    it('produces no footnote section when no footnote syntax present', () => {
      const html = service.parse('Just plain text.');
      expect(html).not.toContain('footnotes');
      expect(html).not.toContain('fnref');
    });

    it('keeps [^label]: definition literal inside a fenced code block', () => {
      const md = '```\n[^x]: should stay literal\n```\n\nNo refs here.';
      const html = service.parse(md);
      expect(html).toContain('[^x]: should stay literal');
      expect(html).not.toContain('class="footnotes"');
    });

    it('keeps [^label] ref literal inside a fenced code block', () => {
      const md = 'Real[^a].\n\n[^a]: Note.\n\n```\nliteral [^a] inside code\n```';
      const html = service.parse(md);
      const fnref1 = '<sup id="fnref1"';
      // Exactly one footnote ref — the one outside the code block
      expect(html.match(new RegExp(fnref1, 'g'))?.length).toBe(1);
      expect(html).toContain('literal [^a] inside code');
    });

    it('renders a GFM table to a <table> element', () => {
      const md = '| a | b |\n|---|---|\n| 1 | 2 |\n';
      const html = service.parse(md);
      expect(html).toContain('<table>');
      expect(html).toContain('<th>a</th>');
      expect(html).toContain('<td>1</td>');
    });

    it('renders a GFM task list with disabled checkboxes', () => {
      const md = '- [x] done\n- [ ] todo\n';
      const html = service.parse(md);
      expect(html).toContain('type="checkbox"');
      expect(html).toMatch(/checked(="")?[^>]*disabled|disabled[^>]*checked/);
    });

    it('rewrites epub-img:// references to data URLs when an image is registered', async () => {
      const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
      const { id } = await images.addImage(new File([bytes.buffer as ArrayBuffer], 'x.png', { type: 'image/png' }));
      const html = service.parse(`![](epub-img://${id})`);
      expect(html).toContain('src="data:image/png;base64,');
      expect(html).not.toContain('epub-img://');
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

  describe('reorderMarkdownChapters()', () => {
    const md = '# Alpha\n\nText A.\n\n# Beta\n\nText B.\n\n# Gamma\n\nText C.\n';

    it('returns original string when fromIndex === toIndex', () => {
      expect(service.reorderMarkdownChapters(md, 1, 1)).toBe(md);
    });

    it('returns original string when fewer than 2 chapters', () => {
      const single = '# Only\n\nContent.\n';
      expect(service.reorderMarkdownChapters(single, 0, 0)).toBe(single);
    });

    it('returns original string for out-of-range fromIndex', () => {
      expect(service.reorderMarkdownChapters(md, 5, 0)).toBe(md);
    });

    it('returns original string for out-of-range toIndex', () => {
      expect(service.reorderMarkdownChapters(md, 0, 5)).toBe(md);
    });

    it('moves first chapter to last position', () => {
      const result = service.reorderMarkdownChapters(md, 0, 2);
      expect(result).toBe('# Beta\n\nText B.\n\n# Gamma\n\nText C.\n# Alpha\n\nText A.\n\n');
    });

    it('moves last chapter to first position', () => {
      const result = service.reorderMarkdownChapters(md, 2, 0);
      expect(result).toBe('# Gamma\n\nText C.\n# Alpha\n\nText A.\n\n# Beta\n\nText B.\n\n');
    });

    it('swaps adjacent chapters', () => {
      const result = service.reorderMarkdownChapters(md, 0, 1);
      expect(result).toBe('# Beta\n\nText B.\n\n# Alpha\n\nText A.\n\n# Gamma\n\nText C.\n');
    });

    it('preserves preamble before first heading', () => {
      const withPreamble = 'Intro text.\n\n# Alpha\n\nText A.\n\n# Beta\n\nText B.\n';
      const result = service.reorderMarkdownChapters(withPreamble, 0, 1);
      expect(result.startsWith('Intro text.\n\n')).toBe(true);
      expect(result).toContain('# Beta');
      expect(result).toContain('# Alpha');
    });

    it('preserves trailing whitespace within each section', () => {
      const result = service.reorderMarkdownChapters(md, 1, 0);
      // Every section should still end with its original trailing newline(s)
      expect(result).toContain('Text B.\n\n');
      expect(result).toContain('Text A.\n\n');
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

    it('does not split on h2 — h2 stays within its parent h1 chapter', () => {
      const html = '<h1>Chapter</h1><h2>Section A</h2><p>Text A</p><h2>Section B</h2><p>Text B</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters).toHaveLength(1);
      expect(chapters[0].title).toBe('Chapter');
      expect(chapters[0].htmlContent).toContain('Section A');
      expect(chapters[0].htmlContent).toContain('Section B');
    });

    it('h2 without a preceding h1 is treated as body content, not a chapter', () => {
      const html = '<h2>Orphan</h2><p>Text</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters).toHaveLength(1);
      expect(chapters[0].htmlContent).toContain('Orphan');
    });

    it('populates subchapters array with h2 title and slug id', () => {
      const html = '<h1>My Chapter</h1><h2>First Section</h2><p>Body</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters[0].subchapters).toHaveLength(1);
      expect(chapters[0].subchapters[0].title).toBe('First Section');
      expect(chapters[0].subchapters[0].id).toBe('first-section');
    });

    it('injects id attribute onto h2 elements in htmlContent', () => {
      const html = '<h1>Chapter</h1><h2>My Section</h2><p>Body</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters[0].htmlContent).toContain('id="my-section"');
    });

    it('deduplicates h2 ids within the same chapter', () => {
      const html = '<h1>Ch</h1><h2>Intro</h2><p>A</p><h2>Intro</h2><p>B</p>';
      const chapters = service.splitIntoChapters(html);
      const ids = chapters[0].subchapters.map(s => s.id);
      expect(ids[0]).toBe('intro');
      expect(ids[1]).toBe('intro-2');
    });

    it('resets subchapter id deduplication between chapters', () => {
      const html = '<h1>Ch1</h1><h2>Intro</h2><p>A</p><h1>Ch2</h1><h2>Intro</h2><p>B</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters[0].subchapters[0].id).toBe('intro');
      expect(chapters[1].subchapters[0].id).toBe('intro');
    });

    it('chapter with no h2 has empty subchapters array', () => {
      const html = '<h1>Solo</h1><p>Body</p>';
      const chapters = service.splitIntoChapters(html);
      expect(chapters[0].subchapters).toEqual([]);
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

  describe('getChapterTree()', () => {
    it('returns empty array when no headings', () => {
      expect(service.getChapterTree('Just some text.')).toEqual([]);
    });

    it('returns h1 chapters with empty subchapters', () => {
      const md = '# Alpha\n\nText.\n\n# Beta\n\nText.';
      const tree = service.getChapterTree(md);
      expect(tree).toHaveLength(2);
      expect(tree[0].title).toBe('Alpha');
      expect(tree[0].subchapters).toEqual([]);
      expect(tree[1].title).toBe('Beta');
    });

    it('nests h2 entries under their parent h1', () => {
      const md = '# Chapter\n\n## Section One\n\n## Section Two\n\n# Next';
      const tree = service.getChapterTree(md);
      expect(tree[0].subchapters).toHaveLength(2);
      expect(tree[0].subchapters[0].title).toBe('Section One');
      expect(tree[0].subchapters[1].title).toBe('Section Two');
      expect(tree[1].subchapters).toHaveLength(0);
    });

    it('ignores h2 that appears before any h1', () => {
      const md = '## Orphan\n\n# Real Chapter';
      const tree = service.getChapterTree(md);
      expect(tree).toHaveLength(1);
      expect(tree[0].title).toBe('Real Chapter');
    });

    it('records correct character offsets', () => {
      const md = '# Alpha\n\n## Sub';
      const tree = service.getChapterTree(md);
      expect(tree[0].offset).toBe(0);
      expect(tree[0].subchapters[0].offset).toBe(9);
    });
  });
});
