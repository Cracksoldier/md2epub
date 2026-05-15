import { TestBed } from '@angular/core/testing';
import { SettingsService, CoverRejectedError } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  describe('initial state', () => {
    it('has empty title and author', () => {
      const m = service.metadata();
      expect(m.title).toBe('');
      expect(m.author).toBe('');
    });

    it('defaults language to "en"', () => {
      expect(service.metadata().language).toBe('en');
    });

    it('defaults splitChapters to false', () => {
      expect(service.metadata().splitChapters).toBe(false);
    });

    it('defaults epubTheme to "classic"', () => {
      expect(service.metadata().epubTheme).toBe('classic');
    });

    it('defaults epubFont to "serif"', () => {
      expect(service.metadata().epubFont).toBe('serif');
    });

    it('defaults chapterNumbering to "none"', () => {
      expect(service.metadata().chapterNumbering).toBe('none');
    });

    it('defaults dropCaps to false', () => {
      expect(service.metadata().dropCaps).toBe(false);
    });

    it('defaults cover to null', () => {
      expect(service.metadata().coverDataUrl).toBeNull();
      expect(service.metadata().coverMimeType).toBeNull();
    });
  });

  describe('update()', () => {
    it('patches the title without affecting other fields', () => {
      service.update({ title: 'My Novel' });
      const m = service.metadata();
      expect(m.title).toBe('My Novel');
      expect(m.author).toBe('');
      expect(m.language).toBe('en');
    });

    it('patches multiple fields at once', () => {
      service.update({ title: 'Book', author: 'Alice', language: 'de' });
      const m = service.metadata();
      expect(m.title).toBe('Book');
      expect(m.author).toBe('Alice');
      expect(m.language).toBe('de');
    });

    it('patches splitChapters', () => {
      service.update({ splitChapters: true });
      expect(service.metadata().splitChapters).toBe(true);
    });
  });

  describe('loadCoverFromFile()', () => {
    const stubReader = (dataUrl: string) => {
      const original = (window as any).FileReader;
      (window as any).FileReader = class FakeReader {
        onload: ((e: any) => void) | null = null;
        onerror: (() => void) | null = null;
        readAsDataURL(_: File) { this.onload?.({ target: { result: dataUrl } }); }
      };
      return () => { (window as any).FileReader = original; };
    };

    it('rejects a file over 5 MB with reason "too-large"', async () => {
      const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
      await expect(service.loadCoverFromFile(big)).rejects.toBeInstanceOf(CoverRejectedError);
      try {
        await service.loadCoverFromFile(big);
      } catch (err) {
        expect((err as CoverRejectedError).reason).toBe('too-large');
      }
    });

    it('rejects a GIF (or any non-allowed type) with reason "wrong-type"', async () => {
      const gif = new File([''], 'pic.gif', { type: 'image/gif' });
      try {
        await service.loadCoverFromFile(gif);
        throw new Error('expected rejection');
      } catch (err) {
        expect(err).toBeInstanceOf(CoverRejectedError);
        expect((err as CoverRejectedError).reason).toBe('wrong-type');
      }
    });

    it('rejects plain-text files with reason "wrong-type"', async () => {
      const file = new File(['text'], 'doc.txt', { type: 'text/plain' });
      try {
        await service.loadCoverFromFile(file);
        throw new Error('expected rejection');
      } catch (err) {
        expect(err).toBeInstanceOf(CoverRejectedError);
        expect((err as CoverRejectedError).reason).toBe('wrong-type');
      }
    });

    it('accepts a WebP cover and preserves the WebP mime type', async () => {
      const restore = stubReader('data:image/webp;base64,abc');
      const file = new File([''], 'cover.webp', { type: 'image/webp' });
      await service.loadCoverFromFile(file);
      expect(service.metadata().coverMimeType).toBe('image/webp');
      restore();
    });

    it('resolves and stores PNG data URL and mime type', async () => {
      const restore = stubReader('data:image/png;base64,abc123');
      const file = new File([''], 'cover.png', { type: 'image/png' });
      await service.loadCoverFromFile(file);
      expect(service.metadata().coverDataUrl).toBe('data:image/png;base64,abc123');
      expect(service.metadata().coverMimeType).toBe('image/png');
      restore();
    });

    it('preserves image/jpeg mime type for JPEG covers', async () => {
      const restore = stubReader('data:image/jpeg;base64,xyz');
      const file = new File([''], 'cover.jpg', { type: 'image/jpeg' });
      await service.loadCoverFromFile(file);
      expect(service.metadata().coverMimeType).toBe('image/jpeg');
      restore();
    });
  });

  describe('clearCover()', () => {
    it('sets coverDataUrl and coverMimeType back to null', async () => {
      const fakeDataUrl = 'data:image/png;base64,abc';
      const original = (window as any).FileReader;
      (window as any).FileReader = class FakeReader {
        onload: ((e: any) => void) | null = null;
        onerror: (() => void) | null = null;
        readAsDataURL(_: File) { this.onload?.({ target: { result: fakeDataUrl } }); }
      };

      const file = new File([''], 'cover.png', { type: 'image/png' });
      await service.loadCoverFromFile(file);
      expect(service.metadata().coverDataUrl).toBe(fakeDataUrl);

      service.clearCover();
      expect(service.metadata().coverDataUrl).toBeNull();
      expect(service.metadata().coverMimeType).toBeNull();
      (window as any).FileReader = original;
    });

    it('does not affect other metadata fields', () => {
      service.update({ title: 'Keep Me' });
      service.clearCover();
      expect(service.metadata().title).toBe('Keep Me');
    });
  });
});
