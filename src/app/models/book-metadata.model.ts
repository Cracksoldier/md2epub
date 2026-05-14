export type EpubTheme = 'classic' | 'modern' | 'minimal';

export interface BookMetadata {
  title: string;
  author: string;
  publisher: string;
  description: string;
  language: string;
  epubTheme: EpubTheme;
  splitChapters: boolean;
  coverDataUrl: string | null;
  coverMimeType: 'image/jpeg' | 'image/png' | null;
}
