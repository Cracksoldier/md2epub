import { Injectable, signal } from '@angular/core';
import { readStorage, writeStorage } from '../utils/storage';

export interface StoredImage {
  dataUrl: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
}

export type ImageRejectReason = 'too-large' | 'wrong-type';
export class ImageRejectedError extends Error {
  constructor(readonly reason: ImageRejectReason) { super(reason); }
}

const STORAGE_SUFFIX = 'images';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;
type AllowedMime = typeof ALLOWED_TYPES[number];

const URL_REGEX = /epub-img:\/\/([a-f0-9]+)/g;

@Injectable({ providedIn: 'root' })
export class ImagesService {
  private readonly _images = signal<Record<string, StoredImage>>(this.initImages());
  readonly images = this._images.asReadonly();

  private initImages(): Record<string, StoredImage> {
    try {
      const stored = readStorage(STORAGE_SUFFIX);
      if (stored) return JSON.parse(stored);
    } catch { /* corrupt JSON */ }
    return {};
  }

  async addImage(file: File): Promise<{ id: string; markdownSnippet: string }> {
    if (file.size > MAX_BYTES) throw new ImageRejectedError('too-large');
    if (!ALLOWED_TYPES.includes(file.type as AllowedMime)) throw new ImageRejectedError('wrong-type');

    const buffer = await file.arrayBuffer();
    const id = await sha256Short(buffer);
    const dataUrl = bufferToDataUrl(buffer, file.type);

    this._images.update(m => ({ ...m, [id]: { dataUrl, mimeType: file.type as AllowedMime } }));
    this.save();
    return { id, markdownSnippet: `![](epub-img://${id})` };
  }

  replaceUrls(markdown: string, mode: 'data' | 'epub-path'): string {
    const map = this._images();
    return markdown.replace(URL_REGEX, (whole, id: string) => {
      const img = map[id];
      if (!img) return whole;
      if (mode === 'data') return img.dataUrl;
      return `images/${id}.${extFor(img.mimeType)}`;
    });
  }

  collectReferenced(markdown: string): { id: string; ext: string; mimeType: string; bytes: Uint8Array }[] {
    const map = this._images();
    const seen = new Set<string>();
    const out: { id: string; ext: string; mimeType: string; bytes: Uint8Array }[] = [];
    for (const m of markdown.matchAll(URL_REGEX)) {
      const id = m[1];
      if (seen.has(id)) continue;
      const img = map[id];
      if (!img) continue;
      seen.add(id);
      out.push({ id, ext: extFor(img.mimeType), mimeType: img.mimeType, bytes: dataUrlToBytes(img.dataUrl) });
    }
    return out;
  }

  serialize(): Record<string, StoredImage> {
    return { ...this._images() };
  }

  restore(map: Record<string, StoredImage>): void {
    const sanitized: Record<string, StoredImage> = {};
    for (const [id, img] of Object.entries(map ?? {})) {
      if (!img || typeof img.dataUrl !== 'string') continue;
      if (!ALLOWED_TYPES.includes(img.mimeType as AllowedMime)) continue;
      sanitized[id] = { dataUrl: img.dataUrl, mimeType: img.mimeType };
    }
    this._images.set(sanitized);
    this.save();
  }

  private save(): void {
    writeStorage(STORAGE_SUFFIX, JSON.stringify(this._images()));
  }
}

function extFor(mime: string): string {
  return mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';
}

async function sha256Short(buffer: ArrayBuffer): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', buffer);
  const hex = Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
  return hex.slice(0, 8);
}

function bufferToDataUrl(buffer: ArrayBuffer, mimeType: string): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:${mimeType};base64,${btoa(binary)}`;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
