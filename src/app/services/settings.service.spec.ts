import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
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
    it('rejects when the file is not an image', async () => {
      const file = new File(['text'], 'doc.txt', { type: 'text/plain' });
      await expect(service.loadCoverFromFile(file)).rejects.toThrow('File must be an image');
    });

    it('resolves and stores PNG data URL and mime type', async () => {
      const fakeDataUrl = 'data:image/png;base64,abc123';
      const original = (window as any).FileReader;
      (window as any).FileReader = class FakeReader {
        onload: ((e: any) => void) | null = null;
        onerror: (() => void) | null = null;
        readAsDataURL(_: File) { this.onload?.({ target: { result: fakeDataUrl } }); }
      };

      const file = new File([''], 'cover.png', { type: 'image/png' });
      await service.loadCoverFromFile(file);

      expect(service.metadata().coverDataUrl).toBe(fakeDataUrl);
      expect(service.metadata().coverMimeType).toBe('image/png');
      (window as any).FileReader = original;
    });

    it('uses image/jpeg mime type for non-PNG images', async () => {
      const fakeDataUrl = 'data:image/jpeg;base64,xyz';
      const original = (window as any).FileReader;
      (window as any).FileReader = class FakeReader {
        onload: ((e: any) => void) | null = null;
        onerror: (() => void) | null = null;
        readAsDataURL(_: File) { this.onload?.({ target: { result: fakeDataUrl } }); }
      };

      const file = new File([''], 'cover.jpg', { type: 'image/jpeg' });
      await service.loadCoverFromFile(file);

      expect(service.metadata().coverMimeType).toBe('image/jpeg');
      (window as any).FileReader = original;
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
