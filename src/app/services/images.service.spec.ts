import { TestBed } from '@angular/core/testing';
import { ImagesService, ImageRejectedError } from './images.service';

function makeFile(bytes: Uint8Array, type: string, name = 'img'): File {
  return new File([bytes.buffer as ArrayBuffer], name, { type });
}

const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]);
const OTHER_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 'J'.charCodeAt(0)]);

describe('ImagesService', () => {
  let service: ImagesService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagesService);
  });

  describe('addImage()', () => {
    it('rejects files over 5 MB with reason "too-large"', async () => {
      const big = makeFile(new Uint8Array(5 * 1024 * 1024 + 1), 'image/png');
      try {
        await service.addImage(big);
        throw new Error('expected rejection');
      } catch (err) {
        expect(err).toBeInstanceOf(ImageRejectedError);
        expect((err as ImageRejectedError).reason).toBe('too-large');
      }
    });

    it('rejects a GIF with reason "wrong-type"', async () => {
      const gif = makeFile(new Uint8Array([0x47, 0x49, 0x46]), 'image/gif');
      try {
        await service.addImage(gif);
        throw new Error('expected rejection');
      } catch (err) {
        expect(err).toBeInstanceOf(ImageRejectedError);
        expect((err as ImageRejectedError).reason).toBe('wrong-type');
      }
    });

    it('accepts PNG/JPEG/WebP and preserves the mime type', async () => {
      const a = await service.addImage(makeFile(PNG_BYTES, 'image/png'));
      const b = await service.addImage(makeFile(OTHER_BYTES, 'image/jpeg'));
      const c = await service.addImage(makeFile(PNG_BYTES.slice().reverse(), 'image/webp'));
      expect(service.images()[a.id].mimeType).toBe('image/png');
      expect(service.images()[b.id].mimeType).toBe('image/jpeg');
      expect(service.images()[c.id].mimeType).toBe('image/webp');
    });

    it('returns the same id for identical bytes (dedup)', async () => {
      const a = await service.addImage(makeFile(PNG_BYTES, 'image/png'));
      const b = await service.addImage(makeFile(PNG_BYTES, 'image/png'));
      expect(a.id).toBe(b.id);
      expect(Object.keys(service.images())).toHaveLength(1);
    });

    it('returns a markdown snippet with the new id', async () => {
      const { id, markdownSnippet } = await service.addImage(makeFile(PNG_BYTES, 'image/png'));
      expect(markdownSnippet).toBe(`![](epub-img://${id})`);
    });
  });

  describe('replaceUrls()', () => {
    it('swaps known epub-img:// references with data URLs', async () => {
      const { id } = await service.addImage(makeFile(PNG_BYTES, 'image/png'));
      const md = `Look: ![alt](epub-img://${id}) here.`;
      const out = service.replaceUrls(md, 'data');
      expect(out).toContain('data:image/png;base64,');
      expect(out).not.toContain('epub-img://');
    });

    it('swaps known epub-img:// references with EPUB-relative paths', async () => {
      const { id } = await service.addImage(makeFile(PNG_BYTES, 'image/png'));
      const out = service.replaceUrls(`![](epub-img://${id})`, 'epub-path');
      expect(out).toBe(`![](images/${id}.png)`);
    });

    it('leaves unknown ids untouched in both modes', () => {
      const md = `![](epub-img://deadbeef)`;
      expect(service.replaceUrls(md, 'data')).toBe(md);
      expect(service.replaceUrls(md, 'epub-path')).toBe(md);
    });
  });

  describe('collectReferenced()', () => {
    it('returns one entry per unique reference', async () => {
      const { id } = await service.addImage(makeFile(PNG_BYTES, 'image/png'));
      const md = `![](epub-img://${id}) and again ![](epub-img://${id}).`;
      const refs = service.collectReferenced(md);
      expect(refs).toHaveLength(1);
      expect(refs[0].id).toBe(id);
      expect(refs[0].ext).toBe('png');
      expect(refs[0].mimeType).toBe('image/png');
      expect(refs[0].bytes.length).toBeGreaterThan(0);
    });

    it('ignores unknown ids', () => {
      const refs = service.collectReferenced('![](epub-img://deadbeef)');
      expect(refs).toEqual([]);
    });

    it('returns empty array when markdown has no references', () => {
      expect(service.collectReferenced('# Plain markdown')).toEqual([]);
    });
  });

  describe('serialize / restore', () => {
    it('round-trips the image map', async () => {
      const { id } = await service.addImage(makeFile(PNG_BYTES, 'image/png'));
      const snapshot = service.serialize();
      service.restore({});
      expect(service.images()).toEqual({});
      service.restore(snapshot);
      expect(service.images()[id]).toEqual(snapshot[id]);
    });

    it('drops entries with unrecognised mime types on restore', () => {
      service.restore({
        good: { dataUrl: 'data:image/png;base64,abc', mimeType: 'image/png' },
        bad:  { dataUrl: 'data:image/gif;base64,xyz', mimeType: 'image/gif' as 'image/png' },
      });
      expect(Object.keys(service.images())).toEqual(['good']);
    });
  });
});
