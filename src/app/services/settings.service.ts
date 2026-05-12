import { Injectable, signal } from '@angular/core';
import { BookMetadata } from '../models/book-metadata.model';

const DEFAULT: BookMetadata = {
  title: '',
  author: '',
  language: 'en',
  splitChapters: false,
  coverDataUrl: null,
  coverMimeType: null,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly _metadata = signal<BookMetadata>({ ...DEFAULT });
  readonly metadata = this._metadata.asReadonly();

  update(patch: Partial<BookMetadata>): void {
    this._metadata.update(m => ({ ...m, ...patch }));
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
        resolve();
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  clearCover(): void {
    this._metadata.update(m => ({ ...m, coverDataUrl: null, coverMimeType: null }));
  }
}
