import { TestBed } from '@angular/core/testing';
import JSZip from 'jszip';
import { EpubService } from './epub.service';
import { ImagesService } from './images.service';
import { BookMetadata } from '../models/book-metadata.model';

const DEFAULT_META: BookMetadata = {
  title: 'Test Book',
  author: 'Test Author',
  publisher: '',
  description: '',
  language: 'en',
  epubTheme: 'classic',
  epubFont: 'serif',
  chapterNumbering: 'none',
  dropCaps: false,
  splitChapters: false,
  coverDataUrl: null,
  coverMimeType: null,
};

async function loadZip(blob: Blob): Promise<JSZip> {
  return JSZip.loadAsync(blob);
}

async function fileText(zip: JSZip, path: string): Promise<string> {
  return zip.file(path)!.async('string');
}

describe('EpubService', () => {
  let service: EpubService;
  let images: ImagesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubService);
    images = TestBed.inject(ImagesService);
  });

  it('build() returns a Blob', async () => {
    const blob = await service.build('# Hello', DEFAULT_META);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('blob has application/epub+zip mime type', async () => {
    const blob = await service.build('# Hello', DEFAULT_META);
    expect(blob.type).toBe('application/epub+zip');
  });

  describe('mimetype entry', () => {
    it('mimetype is the first file in the ZIP', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const zip = await loadZip(blob);
      const firstKey = Object.keys(zip.files)[0];
      expect(firstKey).toBe('mimetype');
    });

    it('mimetype content is exactly "application/epub+zip"', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const zip = await loadZip(blob);
      const content = await fileText(zip, 'mimetype');
      expect(content).toBe('application/epub+zip');
    });

    it('mimetype is stored uncompressed (STORE method)', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const buf = await blob.arrayBuffer();
      const bytes = new Uint8Array(buf);
      // Local file header starts at byte 0; compression method is at offset 8-9 (little-endian)
      // 0 = STORE, 8 = DEFLATE
      expect(bytes[8]).toBe(0);
      expect(bytes[9]).toBe(0);
    });
  });

  describe('container.xml', () => {
    it('ZIP contains META-INF/container.xml', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const zip = await loadZip(blob);
      expect(zip.file('META-INF/container.xml')).toBeTruthy();
    });

    it('container.xml has the correct EPUB namespace', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const zip = await loadZip(blob);
      const xml = await fileText(zip, 'META-INF/container.xml');
      expect(xml).toContain('urn:oasis:names:tc:opendocument:xmlns:container');
    });

    it('container.xml points to EPUB/package.opf', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const zip = await loadZip(blob);
      const xml = await fileText(zip, 'META-INF/container.xml');
      expect(xml).toContain('EPUB/package.opf');
    });
  });

  describe('package.opf', () => {
    it('opf contains the book title', async () => {
      const blob = await service.build('# Hello', { ...DEFAULT_META, title: 'My Awesome Book' });
      const zip = await loadZip(blob);
      const opf = await fileText(zip, 'EPUB/package.opf');
      expect(opf).toContain('My Awesome Book');
    });

    it('opf includes dc:creator when author is set', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const zip = await loadZip(blob);
      const opf = await fileText(zip, 'EPUB/package.opf');
      expect(opf).toContain('<dc:creator>Test Author</dc:creator>');
    });

    it('opf omits dc:creator when author is empty', async () => {
      const blob = await service.build('# Hello', { ...DEFAULT_META, author: '' });
      const zip = await loadZip(blob);
      const opf = await fileText(zip, 'EPUB/package.opf');
      expect(opf).not.toContain('dc:creator');
    });

    it('uses "Untitled" when title is empty', async () => {
      const blob = await service.build('# Hello', { ...DEFAULT_META, title: '' });
      const zip = await loadZip(blob);
      const opf = await fileText(zip, 'EPUB/package.opf');
      expect(opf).toContain('Untitled');
    });

    it('XML-escapes special characters in title', async () => {
      const blob = await service.build('# Hello', { ...DEFAULT_META, title: '<Test & "Book">' });
      const zip = await loadZip(blob);
      const opf = await fileText(zip, 'EPUB/package.opf');
      expect(opf).toContain('&lt;Test &amp; &quot;Book&quot;&gt;');
    });

    it('includes the book language', async () => {
      const blob = await service.build('# Hello', { ...DEFAULT_META, language: 'de' });
      const zip = await loadZip(blob);
      const opf = await fileText(zip, 'EPUB/package.opf');
      expect(opf).toContain('<dc:language>de</dc:language>');
    });
  });

  describe('chapter files', () => {
    it('ZIP contains EPUB/chapter001.xhtml for single chapter', async () => {
      const blob = await service.build('# Hello\n\nContent here', DEFAULT_META);
      const zip = await loadZip(blob);
      expect(zip.file('EPUB/chapter001.xhtml')).toBeTruthy();
    });

    it('chapter XHTML has correct XHTML namespace', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const zip = await loadZip(blob);
      const ch = await fileText(zip, 'EPUB/chapter001.xhtml');
      expect(ch).toContain('xmlns="http://www.w3.org/1999/xhtml"');
    });

    it('splitChapters creates multiple chapter files', async () => {
      const md = '# Chapter One\n\nContent 1\n\n# Chapter Two\n\nContent 2';
      const blob = await service.build(md, { ...DEFAULT_META, splitChapters: true });
      const zip = await loadZip(blob);
      expect(zip.file('EPUB/chapter001.xhtml')).toBeTruthy();
      expect(zip.file('EPUB/chapter002.xhtml')).toBeTruthy();
    });

    it('each chapter is listed in the opf spine', async () => {
      const md = '# Ch1\n\nA\n\n# Ch2\n\nB';
      const blob = await service.build(md, { ...DEFAULT_META, splitChapters: true });
      const zip = await loadZip(blob);
      const opf = await fileText(zip, 'EPUB/package.opf');
      expect(opf).toContain('chapter001.xhtml');
      expect(opf).toContain('chapter002.xhtml');
    });
  });

  describe('footnotes', () => {
    it('footnote section appears in chapter XHTML', async () => {
      const md = '# Chapter\n\nText[^1] here.\n\n[^1]: The note.';
      const blob = await service.build(md, DEFAULT_META);
      const zip = await loadZip(blob);
      const ch = await fileText(zip, 'EPUB/chapter001.xhtml');
      expect(ch).toContain('class="footnotes"');
      expect(ch).toContain('The note.');
    });

    it('in split mode, forward refs in early chapters include last chapter filename', async () => {
      const md = '# Ch One\n\nA[^1].\n\n[^1]: Note one.\n\n# Ch Two\n\nB.';
      const blob = await service.build(md, { ...DEFAULT_META, splitChapters: true });
      const zip = await loadZip(blob);
      const ch1 = await fileText(zip, 'EPUB/chapter001.xhtml');
      expect(ch1).toContain('href="chapter002.xhtml#fn1"');
    });
  });

  describe('cover', () => {
    it('no cover.xhtml when coverDataUrl is null', async () => {
      const blob = await service.build('# Hello', DEFAULT_META);
      const zip = await loadZip(blob);
      expect(zip.file('EPUB/cover.xhtml')).toBeNull();
    });

    it('cover.xhtml is added when coverDataUrl is provided', async () => {
      // Minimal 1×1 white PNG in base64
      const coverDataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';
      const blob = await service.build('# Hello', {
        ...DEFAULT_META,
        coverDataUrl,
        coverMimeType: 'image/png',
      });
      const zip = await loadZip(blob);
      expect(zip.file('EPUB/cover.xhtml')).toBeTruthy();
      expect(zip.file('EPUB/images/cover.png')).toBeTruthy();
    });

    it('uses .jpg extension for JPEG covers', async () => {
      // Valid base64 payload (1×1 PNG bytes — service only checks mimeType for the extension)
      const coverDataUrl =
        'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI6QAAAABJRU5ErkJggg==';
      const blob = await service.build('# Hello', {
        ...DEFAULT_META,
        coverDataUrl,
        coverMimeType: 'image/jpeg',
      });
      const zip = await loadZip(blob);
      expect(zip.file('EPUB/images/cover.jpg')).toBeTruthy();
    });
  });

  describe('chapter numbering', () => {
    it('leaves chapter titles untouched when chapterNumbering is "none"', async () => {
      const blob = await service.build('# Intro\n\nText.', DEFAULT_META);
      const zip = await loadZip(blob);
      const ch = await fileText(zip, 'EPUB/chapter001.xhtml');
      expect(ch).toContain('<h1>Intro</h1>');
      expect(ch).not.toMatch(/Chapter\s+\d/);
    });

    it('prepends arabic numerals to chapter H1s', async () => {
      const md = '# Intro\n\nA.\n\n# Next\n\nB.';
      const blob = await service.build(md, { ...DEFAULT_META, splitChapters: true, chapterNumbering: 'arabic' });
      const zip = await loadZip(blob);
      const ch1 = await fileText(zip, 'EPUB/chapter001.xhtml');
      const ch2 = await fileText(zip, 'EPUB/chapter002.xhtml');
      expect(ch1).toContain('<h1>Chapter 1: Intro</h1>');
      expect(ch2).toContain('<h1>Chapter 2: Next</h1>');
    });

    it('prepends roman numerals to chapter H1s', async () => {
      const blob = await service.build('# Intro\n\nA.', { ...DEFAULT_META, chapterNumbering: 'roman' });
      const zip = await loadZip(blob);
      const ch = await fileText(zip, 'EPUB/chapter001.xhtml');
      expect(ch).toContain('<h1>Chapter I: Intro</h1>');
    });

    it('prepends spelled-out numbers to chapter H1s', async () => {
      const blob = await service.build('# Intro\n\nA.', { ...DEFAULT_META, chapterNumbering: 'word' });
      const zip = await loadZip(blob);
      const ch = await fileText(zip, 'EPUB/chapter001.xhtml');
      expect(ch).toContain('<h1>Chapter One: Intro</h1>');
    });

    it('uses a custom prefix when supplied', async () => {
      const blob = await service.build('# Intro\n\nA.', { ...DEFAULT_META, chapterNumbering: 'arabic' }, 'Kapitel');
      const zip = await loadZip(blob);
      const ch = await fileText(zip, 'EPUB/chapter001.xhtml');
      expect(ch).toContain('<h1>Kapitel 1: Intro</h1>');
    });

    it('reflects numbered titles in the nav.xhtml TOC', async () => {
      const md = '# Intro\n\nA.\n\n# Next\n\nB.';
      const blob = await service.build(md, { ...DEFAULT_META, splitChapters: true, chapterNumbering: 'roman' });
      const zip = await loadZip(blob);
      const nav = await fileText(zip, 'EPUB/nav.xhtml');
      expect(nav).toContain('Chapter I: Intro');
      expect(nav).toContain('Chapter II: Next');
    });
  });

  describe('themeCss font + drop caps', () => {
    it('injects a sans-serif font stack when font is "sans"', () => {
      const css = service.themeCss('classic', 'sans');
      expect(css).toContain('Segoe UI');
    });

    it('injects Georgia stack when font is "georgia"', () => {
      const css = service.themeCss('modern', 'georgia');
      expect(css).toContain('Georgia');
    });

    it('omits drop-cap rule when dropCaps is false', () => {
      const css = service.themeCss('classic', 'serif', false);
      expect(css).not.toContain('::first-letter');
    });

    it('includes drop-cap rule when dropCaps is true', () => {
      const css = service.themeCss('classic', 'serif', true);
      expect(css).toContain('::first-letter');
    });

    it('always includes the task-list checkbox CSS', () => {
      const css = service.themeCss('minimal', 'serif', false);
      expect(css).toContain('input[type="checkbox"]');
    });

    it('built EPUB style.css picks up the configured font', async () => {
      const blob = await service.build('# Hello', { ...DEFAULT_META, epubFont: 'mono' });
      const zip = await loadZip(blob);
      const css = await fileText(zip, 'EPUB/style.css');
      expect(css).toContain('SF Mono');
    });

    it('built EPUB style.css contains drop-cap rule when dropCaps is true', async () => {
      const blob = await service.build('# Hello', { ...DEFAULT_META, dropCaps: true });
      const zip = await loadZip(blob);
      const css = await fileText(zip, 'EPUB/style.css');
      expect(css).toContain('::first-letter');
    });
  });

  describe('inline images', () => {
    it('embeds an image bytes file and a manifest item when markdown references it', async () => {
      const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const file = new File([pngBytes.buffer as ArrayBuffer], 'fig.png', { type: 'image/png' });
      const { id } = await images.addImage(file);

      const md = `# Chapter\n\n![alt](epub-img://${id})`;
      const blob = await service.build(md, DEFAULT_META);
      const zip = await loadZip(blob);

      expect(zip.file(`EPUB/images/${id}.png`)).toBeTruthy();

      const opf = await fileText(zip, 'EPUB/package.opf');
      expect(opf).toContain(`id="img-${id}"`);
      expect(opf).toContain(`href="images/${id}.png"`);
      expect(opf).toContain('media-type="image/png"');

      const chapter = await fileText(zip, 'EPUB/chapter001.xhtml');
      expect(chapter).toContain(`src="images/${id}.png"`);
      expect(chapter).not.toContain('epub-img://');
    });

    it('does not embed image bytes for an unknown reference', async () => {
      const blob = await service.build('![](epub-img://deadbeef)', DEFAULT_META);
      const zip = await loadZip(blob);
      expect(zip.file('EPUB/images/deadbeef.png')).toBeNull();
    });
  });
});
