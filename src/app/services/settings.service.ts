import { Injectable, signal } from '@angular/core';
import { BookMetadata } from '../models/book-metadata.model';

const DEFAULT: BookMetadata = {
  title: '',
  author: '',
  publisher: '',
  description: '',
  language: 'en',
  splitChapters: false,
  coverDataUrl: null,
  coverMimeType: null,
};

const STORAGE_KEY = 'epub-autosave-meta';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _metadata = signal<BookMetadata>(this.initMeta());
  readonly metadata = this._metadata.asReadonly();

  private initMeta(): BookMetadata {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT, ...JSON.parse(stored) };
    } catch { /* corrupt JSON — fall through */ }
    return { ...DEFAULT };
  }

  update(patch: Partial<BookMetadata>): void {
    this._metadata.update(m => ({ ...m, ...patch }));
    this.saveMeta();
  }

  private saveMeta(): void {
    try {
      const { coverDataUrl: _cd, coverMimeType: _cm, ...rest } = this._metadata();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch { /* QuotaExceededError */ }
  }

  loadCoverFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'));
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        const dataUrl = e.target?.result as string;
        const mimeType = (
          file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        ) as BookMetadata['coverMimeType'];
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
