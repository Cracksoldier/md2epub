import { Injectable, signal } from '@angular/core';
import { BookMetadata } from '../models/book-metadata.model';
import { readStorage, writeStorage } from '../utils/storage';

const DEFAULT: BookMetadata = {
  title: '',
  author: '',
  publisher: '',
  description: '',
  language: 'en',
  epubTheme: 'classic',
  epubFont: 'serif',
  chapterNumbering: 'none',
  dropCaps: false,
  splitChapters: false,
  customCss: '',
  coverDataUrl: null,
  coverMimeType: null,
};

const STORAGE_SUFFIX = 'autosave-meta';
const LEGACY_KEY = 'epub-autosave-meta';
const COVER_MAX_BYTES = 5 * 1024 * 1024;
const COVER_ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export type CoverRejectReason = 'too-large' | 'wrong-type';
export class CoverRejectedError extends Error {
  constructor(readonly reason: CoverRejectReason) { super(reason); }
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _metadata = signal<BookMetadata>(this.initMeta());
  readonly metadata = this._metadata.asReadonly();

  private initMeta(): BookMetadata {
    try {
      const stored = readStorage(STORAGE_SUFFIX, LEGACY_KEY);
      if (stored) return { ...DEFAULT, ...JSON.parse(stored) };
    } catch { /* corrupt JSON — fall through */ }
    return { ...DEFAULT };
  }

  update(patch: Partial<BookMetadata>): void {
    this._metadata.update(m => ({ ...m, ...patch }));
    this.saveMeta();
  }

  private saveMeta(): void {
    const { coverDataUrl: _cd, coverMimeType: _cm, ...rest } = this._metadata();
    writeStorage(STORAGE_SUFFIX, JSON.stringify(rest));
  }

  loadCoverFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (file.size > COVER_MAX_BYTES) {
        reject(new CoverRejectedError('too-large'));
        return;
      }
      if (!COVER_ALLOWED_TYPES.includes(file.type as typeof COVER_ALLOWED_TYPES[number])) {
        reject(new CoverRejectedError('wrong-type'));
        return;
      }
      const mimeType = file.type as BookMetadata['coverMimeType'];
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        this._metadata.update(m => ({ ...m, coverDataUrl: dataUrl, coverMimeType: mimeType }));
        this.saveMeta();
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  clearCover(): void {
    this._metadata.update(m => ({ ...m, coverDataUrl: null, coverMimeType: null }));
    this.saveMeta();
  }
}
